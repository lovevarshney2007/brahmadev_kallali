import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { useSite } from '../SiteContext.jsx';
import { api, fmtDate } from '../api.js';

const EVENT_OPTIONS = ['All', 'General', 'Brahmadev Yatra', 'Kartik Utsav', 'Hanuman Jayanti', 'Diwali', 'Guru Purnima', 'Maha Shivaratri'];

/** Returns a cheap "fingerprint" to catch same-file re-uploads within a session */
function fileFingerprint(file) {
  return `${file.name}_${file.size}_${file.lastModified}`;
}

export default function Gallery() {
  const { settings, refresh, lang } = useSite();
  const isMr = lang === 'mr';

  // ── Tab state: 'photos' | 'videos' | 'upload' ──────────────
  const [tab, setTab] = useState('photos');
  const [uploadType, setUploadType] = useState('photo'); // 'photo' | 'video'

  // ── Photos ──────────────────────────────────────────────────
  const [photos, setPhotos] = useState(null);
  const [photoPage, setPhotoPage] = useState(1);
  const [photoLoading, setPhotoLoading] = useState(false);
  const [photoError, setPhotoError] = useState('');
  const [selectedEvent, setSelectedEvent] = useState('All');

  // ── Videos ──────────────────────────────────────────────────
  const [videos, setVideos] = useState(null);
  const [videoPage, setVideoPage] = useState(1);
  const [videoLoading, setVideoLoading] = useState(false);
  const [videoError, setVideoError] = useState('');
  const [videoEvent, setVideoEvent] = useState('All');

  // ── Lightbox (photos) ───────────────────────────────────────
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // ── Video player lightbox ────────────────────────────────────
  const [videoLightboxOpen, setVideoLightboxOpen] = useState(false);
  const [videoLightboxIndex, setVideoLightboxIndex] = useState(0);

  // ── Upload shared state ──────────────────────────────────────
  const [busy, setBusy] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [form, setForm] = useState({ caption: '', uploaderName: '', uploaderPhone: '', event: 'General' });

  // Track fingerprints of files submitted this session to prevent exact same re-upload
  const submittedFingerprints = useRef(new Set());

  const galleryInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const videoInputRef = useRef(null);

  // Revoke preview URL on unmount / change
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  // ── Photo keyboard lightbox ──────────────────────────────────
  useEffect(() => {
    if (!lightboxOpen) return;
    function handleKeyDown(e) {
      if (e.key === 'Escape') setLightboxOpen(false);
      else if (e.key === 'ArrowLeft') setLightboxIndex((i) => (i - 1 + (photos?.items?.length || 1)) % (photos?.items?.length || 1));
      else if (e.key === 'ArrowRight') setLightboxIndex((i) => (i + 1) % (photos?.items?.length || 1));
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen, photos]);

  // ── Video keyboard lightbox ──────────────────────────────────
  useEffect(() => {
    if (!videoLightboxOpen) return;
    function handleKeyDown(e) {
      if (e.key === 'Escape') setVideoLightboxOpen(false);
      else if (e.key === 'ArrowLeft') setVideoLightboxIndex((i) => (i - 1 + (videos?.items?.length || 1)) % (videos?.items?.length || 1));
      else if (e.key === 'ArrowRight') setVideoLightboxIndex((i) => (i + 1) % (videos?.items?.length || 1));
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [videoLightboxOpen, videos]);

  // ── Fetch photos ─────────────────────────────────────────────
  const fetchPhotos = async (pageNum = 1) => {
    setPhotoLoading(true); setPhotoError('');
    try {
      const params = new URLSearchParams({ page: String(pageNum), limit: '24' });
      if (selectedEvent !== 'All') params.set('event', selectedEvent);
      const data = await api(`/gallery/public/photos?${params.toString()}`);
      setPhotos(data);
    } catch (e) {
      setPhotoError(e.message || 'Could not load photos.');
      toast.error(e.message || 'Could not load photos.');
    } finally {
      setPhotoLoading(false);
    }
  };

  // ── Fetch videos ─────────────────────────────────────────────
  const fetchVideos = async (pageNum = 1) => {
    setVideoLoading(true); setVideoError('');
    try {
      const params = new URLSearchParams({ page: String(pageNum), limit: '12' });
      if (videoEvent !== 'All') params.set('event', videoEvent);
      const data = await api(`/gallery/public/videos?${params.toString()}`);
      setVideos(data);
    } catch (e) {
      setVideoError(e.message || 'Could not load videos.');
      toast.error(e.message || 'Could not load videos.');
    } finally {
      setVideoLoading(false);
    }
  };

  useEffect(() => { fetchPhotos(1); setPhotoPage(1); }, [selectedEvent]);
  useEffect(() => { fetchVideos(1); setVideoPage(1); }, [videoEvent]);

  // ── File selection / drag-drop ───────────────────────────────
  function handleFileChange(e) {
    const f = e.target.files?.[0];
    if (!f) return;

    if (uploadType === 'photo') {
      if (!f.type.startsWith('image/')) {
        toast.error('Please select a valid image file (JPEG, PNG, WebP).');
        return;
      }
      if (f.size > 5 * 1024 * 1024) {
        toast.error('Image must be smaller than 5 MB.');
        return;
      }
    } else {
      if (!f.type.startsWith('video/')) {
        toast.error('Please select a valid video file (MP4, MOV, WebM).');
        return;
      }
      if (f.size > 100 * 1024 * 1024) {
        toast.error('Video must be smaller than 100 MB.');
        return;
      }
    }

    if (preview) URL.revokeObjectURL(preview);
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }

  function handleDrop(e) {
    e.preventDefault(); setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) handleFileChange({ target: { files: [f] } });
  }

  function removeFile() {
    if (preview) URL.revokeObjectURL(preview);
    setFile(null); setPreview(null);
    if (galleryInputRef.current) galleryInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
    if (videoInputRef.current) videoInputRef.current.value = '';
  }

  // Switch upload type — also clear selected file
  function switchUploadType(type) {
    removeFile();
    setUploadType(type);
  }

  // ── Upload handler ───────────────────────────────────────────
  async function handleUpload(e) {
    e.preventDefault();
    if (!file) {
      toast.error(`Please select a ${uploadType} first.`);
      return;
    }
    if (!form.uploaderName.trim()) {
      toast.error('Please enter your name.');
      return;
    }

    // Client-side duplicate guard (same session)
    const fp = fileFingerprint(file);
    if (submittedFingerprints.current.has(fp)) {
      toast.error('You already uploaded this file. Please choose a different one.');
      return;
    }

    setBusy(true);
    try {
      const formData = new FormData();
      formData.append(uploadType === 'photo' ? 'photo' : 'video', file);
      formData.append('caption', form.caption);
      formData.append('uploaderName', form.uploaderName);
      formData.append('uploaderPhone', form.uploaderPhone);
      formData.append('event', form.event);

      const endpoint = uploadType === 'photo'
        ? '/gallery/public/photos/upload'
        : '/gallery/public/videos/upload';

      const res = await api(endpoint, { method: 'POST', body: formData, timeout: 90000 });
      toast.success(res.message || 'Submitted successfully! It will appear after moderation.');

      // Remember this file so user can't re-submit the same one
      submittedFingerprints.current.add(fp);

      removeFile();
      setForm({ caption: '', uploaderName: '', uploaderPhone: '', event: 'General' });
      refresh();
    } catch (err) {
      // 409 = duplicate detected server-side
      if (err.status === 409) {
        toast.error(err.message || 'This file was already uploaded. Please choose a different one.');
      } else {
        toast.error(err.message || 'Upload failed. Please try again.');
      }
    } finally {
      setBusy(false);
    }
  }

  // ── Likes ─────────────────────────────────────────────────────
  async function likePhoto(id, idx) {
    try {
      const res = await api(`/gallery/public/photos/${id}/like`, { method: 'POST' });
      setPhotos((prev) => prev ? { ...prev, items: prev.items.map((p, i) => i === idx ? { ...p, likes: res.likes } : p) } : prev);
    } catch {}
  }

  async function likeVideo(id, idx) {
    try {
      const res = await api(`/gallery/public/videos/${id}/like`, { method: 'POST' });
      setVideos((prev) => prev ? { ...prev, items: prev.items.map((v, i) => i === idx ? { ...v, likes: res.likes } : v) } : prev);
    } catch {}
  }

  const allEvents = useMemo(() => {
    if (!settings?.festivals?.length) return EVENT_OPTIONS;
    const festEvents = settings.festivals.map((f) => f.name);
    return [...new Set([...EVENT_OPTIONS, ...festEvents])];
  }, [settings?.festivals]);

  const currentPhoto = photos?.items?.[lightboxIndex];
  const currentVideo = videos?.items?.[videoLightboxIndex];

  return (
    <>
      {/* Page Hero */}
      <div className="gal-hero">
        <div className="wrap">
          <span className="eyebrow">{isMr ? 'मंदिराच्या आठवणी' : 'Temple Memories'}</span>
          <h1>{isMr ? 'छायाचित्र व व्हिडिओ दालन' : 'Photo & Video Gallery'}</h1>
          <p>{isMr ? 'दर्शनाचे व उत्सवाचे पावन क्षण सामायिक करा. ट्रस्टच्या पडताळणीनंतर प्रसिद्ध केले जातात.' : 'Share your darshan moments with the community. Media is reviewed by the temple trust before appearing here.'}</p>
        </div>
      </div>

      {/* Tab Bar */}
      <div className="gal-tabs-bar">
        <div className="wrap">
          <div className="gal-tabs" role="tablist">
            <button role="tab" aria-selected={tab === 'photos'} onClick={() => setTab('photos')}>
              <span>🖼️</span> {isMr ? 'सर्व छायाचित्रे' : 'Photos'}
              {photos?.total > 0 && <span className="gal-count">{photos.total}</span>}
            </button>
            <button role="tab" aria-selected={tab === 'videos'} onClick={() => setTab('videos')}>
              <span>🎬</span> {isMr ? 'व्हिडिओ' : 'Videos'}
              {videos?.total > 0 && <span className="gal-count">{videos.total}</span>}
            </button>
            <button role="tab" aria-selected={tab === 'upload'} onClick={() => setTab('upload')}>
              <span>📤</span> {isMr ? 'अपलोड करा' : 'Share Media'}
            </button>
          </div>
        </div>
      </div>

      {/* ── PHOTOS TAB ─────────────────────────────────────── */}
      {tab === 'photos' && (
        <section className="sec" style={{ paddingTop: '2rem' }}>
          <div className="wrap">
            {/* Filter */}
            <div className="gal-filter-bar">
              <label htmlFor="evtFilter" className="sr-only">Filter by event</label>
              <select id="evtFilter" value={selectedEvent} onChange={(e) => setSelectedEvent(e.target.value)} className="event-select">
                {allEvents.map((evt) => <option key={evt} value={evt}>{evt}</option>)}
              </select>
              {selectedEvent !== 'All' && (
                <button className="btn small" onClick={() => setSelectedEvent('All')}>✕ Clear filter</button>
              )}
            </div>

            {/* Grid */}
            {photoLoading ? (
              <div className="photo-grid loading">
                {[...Array(12)].map((_, i) => <div key={i} className="photo-skeleton" />)}
              </div>
            ) : photoError ? (
              <div className="gal-empty">
                <div className="gal-empty-icon">⚠️</div>
                <p>{photoError}</p>
                <button className="btn small" onClick={() => fetchPhotos(photoPage)}>Try again</button>
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
                    <img src={photo.imageUrl} alt={photo.caption || `Darshan photo by ${photo.uploaderName}`} loading="lazy" className="photo-img" />
                    <figcaption className="photo-caption">
                      {photo.caption && <span className="cap-text">{photo.caption}</span>}
                      <div className="photo-meta">
                        <span>🙏 {photo.uploaderName}</span>
                        {photo.event !== 'General' && <span className="event-tag">{photo.event}</span>}
                        <button className="like-btn" onClick={(e) => { e.stopPropagation(); likePhoto(photo.id, idx); }} aria-label="Like photo">♡ {photo.likes}</button>
                      </div>
                    </figcaption>
                  </figure>
                ))}
              </div>
            )}

            {/* Pagination */}
            {photos?.pages > 1 && (
              <div className="pager" style={{ marginTop: '2rem' }}>
                <button className="btn small" disabled={photoPage <= 1} onClick={() => { setPhotoPage((p) => p - 1); fetchPhotos(photoPage - 1); }}>← Prev</button>
                <span className="small muted">Page {photoPage} of {photos.pages}</span>
                <button className="btn small" disabled={photoPage >= photos.pages} onClick={() => { setPhotoPage((p) => p + 1); fetchPhotos(photoPage + 1); }}>Next →</button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── VIDEOS TAB ─────────────────────────────────────── */}
      {tab === 'videos' && (
        <section className="sec" style={{ paddingTop: '2rem' }}>
          <div className="wrap">
            {/* Filter */}
            <div className="gal-filter-bar">
              <label htmlFor="vidEvtFilter" className="sr-only">Filter by event</label>
              <select id="vidEvtFilter" value={videoEvent} onChange={(e) => setVideoEvent(e.target.value)} className="event-select">
                {allEvents.map((evt) => <option key={evt} value={evt}>{evt}</option>)}
              </select>
              {videoEvent !== 'All' && (
                <button className="btn small" onClick={() => setVideoEvent('All')}>✕ Clear filter</button>
              )}
            </div>

            {videoLoading ? (
              <div className="photo-grid loading">
                {[...Array(6)].map((_, i) => <div key={i} className="photo-skeleton" style={{ aspectRatio: '16/9' }} />)}
              </div>
            ) : videoError ? (
              <div className="gal-empty">
                <div className="gal-empty-icon">⚠️</div>
                <p>{videoError}</p>
                <button className="btn small" onClick={() => fetchVideos(videoPage)}>Try again</button>
              </div>
            ) : !videos?.items?.length ? (
              <div className="gal-empty">
                <div className="gal-empty-icon">🎬</div>
                <p>No videos yet{videoEvent !== 'All' ? ` for "${videoEvent}"` : ''}.</p>
                <p className="small muted">Be the first to share a video from your darshan!</p>
                <div className="btns" style={{ justifyContent: 'center', marginTop: '.5rem' }}>
                  {videoEvent !== 'All' && <button className="btn small" onClick={() => setVideoEvent('All')}>Show all</button>}
                  <button className="btn primary small" onClick={() => { setTab('upload'); setUploadType('video'); }}>Share a Video</button>
                </div>
              </div>
            ) : (
              <div className="video-grid" role="list">
                {videos.items.map((video, idx) => (
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
                        <button className="like-btn" onClick={(e) => { e.stopPropagation(); likeVideo(video.id, idx); }} aria-label="Like video">♡ {video.likes}</button>
                      </div>
                    </figcaption>
                  </figure>
                ))}
              </div>
            )}

            {/* Pagination */}
            {videos?.pages > 1 && (
              <div className="pager" style={{ marginTop: '2rem' }}>
                <button className="btn small" disabled={videoPage <= 1} onClick={() => { setVideoPage((p) => p - 1); fetchVideos(videoPage - 1); }}>← Prev</button>
                <span className="small muted">Page {videoPage} of {videos.pages}</span>
                <button className="btn small" disabled={videoPage >= videos.pages} onClick={() => { setVideoPage((p) => p + 1); fetchVideos(videoPage + 1); }}>Next →</button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── UPLOAD TAB ─────────────────────────────────────── */}
      {tab === 'upload' && (
        <section className="sec" style={{ paddingTop: '2rem' }}>
          <div className="wrap">
            <div className="gal-upload-layout">
              {/* Left: Form */}
              <div className="gal-upload-form-col">

                {/* Media type toggle */}
                <div className="media-type-toggle">
                  <button
                    type="button"
                    className={`media-toggle-btn${uploadType === 'photo' ? ' active' : ''}`}
                    onClick={() => switchUploadType('photo')}
                  >
                    🖼️ Upload Photo
                  </button>
                  <button
                    type="button"
                    className={`media-toggle-btn${uploadType === 'video' ? ' active' : ''}`}
                    onClick={() => switchUploadType('video')}
                  >
                    🎬 Upload Video
                  </button>
                </div>

                <form onSubmit={handleUpload}>
                  {/* Dropzone */}
                  <div
                    className={`upload-dropzone${dragOver ? ' drag-over' : ''}`}
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    onClick={() => !file && (uploadType === 'video' ? videoInputRef.current?.click() : galleryInputRef.current?.click())}
                    style={{ cursor: file ? 'default' : 'pointer' }}
                  >
                    {/* Hidden inputs */}
                    <input ref={galleryInputRef} type="file" accept="image/*" id="galleryUpload" onChange={handleFileChange} hidden />
                    <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" id="cameraUpload" onChange={handleFileChange} hidden />
                    <input ref={videoInputRef} type="file" accept="video/*" id="videoUpload" onChange={handleFileChange} hidden />

                    {preview ? (
                      <div className="gal-preview-wrap">
                        {uploadType === 'photo'
                          ? <img src={preview} alt="Selected image preview" className="gal-preview-img" />
                          : <video src={preview} controls className="gal-preview-img" style={{ maxHeight: 320 }} />
                        }
                        <button type="button" className="gal-preview-remove" onClick={(e) => { e.stopPropagation(); removeFile(); }} aria-label="Remove file">✕</button>
                        <div className="gal-preview-bar">
                          {uploadType === 'photo' && (
                            <button type="button" className="btn small" aria-label="Take photo" onClick={(e) => { e.stopPropagation(); cameraInputRef.current?.click(); }}>📸 Retake</button>
                          )}
                          <button
                            type="button"
                            className="btn small"
                            aria-label="Choose another file"
                            onClick={(e) => { e.stopPropagation(); (uploadType === 'video' ? videoInputRef : galleryInputRef).current?.click(); }}
                          >
                            {uploadType === 'photo' ? '🖼️ Change' : '🎬 Change'}
                          </button>
                          <button type="button" className="btn small danger" onClick={(e) => { e.stopPropagation(); removeFile(); }}>✕ Remove</button>
                        </div>
                      </div>
                    ) : (
                      <div className="gal-dropzone-inner">
                        <div className="gal-upload-svg">
                          {uploadType === 'photo' ? (
                            <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <rect x="4" y="12" width="56" height="40" rx="6" stroke="currentColor" strokeWidth="3"/>
                              <circle cx="32" cy="32" r="10" stroke="currentColor" strokeWidth="3"/>
                              <circle cx="32" cy="32" r="4" fill="currentColor"/>
                              <rect x="22" y="8" width="20" height="6" rx="3" stroke="currentColor" strokeWidth="2.5"/>
                            </svg>
                          ) : (
                            <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <rect x="4" y="12" width="44" height="40" rx="6" stroke="currentColor" strokeWidth="3"/>
                              <path d="M48 24l12-8v32l-12-8V24z" stroke="currentColor" strokeWidth="3" strokeLinejoin="round"/>
                              <circle cx="22" cy="32" r="8" stroke="currentColor" strokeWidth="2.5"/>
                              <path d="M19 29l9 3-9 3V29z" fill="currentColor"/>
                            </svg>
                          )}
                        </div>
                        <p className="gal-dz-title">{uploadType === 'photo' ? 'Choose or drag a photo' : 'Choose or drag a video'}</p>
                        <p className="small muted">{uploadType === 'photo' ? 'Upload darshan, aarti or temple moments' : 'Share temple ceremonies and festivals'}</p>
                        <div className="gal-action-btns" style={{ display: 'flex', gap: '.65rem', flexWrap: 'wrap', justifyContent: 'center', marginTop: '.85rem' }}>
                          {uploadType === 'photo' ? (
                            <>
                              <button type="button" className="btn primary" onClick={(e) => { e.stopPropagation(); cameraInputRef.current?.click(); }}>📸 Take with Camera</button>
                              <button type="button" className="btn" style={{ borderColor: 'var(--gold)', color: 'var(--fg)', background: 'var(--band)' }} onClick={(e) => { e.stopPropagation(); galleryInputRef.current?.click(); }}>🖼️ Choose from Gallery</button>
                            </>
                          ) : (
                            <button type="button" className="btn primary" onClick={(e) => { e.stopPropagation(); videoInputRef.current?.click(); }}>🎬 Choose Video File</button>
                          )}
                        </div>
                        <p className="small muted" style={{ marginTop: '.65rem' }}>
                          {uploadType === 'photo' ? 'Max 5 MB · JPEG, PNG, WebP' : 'Max 100 MB · MP4, MOV, WebM'}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Form Fields */}
                  <div className="gal-fields">
                    <div className="field">
                      <label htmlFor="uploaderName">Your Name <span style={{ color: 'var(--danger)' }}>*</span></label>
                      <input id="uploaderName" type="text" value={form.uploaderName} onChange={(e) => setForm({ ...form, uploaderName: e.target.value })} placeholder="e.g. Patil Family" maxLength={120} required />
                    </div>
                    <div className="field">
                      <label htmlFor="uploaderPhone">Phone / WhatsApp <span className="muted small">(private, for temple office only)</span></label>
                      <input id="uploaderPhone" type="tel" value={form.uploaderPhone} onChange={(e) => setForm({ ...form, uploaderPhone: e.target.value })} placeholder="e.g. 9876543210" maxLength={20} inputMode="tel" />
                    </div>
                    <div className="field">
                      <label htmlFor="uploadEvent">Event / Occasion</label>
                      <select id="uploadEvent" value={form.event} onChange={(e) => setForm({ ...form, event: e.target.value })}>
                        {allEvents.filter((e) => e !== 'All').map((evt) => <option key={evt} value={evt}>{evt}</option>)}
                      </select>
                    </div>
                    <div className="field">
                      <label htmlFor="caption">Caption <span className="muted small">(optional)</span></label>
                      <textarea id="caption" value={form.caption} onChange={(e) => setForm({ ...form, caption: e.target.value })} placeholder="e.g. Beautiful aarti at Brahmadev Devasthan…" maxLength={300} rows={3} />
                    </div>
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
                    <li><span className="gal-gl-icon">🔍</span><span>All media is reviewed by the temple trust before appearing publicly.</span></li>
                    <li><span className="gal-gl-icon">🙏</span><span>Only share respectful, darshan-related photos and videos.</span></li>
                    <li><span className="gal-gl-icon">🔒</span><span>Your phone number is kept private — used only if the office needs to contact you.</span></li>
                    <li><span className="gal-gl-icon">📸</span><span>High-resolution photos and clear videos look best in the gallery.</span></li>
                    <li><span className="gal-gl-icon">⛔</span><span>Duplicate files are automatically rejected — each photo/video can only be uploaded once.</span></li>
                  </ul>
                </div>
                <div className="gal-info-card" style={{ background: 'linear-gradient(135deg, var(--maroon-2), var(--maroon))', color: 'var(--on-dark)', border: 'none' }}>
                  <h3 style={{ color: 'var(--gold-bright)' }}>✨ How it works</h3>
                  <div className="gal-steps">
                    <div className="gal-step"><span>1</span><p>Choose a {uploadType} from your phone or camera</p></div>
                    <div className="gal-step"><span>2</span><p>Fill in your name and a brief caption</p></div>
                    <div className="gal-step"><span>3</span><p>Submit — temple trust reviews within 24 hours</p></div>
                    <div className="gal-step"><span>4</span><p>Your {uploadType} appears in the gallery for all devotees!</p></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── PHOTO LIGHTBOX ─────────────────────────────────── */}
      {lightboxOpen && currentPhoto && (
        <div className="lightbox" onClick={() => setLightboxOpen(false)} role="dialog" aria-modal="true" aria-label="Photo view">
          <button className="lightbox-close" onClick={() => setLightboxOpen(false)} aria-label="Close">✕</button>
          <button className="lightbox-nav prev" onClick={(e) => { e.stopPropagation(); setLightboxIndex((i) => (i - 1 + photos.items.length) % photos.items.length); }} aria-label="Previous">‹</button>
          <button className="lightbox-nav next" onClick={(e) => { e.stopPropagation(); setLightboxIndex((i) => (i + 1) % photos.items.length); }} aria-label="Next">›</button>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <img src={currentPhoto.imageUrl} alt={currentPhoto.caption || `Photo by ${currentPhoto.uploaderName}`} />
            <div className="lightbox-info">
              <p>{currentPhoto.caption || <span className="muted">No caption</span>}</p>
              <div className="lightbox-meta">
                <span>🙏 {currentPhoto.uploaderName}</span>
                {currentPhoto.event !== 'General' && <span className="event-tag">{currentPhoto.event}</span>}
                <span className="muted">{fmtDate(currentPhoto.createdAt)}</span>
              </div>
              <button className="like-btn" style={{ marginTop: '.5rem', fontSize: '1.1rem' }} onClick={() => likePhoto(currentPhoto.id, lightboxIndex)}>♡ {currentPhoto.likes} likes</button>
            </div>
          </div>
        </div>
      )}

      {/* ── VIDEO LIGHTBOX ─────────────────────────────────── */}
      {videoLightboxOpen && currentVideo && (
        <div className="lightbox" onClick={() => setVideoLightboxOpen(false)} role="dialog" aria-modal="true" aria-label="Video view">
          <button className="lightbox-close" onClick={() => setVideoLightboxOpen(false)} aria-label="Close">✕</button>
          <button className="lightbox-nav prev" onClick={(e) => { e.stopPropagation(); setVideoLightboxIndex((i) => (i - 1 + videos.items.length) % videos.items.length); }} aria-label="Previous">‹</button>
          <button className="lightbox-nav next" onClick={(e) => { e.stopPropagation(); setVideoLightboxIndex((i) => (i + 1) % videos.items.length); }} aria-label="Next">›</button>
          <div className="lightbox-content lightbox-video-content" onClick={(e) => e.stopPropagation()}>
            <video src={currentVideo.videoUrl} controls autoPlay className="lightbox-video" />
            <div className="lightbox-info">
              <p>{currentVideo.caption || <span className="muted">No caption</span>}</p>
              <div className="lightbox-meta">
                <span>🙏 {currentVideo.uploaderName}</span>
                {currentVideo.event !== 'General' && <span className="event-tag">{currentVideo.event}</span>}
                <span className="muted">{fmtDate(currentVideo.createdAt)}</span>
              </div>
              <button className="like-btn" style={{ marginTop: '.5rem', fontSize: '1.1rem' }} onClick={() => likeVideo(currentVideo.id, videoLightboxIndex)}>♡ {currentVideo.likes} likes</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
