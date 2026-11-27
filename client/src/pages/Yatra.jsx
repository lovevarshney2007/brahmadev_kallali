import { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useSite } from '../SiteContext.jsx';

export default function Yatra() {
  const { t, lang } = useSite();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'overview';
  const [tab, setTab] = useState(
    ['overview', 'schedule', 'rituals'].includes(initialTab) ? initialTab : 'overview'
  );
  const tabsSectionRef = useRef(null);

  useEffect(() => {
    const qTab = searchParams.get('tab');
    if (qTab && ['overview', 'schedule', 'rituals'].includes(qTab)) {
      setTab(qTab);
      // Scroll to tabs section after a short delay to allow render
      setTimeout(() => {
        if (tabsSectionRef.current) {
          tabsSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 300);
    }
  }, [searchParams]);

  const switchTab = (newTab) => {
    setTab(newTab);
    setSearchParams(newTab === 'overview' ? {} : { tab: newTab });
  };

  const isMr = lang === 'mr';
  const yp = t.yatraPage || {};

  return (
    <div className="page-yatra">
      <section className="page-top hero hero-centered">
        <div className="wrap">
          <div className="head" style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center', justifyItems: 'center' }}>
            <span className="eyebrow" style={{ color: 'var(--gold-bright)' }}>{t.nav.yatraMahotsav}</span>
            <h1 style={{ color: 'var(--gold-bright)', fontSize: 'clamp(2rem, 5vw, 3rem)' }}>
              {yp.title}
            </h1>
            <p className="lede" style={{ color: '#FAF5EB', opacity: 0.95 }}>
              {yp.subtitle}
            </p>
          </div>
        </div>
      </section>

      {/* Trust Notice Disclaimer Banner */}
      <div style={{ background: 'var(--warn-bg)', borderBottom: '1px solid var(--line)', padding: '0.5rem 0' }}>
        <div className="wrap" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', justifyContent: 'center', textAlign: 'center' }}>
          <span style={{ fontSize: '1.15rem' }}>ℹ️</span>
          <p style={{ margin: 0, maxWidth: 'none', fontSize: '0.88rem', fontWeight: 500, color: 'var(--fg)', lineHeight: 1.4 }}>
            <strong>{yp.disclaimer}</strong>
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="sec" ref={tabsSectionRef} style={{ scrollMarginTop: '48px' }}>
        <div className="wrap">
          <div className="tabs" style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
            <button
              type="button"
              className={`btn ${tab === 'overview' ? 'primary' : ''}`}
              onClick={() => switchTab('overview')}
            >
              {yp.tabOverview}
            </button>
            <button
              type="button"
              className={`btn ${tab === 'schedule' ? 'primary' : ''}`}
              onClick={() => switchTab('schedule')}
            >
              {yp.tabSchedule}
            </button>
            <button
              type="button"
              className={`btn ${tab === 'rituals' ? 'primary' : ''}`}
              onClick={() => switchTab('rituals')}
            >
              {yp.tabRituals}
            </button>
          </div>

          {/* TAB 1: OVERVIEW */}
          {tab === 'overview' && (
            <div style={{ display: 'grid', gap: '2rem', maxWidth: '900px', margin: '0 auto' }}>
              <div className="card" style={{ padding: '2rem', background: 'var(--card)', borderRadius: '16px', border: '1px solid var(--line)' }}>
                <h2 style={{ fontSize: '1.6rem', color: 'var(--heading)', marginBottom: '1rem' }}>
                  {yp.overviewHeading}
                </h2>
                <p style={{ fontSize: '1.05rem', lineHeight: 1.7, marginBottom: '1.2rem' }}>
                  {yp.overviewText}
                </p>
                <h3 style={{ fontSize: '1.3rem', color: 'var(--maroon)', marginBottom: '0.8rem' }}>
                  {yp.communityAspect}
                </h3>
                <p style={{ fontSize: '1.05rem', lineHeight: 1.7 }}>
                  {yp.communityText}
                </p>
              </div>

              {/* Highlights 3-Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.2rem' }}>
                <div className="card" style={{ padding: '1.5rem', background: 'var(--card)', borderRadius: '12px', border: '1px solid var(--line)', textAlign: 'center' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '0.6rem' }}>🚩</div>
                  <h3 style={{ color: 'var(--heading)', marginBottom: '0.5rem' }}>
                    {isMr ? 'पालखी व मिरवणूक' : 'Sacred Palkhi Sohala'}
                  </h3>
                  <p className="small muted">
                    {isMr
                      ? 'टाळ-मृदुंग आणि पारंपारिक वाद्यांच्या गजरात भव्य मिरवणूक.'
                      : 'Traditional ceremonial palanquin procession through the village.'}
                  </p>
                </div>

                <div className="card" style={{ padding: '1.5rem', background: 'var(--card)', borderRadius: '12px', border: '1px solid var(--line)', textAlign: 'center' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '0.6rem' }}>🍲</div>
                  <h3 style={{ color: 'var(--heading)', marginBottom: '0.5rem' }}>
                    {isMr ? 'महाप्रसाद व अन्नदान' : 'Mahaprasad & Annadaan'}
                  </h3>
                  <p className="small muted">
                    {isMr
                      ? 'सर्व उपस्थित भाविकांसाठी अखंड अन्नछत्र व पवित्र प्रसाद वाटप.'
                      : 'Free community feast and holy prasad served to all visiting pilgrims.'}
                  </p>
                </div>

                <div className="card" style={{ padding: '1.5rem', background: 'var(--card)', borderRadius: '12px', border: '1px solid var(--line)', textAlign: 'center' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '0.6rem' }}>🎶</div>
                  <h3 style={{ color: 'var(--heading)', marginBottom: '0.5rem' }}>
                    {isMr ? 'कीर्तन व भजन' : 'Harinaam & Kirtan'}
                  </h3>
                  <p className="small muted">
                    {isMr
                      ? 'सुप्रसिद्ध कीर्तनकारांचे उद्बोधक विचार व नामस्मरण.'
                      : 'Devotional discourses, spiritual singing and congregational prayer.'}
                  </p>
                </div>
              </div>

              {/* Action Banner */}
              <div style={{ background: 'var(--maroon-2)', color: 'var(--on-dark)', borderRadius: '16px', padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '1rem', border: '1px solid var(--gold)' }}>
                <h3 style={{ color: 'var(--gold-bright)', fontSize: '1.5rem' }}>{yp.volunteerCall}</h3>
                <p style={{ maxWidth: '600px', opacity: 0.9 }}>{yp.volunteerCallDesc}</p>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                  <Link to="/#contact" className="btn light">
                    {t.nav.contact}
                  </Link>
                  <Link to="/donate" className="btn primary">
                    {t.nav.donate}
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SCHEDULE */}
          {tab === 'schedule' && (
            <div style={{ display: 'grid', gap: '2rem', maxWidth: '850px', margin: '0 auto' }}>
              <div className="card" style={{ padding: '2rem', background: 'var(--card)', borderRadius: '16px', border: '1px solid var(--line)' }}>
                <h2 style={{ fontSize: '1.5rem', color: 'var(--heading)', marginBottom: '0.8rem' }}>
                  {yp.scheduleHeading}
                </h2>
                <p style={{ color: 'var(--fg)', opacity: 0.9, lineHeight: 1.6, marginBottom: '1.5rem' }}>
                  {yp.scheduleIntro || yp.scheduleNote}
                </p>

                {/* Official Sample / Tentative Schedule Table */}
                <div className="tablebox" style={{ marginBottom: '2rem' }}>
                  <table>
                    <thead>
                      <tr>
                        <th>{yp.colDate || 'Date'}</th>
                        <th>{yp.colTime || 'Time'}</th>
                        <th>{yp.colProgramme || 'Programme'}</th>
                        <th>{yp.colVenue || 'Venue'}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        {
                          date: isMr ? 'दिवस १' : 'Day 1',
                          time: isMr ? 'सकाळ' : 'Morning',
                          programme: isMr ? 'ध्वजारोहण व घटस्थापना पूजा' : 'Dhwajarohan & Pooja',
                          venue: isMr ? 'मंदिर परिसर' : 'Temple premises',
                        },
                        {
                          date: isMr ? 'दिवस २' : 'Day 2',
                          time: isMr ? 'संध्याकाळ' : 'Evening',
                          programme: isMr ? 'भव्य पालखी सोहळा व नगर प्रदक्षिणा' : 'Palkhi Sohala',
                          venue: isMr ? 'गावातील मार्ग' : 'Village route',
                        },
                        {
                          date: isMr ? 'दिवस ३' : 'Day 3',
                          time: isMr ? 'दुपार' : 'Afternoon',
                          programme: isMr ? 'महाप्रसाद अन्नदान व कीर्तन' : 'Mahaprasad & Kirtan',
                          venue: isMr ? 'मंदिर प्रांगण' : 'Temple grounds',
                        },
                        {
                          date: isMr ? 'दिवस ४' : 'Day 4',
                          time: isMr ? 'संध्याकाळ' : 'Evening',
                          programme: isMr ? 'काल्याचे कीर्तन व सांगता महाआरती' : 'Concluding Aarti',
                          venue: isMr ? 'मंदिर गर्भगृह' : 'Temple sanctum',
                        },
                      ].map((row, i) => (
                        <tr key={i}>
                          <td><strong>{row.date}</strong></td>
                          <td><span className="chip">{row.time}</span></td>
                          <td>{row.programme}</td>
                          <td className="small muted">{row.venue}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* PDF Download Button & Trust Note */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '2rem', padding: '1.2rem', background: 'var(--band)', borderRadius: '12px', border: '1px solid var(--line)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.8rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <span style={{ fontSize: '1.5rem' }}>📄</span>
                      <strong>{isMr ? 'अधिकृत यात्रा कार्यक्रम (PDF)' : 'Official Yatra Programme (PDF)'}</strong>
                    </div>
                    <button
                      type="button"
                      className="btn small primary"
                      onClick={() => alert(yp.pdfNotice || 'The official PDF programme will be available for download once confirmed by the trust.')}
                    >
                      {yp.downloadPdf || 'Download Programme (PDF)'}
                    </button>
                  </div>
                  <p className="small muted" style={{ margin: 0 }}>
                    ℹ️ {yp.pdfNotice}
                  </p>
                </div>

                <h3 style={{ fontSize: '1.25rem', color: 'var(--maroon)', marginBottom: '1rem' }}>
                  {isMr ? 'दिवसनिहाय सविस्तर रूपरेषा' : 'Day-wise Detailed Sequence'}
                </h3>

                {/* Tentative Programme Timeline */}
                <div style={{ display: 'grid', gap: '1.2rem' }}>
                  {[
                    {
                      day: isMr ? 'दिवस १' : 'Day 1',
                      title: isMr ? 'ध्वजारोहण व घटस्थापना' : 'Dhwajarohan & Sacred Flag Hoisting',
                      timing: isMr ? 'वेळ: सकाळी लवकर' : 'Timing: Early Morning',
                      desc: isMr
                        ? 'मंदिरावर धर्मध्वज पूजन, विधीवत घटस्थापना आणि अखंड दिप प्रज्वलन.'
                        : 'Auspicious flag hoisting, ritual sanctification and lighting of the sacred flame.',
                    },
                    {
                      day: isMr ? 'दिवस २' : 'Day 2',
                      title: isMr ? 'विशेष पंचामृत अभिषेक व महापूजा' : 'Shri Brahmadev Mahapooja & Abhishek',
                      timing: isMr ? 'वेळ: सकाळी ८:०० ते ११:००' : 'Timing: 8:00 AM – 11:00 AM',
                      desc: isMr
                        ? 'वेदमंत्रोच्चारात श्री ब्रह्मदेवांची महापूजा व भाविकांचे दर्शन.'
                        : 'Vedic chanting, panchamrita abhishek and morning darshan for all devotees.',
                    },
                    {
                      day: isMr ? 'दिवस ३' : 'Day 3',
                      title: isMr ? 'भव्य पालखी सोहळा व नगर प्रदक्षिणा' : 'Grand Palkhi Sohala & Village Procession',
                      timing: isMr ? 'वेळ: संध्याकाळी ४:०० पासून' : 'Timing: From 4:00 PM onwards',
                      desc: isMr
                        ? 'श्रींची पालखी गावातून भाविकांच्या भेटीस निघते. अलोट गर्दी व भक्तीमय वातावरण.'
                        : 'Ceremonial palanquin procession visiting village alleys with traditional music and devotion.',
                    },
                    {
                      day: isMr ? 'दिवस ४' : 'Day 4',
                      title: isMr ? 'काल्याचे कीर्तन व महाप्रसाद' : 'Kalyache Kirtan & Mahaprasad Annadaan',
                      timing: isMr ? 'वेळ: सकाळी १०:०० ते दुपारी २:००' : 'Timing: 10:00 AM – 2:00 PM',
                      desc: isMr
                        ? 'काल्याचे कीर्तनाने यात्रेची सांगता व समस्त भाविकांना महाप्रसाद वाटप.'
                        : 'Concluding kirtan discourse followed by massive community feast (Annadaan).',
                    },
                  ].map((item, idx) => {
                    const isUpcomingOrLive = idx === 0;
                    return (
                      <div
                        key={idx}
                        className={`yatra-timeline-card ${isUpcomingOrLive ? 'is-live' : ''}`}
                        style={{
                          position: 'relative',
                          padding: '1.25rem 1.25rem 1.25rem 3rem',
                          background: 'var(--band)',
                          borderRadius: '12px',
                          borderLeft: `4px solid ${isUpcomingOrLive ? 'var(--cta)' : 'var(--saffron)'}`,
                          display: 'grid',
                          gap: '0.4rem',
                          boxShadow: isUpcomingOrLive ? '0 4px 18px rgba(211,84,0,0.12)' : 'none',
                        }}
                      >
                        {/* Sacred Timeline Dot with concentric pulse on upcoming/live ritual */}
                        <div
                          className="yatra-timeline-marker"
                          style={{
                            position: 'absolute',
                            left: '1rem',
                            top: '1.4rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <span className={`timeline-pulse-dot ${isUpcomingOrLive ? 'live' : ''}`} />
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span className="eyebrow" style={{ color: 'var(--cta)', fontWeight: 700 }}>
                              {item.day}
                            </span>
                            {isUpcomingOrLive && (
                              <span className="timeline-badge-live">
                                {isMr ? 'आगामी / प्रारंभ' : 'Upcoming / Inaugural'}
                              </span>
                            )}
                          </div>
                          <span className="small muted">{item.timing}</span>
                        </div>
                        <h4 style={{ margin: 0, fontSize: '1.15rem', color: 'var(--heading)' }}>
                          {item.title}
                        </h4>
                        <p style={{ margin: 0, fontSize: '0.92rem', color: 'var(--fg)', opacity: 0.9 }}>
                          {item.desc}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: RITUALS */}
          {tab === 'rituals' && (
            <div style={{ display: 'grid', gap: '1.5rem', maxWidth: '850px', margin: '0 auto' }}>
              <div className="card" style={{ padding: '2rem', background: 'var(--card)', borderRadius: '16px', border: '1px solid var(--line)' }}>
                <h2 style={{ fontSize: '1.5rem', color: 'var(--heading)', marginBottom: '1.2rem' }}>
                  {yp.ritualsHeading}
                </h2>

                <div style={{ display: 'grid', gap: '1.2rem' }}>
                  {(yp.ritualsList || []).map((ritual, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '1.2rem',
                        background: 'var(--band)',
                        borderRadius: '12px',
                        border: '1px solid var(--line)',
                        display: 'grid',
                        gap: '0.4rem',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span
                          style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '50%',
                            background: 'var(--saffron)',
                            color: '#fff',
                            display: 'grid',
                            placeItems: 'center',
                            fontSize: '0.85rem',
                            fontWeight: 700,
                            flexShrink: 0,
                          }}
                        >
                          {idx + 1}
                        </span>
                        <h3 style={{ margin: 0, fontSize: '1.15rem', color: 'var(--heading)' }}>
                          {ritual.title}
                        </h3>
                      </div>
                      <p style={{ margin: '0.3rem 0 0 2.5rem', fontSize: '0.95rem', color: 'var(--muted)', lineHeight: 1.6 }}>
                        {ritual.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
