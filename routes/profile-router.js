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

  req.body.userId = req.user._id;


  User.findById(req.body.userId)
    .then(user => {
      if (!user) next(createError(404, 'user not found'));
      return;
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
      return res.json(profile);
    })
    .catch(() => next(createError(404, 'invalid profile id')));

});

//PUT ROUTE

profileRouter.put('/api/profile/:profileId', bearerAuth, jsonParser, function (req, res, next) {
  debug('PUT: /api/profile/profileId');


  if (req.body.firstName || req.body.lastName || req.body.desc || req.body.title || req.body.company || req.body.avatarURI) {

    Profile.findByIdAndUpdate(req.params.profileId, req.body, { new: true })
      .then(profile => {
        if (!profile) return next(createError(404));
        return res.json(profile);
      })
      .catch(err => {
        if (err.name === 'ValidationError') return next(err);
        next(createError(404, err.message));
      });
  } else {
    return next(createError(400, 'request body not provided'));
  }
});

//DELETE ROUTE

profileRouter.delete('/api/profile/:profileId', bearerAuth, function (req, res, next) {
  debug('DELETE: /api/profile/profileId');

  Profile.findByIdAndRemove(req.params.profileId)

    .then(() => {
      return res.sendStatus(204, 'profile deleted');
    })
    .catch(err => next(createError(404, err.message)));
});

profileRouter.all('/api/profile', function(req, res, next) {
  debug('ALL: /api/profile');

  return next(createError(404));
});

