const axios = require('axios')
const BN = require('bn.js')

async function getNetId (rpc) {
  const { data } = await axios.post(rpc, { "jsonrpc": "2.0", "method": "net_version", "params": [], "id": 1 })
  if (!data.result) throw new Error(JSON.stringify(data))
  return parseInt(data.result)
}

async function getHighest (rpc) {
  const { data } = await axios.post(rpc, {
    "jsonrpc": "2.0",
    "method": "eth_getBlockByNumber",
    "params": ["latest", true],
    "id": 1
  })

  if (!data.result) throw new Error(JSON.stringify(data))
  const hex = data.result.number
  if (!hex.startsWith('0x')) throw Error('Invalid number' + hex)
  return {
    number: parseInt(new BN(hex.slice(2), 16).toString()),
    hash: data.result.hash
  }
}

module.exports = {
  getHighest,
  getNetId
}
