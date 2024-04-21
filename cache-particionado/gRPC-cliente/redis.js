const {createClient} = require('redis');

const client1 = createClient({
    host: '0.0.0.0',
    port: 6379
});

const client2 = createClient({
    host: '0.0.0.0',
    port: 6380
});

const client3 = createClient({
    host: '0.0.0.0',
    port: 6381
});

client1.on('error', err => console.log('Redis Client Error', err));

client1.connect();

client2.on('error', err => console.log('Redis Client Error', err));

client2.connect();

client3.on('error', err => console.log('Redis Client Error', err));

client3.connect();

module.exports = {client1,client2,client3};