'use strict';

const fs = require('fs');
const path = require('path');
const del = require('del');
const AWS = require('aws-sdk');
const multer = require('multer');
const Router = require('express').Router;
const createError = require('http-errors');
const debug = require('debug')('promgmt:profile-pic-router');

const ProfilePic = require('../model/profile-pic.js');
const Profile = require('../model/profile.js');
const bearerAuth = require('../lib/bearer-auth.js');
const profilePicRouter = module.exports = Router();

AWS.config.setPromisesDependency(require('bluebird'));

const s3 = new AWS.S3();
const dataDir = `${__dirname}/../data`;
const upload = multer({ dest: dataDir });

function s3uploadProm(params) {
  debug('s3uploadProm');

  return new Promise((resolve) => {
    s3.upload(params, (err, s3data) => {
      resolve(s3data);
    });
  });
}

function s3deleteProm(params){
  debug('s3deleteProm');

  return new Promise((resolve) => {
    s3.deleteObject(params, (err, s3res) => {
      resolve(s3res);
    });
  });
}

profilePicRouter.post('/api/profile/:profileId/pic', bearerAuth, upload.single('image'), function(req, res, next) {
  debug('POST: /api/profile/profileId/pic');

  if(!req.file) {
    return next(createError(400, 'file not found'));
  }

  let ext = path.extname(req.file.originalname);

  let params = {
    ACL: 'public-read', 
    Bucket: process.env.AWS_BUCKET, 
    Key: `${req.file.filename}${ext}`,
    Body: fs.createReadStream(req.file.path),
  };

  Profile.findById(req.params.profileId)
    .then( profile => {
      if (!profile) return next(createError(404));
    })
    .then( () => s3uploadProm(params))
    .then( s3data => {
      del([`${dataDir}/*`]);

      let picData = {
        userId: req.user._id, 
        profileId: req.params.profileId, 
        avatarURI: s3data.Location,
        avatarObjectKey: s3data.Key,
      };

      return new ProfilePic(picData).save();
    })
    .then( profilePic => res.json(profilePic))
    .catch(next);
});

profilePicRouter.get('/api/profilepic/:picId', bearerAuth, function(req, res, next){
  debug('GET: /api/profilepic/:picId');

  ProfilePic.findById(req.params.picId)
    .then( pic => {
      // if(!pic) return next(createError(404));
      return res.json(pic);
    })
    .catch(next);
});

profilePicRouter.delete('/api/profilepic/:picId', bearerAuth, function(req, res, next){
  debug('DELETE: /api/profilepic/:picId');

  let params = {
    Bucket: process.env.AWS_BUCKET,
    Key: '',
  };

  ProfilePic.findById(req.params.picId)
    .then( pic => {
      // if(!pic) return next(createError(404, 'pic not found'));
      params.Key = pic.avatarObjectKey;
      return s3deleteProm(params);
    })
    .then( () => ProfilePic.findByIdAndRemove(req.params.picId))
    .then( () => res.sendStatus(204))
    .catch(next);
});

profilePicRouter.all('/api/profilepic', function(req, res, next){
  debug('ALL: /api/profilepic');

  return next(createError(400, 'no pic ID provided'));
});