'use strict';

const debug = require('debug')('promgmt:user-router');
const createError = require('http-errors');
const jsonParser = require('body-parser').json();
const Router = require('express').Router;
const bearerAuth = require('../lib/bearer-auth.js');

const orgRouter = module.exports = Router();

orgRouter.post('/api/org', bearerAuth, jsonParser, function(req, res, next) {
  debug('POST: /api/org');

  //TODO: route logic
});

orgRouter.get('/api/org/:orgId', bearerAuth, function(req, res, next) {
  debug('GET: /api/org/orgId');

  //TODO: route logic
});

orgRouter.put('/api/org/:orgId', bearerAuth, jsonParser, function(req, res, next) {
  debug('PUT: /api/org/orgId');

  //TODO: route logic
});

orgRouter.delete('/api/org/:orgId', bearerAuth, function(req, res, next) {
  debug('DELETE: /api/org/orgId');

  //TODO: logic
});





