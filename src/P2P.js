const wrtc = require("wrtc");
const Exchange = require("peer-exchange");
const net = require("net");
const readPkg = require('read-pkg');

const pkg = readPkg.sync();
const p2p = new Exchange(`${pkg.name}`, { wrtc: wrtc });

class P2P {
  constructor(blockchain) {
    this.peers = [];
    this.blockchain = blockchain;
  }

  startServer(port) {
    const server = net
      .createServer(socket =>
        p2p.accept(socket, (err, conn) => {
          if (err) {
            throw err;
          } else {
            conn.on("data", data => {
              const payload = JSON.parse(data.toString("utf8"));
              this.handleMessage(conn, payload);
            });
            conn.on("error", err => {
              throw err;
            });
          }
        });
      ).listen(port);
  }

  connectToPeer(host, port) {
    const socket = net.connect(port, host);
    p2p.connect(socket, (err, conn) => {
      if (err) {
        throw err;
      } else {
        this.initConnection(conn);
      }
    })
  }

  mineAndBroadcast(payload) {
    this.blockchain.mine(payload);
    this.broadcast(this.blockchain.latestBlock);
  }

  broadcast(payload) {
    this.peers.forEach(peer => this.write(peer, payload));
  }

  write(peer, payload) {
    peer.write(JSON.stringify(payload));
  }

  initConnection(connection) {
    if (this.peers.length === 0) {
      this.peers.push(connection);
    } else {
      if (!this.peers.indexOf(connection)) {
        this.peers.push(connection);
      }
    }
    this.write(connection, this.blockchain);
  }

  handleMessage(peer, payload) {
    const receivedBlock = Boolean(payload.blockchain) ? payload.blockchain : payload;
    const latestBlock = this.blockchain.latestBlock;

    if (latestBlock.hash === receivedBlock.previousHash) {
      try {
        this.blockchain.addBlock(receivedBlock);
      } catch (err) {
        throw err;
      }
    } else if (receivedBlock.index > latestBlock.index) {
      this.blockchain.replaceChain(receivedBlock);
    } else {
      // Do nothing.
    }
  }
}

module.exports = P2P;
