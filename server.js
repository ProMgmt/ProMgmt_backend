'use strict';

const express = require('express');
const debug = require('debug')('promgmt:server');
const morgan = require('morgan');
const mongoose = require('mongoose');
const dotenv =  require('dotenv');
const cors = require('cors');

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
const PORT = process.env.PORT;

app.use(cors());
app.use(morgan('dev'));
app.use(userRouter);
app.use(profileRouter);
app.use(profilePicRouter);
app.use(orgRouter);
app.use(projectRouter);
app.use(taskRouter);
app.use(attachRouter);

app.use(errors);

const server = module.exports = {};

server.isRunning = false;

let listen = null;

server.serverOn = function(callback) {
  if(!server.isRunning) {
    debug('server on!!!!!');
    mongoose.connect(process.env.MONGODB_URI)
      .then(() => {
        listen = app.listen(PORT, () => {
          server.isRunning = true;
          debug('server up');
          callback();
        });
        return; 
      })
      .catch(callback);
  } else {
    callback();
  }
};

server.serverOff = function(callback) {
  if(server.isRunning) {
    debug('promgmt:serverOff');
    mongoose.disconnect()
      .then(() => {
        listen.close(() => {
          server.isRunning = false;          
          debug('server down');
          callback();
        });
        return;
      })
      .catch(callback);
  } else {
    callback();
  }
};