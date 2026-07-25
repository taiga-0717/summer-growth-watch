import { Header } from "./Common";

export default function LoginScreen({ roster, search, setSearch, onSelectStudent, onTeacherClick }) {
  const filtered = roster.filter((s) => s.name.includes(search));

  return (
    <>
      <Header rightLabel="先生用" onRight={onTeacherClick} />
      <div className="card">
        <div className="section-title">名前を選んでください</div>
        <div className="search-row">
          <input
            type="text"
            placeholder="名前で検索"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {filtered.length === 0 ? (
          <div className="empty-note">
            {roster.length === 0
              ? "まだ生徒が登録されていません。「先生用」から名簿を登録してください。"
              : "該当する生徒がいません。"}
          </div>
        ) : (
          <div className="student-grid">
            {filtered.map((s) => (
              <button key={s.id} className="student-tile" onClick={() => onSelectStudent(s.name)}>
                {s.name}
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
