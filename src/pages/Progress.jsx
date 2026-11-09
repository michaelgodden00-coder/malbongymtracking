import { useEffect, useState } from 'react';
import { useStore } from '../store.jsx';
import { hist, best1, svol, r1, dAgo } from '../utils.js';
import LineChart from '../components/LineChart.jsx';

const RANGES = [
  [28,  'Last 4 weeks'],
  [56,  'Last 8 weeks'],
  [91,  'Last 3 months'],
  [182, 'Last 6 months'],
  [36500,'All time'],
];

export default function Progress() {
  const { S } = useStore();

  const sorted = [...S.ex].sort((a, b) => a.name.localeCompare(b.name));
  const firstEx = sorted.find(e => hist(S, e.id).length);

  const [selId, setSelId] = useState(firstEx?.id ?? sorted[0]?.id ?? '');
  const [range, setRange] = useState(56);

  useEffect(() => {
    if (!sorted.length) {
      setSelId('');
      return;
    }

    const selectedStillExists = sorted.some(e => e.id === selId);
    if (!selectedStillExists) {
      const next = firstEx ?? sorted[0];
      setSelId(next?.id ?? '');
    }
  }, [sorted, selId, firstEx]);

  const cut = dAgo(range);
  const h   = hist(S, selId).filter(x => x.date >= cut);
  const mk  = f => h.map(x => ({ x: new Date(x.date).getTime(), y: f(x), t: x.date }));

  const dlt = h.length > 1
    ? `e1RM moved from ${r1(best1(h[0]))} kg to ${r1(best1(h[h.length - 1]))} kg across ${h.length} sessions (${h[0].date} → ${h[h.length - 1].date}).`
    : 'Log at least two sessions in this range to compare.';

  const emptyState = !selId || !sorted.length || h.length === 0;

  const Chart = ({ title, fn, unit }) => (
    <div className="card">
      <div className="lab">{title}</div>
      {emptyState ? (
        <div className="empty">No data in this range.</div>
      ) : (
        <LineChart pts={mk(fn)} fmt={v => v + unit} />
      )}
    </div>
  );

  return (
    <>
      <h1>Progress</h1>
      <div className="row">
        <select value={selId} onChange={e => setSelId(e.target.value)} disabled={!sorted.length}>
          {sorted.length === 0
            ? <option value="">No exercises yet</option>
            : sorted.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
        </select>
        <select value={range} onChange={e => setRange(+e.target.value)}>
          {RANGES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      </div>

      <p><b>{dlt}</b></p>

      {emptyState ? (
        <div className="card">
          <div className="empty">
            {sorted.length === 0
              ? 'Add an exercise to the library before viewing progress.'
              : 'Log at least one workout for this exercise to see charts.'}
          </div>
        </div>
      ) : (
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))' }}>
          <Chart title="Estimated 1RM (Epley)" fn={x => r1(best1(x))}                              unit=" kg" />
          <Chart title="Best set weight"        fn={x => Math.max(...x.sets.map(s => s.w || 0))}   unit=" kg" />
          <Chart title="Session volume"         fn={x => svol(x.sets)}                              unit=" kg" />
          <Chart title="Total reps"             fn={x => x.sets.reduce((a, s) => a + (s.r || 0), 0)} unit="" />
        </div>
      )}
    </>
  );
}
