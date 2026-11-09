import { useState, useRef } from 'react';
import { useStore } from '../store.jsx';
import { uid, today, work, svol, allPR, hist, exById } from '../utils.js';

/* ── Helpers ─────────────────────────────────────────────────── */
function emptySet(last = {}) {
  return { w: last.w ?? 0, r: last.r ?? 0, rpe: '', rir: '', warm: false, note: '' };
}

export default function Training() {
  const { S, save } = useStore();
  const nameRef = useRef();
  const dateRef = useRef();
  const exRef   = useRef();

  // ── Start a new session ──────────────────────────────────────
  function startWorkout() {
    save(s => {
      s.draft = {
        name: nameRef.current?.value || 'Workout',
        date: dateRef.current?.value || today(),
        en: [],
      };
      return s;
    });
  }

  // ── Add exercise to draft ────────────────────────────────────
  function addExercise() {
    const id = exRef.current?.value;
    if (!id) return;
    save(s => {
      const p    = hist(s, id).filter(x => x.date < s.draft.date).pop();
      const last = p?.sets[p.sets.length - 1] ?? {};
      const t    = s.targets[id];
      s.draft.en.push({
        ex: id,
        sets: [emptySet({
          w: t?.state === 'accepted' ? t.w : (last.w ?? 0),
          r: last.r ?? 0,
        })],
      });
      return s;
    });
  }

  function removeExercise(i) {
    save(s => { s.draft.en.splice(i, 1); return s; });
  }

  function addSet(i) {
    save(s => {
      const sets = s.draft.en[i].sets;
      sets.push(emptySet(sets[sets.length - 1] ?? {}));
      return s;
    });
  }

  function removeSet(i, j) {
    save(s => { s.draft.en[i].sets.splice(j, 1); return s; });
  }

  function updateField(i, j, key, value) {
    save(s => {
      const v = ['w','r','rpe','rir'].includes(key)
        ? (value === '' ? '' : +value)
        : value;
      s.draft.en[i].sets[j][key] = v;
      return s;
    });
  }

  // ── Finish & save workout ────────────────────────────────────
  function finishWorkout() {
    save(s => {
      const d = s.draft;
      d.en = d.en
        .map(e => ({ ...e, sets: e.sets.filter(x => x.r > 0 || x.w > 0) }))
        .filter(e => e.sets.length);
      if (!d.en.length) { alert('Log at least one set.'); return s; }

      const before = allPR(s);
      const w = { id: d.editId || uid(), name: d.name, date: d.date, en: d.en };
      s.wk = s.wk.filter(x => x.id !== w.id);
      s.wk.push(w);
      const after = allPR(s);

      s.recapPR = after
        .filter(a =>
          a.k !== 'vol' &&
          d.en.some(e => exById(s, e.ex)?.name === a.n) &&
          a.date === d.date &&
          a.v > (before.find(b => b.n === a.n && b.k === a.k)?.v ?? 0) &&
          before.some(b => b.n === a.n)
        )
        .map(a => `${a.n} ${a.k === 'heavy' ? 'heaviest' : 'e1RM'}`);

      s.recap = w.id;
      s.draft = null;
      return s;
    });
  }

  function discardDraft() {
    if (confirm('Discard this session?')) {
      save(s => { s.draft = null; return s; });
    }
  }

  function editWorkout(id) {
    save(s => {
      const w = s.wk.find(x => x.id === id);
      s.draft = { ...JSON.parse(JSON.stringify(w)), editId: w.id };
      return s;
    });
    window.scrollTo(0, 0);
  }

  function deleteWorkout(id) {
    if (confirm('Delete this workout? Stats will recalculate.')) {
      save(s => { s.wk = s.wk.filter(w => w.id !== id); return s; });
    }
  }

  const d   = S.draft;
  const sortedEx = [...S.ex].sort((a, b) => a.name.localeCompare(b.name));
  const history  = [...S.wk].sort((a, b) => a.date < b.date ? 1 : -1);

  return (
    <>
      <h1>Training</h1>

      {/* ── Start or active session ── */}
      {!d ? (
        <div className="card">
          <h2>Begin a session</h2>
          <div className="row">
            <input ref={nameRef} placeholder="Workout name (e.g. Push)" list="rt" />
            <datalist id="rt">
              {S.routines.map(r => <option key={r.name}>{r.name}</option>)}
            </datalist>
            <input ref={dateRef} type="date" defaultValue={today()} />
            <button onClick={startWorkout}>Start workout</button>
          </div>
        </div>
      ) : (
        <>
          {/* Session header */}
          <div className="card">
            <div className="row">
              <input
                value={d.name}
                onChange={e => save(s => { s.draft.name = e.target.value; return s; })}
              />
              <input
                type="date"
                value={d.date}
                onChange={e => save(s => { s.draft.date = e.target.value; return s; })}
              />
              <select ref={exRef}>
                <option value="">Add exercise…</option>
                {sortedEx.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
              </select>
              <button className="sm" onClick={addExercise}>Add</button>
            </div>
          </div>

          {/* Exercise cards */}
          {d.en.length === 0
            ? <div className="empty">Add an exercise from your library to begin logging.</div>
            : d.en.map((en, i) => {
                const e  = exById(S, en.ex);
                const ph = hist(S, en.ex).filter(x => x.date < d.date).pop();
                const t  = S.targets[en.ex];
                return (
                  <div key={i} className="card">
                    <div className="row" style={{ justifyContent: 'space-between' }}>
                      <h2>{e?.name}</h2>
                      <button className="sm alt" onClick={() => removeExercise(i)}>Remove</button>
                    </div>
                    <div className="note">
                      Previous:{' '}
                      {ph
                        ? `${ph.date} — ${ph.sets.map(s => `${s.w}×${s.r}`).join(', ')}`
                        : 'first time'
                      }
                      {t?.state === 'accepted' && (
                        <> · <b style={{ color: 'var(--ac)' }}>Target: {t.text}</b></>
                      )}
                    </div>

                    <div className="sc">
                      <table className="tbl">
                        <thead>
                          <tr><th>#</th><th>kg</th><th>Reps</th><th>RPE</th><th>RIR</th><th>Warm</th><th>Note</th><th></th></tr>
                        </thead>
                        <tbody>
                          {en.sets.map((s, j) => (
                            <tr key={j}>
                              <td>{j + 1}</td>
                              <td><input type="number" step="0.5"  value={s.w}         onChange={e => updateField(i, j, 'w',    e.target.value)} /></td>
                              <td><input type="number"              value={s.r}         onChange={e => updateField(i, j, 'r',    e.target.value)} /></td>
                              <td><input type="number" step=".5"   value={s.rpe ?? ''} onChange={e => updateField(i, j, 'rpe',  e.target.value)} /></td>
                              <td><input type="number"              value={s.rir ?? ''} onChange={e => updateField(i, j, 'rir',  e.target.value)} /></td>
                              <td><input type="checkbox" checked={s.warm} onChange={e => updateField(i, j, 'warm', e.target.checked)} /></td>
                              <td><input style={{ width: 110 }} value={s.note} onChange={e => updateField(i, j, 'note', e.target.value)} /></td>
                              <td><button className="sm alt" onClick={() => removeSet(i, j)}>✕</button></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <button className="sm" style={{ marginTop: 8 }} onClick={() => addSet(i)}>+ Add set</button>
                  </div>
                );
              })}

          {/* Session recap after finish */}
          {S.recap && (() => {
            const w = S.wk.find(x => x.id === S.recap);
            if (!w) return null;
            const muscles = [...new Set(w.en.flatMap(e => {
              const x = exById(S, e.ex);
              return x ? [x.p, ...x.s] : [];
            }))];
            return (
              <div className="card" style={{ border: '2px solid var(--ac)' }}>
                <div className="lab">Session recap</div>
                <h2>{w.name}</h2>
                <div className="big">{Math.round(w.en.reduce((a, e) => a + svol(e.sets), 0))} kg</div>
                <p>
                  {w.en.length} exercises ·{' '}
                  {w.en.reduce((a, e) => a + work(e.sets).length, 0)} working sets
                  {S.recapPR?.length > 0 && (
                    <><br /><b style={{ color: 'var(--ac)' }}>New records: {S.recapPR.join(', ')}</b></>
                  )}
                </p>
                {muscles.map(x => <span key={x} className="pill">{x}</span>)}
                <p>
                  <button className="sm alt" onClick={() => save(s => { s.recap = null; return s; })}>Close</button>
                </p>
              </div>
            );
          })()}

          <div className="row">
            <button onClick={finishWorkout}>Finish &amp; save</button>
            <button className="alt" onClick={discardDraft}>Discard</button>
          </div>
        </>
      )}

      {/* ── History ── */}
      <h2 style={{ marginTop: 26 }}>History</h2>
      {history.length === 0
        ? <div className="empty">No sessions logged yet.</div>
        : history.map(w => (
            <div key={w.id} className="card">
              <div className="row" style={{ justifyContent: 'space-between' }}>
                <div>
                  <b>{w.name}</b>{' '}
                  <span className="note">
                    {w.date} · {Math.round(w.en.reduce((a, e) => a + svol(e.sets), 0))} kg
                  </span>
                  <br />
                  {w.en.map(e => (
                    <span key={e.ex} className="pill">
                      {exById(S, e.ex)?.name} {work(e.sets).length}
                    </span>
                  ))}
                </div>
                <div>
                  <button className="sm alt" onClick={() => editWorkout(w.id)}>Edit</button>
                  {' '}
                  <button className="sm x" onClick={() => deleteWorkout(w.id)}>Delete</button>
                </div>
              </div>
            </div>
          ))
      }
    </>
  );
}
