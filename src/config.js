module.exports = {
  netId: process.env.NET_ID,
  database: process.env.DATABASE,
  port: process.env.PORT || 3000,
  RPCs: process.env.RPC_LIST || '',
  limit: process.env.LIMIT || 70,
}
