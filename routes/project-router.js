'use strict';

const debug = require('debug')('promgmt:project-router');
const createError = require('http-errors');
const jsonParser = require('body-parser').json();
const Router = require('express').Router;
const bearerAuth = require('../lib/bearer-auth.js');
const Project = require('../model/project.js');
const Org = require('../model/org.js');

const projectRouter = module.exports = Router();

projectRouter.post('/api/org/:orgId/project', jsonParser, bearerAuth, function(req, res, next) {
  debug('POST: /api/org/:orgId/project');

  if(req.params.orgId === undefined || req.user._id === undefined || req.body.projectName === undefined) return next(createError(400, 'Bad Request'));

  Org.findByIdAndAddProject(req.params.orgId, req.body, req.user._id)
    .then( project => res.json(project))
    .catch(next);
});

projectRouter.get('/api/project/:projectId', bearerAuth, function(req, res, next) {
  debug('GET: /api/project/:projectId');

  Project.findById(req.params.projectId)
    .then( project => {
      if (!project) return next(createError(404));
      return res.json(project);
    })
    .catch(next);
});

projectRouter.put('/api/project/:projectId', bearerAuth, jsonParser, function(req, res, next) {
  debug('PUT: /api/project/projectId');

  Project.findByIdAndUpdate(req.params.projectId, req.body, {new: true})
    .then( project => {
      if(!project) return next(createError(404));
      return res.json(project);
    })
    .catch(next);    
});

projectRouter.delete('/api/project/:projectId', bearerAuth, function( req, res, next) {
  debug('DELETE: /api/project/projectId');

  Project.findByIdAndRemove(req.params.projectId)
    .then(() => res.sendStatus(204, 'project deleted'))
    .catch(next);
});


projectRouter.all('/api/project/', function(req, res, next) {
  debug('ALL: /api/project/');

  return next(createError(400, 'no ID provided'));
});