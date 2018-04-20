'use strict';

const superagent = require('superagent');
const uuid = require('uuid/v4');
const dotenv = require('dotenv');
const Router = require('express').Router;

const User = require('../model/user.js');
const Profile = require('../model/profile.js');
const ProfilePic = require('../model/profile-pic.js');


dotenv.load();

const oauthRouter = module.exports = Router();


oauthRouter.get('/oauth/google/code', function(req, res) {
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
        console.log('RES', response);
        User.findOne({ email })
          .then( user => {
            console.log('__________USER___________', user);
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
            console.log('someshit', data);
            res
              .cookie('X-ProMgmt-Token', token, {maxAge: 900000})
              .redirect('http://localhost:8080/dashboard');

            // res.redirect(`${redirectURL}`); //this is where we take our app back from google oauth to our frontend. now we can interact with our database and get token
            

          })
          .catch(console.log);

        
      });
  }
});