import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();
app.use(cors({
    origin: process.env.CORES_ORIGIN,
    credentials: true
}))

app.use(express.json({limit: '18kb'}));
app.use(express.urlencoded({ extended: true, limit: '18kb' }));
app.use(express.static('public'));
app.use(cookieParser());

// Routes
import userRouter from './routes/user.routes.js';

//routes declaration
app.use('/api/v1/users', userRouter);

// app.get('/set-cookie', (req, res) => {
//   res.cookie('testCookie', 'testValue');
//   res.send('Cookie set!');
// });
// // Now you can access cookies:
// app.get('/', (req, res) => {
//   console.log(req.cookies); // { 'testCookie', 'testValue }
//     res.send('Hello World!');
// });

export {app};