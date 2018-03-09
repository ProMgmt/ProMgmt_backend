'use strict';

const debug = require('debug')('promgmt:user-router');
const createError = require('http-errors');
const jsonParser = require('body-parser').json();
const Router = require('express').Router;
const bearerAuth = require('../lib/bearer-auth.js');
const Profile = require('../model/profile.js');

const profileRouter = module.exports = Router();

profileRouter.post('/api/profile', bearerAuth, jsonParser, function(req, res, next) {
  debug('POST: /api/profile');

  //TODO: route logic
});

profileRouter.get('/api/profile/:profileId', bearerAuth, function(req, res, next) {
  debug('GET: /api/profile');

  //TODO: route logic
});

profileRouter.put('/api/profile/:profileId', bearerAuth, jsonParser, function(req, res, next) {
  debug('PUT: /api/profile/profileId');

  //TODO: route logic
});

profileRouter.delete('/api/profile/:profileId', bearerAuth, function(req, res, next) {
  debug('DELETE: /api/profile/profileId');

  //TODO: route logic
});