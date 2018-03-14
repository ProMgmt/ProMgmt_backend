'use strict';

const fs = require('fs');
const path = require('path');
const del = require('del');
const AWS = require('aws-sdk');
const multer = require('multer');
const Router = require('express').Router;
const createError = require('http-errors');
const debug = require('debug')('promgmt:attach-router');

const Attach = require('../model/attachment.js');
const Task = require('../model/task.js');
const bearerAuth = require('../lib/bearer-auth.js');
const attachRouter = module.exports = Router();

AWS.config.setPromisesDependency(require('bluebird'));

const s3 = new AWS.S3();
const dataDir = `${__dirname}/../data`;
const upload = multer({dest: dataDir});

function s3uploadProm(params){
  debug('s3uploadProm');

  return new Promise((resolve, reject) => {
    s3.upload(params, (err, s3data) => {
      resolve(s3data);
    });
  });
}

function s3deleteProm(params){
  debug('s3deleteProm');

  return new Promise((resolve, reject) => {
    s3.deleteObject(params, (err, s3res) => {
      resolve(s3res);
    });
  });
}

attachRouter.post('/api/task/:taskId/attach', bearerAuth, upload.single('attach'), function(req, res, next){
  debug('POST: /api/task/:taskId/attach');

  if(!req.file) return next(createError(400, 'file not found'));
  if(!req.file.path) return next(createError(500, 'file not saved'));

  let ext = path.extname(req.file.originalname);

  let params = {
    ACL: 'public-read',
    Bucket: process.env.AWS_BUCKET,
    Key: `${req.file.filename}${ext}`,
    Body: fs.createReadStream(req.file.path),
  };

  let tempTask = {};

  Task.findById(req.params.taskId)
    .then( task => {
      tempTask = task;
      return s3uploadProm(params);
    })
    .then( s3data => {
      del([`${dataDir}/*`]);

      let attachData = {
        name: req.body.name,
        type: req.body.type,
        taskId: req.params.taskId,
        projectId: tempTask.projectId,
        orgId: tempTask.orgId,
        admins: [req.user._id],
        attURI: s3data.Location,
        objectKey: s3data.Key,
      };

      return new Attach(attachData).save();
    })
    .then( attach => res.json(attach))
    .catch(err => next(err));
});

attachRouter.delete('/api/attach/:attachId', bearerAuth, function(req, res, next){
  debug('DELETE: /api/attach/:attachId');

  if(!req.params.attachId) return next(createError(400, 'bad request'));

  let params = {
    Bucket: process.env.AWS_BUCKET,
    Key: '',
  };

  Attach.findById(req.params.attachId)
    .then( attach => {
      params.Key = attach.objectKey;
      return s3deleteProm(params);
    })
    .then( () => res.sendStatus(204))
    .catch( err => next(err));
});