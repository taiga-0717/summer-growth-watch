import { redis, KEYS } from "../../lib/redis";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "method not allowed" });
  }

  const { action, name } = req.body || {};
  if (!name || typeof name !== "string" || !name.trim() || name.length > 60) {
    return res.status(400).json({ error: "invalid name" });
  }
  const trimmed = name.trim();

  try {
    const roster = (await redis.get(KEYS.roster)) || [];

    if (action === "add") {
      if (roster.includes(trimmed)) {
        return res.status(409).json({ error: "duplicate", roster });
      }
      const updated = [...roster, trimmed].sort((a, b) => a.localeCompare(b, "ja"));
      await redis.set(KEYS.roster, updated);
      return res.status(200).json({ roster: updated });
    }

    if (action === "remove") {
      const updated = roster.filter((n) => n !== trimmed);
      await redis.set(KEYS.roster, updated);
      return res.status(200).json({ roster: updated });
    }

    return res.status(400).json({ error: "invalid action" });
  } catch (e) {
    return res.status(500).json({ error: "failed" });
  }
}
