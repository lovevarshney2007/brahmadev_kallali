import { useState } from 'react';

/**
 * TravelCard - Interactive card for travel mode (Road, Rail, Air)
 * Features: icon, description, expandable details, Google Maps link
 */
export default function TravelCard({
  mode, // 'road' | 'rail' | 'air'
  title,
  description,
  details = [],
  icon,
  mapsUrl,
  mapsLabel = "Open in Google Maps",
  className = ''
}) {
  const [expanded, setExpanded] = useState(false);

  const icons = {
    road: '🚌',
    rail: '🚂',
    air: '✈️',
  };

  const gradients = {
    road: 'linear-gradient(135deg, #2E7D32, #4CAF50)',
    rail: 'linear-gradient(135deg, #1565C0, #2196F3)',
    air: 'linear-gradient(135deg, #6A1B9A, #9C27B0)',
  };

  const colors = {
    road: '#2E7D32',
    rail: '#1565C0',
    air: '#6A1B9A',
  };

  const modeIcon = icon || icons[mode] || '📍';
  const gradient = gradients[mode] || gradients.road;
  const color = colors[mode] || colors.road;

  return (
    <article
      className={`travel-card ${className}`}
      style={{
        background: 'var(--card)',
        border: '1px solid var(--line)',
        borderRadius: '16px',
        overflow: 'hidden',
        transition: 'transform .2s ease, box-shadow .2s ease',
        display: 'grid',
        gridTemplateRows: 'auto 1fr auto',
      }}
      onMouseOver={e => e.currentTarget.style.transform = 'translateY(-4px)'}
      onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
    >
      {/* Card Header with Icon */}
      <div
        className="travel-card-header"
        style={{
          background: gradient,
          color: '#fff',
          padding: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative background pattern */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'radial-gradient(circle at center, rgba(255,255,255,.1) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
            pointerEvents: 'none',
          }}
        />
        <div
          className="travel-card-icon"
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,.2)',
            backdropFilter: 'blur(8px)',
            display: 'grid',
            placeItems: 'center',
            fontSize: '2rem',
            flexShrink: 0,
            boxShadow: '0 4px 16px rgba(0,0,0,.2)',
            border: '2px solid rgba(255,255,255,.3)',
            transition: 'transform .3s ease',
          }}
        >
          {modeIcon}
        </div>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h3 style={{ fontFamily: 'var(--display)', fontSize: '1.35rem', margin: 0, fontWeight: 400 }}>
            {title}
          </h3>
          <p style={{ margin: '.25rem 0 0', opacity: .9, fontSize: '.95rem' }}>
            {description}
          </p>
        </div>
      </div>

      {/* Card Body */}
      <div
        className="travel-card-body"
        style={{
          padding: '1.25rem',
          display: 'grid',
          gap: '.75rem',
          maxHeight: expanded ? 'none' : '120px',
          overflow: 'hidden',
          transition: 'max-height .3s ease',
        }}
      >
        {details.map((detail, idx) => (
          <div
            key={idx}
            className="travel-detail"
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '.6rem',
              padding: '.5rem',
              background: 'var(--band)',
              borderRadius: '10px',
              border: '1px solid var(--line)',
              transition: 'all .15s ease',
            }}
            onMouseOver={e => { e.currentTarget.style.background = 'var(--card)'; e.currentTarget.style.borderColor = color; }}
            onMouseOut={e => { e.currentTarget.style.background = 'var(--band)'; e.currentTarget.style.borderColor = 'var(--line)'; }}
          >
            <span
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                background: gradient,
                color: '#fff',
                fontSize: '.7rem',
                fontWeight: 700,
                display: 'grid',
                placeItems: 'center',
                flexShrink: 0,
                marginTop: '2px',
              }}
            >
              {idx + 1}
            </span>
            <span style={{ fontSize: '.92rem', color: 'var(--fg)', lineHeight: 1.5 }}>
              {detail}
            </span>
          </div>
        ))}

        {/* Expand/Collapse indicator */}
        {details.length > 2 && (
          <button
            className="travel-expand-btn"
            onClick={() => setExpanded(!expanded)}
            aria-expanded={expanded}
            style={{
              background: 'none',
              border: '1px dashed var(--gold)',
              color: 'var(--gold)',
              padding: '.4rem .8rem',
              borderRadius: '999px',
              fontSize: '.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'inherit',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '.4rem',
              justifySelf: 'center',
              marginTop: '.5rem',
              transition: 'all .15s',
            }}
            onMouseOver={e => { e.target.style.background = 'var(--gold)'; e.target.style.color = 'var(--maroon-2)'; }}
            onMouseOut={e => { e.target.style.background = 'none'; e.target.style.color = 'var(--gold)'; }}
          >
            {expanded ? 'Show Less ▲' : 'Show More ▼'}
          </button>
        )}
      </div>

      {/* Card Footer - Google Maps Button */}
      {mapsUrl && (
        <div
          className="travel-card-footer"
          style={{
            padding: '1rem 1.25rem',
            background: 'var(--band)',
            borderTop: '1px solid var(--line)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn primary"
            style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '.5rem' }}
          >
            <span style={{ fontSize: '1.1rem' }}>🗺️</span>
            {mapsLabel}
          </a>
        </div>
      )}
    </article>
  );
}