import { useState } from 'react';

/**
 * PhotoGrid - Reusable photo gallery grid component
 * Consistent with main gallery styling
 */
export default function PhotoGrid({
  photos = [],
  title = '',
  subtitle = '',
  emptyMessage = 'No photos available.',
  showLightbox = true,
  maxItems = null,
  className = '',
}) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const displayPhotos = maxItems ? photos.slice(0, maxItems) : photos;

  if (displayPhotos.length === 0) {
    return (
      <div className={`photo-grid-empty ${className}`} style={{ textAlign: 'center', padding: '3rem 1rem', display: 'grid', gap: '1rem', justifyItems: 'center' }}>
        <div style={{ fontSize: '3.5rem', lineHeight: 1 }}>🖼️</div>
        <h3 style={{ fontFamily: 'var(--display)', color: 'var(--heading)', margin: 0 }}>{title}</h3>
        <p style={{ color: 'var(--muted)', maxWidth: '30ch' }}>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={`photo-grid-container ${className}`} style={{ display: 'grid', gap: '1rem' }}>
      {title && (
        <div style={{ gridColumn: '1 / -1', marginBottom: '.5rem' }}>
          <h3 style={{ color: 'var(--heading)', display: 'flex', alignItems: 'center', gap: '.5rem', fontFamily: 'var(--display)', fontSize: '1.35rem', margin: 0 }}>
            🖼️ {title}
            {subtitle && <span style={{ fontSize: '.85rem', fontWeight: 400, color: 'var(--muted)' }}>{subtitle}</span>}
          </h3>
        </div>
      )}
      <div className="photo-grid" role="list" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
        {displayPhotos.map((photo, idx) => (
          <figure
            key={photo.id}
            className="photo-card"
            role="listitem"
            onClick={() => showLightbox && (setLightboxIndex(idx), setLightboxOpen(true))}
            style={{ cursor: showLightbox ? 'pointer' : 'default', margin: 0, background: 'var(--card)', border: '1px solid var(--line)', borderRadius: '12px', overflow: 'hidden', transition: 'transform .15s ease, box-shadow .15s ease' }}
            onMouseOver={e => { if (showLightbox) e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 30px -12px rgba(0,0,0,.15)'; }}
            onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
          >
            <img src={photo.imageUrl} alt={photo.caption || `Photo by ${photo.uploaderName}`} loading="lazy" className="photo-img" style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover', display: 'block' }} />
            <figcaption className="photo-caption" style={{ padding: '.75rem', display: 'grid', gap: '.35rem' }}>
              {photo.caption && <span className="cap-text" style={{ fontSize: '.9rem', color: 'var(--fg)' }}>{photo.caption}</span>}
              <div className="photo-meta" style={{ display: 'flex', flexWrap: 'wrap', gap: '.5rem', alignItems: 'center', fontSize: '.8rem', color: 'var(--muted)' }}>
                <span>🙏 {photo.uploaderName}</span>
                {photo.event !== 'General' && <span className="event-tag" style={{ background: 'var(--band)', border: '1px solid var(--line)', borderRadius: '999px', padding: '.1rem .5rem', fontSize: '.75rem', color: 'var(--saffron)', fontWeight: 600 }}>{photo.event}</span>}
              </div>
            </figcaption>
          </figure>
        ))}
      </div>

      {/* Lightbox */}
      {showLightbox && lightboxOpen && displayPhotos[lightboxIndex] && (
        <div className="lightbox" onClick={() => setLightboxOpen(false)} role="dialog" aria-modal="true" aria-label="Photo view" style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(20,10,8,.95)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', animation: 'fadeIn .2s ease' }}>
          <button className="lightbox-close" onClick={() => setLightboxOpen(false)} aria-label="Close" style={{ position: 'absolute', top: '1rem', right: '1.5rem', fontSize: '2rem', background: 'none', border: 0, color: 'var(--on-dark)', cursor: 'pointer', lineHeight: 1, width: '44px', height: '44px', borderRadius: '50%', display: 'grid', placeItems: 'center', transition: 'background .2s' }} onMouseOver={e => e.target.style.background = 'rgba(255,255,255,.1)'} onMouseOut={e => e.target.style.background = 'none'}>✕</button>
          <button className="lightbox-nav prev" onClick={(e) => { e.stopPropagation(); setLightboxIndex((i) => (i - 1 + displayPhotos.length) % displayPhotos.length); }} aria-label="Previous" style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', fontSize: '3rem', background: 'none', border: 0, color: 'var(--on-dark)', cursor: 'pointer', lineHeight: 1, padding: '1rem', opacity: '.7', transition: 'opacity .2s' }} onMouseOver={e => e.target.style.opacity = 1} onMouseOut={e => e.target.style.opacity = .7}>‹</button>
          <button className="lightbox-nav next" onClick={(e) => { e.stopPropagation(); setLightboxIndex((i) => (i + 1) % displayPhotos.length); }} aria-label="Next" style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', right: '1rem', fontSize: '3rem', background: 'none', border: 0, color: 'var(--on-dark)', cursor: 'pointer', lineHeight: 1, padding: '1rem', opacity: '.7', transition: 'opacity .2s' }} onMouseOver={e => e.target.style.opacity = 1} onMouseOut={e => e.target.style.opacity = .7}>›</button>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()} style={{ display: 'grid', gridTemplateColumns: '1fr minmax(0,350px)', gap: '2rem', maxWidth: '1100px', width: '100%', maxHeight: '85vh', alignItems: 'center' }}>
            <img src={displayPhotos[lightboxIndex].imageUrl} alt={displayPhotos[lightboxIndex].caption || `Photo by ${displayPhotos[lightboxIndex].uploaderName}`} style={{ maxWidth: '100%', maxHeight: '80vh', borderRadius: '8px', boxShadow: '0 20px 60px -20px rgba(0,0,0,.5)' }} />
            <div className="lightbox-info" style={{ display: 'grid', gap: '.5rem', color: 'var(--on-dark)' }}>
              <p style={{ fontSize: '1.1rem', color: 'var(--on-dark)' }}>{displayPhotos[lightboxIndex].caption || <span style={{ color: 'var(--muted)' }}>No caption</span>}</p>
              <div className="lightbox-meta" style={{ display: 'flex', flexWrap: 'wrap', gap: '.75rem', fontSize: '.9rem', color: 'var(--muted)' }}>
                <span>🙏 {displayPhotos[lightboxIndex].uploaderName}</span>
                {displayPhotos[lightboxIndex].event !== 'General' && <span className="event-tag" style={{ background: 'var(--band)', border: '1px solid var(--line)', borderRadius: '999px', padding: '.1rem .5rem', fontSize: '.75rem', color: 'var(--saffron)', fontWeight: 600 }}>{displayPhotos[lightboxIndex].event}</span>}
                <span className="muted">{new Date(displayPhotos[lightboxIndex].createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}