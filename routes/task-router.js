'use strict';

const debug = require('debug')('promgmt:user-router');
const createError = require('http-errors');
const jsonParser = require('body-parser').json();
const Router = require('express').Router;
const bearerAuth = require('../lib/bearer-auth.js');
const Task = require('../model/task.js');

const taskRouter = module.exports = Router();

taskRouter.post('/api/project/:projectId/task', bearerAuth, jsonParser, function(req, res, next) {
  debug('POST: /api/project/projectId/task');

  //TODO: route logic
});

taskRouter.get('/api/task/:taskId', bearerAuth, function(req, res, next) {
  debug('/api/task/taskId');

  //TODO: route logic
});

taskRouter.put('/api/task/:taskId', bearerAuth, jsonParser, function(req, res, next) {
  debug('/api/task/taskId');

  //TODO: route logic
});

taskRouter.delete('/api/task/:taskId', bearerAuth, function(req, res, next) {
  debug('api/task/taskId');

  //TODO: route logic
});