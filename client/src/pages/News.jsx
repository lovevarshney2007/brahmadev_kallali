import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSite } from '../SiteContext.jsx';
import { LotusRule } from '../components/Decor.jsx';

export default function News() {
  const { t, settings, lang } = useSite();
  const isMr = lang === 'mr';
  const np = t.newsPage || {};

  const [activeCategory, setActiveCategory] = useState('all');
  const [expandedId, setExpandedId] = useState(null);

  const defaultArticles = [
    {
      id: 'website-launch',
      category: 'updates',
      badge: isMr ? 'नवीन घोषणा' : 'New Update',
      date: isMr ? '१४ नोव्हेंबर २०२६' : '14 November 2026',
      title: isMr
        ? 'श्री क्षेत्र ब्रह्मदेव देवस्थानचे अधिकृत संकेतस्थळ व डिजिटल दान वही सुरू'
        : 'Official Launch of Devasthan Website & Digital Daan Ledger',
      summary: isMr
        ? 'कल्लाळी येथील श्री क्षेत्र ब्रह्मदेव मंदिराचे अधिकृत संकेतस्थळ भाविकांच्या सेवेसाठी सुरू करण्यात आले आहे. सर्व देणग्या आणि खर्च या संकेतस्थळावर पारदर्शकपणे पाहिले जाऊ शकतात.'
        : 'The official website of Shri Kshetra Brahmadev Devasthan, Kallali is now live. Devotees can now access verified information, donate securely via official UPI QR, and view public financial records openly.',
      details: isMr
        ? 'या डिजिटल उपक्रमामुळे देश-विदेशातील भाविकांना मंदिरातील दैनिक पूजा, यात्रा महोत्सव व धार्मिक विधींची अचूक माहिती मिळेल. तसेच ऑनलाईन दान दिल्यास तात्काळ संगणकीकृत पावती प्राप्त होईल.'
        : 'This digital initiative connects devotees globally with authentic darshan timings, pooja rituals, and festival schedules. All donations are instantly recorded in the public ledger for full transparency.',
      link: { to: '/ledger', label: isMr ? 'पारदर्शक दान वही पहा →' : 'View Daan Ledger →' },
    },
    {
      id: 'yatra-prep',
      category: 'yatra',
      badge: isMr ? 'यात्रा तयारी' : 'Yatra Planning',
      date: isMr ? '१० नोव्हेंबर २०२६' : '10 November 2026',
      title: isMr
        ? 'वार्षिक श्री ब्रह्मदेव यात्रा महोत्सव नियोजनाची प्राथमिक बैठक'
        : 'Preliminary Planning Meeting for Annual Yatra Mahotsav',
      summary: isMr
        ? 'आगामी यात्रा महोत्सवाच्या नियोजनार्थ ग्रामस्थ, विश्वस्त मंडळ आणि सेवेकऱ्यांची प्राथमिक बैठक पार पडली. अधिकृत तारीख व वेळापत्रक लवकरच जाहीर केले जाईल.'
        : 'The temple trust and village sevekaris held a planning meeting to coordinate arrangements, crowd management, sanitation, and prasad distribution for the upcoming annual Yatra Mahotsav.',
      details: isMr
        ? 'बैठकीत पालखी सोहळा, महाप्रसाद अन्नदान, सुरक्षायंत्रणा आणि भाविकांच्या निवास-वाहतूक व्यवस्थेवर सविस्तर चर्चा करण्यात आली. स्वयंसेवक नोंदणी लवकरच सुरू होईल.'
        : 'Key topics included palanquin procession routes, Mahaprasad logistics, visitor amenities, parking, and volunteer mobilization. Volunteer registrations will open shortly.',
      link: { to: '/yatra', label: isMr ? 'यात्रा रूपरेषा पहा →' : 'View Yatra Overview →' },
    },
    {
      id: 'daan-receipts',
      category: 'transparency',
      badge: isMr ? 'पारदर्शकता' : 'Transparency',
      date: isMr ? 'नियमित सूचना' : 'Official Notice',
      title: isMr
        ? 'अधिकृत देणगी पावती व हिशोब पारदर्शकता सूचना'
        : 'Official Guidelines for Temple Donations and Receipts',
      summary: isMr
        ? 'सर्व भाविकांना नम्र विनंती करण्यात येते की, आपले दान केवळ देवस्थानच्या अधिकृत बँक खात्यात / UPI QR द्वारे जमा करावे. प्रत्येकास अधिकृत पावती प्रदान केली जाते.'
        : 'All devotees are requested to make contributions exclusively through the temple trust official UPI or bank accounts. Official receipts are issued, and entries are synchronized with the public ledger.',
      details: isMr
        ? 'केवळ संकेतस्थळावर दिलेल्या अधिकृत UPI ID वरच दान द्यावे. रोख देणगी दिल्यास अधिकृत ट्रस्ट पावतीची मागणी करावी. कोणत्याही खाजगी व्यक्तीच्या खात्यावर पैसे पाठवू नयेत.'
        : 'Please donate strictly using the verified UPI QR on this website. When donating in cash, insist on an official trust receipt. Never transfer funds to personal or unverified accounts.',
      link: { to: '/donate', label: isMr ? 'अधिकृत दान पृष्ठ →' : 'Official Donate Page →' },
    },
  ];

  const categories = [
    { id: 'all', label: isMr ? 'सर्व बातम्या' : 'All Updates' },
    { id: 'updates', label: isMr ? 'नवीन घोषणा' : 'Announcements' },
    { id: 'yatra', label: isMr ? 'यात्रा महोत्सव' : 'Yatra' },
    { id: 'transparency', label: isMr ? 'पारदर्शकता' : 'Transparency' },
  ];

  const filteredArticles = activeCategory === 'all'
    ? defaultArticles
    : defaultArticles.filter((a) => a.category === activeCategory);

  const toggleExpand = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="page-news">
      <section className="page-top hero" style={{ paddingBottom: '2.5rem' }}>
        <div className="wrap">
          <div className="head" style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center', justifyItems: 'center' }}>
            <span className="eyebrow" style={{ color: 'var(--gold-bright)' }}>{t.nav.news}</span>
            <h1 style={{ color: 'var(--gold-bright)', fontSize: 'clamp(2rem, 5vw, 3rem)' }}>
              {np.title}
            </h1>
            <p className="lede" style={{ color: '#FAF5EB', opacity: 0.95 }}>
              {np.subtitle}
            </p>
          </div>
        </div>
      </section>

      {/* Live Notice Banner if configured in admin */}
      {settings?.announcement && (
        <div style={{ background: 'var(--saffron)', color: '#fff', padding: '1rem 0' }}>
          <div className="wrap" style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', justifyContent: 'center' }}>
            <span style={{ fontSize: '1.4rem' }}>📢</span>
            <p style={{ margin: 0, fontWeight: 600, fontSize: '1rem' }}>
              {settings.announcement}
            </p>
          </div>
        </div>
      )}

      {/* News Articles List */}
      <div className="sec">
        <div className="wrap" style={{ maxWidth: '850px' }}>
          {/* Category Filter Pills */}
          <div
            style={{
              display: 'flex',
              gap: '0.5rem',
              flexWrap: 'wrap',
              justifyContent: 'center',
              marginBottom: '1.8rem',
            }}
            role="tablist"
            aria-label="Filter news by category"
          >
            {categories.map((c) => {
              const active = activeCategory === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setActiveCategory(c.id)}
                  style={{
                    padding: '0.4rem 1rem',
                    borderRadius: '999px',
                    border: '1px solid',
                    borderColor: active ? 'var(--cta)' : 'var(--line)',
                    background: active ? 'var(--cta)' : 'var(--card)',
                    color: active ? '#fff' : 'var(--fg)',
                    fontWeight: active ? 700 : 500,
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    transition: 'all 0.18s ease',
                  }}
                >
                  {c.label}
                </button>
              );
            })}
          </div>

          <div style={{ display: 'grid', gap: '1.5rem' }}>
            {filteredArticles.map((article) => {
              const isExpanded = expandedId === article.id;
              return (
                <article
                  key={article.id}
                  className="card reveal-on-scroll"
                  style={{
                    padding: '1.8rem',
                    background: 'var(--card)',
                    borderRadius: '16px',
                    border: '1px solid var(--line)',
                    display: 'grid',
                    gap: '0.8rem',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
                    transition: 'transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--gold)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--line)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <span
                      style={{
                        background: 'var(--warn-bg)',
                        color: 'var(--cta)',
                        padding: '0.2rem 0.65rem',
                        borderRadius: '999px',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        letterSpacing: '0.04em',
                      }}
                    >
                      {article.badge}
                    </span>
                    <span className="small muted">
                      📅 {article.date}
                    </span>
                  </div>

                  <h2 style={{ fontSize: '1.35rem', color: 'var(--heading)', margin: 0 }}>
                    {article.title}
                  </h2>

                  <p style={{ fontSize: '1rem', color: 'var(--fg)', lineHeight: 1.65 }}>
                    {article.summary}
                  </p>

                  {isExpanded && article.details && (
                    <div
                      style={{
                        marginTop: '0.5rem',
                        padding: '1rem 1.2rem',
                        background: 'var(--band)',
                        borderRadius: '10px',
                        borderLeft: '4px solid var(--saffron)',
                        fontSize: '0.95rem',
                        color: 'var(--fg)',
                        lineHeight: 1.65,
                      }}
                    >
                      {article.details}
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.8rem', marginTop: '0.4rem' }}>
                    <button
                      type="button"
                      onClick={() => toggleExpand(article.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        padding: 0,
                        color: 'var(--cta)',
                        fontWeight: 700,
                        fontSize: '0.92rem',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                      }}
                    >
                      {isExpanded
                        ? (isMr ? '▲ कमी दाखवा' : '▲ Show Less')
                        : (isMr ? '▼ सविस्तर वाचा' : '▼ Read Details')}
                    </button>

                    {article.link && (
                      <Link
                        to={article.link.to}
                        className="btn small light"
                        style={{ fontSize: '0.85rem', padding: '0.3rem 0.8rem' }}
                      >
                        {article.link.label}
                      </Link>
                    )}
                  </div>
                </article>
              );
            })}
          </div>

          <div style={{ display: 'grid', placeItems: 'center', margin: '2.5rem 0 1rem' }}>
            <LotusRule />
          </div>

          {/* Devotee contact box */}
          <div
            className="card"
            style={{
              padding: '1.8rem',
              background: 'var(--band)',
              borderRadius: '14px',
              border: '1px solid var(--line)',
              textAlign: 'center',
              display: 'grid',
              gap: '0.6rem',
              justifyItems: 'center',
            }}
          >
            <h3 style={{ color: 'var(--maroon)' }}>
              {isMr ? 'अधिक माहितीसाठी संपर्क' : 'Have News or Need Official Information?'}
            </h3>
            <p className="small muted" style={{ maxWidth: '550px' }}>
              {isMr
                ? 'देवस्थानचे कार्यक्रम किंवा घोषणांविषयी अधिक माहितीसाठी मंदिर कार्यालयाशी संपर्क साधा.'
                : 'For inquiries regarding festival announcements, pooja schedules, or committee decisions, please get in touch with the temple office.'}
            </p>
            <Link to="/#contact" className="btn small primary" style={{ marginTop: '0.3rem' }}>
              {t.nav.contact}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
