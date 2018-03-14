'use strict';

const superagent = require('superagent');
const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs'), {suffix: 'Prom'});
const debug = require('debug')('promgmt:profile-pic-router-test');
const server = require('../server.js');
const serverToggle = require('../lib/toggle.js');
const hooks = require('../lib/test-hooks.js');
const PORT = process.env.PORT || 3000;

require('jest');

const url = `http://localhost:${PORT}`;

describe('Profile Picture Routes', function() {
  beforeAll( done => serverToggle.serverOn(server, done));
  afterAll( done => serverToggle.serverOff(server, done));
  afterEach(done => hooks.removeDBInfo(done));

  describe('POST: /api/profile/:profileId/pic', () => {
    debug('POST: /api/profile/:profileId/pic');
    beforeEach( done => hooks.createUser(done));
    beforeEach( done => hooks.createProfile(done));

    beforeEach( done => {
      fs.copyFileProm(`${__dirname}/testdata/tester.png`, `${__dirname}/../data/tester.png`)
        .then( () => done())
        .catch(done);
    });

    afterEach( done => {
      delete hooks.exampleProfile.userId;
      done();
    });
    
    describe('with a valid token and data', () => {
      it('should return an object containing our profile picture url', done => {
        superagent.post(`${url}/api/profile/${hooks.tempProfile._id}/pic`)
          .set({
            Authorization: `Bearer ${hooks.tempToken}`,
          })
          .attach('image', hooks.exampleProfilePic.image)
          .end((err, res) => {
            if (err) return done(err);
            expect(res.status).toEqual(200);
            expect(res.body.profileId).toEqual(hooks.tempProfile._id.toString());
            done();
          });
      });
    });

    describe('with no token or data', () => {
      it('should return a 400 with no file given', done => {
        superagent.post(`${url}/api/profile/${hooks.tempProfile._id}/pic`)
          .set({
            Authorization: `Bearer ${hooks.tempToken}`,
          })
          .end((err, res) => {
            expect(res.status).toEqual(400);
            done();
          });
      });

      it('should return a 401 without a token', done => {
        superagent.post(`${url}/api/profile/${hooks.tempProfile._id}/pic`)
          .attach('image', hooks.exampleProfilePic.image)
          .end((err, res) => {
            expect(res.status).toEqual(401);
            done();
          });
      });

      it('should return a 404 with improper profile id', done => {
        superagent.post(`${url}/api/profile/5aa837baaaaa3f3e1055ba95/pic`)
          .set({
            Authorization: `Bearer ${hooks.tempToken}`,
          })
          .attach('image', hooks.exampleProfilePic.image)
          .end((err, res) => {
            expect(res.status).toEqual(404);
            done();
          });
      });
    });
  });
});