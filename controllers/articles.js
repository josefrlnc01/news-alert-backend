
import jwt from 'jsonwebtoken'
import { connectToDB } from '../config/db.js';
import Parser from 'rss-parser';
import { SavedsModel } from '../models/saveds.js';
import { ArticlesModel } from '../models/articles.js';
const parser = new Parser({customFields : {item : ['media:content', 'enclosure']}});
export const clients = new Set();

export class ArticlesController {
  static getArticlesByRadar = async (req, res) => {
    const origin = req.headers.origin || 'http://localhost:5173';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();
  console.log('Todas las cookies',req.cookies)
  const token = req.cookies?.accessToken;
  const { themes } = req.query;
  
  if (!token) {
      res.write(`data: ${JSON.stringify({ type: 'error', message: 'No hay token' })}\n\n`);
  return res.end(); // termina la conexión
  }

  let themesArray;
  //Parseamos la estructura de themes
  try {
    themesArray = JSON.parse(themes);
  } catch {
    themesArray = [themes];
  }

  let decoded;
  //Verificamos token
  try {
    decoded = jwt.verify(token, process.env.ACCESS_TOKEN);
  } catch {
    res.write(`data: ${JSON.stringify({ type: 'error', message: 'Token no válido' })}\n\n`);
  return res.end();
  }

  const userId = decoded.id;
  //Obtenemos los artículos
  if (!Array.isArray(themesArray) || themesArray.length === 0) {
    res.write(`data: ${JSON.stringify({ type: 'initial', articles: [] })}\n\n`);
  } else {
    const existingArticles = await ArticlesModel.getArticlesByRadar(userId, themesArray)
    if (existingArticles) {
      res.write(`data: ${JSON.stringify({ type: 'initial', articles: existingArticles.rows})}\n\n`);
    }
    
  }
  const client = { res };
  clients.add(client);

  const interval = setInterval(() => {
    res.write(`data: ${JSON.stringify({ type: 'ping' })}\n\n`);
  }, 30000);

  req.on('close', () => {
    clearInterval(interval);
    clients.delete(client);
  });
  } 


  static fetchTopicForSearch = async (topic) => {
    const feedUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(topic)}&hl=es&gl=ES&ceid=ES:es`;
    const feed = await parser.parseURL(feedUrl);

    if (!feed || !feed.items || feed.items.length === 0) return []
  
    const results = []
    for (let item of feed.items) {
      const creationDate = item.pubDate;
      const title = item.title;
      const link = item.link;
      const article = {
        title,
        link,
        topic,
        creationDate
      };

      results.push(article);
    }
    return results;
  }


  static searchArticles = async (req, res) => {
      try {
        const { theme } = req.query;

        if (!theme) {
          return res.status(400).json({ error: 'Theme is required' });
        }
        const results = await ArticlesController.fetchTopicForSearch(theme);
        console.log('articulos', results)
        res.json({
          success: true,
          articles: Array.isArray(results) ? results : [],
          theme: theme
        });
      } catch (error) {
        console.error('❌ Error searching articles:', error);
        res.status(500).json({ success: false, message: 'Failed to search articles', error: error.message });
      }
  }
}


