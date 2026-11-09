import { useStore } from '../store.jsx';
import { rec } from '../utils.js';

export default function Overload() {
  const { S, save } = useStore();
  const recs = S.ex.map(e => rec(S, e)).filter(Boolean);

  function accept(id, w, reps, sets, date) {
    save(s => {
      s.targets[id] = { w, text: `${w} kg × ${reps}, ${sets} sets`, date, state: 'accepted' };
      return s;
    });
  }

  function dismiss(id, date) {
    save(s => {
      s.targets[id] = { date, state: 'dismissed' };
      return s;
    });
  }

  function editTarget(id, w, reps, sets, date) {
    const v = prompt('Target weight (kg):', w);
    if (v === null || isNaN(+v)) return;
    save(s => {
      s.targets[id] = {
        w: +v,
        text: `${+v} kg × ${reps}, ${sets} sets`,
        date,
        state: 'accepted',
      };
      return s;
    });
  }

  return (
    <>
      <h1>Progressive Overload</h1>
      <p className="note">
        Rule-based double progression using your last session, rep range, RIR/RPE and recent trend.
        Weight rises only when performance earns it.
      </p>

      {recs.length === 0
        ? <div className="empty">Log a session and recommendations will appear here.</div>
        : recs.map(r => {
            const e = r.ex;
            return (
              <div key={e.id} className="card">
                <div className="row" style={{ justifyContent: 'space-between' }}>
                  <h2>{e.name}</h2>
                  <span className="pill" style={{ background: 'var(--ac)' }}>{r.mode}</span>
                </div>

                <div className="grid">
                  <div>
                    <div className="lab">Previous ({r.l.date})</div>
                    {r.l.sets.map((s, i) => <div key={i}>{s.w} kg × {s.r}</div>)}
                  </div>
                  <div>
                    <div className="lab">Suggested next</div>
                    <div className="big">{r.w} kg</div>
                    {r.sets} sets × {r.reps} reps
                  </div>
                  <div>
                    <div className="lab">Why · confidence {r.conf}</div>
                    {r.why}<br />
                    <span className="note">Alternative: {r.alt}</span>
                  </div>
                </div>

                {r.flags.map((f, i) => (
                  <p key={i} style={{ color: 'var(--ac)' }}>⚑ {f}</p>
                ))}

                {r.state
                  ? <p className="note">Status: {r.state}</p>
                  : (
                    <>
                      <button className="sm" onClick={() => accept(e.id, r.w, r.reps, r.sets, r.l.date)}>Accept</button>{' '}
                      <button className="sm alt" onClick={() => editTarget(e.id, r.w, r.reps, r.sets, r.l.date)}>Edit</button>{' '}
                      <button className="sm alt" onClick={() => dismiss(e.id, r.l.date)}>Dismiss</button>
                    </>
                  )
                }
              </div>
            );
          })
      }

      <p className="note">Rep range defaults live in Settings; step size is per exercise in the Library.</p>
    </>
  );
}
