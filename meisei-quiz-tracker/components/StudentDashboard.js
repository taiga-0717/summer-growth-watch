import { useState } from "react";
import { Header, Hanko, HistoryRow } from "./Common";
import { judgePass, todayStr } from "../lib/quiz";

export default function StudentDashboard({ name, entries, onBack, onAddResult, showToast }) {
  const [subject, setSubject] = useState("");
  const [date, setDate] = useState(todayStr());
  const [max, setMax] = useState("");
  const [score, setScore] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [justSubmitted, setJustSubmitted] = useState(null);

  const sorted = [...entries].sort((a, b) => b.ts - a.ts);
  const latest = sorted[0];

  async function handleSubmit(e) {
    e.preventDefault();
    const maxN = Number(max);
    const scoreN = Number(score);

    if (!subject.trim() || !date || !(maxN > 0) || scoreN < 0) {
      showToast("入力内容を確認してください");
      return;
    }
    if (scoreN > maxN) {
      showToast("得点が満点を超えています");
      return;
    }

    setSubmitting(true);
    const ok = await onAddResult(name, { subject: subject.trim(), date, max: maxN, score: scoreN });
    setSubmitting(false);

    if (ok) {
      setJustSubmitted({ subject: subject.trim(), score: scoreN, max: maxN, pass: judgePass(scoreN, maxN) });
      showToast("記録しました");
      setSubject("");
      setMax("");
      setScore("");
      setTimeout(() => setJustSubmitted(null), 2500);
    }
  }

  return (
    <>
      <Header rightLabel="ログアウト" onRight={onBack} />
      <div className="student-name-row">
        <h2>{name} さん</h2>
      </div>
      <div className="muted" style={{ marginBottom: 16 }}>
        合格ライン: 満点の90%以上
      </div>

      {latest &&
        (judgePass(latest.score, latest.max) ? (
          <div className="praise-banner">
            <div className="icon">✅</div>
            <div className="msg-title">前回のテストは合格点でした。この調子で!</div>
          </div>
        ) : (
          <div className="warning-banner">
            <div className="icon">⚠️</div>
            <div>
              <div className="msg-title">前回のテストが合格点に届いていません</div>
              <div className="msg-body">夜のコマに残って自学をすること。</div>
            </div>
          </div>
        ))}

      <div className="card">
        <div className="section-title">今日のテストを記録する</div>
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="full">
              <label>科目 / テスト名</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="例: 英単語テスト"
                required
              />
            </div>
            <div>
              <label>日付</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
            </div>
            <div></div>
            <div>
              <label>満点</label>
              <input
                type="number"
                min="1"
                step="1"
                value={max}
                onChange={(e) => setMax(e.target.value)}
                placeholder="例: 20"
                required
              />
            </div>
            <div>
              <label>得点</label>
              <input
                type="number"
                min="0"
                step="1"
                value={score}
                onChange={(e) => setScore(e.target.value)}
                placeholder="例: 18"
                required
              />
            </div>
          </div>
          <button type="submit" className="btn block" disabled={submitting}>
            {submitting ? "保存中…" : "記録する"}
          </button>
        </form>

        {justSubmitted && (
          <div className="stamp-confirm">
            <Hanko pass={justSubmitted.pass} big />
            <div className="label">
              {justSubmitted.subject}: {justSubmitted.score} / {justSubmitted.max} 点
            </div>
          </div>
        )}
      </div>

      <div className="card">
        <div className="section-title">これまでの記録</div>
        {sorted.length === 0 ? (
          <div className="empty-note">まだ記録がありません。</div>
        ) : (
          sorted.map((item) => <HistoryRow key={item.id} item={item} />)
        )}
      </div>
    </>
  );
}
