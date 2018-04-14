'use strict';

'use strict';

const superagent = require('superagent');
const server = require('../server.js');
const serverToggle = require('../lib/toggle.js');
const hooks = require('../lib/test-hooks.js');
const PORT = process.env.PORT || 3000;

require('jest');

const url = `http://localhost:${PORT}`;

describe('Org Routes', function() {
  beforeAll( done => {
    serverToggle.serverOn(server, done);
  });

  afterAll( done => {
    serverToggle.serverOff(server, done);
  });

  afterEach( done => {
    hooks.removeDBInfo(done);
  });

  describe('POST /api/org', () => {
    beforeEach( done => {
      hooks.createUser(done);
    });

    describe('with VALID usage', () => {
      it('should return a 200 status code for valid requests', done => {
        superagent.post(`${url}/api/org`)
          .send(hooks.exampleOrg)
          .set({
            Authorization: `Bearer ${hooks.tempToken}`,
          })
          .end((err, res) => {
            console.log('res.body', res.body);
            if(err) return done(err);
            expect(res.status).toEqual(200);
            expect(res.body.name).toEqual(hooks.exampleOrg.name);
            expect(res.body.desc).toEqual(hooks.exampleOrg.desc);
            done();
          });
      });
    });



    describe('with INVALID usage', () => {
      it('should respond with a 400 if the request body is invalid', done => {
        superagent.post(`${url}/api/org`)
          .send({})
          .set({
            Authorization: `Bearer ${hooks.tempToken}`,
          })
          .end((err, res) => {
            expect(res.status).toEqual(400);
            expect(err.message).toEqual('Bad Request');
            done();
          });
      });
    });
  });
        

  describe('GET /api/org/:orgId', () => {
    beforeEach( done => {
      hooks.createUser(done);
    });

    beforeEach( done => {
      hooks.createOrg(done);
    });

    afterEach( () => {
      delete hooks.exampleOrg.userID;
    });

    describe('with VALID usage', () => {
      it('should return a 200 status code for valid requests', done => {
        superagent.get(`${url}/api/org/${hooks.tempOrg._id}`)
          .set({
            Authorization: `Bearer ${hooks.tempToken}`,
          })
          .end((err, res) => {
            if(err) return done(err);
            expect(res.status).toEqual(200);
            expect(res.body.name).toEqual(hooks.exampleOrg.name);
            expect(res.body.desc).toEqual(hooks.exampleOrg.desc);
            done();
          });
      });
    });

    describe('with invalid usage', () => {
      it('should respond with a 404 for an ID that is not found', done => {
        superagent.get(`${url}/api/org/5aa8256daf1ce7aaaa93f5aa`)
          .set({
            Authorization: `Bearer ${hooks.tempToken}`,
          })
          .end((err, res) => {
            expect(res.status).toEqual(404);
            expect(err.message).toEqual('Not Found');
            done();
          });
        
      });

      it('should respond with a 401 if no token was provided', done => {
        superagent.get(`${url}/api/org/${hooks.tempOrg._id}`)
          .set({
            Authorization: `Bearer `,
          })
          .end((err, res) => {
            expect(res.status).toEqual(401);
            expect(err.message).toEqual('Unauthorized');
            done();
          });
      });  

      it('should respond with a 400 if no ID was provided', done => {
        superagent.get(`${url}/api/org`)
          .set({
            Authorization: `Bearer ${hooks.tempToken}`,
          })
          .end((err, res) => {
            expect(res.status).toEqual(400);
            done();
          });
      });
    });
  });

  describe('PUT /api/org/:orgId', () => {
    beforeEach( done => {
      hooks.createUser(done);
    });

    beforeEach( done => {
      hooks.createOrg(done);
    });

    afterEach( () => {
      delete hooks.exampleOrg.userID;
    });
    describe('with VALID usage', () => {
      it('should return a 200 status code for valid requests', done => {
        superagent.put(`${url}/api/org/${hooks.tempOrg._id}`)
          .send(hooks.updateOrg)
          .set({
            Authorization: `Bearer ${hooks.tempToken}`,
          })
          .end((err, res) => {
            if(err) return done(err);
            expect(res.status).toEqual(200);
            expect(res.body.name).toEqual(hooks.updateOrg.name);
            expect(res.body.desc).toEqual(hooks.updateOrg.desc);
            done();
          });
      });
    });

    describe('with INVALID usage', () => {
      it('should respond with a 404 for an ID that is not found', done => {
        superagent.put(`${url}/org/5aa837b0f95a3f3eaaaaaa95`)
          .send(hooks.updateOrg)
          .set({
            Authorization: `Bearer ${hooks.tempToken}`,
          })
          .end((err, res) => {
            expect(res.status).toEqual(404);
            expect(err.message).toEqual('Not Found');
            done();
          });
      });

      it('should respond with a 400 if no body is provided', done => {
        superagent.put(`${url}/api/org/${hooks.tempOrg._id}`)
          .send({})
          .set({
            Authorization: `Bearer ${hooks.tempToken}`,
          })
          .end((err, res) => {
            expect(res.status).toEqual(400);
            expect(err.message).toEqual('Bad Request');
            done();
          });
      });

      it('should respond with a 401 if no token was provided', done => {
        superagent.put(`${url}/api/org/${hooks.tempOrg._id}`)
          .send(hooks.updateOrg)
          .set({
            Authorization: ``,
          })
          .end((err, res) => {
            expect(res.status).toEqual(401);
            expect(err.message).toEqual('Unauthorized');
            done();
          });
      });  
    });
  });

  describe.only('GET /api/org/user/me', () => {
    beforeEach( done => {
      hooks.createUser(done);
    });

    beforeEach( done => {
      hooks.createOrg(done);
    });

    beforeEach( done => {
      hooks.createProject(done);
    });

    afterEach( () => {
      delete hooks.exampleOrg.userID;
    });

    describe('with VALID usage', () => {
      it('should return a 200 status code for valid requests', done => {
        superagent.get(`${url}/api/org/user/me`)
          .set({
            Authorization: `Bearer ${hooks.tempToken}`,
          })
          .end((err, res) => {
            console.log('hooks.tempProject', hooks.tempProject);
            console.log('res.body', res.body);
            if(err) return done(err);
            expect(res.status).toEqual(200);
            done();
          });
      });
    });
  });

  describe('DELETE /api/org/:orgId', () => {
    beforeEach( done => {
      hooks.createUser(done);
    });

    beforeEach( done => {
      hooks.createOrg(done);
    });

    afterEach( () => {
      delete hooks.tempUser.userID;
    });

    describe('with VALID usage', () => {
      it('should return a 204 when item has been deleted', done => {
        superagent.delete(`${url}/api/org/${hooks.tempOrg._id}`)
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
  });
});