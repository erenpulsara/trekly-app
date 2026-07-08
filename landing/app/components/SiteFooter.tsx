import Link from 'next/link';
import Image from 'next/image';

const AGENCY_URL = process.env.NEXT_PUBLIC_AGENCY_URL ?? 'https://acenta.treklyapp.com';

const linkStyle: React.CSSProperties = {
  fontSize: '0.82rem',
  color: 'rgba(255,255,255,0.55)',
  textDecoration: 'none',
  transition: 'color 0.15s',
};

export default function SiteFooter() {
  return (
    <footer style={{ background: '#1A1A1A', padding: '14px 48px 10px' }}>
      <style>{`
        @media (max-width: 768px) {
          .sf-inner { flex-direction: column !important; align-items: center !important; gap: 16px !important; text-align: center; }
          .sf-left  { flex-direction: column !important; align-items: center !important; gap: 12px !important; }
          .sf-divider { display: none !important; }
          .sf-links { justify-content: center !important; }
          .sf-right { justify-content: center !important; }
        }
      `}</style>
      <div className="sf-inner" style={{
        maxWidth: '1200px', margin: '0 auto',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: '24px', flexWrap: 'wrap',
      }}>
        {/* Left: logo + nav links */}
        <div className="sf-left" style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Image src="/logo.png" alt="Trekly" width={22} height={22} style={{ objectFit: 'contain' }} />
            <span style={{ fontSize: '1rem', fontWeight: 800, color: '#FF5533', letterSpacing: '-0.04em' }}>Trekly</span>
          </div>
          <div className="sf-divider" style={{ width: '1px', height: '16px', background: 'rgba(255,255,255,0.12)' }} />
          <div className="sf-links" style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
            <Link href="/hakkimizda" style={linkStyle}>Hakkımızda</Link>
            <Link href="/privacy"    style={linkStyle}>Gizlilik</Link>
            <Link href="/terms"      style={linkStyle}>Koşullar</Link>
            <a href={AGENCY_URL} target="_blank" rel="noopener noreferrer" style={linkStyle}>Acenta Paneli</a>
          </div>
        </div>

        {/* Right: social + app stores */}
        <div className="sf-right" style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Instagram */}
          <a href="https://www.instagram.com/gettrekly" target="_blank" rel="noopener noreferrer" aria-label="Instagram" style={{
            order: 3,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: '36px', height: '36px', borderRadius: '9px',
            background: 'radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285AEB 90%)',
            textDecoration: 'none', flexShrink: 0,
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
              <circle cx="12" cy="12" r="4.5"/>
              <circle cx="17.5" cy="6.5" r="1" fill="white" stroke="none"/>
            </svg>
          </a>

          {/* YouTube */}
          <a href="#" aria-label="YouTube" style={{
            order: 4,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: '36px', height: '36px', borderRadius: '9px',
            background: '#FF0000', textDecoration: 'none', flexShrink: 0,
          }}>
            <svg width="20" height="14" viewBox="0 0 24 17" fill="none">
              <path d="M23.495 2.656A3.011 3.011 0 0 0 21.38.528C19.505 0 12 0 12 0S4.495 0 2.62.528A3.011 3.011 0 0 0 .505 2.656C0 4.545 0 8.5 0 8.5s0 3.955.505 5.844a3.011 3.011 0 0 0 2.115 2.128C4.495 17 12 17 12 17s7.505 0 9.38-.528a3.011 3.011 0 0 0 2.115-2.128C24 12.455 24 8.5 24 8.5s0-3.955-.505-5.844z" fill="white"/>
              <path d="M9.545 12.023V4.977L15.818 8.5l-6.273 3.523z" fill="#FF0000"/>
            </svg>
          </a>

          {/* App Store */}
          <a href="#" aria-label="App Store" style={{
            order: 1,
            display: 'inline-flex', alignItems: 'center', gap: '7px',
            background: '#000', border: '1px solid rgba(255,255,255,0.18)',
            borderRadius: '9px', padding: '5px 11px', textDecoration: 'none',
          }}>
            <svg width="16" height="19" viewBox="0 0 20 24" fill="white">
              <path d="M16.462 12.707c-.028-3.175 2.597-4.72 2.715-4.793-1.482-2.165-3.784-2.46-4.6-2.493-1.953-.198-3.815 1.153-4.804 1.153-.99 0-2.514-1.126-4.133-1.095-2.121.032-4.08 1.237-5.17 3.126C-1.684 12.558.73 18.965 2.83 22.398c1.05 1.503 2.29 3.188 3.91 3.128 1.576-.063 2.168-1.006 4.07-1.006 1.9 0 2.45 1.006 4.12.974 1.694-.028 2.762-1.523 3.803-3.034a13.46 13.46 0 001.73-3.514c-.04-.016-3.977-1.523-4.001-6.24zM13.28 3.612C14.15 2.556 14.743 1.1 14.58 0c-1.273.05-2.823.85-3.734 1.88-.818.924-1.534 2.404-1.34 3.82 1.42.11 2.874-.718 3.773-2.09z"/>
            </svg>
            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
              <span style={{ fontSize: '0.5rem', color: 'rgba(255,255,255,0.7)', fontWeight: 400 }}>Download on the</span>
              <span style={{ fontSize: '0.78rem', color: 'white', fontWeight: 600 }}>App Store</span>
            </div>
          </a>

          {/* Google Play */}
          <a href="#" aria-label="Google Play" style={{
            order: 2,
            display: 'inline-flex', alignItems: 'center', gap: '7px',
            background: '#000', border: '1px solid rgba(255,255,255,0.18)',
            borderRadius: '9px', padding: '5px 11px', textDecoration: 'none',
          }}>
            <svg width="16" height="18" viewBox="0 0 20 22">
              <path d="M.414.75C.155.99 0 1.393 0 1.924v18.152c0 .531.155.934.42 1.168l.062.057 10.17-10.17v-.238L.476.693.414.75z" fill="url(#gp_a)"/>
              <path d="M14.038 14.526l-3.386-3.395v-.238l3.387-3.387.077.044 4.01 2.278c1.145.65 1.145 1.716 0 2.367l-4.01 2.278-.078.053z" fill="url(#gp_b)"/>
              <path d="M14.116 14.473L10.652 11 .414 21.244c.378.4.999.45 1.703.05l12-6.82" fill="url(#gp_c)"/>
              <path d="M14.116 7.527L2.117.707C1.413.302.792.357.414.757L10.652 11l3.464-3.473z" fill="url(#gp_d)"/>
              <defs>
                <linearGradient id="gp_a" x1="9.81" y1="1.809" x2="-4.638" y2="16.257" gradientUnits="userSpaceOnUse"><stop stopColor="#00A0FF"/><stop offset="1" stopColor="#00E3FF"/></linearGradient>
                <linearGradient id="gp_b" x1="20.318" y1="11" x2="-.033" y2="11" gradientUnits="userSpaceOnUse"><stop stopColor="#FFE000"/><stop offset="1" stopColor="#FF9C00"/></linearGradient>
                <linearGradient id="gp_c" x1="12.072" y1="13.002" x2="-8.036" y2="33.11" gradientUnits="userSpaceOnUse"><stop stopColor="#FF3A44"/><stop offset="1" stopColor="#C31162"/></linearGradient>
                <linearGradient id="gp_d" x1="-1.934" y1="-7.697" x2="7.515" y2="1.751" gradientUnits="userSpaceOnUse"><stop stopColor="#32A071"/><stop offset="1" stopColor="#00F076"/></linearGradient>
              </defs>
            </svg>
            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
              <span style={{ fontSize: '0.5rem', color: 'rgba(255,255,255,0.7)', fontWeight: 400 }}>Get it on</span>
              <span style={{ fontSize: '0.78rem', color: 'white', fontWeight: 600 }}>Google Play</span>
            </div>
          </a>
        </div>
      </div>

      <p style={{ textAlign: 'center', fontSize: '0.72rem', color: 'rgba(255,255,255,0.2)', margin: '8px 0 0' }}>
        © {new Date().getFullYear()} Trekly
      </p>
    </footer>
  );
}
