const express = require('express');
const app = express();
const userRouter = require('./Routers/userRouter');
const refreshTokenRouter = require('./Routers/refreshToken');
const questionRouter = require('./Routers/questionRouter');
const gameRouter = require('./Routers/gameRoute');

app.use(express.json());

app.use('/api/user', userRouter);
app.use('/api/refreshToken', refreshTokenRouter);
app.use('/api/question', questionRouter);
app.use('/api/game', gameRouter);
module.exports = app;
