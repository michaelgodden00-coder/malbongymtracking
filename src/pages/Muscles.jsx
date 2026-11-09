import { useState } from 'react';
import { useStore } from '../store.jsx';
import { mus, r1, today, dAgo } from '../utils.js';
import { MU, UP, PUSH, PULL } from '../constants.js';
import BodyMap from '../components/BodyMap.jsx';

export default function Muscles() {
  const { S } = useStore();
  const [days, setDays]     = useState(7);
  const [selMus, setSelMus] = useState(null);

  const m   = mus(S, dAgo(days - 1), today());
  const pm  = mus(S, dAgo(2 * days - 1), dAgo(days));
  const tot = MU.reduce((a, k) => a + m[k].sets, 0) || 1;

  const sum  = list => list.reduce((a, k) => a + m[k].sets, 0);
  const up   = sum(UP);
  const lw   = tot - up;
  const pu   = sum(PUSH);
  const pl   = sum(PULL);

  const Balance = ({ a, b, x, y }) => (
    <>
      <div className="note">{x} {Math.round(a / (a + b || 1) * 100)}% · {y} {Math.round(b / (a + b || 1) * 100)}%</div>
      <div className="bar"><i style={{ width: `${a / (a + b || 1) * 100}%` }} /></div>
    </>
  );

  return (
    <>
      <h1>Muscle Breakdown</h1>
      <div className="row">
        <select value={days} onChange={e => setDays(+e.target.value)}>
          <option value={7}>Last 7 days</option>
          <option value={14}>Last 14 days</option>
          <option value={28}>Last 28 days</option>
        </select>
      </div>
      <p className="note">
        Primary muscles count as 1 set, secondary as {S.set.sec} (configurable in Settings).
        Figures estimate training distribution, not physiological activation.
        Tap a muscle for its exercises.
      </p>

      <div className="grid">
        {/* Body maps */}
        <div className="card" style={{ display: 'flex', gap: 6 }}>
          <BodyMap view="front" muscleMap={m} onSelect={k => setSelMus(k)} />
          <BodyMap view="back"  muscleMap={m} onSelect={k => setSelMus(k)} />
        </div>

        {/* Selected muscle detail + balance */}
        <div className="card">
          <div className="lab">{selMus || 'Select a muscle'}</div>
          {selMus && (
            <>
              <div className="big">{r1(m[selMus].sets)} <small style={{ fontSize: 14 }}>sets</small></div>
              {Object.entries(m[selMus].ex).length > 0
                ? Object.entries(m[selMus].ex).map(([k, v]) => (
                    <p key={k}>{k} — {r1(v)} sets</p>
                  ))
                : <p className="note">Not trained in this period.</p>
              }
            </>
          )}
          <div className="lab" style={{ marginTop: 12 }}>Balance</div>
          <Balance a={up} b={lw} x="Upper" y="Lower" />
          <Balance a={pu} b={pl} x="Push"  y="Pull"  />
        </div>
      </div>

      {/* Full muscle table */}
      <div className="card">
        <div className="lab">Sets &amp; share by muscle · recovery awareness</div>
        <div className="sc">
          <table className="tbl">
            <thead>
              <tr>
                <th>Muscle</th><th>Sets</th><th>Share</th>
                <th>Sessions</th><th>vs prior</th><th>Last trained</th>
              </tr>
            </thead>
            <tbody>
              {MU.map(k => {
                const last = S.wk
                  .filter(w => w.en.some(e => {
                    const x = S.ex.find(ex => ex.id === e.ex);
                    return x && (x.p === k || x.s.includes(k));
                  }))
                  .map(w => w.date)
                  .sort()
                  .pop();
                const dd = last ? Math.round((new Date(today()) - new Date(last)) / 864e5) : null;
                const d  = m[k].sets - pm[k].sets;
                return (
                  <tr key={k}>
                    <td>{k}</td>
                    <td>{r1(m[k].sets)}</td>
                    <td>
                      <div className="bar" style={{ minWidth: 80 }}>
                        <i style={{ width: `${m[k].sets / tot * 100}%` }} />
                      </div>
                      {r1(m[k].sets / tot * 100)}%
                    </td>
                    <td>{m[k].days.size}</td>
                    <td>{d > 0 ? '+' : ''}{r1(d)}</td>
                    <td>
                      {last
                        ? `${dd}d ago ${dd < 2 ? '· recently worked' : dd < 4 ? '· recovering' : '· rested'}`
                        : '—'
                      }
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="note">Recovery labels use days since last session only; they don't measure actual recovery.</p>
      </div>
    </>
  );
}
