import { useEffect, useMemo, useState, useRef } from 'react';
import { useSite } from '../SiteContext.jsx';
import { api, fmtDate } from '../api.js';

const EVENT_OPTIONS = ['All', 'General', 'Brahmadev Yatra', 'Kartik Utsav', 'Hanuman Jayanti', 'Diwali', 'Guru Purnima', 'Maha Shivaratri'];

export default function Gallery() {
  const { settings, refresh } = useSite();
  const [tab, setTab] = useState('gallery');
  const [photos, setPhotos] = useState(null);
  const [page, setPage] = useState(1);
  const [selectedEvent, setSelectedEvent] = useState('All');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [busy, setBusy] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const [form, setForm] = useState({ caption: '', uploaderName: '', uploaderPhone: '', event: 'General' });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);

  const fetchPhotos = async (pageNum = 1) => {
    setLoading(true); setError('');
    try {
      const params = new URLSearchParams({ page: String(pageNum), limit: '24' });
      if (selectedEvent !== 'All') params.set('event', selectedEvent);
      const data = await api(`/gallery/public/photos?${params.toString()}`);
      setPhotos(data);
    } catch (e) {
      setError(e.message || 'Could not load photos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPhotos(1); setPage(1); }, [selectedEvent]);

  function handleFileChange(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith('image/')) { setUploadStatus({ kind: 'error', text: 'Please select an image file.' }); return; }
    if (f.size > 10 * 1024 * 1024) { setUploadStatus({ kind: 'error', text: 'Image must be smaller than 10 MB.' }); return; }
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setUploadStatus(null);
  }

  function handleDrop(e) {
    e.preventDefault(); setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) handleFileChange({ target: { files: [f] } });
  }

  function removeFile() {
    setFile(null);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  async function handleUpload(e) {
    e.preventDefault();
    if (!file) { setUploadStatus({ kind: 'error', text: 'Please select a photo first.' }); return; }
    if (!form.uploaderName.trim()) { setUploadStatus({ kind: 'error', text: 'Please enter your name.' }); return; }
    setBusy(true); setUploadStatus(null);
    try {
      const formData = new FormData();
      formData.append('photo', file);
      formData.append('caption', form.caption);
      formData.append('uploaderName', form.uploaderName);
      formData.append('uploaderPhone', form.uploaderPhone);
      formData.append('event', form.event);
      const baseUrl = import.meta.env.VITE_API_URL || '/api';
      const res = await fetch(`${baseUrl}/gallery/public/photos/upload`, { method: 'POST', credentials: 'include', body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      setUploadStatus({ kind: 'ok', text: data.message || 'Photo submitted successfully! It will appear after approval.' });
      removeFile();
      setForm({ caption: '', uploaderName: '', uploaderPhone: '', event: 'General' });
      refresh();
    } catch (err) {
      setUploadStatus({ kind: 'error', text: err.message });
    } finally {
      setBusy(false);
    }
  }

  async function likePhoto(id, idx) {
    try {
      const res = await api(`/gallery/public/photos/${id}/like`, { method: 'POST' });
      setPhotos((prev) => prev ? { ...prev, items: prev.items.map((p, i) => i === idx ? { ...p, likes: res.likes } : p) } : prev);
    } catch {}
  }

  const allEvents = useMemo(() => {
    if (!settings?.festivals?.length) return EVENT_OPTIONS;
    const festEvents = settings.festivals.map((f) => f.name);
    return [...new Set([...EVENT_OPTIONS, ...festEvents])];
  }, [settings?.festivals]);

  const currentPhoto = photos?.items?.[lightboxIndex];

  return (
    <>
      {/* Page Hero */}
      <div className="gal-hero">
        <div className="wrap">
          <span className="eyebrow">Temple Memories</span>
          <h1>Photo Gallery</h1>
          <p>Share your darshan moments with the community. Photos are reviewed by the temple trust before appearing here.</p>
        </div>
      </div>

      {/* Tab Bar */}
      <div className="gal-tabs-bar">
        <div className="wrap">
          <div className="gal-tabs" role="tablist">
            <button
              role="tab"
              aria-selected={tab === 'gallery'}
              onClick={() => setTab('gallery')}
            >
              <span>🖼️</span> View Gallery
              {photos?.total > 0 && <span className="gal-count">{photos.total}</span>}
            </button>
            <button
              role="tab"
              aria-selected={tab === 'upload'}
              onClick={() => setTab('upload')}
            >
              <span>📤</span> Share Your Photo
            </button>
          </div>
        </div>
      </div>

      {/* GALLERY TAB */}
      {tab === 'gallery' && (
        <section className="sec" style={{ paddingTop: '2rem' }}>
          <div className="wrap">
            {/* Filter */}
            <div className="gal-filter-bar">
              <label htmlFor="evtFilter" className="sr-only">Filter by event</label>
              <select
                id="evtFilter"
                value={selectedEvent}
                onChange={(e) => setSelectedEvent(e.target.value)}
                className="event-select"
              >
                {allEvents.map((evt) => <option key={evt} value={evt}>{evt}</option>)}
              </select>
              {selectedEvent !== 'All' && (
                <button className="btn small" onClick={() => setSelectedEvent('All')}>✕ Clear filter</button>
              )}
            </div>

            {/* Grid */}
            {loading ? (
              <div className="photo-grid loading">
                {[...Array(12)].map((_, i) => <div key={i} className="photo-skeleton" />)}
              </div>
            ) : error ? (
              <div className="gal-empty">
                <div className="gal-empty-icon">⚠️</div>
                <p>{error}</p>
                <button className="btn small" onClick={() => fetchPhotos(page)}>Try again</button>
              </div>
            ) : !photos?.items?.length ? (
              <div className="gal-empty">
                <div className="gal-empty-icon">🙏</div>
                <p>No photos yet{selectedEvent !== 'All' ? ` for "${selectedEvent}"` : ''}.</p>
                <p className="small muted">Be the first to share a moment from your darshan!</p>
                <div className="btns" style={{ justifyContent: 'center', marginTop: '.5rem' }}>
                  {selectedEvent !== 'All' && <button className="btn small" onClick={() => setSelectedEvent('All')}>Show all</button>}
                  <button className="btn primary small" onClick={() => setTab('upload')}>Share a Photo</button>
                </div>
              </div>
            ) : (
              <div className="photo-grid" role="list">
                {photos.items.map((photo, idx) => (
                  <figure key={photo.id} className="photo-card" role="listitem" onClick={() => { setLightboxIndex(idx); setLightboxOpen(true); }}>
                    <img src={photo.imageUrl} alt={photo.caption || `Photo by ${photo.uploaderName}`} loading="lazy" className="photo-img" />
                    <figcaption className="photo-caption">
                      {photo.caption && <span className="cap-text">{photo.caption}</span>}
                      <div className="photo-meta">
                        <span>🙏 {photo.uploaderName}</span>
                        {photo.event !== 'General' && <span className="event-tag">{photo.event}</span>}
                        <button className="like-btn" onClick={(e) => { e.stopPropagation(); likePhoto(photo.id, idx); }} aria-label={`Like`}>
                          ♡ {photo.likes}
                        </button>
                      </div>
                    </figcaption>
                  </figure>
                ))}
              </div>
            )}

            {/* Pagination */}
            {photos?.pages > 1 && (
              <div className="pager" style={{ marginTop: '2rem' }}>
                <button className="btn small" disabled={page <= 1} onClick={() => { setPage(p => p - 1); fetchPhotos(page - 1); }}>← Prev</button>
                <span className="small muted">Page {page} of {photos.pages}</span>
                <button className="btn small" disabled={page >= photos.pages} onClick={() => { setPage(p => p + 1); fetchPhotos(page + 1); }}>Next →</button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* UPLOAD TAB */}
      {tab === 'upload' && (
        <section className="sec" style={{ paddingTop: '2rem' }}>
          <div className="wrap">
            <div className="gal-upload-layout">

              {/* Left: Form */}
              <div className="gal-upload-form-col">
                <form onSubmit={handleUpload}>
                  {/* Dropzone */}
                  <div
                    className={`upload-dropzone${dragOver ? ' drag-over' : ''}`}
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    onClick={() => !file && fileInputRef.current?.click()}
                    style={{ cursor: file ? 'default' : 'pointer' }}
                  >
                    <input ref={fileInputRef} type="file" accept="image/*" id="photoUpload" onChange={handleFileChange} hidden />
                    {preview ? (
                      <div className="gal-preview-wrap">
                        <img src={preview} alt="Preview" className="gal-preview-img" />
                        <button type="button" className="gal-preview-remove" onClick={(e) => { e.stopPropagation(); removeFile(); }} aria-label="Remove photo">✕</button>
                      </div>
                    ) : (
                      <div className="gal-dropzone-inner">
                        <div className="gal-upload-svg">
                          <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect x="4" y="12" width="56" height="40" rx="6" stroke="currentColor" strokeWidth="3"/>
                            <circle cx="32" cy="32" r="10" stroke="currentColor" strokeWidth="3"/>
                            <circle cx="32" cy="32" r="4" fill="currentColor"/>
                            <rect x="22" y="8" width="20" height="6" rx="3" stroke="currentColor" strokeWidth="2.5"/>
                          </svg>
                        </div>
                        <p className="gal-dz-title">Drag &amp; drop your photo here</p>
                        <p className="small muted">or tap to choose from your gallery / camera</p>
                        <button type="button" className="btn primary" style={{ marginTop: '.75rem' }} onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}>
                          Choose Photo
                        </button>
                        <p className="small muted" style={{ marginTop: '.5rem' }}>Max 10 MB · JPEG, PNG, WebP, GIF</p>
                      </div>
                    )}
                  </div>

                  {/* Form Fields — always visible */}
                  <div className="gal-fields">
                    <div className="field">
                      <label htmlFor="uploaderName">Your Name <span style={{ color: 'var(--danger)' }}>*</span></label>
                      <input
                        id="uploaderName"
                        type="text"
                        value={form.uploaderName}
                        onChange={(e) => setForm({ ...form, uploaderName: e.target.value })}
                        placeholder="e.g. Patil Family"
                        maxLength={120}
                        required
                      />
                    </div>
                    <div className="field">
                      <label htmlFor="uploaderPhone">Phone / WhatsApp <span className="muted small">(private, for temple office only)</span></label>
                      <input
                        id="uploaderPhone"
                        type="tel"
                        value={form.uploaderPhone}
                        onChange={(e) => setForm({ ...form, uploaderPhone: e.target.value })}
                        placeholder="e.g. 9876543210"
                        maxLength={20}
                        inputMode="tel"
                      />
                    </div>
                    <div className="field">
                      <label htmlFor="uploadEvent">Event / Occasion</label>
                      <select
                        id="uploadEvent"
                        value={form.event}
                        onChange={(e) => setForm({ ...form, event: e.target.value })}
                      >
                        {allEvents.filter(e => e !== 'All').map((evt) => <option key={evt} value={evt}>{evt}</option>)}
                      </select>
                    </div>
                    <div className="field">
                      <label htmlFor="caption">Caption <span className="muted small">(optional)</span></label>
                      <textarea
                        id="caption"
                        value={form.caption}
                        onChange={(e) => setForm({ ...form, caption: e.target.value })}
                        placeholder="e.g. Beautiful aarti at Brahmadev Devasthan…"
                        maxLength={300}
                        rows={3}
                      />
                    </div>

                    {uploadStatus && (
                      <div className={`status ${uploadStatus.kind}`} role="status">
                        {uploadStatus.kind === 'ok' ? '✅ ' : '⚠️ '}{uploadStatus.text}
                      </div>
                    )}

                    <button className="btn primary" type="submit" disabled={busy} style={{ width: '100%', justifyContent: 'center' }}>
                      {busy ? '⏳ Uploading…' : '🙏 Submit for Approval'}
                    </button>
                  </div>
                </form>
              </div>

              {/* Right: Info panel */}
              <div className="gal-upload-info-col">
                <div className="gal-info-card">
                  <h3>📋 Guidelines</h3>
                  <ul className="gal-guidelines">
                    <li>
                      <span className="gal-gl-icon">🔍</span>
                      <span>Photos are reviewed by the temple trust before appearing publicly.</span>
                    </li>
                    <li>
                      <span className="gal-gl-icon">🙏</span>
                      <span>Only share respectful, darshan-related images.</span>
                    </li>
                    <li>
                      <span className="gal-gl-icon">🔒</span>
                      <span>Your phone number is kept private — used only if the office needs to contact you.</span>
                    </li>
                    <li>
                      <span className="gal-gl-icon">📸</span>
                      <span>High-resolution photos look best in the gallery.</span>
                    </li>
                  </ul>
                </div>
                <div className="gal-info-card" style={{ background: 'linear-gradient(135deg, var(--maroon-2), var(--maroon))', color: 'var(--on-dark)', border: 'none' }}>
                  <h3 style={{ color: 'var(--gold-bright)' }}>✨ How it works</h3>
                  <div className="gal-steps">
                    <div className="gal-step"><span>1</span><p>Choose a photo from your phone or camera</p></div>
                    <div className="gal-step"><span>2</span><p>Fill in your name and a brief caption</p></div>
                    <div className="gal-step"><span>3</span><p>Submit — temple trust reviews within 24 hours</p></div>
                    <div className="gal-step"><span>4</span><p>Your photo appears in the gallery for all devotees!</p></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* LIGHTBOX */}
      {lightboxOpen && currentPhoto && (
        <div className="lightbox" onClick={() => setLightboxOpen(false)} role="dialog" aria-modal="true" aria-label="Photo view">
          <button className="lightbox-close" onClick={() => setLightboxOpen(false)} aria-label="Close">✕</button>
          <button className="lightbox-nav prev" onClick={(e) => { e.stopPropagation(); setLightboxIndex((i) => (i - 1 + photos.items.length) % photos.items.length); }} aria-label="Previous">‹</button>
          <button className="lightbox-nav next" onClick={(e) => { e.stopPropagation(); setLightboxIndex((i) => (i + 1) % photos.items.length); }} aria-label="Next">›</button>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <img src={currentPhoto.imageUrl} alt={currentPhoto.caption || ''} />
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
    </>
  );
}
