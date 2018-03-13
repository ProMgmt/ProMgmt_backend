'use strict';

const superagent = require('superagent');
const debug = require('debug')('promgmt:profile-pic-router-test');
const server = require('../server.js');
const serverToggle = require('../lib/toggle.js');
const PORT = process.env.PORT || 3000;

const ProfilePic = require('../model/profile-pic.js');
const User = require('../model/user.js');
const Profile = require('../model/profile.js');

require('jest');

const url = `http://localhost:${PORT}`;

const exampleUser = {
  username: 'example username',
  password: 'example password',
  email: 'exampleemail@test.com',
};

const exampleProfile = {
  firstName: 'example first name', 
  lastName: 'example last name', 
  desc: 'example description',
};

const exampleProfilePic = {
  image: `${__dirname}/../data/tester.png`,
};

describe('Profile Picture Routes', function() {
  beforeAll( done => {
    serverToggle.serverOn(server, done);
  });
  
  afterAll( done => {
    serverToggle.serverOff(server, done);
  });

  afterEach( done => {
    Promise.all([
      ProfilePic.remove({}),
      User.remove({}),
      Profile.remove({}),
    ])
      .then( () => done())
      .catch(done);
  });

  describe('POST: /api/profile/:profileId/pic', () => {
    describe('with a valid token and data', () => {
      beforeEach( done => {
        new User(exampleUser)
          .generatePasswordHash(exampleUser.password)
          .then( user => user.save())
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

      beforeEach( done => {
        exampleProfile.userId = this.tempUser._id.toString();
        new Profile(exampleProfile).save()
          .then( profile => {
            this.tempProfile = profile;
            done();
          })
          .catch(done);
      });

      afterEach( done => {
        delete exampleProfile.userId;
        done();
      });

      it('should return an object containing our profile picture url', done => {
        debug('POST: /api/profile/:profileId/pic');

        superagent.post(`${url}/api/profile/${this.tempProfile._id}/pic`)
          .set({
            Authorization: `Bearer ${this.tempToken}`,
          })
          .attach('image', exampleProfilePic.image)
          .end((err, res) => {
            expect(res.status).toEqual(200);
            expect(res.body.profileId).toEqual(this.tempProfile._id.toString());
            done();
          });
      });
    });
  });
});