const { createClient } = require('redis');

const client = createClient({
    url: 'redis://localhost:6379'
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