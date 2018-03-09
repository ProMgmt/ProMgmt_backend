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

  if(!req.body.username || !req.body.email) {
    return next(createError(400, 'Bad Request'));
  }

  let password = req.body.password;
  delete req.body.password;

  let user = new User(req.body);
  user.generatePasswordHash(password)
    .then( user => user.save())
    .then( user => user.generateToken())
    .then( token => res.send(token))
    .catch(next);
});

userRouter.get('/api/login', basicAuth, function(req, res, next) {
  debug('GET: /api/login');

  User.findOne({ username: req.auth.username })
    .then( user => user.comparePasswordHash(req.auth.password))
    .then( user => user.generateToken())
    .then( token => res.send(token))
    .catch(next);
});

userRouter.delete('/api/user/:userId', bearerAuth, function(req, res, next) {
  debug('DELETE: /api/user/userId');

  User.findByIdAndRemove(req.params.userId)
    .then( () => res.sendStatus(204))
    .catch(next);
});
  