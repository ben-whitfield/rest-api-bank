import express from 'express';
import http from 'http';
import bodyParser from 'body-parser';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import routes from './routes';

dotenv.config({ path: '.env', quiet: true });

const PORT = process.env.PORT || 8080;
const HOST = process.env.HOST || 'localhost';
const MONGO_URL = process.env.MONGO_URL;

const app = express();

app.use(cors({
  credentials: true
}));

app.use(compression());
app.use(cookieParser());
app.use(bodyParser.json());

const server = http.createServer(app);

server.listen(PORT, () => {
  console.log('Server is running on http://' + HOST + ':' + PORT);
});

mongoose.connect(MONGO_URL);
mongoose.connection.on('error', (err: Error) => {
  console.log('MongoDB connection error:', err);
});

app.use('/', routes());