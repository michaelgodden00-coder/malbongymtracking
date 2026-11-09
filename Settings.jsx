import { useStore } from '../store.jsx';

export default function Settings() {
  const { S, save } = useStore();
  const s = S.set;

  function upd(key, val) {
    save(prev => {
      prev.set[key] = val;
      return prev;
    });
  }

  function exportCSV() {
    const rows = [['date','workout','exercise','set','kg','reps','rpe','rir','warmup','note']];
    S.wk.forEach(w =>
      w.en.forEach(e =>
        e.sets.forEach((st, i) => {
          const ex = S.ex.find(x => x.id === e.ex);
          rows.push([w.date, w.name, ex?.name, i + 1, st.w, st.r, st.rpe, st.rir, st.warm, st.note]);
        })
      )
    );
    const csv = rows.map(r => r.map(c => `"${String(c ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
    dl('workouts.csv', csv, 'text/csv');
  }

  function exportJSON() {
    dl('fairway-backup.json', JSON.stringify(S, null, 2), 'application/json');
  }

  function dl(name, data, type) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([data], { type }));
    a.download = name;
    a.click();
  }

  function eraseAll() {
    if (confirm('Erase ALL your data on the server? This cannot be undone.')) {
      save(() => ({
        ex: [], wk: [], bw: [], goals: [], notes: [], routines: [],
        targets: {}, draft: null,
        set: { sec: 0.5, inc: 2.5, lo: 6, hi: 10, theme: 'auto' },
      }));
    }
  }

  return (
    <>
      <h1>Settings</h1>

      <div className="card">
        <div className="grid">
          <label>
            Secondary muscle weight<br />
            <input
              type="number" step=".1" value={s.sec}
              onChange={e => upd('sec', +e.target.value)}
            />
          </label>
          <label>
            Default weight step (kg)<br />
            <input
              type="number" step=".25" value={s.inc}
              onChange={e => upd('inc', +e.target.value)}
            />
          </label>
          <label>
            Default rep range<br />
            <input type="number" value={s.lo} onChange={e => upd('lo', +e.target.value)} />
            {' – '}
            <input type="number" value={s.hi} onChange={e => upd('hi', +e.target.value)} />
          </label>
          <label>
            Theme<br />
            <select value={s.theme} onChange={e => upd('theme', e.target.value)}>
              <option>auto</option>
              <option>light</option>
              <option>dark</option>
            </select>
          </label>
        </div>
      </div>

      <div className="card">
        <div className="row">
          <button onClick={exportCSV}>Export CSV</button>
          <button className="alt" onClick={exportJSON}>Backup JSON</button>
          <button className="x" onClick={eraseAll}>Erase all data</button>
        </div>
        <p className="note">
          Your data is stored on the server and synced across devices.
          Export a backup regularly as an extra safety net.
        </p>
      </div>
    </>
  );
}
