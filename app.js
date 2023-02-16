const express = require('express');
const app = express();
const userRouter = require('./Routers/userRouter');
const refreshTokenRouter = require('./Routers/refreshToken');
const questionRouter = require('./Routers/questionRouter');

app.use(express.json());

app.use('/api/user', userRouter);
app.use('/api/refreshToken', refreshTokenRouter);
app.use('/api/question', questionRouter);
module.exports = app;
