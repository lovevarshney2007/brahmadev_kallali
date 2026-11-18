import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useSite } from '../SiteContext.jsx';
import { inr, api, fmtDate } from '../api.js';
import { Shrine, SectionHead, Tbc } from '../components/Decor.jsx';
import Bars from '../components/Bars.jsx';
import FestivalCalendar from '../components/FestivalCalendar.jsx';
import TravelCard from '../components/TravelCard.jsx';
import CountUpNumber from '../components/CountUpNumber.jsx';
import HeroSlider from '../components/HeroSlider.jsx';

const MAPS = 'https://www.google.com/maps/search/?api=1&query=Kallali%2C%20Kandhar%2C%20Nanded%2C%20Maharashtra';

export default function Home() {
  const { settings, summary, lang, t } = useSite();
  const isMr = lang === 'mr';

  const timings = settings?.darshanTimings?.length > 0
    ? settings.darshanTimings
    : [
        {
          seva: t.worship.morningAarti,
          time: t.worship.morningTime,
          details: t.worship.morningDetails,
        },
        {
          seva: t.worship.dailyPooja,
          time: t.worship.dailyTime,
          details: t.worship.dailyDetails,
        },
        {
          seva: t.worship.eveningAarti,
          time: t.worship.eveningTime,
          details: t.worship.eveningDetails,
        },
        {
          seva: t.worship.specialPuja,
          time: t.worship.onRequest,
          details: t.worship.bookContact,
        },
      ];

  const festivals = settings?.festivals || [];
  const c = {
    person: settings?.contact?.person || (isMr ? 'मारुती कुंजटवाड' : 'Maruti Kunjatwad'),
    phone: settings?.contact?.phone || '9503131031',
    email: settings?.contact?.email || 'office@shribrahmadevadevasthan.org',
  };

  const youtubeLiveUrl =
    settings?.social?.youtubeLive ||
    settings?.social?.youtube ||
    'https://www.youtube.com/@ShriBrahmadevDevasthanKallali';

  // Fetch approved photos and videos for gallery preview
  const [galleryPhotos, setGalleryPhotos] = useState([]);
  const [galleryVideos, setGalleryVideos] = useState([]);
  const [activeMediaTab, setActiveMediaTab] = useState('all');

  // Lightboxes
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [videoLightboxOpen, setVideoLightboxOpen] = useState(false);
  const [videoLightboxIndex, setVideoLightboxIndex] = useState(0);

  // Enquiry form state
  const [enquiryForm, setEnquiryForm] = useState({
    name: '',
    phone: '',
    email: '',
    type: 'General',
    message: '',
  });
  const [enquiryLoading, setEnquiryLoading] = useState(false);
  const [enquirySuccess, setEnquirySuccess] = useState(false);
  const [enquiryError, setEnquiryError] = useState('');

  useEffect(() => {
    api('/gallery/public/photos?limit=100')
      .then((data) => {
        if (data?.items) setGalleryPhotos(data.items);
      })
      .catch(() => {});
    api('/gallery/public/videos?limit=100')
      .then((data) => {
        if (data?.items) setGalleryVideos(data.items);
      })
      .catch(() => {});
  }, []);

  // Keyboard navigation for lightboxes
  useEffect(() => {
    if (!lightboxOpen) return;
    function handleKeyDown(e) {
      if (e.key === 'Escape') setLightboxOpen(false);
      else if (e.key === 'ArrowLeft') {
        setLightboxIndex((i) => (i - 1 + (galleryPhotos.length || 1)) % (galleryPhotos.length || 1));
      } else if (e.key === 'ArrowRight') {
        setLightboxIndex((i) => (i + 1) % (galleryPhotos.length || 1));
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen, galleryPhotos]);

  useEffect(() => {
    if (!videoLightboxOpen) return;
    function handleKeyDown(e) {
      if (e.key === 'Escape') setVideoLightboxOpen(false);
      else if (e.key === 'ArrowLeft') {
        setVideoLightboxIndex((i) => (i - 1 + (galleryVideos.length || 1)) % (galleryVideos.length || 1));
      } else if (e.key === 'ArrowRight') {
        setVideoLightboxIndex((i) => (i + 1) % (galleryVideos.length || 1));
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [videoLightboxOpen, galleryVideos]);

  async function likePhoto(id, idx) {
    try {
      const res = await api(`/gallery/public/photos/${id}/like`, { method: 'POST' });
      setGalleryPhotos((prev) => prev.map((p, i) => (i === idx ? { ...p, likes: res.likes } : p)));
    } catch {}
  }

  async function likeVideo(id, idx) {
    try {
      const res = await api(`/gallery/public/videos/${id}/like`, { method: 'POST' });
      setGalleryVideos((prev) => prev.map((v, i) => (i === idx ? { ...v, likes: res.likes } : v)));
    } catch {}
  }

  async function handleEnquirySubmit(e) {
    e.preventDefault();
    setEnquiryError('');
    setEnquirySuccess(false);

    if (!enquiryForm.name.trim()) {
      setEnquiryError(isMr ? 'कृपया आपले नाव प्रविष्ट करा.' : 'Please enter your full name.');
      return;
    }
    if (!enquiryForm.phone.trim()) {
      setEnquiryError(isMr ? 'कृपया आपला फोन नंबर प्रविष्ट करा.' : 'Please enter your phone number.');
      return;
    }
    if (!enquiryForm.message.trim()) {
      setEnquiryError(isMr ? 'कृपया आपला संदेश लिहा.' : 'Please enter your message.');
      return;
    }

    setEnquiryLoading(true);
    try {
      await api('/public/enquiry', {
        method: 'POST',
        body: enquiryForm,
      });
      setEnquirySuccess(true);
      setEnquiryForm({
        name: '',
        phone: '',
        email: '',
        type: 'General',
        message: '',
      });
    } catch (err) {
      setEnquiryError(err.message || t.contact.errorMsg);
    } finally {
      setEnquiryLoading(false);
    }
  }

  const currentPhoto = galleryPhotos[lightboxIndex];
  const currentVideo = galleryVideos[videoLightboxIndex];

  // Financial calculations for Transparency section
  const totalReceived = summary?.received?.total ?? 0;
  const totalSpent = summary?.spent?.total ?? 0;
  const balance = summary?.balance ?? totalReceived - totalSpent;
  const totalContributors = summary?.received?.contributors ?? summary?.received?.count ?? 0;

  // Official temple hero slider banners
  const heroSlides = [
    {
      image: '/banners/banner2.png',
      alt: isMr
        ? 'श्री क्षेत्र ब्रह्मदेव देवस्थान, कल्लाळी - श्रद्धा, भक्ती, सेवा व संस्कृतीचा पवित्र संगम'
        : 'Shri Kshetra Brahmadev Devasthan, Kallali - Sacred Abode of Faith & Devotion',
    },
    {
      image: '/banners/banner1.png',
      alt: isMr
        ? 'श्री क्षेत्र ब्रह्मदेव देवस्थान, कल्लाळी - भव्य प्रवेशद्वार व मंदिर परिसर'
        : 'Shri Kshetra Brahmadev Devasthan, Kallali - Temple Sanctum & Premises',
    },
  ];

  return (
    <>
      {/* ── 1. MAJESTIC EDGE-TO-EDGE HERO SLIDER ────────────────── */}
      <section className="hero-slider-section" id="home">
        <HeroSlider
          slides={heroSlides}
          autoPlay={true}
          autoPlayInterval={5000}
          showArrows={true}
          showDots={true}
          pauseOnHover={true}
        />
      </section>

      {/* ── 2. AUSPICIOUS QUICK-ACTION STRIP ─────────────────────── */}
      <div className="hero-quick-strip" role="navigation" aria-label={isMr ? 'त्वरित दुवे' : 'Quick links'}>
        <div className="wrap quick-strip-wrap">
          <a href="#worship" className="quick-pill">
            <span className="quick-pill-icon" aria-hidden="true">🪔</span>
            <div className="quick-pill-text">
              <strong>{isMr ? 'दर्शन व आरती' : 'Darshan & Aarti'}</strong>
              <small>{isMr ? 'नित्य वेळा व पूजा' : 'Daily Timings'}</small>
            </div>
          </a>
          <Link to="/yatra" className="quick-pill">
            <span className="quick-pill-icon" aria-hidden="true">🚩</span>
            <div className="quick-pill-text">
              <strong>{isMr ? 'यात्रा महोत्सव' : 'Yatra Mahotsav'}</strong>
              <small>{isMr ? 'वार्षिक उत्सव' : 'Annual Festival'}</small>
            </div>
          </Link>
          <Link to="/ledger" className="quick-pill">
            <span className="quick-pill-icon" aria-hidden="true">📜</span>
            <div className="quick-pill-text">
              <strong>{isMr ? 'दान हिशोब वही' : 'Daan Ledger'}</strong>
              <small>{isMr ? '१००% पारदर्शक' : '100% Transparent'}</small>
            </div>
          </Link>
          <a href="#visit" className="quick-pill">
            <span className="quick-pill-icon" aria-hidden="true">📍</span>
            <div className="quick-pill-text">
              <strong>{isMr ? 'कल्लाळी दर्शन' : 'Visit Kallali'}</strong>
              <small>{isMr ? 'मार्ग व संपर्क' : 'Route & Guide'}</small>
            </div>
          </a>
        </div>
      </div>

      {/* ── 3. SACRED TEMPLE INVOCATION & LIVE TRUST STATS ─────────── */}
      <section className="hero hero-intro">
        <div className="wrap hero-intro-wrap">
          <div className="mr-name" lang="mr">
            {t.hero.deity}
          </div>
          <h1 className="hero-intro-title">
            {t.hero.title}
          </h1>
          <div className="hero-intro-location">
            <span>📍</span>
            <strong>{t.hero.location}</strong>
          </div>
          <div className="hero-intro-tagline">
            {t.hero.tagline}
          </div>
          <p className="hero-intro-lede">
            {t.hero.intro}
          </p>

          {/* 3 Prominent Hero Action Buttons */}
          <div className="btns hero-intro-btns">
            <a className="btn light" href="#about">
              {t.hero.exploreBtn}
            </a>
            <Link className="btn primary" to="/yatra">
              {t.hero.yatraBtn}
            </Link>
            <a className="btn light" href="#visit">
              {t.hero.visitBtn}
            </a>
          </div>

          {/* Golden Trust Statistics Plaque Bar */}
          <div className="hero-stats-strip" aria-live="polite">
            <div className="stat-plaque">
              <strong>
                {summary?.received?.total !== undefined ? (
                  <CountUpNumber value={summary.received.total} prefix="₹" />
                ) : (
                  '—'
                )}
              </strong>
              <span>{t.hero.daanReceived}</span>
            </div>
            <div className="stat-divider" aria-hidden="true" />
            <div className="stat-plaque">
              <strong>
                {summary?.received?.count !== undefined ? (
                  <CountUpNumber value={summary.received.count} />
                ) : (
                  '—'
                )}
              </strong>
              <span>{t.hero.offerings}</span>
            </div>
            <div className="stat-divider" aria-hidden="true" />
            <div className="stat-plaque">
              <strong>
                {summary?.spent?.total !== undefined ? (
                  <CountUpNumber value={summary.spent.total} prefix="₹" />
                ) : (
                  '—'
                )}
              </strong>
              <span>{t.hero.spentOnSeva}</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. SACRED LIVE DARSHAN & BROADCAST SECTION ──────────── */}
      <section className="sec sec-live-darshan" id="live-darshan">
        <div className="wrap">
          <div className="live-darshan-card reveal-on-scroll">
            {/* Left Column: Visual Video Preview Card */}
            <div className="live-preview-box">
              <img
                src="/banners/banner2.png"
                alt={isMr ? 'श्री क्षेत्र ब्रह्मदेव देवस्थान थेट दर्शन' : 'Shri Brahmadev Devasthan Live Darshan'}
                className="live-preview-img"
                loading="lazy"
              />
              <div className="live-preview-overlay">
                <div className="live-status-chip">
                  <span className="live-beacon-pulse">
                    <span className="beacon-dot-live" />
                    <span className="beacon-ring-live" />
                  </span>
                  <span className="live-chip-text">LIVE ((•))</span>
                  <span className="live-chip-sub">{isMr ? 'थेट प्रक्षेपण' : 'Live Broadcast'}</span>
                </div>

                <a
                  href={youtubeLiveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="live-play-center-btn"
                  title={isMr ? 'यूट्यूबवर थेट दर्शन पहा' : 'Watch Live on YouTube'}
                  aria-label="Play Live Darshan on YouTube"
                >
                  <div className="live-play-pulse-circle" />
                  <div className="live-play-icon-box">
                    <svg width="34" height="34" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </a>

                <div className="live-preview-caption">
                  <span className="yt-badge">▶ YouTube</span>
                  <span>{isMr ? 'श्री क्षेत्र ब्रह्मदेव देवस्थान, कल्लाळी' : 'Shri Brahmadev Devasthan, Kallali'}</span>
                </div>
              </div>
            </div>

            {/* Right Column: Live Information & Aarti Programme */}
            <div className="live-details-box">
              <div className="live-tag-row">
                <span className="live-tag-badge">
                  <span className="live-dot-red" />
                  {isMr ? 'थेट दर्शन व आरती' : 'Live Darshan & Aarti'}
                </span>
                <span className="live-official-badge">
                  {isMr ? 'अधिकृत चॅनल' : 'Official Channel'}
                </span>
              </div>

              <h2 className="live-heading">
                {isMr ? 'श्री क्षेत्र ब्रह्मदेव देवस्थान थेट दर्शन' : 'Shri Brahmadev Devasthan Live Telecast'}
              </h2>

              <p className="live-lead">
                {isMr
                  ? 'घरबसल्या घ्या कल्लाळी येथील श्री ब्रह्मदेवांचे पावन दर्शन व नित्य आरतीचे थेट प्रक्षेपण. दररोज अधिकृत यूट्यूब चॅनलवर थेट प्रक्षेपणाचा लाभ घ्या.'
                  : 'Experience the divine presence and sacred daily aartis of Shri Brahmadev live from Kallali on our official YouTube channel.'}
              </p>

              {/* 3 Live Aarti Timings */}
              <div className="live-aarti-schedule">
                <div className="live-sched-item">
                  <span className="sched-emoji">🌅</span>
                  <div>
                    <strong>{isMr ? 'काकड आरती' : 'Morning Aarti'}</strong>
                    <span>{isMr ? 'सकाळी ६:००' : '6:00 AM'}</span>
                  </div>
                </div>
                <div className="live-sched-item">
                  <span className="sched-emoji">🌸</span>
                  <div>
                    <strong>{isMr ? 'नित्य महापूजा' : 'Daily Mahapooja'}</strong>
                    <span>{isMr ? 'दुपारी १२:००' : '12:00 PM'}</span>
                  </div>
                </div>
                <div className="live-sched-item">
                  <span className="sched-emoji">🪔</span>
                  <div>
                    <strong>{isMr ? 'संध्या आरती' : 'Evening Aarti'}</strong>
                    <span>{isMr ? 'संध्याकाळी ७:३०' : '7:30 PM'}</span>
                  </div>
                </div>
              </div>

              {/* Direct YouTube Red CTA Button */}
              <div className="live-cta-wrap">
                <a
                  href={youtubeLiveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-youtube-live-cta"
                  title={isMr ? 'यूट्यूबवर थेट दर्शन पहा' : 'Watch Live on YouTube'}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                  <span>{isMr ? 'यूट्यूबवर थेट दर्शन पहा' : 'Watch Live on YouTube'}</span>
                  <span className="cta-arrow" aria-hidden="true">→</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. ABOUT PREVIEW ─────────────────────────────────────── */}
      <section className="sec" id="about">
        <div className="wrap">
          <SectionHead eyebrow={t.about.eyebrow} title={t.about.title} rule />
          <div className="split">
            <div className="prose">
              <p>{t.about.p1}</p>
              <p>{t.about.p2}</p>
              <p style={{ fontFamily: 'var(--display)', fontSize: '1.15rem', color: 'var(--saffron)' }}>
                {t.about.blessing}
              </p>
              <div style={{ marginTop: '1.5rem' }}>
                <a href="#history" className="btn small primary">
                  {t.about.learnMore}
                </a>
              </div>
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

      {/* ── 3. HISTORY PREVIEW ────────────────────────────────────── */}
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
            <div style={{ display: 'grid', gap: '1rem', alignSelf: 'start' }}>
              <div className="note">
                <strong>{t.history.trustNoteTitle}</strong> {t.history.trustNoteText}
              </div>
              <div>
                <a href="#contact" className="btn small primary">
                  {t.history.exploreBtn}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. DAILY SEVA AND AARTI ───────────────────────────────── */}
      <section className="sec" id="worship">
        <div className="wrap">
          <SectionHead eyebrow={t.worship.eyebrow} title={t.worship.title}>
            <p>{t.worship.desc}</p>
          </SectionHead>
          <div className="seva-cards stagger-group" role="list">
            {timings.map((tRow, idx) => (
              <article key={idx} className="seva-card reveal-on-scroll" role="listitem">
                <div className="seva-icon">
                  {/aarti/i.test(tRow.seva) ? '🪔' : /abhishek|puja/i.test(tRow.seva) ? '🕉️' : '🙏'}
                </div>
                <div className="seva-content">
                  <h3>{tRow.seva}</h3>
                  <div className="seva-time">
                    <span className="time-icon">🕐</span>
                    <span>
                      {/confirm|लवकरच/i.test(tRow.time) || !tRow.time ? <Tbc /> : tRow.time}
                    </span>
                  </div>
                  <p className="seva-details">{tRow.details}</p>
                </div>
              </article>
            ))}
          </div>

          <div className="special-puja-card reveal-on-scroll">
            <div className="special-puja-icon">🕉️</div>
            <div>
              <h3>{t.worship.specialPuja}</h3>
              <p>
                <span className="time-icon">🕐</span> {t.worship.onRequest}
              </p>
              <p>{t.worship.bookContact}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. FESTIVALS & YATRA MAHOTSAV ─────────────────────────── */}
      <section className="sec alt" id="festivals">
        <div className="wrap">
          <SectionHead eyebrow={t.festivals.eyebrow} title={t.festivals.title}>
            <p>{t.festivals.desc}</p>
          </SectionHead>

          {/* Prominent Upcoming Yatra Mahotsav Card */}
          <div
            className="card"
            style={{
              padding: '2rem',
              background: 'linear-gradient(135deg, var(--card), var(--band))',
              borderRadius: '16px',
              border: '2px solid var(--gold)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              boxShadow: '0 8px 24px -10px rgba(0,0,0,0.1)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '2rem' }}>🚩</span>
                <h3 style={{ margin: 0, fontSize: '1.4rem', color: 'var(--heading)' }}>
                  {t.festivals.yatraCardTitle}
                </h3>
              </div>
              <span
                style={{
                  background: 'var(--warn-bg)',
                  color: 'var(--cta)',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '999px',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                }}
              >
                {isMr ? 'वार्षिक उत्सव' : 'Annual Celebration'}
              </span>
            </div>

            <p style={{ margin: 0, fontSize: '1.02rem', color: 'var(--fg)', lineHeight: 1.6 }}>
              {t.festivals.yatraCardNotice}
            </p>

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
              <Link to="/yatra" className="btn primary">
                {t.festivals.viewProgramme}
              </Link>
              <Link to="/yatra?tab=rituals" className="btn">
                {t.nav.ritualsTraditions}
              </Link>
            </div>
          </div>

          {/* Festival Calendar Component */}
          <div style={{ marginTop: '2.5rem' }}>
            <FestivalCalendar
              festivals={festivals}
              initialMonth={new Date().getMonth()}
              showMonthNav={true}
              t={t.festivals}
              lang={lang}
            />
          </div>
        </div>
      </section>

      {/* ── 6. DONATION TRANSPARENCY PREVIEW (DAAN LEDGER) ─────────── */}
      <section className="sec" id="transparency">
        <div className="wrap">
          <SectionHead eyebrow={t.transparency.eyebrow} title={t.transparency.title}>
            <p>{t.transparency.desc}</p>
          </SectionHead>

          {/* 4 Summary Cards */}
          <div className="stagger-group" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
            <div
              className="card reveal-on-scroll"
              style={{
                padding: '1.5rem',
                background: 'var(--card)',
                borderRadius: '14px',
                border: '1px solid var(--line)',
                textAlign: 'center',
                boxShadow: '0 4px 14px rgba(0,0,0,0.03)',
              }}
            >
              <div style={{ fontSize: '2rem', marginBottom: '0.4rem' }}>💰</div>
              <span className="small muted" style={{ display: 'block', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {t.transparency.totalReceived}
              </span>
              <strong style={{ display: 'block', fontSize: '1.6rem', color: 'var(--good)', marginTop: '0.3rem', fontFamily: 'var(--display)' }}>
                <CountUpNumber value={totalReceived} prefix="₹" />
              </strong>
            </div>

            <div
              className="card reveal-on-scroll"
              style={{
                padding: '1.5rem',
                background: 'var(--card)',
                borderRadius: '14px',
                border: '1px solid var(--line)',
                textAlign: 'center',
                boxShadow: '0 4px 14px rgba(0,0,0,0.03)',
              }}
            >
              <div style={{ fontSize: '2rem', marginBottom: '0.4rem' }}>📋</div>
              <span className="small muted" style={{ display: 'block', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {t.transparency.totalSpent}
              </span>
              <strong style={{ display: 'block', fontSize: '1.6rem', color: 'var(--cta)', marginTop: '0.3rem', fontFamily: 'var(--display)' }}>
                <CountUpNumber value={totalSpent} prefix="₹" />
              </strong>
            </div>

            <div
              className="card reveal-on-scroll"
              style={{
                padding: '1.5rem',
                background: 'var(--card)',
                borderRadius: '14px',
                border: '1px solid var(--line)',
                textAlign: 'center',
                boxShadow: '0 4px 14px rgba(0,0,0,0.03)',
              }}
            >
              <div style={{ fontSize: '2rem', marginBottom: '0.4rem' }}>🏛️</div>
              <span className="small muted" style={{ display: 'block', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {t.transparency.balance}
              </span>
              <strong style={{ display: 'block', fontSize: '1.6rem', color: 'var(--gold)', marginTop: '0.3rem', fontFamily: 'var(--display)' }}>
                <CountUpNumber value={balance} prefix="₹" />
              </strong>
            </div>

            <div
              className="card reveal-on-scroll"
              style={{
                padding: '1.5rem',
                background: 'var(--card)',
                borderRadius: '14px',
                border: '1px solid var(--line)',
                textAlign: 'center',
                boxShadow: '0 4px 14px rgba(0,0,0,0.03)',
              }}
            >
              <div style={{ fontSize: '2rem', marginBottom: '0.4rem' }}>👥</div>
              <span className="small muted" style={{ display: 'block', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {t.transparency.contributors}
              </span>
              <strong style={{ display: 'block', fontSize: '1.6rem', color: 'var(--heading)', marginTop: '0.3rem', fontFamily: 'var(--display)' }}>
                <CountUpNumber value={totalContributors} />
              </strong>
            </div>
          </div>

          {/* Compact Category-wise Expenditure Chart (Handoff requirement) */}
          {summary?.spent?.byPurpose?.length > 0 && (
            <div
              className="panel"
              style={{
                marginTop: '2rem',
                background: 'var(--card)',
                borderRadius: '16px',
                border: '1px solid var(--line)',
                padding: '1.5rem',
              }}
            >
              <div className="panel-head" style={{ marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.2rem', color: 'var(--heading)', margin: 0 }}>
                  {isMr ? 'खर्च वर्गीकरण व विनियोग' : 'Category-wise Expenditure Breakdown'}
                </h3>
                <span className="small muted">
                  {isMr ? 'विश्वस्त मान्यताप्राप्त हेतूनुसार' : 'By Trust-Approved Categories'}
                </span>
              </div>
              <Bars rows={summary.spent.byPurpose} total={summary.spent.total} />
            </div>
          )}

          {/* Action buttons */}
          <div className="btns" style={{ justifyContent: 'center', marginTop: '1.75rem' }}>
            <Link to="/ledger" className="btn primary">
              {t.transparency.viewLedger}
            </Link>
            <Link to="/donate" className="btn light" style={{ borderColor: 'var(--cta)', color: 'var(--cta)' }}>
              {t.transparency.donateNow}
            </Link>
          </div>
        </div>
      </section>

      {/* ── 7. PLAN YOUR VISIT ────────────────────────────────────── */}
      <section className="sec alt" id="visit">
        <div className="wrap">
          <SectionHead eyebrow={t.visit.eyebrow} title={t.visit.title}>
            <p>{t.visit.desc}</p>
          </SectionHead>

          {/* Location Info Cards */}
          <div
            className="cols"
            style={{
              marginBottom: '2rem',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            }}
          >
            <div className="card" style={{ textAlign: 'center', padding: '1.5rem' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '.5rem' }}>🕉️</div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--heading)' }}>
                {t.visit.templeLabel}
              </h3>
              <p style={{ margin: '.25rem 0 0', color: 'var(--muted)', fontWeight: 500 }}>
                {t.visit.templeVal}
              </p>
            </div>
            <div className="card" style={{ textAlign: 'center', padding: '1.5rem' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '.5rem' }}>📍</div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--heading)' }}>
                {t.visit.villageLabel}
              </h3>
              <p style={{ margin: '.25rem 0 0', color: 'var(--muted)', fontWeight: 500 }}>
                {t.visit.villageVal}
              </p>
            </div>
            <div className="card" style={{ textAlign: 'center', padding: '1.5rem' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '.5rem' }}>🏛️</div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--heading)' }}>
                {t.visit.talukaLabel}
              </h3>
              <p style={{ margin: '.25rem 0 0', color: 'var(--muted)', fontWeight: 500 }}>
                {t.visit.talukaVal}
              </p>
            </div>
            <div className="card" style={{ textAlign: 'center', padding: '1.5rem' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '.5rem' }}>🗺️</div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--heading)' }}>
                {t.visit.districtLabel}
              </h3>
              <p style={{ margin: '.25rem 0 0', color: 'var(--muted)', fontWeight: 500 }}>
                {t.visit.districtVal}
              </p>
            </div>
          </div>

          {/* Travel Cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '1.5rem',
            }}
          >
            {/* Road Travel */}
            <TravelCard
              mode="road"
              title={t.visit.byRoad}
              description={t.visit.roadDesc}
              details={[
                t.visit.distanceFromKandhar,
                t.visit.distanceFromNanded,
                t.visit.travelTimeRoad,
                isMr ? 'कंधार व मुखेडवरून कल्लाळीसाठी नियमित एसटी बसेस' : 'Regular ST buses and private autos from Kandhar/Mukhed to Kallali',
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
                isMr ? 'प्रमुख स्थानक: नांदेड (NED) — मुंबई, पुणे, हैद्राबादशी जोडलेले' : 'Major station: Hazur Sahib Nanded (NED) — direct express trains',
                isMr ? 'नांदेड स्थानकावरून कंधार/कल्लाळीसाठी वाहने उपलब्ध' : 'Taxi or bus available from Nanded Station to Kandhar/Kallali',
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
                isMr ? 'विमानतळ: श्री गुरु गोबिंद सिंगजी विमानतळ (NDC), नांदेड' : 'Airport: Shri Guru Gobind Singh Ji Airport (NDC), Nanded',
                isMr ? 'हैद्राबाद विमानतळ सुमारे २६० कि.मी. अंतरावर' : 'Rajiv Gandhi International Airport (HYD) ~260 km',
              ]}
              mapsUrl={`https://www.google.com/maps/dir//Shri+Guru+Gobind+Singh+Ji+Airport+Nanded/@19.1867,77.3167,12z`}
              mapsLabel="Nanded Airport on Maps"
            />
          </div>

          {/* Google Maps Embed */}
          <div
            style={{
              marginTop: '2.5rem',
              borderRadius: '16px',
              overflow: 'hidden',
              border: '1px solid var(--line)',
              boxShadow: '0 8px 24px -8px rgba(0,0,0,.1)',
            }}
          >
            <div
              style={{
                background: 'var(--maroon-2)',
                color: 'var(--on-dark)',
                padding: '1rem 1.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1rem',
                borderBottom: '2px solid var(--gold)',
              }}
            >
              <h3
                style={{
                  fontFamily: 'var(--display)',
                  color: 'var(--gold-bright)',
                  margin: 0,
                  fontSize: '1.25rem',
                }}
              >
                🗺️ {t.visit.mapEmbedTitle}
              </h3>
              <a
                href={MAPS}
                target="_blank"
                rel="noopener noreferrer"
                className="btn light small"
                style={{ textDecoration: 'none' }}
              >
                {t.visit.mapsBtn}
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

      {/* ── 8. GALLERY PREVIEW ────────────────────────────────────── */}
      <section className="sec" id="gallery">
        <div className="wrap">
          <SectionHead eyebrow={t.gallery.eyebrow} title={t.gallery.title}>
            <p>
              {t.gallery.desc1}
              <Link to="/gallery?tab=upload">{t.gallery.descLink}</Link>
              {t.gallery.desc2}
            </p>
          </SectionHead>

          {/* Media Filter Tabs */}
          <div
            className="media-type-toggle"
            style={{ margin: '0 auto', maxWidth: '100%', overflowX: 'auto' }}
          >
            <button
              type="button"
              className={`media-toggle-btn${activeMediaTab === 'all' ? ' active' : ''}`}
              onClick={() => setActiveMediaTab('all')}
            >
              🌟 {isMr ? 'सर्व' : 'All'} ({galleryPhotos.length + galleryVideos.length})
            </button>
            <button
              type="button"
              className={`media-toggle-btn${activeMediaTab === 'photos' ? ' active' : ''}`}
              onClick={() => setActiveMediaTab('photos')}
            >
              🖼️ {t.gallery.photosTab} ({galleryPhotos.length})
            </button>
            <button
              type="button"
              className={`media-toggle-btn${activeMediaTab === 'videos' ? ' active' : ''}`}
              onClick={() => setActiveMediaTab('videos')}
            >
              🎬 {t.gallery.videosTab} ({galleryVideos.length})
            </button>
          </div>

          {/* Photos Block */}
          {(activeMediaTab === 'all' || activeMediaTab === 'photos') && (
            <div style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '1rem',
                  borderBottom: '1px solid var(--line)',
                  paddingBottom: '.5rem',
                  flexWrap: 'wrap',
                }}
              >
                <h3 style={{ color: 'var(--heading)', display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                  <span>🖼️</span> {isMr ? 'छायाचित्र दर्शन' : 'Photo Gallery'}
                  <span className="gal-count">{galleryPhotos.length}</span>
                </h3>
                <Link to="/gallery" className="btn small">
                  {t.gallery.viewAll}
                </Link>
              </div>

              {galleryPhotos.length > 0 ? (
                <div className="photo-grid" role="list">
                  {galleryPhotos.map((photo, idx) => (
                    <figure
                      key={photo.id}
                      className="photo-card"
                      role="listitem"
                      onClick={() => {
                        setLightboxIndex(idx);
                        setLightboxOpen(true);
                      }}
                      style={{ cursor: 'pointer' }}
                    >
                      <img
                        src={photo.imageUrl}
                        alt={photo.caption || `Temple photo by ${photo.uploaderName}`}
                        loading="lazy"
                        className="photo-img"
                      />
                      <figcaption className="photo-caption">
                        {photo.caption && <span className="cap-text">{photo.caption}</span>}
                        <div className="photo-meta">
                          <span>🙏 {photo.uploaderName}</span>
                          {photo.event !== 'General' && <span className="event-tag">{photo.event}</span>}
                          <button
                            className="like-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              likePhoto(photo.id, idx);
                            }}
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
                  <p>{isMr ? 'अद्याप छायाचित्रे उपलब्ध नाहीत.' : 'No photos uploaded yet.'}</p>
                  <Link to="/gallery?tab=upload" className="btn primary small">
                    {t.gallery.sharePhoto}
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Videos Block */}
          {(activeMediaTab === 'all' || activeMediaTab === 'videos') && (
            <div style={{ display: 'grid', gap: '1rem', marginTop: activeMediaTab === 'all' ? '1.5rem' : '0' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '1rem',
                  borderBottom: '1px solid var(--line)',
                  paddingBottom: '.5rem',
                  flexWrap: 'wrap',
                }}
              >
                <h3 style={{ color: 'var(--heading)', display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                  <span>🎬</span> {isMr ? 'व्हिडिओ दर्शन' : 'Video Gallery'}
                  <span className="gal-count">{galleryVideos.length}</span>
                </h3>
                <Link to="/gallery?tab=videos" className="btn small">
                  {isMr ? 'सर्व व्हिडिओ पहा' : 'View All Videos'}
                </Link>
              </div>

              {galleryVideos.length > 0 ? (
                <div className="video-grid" role="list">
                  {galleryVideos.map((video, idx) => (
                    <figure
                      key={video.id}
                      className="video-card"
                      role="listitem"
                      onClick={() => {
                        setVideoLightboxIndex(idx);
                        setVideoLightboxOpen(true);
                      }}
                    >
                      <div className="video-thumb-wrap">
                        {video.thumbnailUrl ? (
                          <img
                            src={video.thumbnailUrl}
                            alt={video.caption || `Video by ${video.uploaderName}`}
                            loading="lazy"
                            className="video-thumb"
                          />
                        ) : (
                          <div className="video-thumb-placeholder">🎬</div>
                        )}
                        <div className="video-play-btn" aria-hidden="true">
                          ▶
                        </div>
                      </div>
                      <figcaption className="photo-caption">
                        {video.caption && <span className="cap-text">{video.caption}</span>}
                        <div className="photo-meta">
                          <span>🙏 {video.uploaderName}</span>
                          {video.event !== 'General' && <span className="event-tag">{video.event}</span>}
                          <button
                            className="like-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              likeVideo(video.id, idx);
                            }}
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
                  <p>{isMr ? 'अद्याप व्हिडिओ उपलब्ध नाहीत.' : 'No videos uploaded yet.'}</p>
                  <Link to="/gallery?tab=upload" className="btn primary small">
                    {t.gallery.sharePhoto}
                  </Link>
                </div>
              )}
            </div>
          )}

          <div className="btns" style={{ justifyContent: 'center', marginTop: '1.75rem' }}>
            <Link to="/gallery" className="btn primary">
              {t.gallery.viewAll}
            </Link>
            <Link to="/gallery?tab=upload" className="btn">
              {t.gallery.sharePhoto}
            </Link>
          </div>
        </div>
      </section>

      {/* ── 9. CONTACT & INTERACTIVE ENQUIRY FORM ─────────────────── */}
      <section className="sec alt contact" id="contact">
        <div className="wrap">
          <SectionHead eyebrow={t.contact.eyebrow} title={t.contact.title}>
            <p>{t.contact.desc}</p>
          </SectionHead>

          <div className="split" style={{ alignItems: 'start', gap: '2.5rem' }}>
            {/* Left: Contact Details & Quick Cards */}
            <div style={{ display: 'grid', gap: '1.5rem' }}>
              <dl style={{ margin: 0 }}>
                <dt>{t.contact.person}</dt>
                <dd>{c.person}</dd>
                <dt>{t.contact.phone}</dt>
                <dd>
                  <a href={`tel:${c.phone}`}>{c.phone}</a>
                </dd>
                <dt>{t.contact.email}</dt>
                <dd>
                  <a href={`mailto:${c.email}`}>{c.email}</a>
                </dd>
                <dt>{t.contact.address}</dt>
                <dd style={{ whiteSpace: 'pre-line' }}>{t.contact.addressVal}</dd>
              </dl>

              <div className="cols" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                <div className="card">
                  <h3>{t.contact.card1Title}</h3>
                  <p>{t.contact.card1Text}</p>
                  <Link to="/donate" style={{ fontWeight: 600 }}>{t.contact.card1Link} →</Link>
                </div>
                <div className="card">
                  <h3>{t.contact.card2Title}</h3>
                  <p>{t.contact.card2Text}</p>
                </div>
              </div>
            </div>

            {/* Right: Interactive Contact Enquiry Form */}
            <div
              className="card"
              style={{
                padding: '2rem',
                background: 'var(--card)',
                borderRadius: '16px',
                border: '1px solid var(--line)',
                boxShadow: '0 8px 24px -10px rgba(0,0,0,0.08)',
              }}
            >
              <h3 style={{ fontSize: '1.3rem', color: 'var(--heading)', marginBottom: '0.4rem' }}>
                {t.contact.formTitle}
              </h3>
              <p className="small muted" style={{ marginBottom: '1.25rem' }}>
                {t.contact.formDesc}
              </p>

              {enquirySuccess && (
                <div
                  style={{
                    background: 'var(--good-bg)',
                    color: 'var(--good)',
                    padding: '0.9rem 1.2rem',
                    borderRadius: '8px',
                    marginBottom: '1.2rem',
                    border: '1px solid rgba(46,125,50,0.3)',
                    fontWeight: 500,
                  }}
                >
                  ✓ {t.contact.successMsg}
                </div>
              )}

              {enquiryError && (
                <div
                  style={{
                    background: 'var(--danger-bg)',
                    color: 'var(--danger)',
                    padding: '0.8rem 1.2rem',
                    borderRadius: '8px',
                    marginBottom: '1.2rem',
                    border: '1px solid rgba(192,57,43,0.3)',
                  }}
                >
                  ✕ {enquiryError}
                </div>
              )}

              <form onSubmit={handleEnquirySubmit} style={{ display: 'grid', gap: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                  <div className="field">
                    <label htmlFor="enq-name" style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, marginBottom: '0.3rem' }}>
                      {t.contact.nameLabel} *
                    </label>
                    <input
                      id="enq-name"
                      type="text"
                      required
                      value={enquiryForm.name}
                      onChange={(e) => setEnquiryForm({ ...enquiryForm, name: e.target.value })}
                      placeholder={isMr ? 'उदा. ज्ञानेश्वर पाटील' : 'e.g. Ramesh Patil'}
                      style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid var(--line)', background: 'var(--bg)', color: 'var(--fg)', font: 'inherit' }}
                    />
                  </div>

                  <div className="field">
                    <label htmlFor="enq-phone" style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, marginBottom: '0.3rem' }}>
                      {t.contact.phoneLabel} *
                    </label>
                    <input
                      id="enq-phone"
                      type="tel"
                      required
                      value={enquiryForm.phone}
                      onChange={(e) => setEnquiryForm({ ...enquiryForm, phone: e.target.value })}
                      placeholder="9876543210"
                      style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid var(--line)', background: 'var(--bg)', color: 'var(--fg)', font: 'inherit' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                  <div className="field">
                    <label htmlFor="enq-email" style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, marginBottom: '0.3rem' }}>
                      {t.contact.emailLabel}
                    </label>
                    <input
                      id="enq-email"
                      type="email"
                      value={enquiryForm.email}
                      onChange={(e) => setEnquiryForm({ ...enquiryForm, email: e.target.value })}
                      placeholder="devotee@example.com"
                      style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid var(--line)', background: 'var(--bg)', color: 'var(--fg)', font: 'inherit' }}
                    />
                  </div>

                  <div className="field">
                    <label htmlFor="enq-type" style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, marginBottom: '0.3rem' }}>
                      {t.contact.typeLabel}
                    </label>
                    <select
                      id="enq-type"
                      value={enquiryForm.type}
                      onChange={(e) => setEnquiryForm({ ...enquiryForm, type: e.target.value })}
                      style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid var(--line)', background: 'var(--bg)', color: 'var(--fg)', font: 'inherit' }}
                    >
                      <option value="General">{t.contact.typeOptions.general}</option>
                      <option value="Temple Visit">{t.contact.typeOptions.visit}</option>
                      <option value="Worship / Pooja">{t.contact.typeOptions.pooja}</option>
                      <option value="Yatra">{t.contact.typeOptions.yatra}</option>
                      <option value="Donation">{t.contact.typeOptions.donation}</option>
                      <option value="Other">{t.contact.typeOptions.other}</option>
                    </select>
                  </div>
                </div>

                <div className="field">
                  <label htmlFor="enq-msg" style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, marginBottom: '0.3rem' }}>
                    {t.contact.messageLabel} *
                  </label>
                  <textarea
                    id="enq-msg"
                    rows="4"
                    required
                    value={enquiryForm.message}
                    onChange={(e) => setEnquiryForm({ ...enquiryForm, message: e.target.value })}
                    placeholder={t.contact.messagePlaceholder}
                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid var(--line)', background: 'var(--bg)', color: 'var(--fg)', font: 'inherit', resize: 'vertical' }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={enquiryLoading}
                  className="btn primary"
                  style={{ justifySelf: 'start', minWidth: '150px' }}
                >
                  {enquiryLoading ? t.contact.sending : t.contact.sendBtn}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* ── PHOTO LIGHTBOX ────────────────────────────────────────── */}
      {lightboxOpen && currentPhoto && (
        <div
          className="lightbox"
          onClick={() => setLightboxOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Photo view"
        >
          <button className="lightbox-close" onClick={() => setLightboxOpen(false)} aria-label="Close">
            ✕
          </button>
          <button
            className="lightbox-nav prev"
            onClick={(e) => {
              e.stopPropagation();
              setLightboxIndex((i) => (i - 1 + galleryPhotos.length) % galleryPhotos.length);
            }}
            aria-label="Previous"
          >
            ‹
          </button>
          <button
            className="lightbox-nav next"
            onClick={(e) => {
              e.stopPropagation();
              setLightboxIndex((i) => (i + 1) % galleryPhotos.length);
            }}
            aria-label="Next"
          >
            ›
          </button>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <img src={currentPhoto.imageUrl} alt={currentPhoto.caption || `Photo by ${currentPhoto.uploaderName}`} />
            <div className="lightbox-info">
              <p>{currentPhoto.caption || <span className="muted">No caption</span>}</p>
              <div className="lightbox-meta">
                <span>🙏 {currentPhoto.uploaderName}</span>
                {currentPhoto.event && currentPhoto.event !== 'General' && <span className="event-tag">{currentPhoto.event}</span>}
                <span className="muted">{fmtDate(currentPhoto.createdAt)}</span>
              </div>
              <button
                className="like-btn"
                style={{ marginTop: '.5rem', fontSize: '1.1rem' }}
                onClick={() => likePhoto(currentPhoto.id, lightboxIndex)}
              >
                ♡ {currentPhoto.likes} likes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── VIDEO LIGHTBOX ────────────────────────────────────────── */}
      {videoLightboxOpen && currentVideo && (
        <div
          className="lightbox"
          onClick={() => setVideoLightboxOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Video view"
        >
          <button className="lightbox-close" onClick={() => setVideoLightboxOpen(false)} aria-label="Close">
            ✕
          </button>
          <button
            className="lightbox-nav prev"
            onClick={(e) => {
              e.stopPropagation();
              setVideoLightboxIndex((i) => (i - 1 + galleryVideos.length) % galleryVideos.length);
            }}
            aria-label="Previous"
          >
            ‹
          </button>
          <button
            className="lightbox-nav next"
            onClick={(e) => {
              e.stopPropagation();
              setVideoLightboxIndex((i) => (i + 1) % galleryVideos.length);
            }}
            aria-label="Next"
          >
            ›
          </button>
          <div className="lightbox-content lightbox-video-content" onClick={(e) => e.stopPropagation()}>
            <video src={currentVideo.videoUrl} controls autoPlay className="lightbox-video" />
            <div className="lightbox-info">
              <p>{currentVideo.caption || <span className="muted">No caption</span>}</p>
              <div className="lightbox-meta">
                <span>🙏 {currentVideo.uploaderName}</span>
                {currentVideo.event && currentVideo.event !== 'General' && <span className="event-tag">{currentVideo.event}</span>}
                <span className="muted">{fmtDate(currentVideo.createdAt)}</span>
              </div>
              <button
                className="like-btn"
                style={{ marginTop: '.5rem', fontSize: '1.1rem' }}
                onClick={() => likeVideo(currentVideo.id, videoLightboxIndex)}
              >
                ♡ {currentVideo.likes} likes
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
