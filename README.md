# eth-load-balancer
Simple Ethereum Load Balancer 

## Features
* [x] Compare multi highest block numbers of nodes
* [x] Load-balancing and limit 70 requests per node
* [ ] Customize limit number of request
* [ ] Multi threads
* [x] Distributed 


## Run
```bash
docker run -p 3000:3000 -e DATABASE=mongodb://192.168.31.230:27017/eth-load-balancer -e NET_ID=1 -e RPC_LIST=https://cloudflare-eth.com,https://cloudflare-eth.com 94tamir/eth-load-balancer
```
### Test Get Balance
```bash
curl -X POST http://localhost:3000 -H 'Content-Type: application/json' -d '{"jsonrpc": "2.0", "method": "eth_getBalance", "params": [ "0xeF8EBd0A6e4a0C8e82EcdfD60ffF82fd346ec448", "latest" ], "id": 2 }'
```
Response
```json
{
    "jsonrpc": "2.0",
    "id": 2,
    "result": "0x16b9be2d56d4673"
}
```

### See Health Info(no healthcheck path)
```bash
curl -X GET http://localhost:3000/health_info 
```
Response
```json
{
    "mongo": true,
    "nodes": [
        {
            "index": 1,
            "ok": true,
            "highestBlock": {
                "number": 8870696,
                "hash": "0x005176707109dabcfd888fb7d0ffb25b909ff1c3cda33afc1861433a955c814e"
            }
        },
        {
            "index": 2,
            "ok": true,
            "highestBlock": {
                "number": 8870696,
                "hash": "0x005176707109dabcfd888fb7d0ffb25b909ff1c3cda33afc1861433a955c814e"
            }
        }
    ]
}
```
