import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';

/**
 * QRPlaceholder - QR Code placeholder component ready for trust integration
 * Shows actual QR when UPI ID is configured, elegant placeholder otherwise
 */
export default function QRPlaceholder({
  upiId,
  upiUri,
  payeeName = 'Shri Brahmadev Devasthan',
  amount,
  size = 216,
  showAmount = true,
  className = '',
}) {
  const [copied, setCopied] = useState(false);
  const [showUpiDetails, setShowUpiDetails] = useState(false);

  const copyUpi = async () => {
    if (!upiId) return;
    try {
      await navigator.clipboard.writeText(upiId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  const hasValidUpi = upiId && /^[a-zA-Z0-9._-]{2,256}@[a-zA-Z][a-zA-Z0-9.]{1,63}$/.test(upiId);

  return (
    <div className={`qr-placeholder ${className}`} style={{ display: 'grid', gap: '1rem', textAlign: 'center' }}>
      {/* QR Code Frame */}
      <div className="qr-frame" style={{
        background: hasValidUpi ? '#fff' : 'linear-gradient(135deg, var(--band), var(--card))',
        borderRadius: '16px',
        padding: '20px',
        width: '100%',
        maxWidth: `${size + 40}px`,
        aspectRatio: '1',
        display: 'grid',
        placeItems: 'center',
        color: 'var(--muted)',
        fontSize: '.9rem',
        border: hasValidUpi ? '2px solid var(--line)' : '2px dashed var(--gold)',
        boxShadow: hasValidUpi ? '0 4px 16px rgba(0,0,0,.08)' : 'none',
        transition: 'all .3s ease',
        position: 'relative',
        margin: '0 auto',
      }}>
        {hasValidUpi && upiUri ? (
          <QRCodeSVG value={upiUri} size={size} level="M" marginSize={0} />
        ) : (
          <>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--gold-bright), var(--gold))',
              display: 'grid',
              placeItems: 'center',
              fontSize: '2.5rem',
              marginBottom: '1rem',
              boxShadow: '0 8px 24px -8px rgba(245,176,65,.5)',
              animation: 'pulse 2s ease-in-out infinite',
            }}>
              📱
            </div>
            <p style={{ fontFamily: 'var(--display)', fontSize: '1.1rem', color: 'var(--heading)', margin: 0 }}>
              {hasValidUpi ? 'Loading QR...' : 'QR Code Placeholder'}
            </p>
            <p style={{ fontSize: '.85rem', color: 'var(--muted)', margin: '.5rem 0 0', maxWidth: '200px' }}>
              {hasValidUpi ? 'Generating QR code...' : 'Trust UPI ID will be displayed here once configured.'}
            </p>
          </>
        )}

        {/* "Coming Soon" badge for placeholder */}
        {!hasValidUpi && (
          <div style={{
            position: 'absolute',
            bottom: '1rem',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'var(--saffron)',
            color: '#fff',
            padding: '.25rem .75rem',
            borderRadius: '999px',
            fontSize: '.7rem',
            fontWeight: 700,
            letterSpacing: '.06em',
            textTransform: 'uppercase',
            whiteSpace: 'nowrap',
            animation: 'fadeInUp .5s ease',
          }}>
            Ready for Integration
          </div>
        )}
      </div>

      {/* UPI Details Section */}
      <div className="upi-details" style={{ display: 'grid', gap: '.75rem', textAlign: 'center' }}>
        {hasValidUpi ? (
          <>
            <div className="upi-line" style={{ fontSize: '.92rem', opacity: '.9', overflowWrap: 'anywhere', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '.75rem', flexWrap: 'wrap' }}>
              <span>UPI ID: <strong>{upiId}</strong></span>
              <button
                className="copy-btn"
                type="button"
                onClick={copyUpi}
                style={{
                  background: 'none',
                  border: '1px solid rgba(242,196,106,.5)',
                  color: 'var(--gold-bright)',
                  borderRadius: '6px',
                  padding: '.3rem .7rem',
                  font: 'inherit',
                  fontSize: '.82rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '.3rem',
                  transition: 'all .15s',
                }}
                onMouseOver={e => { e.target.style.background = 'var(--gold-bright)'; e.target.style.color = 'var(--maroon-2)'; e.target.style.borderColor = 'var(--gold-bright)'; }}
                onMouseOut={e => { e.target.style.background = 'none'; e.target.style.color = 'var(--gold-bright)'; e.target.style.borderColor = 'rgba(242,196,106,.5)'; }}
              >
                {copied ? '✓ Copied' : '📋 Copy'}
              </button>
              {showAmount && amount > 0 && <span style={{ color: 'var(--heading)', fontWeight: 600 }}>{`₹${amount.toLocaleString('en-IN')}`}</span>}
            </div>

            <button
              type="button"
              onClick={() => setShowUpiDetails(!showUpiDetails)}
              className="toggle-details"
              style={{
                background: 'none',
                border: '1px dashed var(--gold)',
                color: 'var(--gold)',
                padding: '.4rem 1rem',
                borderRadius: '999px',
                font: 'inherit',
                fontSize: '.85rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all .15s',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '.4rem',
              }}
              onMouseOver={e => { e.target.style.background = 'var(--gold)'; e.target.style.color = 'var(--maroon-2)'; }}
              onMouseOut={e => { e.target.style.background = 'none'; e.target.style.color = 'var(--gold)'; }}
            >
              {showUpiDetails ? '▲ Hide UPI Details' : '▼ Show UPI Deep Link'}
            </button>

            {showUpiDetails && (
              <div style={{ textAlign: 'left', background: 'var(--band)', border: '1px solid var(--line)', borderRadius: '10px', padding: '1rem', fontSize: '.8rem', fontFamily: 'monospace', overflow: 'auto', maxWidth: '100%' }}>
                <strong>upi://pay?</strong>{upiUri?.replace('upi://pay?', '')}
              </div>
            )}

            {upiUri && (
              <a
                href={upiUri}
                className="btn light small"
                style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '.5rem' }}
              >
                <span style={{ fontSize: '1.1rem' }}>📲</span> Open in UPI App
              </a>
            )}
          </>
        ) : (
          <>
            <div className="setup-guide" style={{ display: 'grid', gap: '.75rem', padding: '1rem', background: 'linear-gradient(135deg, rgba(230,126,34,.08), rgba(200,138,46,.08))', border: '1px dashed var(--gold)', borderRadius: '12px' }}>
              <h4 style={{ fontFamily: 'var(--display)', color: 'var(--heading)', margin: 0, fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '.5rem' }}>
                🔧 Integration Ready
              </h4>
              <p style={{ margin: 0, color: 'var(--muted)', fontSize: '.9rem' }}>
                When the trust provides their official UPI ID, it will automatically appear here with a functional QR code.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem', fontSize: '.85rem', color: 'var(--muted)', textAlign: 'left' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                  <span style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'var(--good-bg)', color: 'var(--good)', display: 'grid', placeItems: 'center', fontSize: '.7rem', fontWeight: 700, flexShrink: 0 }}>1</span>
                  <span>Trust provides official UPI ID (e.g., <code style={{ fontFamily: 'monospace', background: 'var(--card)', padding: '.1rem .3rem', borderRadius: '4px' }}>temple@upi</code>)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                  <span style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'var(--warn-bg)', color: 'var(--warn)', display: 'grid', placeItems: 'center', fontSize: '.7rem', fontWeight: 700, flexShrink: 0 }}>2</span>
                  <span>Admin updates it in <strong>Settings → UPI ID</strong></span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                  <span style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'var(--band)', color: 'var(--fg)', display: 'grid', placeItems: 'center', fontSize: '.7rem', fontWeight: 700, flexShrink: 0, border: '1px solid var(--line)' }}>3</span>
                  <span>QR code generates automatically, ready for donations</span>
                </div>
              </div>
            </div>

            <div className="tbc" style={{ color: 'var(--gold-bright)', borderColor: 'var(--gold-bright)', display: 'inline-flex', alignItems: 'center', gap: '.4rem', padding: '.4rem 1rem', fontSize: '.8rem', fontWeight: 700, margin: '0 auto' }}>
              ⏳ UPI ID to be configured by trust
            </div>
          </>
        )}
      </div>

      {/* Security Note */}
      <div className="qr-security-note" style={{
        fontSize: '.82rem',
        color: 'var(--muted)',
        maxWidth: '34ch',
        margin: '.5rem auto 0',
        padding: '.75rem',
        background: 'var(--card)',
        border: '1px solid var(--line)',
        borderRadius: '10px',
        display: 'grid',
        gap: '.4rem',
        textAlign: 'left',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '.4rem', color: 'var(--saffron)', fontWeight: 600, fontSize: '.75rem', textTransform: 'uppercase', letterSpacing: '.06em' }}>
          <span>🔒</span> Security Note
        </div>
        <p style={{ margin: 0, lineHeight: 1.5 }}>
          {hasValidUpi
            ? 'Donate only through the official QR code and UPI ID shown above. After paying, share your UPI reference with the temple office for receipt issuance.'
            : 'Only donate through the official QR code that will appear here once the trust configures their UPI ID. Beware of fraudulent QR codes.'}
        </p>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); box-shadow: 0 8px 24px -8px rgba(245,176,65,.5); }
          50% { transform: scale(1.05); box-shadow: 0 12px 32px -8px rgba(245,176,65,.7); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateX(-50%) translateY(10px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        .qr-placeholder { width: 100%; }
        @media (prefers-reduced-motion: reduce) {
          .qr-frame > div:first-child { animation: none; }
          .qr-frame [style*="fadeInUp"] { animation: none; }
        }
      `}</style>
    </div>
  );
}