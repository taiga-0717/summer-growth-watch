import { redis, KEYS } from "../../lib/redis";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "method not allowed" });
  }
  try {
    const [roster, results] = await Promise.all([
      redis.get(KEYS.roster),
      redis.get(KEYS.results),
    ]);
    res.status(200).json({ roster: roster || [], results: results || {} });
  } catch (e) {
    res.status(500).json({ error: "failed to load data" });
  }
}
