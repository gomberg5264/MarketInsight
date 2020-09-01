/**
 * lib/network/server.js - Websocket server abstraction
 * Copyright (C) 2018  idealwebsolutions
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
**/
const ok = require('assert');
const { EventEmitter } = require('events');
const WebSocketServer = require('simple-websocket/server');
const debug = require('debug')('wss');

const { 
  generateIdentifier, 
  forEach,
  slice,
  isError
} = require('../util');
const { ServerSession } = require('./session');

class Server extends EventEmitter {
  constructor (options) {
    super(options);

    this._wss = null;
    this._sessions = new Map();
    // Bind server
    this.bind(Object.freeze(options));
  }

  get sessions () {
    return this._sessions;
  }
  
  async _handleIncomingConnection (socket) {
    const session = ServerSession.bind(socket);

    let id = 0;
    // Generate new session id
    try {
      const generateIdentifierPromise = generateIdentifier();
      id = await generateIdentifierPromise;
      id = slice(0, 16, id);
      debug(`Created new session id: ${id}`);
    } catch (err) {
      debug(`failed to generate id: ${err}`);
      debug('destroying socket for now');
      return session.destroy();
    }
    // Wait for finish events
    session.once('finish', () => {
      debug('Attempting to delete session');
      // Cleanup session
      debug(!this._sessions.delete(id) ? `failed to remove session(${id})` : `successfully deleted session(${id})`);
    });
    // Add session to sessions
    this._sessions.set(id, session);
    // Emit session
    this.emit('session', session);
    debug('emitting new session');
  }

  // Allow for more readable errors
  _handleError (err) {
    ok(isError(err), 'err is not an error');

    switch (err.code) {
    case 'EACCES':
      this.emit('error', 
        new Error('_handleError: Unable to bind to port. Check permissions?'));
      this.shutdown();
      break;
    case 'EADDRINUSE':
      this.emit('error', new Error('_handleError: Address in use'));
      this.shutdown();
      break;
    default:
      this.emit('error', err);
      break;
    }
  }

  _handleClose () {
    this._session.clear();
    this.removeAllListeners();
    process.exit(0);
  }

  broadcast (message) {
    forEach((session) => session.write(message), this._sessions);
  }
  
  bind (config) {
    ok(!this._wss, 'wss was already initialized');

    this._wss = new WebSocketServer(config); 
    this._wss.on('connection', this._handleIncomingConnection.bind(this));
    this._wss.on('error', this._handleError.bind(this));
    this._wss.once('close', this._handleClose.bind(this));
  }

  shutdown () {
    ok(this.wss, 'wss was not initialized');
    
    this._wss.close();
  }
}

module.exports = Server;
