// redisClient.js
const { Redis } = require('@upstash/redis');

const client = new Redis({
  url: process.env.UPSTASH_REDIS_URL,
  token: process.env.UPSTASH_REDIS_TOKEN,
});

module.exports = client;

