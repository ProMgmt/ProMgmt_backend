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

profileRouter.post('/api/user/:userId/profile', bearerAuth, jsonParser, function(req, res, next) {
  debug('POST: /api/user/userId/profile');

  req.body.userId = req.user._id;

  if(!req.params.userId) {
    return next(createError(404, 'user id required'))
  }

  User.findById(req.body.userId)
  .then( user => {
    res.json(user);
  })
  .catch( err => {
    return next(createError(404, 'user id not found'))
  })

  new Profile(req.body).save()
    .then( profile => res.json(profile))
    .catch(next);
});

//GET ROUTE

profileRouter.get('/api/profile/:profileId', bearerAuth, function(req, res, next) {
  debug('GET: /api/profile/profileId');

  if(!req.params.profileId) {
    return next(createError(404, 'no profile id provided'));
  }

  Profile.findById(req.body.profileId)
    .then( profile => {
      if(!profile) return next(createError(404, 'id not found'))
    })
    .catch(done);
});

//PUT ROUTE

profileRouter.put('/api/profile/:profileId', bearerAuth, jsonParser, function(req, res, next) {
  debug('PUT: /api/profile/profileId');

  if(!req.params.profileId) {
    res.status(400).send();
  }

  if(req.body.firstName || req.body.lastName || req.body.desc || req.body.title || req.body.company || req.body.avatarURI) {

    Profile.findByIdAndUpdate(req.params.profileId, req.body, { new: true })
      .then( profile => res.json(profile))
      .catch( err => {
        if(err.name === 'ValidationError') return next(err);
        next(createError(404, err.message));
      });
  }
});

//DELETE ROUTE

profileRouter.delete('/api/profile/:profileId', bearerAuth, function(req, res, next) {
  debug('DELETE: /api/profile/profileId');

  if(!req.params.profileId) {
    res.status(404).send();
  }

  Profile.findByIdAndRemove(req.params.profileId)
    .then( () => next(createError(204, 'profile deleted')))
    .catch( err => next(createError(404, err.message)));
});