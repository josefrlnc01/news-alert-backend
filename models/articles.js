import { connectToDB } from "../config/db.js";

export class ArticlesModel {
    static async getArticlesByRadar(userId, themesArray) {
        const pool = connectToDB()
            const existingArticles = await pool.query(`
              SELECT * FROM articles
              WHERE user_id = $1 
              AND topic = ANY($2)
              ORDER BY creationDate DESC
              LIMIT 75
            `,[userId, themesArray])
        
            await pool.query(`
              DELETE FROM articles
              WHERE topic != ALL($1)
              AND user_id = $2
            `,[themesArray, userId]);

            return existingArticles
    }
}