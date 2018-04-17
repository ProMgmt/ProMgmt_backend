'use strict';

const express = require('express');
const debug = require('debug')('promgmt:server');
const morgan = require('morgan');
const mongoose = require('mongoose');
const dotenv =  require('dotenv');
const cors = require('cors');
const superagent = require('superagent');
const uuid = require('uuid/v4');

const userRouter = require('./routes/user-router.js');
const profileRouter = require('./routes/profile-router.js');
const profilePicRouter = require('./routes/profile-pic-router.js');
const orgRouter = require('./routes/org-router.js');
const projectRouter = require('./routes/project-router.js');
const taskRouter = require('./routes/task-router.js');
const attachRouter = require('./routes/attach-router.js');
const User = require('./model/user.js');

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
        console.log('::::OPEN ID - GOOGLE PLUS::::', response.body); //we have 'gender', 'given_name', 'family_name', 'picture', 'email' in the response.body. need to make a profile for them here. 
        res.cookie('X-Promgmt-token', 'promgmt token');
        // interact with your db and add them if they dont exist alraeady

        let {
          given_name: firstName, 
          family_name: lastName, 
          email, 
          picture, 
        } = response.body;

        const firstNameQuery = `firstName=${firstName}`;
        const lastNameQuery = `lastName=${lastName}`;
        const emailQuery = `email=${email}`;
        const pictureQuery = `picture=${picture}`;
        
        User.findOne({ email })
          .then( user => {
            if (user) {
              return user.generateToken();
            } else {
              return new User({ email, username: email, password: uuid() }).save()
                
                .then( user => user.generateFindHash())
                // .then( user => user.save())
                .then( user => user.generateToken())
                .catch(console.log);

            }
          }) 
          .then( token => {
            const tokenQuery = `token=${token}`;

            console.log('TOKEN!', token);
            
            let redirectURL = `${process.env.CLIENT_URL}?${firstNameQuery}&${lastNameQuery}&${pictureQuery}&${emailQuery}&${tokenQuery}`;

            console.log('DIS YER URL', `${redirectURL}`);

            res.redirect(`${redirectURL}`); //this is where we take our app back from google oauth to our frontend. now we can interact with our database and get token
            
          })
          .catch(console.log);

        
      });
  }
});

app.use(cors({
  origin: process.env.CORS_ORIGINS.split(' '),
  credentials: true,
}));
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


// our url:
// http://localhost:8080/?firstName=Katy&lastName=Robinson&picture=https://lh5.googleusercontent.com/-PQ_hB_MyqVQ/AAAAAAAAAAI/AAAAAAAAAeQ/nzcMv1zh42Q/photo.jpg?sz=50&email=katelynolearyyy@gmail.com&token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbiI6IjdhNzQyYjIwNzIxOTgwZmI4Mjg1NTI3NmQ0NjQxODE5OWRjMTU4OWZhODBmZDNmZWIwMWRhYjI1NDNmZGIzY2MiLCJpYXQiOjE1MjM5MjU5NDZ9.Zueb_ZCa3NF8cSBzTm77xvW28EgHGA3Qdk2c3i1QKz4#
//
