import { useMemo, useState } from "react";
import { SUBJECTS } from "../lib/quiz";

const KEEP = "__keep__";

export default function SubjectMerge({ resultsByStudent, onMerge, showToast }) {
  const uniqueSubjects = useMemo(() => {
    const set = new Set();
    Object.values(resultsByStudent).forEach((list) =>
      list.forEach((e) => {
        if (e.subject) set.add(e.subject);
      })
    );
    return [...set].sort((a, b) => a.localeCompare(b, "ja"));
  }, [resultsByStudent]);

  const [selections, setSelections] = useState({});
  const [submitting, setSubmitting] = useState(false);

  function handleChange(subject, value) {
    setSelections((prev) => ({ ...prev, [subject]: value }));
  }

  async function handleSubmit() {
    const mapping = {};
    uniqueSubjects.forEach((s) => {
      const v = selections[s] || KEEP;
      if (v !== KEEP && v !== s) mapping[s] = v;
    });

    if (Object.keys(mapping).length === 0) {
      showToast("統合先を選んだ科目がありません");
      return;
    }

    const lines = Object.entries(mapping)
      .map(([from, to]) => `「${from}」→「${to}」`)
      .join("\n");
    if (!confirm(`以下の内容で科目名を統合します。よろしいですか?\n\n${lines}`)) return;

    setSubmitting(true);
    const ok = await onMerge(mapping);
    setSubmitting(false);
    if (ok) {
      setSelections({});
    }
  }

  if (uniqueSubjects.length === 0) {
    return (
      <div className="card">
        <div className="section-title">科目名の統合</div>
        <div className="empty-note">まだテスト結果が記録されていません。</div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="section-title">科目名の統合</div>
      <div className="muted" style={{ marginBottom: 14 }}>
        「こくご」「国語」のように表記が違うだけの同じ科目を、5つの科目名のどれかにまとめられます。まとめたい科目の右側でまとめ先を選んで、「統合する」を押してください。
      </div>

      <div className="roster-list" style={{ marginBottom: 14 }}>
        {uniqueSubjects.map((s) => (
          <div key={s} className="roster-list-item" style={{ gap: 10 }}>
            <span style={{ flex: "0 0 auto", minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {s}
            </span>
            <select
              value={selections[s] || KEEP}
              onChange={(e) => handleChange(s, e.target.value)}
              style={{ width: "auto", flex: "0 0 auto", fontSize: 13, padding: "6px 28px 6px 10px" }}
            >
              <option value={KEEP}>そのまま(変更しない)</option>
              {SUBJECTS.map((canonical) => (
                <option key={canonical} value={canonical}>
                  {canonical} に統合
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>

      <button className="btn secondary" onClick={handleSubmit} disabled={submitting}>
        {submitting ? "統合中…" : "統合する"}
      </button>
    </div>
  );
}
