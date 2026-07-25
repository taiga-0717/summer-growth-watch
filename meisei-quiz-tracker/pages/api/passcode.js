import { KEYS, getJSON, setJSON } from "../../lib/redis";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "method not allowed" });
  }

  const { op } = req.body || {};

  try {
    if (op === "status") {
      const pw = await getJSON(KEYS.passcode);
      return res.status(200).json({ isSet: !!pw });
    }

    if (op === "verify") {
      const { passcode } = req.body || {};
      const pw = await getJSON(KEYS.passcode);
      return res.status(200).json({ ok: !!pw && passcode === pw });
    }

    if (op === "set") {
      const { passcode } = req.body || {};
      if (!passcode || typeof passcode !== "string") {
        return res.status(400).json({ error: "missing passcode" });
      }
      const existing = await getJSON(KEYS.passcode);
      if (existing) {
        return res.status(409).json({ error: "already set" });
      }
      await setJSON(KEYS.passcode, passcode);
      return res.status(200).json({ ok: true });
    }

    if (op === "change") {
      const { current, next } = req.body || {};
      const pw = await getJSON(KEYS.passcode);
      if (!pw || current !== pw) {
        return res.status(403).json({ ok: false, error: "wrong current passcode" });
      }
      if (!next || typeof next !== "string") {
        return res.status(400).json({ error: "missing next passcode" });
      }
      await setJSON(KEYS.passcode, next);
      return res.status(200).json({ ok: true });
    }

    return res.status(400).json({ error: "invalid op" });
  } catch (e) {
    return res.status(500).json({ error: "failed" });
  }
}
