import { inr } from '../api.js';

// Horizontal bars, all drawn to the same scale (the largest value fills the track).
export default function Bars({ rows, total }) {
  if (!rows?.length) return <p className="muted small">Nothing recorded yet.</p>;
  const max = Math.max(...rows.map((r) => r.amount));
  return (
    <div className="bars">
      {rows.map((r) => (
        <div className="bar" key={r.purpose}>
          <span>{r.purpose}</span>
          <div className="track"><div className="fill" style={{ width: `${(r.amount / max) * 100}%` }} /></div>
          <b>{inr(r.amount)} <span className="muted small">{total ? Math.round((r.amount / total) * 100) : 0}%</span></b>
        </div>
      ))}
    </div>
  );
}
