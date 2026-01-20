import { connectToDB } from "../config/db.js"

export class InterestsModel {
    static async addInterest ({user, theme}) {
        
        const pool = connectToDB()
        const interest = await pool.query(`
            SELECT interest FROM interests
            WHERE user_id = $1
            AND interest = $2
            `, [user.id, theme.trim()])
            console.log('Interes ?:', interest)
        

        await pool.query(`INSERT INTO interests (user_id, interest) VALUES ($1, $2)`,[user.id, theme.trim()])

        return true
    }

    static async deleteInterest({interestId}){
        try {
            const pool = connectToDB();

            await pool.query(`
            DELETE FROM interests
            WHERE interest_id = $1
            `,[interestId])
            return true
    }
    catch (error) {
        console.error(error)
       
    }
    }


    static async getInterests ({user}) {
        try {
            const pool = connectToDB()
        let temas = await pool.query(`
          SELECT DISTINCT interest, interest_id
          FROM interests
          WHERE user_id = $1
          `,[user.id])
        temas = temas.rows   
    
        return temas
        } catch (error) {
            console.error(error)
        }
    }


    
}