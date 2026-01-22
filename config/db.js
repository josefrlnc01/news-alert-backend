import dotenv from 'dotenv'
dotenv.config()
import pkg from 'pg'

const {Pool} = pkg
let pool;

export const isProd = process.env.NODE_ENV === 'production'


const connectionURL = isProd 
? process.env.DATABASE_URL
: process.env.LOCAL_DATABASE_URL 

console.log('NODE_ENV:', process.env.NODE_ENV)
console.log('Connecting to:', connectionURL)
  export function connectToDB(){
    if(!pool){
       pool = new Pool({
        connectionString : connectionURL,
        ssl: isProd ? {rejectUnauthorized : false} : false
      });

    }
      return pool
  }





export const createDatabase = async () => {
  try{
    const pool = connectToDB()
   

     // Crear tabla users
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users(
        id SERIAL PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        refresh_token TEXT
      )
    `);
    console.log('✅ Tabla users creada');

    // Crear tabla interests
    await pool.query(`
      CREATE TABLE IF NOT EXISTS interests(
        interest_id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        interest TEXT NOT NULL,
        UNIQUE(user_id, interest)
      )
    `);
    console.log('✅ Tabla interests creada');
  
    // Crear tabla articles
   
    await pool.query(`
      CREATE TABLE IF NOT EXISTS articles(
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        link TEXT,
        topic TEXT NOT NULL,
        creationDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id,title)
      )
    `);
    console.log('✅ Tabla articles creada');
       
    // Crear tabla articlesSaveds

    await pool.query(`
      CREATE TABLE IF NOT EXISTS articlesSaveds(
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        link TEXT,
        topic TEXT NOT NULL,
        creationDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id,title)
      )
    `);
      console.log('✅ Tabla articlesSaveds creada');
    
    console.log('🎉 Base de datos inicializada correctamente');
  } catch (error){
    console.error(error)
  }
}





