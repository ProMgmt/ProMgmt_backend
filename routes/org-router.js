'use strict';

const debug = require('debug')('promgmt:user-router');
const createError = require('http-errors');
const jsonParser = require('body-parser').json();
const Router = require('express').Router;
const bearerAuth = require('../lib/bearer-auth.js');
const Org = require('../model/org.js'); 
const User = require('../model/user.js');
const Project = require('../model/project.js');

const orgRouter = module.exports = Router();

orgRouter.post('/api/org', bearerAuth, jsonParser, function(req, res, next) {
  debug('POST: /api/org');

  if(!req.body.name || !req.body.desc) {
    return next(createError(400,'Bad Request'));
  }

  req.body.admins.push(req.user._id);
  console.log('admins array', req.body.admins);
  var tempOrg = {};
  new Org(req.body).save()
    .then( org => {
      tempOrg = org;
      let admins = tempOrg.admins.reduce((acc, admin) => {
        acc.push({_id: admin.toString()});
        return acc;
      },[]);
      return User.find({$or: admins});
    })
    .then( admins => {
      tempOrg.admins = admins;
      if(tempOrg.users.length > 0){
        let users = tempOrg.users.reduce((acc, user) => {
          acc.push({_id: user.toString()});
          return acc;
        },[]);
        return User.find({$or: users})
          .then(users => {
            tempOrg.users = users;
            return res.json(tempOrg);
          });
      } else {
        return res.json(tempOrg);
      }
    })
    .catch(next);
});

orgRouter.get('/api/org/user/me', bearerAuth, (req, res, next) => {
  debug('GET: /api/org/user/me');

  Org.find({$or: [{users: req.user._id.toString()}, {admins: req.user._id.toString()}]})
    .populate({path: 'projects', populate: {path: 'tasks', populate: {path: 'admins'}}})
    .populate({path: 'projects', populate: {path: 'tasks', populate: {path: 'dependentTasks'}}})
    .populate({path: 'projects', populate: {path: 'admins'}})
    .populate({path: 'projects', populate: {path: 'users'}})
    .populate('admins')
    .populate('users')
    .then(orgs => {
      if(!orgs) return next(createError(404));
      return res.json(orgs);
    })
    .catch(next);
});

orgRouter.get('/api/org/:orgId', bearerAuth, function(req, res, next) {
  debug('GET: /api/org/orgId');

  Org.findById(req.params.orgId)
    .then( org => {
      if (!org) return next(createError(404));
      return res.json(org);
    })
    .catch(next);
});

orgRouter.put('/api/org/:orgId', bearerAuth, jsonParser, function(req, res, next) {
  debug('PUT: /api/org/orgId');

  if(!req.body.name || !req.body.desc) return next(createError(400, 'bad request'));
  
  var tempOrg = {};
  Org.findByIdAndUpdate(req.params.orgId, req.body, { new: true })
    .then( org => {
      tempOrg = org;
      let admins = tempOrg.admins.reduce((acc, admin) => {
        acc.push({_id: admin.toString()});
        return acc;
      },[]);
      return User.find({$or: admins});
    })
    .then( admins => {
      tempOrg.admins = admins;
      if(tempOrg.users.length > 0){
        let users = tempOrg.users.reduce((acc, user) => {
          acc.push({_id: user.toString()});
          return acc;
        },[]);
        return User.find({$or: users})
          .then(users => {
            tempOrg.users = users;
            if(tempOrg.projects.length > 0){
              let projects = tempOrg.projects.reduce((acc, project) => {
                acc.push({_id: project.toString()});
                return acc;
              },[]);
              return Project.find({$or: projects})
                .then(projects => {
                  tempOrg.projects = projects;
                  return res.json(tempOrg);
                }).catch(next);
            } else {
              return res.json(tempOrg);
            }
          });
      } else if(tempOrg.projects.length > 0) {
        let projects = tempOrg.projects.reduce((acc, project) => {
          acc.push({_id: project.toString()});
          return acc;
        },[]);
        return Project.find({$or: projects})
          .then(projects => {
            tempOrg.projects = projects;
            return res.json(tempOrg);
          }).catch(next);
      } else {
        return res.json(tempOrg);
      }
    })
    .catch(next);
});

orgRouter.delete('/api/org/:orgId', bearerAuth, function(req, res, next) {
  debug('DELETE: /api/org/orgId');

  Org.findByIdAndRemove(req.params.orgId)
    .then( () => res.sendStatus(204))
    .catch(next);
});

orgRouter.all('/api/org', function(req, res, next) {
  debug('ALL: /api/org');

  return next(createError(400));
});