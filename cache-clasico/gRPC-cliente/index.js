const path = require('path');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const express = require('express');

const packageDefinition = protoLoader.loadSync(path.join(__dirname, '../protos/servicios.proto'));

const proto_path = grpc.loadPackageDefinition(packageDefinition);

const client = new proto_path.Airports('0.0.0.0:50051', grpc.credentials.createInsecure());

const app = express();
app.listen(3000);
console.log(`Listening on port 3000`)

app.get('/airports', (req, res) => {
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


app.get('/airports/:code', (req, res) => {
    console.log('Backend');
    client.getAirport({ code: req.params.code }, (error, response) => {
        if (error) {
            res.status(500).json({ error: error.details });
        }
        else {
            res.json(response);
        }
    });
});