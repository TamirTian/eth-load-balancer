const Koa = require('koa')
const bodyParser = require('koa-bodyparser')
const LoadBalancer = require('./load-balancer')
const CurrentHighest = require('./current-highest')
const app = new Koa();
const config = require('./config')
app.use(bodyParser());

app.use(async ctx => {
  const method = ctx.method.toUpperCase()
  if (method === 'GET') {
    if (ctx.request.path === '/healthcheck') {
      const ok = [CurrentHighest.isOK(), LoadBalancer.healthInfo().map(item => item.ok).some(Boolean)].every(Boolean)
      ctx.status = ok ? 200 : 503
    }
    if (ctx.request.path === '/health_info') {
      ctx.body = {
        mongo: CurrentHighest.isOK(),
        nodes: LoadBalancer.healthInfo()
      }
    }
    return
  }
  if (method !== 'POST') return ctx.status = 200
  const { body } = ctx.request
  try {
    ctx.body = await LoadBalancer.forward(body);
  } catch (e) {
    console.warn(e)
    ctx.status = 200
    ctx.body = {
      "jsonrpc": "2.0",
      "error": { "code": -32603, "message": e.message || 'Unknown error' },
      "id": body.id || 1
    }
  }
})


async function start () {
  try {
    await LoadBalancer.init(config.netId, config.RPCs.split(',').filter(Boolean))
    app.listen(config.port, () => console.log('Listening on ' + config.port))
  } catch (e) {
    console.error(e)
    process.exit(1)
  }
}

start()

process.on('SIGINT', function () {
  process.exit();
})
