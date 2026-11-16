import { Link } from 'react-router-dom';
import { useSite } from '../SiteContext.jsx';
import { LotusRule } from '../components/Decor.jsx';

export default function Committee() {
  const { t, lang } = useSite();
  const isMr = lang === 'mr';
  const cp = t.committeePage || {};
  const roles = cp.roles || {};

  const leadershipList = [
    {
      role: roles.president || (isMr ? 'अध्यक्ष' : 'President / Adhyaksha'),
      name: isMr ? 'श्री. विश्वस्त अध्यक्ष' : 'Shri. Trust President',
      desc: isMr ? 'समग्र व्यवस्थापन व धार्मिक मार्गदर्शन' : 'Overall management, tradition preservation & administration',
      icon: '🏛️',
    },
    {
      role: roles.vicePresident || (isMr ? 'उपाध्यक्ष' : 'Vice President / Upadhyaksha'),
      name: isMr ? 'श्री. उपाध्यक्ष' : 'Shri. Vice President',
      desc: isMr ? 'कार्यान्वयन व भाविक समन्वय' : 'Operations coordination & devotee liaison',
      icon: '⭐',
    },
    {
      role: roles.secretary || (isMr ? 'कार्याध्यक्ष / सचिव' : 'Secretary / Karyadhyaksha'),
      name: isMr ? 'श्री. सचिव' : 'Shri. Secretary',
      desc: isMr ? 'दफ्तर, पत्रव्यवहार व नोंदणी' : 'Official correspondence, minutes & records',
      icon: '📜',
    },
    {
      role: roles.jointSecretary || (isMr ? 'सहसचिव' : 'Joint Secretary / Sahasachiv'),
      name: isMr ? 'श्री. सहसचिव' : 'Shri. Joint Secretary',
      desc: isMr ? 'दफ्तर सहाय्य व समन्वयक' : 'Administrative assistance & records coordination',
      icon: '✍️',
    },
    {
      role: roles.treasurer || (isMr ? 'कोषाध्यक्ष' : 'Treasurer / Koshadhyaksha'),
      name: isMr ? 'श्री. कोषाध्यक्ष' : 'Shri. Treasurer',
      desc: isMr ? 'दान वही, हिशोब व आर्थिक पारदर्शकता' : 'Financial management, audit & Daan Ledger oversight',
      icon: '📊',
    },
    {
      role: roles.coordinator || (isMr ? 'यात्रा प्रमुख' : 'Yatra Coordinator'),
      name: isMr ? 'श्री. यात्रा प्रमुख' : 'Shri. Yatra Coordinator',
      desc: isMr ? 'यात्रा महोत्सव नियोजन, मिरवणूक व सुरक्षा' : 'Yatra logistics, procession management & security',
      icon: '🚩',
    },
    {
      role: roles.volunteerCoordinator || (isMr ? 'स्वयंसेवक प्रमुख' : 'Volunteer Coordinator'),
      name: isMr ? 'श्री. स्वयंसेवक प्रमुख' : 'Shri. Volunteer Coordinator',
      desc: isMr ? 'सेवेकरी समन्वय, अन्नदान व भाविक सहाय्य' : 'Sevekari mobilization, prasad seva & devotee hospitality',
      icon: '🤝',
    },
    {
      role: roles.advisor || (isMr ? 'मार्गदर्शक सदस्य' : 'Advisory Member / Village Elder'),
      name: isMr ? 'ग्रामस्थ व ज्येष्ठ मार्गदर्शक' : 'Village Elders & Advisors',
      desc: isMr ? 'पारंपरिक चालीरीती व सामाजिक सलोखा' : 'Traditional customs, village guidance & harmony',
      icon: '🙏',
    },
  ];

  return (
    <div className="page-committee">
      <section className="page-top hero" style={{ paddingBottom: '2.5rem' }}>
        <div className="wrap">
          <div className="head" style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center', justifyItems: 'center' }}>
            <span className="eyebrow" style={{ color: 'var(--gold-bright)' }}>{t.nav.committee}</span>
            <h1 style={{ color: 'var(--gold-bright)', fontSize: 'clamp(2rem, 5vw, 3rem)' }}>
              {cp.title}
            </h1>
            <p className="lede" style={{ color: '#FAF5EB', opacity: 0.95 }}>
              {cp.subtitle}
            </p>
          </div>
        </div>
      </section>

      {/* Trust Confirmation Notice Banner */}
      <div style={{ background: 'var(--band)', borderBottom: '1px solid var(--line)', padding: '0.85rem 0' }}>
        <div className="wrap" style={{ textAlign: 'center' }}>
          <p className="small muted" style={{ margin: 0 }}>
            {isMr
              ? 'टीप: विश्वस्त व कार्यकारिणी सदस्यांची अधिकृत अंतिम यादी विश्वस्त मंडळाच्या मान्यतेनंतर अद्ययावत केली जात आहे.'
              : 'Note: Official trustee member names and portfolios are updated in coordination with the registered trust.'}
          </p>
        </div>
      </div>

      <div className="sec">
        <div className="wrap" style={{ maxWidth: '950px' }}>
          {/* Committee Cards Grid */}
          <div style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: '1.6rem', color: 'var(--heading)', marginBottom: '1.5rem', textAlign: 'center' }}>
              {cp.leadershipTitle}
            </h2>

            <div className="stagger-group" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
              {leadershipList.map((item, idx) => (
                <div
                  key={idx}
                  className="card reveal-on-scroll"
                  style={{
                    padding: '1.5rem',
                    background: 'var(--card)',
                    borderRadius: '14px',
                    border: '1px solid var(--line)',
                    display: 'grid',
                    gap: '0.5rem',
                    textAlign: 'center',
                    justifyItems: 'center',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                  }}
                >
                  <div
                    style={{
                      width: '54px',
                      height: '54px',
                      borderRadius: '50%',
                      background: 'var(--band)',
                      border: '2px solid var(--gold)',
                      display: 'grid',
                      placeItems: 'center',
                      fontSize: '1.6rem',
                    }}
                  >
                    {item.icon}
                  </div>
                  <span
                    style={{
                      background: 'var(--warn-bg)',
                      color: 'var(--cta)',
                      padding: '0.2rem 0.6rem',
                      borderRadius: '999px',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      marginTop: '0.25rem',
                    }}
                  >
                    {item.role}
                  </span>
                  <h3 style={{ fontSize: '1.15rem', color: 'var(--heading)', margin: '0.2rem 0 0' }}>
                    {item.name}
                  </h3>
                  <p className="small muted" style={{ margin: 0 }}>
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', placeItems: 'center', margin: '2.5rem 0 1.5rem' }}>
            <LotusRule />
          </div>

          {/* Governance & Transparency Card */}
          <div
            className="card"
            style={{
              padding: '2rem',
              background: 'linear-gradient(135deg, var(--card), var(--band))',
              borderRadius: '16px',
              border: '1px solid var(--line)',
              display: 'grid',
              gap: '1rem',
            }}
          >
            <h3 style={{ fontSize: '1.35rem', color: 'var(--maroon)', margin: 0 }}>
              {cp.trustGovernance}
            </h3>
            <p style={{ fontSize: '1rem', lineHeight: 1.7, margin: 0 }}>
              {cp.trustGovernanceText}
            </p>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
              <Link to="/ledger" className="btn small primary">
                {t.nav.daanLedger}
              </Link>
              <Link to="/#contact" className="btn small light" style={{ borderColor: 'var(--cta)', color: 'var(--cta)' }}>
                {t.nav.contact}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
