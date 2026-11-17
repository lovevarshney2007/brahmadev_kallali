import { useState } from 'react';
import { useSite } from '../SiteContext.jsx';

/**
 * FloatingDiya:
 * Sacred living Diya (अखंड नंदादीप) fixed at the bottom-right of the screen.
 * Features:
 * - Continuous warm golden breathing aura (तेजोवलय)
 * - Multi-layer flickering flame (सजीव पवित्र ज्योत)
 * - Brass Diya lamp base (पितळी निरांजन)
 * - Sacred devotional tooltip on hover/tap ("॥ अखंड नंदादीप ॥ शुभं करोति कल्याणम्")
 * - Clicking plays a divine blessing glow and smooth scrolls to top
 */
export default function FloatingDiya() {
  const { lang } = useSite();
  const [blessed, setBlessed] = useState(false);
  const isMr = lang === 'mr';

  const handleClick = () => {
    setBlessed(true);
    setTimeout(() => setBlessed(false), 2000);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div
      className={`floating-diya-wrap${blessed ? ' is-blessed' : ''}`}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
      aria-label={isMr ? 'अखंड नंदादीप (वर जाण्यासाठी क्लिक करा)' : 'Sacred Diya (Click to scroll to top)'}
      title={isMr ? '॥ अखंड नंदादीप ॥ शुभं करोति कल्याणम्' : 'Sacred Lamp • Shubham Karoti Kalyanam'}
    >
      {/* Sacred Golden Breathing Halo / Aura */}
      <div className="diya-glowing-aura" aria-hidden="true" />

      {/* Sacred Shlok Tooltip */}
      <div className="diya-tooltip" aria-hidden="true">
        <span className="tooltip-deity">॥ ॐ ब्रह्मणे नमः ॥</span>
        <span className="tooltip-mantra">
          {isMr ? 'शुभं करोति कल्याणम्' : 'Shubham Karoti Kalyanam'}
        </span>
        <small className="tooltip-hint">{isMr ? 'दर्शनार्थ वर जा ↑' : 'Scroll to top ↑'}</small>
      </div>

      {/* SVG Sacred Brass Diya & Living Flickering Flame */}
      <svg
        className="floating-diya-svg"
        viewBox="0 0 64 64"
        width="54"
        height="54"
        aria-hidden="true"
      >
        <defs>
          {/* Flame Gradients */}
          <radialGradient id="flameOuter" cx="50%" cy="80%" r="60%">
            <stop offset="0%" stopColor="#FFF2A7" />
            <stop offset="35%" stopColor="#F5B041" />
            <stop offset="75%" stopColor="#E67E22" />
            <stop offset="100%" stopColor="#C0392B" stopOpacity="0.8" />
          </radialGradient>
          <radialGradient id="flameCore" cx="50%" cy="80%" r="50%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="50%" stopColor="#FFF6C2" />
            <stop offset="100%" stopColor="#F5B041" stopOpacity="0" />
          </radialGradient>

          {/* Brass Lamp Gradients */}
          <linearGradient id="brassGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F9E79F" />
            <stop offset="30%" stopColor="#F5B041" />
            <stop offset="70%" stopColor="#C88A2E" />
            <stop offset="100%" stopColor="#7E5109" />
          </linearGradient>
          <linearGradient id="brassDark" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#B7771E" />
            <stop offset="100%" stopColor="#5B1610" />
          </linearGradient>
          <radialGradient id="oilReflection" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#F5B041" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#B7771E" stopOpacity="0.3" />
          </radialGradient>
        </defs>

        {/* Outer Warm Halo Rays */}
        <circle cx="32" cy="22" r="18" fill="url(#flameCore)" opacity="0.4" className="diya-glow-pulse" />

        {/* Living Flickering Flame Group */}
        <g className="diya-living-flame">
          {/* Outer Flame Teardrop */}
          <path
            d="M32 4 C27 14 21 21 21 28 C21 34.5 25.8 39 32 39 C38.2 39 43 34.5 43 28 C43 21 37 14 32 4 Z"
            fill="url(#flameOuter)"
            className="flame-outer"
          />
          {/* Inner Flame Core */}
          <path
            d="M32 12 C29 18 26 23 26 28 C26 32 28.5 35 32 35 C35.5 35 38 32 38 28 C38 23 35 18 32 12 Z"
            fill="url(#flameCore)"
            className="flame-inner"
          />
          {/* Bright White Spiritual Center */}
          <ellipse cx="32" cy="30" rx="3" ry="5" fill="#FFFFFF" opacity="0.9" />
        </g>

        {/* Cotton Wick (वात) */}
        <line x1="32" y1="31" x2="32" y2="39" stroke="#3E2723" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="32" cy="32" r="1.5" fill="#E74C3C" />

        {/* Brass Diya Bowl (निरांजन वाटी) */}
        {/* Base Stem & Stand */}
        <path d="M26 55 L38 55 L35 59 L29 59 Z" fill="url(#brassDark)" />
        <ellipse cx="32" cy="59" rx="14" ry="3.5" fill="url(#brassGrad)" stroke="#B7771E" strokeWidth="0.8" />
        <path d="M29 46 L35 46 L36 55 L28 55 Z" fill="url(#brassGrad)" />
        <ellipse cx="32" cy="46" rx="6" ry="1.8" fill="url(#brassGrad)" />

        {/* Main Diya Oil Bowl */}
        <path
          d="M10 40 C10 50 20 54 32 54 C44 54 54 50 54 40 C54 39 10 39 10 40 Z"
          fill="url(#brassGrad)"
          stroke="#7E5109"
          strokeWidth="0.8"
        />
        {/* Diya Rim & Oil Surface */}
        <ellipse cx="32" cy="40" rx="22" ry="5" fill="url(#brassDark)" stroke="#F9E79F" strokeWidth="1" />
        <ellipse cx="32" cy="40.5" rx="19" ry="3.5" fill="url(#oilReflection)" />

        {/* Front Brass Motif Engraving */}
        <path d="M28 47 Q32 50 36 47" stroke="#FFF2A7" strokeWidth="1.2" fill="none" opacity="0.8" />
        <circle cx="32" cy="47" r="1.2" fill="#FFF2A7" />
      </svg>
    </div>
  );
}
