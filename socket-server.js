const Server = require('socket.io');

class SocketServer {
  constructor (server) {
    this.server = server;
    this.io = new Server(server, {
      pingInterval: 10000,
      pingTimeout: 5000,
    });
    this.initConnections();
  }

  initConnections () {
    this.io.use((socket, next) => {
      // let token = socket.handshake.query.token;
      if (/*isValid(token)*/true) {
        return next();
      }
      return next(new Error('authentication error'));
    });
    
    this.io.on('connection', (client) => {
      // let token = socket.handshake.query.token;
      console.log("connection!");
      setTimeout(() => this.emit('event', {x:1}), 2001);
      
      client.on('disconnect', reason => {
        console.log("disconnect!", reason);
      });

      client.on('message', (name, data) => {
        console.log("message!", name, data);
      });
    });
  }

  emit (name, val) {
    this.io.emit(name, val);
  }
}

module.exports = SocketServer;