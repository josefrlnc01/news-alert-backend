import dotenv from 'dotenv';
dotenv.config(); 
import Parser from 'rss-parser';
import { pipeline } from '@xenova/transformers';
import jwt from 'jsonwebtoken'
import { createDatabase } from './config/db.js';
import cron from 'node-cron';
import { connectToDB } from './config/db.js';
import { app, server } from './server.js';
import 'dotenv/config'
import { clients } from './controllers/articles.js';
import { userRouter } from './routes/user.js';
import { interestsRouter } from './routes/interests.js';
import { savedsRouter } from './routes/saveds.js';
import { searchRouter } from './routes/search.js';


const PORT = process.env.PORT ?? 3000;


export async function initialize(){
  await createDatabase()


  
// Programar la verificación cada hora
cron.schedule('0 * * * *', async () => {
  try {
    await checkForNewArticlesAndNotify();
  } catch (error) {
    console.error('Cron job error:', error);
  }
});


// Iniciar el servidor
server.listen(PORT, () => {
  

  // Verificar noticias al iniciar
  checkForNewArticlesAndNotify().catch(console.error);
});
}



initialize()



app.use((req, res, next) => {
  const token = req.cookies.accessToken;
  if (token){
    try {
      jwt.verify(token, process.env.ACCESS_TOKEN)
    } catch (error) {
      console.error(error)
      res.clearCookie('accessToken', {
        httpOnly : true,
        secure : false,
        sameSite : 'lax'
      })
      res.clearCookie('refreshToken', {
        httpOnly : true,
        secure : false,
        sameSite : 'lax'
      })
    }
  }
  next()
})

app.use('/user', userRouter)

app.use('/interests', interestsRouter)

app.use('/saveds', savedsRouter)

app.use('/search', searchRouter)

// Initialize parser
export const parser = new Parser();
let embedder;


// Initialize model
(async () => {
  try {
    embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
   
  } catch (error) {
    console.error('Error loading model:', error);
  }
})();




export async function fetchTopic(topic, userId) {
  const pool = connectToDB()
  const feedUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(topic)}&hl=es&gl=ES&ceid=ES:es`;
  const feed = await parser.parseURL(feedUrl);
  const results = []
  for (let item of feed.items.slice(0,10)) {

    const creationDate = item.pubDate
    const title = item.title;
    const link = item.link;
    
    

    const article = {

      title,
      link,
      topic,
      creationDate,
      user_id : userId
    }

    await pool.query(`
        INSERT INTO articles(title, link, topic, creationDate, user_id) 
        VALUES ($1,$2,$3,$4,$5)
        ON CONFLICT (user_id, title) DO NOTHING
        `, [article.title,
      article.link,
      article.topic,
      article.creationDate,
      article.user_id])

    await pool.query(`
      DELETE FROM articles
      WHERE id NOT IN (
        SELECT id FROM articles
        WHERE user_id = $1
        ORDER BY creationDate DESC
        LIMIT 150
      )
        AND user_id = $2
      `, [userId, userId])

    results.push(article)


  }


  return results

}







let sseClients = [];
// 📡 SSE Endpoint - Los clientes se conectan aquí
app.get('/api/events', (req, res) => {
  // Configurar headers para SSE
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  // Agregar cliente a la lista
  const clientId = Date.now();
  const newClient = {
    id: clientId,
    res
  };

  sseClients.push(newClient);
  

  // Enviar mensaje de conexión exitosa
  res.write(`event: connected\n`);
  res.write(`data: ${JSON.stringify({ clientId, timestamp: new Date().toISOString() })}\n\n`);

  // Eliminar cliente cuando se desconecta
  req.on('close', () => {
    sseClients = sseClients.filter(client => client.id !== clientId);
  });
});




app.post('/api/refresh', async  (req, res) => {
  const pool = connectToDB()
  const refreshToken = req.cookies?.refreshToken;

  if(!refreshToken){
    return res.status(401).json({error : 'No hay token'})
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN)
    const newAccesToken = jwt.sign(
      {id : decoded.id , email : decoded.email},
      process.env.ACCESS_TOKEN,
      {expiresIn : '15m'}
    )
  const storedToken = await pool.query(`
    SELECT * FROM users WHERE refresh_token = $1
    AND id = $2
    `,[refreshToken, decoded.id])

    if (storedToken.rows.length === 0) return res.status(403).json({ error: 'Token no válido' })
 
    

    if (newAccesToken){
      res
      .cookie('accessToken', newAccesToken, {
        httpOnly : true,
        secure : false,
        sameSite : 'lax',
        maxAge : 15 * 60 * 1000
      })
      .json({success : true, message: 'New token has send'})
    }
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Refresh token expirado' });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(403).json({ error: 'Token inválido' });
    }
    
    return res.status(500).json({error : 'Hubo un error al obtener el token'})
  }
  

  
})


app.post('/api/logout', async (req, res) => {
    res
    .clearCookie('accessToken')
    .clearCookie('refreshToken')
    .json({succes : true, message : 'Sesión cerrada'})
})






// Tarea programada para verificar noticias cada hora
export async function checkForNewArticlesAndNotify() {
  
  try {
    const pool = connectToDB()
    const topics = await pool.query(`SELECT DISTINCT interest, user_id FROM interests`)
    for (const row of Array.from(topics.rows)) {
      const topic = row.interest;
      const userId = row.user_id;
      const newArticles = await fetchTopic(topic, userId);
      if (newArticles.length) {
        notifyClients({ type: 'new-article', topic: topic, articles: newArticles })
      }
    }
    
  } catch (error) {
    console.error('Error in scheduled article check:', error);
  }
}





function notifyClients(data) {
  for (const client of clients) {
    client.res.write(`data : ${JSON.stringify(data)}\n\n`);
  }
}




