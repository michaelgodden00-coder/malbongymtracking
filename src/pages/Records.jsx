import { useRef } from 'react';
import { useStore } from '../store.jsx';
import { allPR, hist, best1, today, r1 } from '../utils.js';
import LineChart from '../components/LineChart.jsx';

export default function Records() {
  const { S, save } = useStore();
  const prs   = allPR(S);
  const gl    = S.goals;
  const geRef = useRef();
  const gtRef = useRef();
  const bwRef = useRef();
  const ntRef = useRef();

  function addGoal() {
    const t = +gtRef.current.value;
    if (t > 0) {
      save(s => {
        s.goals.push({ ex: geRef.current.value, t });
        return s;
      });
      gtRef.current.value = '';
    }
  }

  function removeGoal(i) {
    save(s => { s.goals.splice(i, 1); return s; });
  }

  function logBW() {
    const v = +bwRef.current.value;
    if (v > 0) {
      save(s => { s.bw.push({ d: today(), kg: v }); return s; });
      bwRef.current.value = '';
    }
  }

  function saveNote() {
    const t = ntRef.current.value.trim();
    if (t) {
      save(s => { s.notes.push({ d: today(), t }); return s; });
      ntRef.current.value = '';
    }
  }

  const sorted = [...S.ex].sort((a, b) => a.name.localeCompare(b.name));
  const displayed = prs
    .filter(p => ['heavy', 'e1rm', 'vol'].includes(p.k))
    .sort((a, b) => a.n.localeCompare(b.n));

  const bwPts = [...S.bw]
    .sort((a, b) => a.d < b.d ? -1 : 1)
    .map(b => ({ x: new Date(b.d).getTime(), y: b.kg, t: b.d }));

  const LABEL = { heavy: 'Heaviest', e1rm: 'Best est. 1RM', vol: 'Session volume' };

  return (
    <>
      <h1>Record Book</h1>

      {/* ── PRs ── */}
      <div className="grid">
        {displayed.length === 0
          ? <div className="empty">Records appear automatically as you log sets.</div>
          : displayed.map((p, i) => (
              <div key={i} className="card" style={{ borderLeft: '6px solid var(--ac)' }}>
                <div className="lab">{LABEL[p.k]}</div>
                <h3>{p.n}</h3>
                <div className="big">{r1(p.v)}<small style={{ fontSize: 14 }}> kg</small></div>
                <div className="note">{p.date}</div>
              </div>
            ))
        }
      </div>

      {/* ── Goals ── */}
      <h2>Goals</h2>
      <div className="row">
        <select ref={geRef}>
          {sorted.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
        </select>
        <input ref={gtRef} type="number" placeholder="Target kg" />
        <button className="sm" onClick={addGoal}>Add goal</button>
      </div>
      {gl.map((g, i) => {
        const h = hist(S, g.ex);
        const c = h.length ? Math.max(...h.map(best1)) : 0;
        const ex = S.ex.find(e => e.id === g.ex);
        return (
          <div key={i} className="card">
            <b>{ex?.name}</b> — {r1(c)} / {g.t} kg (e1RM){' '}
            <button className="sm alt" onClick={() => removeGoal(i)}>✕</button>
            <div className="bar"><i style={{ width: `${Math.min(100, c / g.t * 100)}%` }} /></div>
          </div>
        );
      })}

      {/* ── Bodyweight ── */}
      <h2>Bodyweight</h2>
      <div className="row">
        <input ref={bwRef} type="number" step=".1" placeholder="kg" />
        <button className="sm" onClick={logBW}>Log</button>
      </div>
      <div className="card">
        <LineChart pts={bwPts} fmt={v => v + ' kg'} />
      </div>

      {/* ── Training notes ── */}
      <h2>Training notes</h2>
      <div className="row">
        <input ref={ntRef} placeholder="Energy, sleep, fatigue, observations" style={{ flex: 1 }} />
        <button className="sm" onClick={saveNote}>Save</button>
      </div>
      {[...S.notes].reverse().map((n, i) => (
        <div key={i} className="card">
          <span className="note">{n.d}</span><br />{n.t}
        </div>
      ))}
    </>
  );
}
