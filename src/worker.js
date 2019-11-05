const _ = require('lodash');
const uuid = require('uuid/v4');
const EventEmitter = require('events');
const config = require('./config')
const emitter = new EventEmitter();
// https://ethereum.stackexchange.com/a/38614
const limit = config.limit
const nodeTasks = {}

emitter.on('TASK_CREATED', checkTask);
emitter.on('TASK_HANDLED', checkTask);

function countHandling (nodeId) {
  return (nodeTasks[nodeId] || [])
    .filter(task => task.status === 'HANDLING')
    .length
}

function dispatch (nodes, body, callback) {
  if (!nodes.length) {
    throw new Error('The service is unavailable')
  }
  const handingTotalArr = nodes
    .map(node => ({ node, total: countHandling(node.id) }))
  let [{ total }] = _.sortBy(handingTotalArr, 'total')

  if (total > limit * 50) {
    callback(new Error('The service is protected, maybe request too many'))
    return
  }

  // dispatch random a node
  const readyNodes = _.filter(handingTotalArr, { total })
  const node = readyNodes[Date.now() % readyNodes.length].node

  const task = {
    id: uuid(),
    nodeId: node.id,
    node,
    body,
    callback,
    // UNHANDLED
    // HANDLING
    status: 'UNHANDLED',
    createdAt: Date.now()
  }
  let tasks = nodeTasks[task.nodeId]
  if (!tasks) tasks = nodeTasks[task.nodeId] = []
  tasks.push(task)

  emitter.emit('TASK_CREATED', task)
}

function finishTask (task) {
  const removedTasks = _.remove(nodeTasks[task.nodeId], { id: task.id })
  if (removedTasks.length) {
    emitter.emit('TASK_HANDLED', task)
    return true
  }
  return false
}

function handleTimeout (task) {
  task.status = 'HANDLING'
  const finished = finishTask(task)
  if (finished) {
    task.callback(new Error('Timeout'))
  }
}

// TODO multi threads
async function handle (task) {
  try {
    task.status = 'HANDLING'
    const { body } = task
    const data = await task.node.request(body)

    finishTask(task) && task.callback(null, data)
  } catch (e) {
    finishTask(task) && task.callback(e)
  }
}

function checkTask () {
  const nodeIds = Object.keys(nodeTasks)
  nodeIds.forEach(nodeId => {
    const limited = countHandling(nodeId) >= limit
    if (limited) return
    const tasks = nodeTasks[nodeId]

    const task = tasks.find(task => task.status === 'UNHANDLED')
    if (!task) return
    handle(task)
  })
}


function checkTimeout () {
  const nodeIds = Object.keys(nodeTasks)
  nodeIds.forEach(nodeId => {
    const tasks = nodeTasks[nodeId]

    const task = tasks
      .find(task => Date.now() - 5 * 1000 > task.createdAt)
    if (!task) return
    handleTimeout(task)
  })
}


function print () {
  const handling = Object.keys(nodeTasks)
    .map(countHandling)
    .reduce((total, item) => total + item, 0)
  console.log(`${Date.now()} Handling ${handling}`)
}

setInterval(checkTimeout, 500)
setInterval(print, 10 * 1000)

exports.dispatch = dispatch
