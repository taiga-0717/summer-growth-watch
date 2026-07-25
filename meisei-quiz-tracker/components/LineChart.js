import { judgePass, scoreRate, fmtDate } from "../lib/quiz";

export default function LineChart({ entries }) {
  if (entries.length === 0) {
    return <div className="empty-note">この条件のデータがありません。</div>;
  }

  const w = 640,
    h = 260,
    padL = 34,
    padR = 14,
    padT = 14,
    padB = 34;
  const innerW = w - padL - padR;
  const innerH = h - padT - padB;
  const n = entries.length;

  const xFor = (i) => (n > 1 ? padL + (innerW * i) / (n - 1) : padL + innerW / 2);
  const yFor = (rate) => padT + innerH - (Math.max(0, Math.min(100, rate)) / 100) * innerH;

  const pts = entries.map((e, i) => ({ x: xFor(i), y: yFor(scoreRate(e)), e }));
  const linePoints = pts.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  const labelStep = n <= 7 ? 1 : Math.ceil(n / 7);

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="trend-chart" preserveAspectRatio="xMidYMid meet" role="img" aria-label="得点率の推移グラフ">
      {[0, 50, 90, 100].map((v) => {
        const y = yFor(v);
        const isPass = v === 90;
        return (
          <g key={v}>
            <line
              x1={padL}
              y1={y}
              x2={w - padR}
              y2={y}
              stroke={isPass ? "#B98A2E" : "#E4E7F1"}
              strokeWidth={isPass ? 1.4 : 1}
              strokeDasharray={isPass ? "4,3" : "0"}
            />
            <text x={padL - 6} y={y + 3} textAnchor="end" fontSize="9" fill="#9297B3">
              {v}
            </text>
          </g>
        );
      })}

      <polyline points={linePoints} fill="none" stroke="#5B6082" strokeWidth="2" />

      {pts.map((p, i) => {
        const pass = judgePass(p.e.score, p.e.max);
        return (
          <circle
            key={p.e.id || i}
            cx={p.x}
            cy={p.y}
            r="4.5"
            fill={pass ? "#2F9E5C" : "#C4432F"}
            stroke="#fff"
            strokeWidth="1.5"
          >
            <title>{`${p.e.subject} ${fmtDate(p.e.date)}: ${p.e.score}/${p.e.max} (${Math.round(scoreRate(p.e))}%)`}</title>
          </circle>
        );
      })}

      {pts.map((p, i) => {
        if (i % labelStep !== 0 && i !== n - 1) return null;
        return (
          <text key={`l${i}`} x={p.x} y={h - padB + 16} textAnchor="middle" fontSize="9" fill="#9297B3">
            {fmtDate(p.e.date)}
          </text>
        );
      })}
    </svg>
  );
}
