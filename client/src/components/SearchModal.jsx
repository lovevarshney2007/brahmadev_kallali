import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSite } from '../SiteContext.jsx';

/**
 * SearchModal:
 * Fast, keyboard-accessible instant search across the entire Devasthan portal.
 * Supports Marathi & English searches for rituals, pages, yatra, committee, and ledger.
 */
export default function SearchModal({ isOpen, onClose }) {
  const { lang, settings } = useSite();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const isMr = lang === 'mr';

  // Comprehensive index of searchable items
  const searchIndex = [
    {
      title: isMr ? 'दैनिक दर्शन व नित्य आरती वेळा' : 'Daily Darshan & Aarti Timings',
      desc: isMr ? 'सकाळची मंगल आरती, नित्य दर्शन, संध्या आरती व पूजा वेळा' : 'Morning Aarti, Daily Darshan, Sandhya Aarti & Timings',
      category: isMr ? 'धार्मिक विधी' : 'Rituals',
      path: '/#worship',
      icon: '🪔',
      keywords: ['aarti', 'darshan', 'pooja', 'abhishek', 'timing', 'आरती', 'दर्शन', 'पूजा', 'अभिषेक', 'वेळ'],
    },
    {
      title: isMr ? 'ऑनलाइन दान व देणगी' : 'Online Daan & Donation',
      desc: isMr ? 'मंदिराच्या जीर्णोद्धार व अन्नदान सेवेसाठी थेट देणगी' : 'Contribute directly for temple development & Annadaan',
      category: isMr ? 'सेवा' : 'Services',
      path: '/donate',
      icon: '🪙',
      keywords: ['donate', 'donation', 'daan', 'hundi', 'upi', 'दान', 'देणगी', 'हुंडी'],
    },
    {
      title: isMr ? 'वार्षिक श्री ब्रह्मदेव यात्रा महोत्सव' : 'Annual Yatra Mahotsav',
      desc: isMr ? 'यात्रा कार्यक्रम, पालखी सोहळा, कीर्तन व महाप्रसाद माहिती' : 'Yatra schedule, sacred procession, kirtan and mahaprasad',
      category: isMr ? 'उत्सव' : 'Festivals',
      path: '/yatra',
      icon: '🚩',
      keywords: ['yatra', 'festival', 'mahotsav', 'palkhi', 'kirtan', 'यात्रा', 'महोत्सव', 'पालखी', 'कीर्तन'],
    },
    {
      title: isMr ? 'छायाचित्र व व्हिडिओ दर्शन' : 'Photo & Video Gallery',
      desc: isMr ? 'मंदिराची पावन छायाचित्रे, मूर्ती दर्शन आणि व्हिडिओ' : 'Sacred temple photos, deity darshan and video archives',
      category: isMr ? 'दालन' : 'Gallery',
      path: '/gallery',
      icon: '📸',
      keywords: ['photo', 'video', 'gallery', 'darshan', 'photos', 'फोटो', 'व्हिडिओ', 'गॅलरी', 'छायाचित्रे'],
    },
    {
      title: isMr ? 'कल्लाळी येथे कसे पोहोचावे (नकाशा व मार्ग)' : 'Plan Your Visit & Route Map',
      desc: isMr ? 'कंधार, मुखेड व नांदेड येथून रस्ता, रेल्वे व विमान प्रवास' : 'Road, Rail & Air travel guide from Kandhar, Mukhed & Nanded',
      category: isMr ? 'दर्शन नियोजन' : 'Visit',
      path: '/#visit',
      icon: '📍',
      keywords: ['visit', 'route', 'map', 'location', 'travel', 'bus', 'train', 'नकाशा', 'मार्ग', 'कसे पोहोचावे', 'पत्ता'],
    },
    {
      title: isMr ? 'पारदर्शक दान नोंदवही (Daan Ledger)' : 'Transparency & Daan Ledger',
      desc: isMr ? 'देवस्थानचा अधिकृत जमा-खर्च आणि देणगीदार यादी' : 'Official temple accounts, donations received & expenditure records',
      category: isMr ? 'पारदर्शकता' : 'Ledger',
      path: '/ledger',
      icon: '📖',
      keywords: ['ledger', 'accounts', 'audit', 'transparency', 'expenses', 'जमा', 'खर्च', 'नोंदवही', 'हिशोब'],
    },
    {
      title: isMr ? 'विश्वस्त मंडळ व व्यवस्थापन समिती' : 'Trust Board & Committee',
      desc: isMr ? 'श्री क्षेत्र ब्रह्मदेव देवस्थानचे विश्वस्त व पदाधिकारी' : 'Office bearers and trustees managing the Devasthan',
      category: isMr ? 'प्रशासन' : 'Committee',
      path: '/committee',
      icon: '👥',
      keywords: ['committee', 'trustee', 'members', 'board', 'समिती', 'विश्वस्त', 'कार्यकारिणी'],
    },
    {
      title: isMr ? 'देवस्थानचा इतिहास व पावन वारसा' : 'Temple History & Spiritual Heritage',
      desc: isMr ? 'कल्लाळी देवस्थानची स्थापना, माहात्म्य व ऐतिहासिक माहिती' : 'Origin of the temple, divine glory and historical heritage',
      category: isMr ? 'इतिहास' : 'History',
      path: '/#history',
      icon: '🏛️',
      keywords: ['history', 'heritage', 'story', 'origin', 'इतिहास', 'वारसा', 'माहात्म्य'],
    },
    {
      title: isMr ? 'ताज्या बातम्या, उत्सव व घोषणा' : 'News & Announcements',
      desc: isMr ? 'मंदिराचे अधिकृत परिपत्रक, आगामी उत्सव व सूचना' : 'Official temple notices, upcoming festivals and press updates',
      category: isMr ? 'अपडेट्स' : 'News',
      path: '/news',
      icon: '📢',
      keywords: ['news', 'announcement', 'notice', 'updates', 'बातम्या', 'घोषणा', 'सूचना'],
    },
    {
      title: isMr ? 'कार्यालय संपर्क व विचारणा' : 'Temple Office Contact & Enquiry',
      desc: isMr ? 'फोन, ईमेल व थेट विचारणा अर्ज' : 'Phone, email and official enquiry form',
      category: isMr ? 'संपर्क' : 'Contact',
      path: '/#contact',
      icon: '📞',
      keywords: ['contact', 'phone', 'call', 'office', 'help', 'संपर्क', 'फोन', 'कार्यालय'],
    },
  ];

  // Filter items based on user query
  const filteredResults = query.trim()
    ? searchIndex.filter((item) => {
        const q = query.trim().toLowerCase();
        return (
          item.title.toLowerCase().includes(q) ||
          item.desc.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q) ||
          item.keywords.some((k) => k.toLowerCase().includes(q))
        );
      })
    : searchIndex.slice(0, 5); // Show top 5 recommended by default

  // Autofocus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Handle keyboard navigation (ArrowUp, ArrowDown, Enter, Escape)
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % (filteredResults.length || 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + (filteredResults.length || 1)) % (filteredResults.length || 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredResults[selectedIndex]) {
          handleSelect(filteredResults[selectedIndex].path);
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, filteredResults]);

  // Lock background scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleSelect = (path) => {
    onClose();
    if (path.startsWith('/#')) {
      const id = path.slice(2);
      if (window.location.pathname === '/') {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      } else {
        navigate(`/#${id}`);
      }
    } else {
      navigate(path);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="search-modal-backdrop" onClick={onClose}>
      <div
        className="search-modal-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={isMr ? 'वेबसाईट शोध' : 'Search Website'}
      >
        {/* Search Input Bar */}
        <div className="search-input-wrap">
          <svg className="search-input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            ref={inputRef}
            type="search"
            className="search-input"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder={
              isMr
                ? 'शोधा... (उदा. आरती, यात्रा, देणगी, समिती, उत्सव...)'
                : 'Search temple site... (e.g. Aarti, Yatra, Donate, Committee...)'
            }
          />
          {query && (
            <button
              type="button"
              className="search-clear-btn"
              onClick={() => {
                setQuery('');
                inputRef.current?.focus();
              }}
              aria-label={isMr ? 'शोध मिटवा' : 'Clear search'}
            >
              ✕
            </button>
          )}
          <button
            type="button"
            className="search-close-chip"
            onClick={onClose}
            aria-label={isMr ? 'बंद करा' : 'Close search'}
          >
            ESC
          </button>
        </div>

        {/* Quick Suggestion Pills */}
        {!query && (
          <div className="search-pills-row">
            <span className="search-pills-label">{isMr ? 'लोकप्रिय:' : 'Popular:'}</span>
            {['आरती वेळा', 'यात्रा', 'देणगी', 'नकाशा'].map((item) => (
              <button
                key={item}
                type="button"
                className="search-pill-btn"
                onClick={() => setQuery(item)}
              >
                {item}
              </button>
            ))}
          </div>
        )}

        {/* Results List */}
        <div className="search-results-list" role="listbox">
          {filteredResults.length > 0 ? (
            filteredResults.map((item, idx) => (
              <div
                key={item.path}
                className={`search-result-item${idx === selectedIndex ? ' is-selected' : ''}`}
                onClick={() => handleSelect(item.path)}
                onMouseEnter={() => setSelectedIndex(idx)}
                role="option"
                aria-selected={idx === selectedIndex}
              >
                <div className="result-icon">{item.icon}</div>
                <div className="result-text">
                  <div className="result-top">
                    <span className="result-title">{item.title}</span>
                    <span className="result-badge">{item.category}</span>
                  </div>
                  <p className="result-desc">{item.desc}</p>
                </div>
                <div className="result-arrow">→</div>
              </div>
            ))
          ) : (
            <div className="search-no-results">
              <span style={{ fontSize: '2rem' }}>🔍</span>
              <p>
                {isMr
                  ? `"${query}" साठी काहीही सापडले नाही. कृपया वेगळा शब्द वापरून शोधा.`
                  : `No results found for "${query}". Try searching with another keyword.`}
              </p>
            </div>
          )}
        </div>

        {/* Footer shortcuts info */}
        <div className="search-modal-footer-hint">
          <span>
            <kbd>↑</kbd> <kbd>↓</kbd> {isMr ? 'नेव्हिगेट करा' : 'Navigate'}
          </span>
          <span>
            <kbd>↵</kbd> {isMr ? 'उघडा' : 'Open'}
          </span>
          <span>
            <kbd>ESC</kbd> {isMr ? 'बंद करा' : 'Close'}
          </span>
        </div>
      </div>
    </div>
  );
}
