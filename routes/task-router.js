'use strict';

const debug = require('debug')('promgmt:task-router');
const createError = require('http-errors');
const jsonParser = require('body-parser').json();
const Router = require('express').Router;
const bearerAuth = require('../lib/bearer-auth.js');
const Project = require('../model/project.js');
const Task = require('../model/task.js');
const User = require('../model/user.js');

const taskRouter = module.exports = Router();

taskRouter.post('/api/project/:projectId/task', bearerAuth, jsonParser, function(req, res, next) {
  debug('POST: /api/project/:projectId/task');
  console.log('req.body', req.body);

  if (req.body.desc === undefined) return next(createError(400, 'bad request'));

  console.log('req.body.desc', req.body.desc);

  var tempTask = {};

  Project.findByIdAndAddTask(req.params.projectId, req.body, req.user._id)
    .then( task => {
      console.log('task@res', task);
      tempTask = task;
      let admins = tempTask.admins.reduce((acc, admin) => {
        acc.push({_id: admin.toString()});
        return acc;
      },[]);
      console.log('admins1', admins);
      return User.find({$or: admins});
    })
    .then( admins => {
      tempTask.admins = admins;
      console.log('tempTask.admins2', tempTask.admins);
      if(tempTask.dependentTasks.length > 0){
        let dependentTasks = tempTask.dependentTasks.reduce((acc, task) => {
          acc.push({_id: task.toString()});
          return acc;
        },[]);
        console.log('dependentTasks', dependentTasks);
        Task.find({$or: dependentTasks})
          .then(tasks =>{
            tempTask.dependentTasks = tasks;
            console.log('tempTask@final', tempTask);
            return res.json(tempTask);
          });
      } else {
        console.log('tempTask@final2', tempTask);
        return res.json(tempTask);
      }
    })
    .catch(next);
});

taskRouter.get('/api/task/:taskId', bearerAuth, function(req, res, next) {
  debug('GET: /api/task/taskId');

  Task.findById(req.params.taskId)
    .then(task => {
      if (!task) return next(createError(404));
      return res.json(task);
    })
    .catch(next);
});

taskRouter.put('/api/task/:taskId', bearerAuth, jsonParser, function(req, res, next) {
  debug('PUT: /api/task/taskId');
  
  var tempTask = {};

  Task.findByIdAndUpdate(req.params.taskId, req.body, { new: true})
    .then( task => {
      if (!task) return next(createError(404));
      tempTask = task;
      console.log('tempTask1', tempTask);
      let admins = tempTask.admins.reduce((acc, admin) => {
        acc.push({_id: admin.toString()});
        return acc;
      },[]);
      console.log('admins1', admins);
      return User.find({$or: admins});
    })
    .then( admins => {
      tempTask.admins = admins;
      console.log('tempTask.admins2', tempTask.admins);
      if(tempTask.dependentTasks.length > 0){
        let dependentTasks = tempTask.dependentTasks.reduce((acc, task) => {
          acc.push({_id: task.toString()});
          return acc;
        },[]);
        console.log('dependentTasks', dependentTasks);
        Task.find({$or: dependentTasks})
          .then(tasks =>{
            tempTask.dependentTasks = tasks;
            console.log('tempTask@final', tempTask);
            return res.json(tempTask);
          });
      } else {
        console.log('tempTask@final2', tempTask);
        return res.json(tempTask);
      }
    })
    .catch(next);
});

taskRouter.delete('/api/task/:taskId', bearerAuth, function(req, res, next) {
  debug('DELETE: api/task/taskId');

  var tempTask = {};

  Task.findById(req.params.taskId)
    .then( task => {
      tempTask = task;
      return Task.find({ projectId: task.projectId });
    })
    .then( tasks => {
      tasks.forEach( task => {
        let subIndex = task.subTasks.indexOf(req.params.taskId);
        let depIndex = task.dependentTasks.indexOf(req.params.taskId);
        if(subIndex !== -1) task.subTasks.splice(subIndex, 1);
        if(depIndex !== -1) task.dependentTasks.splice(depIndex, 1);
        if(subIndex !== -1 || depIndex !== -1) task.save();
      });
    })
    .then( () => Project.findById(tempTask.projectId))
    .then( project => {
      let index = project.tasks.indexOf(req.params.taskId);
      project.tasks.splice(index,1);
      project.save();
    })
    .then( () => Task.findByIdAndRemove(req.params.taskId))
    .then( () => res.sendStatus(204))
    .catch(next);
});

taskRouter.all('/api/task/', bearerAuth, jsonParser, function(req, res, next) {
  debug('ALL: /api/task/');

  return next(createError(400, 'bad request'));
});
