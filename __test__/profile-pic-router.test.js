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
  beforeAll( done => hooks.createUser(done));
  beforeAll( done => hooks.createProfile(done));
  afterAll( done => hooks.removeDBInfo(done));

  this.tempPic = {};

  describe('POST: /api/profile/:profileId/pic', () => {
    debug('POST: /api/profile/:profileId/pic');

    beforeEach( done => {
      fs.copyFileProm(`${__dirname}/testdata/tester.png`, `${__dirname}/../data/tester.png`)
        .then( () => done())
        .catch(done);
    });

    afterAll( done => {
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
            this.tempPic = res.body;
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

  describe('GET: /api/profilepic/:picId', () => {
    describe('with VALID usage', () => {
      it('should return status 200 with a pic object', done => {
        superagent.get(`${url}/api/profilepic/${this.tempPic._id}`)
          .set({
            Authorization: `Bearer ${hooks.tempToken}`,
          })
          .end((err, res) => {
            if(err) return done(err);
            expect(res.status).toEqual(200);
            expect(res.body).toBeDefined();
            done();
          });
      });
    });

    describe('with INVALID usage', () => {
      it('should respond with a 404 for an ID that is not found', done => {
        superagent.get(`${url}/api/profilepic/123`)
          .set({
            Authorization: `Bearer ${hooks.tempToken}`,
          })
          .end((err, res) => {
            expect(res.status).toEqual(404);
            done();
          });
      });

      it('should respond with a 400 if no ID is provided', done => {
        superagent.get(`${url}/api/profilepic`)
          .set({
            Authorization: `Bearer ${hooks.tempToken}`,
          })
          .end((err, res) => {
            expect(res.status).toEqual(400);
            expect(res.text).toEqual('BadRequestError');
            done();
          });
      });

      it('should repond with a 401 if no token was provided', done => {
        superagent.get(`${url}/api/profilepic/${this.tempPic._id}`)
          .end((err, res) => {
            expect(res.status).toEqual(401);
            expect(res.text).toEqual('UnauthorizedError');
            done();
          });
      });
    });
  });

  describe('DELETE: /api/profilepic/:picId', () => {
    describe('with VALID usage', () => {
      it('should return a 204 status code', done => {
        superagent.delete(`${url}/api/profilepic/${this.tempPic._id}`)
          .set({
            Authorization: `Bearer ${hooks.tempToken}`,
          })
          .end((err, res) => {
            if(err) return done(err);
            expect(res.status).toEqual(204);
            done();
          });
      });
    });

    describe('with INVALID usage', () => {
      it('should return a 400 if no ID is provided', done => {
        superagent.delete(`${url}/api/profilepic`)
          .set({
            Authorization: `Bearer ${hooks.tempToken}`,
          })
          .end((err, res) => {
            expect(res.status).toEqual(400);
            done();
          });
      });

      it('should return a 404 for an ID that is not found', done => {
        superagent.delete(`${url}/api/profilepic/123`)
          .set({
            Authorization: `Bearer ${hooks.tempToken}`,
          })
          .end((err, res) => {
            expect(res.status).toEqual(404);
            done();
          });
      });
    });
  });
});