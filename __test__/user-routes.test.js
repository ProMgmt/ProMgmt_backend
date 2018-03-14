'use strict';

const superagent = require('superagent');
const server = require('../server.js');
const serverToggle = require('../lib/toggle.js');
const hooks = require('../lib/test-hooks.js');
const PORT = process.env.PORT || 3000;

require('jest');

const url = `http://localhost:${PORT}`;

describe('User Routes', function() {
  beforeAll( done => {
    serverToggle.serverOn(server, done);
  });

  afterAll( done => {
    serverToggle.serverOff(server, done);
  });


  describe('POST /api/signup', () => {
    afterAll( done => {
      hooks.removeDBInfo(done);
    });

    describe('with VALID usage', () => {
      it('should add a user to the database', done => {
        superagent.post(`${url}/api/signup`)
          .send(hooks.exampleUser)
          .end((err, res) => {
            expect(res.status).toEqual(200);
            expect(typeof res.text).toEqual('string');
            done();
          });
      });
    });

    describe('with INVALID usage', () => {
      it('should respond with a 400 when the request body is incomplete', done => {
        superagent.post(`${url}/api/signup`)
          .send({ username: 'something' })
          .end((err, res) => {
            expect(res.status).toEqual(400);
            expect(res.text).toEqual('BadRequestError');
            done();
          });
      });

      it('should respond with a 400 if the username is already taken', done => {
        superagent.post(`${url}/api/signup`)
          .send(hooks.exampleUser)
          .end((err, res) => {
            expect(res.status).toEqual(409);
            expect(res.text).toEqual('ConflictError');
            done();
          });
      });
    });
  });


  describe('GET /api/signin', () => {
    beforeEach( done => {
      hooks.createUser(done);
    });

    afterEach( done => {
      hooks.removeDBInfo(done);
    });

    describe('with VALID usage', () => {
      it('should return a token', done => {
        superagent.get(`${url}/api/signin`)
          .auth(`${hooks.exampleUser.username}`, `${hooks.exampleUser.password}`)
          .end((err, res) => {
            if (err) return done(err);
            expect(res.status).toEqual(200);
            expect(typeof res.text).toEqual('string');
            done();
          });
      });     
    });

    describe('with INVALID usage', () => {
      it('should return a 404 if the username does not exist', done => {
        superagent.get(`${url}/api/signin`)
          .auth('someRandomUsername', `${hooks.exampleUser.password}`)
          .end((err, res) => {
            expect(res.status).toEqual(404);
            expect(res.text).toEqual('NotFoundError');
            done();
          });
      });

      it('should return a 401 if the password is incorrect', done => {
        superagent.get(`${url}/api/signin`)
          .auth(`${hooks.exampleUser.username}`, `9871`)
          .end((err, res) => {
            expect(res.status).toEqual(401);
            expect(res.text).toEqual('UnauthorizedError');
            done();
          });
      });

      it('should respond with a 401 if auth header is missing', done => {
        superagent.get(`${url}/api/signin`)
          .end((err, res) => {
            expect(res.status).toEqual(401);
            done();
          });
      });

      it('should return a 401 if no username in auth', done => {
        superagent.get(`${url}/api/signin`)
          .auth(``, `${hooks.exampleUser.password}`)
          .end((err, res) => {
            expect(res.status).toEqual(401);
            done();
          });
      });

      it('should return a 401 if no password in auth', done => {
        superagent.get(`${url}/api/signin`)
          .auth(`${hooks.exampleUser.username}`, ``)
          .end((err, res) => {
            expect(res.status).toEqual(401);
            done();
          });
      });

      it('should return a 401 if no password or username in auth', done => {
        superagent.get(`${url}/api/signin`)
          .auth(`Basic`)
          .end((err, res) => {
            expect(res.status).toEqual(401);
            done();
          });
      });
    });
  });
          

  describe('DELETE /api/signin', () => {
    beforeEach( done => {
      hooks.createUser(done);
    });

    it('should return a 204 when the user has been deleted', done => {
      superagent.delete(`${url}/api/user/${hooks.tempUser._id}`)
        .set({
          Authorization: `Bearer ${hooks.tempToken}`,
        })
        .end((err, res) => {
          if (err) return done (err);
          expect(res.status).toEqual(204);
          done();
        });
    });

    it('should throw an error when the token is incorrect', done => {
      superagent.delete(`${url}/api/user/${hooks.tempUser._id}`)
        .set({
          Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbiI6ImY0YTY1N2M2MTFjMWIyMzcyYzAxYmEzOWY0NDc1NjllNmQ4ZmNiYmM4NmQ4MGaaaaayMWNlZGE1NTQwMTRkYTUiLCJpYXQiOjE1MjEwNTg0MDB9.MihqcvUVMvBxNfXl-sMCiES4TVvwBQN6JUTgXpNag0I`,
        })
        .end((err, res) => {
          expect(res.status).toEqual(401);
          done();
        });
    });
  });
});

  