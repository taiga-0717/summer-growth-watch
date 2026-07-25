import { Header, HistoryRow } from "./Common";
import LineChart from "./LineChart";
import { judgePass, scoreRate, sortByDateAsc, sortByDateDesc } from "../lib/quiz";

export default function TeacherDetail({ name, entries, subject, setSubject, onBack }) {
  const all = sortByDateAsc(entries);
  const subjects = [];
  all.forEach((e) => {
    if (!subjects.includes(e.subject)) subjects.push(e.subject);
  });

  const filtered = subject === "ALL" ? all : all.filter((e) => e.subject === subject);
  const historyList = sortByDateDesc(filtered);
  const latest = historyList[0];

  return (
    <>
      <Header rightLabel="一覧へ戻る" onRight={onBack} />
      <div className="student-name-row">
        <h2>{name} さんの推移</h2>
      </div>
      <div className="muted" style={{ marginBottom: 14 }}>
        得点率(%)の推移です。点線は合格ライン(90%)。
      </div>

      {latest && !judgePass(latest.score, latest.max) && (
        <div className="warning-banner">
          <div className="icon">⚠️</div>
          <div>
            <div className="msg-title">直近のテストが合格点に届いていません</div>
            <div className="msg-body">
              {subject === "ALL" ? "全体" : subject}の最新: {latest.score}/{latest.max}点({Math.round(scoreRate(latest))}%)
            </div>
          </div>
        </div>
      )}

      <div className="card">
        <div className="subject-chips">
          <button className={`chip ${subject === "ALL" ? "active" : ""}`} onClick={() => setSubject("ALL")}>
            すべて
          </button>
          {subjects.map((s) => (
            <button key={s} className={`chip ${subject === s ? "active" : ""}`} onClick={() => setSubject(s)}>
              {s}
            </button>
          ))}
        </div>
        <LineChart entries={filtered} />
      </div>

      <div className="card">
        <div className="section-title">{subject === "ALL" ? "全履歴" : `${subject}の履歴`}</div>
        {historyList.length === 0 ? (
          <div className="empty-note">データがありません。</div>
        ) : (
          historyList.map((item) => <HistoryRow key={item.id} item={item} />)
        )}
      </div>
    </>
  );
}
