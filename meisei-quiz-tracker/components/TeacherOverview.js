import { useState } from "react";
import { Header } from "./Common";
import { judgePass, fmtDate, sortByDateAsc } from "../lib/quiz";

export default function TeacherOverview({
  roster,
  resultsByStudent,
  onBack,
  onSelectStudent,
  onAddStudent,
  onDeleteStudent,
  onChangePasscode,
}) {
  const [tab, setTab] = useState("overview");
  const [newName, setNewName] = useState("");

  return (
    <>
      <Header rightLabel="生徒画面へ戻る" onRight={onBack} />
      <div className="tabs">
        <button className={`tab-btn ${tab === "overview" ? "active" : ""}`} onClick={() => setTab("overview")}>
          状況一覧
        </button>
        <button className={`tab-btn ${tab === "roster" ? "active" : ""}`} onClick={() => setTab("roster")}>
          名簿管理
        </button>
      </div>

      {tab === "overview" && (
        <div className="card">
          <div className="section-title">全生徒の推移</div>
          <div className="muted" style={{ marginBottom: 10, display: "flex", gap: 14, flexWrap: "wrap", alignItems: "center" }}>
            <span style={{ display: "flex", gap: 5, alignItems: "center" }}>
              <span className="dot pass" style={{ display: "inline-block", width: 9, height: 9, borderRadius: "50%" }} />
              合格
            </span>
            <span style={{ display: "flex", gap: 5, alignItems: "center" }}>
              <span className="dot fail" style={{ display: "inline-block", width: 9, height: 9, borderRadius: "50%" }} />
              不合格
            </span>
            <span>行をタップすると全履歴を表示します</span>
          </div>

          {roster.length === 0 ? (
            <div className="empty-note">生徒が登録されていません。「名簿管理」から追加してください。</div>
          ) : (
            roster.map((s) => {
              const entries = resultsByStudent[s.name] || [];
const sortedAsc = sortByDateAsc(entries);              const latest = sortedAsc[sortedAsc.length - 1];
              const recent = sortedAsc.slice(-14);
              return (
                <div key={s.id} className="teacher-row" onClick={() => onSelectStudent(s.name)}>
                  <div className="teacher-row-top">
                    <div className="name">{s.name}</div>
                    {!latest ? (
                      <span className="badge none">未記録</span>
                    ) : (
                      <span className={`badge ${judgePass(latest.score, latest.max) ? "pass" : "fail"}`}>
                        {latest.score}/{latest.max} {judgePass(latest.score, latest.max) ? "合格" : "要注意"}
                      </span>
                    )}
                    <span className="expand-caret">›</span>
                  </div>
                  <div className="trend-dots">
                    {recent.length === 0 ? (
                      <span className="trend-label">記録なし</span>
                    ) : (
                      <>
                        {recent.map((item) => (
                          <span
                            key={item.id}
                            className={`dot ${judgePass(item.score, item.max) ? "pass" : "fail"}`}
                            title={`${item.subject}: ${item.score}/${item.max} (${fmtDate(item.date)})`}
                          />
                        ))}
                        <span className="trend-label">直近{recent.length}回</span>
                      </>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {tab === "roster" && (
        <>
          <div className="card">
            <div className="section-title">名簿管理</div>
            <div className="roster-manage">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="生徒の名前を入力"
              />
              <button
                className="btn secondary"
                onClick={async () => {
                  await onAddStudent(newName);
                  setNewName("");
                }}
              >
                追加
              </button>
            </div>
            <div className="roster-list">
              {roster.length === 0 ? (
                <div className="empty-note">まだ生徒が登録されていません。</div>
              ) : (
                roster.map((s) => (
                  <div key={s.id} className="roster-list-item">
                    <span>{s.name}</span>
                    <button className="btn danger-ghost" onClick={() => onDeleteStudent(s.id, s.name)}>
                      削除
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
          <div className="card">
            <div className="section-title">合言葉</div>
            <div className="muted" style={{ marginBottom: 12 }}>
              先生用画面に入るための合言葉を変更できます。
            </div>
            <button className="btn secondary" onClick={onChangePasscode}>
              合言葉を変更する
            </button>
          </div>
        </>
      )}
    </>
  );
}
