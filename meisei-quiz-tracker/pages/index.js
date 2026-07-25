import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import Head from "next/head";
import LoginScreen from "../components/LoginScreen";
import StudentDashboard from "../components/StudentDashboard";
import TeacherOverview from "../components/TeacherOverview";
import TeacherDetail from "../components/TeacherDetail";

const POLL_INTERVAL_MS = 10000;

async function postJSON(url, body) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  let data = null;
  try {
    data = await res.json();
  } catch (e) {
    data = null;
  }
  return { ok: res.ok, status: res.status, data };
}

export default function Home() {
  const [roster, setRoster] = useState([]); // [name, name, ...]
  const [results, setResults] = useState({}); // { studentName: [entries] }
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("login"); // login | student | teacher | teacherDetail
  const [search, setSearch] = useState("");
  const [currentStudent, setCurrentStudent] = useState(null);
  const [teacherStudent, setTeacherStudent] = useState(null);
  const [teacherSubject, setTeacherSubject] = useState("ALL");
  const [toast, setToast] = useState(null);
  const pollRef = useRef(null);

  const loadData = useCallback(async () => {
    try {
      const res = await fetch("/api/data");
      if (!res.ok) return;
      const data = await res.json();
      setRoster(data.roster || []);
      setResults(data.results || {});
    } catch (e) {
      // 通信エラー時は次のポーリングに任せる
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    pollRef.current = setInterval(loadData, POLL_INTERVAL_MS);
    return () => clearInterval(pollRef.current);
  }, [loadData]);

  function showToast(msg) {
    const id = Date.now();
    setToast({ msg, id });
    setTimeout(() => {
      setToast((t) => (t && t.id === id ? null : t));
    }, 2200);
  }

  // rosterは名前の配列 → LoginScreen/TeacherOverviewが期待する {id, name} 形式に変換
  const rosterItems = useMemo(() => roster.map((name) => ({ id: name, name })), [roster]);

  // これまでに(誰かが)入力した科目名の一覧。新しい順に並べ、プルダウンの選択肢に使う
  const knownSubjects = useMemo(() => {
    const seen = new Map(); // subject -> 最新の ts
    Object.values(results).forEach((list) => {
      list.forEach((e) => {
        if (!e.subject) return;
        const prevTs = seen.get(e.subject);
        if (prevTs === undefined || e.ts > prevTs) seen.set(e.subject, e.ts);
      });
    });
    return [...seen.entries()].sort((a, b) => b[1] - a[1]).map(([subject]) => subject);
  }, [results]);

  async function addStudent(name) {
    const trimmed = (name || "").trim();
    if (!trimmed) {
      showToast("名前を入力してください");
      return;
    }
    const { ok, status, data } = await postJSON("/api/roster", { action: "add", name: trimmed });
    if (ok) {
      setRoster(data.roster);
      showToast(`${trimmed} さんを追加しました`);
    } else if (status === 409) {
      showToast("すでに登録されています");
    } else {
      showToast("追加に失敗しました");
    }
  }

  async function deleteStudent(id, name) {
    if (!confirm(`${name} さんを名簿から削除しますか?(記録は残ります)`)) return;
    const { ok, data } = await postJSON("/api/roster", { action: "remove", name });
    if (ok) {
      setRoster(data.roster);
    } else {
      showToast("削除に失敗しました");
    }
  }

  async function addResult(studentName, entry) {
    const { ok, data } = await postJSON("/api/results", { studentName, entry });
    if (ok) {
      setResults(data.results);
      return true;
    }
    showToast("保存に失敗しました。もう一度お試しください");
    return false;
  }

  async function requestTeacherAccess() {
    const { data: statusData } = await postJSON("/api/passcode", { op: "status" });
    if (!statusData || !statusData.isSet) {
      const pw1 = prompt("先生用の合言葉を設定してください(初回のみ)");
      if (!pw1) return false;
      const pw2 = prompt("確認のためもう一度入力してください");
      if (pw1 !== pw2) {
        alert("合言葉が一致しませんでした。もう一度お試しください。");
        return false;
      }
      const { ok } = await postJSON("/api/passcode", { op: "set", passcode: pw1 });
      if (ok) showToast("合言葉を設定しました");
      else showToast("合言葉の設定に失敗しました");
      return ok;
    }

    const attempt = prompt("先生用の合言葉を入力してください");
    if (attempt === null) return false;
    const { data: verifyData } = await postJSON("/api/passcode", { op: "verify", passcode: attempt });
    if (!verifyData || !verifyData.ok) {
      alert("合言葉が違います。");
      return false;
    }
    return true;
  }

  async function changePasscode() {
    const current = prompt("現在の合言葉を入力してください");
    if (current === null) return;
    const pw1 = prompt("新しい合言葉を入力してください");
    if (!pw1) return;
    const pw2 = prompt("確認のためもう一度入力してください");
    if (pw1 !== pw2) {
      alert("一致しませんでした。もう一度お試しください。");
      return;
    }
    const { ok, data } = await postJSON("/api/passcode", { op: "change", current, next: pw1 });
    if (ok) showToast("合言葉を変更しました");
    else if (data && data.error === "wrong current passcode") alert("合言葉が違います。");
    else showToast("変更に失敗しました");
  }

  return (
    <>
      <Head>
        <title>明成個別 夏期講習 小テスト記録</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <div className="wrap">
        {loading ? (
          <div className="loading">読み込み中…</div>
        ) : (
          <>
            {view === "login" && (
              <LoginScreen
                roster={rosterItems}
                search={search}
                setSearch={setSearch}
                onSelectStudent={(name) => {
                  setCurrentStudent(name);
                  setView("student");
                }}
                onTeacherClick={async () => {
                  const ok = await requestTeacherAccess();
                  if (ok) setView("teacher");
                }}
              />
            )}

            {view === "student" && (
              <StudentDashboard
                name={currentStudent}
                entries={results[currentStudent] || []}
                knownSubjects={knownSubjects}
                onBack={() => {
                  setCurrentStudent(null);
                  setView("login");
                }}
                onAddResult={addResult}
                showToast={showToast}
              />
            )}

            {view === "teacher" && (
              <TeacherOverview
                roster={rosterItems}
                resultsByStudent={results}
                onBack={() => setView("login")}
                onSelectStudent={(name) => {
                  setTeacherStudent(name);
                  setTeacherSubject("ALL");
                  setView("teacherDetail");
                }}
                onAddStudent={addStudent}
                onDeleteStudent={deleteStudent}
                onChangePasscode={changePasscode}
              />
            )}

            {view === "teacherDetail" && (
              <TeacherDetail
                name={teacherStudent}
                entries={results[teacherStudent] || []}
                subject={teacherSubject}
                setSubject={setTeacherSubject}
                onBack={() => setView("teacher")}
              />
            )}
          </>
        )}
      </div>
      {toast && <div className="toast">{toast.msg}</div>}
    </>
  );
}
