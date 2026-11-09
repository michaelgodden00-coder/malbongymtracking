import { SH } from '../constants.js';
import { mcol, r1 } from '../utils.js';

/**
 * SVG muscle body-map (front or back view).
 *
 * Props:
 *   view     — 'front' | 'back'
 *   muscleMap — output of mus() — { [muscle]: { sets, days, ex } }
 *   onSelect  — (muscle: string) => void
 */
export default function BodyMap({ view, muscleMap, onSelect }) {
  const shapes = SH[view];
  const mx = Math.max(1, ...Object.values(muscleMap).map(v => v.sets));

  return (
    <svg
      className="mm"
      viewBox="0 0 200 224"
      width="100%"
      style={{ maxWidth: 210 }}
    >
      <text x="100" y="12" textAnchor="middle" className="lab">{view}</text>
      {shapes.map(([key, d]) => (
        <path
          key={key}
          d={d}
          fill={mcol(muscleMap[key]?.sets ?? 0, mx)}
          onClick={() => onSelect(key)}
          stroke="var(--ln)"
        >
          <title>{key}: {r1(muscleMap[key]?.sets ?? 0)} sets</title>
        </path>
      ))}
    </svg>
  );
}
