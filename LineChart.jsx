import { r1 } from '../utils.js';

/**
 * SVG line chart — direct port of the original line() function.
 *
 * Props:
 *   pts   — array of { x: timestamp, y: number, t: label }
 *   fmt   — optional y-value formatter, e.g. v => v + ' kg'
 *   empty — string to show when pts is empty
 */
export default function LineChart({ pts = [], fmt = v => v, empty = 'No data in this range yet.' }) {
  if (!pts.length) return <div className="empty">{empty}</div>;

  const W = 620, H = 200, p = 34;
  const xs = pts.map(a => a.x);
  const ys = pts.map(a => a.y);
  const mn = Math.min(...ys) * 0.95;
  const mx = Math.max(...ys) * 1.02 || 1;
  const t0 = Math.min(...xs);
  const t1 = Math.max(...xs) || 1;

  const X = x => p + (t1 === t0 ? 0.5 : (x - t0) / (t1 - t0)) * (W - p - 10);
  const Y = y => H - p - (mx === mn ? 0.5 : (y - mn) / (mx - mn)) * (H - p - 12);

  const d = pts.map(a => `${X(a.x)},${Y(a.y)}`).join('L');

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%">
      <path d={`M${d}`} fill="none" stroke="var(--g)" strokeWidth="2.5" />
      {pts.map((a, i) => (
        <circle key={i} cx={X(a.x)} cy={Y(a.y)} r={4} fill="var(--ac)">
          <title>{a.t}: {fmt(a.y)}</title>
        </circle>
      ))}
      <text x="2"     y={Y(mx) + 4}>{fmt(r1(mx))}</text>
      <text x="2"     y={Y(mn) + 4}>{fmt(r1(mn))}</text>
      <text x={p}     y={H - 8}>{pts[0].t}</text>
      <text x={W - 80} y={H - 8}>{pts[pts.length - 1].t}</text>
    </svg>
  );
}
