const path = require('path');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const express = require('express');
const {client1,client2,client3} = require('./redis.js');



const packageDefinition = protoLoader.loadSync(path.join(__dirname, '../protos/servicios.proto'));

const proto_path = grpc.loadPackageDefinition(packageDefinition);

const client = new proto_path.Airports('0.0.0.0:50051', grpc.credentials.createInsecure());

function getRedisClient(key) {
    const numClients = 3;
    const hash = key.charCodeAt(0) % numClients;

    switch(hash) {
        case 0:
            console.log('Client 1');
            return client1;
        case 1:
            console.log('Client 2');
            return client2;
        case 2:
            console.log('Client 3');
            return client3;
    }
}

const app = express();
app.listen(3000);
console.log(`Listening on port 3000`)

app.get('/airports', async (req, res) => {
    console.log('Backend');
    client.getAll({}, (error, response) => {
        if (error) {
            res.status(500).json({ error: error.details });
        }
        else {
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