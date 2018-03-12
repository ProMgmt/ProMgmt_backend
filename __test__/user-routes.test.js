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

  afterEach( done => {
    User.remove({})
      .then( () => done() )
      .catch(done);
  });
  
  describe('POST /api/signup', () => {
    describe('with VALID usage', () => {
      it('should add a user to the database', done => {
        superagent.post(`${url}/api/signup`)
          .send(exampleUser)
          .end((err, res) => {
            expect(res.status).toEqual(200);
            expect(res.body.username).toEqual(exampleUser.username);
            expect(res.body.password).toEqual(exampleUser.password);
            expect(res.body.email).toEqual(exampleUser.email);
            done();
          });
      });
    });

    describe('with INVALID usage', () => {
      it('should respond with a 400 when the request body is incomplete', done => {
        superagent.post('/api/signup')
          .send({ username: exampleUser.username })
          .end((err, res) => {
            expect(res.status).toEqual(400);
            expect(res.text).toEqual('BadRequestError');
            done();
          });
      });

      it('should respond with a 400 if the username is already taken', done => {
        // TODO: add this test and functionality in the routes
      });
    });
  });


  describe('GET /api/signin', () => {
    beforeEach( done => {
      new User(exampleUser).generatePasswordHash(exampleUser.password)
        .then( user => user.save() )
        .then( user => {
          this.tempUser = user;
          done();
        })
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
            // ??? this test the routes, not the actual user creation. might have to rework this.
            done();
          });
      });     
    });

    describe('with INVALID usage', () => {
      it('should return a 404 if the username and password do not exist', done => {
        superagent.get(`${url}/api/signin`)
          .auth('someRandomUsername', `${exampleUser.pasword}`)
          // ??? not sure if this is what auth is for
          .end((err, res) => {
            expect(res.status).toEqual(404);
            expect(res.text).toEqual('NotFoundError');
            done();
          });
      });
    });
  });

  describe('DELETE /api/signin', () => {
    it('should return a 204 when the user has been deleted', done => {
      superagent.delete(`${url}/api/signin/${this.tempUser._id}`)
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