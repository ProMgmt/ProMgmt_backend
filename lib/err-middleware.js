'use strict';

const createError = require('http-errors');
const debug = require('debug')('promgmt:errors');

module.exports = function(err, req, res, next) {
  debug('error middleware');

  if(err.status) {
    res.status(err.status).send(err.name);
    next();
    return;
  }

  if(err.message.includes('duplicate key error')) {
    err = createError(409, 'Conflict');
    res.status(err.status).send(err.name);
    next();
    return;
  }

  if(err.name === 'ValidationError') {
    err = createError(400, err.message);
    res.status(err.status).send(err.name);
    next();
    return;
  }
  
  err = createError(500, err.message);
  res.status(err.status).send(err.name);
  next();
};