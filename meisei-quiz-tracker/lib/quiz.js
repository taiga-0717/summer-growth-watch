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

// テストの「日付」を基準に古い順で比較する(YYYY-MM-DD文字列なのでそのまま比較可能)。
// 同じ日付の場合は入力したタイミング(ts)で順序を決める。
export function compareByDate(a, b) {
  if (a.date !== b.date) return a.date < b.date ? -1 : 1;
  return a.ts - b.ts;
}

// 日付の新しい順(降順)で並べたコピーを返す
export function sortByDateDesc(entries) {
  return [...entries].sort((a, b) => compareByDate(b, a));
}

// 日付の古い順(昇順)で並べたコピーを返す
export function sortByDateAsc(entries) {
  return [...entries].sort(compareByDate);
}
