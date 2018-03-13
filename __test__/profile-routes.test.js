'use strict';

const superagent = require('superagent');
const server = require('../server.js');
const serverToggle = require('../lib/toggle.js');
const hooks = require('../lib/test-hooks.js');

const PORT = process.env.PORT || 3000;

require('jest');

const url = `http://localhost:${PORT}`;

describe('Profile Routes', function () {
  beforeAll(done => {
    serverToggle.serverOn(server, done);
  });

  afterAll(done => {
    serverToggle.serverOff(server, done);
  });

  beforeEach(done => {
    hooks.createUser(done);
  });

  afterEach(done => {
    hooks.removeDBInfo(done);
  });

  //POST ROUTE TESTS

  describe('POST: /api/user/:userId/profile', () => {
    describe('with VALID usage', () => {
      it('should return a 200 status code for valid requests', done => {
        superagent.post(`${url}/api/user/${hooks.tempUser._id}/profile`)
          .set({
            Authorization: `Bearer ${hooks.tempToken}`,
          })
          .send(hooks.exampleProfile)   
          .end((err, res) => {
            if (err) return done(err);
            expect(res.status).toEqual(200);
            expect(res.body.desc).toEqual(hooks.exampleProfile.desc.toString());
            expect(res.body.firstName).toEqual(hooks.exampleProfile.firstName.toString());
            expect(res.body.lastName).toEqual(hooks.exampleProfile.lastName.toString());
            done();
          });
      });
    });

    describe('with INVALID usage', () => {
      it('should respond with a 400 if no request body', done => {
        superagent.post(`${url}/api/user/${hooks.tempUser._id}/profile`)
          .set({
            Authorization: `Bearer ${hooks.tempToken}`,

          })
          .end((err, res) => {
            expect(res.status).toEqual(400);
            done();
          });
      });

      it('should return a 401 unauthorized with no token', done => {
        superagent.post(`${url}/api/user/${hooks.tempUser._id}/profile`)
          .send(hooks.exampleProfile)
          .end((err, res) => {
            expect(res.status).toEqual(401);
            done();
          });
      });

      it('should return a 404 if user id not provided', done => {
        superagent.post(`${url}/api/user/profile`)
          .send(hooks.exampleProfile)
          .set({
            Authorization: `Bearer ${hooks.tempToken}`,
          })
          .end((err, res) => {
            expect(res.status).toEqual(404);
            done();
          });
      });

      it('should return a 404 if userId does not exist', done => {
        superagent.post(`${url}/api/user/5aaaaaaaaf1ce7aaaa93f5aa/profile`)
          .send(hooks.exampleProfile)
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


  // GET ROUTE TESTS

  describe('GET /api/profile/:profileId', () => {
    beforeEach(done => {
      hooks.createProfile(done);
    });

    describe('with VALID usage', () => {
      it('should return a 200 status code for valid requests', done => {
        console.log(hooks.tempProfile._id);
        superagent.get(`${url}/api/profile/${hooks.tempProfile._id}`)
          .set({
            Authorization: `Bearer ${hooks.tempToken}`,
          })
          .end((err, res) => {
            if (err) return done(err);
            expect(res.status).toEqual(200);

            expect(res.body.desc).toEqual(hooks.exampleProfile.desc.toString());
            expect(res.body.firstName).toEqual(hooks.exampleProfile.firstName.toString());
            expect(res.body.lastName).toEqual(hooks.exampleProfile.lastName.toString());
            done();
          });
      });
    });

    describe('with INVALID usage', () => {
      it('should respond with a 400 if no ID is provided', done => {
        superagent.get(`${url}/api/profile/`)
          .set({
            Authorization: `Bearer ${hooks.tempToken}`,
          })
          .end((err, res) => {
            expect(res.status).toEqual(400);
            done();
          });
      });

      it('should respond with a 401 if no token was provided', done => {
        superagent.get(`${url}/api/profile/${hooks.tempProfile._id}`)
          .end((err, res) => {
            expect(res.status).toEqual(401);
            done();
          });
      });

      it('should respond with a 404 if an invalid ID is provided', done => {
        superagent.get(`${url}/api/profile/5aa8256daf1ce7aaaa93f5aa`)
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


  // PUT ROUTE TESTS

  describe('PUT /api/profile/:profileId', () => {
    beforeEach(done => {
      hooks.createProfile(done);
    });
  
    describe('with VALID usage', () => {
      it('should return a 200 status code for valid requests', done => {
        console.log(hooks.tempProfile);
        superagent.put(`${url}/api/profile/${hooks.tempProfile._id}`)
          .send(hooks.updatedProfile)
          .set({
            Authorization: `Bearer ${hooks.tempToken}`,
          })
          .end((err, res) => {
            if (err) return done(err);
            expect(res.status).toEqual(200);
            done();
          });
      });
    });

    describe('with INVALID usage', () => {
      it('should respond with a 404 for an ID that is not found', done => {
        superagent.put(`${url}/api/profile/5aa8256daf1ce7aaaa93f5aa`)
          .send(hooks.updatedProfile)
          .set({
            Authorization: `Bearer ${hooks.tempToken}`,
          })
          .end((err, res) => {
            expect(res.status).toEqual(404);
            done();
          });
      });

      it('should respond with a 400 if no request body provided', done => {
        superagent.put(`${url}/api/profile/${hooks.tempProfile._id}`)
          .set({
            Authorization: `Bearer ${hooks.tempToken}`,
          })
          .end((err, res) => {
            expect(res.status).toEqual(400);
            done();
          });
      });

      it('should respond with a 401 if no token was provided', done => {
        superagent.put(`${url}/api/profile/${hooks.tempProfile._id}`)
          .send(hooks.updatedProfile)
          .end((err, res) => {
            expect(res.status).toEqual(401);
            done();
          });
      });
    });
  });


  // DELETE ROUTE TESTS

  describe('DELETE /api/profile/:profileId', () => {
    beforeEach(done => {
      hooks.createProfile(done);
    });

    describe('with VALID usage', () => {
      it('should return a 204 when item has been deleted', done => {
        console.log('pro id:', hooks.tempProfile._id);
        superagent.delete(`${url}/api/profile/${hooks.tempProfile._id}`)
          .set({
            Authorization: `Bearer ${hooks.tempToken}`,
          })
          .end((err, res) => {
            if (err) return done(err);
            expect(res.status).toEqual(204);
            done();
          });
      });
    });
      
    describe('with INVALID usage', () => {
      it('should throw a 401 if token not provided', done => {
        superagent.delete(`${url}/api/profile/${hooks.tempProfile._id}`)
          .end((err, res) => {
            expect(res.status).toEqual(401);
            done();
          });
      });
    });
  });
});