import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';
import assistantRoutes from './routes/assistant';
import connectDB from './clients/mongodb';

const app = express();

connectDB();

app.use(cors());
app.use(bodyParser.json());

app.use('/assistant', assistantRoutes);

app.use('/', (req, res) => res.send('Hello'));

export default app;
