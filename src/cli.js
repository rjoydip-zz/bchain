
const readPkg = require('read-pkg');

const P2P = require("./P2P.js");
const Blockchain = require("./Blockchain.js");
const blockchain = new Blockchain();
const p2p = new P2P(blockchain);

const pkg = readPkg.sync();

class CLI {
  constructor(vorpal) {
    vorpal
      .use(this.welcome)
      .use(this.connectCommand)
      .use(this.blockchainCommand)
      .use(this.peersCommand)
      .use(this.mineCommand)
      .use(this.openCommand)
      .delimiter(`${pkg.name} >>`)
      .show()
  }

  welcome(vorpal) {
    vorpal.log(`Welcome to ${pkg.title} CLI!`);
    vorpal.exec("help");
  }

  connectCommand(vorpal) {
    vorpal
      .command('connect <host> <port>', "Connect to a new peer. Eg: connect localhost 2727")
      .alias('c')
      .action(function (args, callback) {
        if (args.host && args.port) {
          try {
            p2p.connectToPeer(args.host, args.port);
          } catch (err) {
            this.log(err);
          }
        }
        callback();
      })
  }

  blockchainCommand(vorpal) {
    vorpal
      .command('blockchain', 'See the current state of the blockchain.')
      .alias('b')
      .action(function (args, callback) {
        this.log(blockchain)
        callback();
      })
  }

  peersCommand(vorpal) {
    vorpal
      .command('peers', 'Get the list of connected peers.')
      .alias('p')
      .action(function (args, callback) {
        (p2p.peers.length > 0) ? p2p.peers.forEach(peer => {
          this.log(`${peer.pxpPeer.socket._host}`)
        }, this) : this.log(`No peers connected`);
        callback();
      })
  }

  mineCommand(vorpal) {
    vorpal
      .command('mine <data>', 'Mine a new block. Eg: mine hello!')
      .alias('m')
      .action(function (args, callback) {
        if (args.data) {
          p2p.mineAndBroadcast(args.data);
        }
        callback();
      })
  }

  openCommand(vorpal) {
    vorpal
      .command('open <port>', 'Open port to accept incoming connections. Eg: open 2727')
      .alias('o')
      .action(function (args, callback) {
        if (args.port) {
          if (typeof args.port === 'number') {
            p2p.startServer(args.port);
            this.log(`Listening to peers on ${args.port}`);
          } else {
            this.log(`Invalid port!`);
          }
        }
        callback();
      })
  }
}

module.exports = CLI;