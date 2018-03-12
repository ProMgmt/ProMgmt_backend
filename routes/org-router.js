'use strict';

const debug = require('debug')('promgmt:user-router');
const createError = require('http-errors');
const jsonParser = require('body-parser').json();
const Router = require('express').Router;
const bearerAuth = require('../lib/bearer-auth.js');
const Org = require('../model/org.js'); 

const orgRouter = module.exports = Router();

orgRouter.post('/api/org', bearerAuth, jsonParser, function(req, res, next) {
  debug('POST: /api/org');

  if(!req.body.name || !req.body.desc) {
    return next(createError(400,'Bad REquest'));
  }

  req.body.admins = req.user._id;
  new Org(req.body).save()
    .then( org => res.json(org))
    .catch(next);
});

orgRouter.get('/api/org/:orgId', bearerAuth, function(req, res, next) {
  debug('GET: /api/org/orgId');

  Org.findById(req.params.orgId)
    .then( org => res.json(org))
    .catch(next);
});

orgRouter.put('/api/org/:orgId', bearerAuth, jsonParser, function(req, res, next) {
  debug('PUT: /api/org/orgId');

  //TODO: route logic
});

orgRouter.delete('/api/org/:orgId', bearerAuth, function(req, res, next) {
  debug('DELETE: /api/org/orgId');

  Org.findByIdAndRemove(req.params.orgId)
    .then( () => res.sendStatus(204))
    .catch(next);
});





