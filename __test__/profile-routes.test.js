'use strict';

const superagent = require('superagent');
const server = require('../server.js');
const serverToggle = require('../lib/toggle.js');
const User = require('../model/user.js');
const Profile = require('../model/profile.js');
const PORT = process.env.PORT || 3000;

require('jest');

const url = `http://localhost:${PORT}`;

const exampleUser = {
  username: 'example username',
  password: 'example password',
  email: 'exampleemail@test.com',
}

const exampleProfile = {
  firstName: 'example first name', 
  lastName: 'example last name', 
  desc: 'example description',
}

describe('Profile Routes', function() {
  beforeAll( done => {
    serverToggle.serverOn(server, done);
  });

  afterAll( done => {
    serverToggle.serverOff(server, done);
  });


  //POST ROUTE TESTS

  describe('POST: /api/user/:userId/profile', () => {
   
    beforeEach( done => {
      let user = new User(exampleUser)
      user.generatePasswordHash(exampleUser.password)
        .then( user => user.save())
        .then( user => {
          this.tempUser = user;
          return user.generateToken()
        })
        .then( token => {
          this.tempToken = token;
          done();
        })
        .catch(done);
    });
    
    afterEach( done => {
      User.remove({})
        .then( () => done()) //NEEDS TO BE CHANGED WHEN WE START INSTANTIATING REAL USERS
        .catch(done);
    });

    afterEach( done => {
      Profile.remove({}) //NEEDS TO BE CHANGED WHEN WE START INSTANTIATING REAL PROFILES
        .then( () => done())
        .catch(done);
    });

    describe('with VALID usage', () => {
      it('should return a 200 status code for valid requests', done => {
        superagent.post(`${url}/api/user/${this.tempUser._id}/profile`)
        .send(exampleProfile)
        .set({
          Authorization: `Bearer ${this.tempToken}`
        })
        .end((err, res) => {
          if(err) return done(err);
          expect(res.status).toEqual(200);
          expect(res.body.desc).toEqual(exampleProfile.desc);
          expect(res.body.firstName).toEqual(exampleProfile.firstName);
          expect(res.body.lastName).toEqual(exampleProfile.lastName);
          done();
        });
      });
    });

    describe('with INVALID usage', () => {
      it('should respond with a 400 if the request body is invalid', done => {
        superagent.post(`${url}/api/user/${this.tempUser._id}/profile`)
        .set({
          Authorization: `Bearer ${this.tempToken}`
        })
        .end((err, res) => {
          expect(res.status).toEqual(400);
          done();
        });
      });

      it('should return a 401 unauthorized', done => {
        superagent.post(`${url}/api/user/${this.tempUser._id}/profile`)
        .send(exampleProfile)
        .end((err, res) => {
          expect(res.status).toEqual(401);
          done();
        });
      });


      //test not passing
      it('should return a 404 for invalid user id provided', done => {
        superagent.post(`${url}/api/user/123/profile`)
        .send(exampleProfile)
        .set({ 
          Authorization: `Bearer ${this.tempToken}`
        })
        .end((err, res) => {
          console.log(this.tempUser);
          expect(res.status).toEqual(404);
          done();
        });
      });
    });
  });


  // GET ROUTE TESTS

  describe('GET /api/profile/:profileId', () => {
    beforeEach( done => {
      let user = new User(exampleUser)
      user.generatePasswordHash(exampleUser.password)
        .then( user => user.save())
        .then( user => {
          this.tempUser = user;
          return user.generateToken()
        })
        .then( token => {
          this.tempToken = token;
          done();
        })
        .catch(done);
    });

    beforeEach( done => {
      exampleProfile.userId = this.tempUser._id;
      new Profile(exampleProfile).save()
        .then( profile => {
          this.tempProfile = profile;
          done();
        })
        .catch(done)
      });

      afterEach( done => {
        User.remove({})
          .then( () => done()) //NEEDS TO BE CHANGED WHEN WE START INSTANTIATING REAL USERS
          .catch(done);
      });
  
      afterEach( done => {
        Profile.remove({}) //NEEDS TO BE CHANGED WHEN WE START INSTANTIATING REAL PROFILES
          .then( () => done())
          .catch(done);
      });

    describe('with VALID usage', () => {
      it('should return a 200 status code for valid requests', done => {
        superagent.get(`${url}/api/profile/${this.tempProfile._id}`)

        .set({
          Authorization: `Bearer ${this.tempToken}`
        })
        .end((err, res) => {
          if (err) return done(err);
          expect(res.status).toEqual(200);
          done();
        })
      });
    });

    describe('with invalid usage', () => {
      it.only('should respond with a 404 for an ID that is not found', done => {
        superagent.get(`${url}/api/profile/123`)
        .set({
          Authorization: `Bearer ${this.tempToken}`
        })
        .end((err, res) => {
          expect(res.status).toEqual(404);
          done();
        });
      });

      it('should respond with a 400 if no ID is provided', done => {
        // TODO: add test
        done();
      });

      it('should respond with a 401 if no token was provided', done => {
        // TODO: add test
        done();
      });  
    });
  });


  // PUT ROUTE TESTS

  describe('PUT /api/profile/:profileId', () => {
    describe('with VALID usage', () => {
      it('should return a 200 status code for valid requests', done => {
        // TODO: add test
        done();
      });
    });

    describe('with INVALID usage', () => {
      it('should respond with a 404 for an ID that is not found', () => {
        // TODO: add test
        done();
      });

      it('should respond with a 400 if no ID is provided', done => {
        // TODO: add test
        done();
      });

      it('should respond with a 401 if no token was provided', done => {
        // TODO: add test
        done();
      });  
    });
  });


  // DELETE ROUTE TESTS

  describe('DELETE /api/profile/:profileId', () => {
    describe('with VALID usage', () => {
      it('should return a 204 when item has been deleted', done => {
        // TODO: add test
        done();
      });
    });
  });
});