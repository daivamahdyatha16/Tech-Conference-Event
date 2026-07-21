import express from 'express';
import cors from 'cors';

const app = express();

//  Core Middleware 
app.use(
  cors({
    origin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json());


export default app;
