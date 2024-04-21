const path = require('path');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const express = require('express');
const redis = require('redis');

const clientRedis = redis.createClient({
    host: '0.0.0.0',
    port: 6379
});

clientRedis.on('error', err => console.log('Redis Client Error', err));

clientRedis.connect();

const packageDefinition = protoLoader.loadSync(path.join(__dirname, '../protos/servicios.proto'));

const proto_path = grpc.loadPackageDefinition(packageDefinition);

const client = new proto_path.Airports('0.0.0.0:50051', grpc.credentials.createInsecure());

const app = express();
app.listen(3000);
console.log(`Listening on port 3000`)

app.get('/airports', async (req, res) => {
    const cache =  await clientRedis.get('airports');
    if (cache) {
        console.log('Cache');
        res.json(JSON.parse(cache));
        return;
    }
    console.log('Backend');
    client.getAll({}, (error, response) => {
        if (error) {
            res.status(500).json({ error: error.details });
        }
        else {
            clientRedis.set('airports', JSON.stringify(response));
            res.json(response);
        }
    });
});


app.get('/airports/:code', async (req, res) => {
    const cache =  await clientRedis.get(req.params.code);
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
            clientRedis.set(req.params.code, JSON.stringify(response));
            res.json(response);
        }
    });
});