'use strict';

const debug = require('debug')('promgmt:task-router');
const createError = require('http-errors');
const jsonParser = require('body-parser').json();
const Router = require('express').Router;
const bearerAuth = require('../lib/bearer-auth.js');
const Project = require('../model/project.js');
const Task = require('../model/task.js');

const taskRouter = module.exports = Router();

taskRouter.post('/api/project/:projectId/task', bearerAuth, jsonParser, function(req, res, next) {
  debug('POST: /api/project/:projectId/task');

  if(req.body.desc === undefined) return next(createError(400, 'bad request'));

  Project.findByIdAndAddTask(req.params.projectId, req.body, req.user._id)
    .then( task => res.json(task))
    .catch(next);
});

taskRouter.get('/api/task/:taskId', bearerAuth, function(req, res, next) {
  debug('GET: /api/task/taskId');

  Task.findById(req.params.taskId)
    .then(task => res.json(task))
    .catch(next);
});

taskRouter.get('/api/task/', bearerAuth, function(req, res, next) {
  debug('GET: /api/task/');

  next(createError(400, 'bad request'));
});

taskRouter.put('/api/task/:taskId', bearerAuth, jsonParser, function(req, res, next) {
  debug('PUT: /api/task/taskId');

  Task.findByIdAndUpdate(req.params.taskId, req.body, { new: true})
    .then( task => res.json(task))
    .catch(next);
});

taskRouter.put('/api/task/', bearerAuth, jsonParser, function(req, res, next) {
  debug('PUT: /api/task/');

  next(createError(400, 'bad request'));
});

taskRouter.delete('/api/task/:taskId', bearerAuth, function(req, res, next) {
  debug('DELETE: api/task/taskId');

  Task.findById(req.params.taskId)
    .then( task => {
      Project.findByIdAndRemoveTask(task.projectId);
    })
    .then( project => {
      console.log('project', project);
      res.sendStatus(204);
    })
    .catch(next);
});