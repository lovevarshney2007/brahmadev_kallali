import { useState, useMemo } from 'react';

/**
 * FestivalCalendar - Visual calendar showing festivals by month
 * Supports dummy data for now, easily replaceable with official calendar
 * Features: month navigation, festival cards, responsive grid
 */
export default function FestivalCalendar({
  festivals = [],
  initialMonth = new Date().getMonth(), // 0-11
  showMonthNav = true,
  className = '',
  t = {}, // translations
  lang = 'en'
}) {
  const [currentMonth, setCurrentMonth] = useState(initialMonth);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [expandedFestival, setExpandedFestival] = useState(null);

  const isMr = lang === 'mr';

  // Dummy festival data - replace with official data when available
  const dummyFestivals = useMemo(() => [
    { id: 'mahashivratri', name: 'Mahashivratri', marathi: 'महाशिवरात्रि', month: 1, day: 18, date: 'Feb 18', event: 'Maha Shivratri Utsav', details: 'Grand night-long worship of Lord Shiva with abhishek, bhajans, and community prasad.', icon: '🕉️', color: '#7B241C' },
    { id: 'ramnavmi', name: 'Ram Navami', marathi: 'राम नवमी', month: 2, day: 6, date: 'Mar 6', event: 'Ram Navami Celebration', details: 'Celebrating the birth of Lord Rama with special puja, kirtan, and distribution of panakam.', icon: '🏹', color: '#E67E22' },
    { id: 'hanumanjayanti', name: 'Hanuman Jayanti', marathi: 'हनुमान जयंती', month: 3, day: 12, date: 'Apr 12', event: 'Hanuman Jayanti Utsav', details: 'Special Hanuman Chalisa recitation 108 times, sundarkand path, and mahaprasad.', icon: '🙏', color: '#D35400' },
    { id: 'gurupurnima', name: 'Guru Purnima', marathi: 'गुरु पूर्णिमा', month: 6, day: 10, date: 'Jul 10', event: 'Guru Purnima Mahotsav', details: 'Honoring the guru parampara with paduka puja, discourses, and guru dakshina offerings.', icon: '📿', color: '#C88A2E' },
    { id: 'nagpanchami', name: 'Nag Panchami', marathi: 'नाग पंचमी', month: 6, day: 29, date: 'Jul 29', event: 'Nag Panchami Puja', details: 'Traditional worship of Nag Devta with milk, flowers, and special mantras for protection.', icon: '🐍', color: '#2E7D32' },
    { id: 'rakshabandhan', name: 'Raksha Bandhan', marathi: 'रक्षाबंधन', month: 7, day: 9, date: 'Aug 9', event: 'Raksha Bandhan Celebration', details: 'Sisters tie rakhi to brothers, temple distributes sacred threads, community feast.', icon: '🎗️', color: '#E67E22' },
    { id: 'janmashtami', name: 'Krishna Janmashtami', marathi: 'कृष्ण जन्माष्टमी', month: 7, day: 26, date: 'Aug 26', event: 'Janmashtami Mahotsav', details: 'Midnight celebration of Lord Krishna\'s birth with dahi handi, kirtan, and prasad.', icon: '🎭', color: '#2E7D32' },
    { id: 'ganeshchaturthi', name: 'Ganesh Chaturthi', marathi: 'गणेश चतुर्थी', month: 8, day: 7, date: 'Sep 7', event: 'Ganesh Chaturthi Utsav', details: '10-day festival with daily aarti, modak prasad, and visarjan procession.', icon: '🐘', color: '#F39C12' },
    { id: 'navratri', name: 'Navratri', marathi: 'नवरात्री', month: 9, day: 15, date: 'Oct 15-23', event: 'Navratri Utsav (9 nights)', details: 'Nine nights of Devi worship, garba, dandiya, and special homa each day.', icon: '🪔', color: '#D35400' },
    { id: 'diwali', name: 'Diwali', marathi: 'दिवाळी', month: 9, day: 31, date: 'Oct 31', event: 'Deepavali Celebration', details: 'Festival of lights with temple illumination, lakshmi puja, and fireworks display.', icon: '🪔', color: '#F5B041' },
    { id: 'kartikpurnima', name: 'Kartik Purnima', marathi: 'कार्तिक पूर्णिमा', month: 10, day: 15, date: 'Nov 15', event: 'Kartik Purnima Snan', details: 'Holy dip and deep daan at temple tank, special kartik snan and worship.', icon: '🕯️', color: '#C88A2E' },
    { id: 'dattajayanti', name: 'Datta Jayanti', marathi: 'दत्त जयंती', month: 11, day: 14, date: 'Dec 14', event: 'Datta Jayanti Utsav', details: 'Guru Dattatreya worship with guru charitra parayan and bhiksha alankaran.', icon: '🕉️', color: '#7B241C' },
  ], []);

  // Combine official festivals with dummy data
  const allFestivals = useMemo(() => {
    const official = festivals.map((f, i) => ({
      id: f.id || `official-${i}`,
      name: f.name,
      marathi: f.marathi || f.name,
      month: f.month || new Date(f.date).getMonth(),
      day: f.day || new Date(f.date).getDate(),
      date: f.date,
      event: f.event || f.name,
      details: f.details || f.description || (isMr ? 'ट्रस्टकडून तपशील लवकरच जाहीर केले जाईल.' : 'Details to be announced by the trust.'),
      icon: f.icon || '🕉️',
      color: f.color || '#E67E22',
      isOfficial: true,
    }));
    return [...official, ...dummyFestivals];
  }, [festivals, isMr]);

  // Get festivals for current month
  const monthFestivals = useMemo(() =>
    allFestivals.filter(f => f.month === currentMonth).sort((a, b) => (a.day || 0) - (b.day || 0)),
    [allFestivals, currentMonth]
  );

  // Get month names from translations
  // Note: `t` prop is already the festivals sub-object (t.festivals passed from parent)
  const monthNames = useMemo(() => {
    return t?.monthNames || ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  }, [t]);

  const noFestivalsText = t?.noFestivals || (isMr ? 'या महिन्यात कोणतेही उत्सव नाही' : 'No festivals scheduled for this month');
  const calendarDescText = t?.calendarDesc || (isMr ? 'वर्षभरातील प्रमुख सण व उत्सव' : 'Key celebrations throughout the year');

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(y => y - 1);
    } else {
      setCurrentMonth(m => m - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(y => y + 1);
    } else {
      setCurrentMonth(m => m + 1);
    }
  };

  const goToToday = () => {
    const now = new Date();
    setCurrentMonth(now.getMonth());
    setCurrentYear(now.getFullYear());
  };

  const isCurrentMonth = currentMonth === new Date().getMonth() && currentYear === new Date().getFullYear();

  return (
    <div className={`festival-calendar ${className}`} role="region" aria-label="Festival calendar">
      {/* Month Navigation */}
      {showMonthNav && (
        <div className="fest-cal-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button
              className="fest-cal-nav-btn"
              onClick={prevMonth}
              aria-label="Previous month"
              style={{ width: '44px', height: '44px', borderRadius: '50%', border: '2px solid var(--gold)', background: 'var(--card)', color: 'var(--fg)', fontSize: '1.2rem', cursor: 'pointer', display: 'grid', placeItems: 'center', transition: 'all .2s' }}
              onMouseOver={e => e.target.style.background = 'var(--band)'}
              onMouseOut={e => e.target.style.background = 'var(--card)'}
            >
              ‹
            </button>
            <div style={{ textAlign: 'center', minWidth: '180px' }}>
              <h3 style={{ fontFamily: 'var(--display)', fontSize: '1.5rem', color: 'var(--heading)', margin: 0 }}>
                {monthNames[currentMonth]} {currentYear}
              </h3>
              {isCurrentMonth && (
                <span style={{ fontSize: '.7rem', background: 'var(--saffron)', color: '#fff', padding: '.1rem .5rem', borderRadius: '999px', fontWeight: 700 }}>
                  CURRENT
                </span>
              )}
            </div>
            <button
              className="fest-cal-nav-btn"
              onClick={nextMonth}
              aria-label="Next month"
              style={{ width: '44px', height: '44px', borderRadius: '50%', border: '2px solid var(--gold)', background: 'var(--card)', color: 'var(--fg)', fontSize: '1.2rem', cursor: 'pointer', display: 'grid', placeItems: 'center', transition: 'all .2s' }}
              onMouseOver={e => e.target.style.background = 'var(--band)'}
              onMouseOut={e => e.target.style.background = 'var(--card)'}
            >
              ›
            </button>
          </div>
          {!isCurrentMonth && (
            <button
              onClick={goToToday}
              className="btn small"
              style={{ padding: '.4rem .9rem', fontSize: '.85rem' }}
            >
              📅 This Month
            </button>
          )}
        </div>
      )}

      {/* Festival Grid */}
      <div className="fest-cal-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
        {monthFestivals.length > 0 ? (
          monthFestivals.map((fest) => (
            <article
              key={fest.id}
              className="fest-cal-card"
              style={{
                background: 'var(--card)',
                border: '1px solid var(--line)',
                borderRadius: '14px',
                overflow: 'hidden',
                transition: 'transform .18s ease, box-shadow .18s ease',
                display: 'grid',
                gridTemplateRows: 'auto 1fr auto',
              }}
              onMouseOver={e => e.currentTarget.style.transform = 'translateY(-4px)'}
              onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              {/* Festival Header */}
              <div
                className="fest-cal-card-header"
                style={{
                  background: `linear-gradient(135deg, ${fest.color}22, ${fest.color}44)`,
                  borderBottom: `3px solid ${fest.color}`,
                  padding: '1rem 1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '.75rem',
                }}
              >
                <span
                  className="fest-cal-icon"
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    background: `linear-gradient(135deg, ${fest.color}, ${fest.color}dd)`,
                    color: '#fff',
                    fontSize: '1.5rem',
                    display: 'grid',
                    placeItems: 'center',
                    boxShadow: `0 4px 12px ${fest.color}44`,
                    flexShrink: 0,
                  }}
                  aria-hidden="true"
                >
                  {fest.icon}
                </span>
                <div style={{ minWidth: 0 }}>
                  <h4 style={{ fontFamily: 'var(--display)', fontSize: '1.1rem', color: 'var(--heading)', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {fest.name}
                  </h4>
                  {fest.marathi && fest.marathi !== fest.name && (
                    <p style={{ fontSize: '.85rem', color: 'var(--muted)', margin: '.15rem 0 0', fontWeight: 500 }}>
                      {fest.marathi}
                    </p>
                  )}
                </div>
              </div>

              {/* Festival Body */}
              <div className="fest-cal-card-body" style={{ padding: '1rem 1.25rem', display: 'grid', gap: '.5rem' }}>
                <div className="fest-cal-date" style={{ display: 'flex', alignItems: 'center', gap: '.5rem', color: 'var(--saffron)', fontWeight: 600, fontSize: '.9rem' }}>
                  <span style={{ fontSize: '1rem' }}>📅</span>
                  <span>{fest.date}</span>
                </div>
                <p className="fest-cal-event" style={{ fontFamily: 'var(--display)', fontSize: '1rem', color: 'var(--fg)', margin: 0 }}>
                  {fest.event}
                </p>
                <p className="fest-cal-details" style={{ fontSize: '.88rem', color: 'var(--muted)', margin: 0, lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {fest.details}
                </p>
              </div>

              {/* Festival Footer */}
              <div
                className="fest-cal-card-footer"
                style={{
                  padding: '.75rem 1.25rem',
                  background: 'var(--band)',
                  borderTop: '1px solid var(--line)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                {fest.isOfficial && (
                  <span className="chip approved" style={{ fontSize: '.7rem' }}>
                    ✓ Official
                  </span>
                )}
                <button
                  className="fest-cal-expand-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    setExpandedFestival(expandedFestival === fest.id ? null : fest.id);
                  }}
                  aria-expanded={expandedFestival === fest.id}
                  aria-controls={`fest-detail-${fest.id}`}
                  style={{
                    background: 'none',
                    border: '1px solid var(--gold)',
                    color: 'var(--gold)',
                    padding: '.35rem .85rem',
                    borderRadius: '999px',
                    fontSize: '.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    transition: 'all .15s',
                  }}
                  onMouseOver={e => { e.target.style.background = 'var(--gold)'; e.target.style.color = 'var(--maroon-2)'; }}
                  onMouseOut={e => { e.target.style.background = 'none'; e.target.style.color = 'var(--gold)'; }}
                >
                  {expandedFestival === fest.id ? 'Show Less' : 'Details'}
                </button>
              </div>

              {/* Expanded Details */}
              {expandedFestival === fest.id && (
                <div
                  id={`fest-detail-${fest.id}`}
                  className="fest-cal-expanded"
                  style={{
                    padding: '1rem 1.25rem',
                    background: 'linear-gradient(180deg, var(--band), var(--card))',
                    borderTop: '1px dashed var(--gold)',
                    animation: 'slideDown .25s ease',
                  }}
                >
                  <div style={{ display: 'grid', gap: '.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', color: 'var(--saffron)', fontWeight: 600 }}>
                      <span>📅</span>
                      <strong>Date:</strong> {fest.date}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', color: 'var(--muted)' }}>
                      <span>🕉️</span>
                      <strong>Event:</strong> {fest.event}
                    </div>
                    <div style={{ color: 'var(--fg)', lineHeight: 1.6 }}>
                      <strong>Description:</strong>
                      <p style={{ margin: '.5rem 0 0', color: 'var(--muted)' }}>{fest.details}</p>
                    </div>
                    {fest.isOfficial && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', color: 'var(--good)', fontSize: '.85rem' }}>
                        <span>✓</span>
                        <span>This festival is confirmed by the temple trust.</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </article>
          ))
        ) : (
          <div className="fest-cal-empty" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem 1rem', display: 'grid', gap: '1rem', justifyItems: 'center' }}>
            <div style={{ fontSize: '3.5rem', lineHeight: 1 }}>📅</div>
            <h3 style={{ fontFamily: 'var(--display)', color: 'var(--heading)', margin: 0 }}>{noFestivalsText}</h3>
            <p style={{ color: 'var(--muted)', maxWidth: '30ch' }}>
              {calendarDescText}
            </p>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="fest-cal-legend" style={{ marginTop: '2rem', padding: '1rem', background: 'var(--card)', border: '1px solid var(--line)', borderRadius: '12px' }}>
        <h4 style={{ fontFamily: 'var(--display)', color: 'var(--heading)', margin: '0 0 .75rem', fontSize: '1rem' }}>📋 Festival Types</h4>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.75rem', alignItems: 'center' }}>
          <span className="chip" style={{ background: 'rgba(230,126,34,.14)', borderColor: 'var(--saffron)', color: 'var(--saffron)' }}>Major Utsav</span>
          <span className="chip" style={{ background: 'rgba(200,138,46,.14)', borderColor: 'var(--gold)', color: 'var(--gold)' }}>Monthly Celebration</span>
          <span className="chip" style={{ background: 'rgba(46,125,50,.14)', borderColor: 'var(--good)', color: 'var(--good)' }}>Special Puja</span>
          <span className="chip" style={{ background: 'rgba(192,57,43,.14)', borderColor: 'var(--danger)', color: 'var(--danger)' }}>Community Event</span>
          <span className="chip ex" style={{ fontSize: '.7rem' }}>✦ Official (trust confirmed)</span>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .fest-cal-card:hover { box-shadow: 0 12px 30px -12px rgba(0,0,0,.15); }
        @media (max-width: 480px) {
          .fest-cal-header { flex-direction: column; align-items: stretch; }
          .fest-cal-header > div { justify-content: center; }
          .fest-cal-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}