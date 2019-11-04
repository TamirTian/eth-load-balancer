module.exports = {
  netId: process.env.NET_ID,
  DATABASE: process.env.DATABASE,
  port: process.env.PORT || 3000,
  RPCs: process.env.RPC_LIST || ''
}
