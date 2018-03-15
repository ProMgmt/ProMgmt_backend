'use strict';

const server = require('../server.js');
require('jest');


describe('Server Toggle Test', () => {
  it('should do nothing if the server is off and toggle off is called', done => {
    server.serverOff(() => {
      expect(server.isRunning).toEqual(false);
      done();
    });
  });

  it('should turn the server on if the toggle value is false', done => {
    server.serverOn(() => {
      expect(server.isRunning).toEqual(true);
      done();
    });
  });

  it('should do nothing if the toggle is turned on and the server is already on', done => {
    server.serverOn(() => {
      expect(server.isRunning).toEqual(true);
      done();
    });
  });

  it('should turn the server off if the toggle value is true', done => {
    server.serverOff(() => {
      expect(server.isRunning).toEqual(false);
      done();
    });
  });
});