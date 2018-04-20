'use strict';

const express = require('express');
const debug = require('debug')('promgmt:server');
const morgan = require('morgan');
const mongoose = require('mongoose');
const dotenv =  require('dotenv');
const cors = require('cors');

const oauthRouter = require('./routes/oauth-router.js');
const userRouter = require('./routes/user-router.js');
const profileRouter = require('./routes/profile-router.js');
const profilePicRouter = require('./routes/profile-pic-router.js');
const orgRouter = require('./routes/org-router.js');
const projectRouter = require('./routes/project-router.js');
const taskRouter = require('./routes/task-router.js');
const attachRouter = require('./routes/attach-router.js');


const errors = require('./lib/err-middleware.js');

dotenv.load();

const app = express();
const PORT = process.env.PORT || 3000;

mongoose.connect(process.env.MONGODB_URI);

app
  .use(cors({
    origin: process.env.CORS_ORIGINS,
    credentials: true,
  }))
  .use(morgan('dev'))
  .use(oauthRouter)
  .use(userRouter)
  .use(profileRouter)
  .use(profilePicRouter)
  .use(orgRouter)
  .use(projectRouter)
  .use(taskRouter)
  .use(attachRouter)
  .use(errors);

const server = module.exports = app.listen(PORT, () => {
  debug(`Server listening on ${PORT}`);
});

server.isRunning = true;
