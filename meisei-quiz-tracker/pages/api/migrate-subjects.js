import { KEYS, getJSON, setJSON } from "../../lib/redis";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "method not allowed" });
  }

  const { mapping } = req.body || {};
  if (!mapping || typeof mapping !== "object" || Array.isArray(mapping)) {
    return res.status(400).json({ error: "invalid mapping" });
  }

  const pairs = Object.entries(mapping).filter(
    ([from, to]) => typeof from === "string" && typeof to === "string" && from && to && from !== to
  );
  if (pairs.length === 0) {
    return res.status(400).json({ error: "empty mapping" });
  }
  const mapObj = Object.fromEntries(pairs);

  try {
    const results = (await getJSON(KEYS.results)) || {};
    let changedCount = 0;
    const updated = {};
    for (const [studentName, list] of Object.entries(results)) {
      updated[studentName] = list.map((item) => {
        const target = mapObj[item.subject];
        if (target) {
          changedCount++;
          return { ...item, subject: target };
        }
        return item;
      });
    }
    await setJSON(KEYS.results, updated);
    res.status(200).json({ results: updated, changedCount });
  } catch (e) {
    res.status(500).json({ error: "failed" });
  }
}
