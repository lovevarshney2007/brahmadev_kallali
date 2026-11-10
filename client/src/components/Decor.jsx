// Decorative artwork: mango-leaf toran, temple drawing and lotus divider.

export function Toran() {
  const items = [];
  for (let i = 0; i < 24; i++) {
    const x = 25 + i * 50;
    const y = 8;
    items.push(
      i % 4 === 0 ? (
        <g key={i}>
          <circle cx={x} cy={y + 12} r="6" fill="#E67E22" />
          <circle cx={x} cy={y + 24} r="4" fill="#F5B041" />
        </g>
      ) : (
        <path key={i} d={`M${x} ${y} q-8 16 0 32 q8-16 0-32z`} fill={i % 2 ? '#4F7A2A' : '#6E9A3A'} />
      )
    );
  }
  return (
    <svg className="toran" viewBox="0 0 1200 46" preserveAspectRatio="none" aria-hidden="true">
      <path d="M0 8 H1200" stroke="#C88A2E" strokeWidth="3" />
      {items}
    </svg>
  );
}

export function Shrine() {
  return (
    <div className="shrine" aria-hidden="true">
      <svg viewBox="0 0 300 340">
        <circle cx="150" cy="170" r="150" fill="#F5B041" opacity=".08" />
        <circle cx="150" cy="170" r="110" fill="#F5B041" opacity=".08" />
        <path d="M150 8 v22" stroke="#F5B041" strokeWidth="3" />
        <path d="M150 10 l24 8 -24 8z" fill="#E67E22" />
        <circle cx="150" cy="40" r="9" fill="#F5B041" />
        <path d="M150 48 C118 90 104 130 96 176 H204 C196 130 182 90 150 48z" fill="#E67E22" />
        <path d="M150 62 C130 98 122 132 116 176 M150 62 C170 98 178 132 184 176 M150 58 V176" stroke="#D98880" strokeWidth="2" fill="none" opacity=".6" />
        <path d="M110 120 H190 M104 148 H196 M120 94 H180" stroke="#D98880" strokeWidth="2" opacity=".55" />
        <rect x="80" y="176" width="140" height="14" fill="#F5B041" />
        <rect x="70" y="190" width="160" height="96" fill="#7B241C" />
        <path d="M126 286 V236 a24 24 0 0 1 48 0 V286z" fill="#2C1E16" />
        <rect x="84" y="204" width="22" height="70" fill="#F5B041" opacity=".45" />
        <rect x="194" y="204" width="22" height="70" fill="#F5B041" opacity=".45" />
        <ellipse cx="150" cy="284" rx="16" ry="5" fill="#F5B041" />
        <path className="flame" d="M150 254 C143 266 143 276 150 280 C157 276 157 266 150 254z" fill="#F39C12" />
        <rect x="50" y="286" width="200" height="14" fill="#F5B041" />
        <rect x="30" y="300" width="240" height="14" fill="#C88A2E" />
        <rect x="10" y="314" width="280" height="22" fill="#F5B041" opacity=".55" />
      </svg>
    </div>
  );
}

export function LotusRule() {
  return (
    <svg className="lotus-rule" viewBox="0 0 120 14" aria-hidden="true">
      <path d="M0 7h44M76 7h44" stroke="currentColor" />
      <path d="M60 1c-4 4-4 8 0 12 4-4 4-8 0-12zM52 5c0 4 3 7 8 8-1-4-4-7-8-8zM68 5c0 4-3 7-8 8 1-4 4-7 8-8z" fill="currentColor" />
    </svg>
  );
}

export function SectionHead({ eyebrow, title, children, rule = false }) {
  return (
    <div className="head">
      <span className="eyebrow">{eyebrow}</span>
      <h2>{title}</h2>
      {rule && <LotusRule />}
      {children}
    </div>
  );
}

export const Tbc = ({ children = 'To be confirmed' }) => <span className="tbc">{children}</span>;
