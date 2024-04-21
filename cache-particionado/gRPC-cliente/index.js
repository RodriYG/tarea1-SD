const path = require('path');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const express = require('express');
const {client1,client2,client3} = require('./redis.js');
const responseTime = require('response-time');



const packageDefinition = protoLoader.loadSync(path.join(__dirname, '../protos/servicios.proto'));

const proto_path = grpc.loadPackageDefinition(packageDefinition);

const client = new proto_path.Airports('0.0.0.0:50051', grpc.credentials.createInsecure());

function getRedisClient(key) {
    const numClients = 3;
    const hash = key.charCodeAt(0) % numClients;

    if (hash == 0) {
        console.log('Client 1');
        return client1;
    }
    if (hash == 1) {
        console.log('Client 2');
        return client2;
    }
    if (hash == 2) {
        console.log('Client 3');
        return client3;
    }
}

const app = express();
app.listen(3000);
app.use(responseTime());
console.log(`Listening on port 3000`)

app.get('/airports', async (req, res) => {
    const cache1 =  await client1.get('airports');
    const cache2 =  await client2.get('airports');
    const cache3 =  await client3.get('airports');

    if (cache1 && cache2 && cache3) {
        console.log('Cache');
        let data = Object.assign({}, JSON.parse(cache1), JSON.parse(cache2), JSON.parse(cache3));
        res.json(JSON.parse(cache1));
        return;
    }
    console.log('Backend');
    client.getAll({}, (error, response) => {
        if (error) {
            res.status(500).json({ error: error.details });
        }
        else {
            client1.set('airports', JSON.stringify(response));
            client2.set('airports', JSON.stringify(response));
            client3.set('airports', JSON.stringify(response));
            res.json(response);
        }
    });
});


app.get('/airports/:code', async (req, res) => {
    const redisClient = getRedisClient(req.params.code);
    const cache =  await redisClient.get(req.params.code);
    if (cache) {
        console.log('Cache');
        res.json(JSON.parse(cache));
        return;
    }
    console.log('Backend');
    client.getAirport({ code: req.params.code }, (error, response) => {
        if (error) {
            res.status(500).json({ error: error.details });
        }
        else {
            redisClient.set(req.params.code, JSON.stringify(response));
            res.json(response);
        }
    });
});