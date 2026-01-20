import express from 'express'
import { createServer } from "http";
import bodyParser from "body-parser";
import cors from 'cors';
import router from "./router.js";
import cookieParser from 'cookie-parser';
export const app = express();
export const server = createServer(app)
// Configure CORS
export const corsOptions = {
  origin: [
    'http://localhost:5173',
   
     'capacitor://localhost', // 👈 Para Capacitor iOS
      'http://localhost', // 👈 Para Capacitor Android
      'ionic://localhost', // 👈 Para Ionic/Capacitor
      'https://avisame-app-production.up.railway.app'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  exposedHeaders: ['Set-Cookie'],
  credentials: true
};

// Middleware setup (order matters!)
app.use(cookieParser())
app.use(cors(corsOptions))

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Routes should be last
app.use(router);