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
    return next(createError(400,'Bad Request'));
  }

  req.body.admins.push(req.user._id);
  console.log('admins array', req.body.admins);
  
  new Org(req.body).save()
    .then(org => console.log(res.json(org)))
    .then( org => res.json(org))
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
  

  Org.findByIdAndUpdate(req.params.orgId, req.body, { new: true })
    .then( org => res.json(org))
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