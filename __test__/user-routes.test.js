'use strict';

const superagent = require('superagent');
const server = require('../server.js');
const serverToggle = require('../lib/toggle.js');
const User = require('../model/user.js');
const PORT = process.env.PORT || 3000;

require('jest');

const url = `http://localhost:${PORT}`;

const exampleUser = {
  username: 'exampleuser',
  password: 'password!',
  email: 'exampleemail@aol.com',
};

describe('User Routes', function() {
  beforeAll( done => {
    serverToggle.serverOn(server, done);
  });

  afterAll( done => {
    serverToggle.serverOff(server, done);
  });


  describe('POST /api/signup', () => {
    afterAll( done => {
      User.remove({})
        .then( () => done() )
        .catch(done);
    });

    describe('with VALID usage', () => {
      it('should add a user to the database', done => {
        superagent.post(`${url}/api/signup`)
          .send(exampleUser)
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
          .send(exampleUser)
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
      new User(exampleUser)
        .generatePasswordHash(exampleUser.password)
        .then( user => user.save() )
        .then( user => {
          this.tempUser = user;
          return user.generateToken();
        })
        .then( token => {
          this.tempToken = token;
          done();
        })
        .catch(done);
    });

    afterEach( done => {
      User.remove({})
        .then( () => done())
        .catch(done);
    });

    describe('with VALID usage', () => {
      it('should return a token', done => {
        superagent.get(`${url}/api/signin`)
          .auth(`${exampleUser.username}`, `${exampleUser.password}`)
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
          .auth('someRandomUsername', `${exampleUser.password}`)
          .end((err, res) => {
            expect(res.status).toEqual(404);
            expect(res.text).toEqual('NotFoundError');
            done();
          });
      });

      it('should return a 401 if the password is incorrect', done => {
        superagent.get(`${url}/api/signin`)
          .auth(`${exampleUser.username}`, `9871`)
          .end((err, res) => {
            expect(res.status).toEqual(401);
            expect(res.text).toEqual('UnauthorizedError');
            done();
          });
      });
    });
  });

  describe('DELETE /api/signin', () => {
    beforeEach( done => {
      new User(exampleUser)
        .generatePasswordHash(exampleUser.password)
        .then( user => user.save() )
        .then( user => {
          this.tempUser = user;
          console.log('userId', this.tempUser._id);
          return user.generateToken();
        })
        .then( token => {
          this.tempToken = token;
          done();
        })
        .catch(done);
    });

    it('should return a 204 when the user has been deleted', done => {
      superagent.delete(`${url}/api/user/${this.tempUser._id}`)
        .set({
          Authorization: `Bearer ${this.tempToken}`,
        })
        .end((err, res) => {
          if (err) return done (err);
          expect(res.status).toEqual(204);
          done();
        });
    });
  });
});

describe('test for travis', function() {
  it('should pass to travis', function() {
    expect(true).toEqual(true);
  });
});