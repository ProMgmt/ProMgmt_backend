'use strict';

const server = require('../server.js');
const serverToggle = require('../lib/toggle.js');
require('jest');

beforeEach(done => serverToggle.serverOn(server, done));

describe('Server Toggle Test', () => {
  it('should turn the server on if the toggle value is false', done => {
    server.isRunning = false;
    server.close(() => {
      serverToggle.serverOn(server, () => {
        expect(server.isRunning).toEqual(true);
        done();
      });
    });
  });

  it('should turn the server off if the toggle value is true', done => {
    serverToggle.serverOff(server, () => {
      expect(server.isRunning).toEqual(false);
      done();
    });
  });
});