'use strict';

const debug = require('debug')('promgmt:project-router');
const createError = require('http-errors');
const jsonParser = require('body-parser').json();
const Router = require('express').Router;
const bearerAuth = require('../lib/bearer-auth.js');
const Project = require('../model/project.js');
const Org = require('../model/org.js');
const User = require('../model/user.js');
const Task = require('../model/task.js');

const projectRouter = module.exports = Router();

projectRouter.post('/api/org/:orgId/project', jsonParser, bearerAuth, function(req, res, next) {
  debug('POST: /api/org/:orgId/project');

  if(req.params.orgId === undefined || req.user._id === undefined || req.body.projectName === undefined) return next(createError(400, 'Bad Request'));
  var tempProject = {};
  Org.findByIdAndAddProject(req.params.orgId, req.body, req.user._id)
    .then( project => {
      tempProject = project;
      let admins = tempProject.admins.reduce((acc, admin) => {
        acc.push({_id: admin.toString()});
        return acc;
      },[]);
      return User.find({$or: admins});
    })
    .then( admins => {
      tempProject.admins = admins;
      console.log('tempProject.admins2', tempProject.admins);
      if(tempProject.users.length > 0){
        let users = tempProject.users.reduce((acc, user) => {
          acc.push({_id: user.toString()});
          return acc;
        },[]);
        User.find({$or: users})
          .then(users =>{
            tempProject.users = users;
            return res.json(tempProject);
          });
      } else {
        return res.json(tempProject);
      }
    })
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
  var tempProject = {};
  Project.findByIdAndUpdate(req.params.projectId, req.body, {new: true})
    .then( project => {
      if(!project) return next(createError(404));
      tempProject = project;
      let admins = tempProject.admins.reduce((acc, admin) => {
        acc.push({_id: admin.toString()});
        return acc;
      },[]);
      return User.find({$or: admins});
    })
    .then( admins => {
      tempProject.admins = admins;
      console.log('tempProject.admins2', tempProject.admins);
      if(tempProject.users.length > 0){
        let users = tempProject.users.reduce((acc, user) => {
          acc.push({_id: user.toString()});
          return acc;
        },[]);
        User.find({$or: users})
          .then(users =>{
            tempProject.users = users;
            if(tempProject.tasks.length > 0){
              let tasks = tempProject.tasks.reduce((acc, task) => {
                acc.push({_id: task.toString()});
                return acc;
              }, []);
              return Task.find({$or: tasks})
                .then(tasks => {
                  tempProject.tasks = tasks;
                  return res.json(tempProject);
                });
            } else {
              return res.json(tempProject);
            }
          })
          .catch(next);
      } else {
        if(tempProject.tasks.length > 0){
          let tasks = tempProject.tasks.reduce((acc, task) => {
            acc.push({_id: task.toString()});
            return acc;
          }, []);
          return Task.find({$or: tasks})
            .then(tasks => {
              tempProject.tasks = tasks;
              return res.json(tempProject);
            });
        } else {
          return res.json(tempProject);
        }
      }
    }); 
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