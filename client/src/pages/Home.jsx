import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useSite } from '../SiteContext.jsx';
import { inr, api, fmtDate } from '../api.js';
import { Toran, Shrine, SectionHead, Tbc } from '../components/Decor.jsx';
import FestivalCalendar from '../components/FestivalCalendar.jsx';
import TravelCard from '../components/TravelCard.jsx';

const MAPS = 'https://www.google.com/maps/search/?api=1&query=Kallali%2C%20Mukhed%2C%20Nanded%2C%20Maharashtra';

export default function Home() {
  const { settings, summary, t } = useSite();
  const timings = settings?.darshanTimings || [];
  const festivals = settings?.festivals || [];
  const c = {
    person: settings?.contact?.person || 'Maruti kunjatwad',
    phone: settings?.contact?.phone || '9503131031',
    email: settings?.contact?.email || '',
  };

  // Fetch all approved photos and videos for the home page
  const [galleryPhotos, setGalleryPhotos] = useState([]);
  const [galleryVideos, setGalleryVideos] = useState([]);
  const [activeMediaTab, setActiveMediaTab] = useState('all'); // 'all' | 'photos' | 'videos'

  // Lightboxes for Home page
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [videoLightboxOpen, setVideoLightboxOpen] = useState(false);
  const [videoLightboxIndex, setVideoLightboxIndex] = useState(0);

  useEffect(() => {
    api('/gallery/public/photos?limit=100').then((data) => {
      if (data?.items) setGalleryPhotos(data.items);
    }).catch(() => {});
    api('/gallery/public/videos?limit=100').then((data) => {
      if (data?.items) setGalleryVideos(data.items);
    }).catch(() => {});
  }, []);

  // Keyboard navigation for lightboxes
  useEffect(() => {
    if (!lightboxOpen) return;
    function handleKeyDown(e) {
      if (e.key === 'Escape') setLightboxOpen(false);
      else if (e.key === 'ArrowLeft') setLightboxIndex((i) => (i - 1 + (galleryPhotos.length || 1)) % (galleryPhotos.length || 1));
      else if (e.key === 'ArrowRight') setLightboxIndex((i) => (i + 1) % (galleryPhotos.length || 1));
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen, galleryPhotos]);

  useEffect(() => {
    if (!videoLightboxOpen) return;
    function handleKeyDown(e) {
      if (e.key === 'Escape') setVideoLightboxOpen(false);
      else if (e.key === 'ArrowLeft') setVideoLightboxIndex((i) => (i - 1 + (galleryVideos.length || 1)) % (galleryVideos.length || 1));
      else if (e.key === 'ArrowRight') setVideoLightboxIndex((i) => (i + 1) % (galleryVideos.length || 1));
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [videoLightboxOpen, galleryVideos]);

  async function likePhoto(id, idx) {
    try {
      const res = await api(`/gallery/public/photos/${id}/like`, { method: 'POST' });
      setGalleryPhotos((prev) => prev.map((p, i) => i === idx ? { ...p, likes: res.likes } : p));
    } catch {}
  }

  async function likeVideo(id, idx) {
    try {
      const res = await api(`/gallery/public/videos/${id}/like`, { method: 'POST' });
      setGalleryVideos((prev) => prev.map((v, i) => i === idx ? { ...v, likes: res.likes } : v));
    } catch {}
  }

  const currentPhoto = galleryPhotos[lightboxIndex];
  const currentVideo = galleryVideos[videoLightboxIndex];

  return (
    <>
      <Toran />
      <section className="hero" id="home">
        <div className="wrap" style={{ display: 'grid', gridTemplateColumns: '1.3fr .7fr', gap: '2rem', alignItems: 'center', paddingBlock: '3rem 3.5rem' }}>
          <div className="hero-text" style={{ display: 'grid', gap: '1.1rem', minWidth: 0 }}>
            <div className="mr-name" lang="mr">{t.hero.deity}</div>
            <h1>{t.hero.title}</h1>
            <p className="lede">{t.hero.lede}</p>
            <div className="btns">
              <Link className="btn primary" to="/donate">{t.hero.offerDaan}</Link>
              <Link className="btn light" to="/ledger">{t.hero.seeLedger}</Link>
            </div>
            <div className="hero-stats" aria-live="polite">
              <div><strong>{summary?.received?.total !== undefined ? inr(summary.received.total) : '—'}</strong><span>{t.hero.daanReceived}</span></div>
              <div><strong>{summary?.received?.count ?? '—'}</strong><span>{t.hero.offerings}</span></div>
              <div><strong>{summary?.spent?.total !== undefined ? inr(summary.spent.total) : '—'}</strong><span>{t.hero.spentOnSeva}</span></div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', padding: '2rem 0' }}>
            <div style={{
              position: 'absolute',
              width: '260px',
              height: '260px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(245,176,65,.18) 0%, rgba(230,126,34,.08) 60%, transparent 80%)',
              filter: 'blur(8px)',
            }} />
            <Shrine style={{
              width: '100%',
              maxWidth: '260px',
              filter: 'drop-shadow(0 12px 32px rgba(0,0,0,.35))',
              position: 'relative',
              zIndex: 1,
            }} />
          </div>
        </div>
      </section>

      <section className="sec" id="about">
        <div className="wrap">
          <SectionHead eyebrow={t.about.eyebrow} title={t.about.title} rule />
          <div className="split">
            <div className="prose">
              <p>{t.about.p1}</p>
              <p>{t.about.p2}</p>
              <p style={{ fontFamily: 'var(--display)', fontSize: '1.15rem', color: 'var(--saffron)' }}>{t.about.blessing}</p>
            </div>
            <div className="cols">
              <div className="card icon-card">
                <div className="icon-wrap">🕉️</div>
                <h3>{t.about.c1Title}</h3>
                <p>{t.about.c1Text}</p>
              </div>
              <div className="card icon-card">
                <div className="icon-wrap">🙏</div>
                <h3>{t.about.c2Title}</h3>
                <p>{t.about.c2Text}</p>
              </div>
              <div className="card icon-card">
                <div className="icon-wrap">📖</div>
                <h3>{t.about.c3Title}</h3>
                <p>{t.about.c3Text}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="sec alt" id="history">
        <div className="wrap">
          <SectionHead eyebrow={t.history.eyebrow} title={t.history.title}>
            <p>{t.history.desc}</p>
          </SectionHead>
          <div className="split">
            <ol className="timeline">
              <li>
                <div className="timeline-icon">🏛️</div>
                <strong>{t.history.t1Title}</strong>
                <span>{t.history.t1Sub}</span>
                <Tbc />
              </li>
              <li>
                <div className="timeline-icon">🕉️</div>
                <strong>{t.history.t2Title}</strong>
                <span>{t.history.t2Sub}</span>
                <Tbc />
              </li>
              <li>
                <div className="timeline-icon">🏗️</div>
                <strong>{t.history.t3Title}</strong>
                <span>{t.history.t3Sub}</span>
                <Tbc />
              </li>
              <li>
                <div className="timeline-icon">📜</div>
                <strong>{t.history.t4Title}</strong>
                <span>{t.history.t4Sub}</span>
                <Tbc />
              </li>
              <li>
                <div className="timeline-icon">👨‍👩‍👧‍👦</div>
                <strong>{t.history.t5Title}</strong>
                <span>{t.history.t5Sub}</span>
                <Tbc />
              </li>
            </ol>
            <div className="note">
              <strong>{t.history.trustNoteTitle}</strong>{t.history.trustNoteText}
            </div>
          </div>
        </div>
      </section>

      <section className="sec" id="worship">
        <div className="wrap">
          <SectionHead eyebrow={t.worship.eyebrow} title={t.worship.title}>
            <p>{t.worship.desc}</p>
          </SectionHead>
          {timings.length > 0 ? (
            <div className="seva-cards" role="list">
              {timings.map((tRow, idx) => (
                <article key={tRow.seva} className="seva-card" role="listitem">
                  <div className="seva-icon">
                    {/aarti/i.test(tRow.seva) ? '🪔' : /abhishek|puja/i.test(tRow.seva) ? '🕉️' : '🙏'}
                  </div>
                  <div className="seva-content">
                    <h3>{tRow.seva}</h3>
                    <div className="seva-time">
                      <span className="time-icon">🕐</span>
                      <span>{/confirm/i.test(tRow.time) || !tRow.time ? <Tbc /> : tRow.time}</span>
                    </div>
                    <p className="seva-details">{tRow.details}</p>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="tablebox">
              <table className="info">
                <thead><tr><th>{t.worship.colSeva}</th><th>{t.worship.colTime}</th><th>{t.worship.colDetails}</th></tr></thead>
                <tbody>
                  <tr><td colSpan="3" className="empty">{t.worship.emptyTimings}</td></tr>
                  <tr><td>{t.worship.specialPuja}</td><td>{t.worship.onRequest}</td><td>{t.worship.bookContact}</td></tr>
                </tbody>
              </table>
            </div>
          )}
          <div className="special-puja-card">
            <div className="special-puja-icon">🕉️</div>
            <div>
              <h3>{t.worship.specialPuja}</h3>
              <p><span className="time-icon">🕐</span> {t.worship.onRequest}</p>
              <p>{t.worship.bookContact}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="sec alt" id="festivals">
        <div className="wrap">
          <SectionHead eyebrow={t.festivals.eyebrow} title={t.festivals.title}>
            <p>{t.festivals.calendarDesc}</p>
          </SectionHead>
          <FestivalCalendar
            festivals={festivals}
            initialMonth={new Date().getMonth()}
            showMonthNav={true}
            t={t.festivals}
            lang={settings?.lang || 'en'}
          />
        </div>
      </section>

      <section className="sec" id="visit">
        <div className="wrap">
          <SectionHead eyebrow={t.visit.eyebrow} title={t.visit.title} />

          {/* Location Info Cards */}
          <div className="cols" style={{ marginBottom: '2rem', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
            <div className="card" style={{ textAlign: 'center', padding: '1.5rem' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '.5rem' }}>🕉️</div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--heading)' }}>{t.visit.templeLabel}</h3>
              <p style={{ margin: '.25rem 0 0', color: 'var(--muted)', fontWeight: 500 }}>{t.visit.templeVal}</p>
            </div>
            <div className="card" style={{ textAlign: 'center', padding: '1.5rem' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '.5rem' }}>📍</div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--heading)' }}>{t.visit.villageLabel}</h3>
              <p style={{ margin: '.25rem 0 0', color: 'var(--muted)', fontWeight: 500 }}>{t.visit.villageVal}</p>
            </div>
            <div className="card" style={{ textAlign: 'center', padding: '1.5rem' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '.5rem' }}>🏛️</div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--heading)' }}>{t.visit.talukaLabel}</h3>
              <p style={{ margin: '.25rem 0 0', color: 'var(--muted)', fontWeight: 500 }}>{t.visit.talukaVal}</p>
            </div>
            <div className="card" style={{ textAlign: 'center', padding: '1.5rem' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '.5rem' }}>🗺️</div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--heading)' }}>{t.visit.districtLabel}</h3>
              <p style={{ margin: '.25rem 0 0', color: 'var(--muted)', fontWeight: 500 }}>{t.visit.districtVal}</p>
            </div>
          </div>

          {/* Travel Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
            {/* Road Travel */}
            <TravelCard
              mode="road"
              title={t.visit.byRoad}
              description={t.visit.roadDesc}
              details={[
                t.visit.distanceFromMukhed,
                t.visit.distanceFromNanded,
                t.visit.travelTimeRoad,
                'Regular ST buses from Mukhed to Kallali',
                'Private taxis/auto-rickshaws available at Mukhed',
              ]}
              mapsUrl={MAPS}
              mapsLabel={t.visit.mapsBtn}
            />

            {/* Rail Travel */}
            <TravelCard
              mode="rail"
              title={t.visit.byRail}
              description={t.visit.railDesc}
              details={[
                t.visit.distanceFromNanded,
                t.visit.travelTimeRail,
                'Major station: Nanded (NED) — connected to Mumbai, Hyderabad, Pune, Delhi',
                'Regular trains: Devagiri Exp, Sachkhand Exp, Nanded Express',
                'Auto/bus from Nanded station to Mukhed (2 hrs)',
              ]}
              mapsUrl={`https://www.google.com/maps/dir//Nanded+Railway+Station+Nanded+Maharashtra/@19.1617,77.3048,12z`}
              mapsLabel="Nanded Station on Maps"
            />

            {/* Air Travel */}
            <TravelCard
              mode="air"
              title={t.visit.byAir}
              description={t.visit.airDesc}
              details={[
                t.visit.distanceFromNanded,
                t.visit.travelTimeAir,
                'Airport: Shri Guru Gobind Singh Ji Airport (NDC), Nanded',
                'Direct flights from Mumbai (1h 15m), Hyderabad (1h)',
                'Taxi from airport to Mukhed (~2 hrs, ~65 km)',
              ]}
              mapsUrl={`https://www.google.com/maps/dir//Shri+Guru+Gobind+Singh+Ji+Airport+Nanded/@19.1867,77.3167,12z`}
              mapsLabel="Nanded Airport on Maps"
            />
          </div>

          {/* Google Maps Embed */}
          <div style={{ marginTop: '2.5rem', borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--line)', boxShadow: '0 8px 24px -8px rgba(0,0,0,.1)' }}>
            <div style={{ background: 'var(--maroon-2)', color: 'var(--on-dark)', padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', borderBottom: '2px solid var(--gold)' }}>
              <h3 style={{ fontFamily: 'var(--display)', color: 'var(--gold-bright)', margin: 0, fontSize: '1.25rem' }}>
                🗺️ {t.visit.mapEmbedTitle}
              </h3>
              <a href={MAPS} target="_blank" rel="noopener noreferrer" className="btn light small" style={{ textDecoration: 'none' }}>
                Open Full Map
              </a>
            </div>
            <div style={{ width: '100%', aspectRatio: '16/9', minHeight: '350px' }}>
              <iframe
                src={`https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d125840.543212345!2d77.3048!3d19.1617!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bd6e5e5e5e5e5e5%3A0x5e5e5e5e5e5e5e5e!2sKallali%2C+Mukhed%2C+Nanded%2C+Maharashtra!5e0!3m2!1sen!2sin!4v1234567890`}
                width="100%"
                height="100%"
                style={{ border: 0, display: 'block' }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Shri Kshetra Brahmadev Devasthan location on Google Maps"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="sec alt" id="gallery">
        <div className="wrap">
          <SectionHead eyebrow={t.gallery.eyebrow} title={t.gallery.title}>
            <p>{t.gallery.desc1}<Link to="/gallery?tab=upload">{t.gallery.descLink}</Link>{t.gallery.desc2}</p>
          </SectionHead>

          {/* Media Filter Tabs */}
          <div className="media-type-toggle" style={{ margin: '0 auto', maxWidth: '100%', overflowX: 'auto' }}>
            <button
              type="button"
              className={`media-toggle-btn${activeMediaTab === 'all' ? ' active' : ''}`}
              onClick={() => setActiveMediaTab('all')}
            >
              🌟 All ({galleryPhotos.length + galleryVideos.length})
            </button>
            <button
              type="button"
              className={`media-toggle-btn${activeMediaTab === 'photos' ? ' active' : ''}`}
              onClick={() => setActiveMediaTab('photos')}
            >
              🖼️ Photos ({galleryPhotos.length})
            </button>
            <button
              type="button"
              className={`media-toggle-btn${activeMediaTab === 'videos' ? ' active' : ''}`}
              onClick={() => setActiveMediaTab('videos')}
            >
              🎬 Videos ({galleryVideos.length})
            </button>
          </div>

          {/* Photos Block */}
          {(activeMediaTab === 'all' || activeMediaTab === 'photos') && (
            <div style={{ display: 'grid', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', borderBottom: '1px solid var(--line)', paddingBottom: '.5rem', flexWrap: 'wrap' }}>
                <h3 style={{ color: 'var(--heading)', display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                  <span>🖼️</span> {settings?.lang === 'mr' ? 'सर्व छायाचित्रे' : 'Photo Gallery'}
                  <span className="gal-count">{galleryPhotos.length}</span>
                </h3>
                <Link to="/gallery" className="btn small">{t.gallery.viewAll}</Link>
              </div>

              {galleryPhotos.length > 0 ? (
                <div className="photo-grid" role="list">
                  {galleryPhotos.map((photo, idx) => (
                    <figure
                      key={photo.id}
                      className="photo-card"
                      role="listitem"
                      onClick={() => { setLightboxIndex(idx); setLightboxOpen(true); }}
                      style={{ cursor: 'pointer' }}
                    >
                      <img src={photo.imageUrl} alt={photo.caption || `Temple photo by ${photo.uploaderName}`} loading="lazy" className="photo-img" />
                      <figcaption className="photo-caption">
                        {photo.caption && <span className="cap-text">{photo.caption}</span>}
                        <div className="photo-meta">
                          <span>🙏 {photo.uploaderName}</span>
                          {photo.event !== 'General' && <span className="event-tag">{photo.event}</span>}
                          <button
                            className="like-btn"
                            onClick={(e) => { e.stopPropagation(); likePhoto(photo.id, idx); }}
                            aria-label="Like photo"
                          >
                            ♡ {photo.likes}
                          </button>
                        </div>
                      </figcaption>
                    </figure>
                  ))}
                </div>
              ) : (
                <div className="gal-empty" style={{ padding: '2rem 1rem' }}>
                  <div className="gal-empty-icon">🖼️</div>
                  <p>No photos yet.</p>
                  <Link to="/gallery?tab=upload" className="btn primary small">Upload a photo</Link>
                </div>
              )}
            </div>
          )}

          {/* Videos Block */}
          {(activeMediaTab === 'all' || activeMediaTab === 'videos') && (
            <div style={{ display: 'grid', gap: '1rem', marginTop: activeMediaTab === 'all' ? '1.5rem' : '0' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', borderBottom: '1px solid var(--line)', paddingBottom: '.5rem', flexWrap: 'wrap' }}>
                <h3 style={{ color: 'var(--heading)', display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                  <span>🎬</span> {settings?.lang === 'mr' ? 'व्हिडिओ दर्शन' : 'Video Gallery'}
                  <span className="gal-count">{galleryVideos.length}</span>
                </h3>
                <Link to="/gallery?tab=videos" className="btn small">View all videos</Link>
              </div>

              {galleryVideos.length > 0 ? (
                <div className="video-grid" role="list">
                  {galleryVideos.map((video, idx) => (
                    <figure
                      key={video.id}
                      className="video-card"
                      role="listitem"
                      onClick={() => { setVideoLightboxIndex(idx); setVideoLightboxOpen(true); }}
                    >
                      <div className="video-thumb-wrap">
                        {video.thumbnailUrl
                          ? <img src={video.thumbnailUrl} alt={video.caption || `Video by ${video.uploaderName}`} loading="lazy" className="video-thumb" />
                          : <div className="video-thumb-placeholder">🎬</div>
                        }
                        <div className="video-play-btn" aria-hidden="true">▶</div>
                      </div>
                      <figcaption className="photo-caption">
                        {video.caption && <span className="cap-text">{video.caption}</span>}
                        <div className="photo-meta">
                          <span>🙏 {video.uploaderName}</span>
                          {video.event !== 'General' && <span className="event-tag">{video.event}</span>}
                          <button
                            className="like-btn"
                            onClick={(e) => { e.stopPropagation(); likeVideo(video.id, idx); }}
                            aria-label="Like video"
                          >
                            ♡ {video.likes}
                          </button>
                        </div>
                      </figcaption>
                    </figure>
                  ))}
                </div>
              ) : (
                <div className="gal-empty" style={{ padding: '2rem 1rem' }}>
                  <div className="gal-empty-icon">🎬</div>
                  <p>No videos yet.</p>
                  <Link to="/gallery?tab=upload" className="btn primary small">Upload a video</Link>
                </div>
              )}
            </div>
          )}

          <div className="btns" style={{ justifyContent: 'center', marginTop: '1.5rem' }}>
            <Link to="/gallery" className="btn primary">{t.gallery.viewAll}</Link>
            <Link to="/gallery?tab=upload" className="btn">{t.gallery.sharePhoto}</Link>
          </div>
        </div>
      </section>

      <section className="sec contact" id="contact">
        <div className="wrap">
          <SectionHead eyebrow={t.contact.eyebrow} title={t.contact.title}>
            <p>{t.contact.desc}</p>
          </SectionHead>
          <div className="split">
            <dl>
              <dt>{t.contact.person}</dt><dd>{c.person || <Tbc>Trustee / administrator</Tbc>}</dd>
              <dt>{t.contact.phone}</dt><dd>{c.phone ? <a href={`tel:${c.phone}`}>{c.phone}</a> : <Tbc>Official number</Tbc>}</dd>
              <dt>{t.contact.email}</dt><dd>{c.email ? <a href={`mailto:${c.email}`}>{c.email}</a> : <Tbc>Official email</Tbc>}</dd>
              <dt>{t.contact.address}</dt><dd style={{ whiteSpace: 'pre-line' }}>{t.contact.addressVal}</dd>
            </dl>
            <div className="cols">
              <div className="card">
                <h3>{t.contact.card1Title}</h3>
                <p>{t.contact.card1Text}</p>
                <Link to="/donate">{t.contact.card1Link}</Link>
              </div>
              <div className="card">
                <h3>{t.contact.card2Title}</h3>
                <p>{t.contact.card2Text}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PHOTO LIGHTBOX ─────────────────────────────────── */}
      {lightboxOpen && currentPhoto && (
        <div className="lightbox" onClick={() => setLightboxOpen(false)} role="dialog" aria-modal="true" aria-label="Photo view">
          <button className="lightbox-close" onClick={() => setLightboxOpen(false)} aria-label="Close">✕</button>
          <button className="lightbox-nav prev" onClick={(e) => { e.stopPropagation(); setLightboxIndex((i) => (i - 1 + galleryPhotos.length) % galleryPhotos.length); }} aria-label="Previous">‹</button>
          <button className="lightbox-nav next" onClick={(e) => { e.stopPropagation(); setLightboxIndex((i) => (i + 1) % galleryPhotos.length); }} aria-label="Next">›</button>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <img src={currentPhoto.imageUrl} alt={currentPhoto.caption || `Photo by ${currentPhoto.uploaderName}`} />
            <div className="lightbox-info">
              <p>{currentPhoto.caption || <span className="muted">No caption</span>}</p>
              <div className="lightbox-meta">
                <span>🙏 {currentPhoto.uploaderName}</span>
                {currentPhoto.event !== 'General' && <span className="event-tag">{currentPhoto.event}</span>}
                <span className="muted">{fmtDate(currentPhoto.createdAt)}</span>
              </div>
              <button className="like-btn" style={{ marginTop: '.5rem', fontSize: '1.1rem' }} onClick={() => likePhoto(currentPhoto.id, lightboxIndex)}>
                ♡ {currentPhoto.likes} likes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── VIDEO LIGHTBOX ─────────────────────────────────── */}
      {videoLightboxOpen && currentVideo && (
        <div className="lightbox" onClick={() => setVideoLightboxOpen(false)} role="dialog" aria-modal="true" aria-label="Video view">
          <button className="lightbox-close" onClick={() => setVideoLightboxOpen(false)} aria-label="Close">✕</button>
          <button className="lightbox-nav prev" onClick={(e) => { e.stopPropagation(); setVideoLightboxIndex((i) => (i - 1 + galleryVideos.length) % galleryVideos.length); }} aria-label="Previous">‹</button>
          <button className="lightbox-nav next" onClick={(e) => { e.stopPropagation(); setVideoLightboxIndex((i) => (i + 1) % galleryVideos.length); }} aria-label="Next">›</button>
          <div className="lightbox-content lightbox-video-content" onClick={(e) => e.stopPropagation()}>
            <video src={currentVideo.videoUrl} controls autoPlay className="lightbox-video" />
            <div className="lightbox-info">
              <p>{currentVideo.caption || <span className="muted">No caption</span>}</p>
              <div className="lightbox-meta">
                <span>🙏 {currentVideo.uploaderName}</span>
                {currentVideo.event !== 'General' && <span className="event-tag">{currentVideo.event}</span>}
                <span className="muted">{fmtDate(currentVideo.createdAt)}</span>
              </div>
              <button className="like-btn" style={{ marginTop: '.5rem', fontSize: '1.1rem' }} onClick={() => likeVideo(currentVideo.id, videoLightboxIndex)}>
                ♡ {currentVideo.likes} likes
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
