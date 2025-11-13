const { createClient } = require('redis');

const client = createClient({
    url: 'redis://:hej@172.29.88.168:6379'
});

client.on('error', (err) => {
    console.error('redis connection error', err);
});


async function connectRedis() {
    if (!client.isOpen) {
        await client.connect()

    
    }
}

module.exports = { 
    client,
    connectRedis
};