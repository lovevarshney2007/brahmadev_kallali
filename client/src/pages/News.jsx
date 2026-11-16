import { Link } from 'react-router-dom';
import { useSite } from '../SiteContext.jsx';

export default function News() {
  const { t, settings, lang } = useSite();
  const isMr = lang === 'mr';
  const np = t.newsPage || {};

  const defaultArticles = [
    {
      id: 'website-launch',
      badge: isMr ? 'नवीन घोषणा' : 'New Update',
      date: isMr ? 'नोव्हेंबर २०२६' : 'November 2026',
      title: isMr
        ? 'श्री क्षेत्र ब्रह्मदेव देवस्थानचे अधिकृत संकेतस्थळ व डिजिटल दान वही सुरू'
        : 'Official Launch of Devasthan Website & Digital Daan Ledger',
      summary: isMr
        ? 'कल्लाळी येथील श्री क्षेत्र ब्रह्मदेव मंदिराचे अधिकृत संकेतस्थळ भाविकांच्या सेवेसाठी सुरू करण्यात आले आहे. सर्व देणग्या आणि खर्च या संकेतस्थळावर पारदर्शकपणे पाहिले जाऊ शकतात.'
        : 'The official website of Shri Kshetra Brahmadev Devasthan, Kallali is now live. Devotees can now access verified information, donate securely via official UPI QR, and view public financial records openly.',
    },
    {
      id: 'yatra-prep',
      badge: isMr ? 'तयारी' : 'Preparation',
      date: isMr ? 'नोव्हेंबर २०२६' : 'November 2026',
      title: isMr
        ? 'वार्षिक श्री ब्रह्मदेव यात्रा महोत्सव नियोजनाची प्राथमिक बैठक'
        : 'Preliminary Planning Meeting for Annual Yatra Mahotsav',
      summary: isMr
        ? 'आगामी यात्रा महोत्सवाच्या नियोजनार्थ ग्रामस्थ, विश्वस्त मंडळ आणि सेवेकऱ्यांची प्राथमिक बैठक पार पडली. अधिकृत तारीख व वेळापत्रक लवकरच जाहीर केले जाईल.'
        : 'The temple trust and village sevekaris held a planning meeting to coordinate arrangements, crowd management, sanitation, and prasad distribution for the upcoming annual Yatra Mahotsav.',
    },
    {
      id: 'daan-receipts',
      badge: isMr ? 'पारदर्शकता' : 'Transparency',
      date: isMr ? 'चालू' : 'Ongoing',
      title: isMr
        ? 'अधिकृत देणगी पावती व हिशोब पारदर्शकता सूचना'
        : 'Official Guidelines for Temple Donations and Receipts',
      summary: isMr
        ? 'सर्व भाविकांना नम्र विनंती करण्यात येते की, आपले दान केवळ देवस्थानच्या अधिकृत बँक खात्यात / UPI QR द्वारे जमा करावे. प्रत्येकास अधिकृत पावती प्रदान केली जाते.'
        : 'All devotees are requested to make contributions exclusively through the temple trust official UPI or bank accounts. Official receipts are issued, and entries are synchronized with the public ledger.',
    },
  ];

  return (
    <div className="page-news">
      <section className="page-top hero hero-centered" style={{ paddingBottom: '2.5rem' }}>
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
        <div className="wrap" style={{ maxWidth: '850px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gap: '1.5rem' }}>
            {defaultArticles.map((article) => (
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
                  transition: 'transform 0.18s ease, box-shadow 0.18s ease',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <span
                    style={{
                      background: 'var(--warn-bg)',
                      color: 'var(--cta)',
                      padding: '0.2rem 0.6rem',
                      borderRadius: '999px',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      letterSpacing: '0.04em',
                    }}
                  >
                    {article.badge}
                  </span>
                  <span className="small muted">
                    {np.dateLabel || 'Published:'} {article.date}
                  </span>
                </div>

                <h2 style={{ fontSize: '1.35rem', color: 'var(--heading)', margin: 0 }}>
                  {article.title}
                </h2>

                <p style={{ fontSize: '0.98rem', color: 'var(--fg)', opacity: 0.9, lineHeight: 1.65 }}>
                  {article.summary}
                </p>
              </article>
            ))}
          </div>

          {/* Devotee contact box */}
          <div
            className="card"
            style={{
              marginTop: '2.5rem',
              padding: '1.5rem',
              background: 'var(--band)',
              borderRadius: '12px',
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
