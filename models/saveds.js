import { connectToDB } from "../config/db.js";

export class SavedsModel {
    static async getSaveds({ user }) {
        try {
            if (!user) {
                throw new Error("No hay usuario");
            }
            const pool = connectToDB();
            const articlesSaveds = await pool.query(
                `SELECT * FROM articlesSaveds
            WHERE user_id = $1`,
                [user.id]
            );
            if (!articlesSaveds) {
                throw new Error("No se obtuvo la información de guardados");
            }
            return articlesSaveds;
        } catch (error) {
            console.error(error);
        }
    }

    static async saveArticle({ article, user }) {
        const pool = connectToDB()
        if (!article) {
            throw new Error("No article provided");
        }

        await pool.query(
            `
        INSERT INTO articlesSaveds (title, link, topic,  creationDate, user_id)
        VALUES ($1, $2, $3, $4, $5)`,
            [
                article.title,
                article.link,
                article.topic,
                article.creationDate,
                user.id,
            ]
        );

        return article;
    }


    static async deleteSaved ({articleId}) {
        try {
            const pool = connectToDB()
            
            if (!articleId) {
                throw new Error ('No se encontró el id')
            }
    
            await pool.query(`
            DELETE FROM articlesSaveds
            WHERE id = $1
            `,[articleId])

            return true
        } catch (error) {
            console.error(error)
        }
    }
}
