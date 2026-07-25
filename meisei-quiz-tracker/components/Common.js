import { judgePass, fmtDate } from "../lib/quiz";

export function Header({ rightLabel, onRight }) {
  return (
    <div className="app-header">
      <div className="brand">
        <div className="school">明成個別</div>
        <div className="sub">夏期講習 小テスト記録</div>
      </div>
      {rightLabel && (
        <button className="header-btn" onClick={onRight}>
          {rightLabel}
        </button>
      )}
    </div>
  );
}

export function Hanko({ pass, big }) {
  return (
    <div className={`hanko ${pass ? "pass" : "fail"} ${big ? "big" : ""}`}>
      {pass ? "合格" : "要努力"}
    </div>
  );
}

export function HistoryRow({ item }) {
  const pass = judgePass(item.score, item.max);
  return (
    <div className="history-item">
      <Hanko pass={pass} />
      <div className="history-info">
        <div className="history-subject">{item.subject}</div>
        <div className="history-date">{fmtDate(item.date)}</div>
      </div>
      <div className={`history-score ${pass ? "pass" : "fail"}`}>
        {item.score}
        <span className="max"> / {item.max}</span>
      </div>
    </div>
  );
}
