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
              this.handleMessage(payload);
            });

            conn.on("error", err => {
              throw err;
            });
          }
        })
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

  mine(payload) {
    this.blockchain.mine(payload);
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
  }

  addBlock(payload) {
    this.handleMessage(payload);
  }

  handleMessage(payload) {
    const data = Boolean(payload.blockchain) ? payload.blockchain : payload;
    this.blockchain.mine(data);
    this.peers.forEach(peer => this.write(peer, data));
  }
}

module.exports = P2P;
