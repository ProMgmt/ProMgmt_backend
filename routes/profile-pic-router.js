'use strict';

const fs = require('fs');
const path = require('path');
const del = require('del');
const AWS = require('aws-sdk');
const multer = require('multer');
const Router = require('express').Router;
const createError = require('http-errors');
const debug = require('debug')('promgmt:profile-pic-router');

const ProfilePic = require('../model.profile-pic.js');
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

profilePicRouter.post('/api/profile/:profileId/pic', bearerAuth, upload.single('image'), function(req, res, next) {
  debug('POST: /api/profile/profileId/pic');

  if(!req.file.path) {
    return next(createError(400, 'file not found'));
  }

  if(!req.file.path) {
    return next(createError(500, 'file not saved'));
  }

  let ext = path.extname(req.file.originalname);

  let params = {
    ACL: 'public read', 
    Bucket: process.env.AWS_BUCKET, 
    Key: `${req.file.filename}${ext}`,
    Body: fs.createReadStream(req.file.path),
  };

  Profile.findById(req.params.profileId)
    .then( () => s3uploadProm(params))
    .then( s3data => {
      console.log('s3 res:', s3data);
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
    .catch( err => next(err));
});


