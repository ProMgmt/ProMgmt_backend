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
const Profile = require('./model/profile.js');
const ProfilePic = require('./model/profile-pic.js');

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
        return superagent.get('https://www.googleapis.com/plus/v1/people/me/openIdConnect')
          .set('Authorization', `Bearer ${response.body.access_token}`);
      })
      .then(response => {

        let {
          given_name: firstName, 
          family_name: lastName, 
          email, 
          picture: avatarURI, 
        } = response.body;
        
        User.findOne({ email })
          .then( user => {
            if (user) {
              return user.generateToken()
                .then(token => {
                  const profile = { firstName, lastName, userId: user._id };

                  return { token, profile };
                });
            } else {
              return new User({ email, username: email, password: uuid() }).save()
              
                
                .then( user => user.generateFindHash())
                .then( user => {
                  const userId = user._id;
                  const profile = {
                    firstName, 
                    lastName, 
                    userId,
                    desc: 'tell us about yourself...', 
                  };
                  return new Profile(profile).save()
                    .then(profile => {
                      const profilePic = new ProfilePic({
                        userId,
                        profileId: profile._id, 
                        avatarURI,
                      });
                      profile.profilePic = profilePic;
                      return profile;
                    }) 
                    .then(profile => {
                      return user.generateToken()
                        .then(token => {

                          return { token, profile };
                        });
                    })
                    .catch(console.log);
                })
                
                .catch(console.log);

            }
          }) 
          .then(data => {
            const { token } = data;
          
            res
              .cookie('X-ProMgmt-Token', token, {maxAge: 900000})
              .redirect('http://localhost:8080/butts');

            // res.redirect(`${redirectURL}`); //this is where we take our app back from google oauth to our frontend. now we can interact with our database and get token
            

          })
          .catch(console.log);

        
      });
  }
});

app.use(cors({
  origin: process.env.CORS_ORIGINS.split(' '),
  credentials: true,
}));

app
  .use(morgan('dev'))
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
