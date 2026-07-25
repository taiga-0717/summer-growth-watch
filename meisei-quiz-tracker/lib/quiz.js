export const PASS_THRESHOLD = 0.9;

export function judgePass(score, max) {
  if (!max || max <= 0) return false;
  return score / max >= PASS_THRESHOLD;
}

export function scoreRate(entry) {
  return entry.max > 0 ? (entry.score / entry.max) * 100 : 0;
}

export function fmtDate(d) {
  const dt = new Date(d);
  if (isNaN(dt)) return d;
  return `${dt.getMonth() + 1}/${dt.getDate()}`;
}

export function todayStr() {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}
