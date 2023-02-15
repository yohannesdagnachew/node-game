const express = require('express');
const app = express();
const userRouter = require('./Routers/userRouter');
const refreshTokenRouter = require('./Routers/refreshToken');

app.use(express.json());

app.use('/api/user', userRouter);
app.use('/api/refreshToken', refreshTokenRouter);

module.exports = app;
