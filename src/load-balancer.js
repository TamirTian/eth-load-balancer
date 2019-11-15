const assert = require('assert')
const Node = require('./node')
const { dispatch } = require('./worker')
const CurrentHighest = require('./current-highest')
const _ = require('lodash')
const caller = require('./simple-eth-caller')
let globalNodes = []

async function validateNetIds (netId, RPCs) {
  assert(netId, `Invalid netId: ${netId}`)
  const nets = await Promise.all(
    RPCs.map(async rpc => ({
      id: await caller.getNetId(rpc),
      rpc
    }))
  )

  const invalidNets = nets.filter(net => (netId | 0) !== net.id)
  if (invalidNets.length)
    throw new Error(`Invalid nets ${JSON.stringify(invalidNets)}`)
}

function getHighest () {
  const highest = CurrentHighest.get()
  return Math.max(highest - 6, -1)
}

function getAvailableNodes (nodes) {
  if (!CurrentHighest.isOK()) return []

  return nodes.filter(node => node.isOK(getHighest()))
}

function forward (data) {
  const availableNodes = getAvailableNodes(globalNodes)

  return new Promise((resolve, reject) => {
    dispatch(availableNodes, data, (err, data) => {
      if (err) return reject(err)
      resolve(data)
    })
  })
}

async function init (netId, RPCs) {
  await validateNetIds(netId, RPCs)
  globalNodes = RPCs.map(rpc => new Node(rpc))
  globalNodes.forEach(node => node.start())
}

function healthInfo () {
  let index = 0
  return globalNodes.map(node => {
    const ok = node.isOK(getHighest())
    const block = ok ? node.getHighest() : {}
    return {
      index: ++index,
      id: node.id,
      ok,
      highestBlock: ok ? { number: block.number, hash: block.hash } : null
    }
  })
}

setInterval(() => {
  const blocks = globalNodes
    .filter(node => node.isOK(-1))
    .map(node => node.getHighest())

  const [block] = _.sortBy(blocks, ['number'], 'desc')
  if (!block) return
  CurrentHighest.set(block.number)
}, 3000)

module.exports = {
  forward,
  init,
  healthInfo
}
