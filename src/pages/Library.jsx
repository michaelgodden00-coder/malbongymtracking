import { useState } from 'react';
import { useStore } from '../store.jsx';
import { uid, hist, best1, r1 } from '../utils.js';
import { MU } from '../constants.js';

const BLANK_EX = { name: '', p: MU[0], s: [], cat: 'compound', eq: '', pat: '', uni: false, notes: '', inc: 0 };

export default function Library() {
  const { S, save } = useStore();
  const [editing, setEditing] = useState(null); // null | 'new' | exercise-id
  const [form, setForm]       = useState(BLANK_EX);

  function openNew() {
    setForm(BLANK_EX);
    setEditing('new');
  }

  function openEdit(e) {
    setForm({ ...e });
    setEditing(e.id);
  }

  function closeForm() {
    setEditing(null);
  }

  function saveEx() {
    if (!form.name.trim()) return;
    const o = { ...form, id: editing === 'new' ? uid() : editing };
    save(s => {
      if (editing === 'new') {
        s.ex.push(o);
      } else {
        const idx = s.ex.findIndex(e => e.id === editing);
        if (idx !== -1) s.ex[idx] = o;
      }
      return s;
    });
    setEditing(null);
  }

  function deleteEx(id) {
    if (confirm('Delete this exercise? Logged sets using it stay in history but lose muscle mapping.')) {
      save(s => { s.ex = s.ex.filter(e => e.id !== id); return s; });
    }
  }

  function toggleSecondary(muscle) {
    setForm(f => ({
      ...f,
      s: f.s.includes(muscle)
        ? f.s.filter(m => m !== muscle)
        : [...f.s, muscle],
    }));
  }

  const sorted = [...S.ex].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <>
      <h1>The Library</h1>
      <p><button onClick={openNew}>+ New exercise</button></p>

      {/* ── Edit / Add Form ── */}
      {editing !== null && (
        <div className="card">
          <h2>{editing === 'new' ? 'Add' : 'Edit'} exercise</h2>
          <div className="row">
            <input
              placeholder="Name"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            />
            <select value={form.p} onChange={e => setForm(f => ({ ...f, p: e.target.value }))}>
              {MU.map(m => <option key={m}>{m}</option>)}
            </select>
            <select value={form.cat} onChange={e => setForm(f => ({ ...f, cat: e.target.value }))}>
              <option>compound</option>
              <option>isolation</option>
            </select>
            <input
              placeholder="Equipment"
              value={form.eq}
              onChange={e => setForm(f => ({ ...f, eq: e.target.value }))}
            />
            <input
              placeholder="Movement pattern"
              value={form.pat}
              onChange={e => setForm(f => ({ ...f, pat: e.target.value }))}
            />
            <select value={form.uni ? 'unilateral' : 'bilateral'} onChange={e => setForm(f => ({ ...f, uni: e.target.value === 'unilateral' }))}>
              <option>bilateral</option>
              <option>unilateral</option>
            </select>
            <label className="note">
              Step kg{' '}
              <input
                type="number" step=".25" style={{ width: 65 }}
                value={form.inc || ''}
                placeholder={S.set.inc}
                onChange={e => setForm(f => ({ ...f, inc: +e.target.value || 0 }))}
              />
            </label>
          </div>

          <p className="lab" style={{ marginTop: 12 }}>Secondary muscles</p>
          <div className="row">
            {MU.map(m => (
              <label key={m}>
                <input
                  type="checkbox"
                  checked={form.s.includes(m)}
                  disabled={m === form.p}
                  onChange={() => toggleSecondary(m)}
                />{' '}{m}
              </label>
            ))}
          </div>

          <textarea
            placeholder="Notes"
            style={{ width: '100%', margin: '8px 0' }}
            value={form.notes}
            onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
          />

          <button onClick={saveEx}>Save</button>{' '}
          <button className="alt" onClick={closeForm}>Cancel</button>
        </div>
      )}

      {/* ── Exercise Grid ── */}
      <div className="grid">
        {sorted.map(e => {
          const h = hist(S, e.id);
          return (
            <div key={e.id} className="card">
              <h3>{e.name}</h3>
              <span className="pill">{e.p}</span>
              {e.s.map(s => <span key={s} className="pill" style={{ opacity: .7 }}>{s}</span>)}
              <p className="note">
                {e.cat} · {e.eq} · {e.pat} · {e.uni ? 'unilateral' : 'bilateral'}<br />
                {h.length
                  ? `${h.length} sessions · last ${h[h.length - 1].date} · e1RM ${r1(best1(h[h.length - 1]))} kg`
                  : 'No history yet'
                }
              </p>
              <button className="sm"     onClick={() => openEdit(e)}>Edit</button>{' '}
              <button className="sm x"   onClick={() => deleteEx(e.id)}>Delete</button>
            </div>
          );
        })}
      </div>
    </>
  );
}
