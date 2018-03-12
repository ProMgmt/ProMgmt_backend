'use strict';

const debug = require('debug')('promgmt:user-router');
const createError = require('http-errors');
const jsonParser = require('body-parser').json();
const Router = require('express').Router;
const bearerAuth = require('../lib/bearer-auth.js');
const Project = require('../model/project.js');

const projectRouter = module.exports = Router();

projectRouter.post('/api/org/:orgId/project', bearerAuth, jsonParser, function(req, res, next) {
  debug('POST: /api/org/orgId/project');

  //TODO: route logic
});

projectRouter.get('/api/project/:projectId', bearerAuth, function(req, res, next) {
  debug('GET: /api/project/projectId');

  //TODO: route logic
});

projectRouter.put('/api/project/:projectId', bearerAuth, jsonParser, function(req, res, next) {
  debug('PUT: /api/project/projectId');

  //TODO: route logic
});

projectRouter.delete('/api/project/:projectId', bearerAuth, function( req, res, next) {
  debug('DELETE: /api/project/projectId');

  //TODO: route logic
});