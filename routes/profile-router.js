'use strict';

const debug = require('debug')('promgmt:user-router');
const createError = require('http-errors');
const jsonParser = require('body-parser').json();
const Router = require('express').Router;
const bearerAuth = require('../lib/bearer-auth.js');
const Profile = require('../model/profile.js');
const User = require('../model/user.js');

const profileRouter = module.exports = Router();

//POST ROUTE

profileRouter.post('/api/user/:userId/profile', bearerAuth, jsonParser, function (req, res, next) {
  debug('POST: /api/user/userId/profile');

  req.body.userId = req.params.userId;

  User.findById(req.params.userId)
    .then(user => {
      if (!user) return next(createError(404, 'user not found'));
    })
    .then(() => new Profile(req.body).save())
    .then(profile => res.json(profile))
    .catch(err => next(err));
});

//GET ROUTE

profileRouter.get('/api/profile/:profileId', bearerAuth, function (req, res, next) {
  debug('GET: /api/profile/profileId');

  Profile.findById(req.params.profileId)
    .then(profile => {
      if (!profile) return next(createError(404));
      res.json(profile);
    })
    .catch(next);
});

//PUT ROUTE

profileRouter.put('/api/profile/:profileId', bearerAuth, jsonParser, function (req, res, next) {
  debug('PUT: /api/profile/profileId');

  if (req.body.firstName === undefined && req.body.lastName === undefined && req.body.desc === undefined && req.body.title === undefined && req.body.company === undefined && req.body.avatarURI === undefined)     return next(createError(400, 'request body not provided'));

  Profile.findByIdAndUpdate(req.params.profileId, req.body, { new: true })
    .then(profile => {
      if (!profile) return next(createError(404));
      return res.json(profile);
    })
    .catch(next);
});

//DELETE ROUTE

profileRouter.delete('/api/profile/:profileId', bearerAuth, function (req, res, next) {
  debug('DELETE: /api/profile/profileId');

  Profile.findByIdAndRemove(req.params.profileId)
    .then(() => {
      return res.sendStatus(204, 'profile deleted');
    })
    .catch(next);
});

profileRouter.all('/api/profile', function(req, res, next) {
  debug('ALL: /api/profile');

  return next(createError(400));
});

