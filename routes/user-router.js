'use strict';

const debug = require('debug')('promgmt:user-router');
const createError = require('http-errors');
const jsonParser = require('body-parser').json();
const Router = require('express').Router;
const basicAuth = require('../lib/basic-auth.js');
const bearerAuth = require('../lib/bearer-auth.js');
const User = require('../model/user.js');

const userRouter = module.exports = Router();

userRouter.post('/api/signup', jsonParser, function(req, res, next) {
  debug('POST: /api/signup');

  if(req.body.username === undefined || req.body.email === undefined || req.body.password === undefined) return next(createError(400, 'Bad Request'));

  let userId;
  let password = req.body.password;
  delete req.body.password;

  let user = new User(req.body);
  user.generatePasswordHash(password)
    .then( user => user.save())
    .then( user => {
      userId = user._id;
      return user.generateToken();
    })
    .then( token => {
      res.cookie('X-ProMgmt-Token', token, {maxAge: 900000, domain: 'pro-mgmt-fe-staging.herokuapp.com'});
      res.json({token, userId});
    })
    .catch(next);
});

userRouter.get('/api/me', bearerAuth, function(req, res, next) {
  debug('GET: /api/me');

  User.findOne({_id: req.user._id})
    .then( user => {
      if (!user) next(createError(404, 'user not found'));
      delete user.findHash;
      delete user.password;
      delete user.username;
      delete user.email;
      console.log('user object', user);
      return user;
    })
    .then( user => {
      return res.json(user);
    })
    .catch(next);
});

userRouter.get('/api/signin', basicAuth, function(req, res, next) {
  debug('GET: /api/signin');
  let profileId;
  let userId;

  User.findOne({ username: req.auth.username }) 
    .then( user => {
      if(!user) next(createError(404, 'username not found'));
      return user.comparePasswordHash(req.auth.password);
    })
    .then( user => {
      profileId = user.profileId;
      userId = user._id;
      return user.generateToken();
    })
    .then( token => {
      console.log(token);
      res.cookie('X-ProMgmt-Token', token, {maxAge: 900000, domain: 'pro-mgmt-fe-staging.herokuapp.com'});
      res.json({token, userId, profileId});
    })
    .catch(next);
});

userRouter.put('/api/user/:userId/:profileId', bearerAuth, function(req, res, next) {
  debug('PUT: /api/user/userId');

  User.findByIdAndUpdate(req.params.userId, {profileId: req.params.profileId}, { new: true })
    .then(user => {
      return res.json(user);
    })
    .catch(next);
});

userRouter.delete('/api/user/:userId', bearerAuth, function(req, res, next) {
  debug('DELETE: /api/user/userId');

  User.findByIdAndRemove(req.params.userId)

    .then( () => res.sendStatus(204))
    .catch(next);
});