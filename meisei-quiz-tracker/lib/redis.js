import { Redis } from "@upstash/redis";

// Vercel MarketplaceでRedis(Upstash)を接続すると、
// KV_REST_API_URL / KV_REST_API_TOKEN (または UPSTASH_REDIS_REST_URL / _TOKEN)が
// 自動でVercelの環境変数に設定される。fromEnv()はそのどちらにも対応している。
export const redis = Redis.fromEnv();

export const KEYS = {
  roster: "roster",
  results: "results",
  passcode: "teacher-passcode",
};
