require('dotenv').config();
const client = require('./redisClient');

async function testRedis() {
  try {
    await client.set('test', 'hello');
    const value = await client.get('test');
    console.log('Redis test:', value);
  } catch (err) {
    console.error('Redis error:', err);
  }
}

testRedis();
