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
      console.log('task', task);
      this.tempDelTask = task;
      console.log('this.tempTask', this.tempDelTask);
      return Project.findById(this.tempDelTask.projectId);
    })
    .then( project => {
      this.tempProject = project;
      let index = this.tempProject.tasks.indexOf(this.tempDelTask._id);
      this.tempProject.tasks.splice(index, 1);
      this.tempProject.save();
      return Task.find().$where(function(){
        return this.dependentTasks.includes(this.tempDelTask._id);
      });
    })
    .then( tasks => {
      tasks.forEach( task => {
        this.tempDepTask = task;
        let index = this.tempDepTask.indexOf(this.tempDelTask._id);
        this.tempDepTask.dependentTasks.splice(index, 1);
        this.tempDepTask.save();
      });
    })
    .then( () => {
      return Task.findByIdAndRemove(this.tempDelTask._id);
    })
    .catch(next);
});