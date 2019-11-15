const uuid = require('uuid/v4')
const axios = require('axios');
const caller = require('./simple-eth-caller');

class Node {
  constructor (rpc) {
    this.id = uuid()
    this.rpc = rpc
    this.lastAccessedTime = 0
  }

  start () {
    const that = this
    that.timer = setInterval(async () => {
      that.highest = await caller.getHighest(this.rpc)
      that.lastAccessedTime = Date.now()
    }, 2000)
  }

  getHighest () {
    if (!this.highest) throw new Error('Not ready')
    return this.highest
  }

  request (body) {
    return caller.request(this.rpc, body)
  }

  isOK (gteBlockNumber) {
    const httpOK = this.lastAccessedTime > (Date.now() - 20 * 1000)
    const highestOK = !!this.highest && this.highest.number >= gteBlockNumber
    return httpOK && highestOK
  }

  stop () {
    if (this.timer) clearInterval(this.timer)
  }
}

module.exports = Node
