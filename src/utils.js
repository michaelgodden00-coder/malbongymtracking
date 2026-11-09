import { MU } from './constants.js';

// ── Date helpers ──────────────────────────────────────────────
export const iso = d => {
  const z = new Date(d);
  return (
    z.getFullYear() + '-' +
    String(z.getMonth() + 1).padStart(2, '0') + '-' +
    String(z.getDate()).padStart(2, '0')
  );
};
export const today = () => iso(new Date());
export const dAgo  = n => { const d = new Date(); d.setDate(d.getDate() - n); return iso(d); };
export const mon   = d => {
  const z = new Date(d + 'T00:00');
  z.setDate(z.getDate() - ((z.getDay() + 6) % 7));
  return iso(z);
};

// ── Maths ─────────────────────────────────────────────────────
export const e1   = (w, r) => r <= 1 ? w : w * (1 + r / 30);       // Epley 1RM
export const r1   = n => Math.round(n * 10) / 10;                    // round to 1dp
export const work = s => s.filter(x => !x.warm && x.r > 0);         // working sets only
export const svol = s => work(s).reduce((a, x) => a + x.w * x.r, 0);// session volume
export const best1 = h => Math.max(...h.sets.map(x => e1(x.w, x.r)));// best e1RM in session

// ── ID generation ─────────────────────────────────────────────
export const uid = () => Math.random().toString(36).slice(2, 9);

// ── Exercise lookup ───────────────────────────────────────────
export const exById = (S, id) => S.ex.find(e => e.id === id);

// ── Workout history for a given exercise ─────────────────────
export function hist(S, id) {
  return S.wk
    .filter(w => w.en.some(e => e.ex === id))
    .sort((a, b) => (a.date < b.date ? -1 : 1))
    .map(w => ({
      date: w.date,
      sets: work(w.en.filter(e => e.ex === id).flatMap(e => e.sets)),
    }))
    .filter(h => h.sets.length);
}

// ── Muscle volume table ───────────────────────────────────────
export function mus(S, from, to) {
  const m = {};
  MU.forEach(k => (m[k] = { sets: 0, days: new Set(), ex: {} }));

  S.wk
    .filter(w => w.date >= from && w.date <= to)
    .forEach(w =>
      w.en.forEach(en => {
        const e = exById(S, en.ex);
        if (!e) return;
        const n = work(en.sets).length;
        if (!n) return;
        [[e.p, 1], ...e.s.map(s => [s, +S.set.sec])].forEach(([k, f]) => {
          if (!m[k]) return;
          m[k].sets += n * f;
          m[k].days.add(w.date);
          m[k].ex[e.name] = (m[k].ex[e.name] || 0) + n * f;
        });
      })
    );
  return m;
}

// ── Progressive overload recommendation ──────────────────────
export function rec(S, e) {
  const h = hist(S, e.id);
  if (!h.length) return null;

  const l   = h[h.length - 1];
  const lo  = +e.lo  || +S.set.lo;
  const hi  = +e.hi  || +S.set.hi;
  const top = Math.max(...l.sets.map(x => x.w));
  const n   = l.sets.length;
  const minr = Math.min(...l.sets.map(x => x.r));
  const i   = +e.inc || +S.set.inc;

  const rirOk =
    l.sets.every(x => x.rir == null || x.rir === '' || +x.rir >= 1) &&
    l.sets.every(x => x.rpe == null || x.rpe === '' || +x.rpe <= 9.5);
  const conf = h.length >= 4 ? 'High' : h.length >= 2 ? 'Medium' : 'Low';

  let o = { ex: e, l, conf, flags: [] };

  if (minr >= hi && rirOk)
    Object.assign(o, {
      w: top + i, reps: `${lo}–${hi}`, sets: n,
      mode: 'Double progression → weight up',
      why: `Every working set reached ${hi} reps at ${top} kg with reserve left, so the weight is earned.`,
      alt: `Hold ${top} kg and add one set (volume progression).`,
    });
  else if (minr >= hi)
    Object.assign(o, {
      w: top, reps: `${lo}–${hi}`, sets: n,
      mode: 'Maintenance',
      why: 'Top of range hit, but RIR/RPE shows you were at or near failure. Repeat before adding load.',
      alt: `Try ${top + i} kg for ${lo} reps.`,
    });
  else if (minr < lo)
    Object.assign(o, {
      w: top, reps: `${lo}+`, sets: n,
      mode: 'Maintenance',
      why: `Some sets fell below ${lo} reps. Repeat ${top} kg and build back to the range.`,
      alt: `Drop to ${Math.max(0, top - i)} kg if it stalls again.`,
    });
  else
    Object.assign(o, {
      w: top, reps: `${minr + 1}–${hi}`, sets: n,
      mode: 'Double progression → add reps',
      why: `Add reps at ${top} kg first; weight rises once all sets reach ${hi}.`,
      alt: 'Add a set at the same load.',
    });

  if (h.length >= 3) {
    const b   = h.slice(-4, -1).map(best1);
    const cur = best1(l);
    if (cur < Math.max(...b) * 0.95)
      o.flags.push('Estimated 1RM is >5% below recent best — review fatigue or consider a deload.');
    else if (cur <= Math.max(...b))
      o.flags.push('Performance has plateaued over the last sessions.');
  }

  if (S.targets[e.id] && S.targets[e.id].date === l.date)
    o.state = S.targets[e.id].state;

  return o;
}

// ── All-time personal records ─────────────────────────────────
export function allPR(S) {
  const o = [];
  S.ex.forEach(e => {
    const h = hist(S, e.id);
    if (!h.length) return;
    let hv = { v: 0 }, ee = { v: 0 }, vv = { v: 0 };
    h.forEach(x => {
      x.sets.forEach(s => {
        if (s.w > hv.v) hv = { v: s.w, date: x.date };
        const q = e1(s.w, s.r);
        if (q > ee.v) ee = { v: q, date: x.date };
      });
      const v = svol(x.sets);
      if (v > vv.v) vv = { v, date: x.date };
    });
    o.push(
      { n: e.name, k: 'heavy', ...hv },
      { n: e.name, k: 'e1rm',  ...ee },
      { n: e.name, k: 'vol',   ...vv },
    );
  });
  return o;
}

// ── Weekly volume series (last 12 weeks) ─────────────────────
export function weekVol(S) {
  const m = {};
  S.wk.forEach(w => {
    const k = mon(w.date);
    m[k] = (m[k] || 0) + w.en.reduce((a, e) => a + svol(e.sets), 0);
  });
  return Object.keys(m)
    .sort()
    .slice(-12)
    .map(k => ({ x: new Date(k).getTime(), y: Math.round(m[k]), t: k }));
}

// ── Colour for muscle heat-map ────────────────────────────────
export const mcol = (v, mx) => {
  if (!v) return 'var(--bg)';
  const f = v / mx;
  return f > 0.66 ? 'var(--g)' : f > 0.33 ? '#5f8a68' : 'var(--sage)';
};
