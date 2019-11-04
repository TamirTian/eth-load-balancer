const Web3 = require('web3')
const uuid = require('uuid/v4')
const axios = require('axios');

class Node {
  constructor (rpc) {
    this.id = uuid()
    this.web3 = new Web3(rpc)
    this.rpc = rpc
    this.lastAccessedTime = 0
  }

  start () {
    const that = this
    that.timer = setInterval(async () => {
      that.highest = await that.web3.eth.getBlock('latest')
      that.lastAccessedTime = Date.now()
    }, 2000)
  }

  getHighest () {
    if (!this.highest) throw new Error('Not ready')
    return this.highest
  }

  async request (body) {
    console.info(`Requesting ${this.rpc}`)
    const { data } = await axios.post(this.rpc, body, {
      headers: { 'Content-Type': 'application/json', },
      timeout: 60 * 1000
    })
    return data
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
