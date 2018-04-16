'use strict';

const express = require('express');
const debug = require('debug')('promgmt:server');
const morgan = require('morgan');
const mongoose = require('mongoose');
const dotenv =  require('dotenv');
const cors = require('cors');
const superagent = require('superagent');

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

// TODO: remove for cleanliness later

app.get('/oauth/google/code', function(req, res) {
  if (!req.query.code) {
    res.redirect(process.env.CLIENT_URL);
  } else {
    console.log('CODE:', req.query.code);
    console.log('stuff', {
      code: req.query.code,
      grant_type: 'authorization_code',
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: `${process.env.API_URL}/oauth/google/code`,
    });
    superagent.post('https://www.googleapis.com/oauth2/v4/token') 
      .type('form')
      .send({
        code: req.query.code,
        grant_type: 'authorization_code',
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: `${process.env.API_URL}/oauth/google/code`,
      })
      .then(response => {
        console.log('Response AFTER code is given', response.body);
        return superagent.get('https://www.googleapis.com/plus/v1/people/me/openIdConnect')
          .set('Authorization', `Bearer ${response.body.access_token}`);
      })
      .then(response => {
        console.log('::::OPEN ID - GOOGLE PLUS::::', response.body); //we have profile pic, name etc in the response.body. need to make a profile for them here. 
        res.cookie('X-Some-Cookie', 'some token');
        // interact with your db and add them if they dont exist alraeady
        res.redirect(process.env.CLIENT_URL); //this is where we make frontend go back from google oauth to our frontend. now we can interact with out database and get token
      });
  }
});

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

const server = module.exports = app.listen(PORT, () => {
  debug(`Server listening on ${PORT}`);
});

server.isRunning = true;
