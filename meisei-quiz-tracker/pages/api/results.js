import { redis, KEYS } from "../../lib/redis";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "method not allowed" });
  }

  const { studentName, entry } = req.body || {};
  if (!studentName || typeof studentName !== "string" || !entry) {
    return res.status(400).json({ error: "invalid request" });
  }
  const { date, subject, max, score } = entry;
  if (
    !date ||
    !subject ||
    typeof subject !== "string" ||
    typeof max !== "number" ||
    typeof score !== "number" ||
    !(max > 0) ||
    score < 0 ||
    score > max
  ) {
    return res.status(400).json({ error: "invalid entry" });
  }

  try {
    const results = (await redis.get(KEYS.results)) || {};
    const list = results[studentName] || [];
    const newEntry = {
      id: `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      date,
      subject: subject.trim(),
      max,
      score,
      ts: Date.now(),
    };
    const updated = { ...results, [studentName]: [...list, newEntry] };
    await redis.set(KEYS.results, updated);
    res.status(200).json({ results: updated });
  } catch (e) {
    res.status(500).json({ error: "failed" });
  }
}
