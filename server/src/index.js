// require('dotenv').config({path: './.env'});
import dotenv from 'dotenv';
import connectDB from './db/index.js';
dotenv.config({ path: './.env' });
connectDB();

// import mongoose from 'mongoose';
// import express from 'express';
// import app from './app.js';
// import { DB_NAME } from './constants.js';
// import dotenv from 'dotenv';

// const app = express();
// //iifes
// ;(async () => {
//     try {
//        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
//        app.on("error", (error) => {
//         console.error('Error connecting to the database:', error);
//         throw error;
//        })
//        app.listen(process.env.PORT, () => {
//         console.log(`Server started on port ${process.env.PORT}`);
//        });
//     } catch (error) {
//         console.error('Error starting the server:', error);
//     }
// })()