const path = require('path');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const pg = require('pg');

const packageDefinition = protoLoader.loadSync(path.join(__dirname, '../protos/servicios.proto'));
const proto_path = grpc.loadPackageDefinition(packageDefinition);


const pool = new pg.Pool({
    user: 'user',
    host: '0.0.0.0',
    database: 'tarea1',
    password: 'user',
    port: 5432,
});

function findAirport(call, callback) {
    pool.query('SELECT * FROM AIRPORTS WHERE code = $1', [call.request.code], (error, results) => {
        if (error) {
            callback({
                message: 'Error occurred',
                code: grpc.status.INTERNAL
            });
        }
        else if (results.rows.length > 0) {
            callback(null, results.rows[0]);
        }
        else {
            callback({
                message: 'Degree not found',
                code: grpc.status.INVALID_ARGUMENT
            });
        }
    });
}

function getAllAirports(call, callback) {
    pool.query('SELECT * FROM AIRPORTS', (error, results) => {
        if (error) {
            callback({
                message: 'Error occurred',
                code: grpc.status.INTERNAL
            });
        }
        else {
            callback(null, { airports: results.rows });
        }
    });
}

const server = new grpc.Server();

server.addService(proto_path.Airports.service, { getAirport: findAirport, getAll: getAllAirports});
server.bindAsync('0.0.0.0:50051', grpc.ServerCredentials.createInsecure(), () => {
    server.start();
});