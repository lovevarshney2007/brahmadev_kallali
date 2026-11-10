import { useEffect, useMemo, useState, useRef } from 'react';
import { useSite } from '../SiteContext.jsx';
import { api, inr, fmtDate } from '../api.js';
import { SectionHead } from '../components/Decor.jsx';

const EVENT_OPTIONS = ['All', 'General', 'Brahmadev Yatra', 'Kartik Utsav', 'Hanuman Jayanti', 'Diwali', 'Guru Purnima', 'Maha Shivaratri'];

export default function Gallery() {
  const { settings, refresh } = useSite();
  const [tab, setTab] = useState('gallery'); // 'gallery' | 'upload'
  const [photos, setPhotos] = useState(null);
  const [page, setPage] = useState(1);
  const [selectedEvent, setSelectedEvent] = useState('All');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [busy, setBusy] = useState(false);

  // Upload form state
  const [form, setForm] = useState({
    caption: '',
    uploaderName: '',
    uploaderPhone: '',
    event: 'General',
  });
  const [file, setFile] = useState(null);
  const fileInputRef = useRef(null);

  // Fetch photos
  const fetchPhotos = async (pageNum = 1) => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({
        page: String(pageNum),
        limit: '24',
      });
      if (selectedEvent !== 'All') params.set('event', selectedEvent);
      const data = await api(`/gallery/public/photos?${params.toString()}`);
      setPhotos(data);
    } catch (e) {
      setError(e.message || 'Could not load photos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPhotos(1);
    setPage(1);
  }, [selectedEvent]);

  // Handle file selection
  function handleFileChange(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith('image/')) {
      setUploadStatus({ kind: 'error', text: 'Please select an image file.' });
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      setUploadStatus({ kind: 'error', text: 'Image must be smaller than 10 MB.' });
      return;
    }
    setFile(f);
    setUploadStatus(null);
  }

  // Handle drag & drop
  function handleDragOver(e) {
    e.preventDefault();
    e.currentTarget.classList.add('drag-over');
  }
  function handleDragLeave(e) {
    e.currentTarget.classList.remove('drag-over');
  }
  function handleDrop(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
    const f = e.dataTransfer.files?.[0];
    if (f) handleFileChange({ target: { files: [f] } });
  }

  // Upload photo
  async function handleUpload(e) {
    e.preventDefault();
    if (!file) {
      setUploadStatus({ kind: 'error', text: 'Please select a photo first.' });
      return;
    }
    setBusy(true);
    setUploadStatus(null);
    try {
      const formData = new FormData();
      formData.append('photo', file);
      formData.append('caption', form.caption);
      formData.append('uploaderName', form.uploaderName);
      formData.append('uploaderPhone', form.uploaderPhone);
      formData.append('event', form.event);

      const res = await fetch('/api/gallery/public/photos/upload', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      setUploadStatus({ kind: 'ok', text: data.message });
      setFile(null);
      setForm({ caption: '', uploaderName: '', uploaderPhone: '', event: 'General' });
      if (fileInputRef.current) fileInputRef.current.value = '';
      refresh(); // refresh site context in case events updated
    } catch (err) {
      setUploadStatus({ kind: 'error', text: err.message });
    } finally {
      setBusy(false);
    }
  }

  // Like photo
  async function likePhoto(id, idx) {
    try {
      const res = await api(`/gallery/public/photos/${id}/like`, { method: 'POST' });
      setPhotos((prev) =>
        prev
          ? { ...prev, items: prev.items.map((p, i) => (i === idx ? { ...p, likes: res.likes } : p)) }
          : prev
      );
    } catch (err) {
      console.error(err);
    }
  }

  // Open lightbox
  function openLightbox(idx) {
    setLightboxIndex(idx);
    setLightboxOpen(true);
  }

  // Close lightbox
  function closeLightbox() {
    setLightboxOpen(false);
  }

  // Navigate lightbox
  function navLightbox(dir) {
    if (!photos) return;
    setLightboxIndex((i) => (i + dir + photos.items.length) % photos.items.length);
  }

  const allEvents = useMemo(() => {
    if (!settings?.festivals?.length) return EVENT_OPTIONS;
    const festEvents = settings.festivals.map((f) => f.name);
    return [...new Set([...EVENT_OPTIONS, ...festEvents])];
  }, [settings?.festivals]);

  return (
    <section className="sec page-top" id="gallery">
      <div className="wrap">
        <SectionHead eyebrow="Temple Moments" title="Photo Gallery">
          <p>
            Share your darshan memories! Upload photos from your phone gallery or camera.
            {tab === 'gallery' ? ' Approved photos appear here.' : ' After moderation, your photo will appear for all devotees to see.'}
          </p>
        </SectionHead>

        {/* Tab Switcher */}
        <div className="tabs" role="tablist" style={{ marginBottom: '1.5rem', justifySelf: 'start' }}>
          <button role="tab" aria-selected={tab === 'gallery'} onClick={() => setTab('gallery')} className="tab-btn">
            View Gallery
          </button>
          <button role="tab" aria-selected={tab === 'upload'} onClick={() => setTab('upload')} className="tab-btn">
            Share Your Photo
          </button>
        </div>

        {/* GALLERY TAB */}
        {tab === 'gallery' && (
          <div className="gallery-panel">
            {/* Event Filter */}
            <div className="event-filter" role="group" aria-label="Filter by event">
              <label htmlFor="eventFilter" className="sr-only">Filter by event</label>
              <select
                id="eventFilter"
                value={selectedEvent}
                onChange={(e) => setSelectedEvent(e.target.value)}
                className="event-select"
              >
                {allEvents.map((evt) => (
                  <option key={evt} value={evt}>
                    {evt}
                  </option>
                ))}
              </select>
            </div>

            {/* Photo Grid */}
            {loading ? (
              <div className="photo-grid loading">
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="photo-skeleton" />
                ))}
              </div>
            ) : error ? (
              <div className="empty" style={{ gridColumn: '1 / -1', textAlign: 'center' }}>
                {error}
                <br />
                <button className="btn small" onClick={() => fetchPhotos(page)}>Retry</button>
              </div>
            ) : !photos?.items?.length ? (
              <div className="empty" style={{ gridColumn: '1 / -1', textAlign: 'center' }}>
                <p>No photos yet for <strong>{selectedEvent}</strong>.</p>
                {selectedEvent !== 'All' && (
                  <button className="btn small" onClick={() => setSelectedEvent('All')}>Show all events</button>
                )}
              </div>
            ) : (
              <div className="photo-grid" role="list">
                {photos.items.map((photo, idx) => (
                  <figure key={photo.id} className="photo-card" role="listitem" onClick={() => openLightbox(idx)}>
                    <img
                      src={photo.imageUrl}
                      alt={photo.caption || `Photo by ${photo.uploaderName}`}
                      loading="lazy"
                      className="photo-img"
                    />
                    <figcaption className="photo-caption">
                      {photo.caption && <span className="cap-text">{photo.caption}</span>}
                      <div className="photo-meta">
                        <span className="uploader">🙏 {photo.uploaderName}</span>
                        {photo.event !== 'General' && <span className="event-tag">{photo.event}</span>}
                        <button
                          className="like-btn"
                          onClick={(e) => { e.stopPropagation(); likePhoto(photo.id, idx); }}
                          aria-label={`Like - ${photo.likes} likes`}
                        >
                          🤍 {photo.likes}
                        </button>
                      </div>
                    </figcaption>
                  </figure>
                ))}
              </div>
            )}

            {/* Pagination */}
            {photos && photos.pages > 1 && (
              <div className="pager" style={{ marginTop: '1.5rem' }}>
                <button className="btn small" disabled={page <= 1} onClick={() => fetchPhotos(page - 1)}>Previous</button>
                <span className="small muted">Page {page} of {photos.pages}</span>
                <button className="btn small" disabled={page >= photos.pages} onClick={() => fetchPhotos(page + 1)}>Next</button>
              </div>
            )}
          </div>
        )}

        {/* UPLOAD TAB */}
        {tab === 'upload' && (
          <div className="gallery-panel upload-panel">
            <div className="upload-dropzone" onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                id="photoUpload"
                onChange={handleFileChange}
                hidden
              />
              {file ? (
                <div className="upload-preview">
                  <img src={URL.createObjectURL(file)} alt="Preview" />
                  <button type="button" className="btn small danger" onClick={() => { setFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}>Remove</button>
                </div>
              ) : (
                <>
                  <div className="upload-icon">📷</div>
                  <p>Drag & drop a photo here, or tap to choose from gallery / camera</p>
                  <button className="btn secondary" type="button" onClick={() => fileInputRef.current?.click()}>
                    Choose Photo
                  </button>
                  <p className="small muted">Max 10 MB · JPEG, PNG, WebP, GIF</p>
                </>
              )}
            </div>

            {file && (
              <form className="panel form" onSubmit={handleUpload}>
                <label>
                  Caption (optional)
                  <textarea
                    value={form.caption}
                    onChange={(e) => setForm({ ...form, caption: e.target.value })}
                    placeholder="e.g. Beautiful aarti at Brahmadev temple..."
                    maxLength={300}
                    rows={3}
                  />
                </label>
                <label>
                  Your Name
                  <input
                    type="text"
                    value={form.uploaderName}
                    onChange={(e) => setForm({ ...form, uploaderName: e.target.value })}
                    placeholder="e.g. Patil Family"
                    maxLength={120}
                  />
                </label>
                <label>
                  Phone / WhatsApp (private, for temple office only)
                  <input
                    type="tel"
                    value={form.uploaderPhone}
                    onChange={(e) => setForm({ ...form, uploaderPhone: e.target.value })}
                    placeholder="e.g. 9876543210"
                    maxLength={20}
                    inputMode="tel"
                  />
                </label>
                <label>
                  Event / Occasion
                  <select
                    value={form.event}
                    onChange={(e) => setForm({ ...form, event: e.target.value })}
                  >
                    {allEvents.filter(e => e !== 'All').map((evt) => (
                      <option key={evt} value={evt}>{evt}</option>
                    ))}
                  </select>
                </label>
                <div className="btns wide">
                  <button className="btn primary" type="submit" disabled={busy}>
                    {busy ? 'Uploading…' : 'Submit for Approval'}
                  </button>
                </div>
              </form>
            )}

            {uploadStatus && (
              <div className={`status ${uploadStatus.kind}`} role="status">
                {uploadStatus.text}
              </div>
            )}

            <div className="note" style={{ marginTop: '1rem' }}>
              <strong>Guidelines:</strong>
              <ul>
                <li>Photos are reviewed by the temple trust before appearing publicly.</li>
                <li>Only share respectful, darshan-related images.</li>
                <li>Your phone number is kept private — used only if the office needs to contact you.</li>
              </ul>
            </div>
          </div>
        )}

        {/* LIGHTBOX */}
        {lightboxOpen && photos && (
          <div className="lightbox" onClick={closeLightbox} role="dialog" aria-modal="true" aria-label="Photo view">
            <button className="lightbox-close" onClick={closeLightbox} aria-label="Close">✕</button>
            <button className="lightbox-nav prev" onClick={(e) => { e.stopPropagation(); navLightbox(-1); }} aria-label="Previous">‹</button>
            <button className="lightbox-nav next" onClick={(e) => { e.stopPropagation(); navLightbox(1); }} aria-label="Next">›</button>
            <div className="lightbox-content">
              <img src={photos.items[lightboxIndex].imageUrl} alt={photos.items[lightboxIndex].caption || ''} />
              <div className="lightbox-info">
                <p>{photos.items[lightboxIndex].caption || <span className="muted">No caption</span>}</p>
                <div className="lightbox-meta">
                  <span>🙏 {photos.items[lightboxIndex].uploaderName}</span>
                  {photos.items[lightboxIndex].event !== 'General' && <span className="event-tag">{photos.items[lightboxIndex].event}</span>}
                  <span className="muted">{fmtDate(photos.items[lightboxIndex].createdAt)}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}