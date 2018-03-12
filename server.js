'use strict';

const express = require('express');
const debug = require('debug')('promgmt:server');
const morgan = require('morgan');
const mongoose = require('mongoose');
const dotenv =  require('dotenv');
const cors = require('cors');

const userRouter = require('./routes/user-router.js');
const profileRouter = require('./routes/profile-router.js');
const orgRouter = require('./routes/org-router.js');
const errors = require('./lib/err-middleware.js');

dotenv.load();

const app = express();
const PORT = process.env.PORT || 3000;
mongoose.connect(process.env.MONGODB_URI);

app.use(cors());
app.use(morgan('dev'));
app.use(userRouter);
app.use(profileRouter);
app.use(orgRouter);
app.use(errors);

const server = module.exports = app.listen(PORT, () => {
  debug(`Server listening on ${PORT}`);
});

server.isRunning = true;








