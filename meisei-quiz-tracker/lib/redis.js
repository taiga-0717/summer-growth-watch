import Redis from "ioredis";

const globalForRedis = globalThis;

export const redis =
  globalForRedis._redisClient ||
  new Redis(process.env.REDIS_URL, {
    maxRetriesPerRequest: 3,
  });

if (!globalForRedis._redisClient) {
  globalForRedis._redisClient = redis;
}

export const KEYS = {
  roster: "roster",
  results: "results",
  passcode: "teacher-passcode",
};

export async function getJSON(key) {
  const val = await redis.get(key);
  if (val === null || val === undefined) return null;
  try {
    return JSON.parse(val);
  } catch (e) {
    return null;
  }
}

export async function setJSON(key, value) {
  await redis.set(key, JSON.stringify(value));
}
