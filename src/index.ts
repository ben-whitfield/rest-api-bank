import express from 'express';
import http from 'http';
import bodyParser from 'body-parser';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import compression from 'compression';

const app = express();

app.use(cors({
  credentials: true
}));

app.use(compression());
app.use(cookieParser());
app.use(bodyParser.json());

const server = http.createServer(app);

server.listen(8080, () => {
  console.log('Server is running on http://localhost:8080');
});