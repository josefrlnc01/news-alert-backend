import { connectToDB } from "../config/db.js";

import { UserService } from "../services/user.service.js";

export class UserModel {
    static async createUser ({userData}) {
        const pool = connectToDB()
        if (!userData || !userData.email) {
            throw new Error ('Error al obtener usuario')
        }

        let user;
        
        // Check if user exists
        const existingUserResult = await pool.query(`
          SELECT id, email, name, refresh_token
          FROM users
          WHERE email = $1
        `, [userData.email]);
        
        if (existingUserResult.rows.length > 0) {
          user = existingUserResult.rows[0];
          console.log('🔑 Usuario existente encontrado:', { id: user.id, email: user.email });
        } else {
          // Crear nuevo usuario
          console.log('🆕 Creando nuevo usuario para:', userData.email);
          const newUser = await pool.query(`
            INSERT INTO users (email, name)
            VALUES ($1, $2)
            RETURNING id, email, name
          `, [userData.email, userData.name] )
          
          user = newUser.rows[0];
          console.log('✅ Nuevo usuario creado:', { id: user.id, email: user.email });
        }
        
        const data = await UserService.createUser({user});
        const {accessToken, refreshToken} = data
    
        // Store refresh token in the database
        await pool.query('UPDATE users SET refresh_token = $1 WHERE id = $2',[refreshToken, user.id])
        
        return {user, accessToken, refreshToken}
    }
    static async authenticate (email, password) {
      try{
        const user = await pool.query(`
          SELECT id, email, name, refresh_token
          FROM users
          WHERE email = $1
        `, [email])
        if (user.rows.length === 0) {
          const error = new Error('Usuario no encontrado')
          error.statusCode = 404
          return error
        }
        return user.rows[0]
      } catch (error) {
        console.error('❌ Error en authenticate:', error);
        throw error;
      }
    }

    static async loginUser ({userData}) {
       try{
          const existingUser = await pool.query(`
            SELECT id, email, name, refresh_token
            FROM users
            WHERE email = $1
          `, [userData.email])

          if (existingUser.rows.length === 0) {
            const error = new Error('Usuario no encontrado')
            error.statusCode = 404
            return error
          } 
            // User exists, return user data
            const data = await UserService.createUser({user: existingUser.rows[0]})
           const {accessToken, refeshToken} = data

           return {user: existingUser.rows[0], accessToken, refeshToken}
       }catch(error){
        throw new Error ('Error al iniciar sesión')
       }
    }


    static async getUser ({userId}) {
      const pool = connectToDB()

      if (!userId) {
          throw new Error ('No se encontró el id de usuario')
        }
      let user = await pool.query(`
        SELECT email, name
        FROM users
        WHERE id = $1
        `,[userId])
        
          if (!user) {
          throw new Error ('No se encontró el usuario')
        }
        user = user.rows[0]
        return user
    }

   
} 
