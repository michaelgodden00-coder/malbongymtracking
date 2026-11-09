import { useStore } from '../store.jsx';
import { today, dAgo, mon, r1, work, svol, best1, hist, mus, allPR, weekVol } from '../utils.js';
import { MU } from '../constants.js';
import LineChart from '../components/LineChart.jsx';
import { Link } from 'react-router-dom';

export default function Clubhouse() {
  const { S } = useStore();

  const ws   = mon(today());
  const wk   = S.wk.filter(w => w.date >= ws);
  const prev = S.wk.filter(w => w.date >= mon(dAgo(7)) && w.date < ws);

  const sets  = wk.reduce((a, w) => a + w.en.reduce((b, e) => b + work(e.sets).length, 0), 0);
  const reps  = wk.reduce((a, w) => a + w.en.reduce((b, e) => b + work(e.sets).reduce((c, s) => c + s.r, 0), 0), 0);
  const vol   = arr => arr.reduce((x, w) => x + w.en.reduce((y, e) => y + svol(e.sets), 0), 0);

  const m  = mus(S, ws, today());
  const nm = MU.filter(k => m[k].sets > 0).length;

  // Streak (weeks)
  let str = 0;
  for (let i = 0; i < 52; i++) {
    if (S.wk.some(w => mon(w.date) === mon(dAgo(i * 7)))) str++;
    else if (i > 0) break;
  }

  const prs    = allPR(S);
  const lastPR = prs.filter(p => p.k === 'e1rm').sort((a, b) => a.date < b.date ? 1 : -1)[0];
  const strong = prs.filter(p => p.k === 'heavy').sort((a, b) => b.v - a.v)[0];

  const imp = S.ex
    .map(e => {
      const h = hist(S, e.id);
      return h.length > 1
        ? { n: e.name, d: best1(h[h.length - 1]) / best1(h[0]) - 1 }
        : null;
    })
    .filter(Boolean)
    .sort((a, b) => b.d - a.d)[0];

  // 84-day activity heatmap
  const days = [];
  for (let i = 83; i >= 0; i--) {
    const d = dAgo(i);
    const c = S.wk.filter(w => w.date === d).length;
    days.push({ d, c });
  }

  const Stat = ({ label, value, unit = '' }) => (
    <div className="card">
      <div className="lab">{label}</div>
      <div className="big">{value}<small style={{ fontSize: 14 }}> {unit}</small></div>
    </div>
  );

  return (
    <>
      <div className="lab">Members' dashboard</div>
      <h1>The Clubhouse</h1>
      <p className="note">Week of {ws}. Everything here is calculated from your logged sets.</p>

      <div className="grid">
        <Stat label="Workouts this week" value={wk.length} />
        <Stat label="Sets / reps"        value={`${sets} / ${reps}`} />
        <Stat label="Volume"             value={Math.round(vol(wk)).toLocaleString()} unit="kg" />
        <Stat label="Muscle groups"      value={nm} />
        <Stat label="Streak"             value={str} unit="wks" />
        <Stat label="Last week volume"   value={Math.round(vol(prev)).toLocaleString()} unit="kg" />
      </div>

      <div className="grid">
        <div className="card">
          <div className="lab">Performance highlights</div>
          <p>Most improved: <b>{imp ? `${imp.n} (${imp.d >= 0 ? '+' : ''}${r1(imp.d * 100)}% e1RM)` : '—'}</b></p>
          <p>Latest PR: <b>{lastPR ? `${lastPR.n} · ${r1(lastPR.v)} kg e1RM` : '—'}</b></p>
          <p>Strongest lift: <b>{strong ? `${strong.n} · ${strong.v} kg` : '—'}</b></p>
        </div>
        <div className="card">
          <div className="lab">Quick actions</div>
          <div className="row" style={{ marginTop: 8 }}>
            <Link className="btn" to="/training">Start workout</Link>
            <Link className="btn alt" to="/library">Library</Link>
            <Link className="btn alt" to="/progress">Progress</Link>
            <Link className="btn alt" to="/overload">Overload</Link>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="lab">12-week training calendar</div>
        <div className="hm" style={{ gridTemplateColumns: 'repeat(28,1fr)', marginTop: 8 }}>
          {days.map(({ d, c }) => (
            <b key={d} className={c > 1 ? 'm' : c ? 'l' : ''} title={d} />
          ))}
        </div>
      </div>

      <div className="card">
        <div className="lab">Volume by week</div>
        <LineChart pts={weekVol(S)} fmt={v => v + ' kg'} />
      </div>
    </>
  );
}
