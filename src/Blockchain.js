const crypto = require("crypto");

class Block {

    static get genesis() {
        return new Block(
            0,
            "0",
            1508270000000,
            "Welcome to BChain Demo !",
            crypto
                .createHash("sha256")
                .digest("hex"),
            10
        );
    }

    constructor(index, previousHash, timestamp, data, hash, nonce) {
        this.index = index;
        this.previousHash = previousHash;
        this.timestamp = timestamp;
        this.data = data;
        this.hash = hash;
        this.nonce = nonce;
    }
}

class Blockchain {
    constructor() {
        this.blockchain = [Block.genesis];
        this.difficulty = 1;
    }

    get() {
        return this.blockchain;
    }

    get latestBlock() {
        return this.blockchain[this.blockchain.length - 1];
    }

    isValidHashDifficulty(hash) {
        for (var i = 0; i < hash.length; i++) {
            if (hash[i] !== "0") {
                break;
            }
        }
        return i >= this.difficulty;
    }

    calculateHashForBlock(block) {
        const { index, previousHash, timestamp, data, nonce } = block;
        return this.calculateHash(
            index,
            previousHash,
            timestamp,
            data,
            nonce
        );
    }

    calculateHash(index, previousHash, timestamp, data, nonce) {
        return crypto
            .createHash("sha256")
            .update(index + previousHash + timestamp + data + nonce)
            .digest("hex");
    }

    mine(data) {
        try {
            this.addBlock(this.generateNextBlock(data));
        } catch (err) {
            throw err;
        }
    }

    generateNextBlock(data) {
        const nextIndex = this.latestBlock.index + 1;
        const previousHash = this.latestBlock.hash;

        let timestamp = new Date().getTime();
        let nonce = 0;
        let nextHash = this.calculateHash(
            nextIndex,
            previousHash,
            timestamp,
            data,
            nonce
        );

        while (!this.isValidHashDifficulty(nextHash)) {
            nonce = nonce + 1;
            timestamp = new Date().getTime();
            nextHash = this.calculateHash(
                nextIndex,
                previousHash,
                timestamp,
                data,
                nonce
            );
        }

        const nextBlock = new Block(
            nextIndex,
            previousHash,
            timestamp,
            data,
            nextHash,
            nonce
        );

        return nextBlock;
    }

    addBlock(newBlock) {
        if (this.isValidNextBlock(newBlock, this.latestBlock)) {
            try {
                this.blockchain.push(newBlock);
            } catch (err) {
                throw err;
            }
        } else {
            throw "Error: Invalid block";
        }
    }

    isValidNextBlock(nextBlock, previousBlock) {
        const nextBlockHash = this.calculateHashForBlock(nextBlock);

        if (previousBlock.index + 1 !== nextBlock.index) {
            return false;
        } else if (previousBlock.hash !== nextBlock.previousHash) {
            return false;
        } else if (nextBlockHash !== nextBlock.hash) {
            return false;
        } else if (!this.isValidHashDifficulty(nextBlockHash)) {
            return false;
        } else {
            return true;
        }
    }
}

module.exports = Blockchain
