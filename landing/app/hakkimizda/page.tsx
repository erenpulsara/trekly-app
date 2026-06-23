'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { type Lang, getLangClient, setLangCookie } from '@/lib/i18n';

const AGENCY_URL = process.env.NEXT_PUBLIC_AGENCY_URL ?? 'https://acenta.Treklyapp.com';

const HK = {
  tr: {
    nav: { tours: 'Turlar', about: 'Hakkımızda', becomeAgency: 'Acenta Ol' },
    hero: {
      eyebrow: "Trekly'i Tanıyın",
      h1: ['Bir Dağın', 'Zirvesinde', 'Doğdu.'],
      sub: 'Bir yazılım şirketi tarafından değil.',
      exploreTours: 'Turları Keşfet',
      becomeAgency: 'Acenta Ol',
    },
    origin: {
      quote: '"Bunu daha fazla insanın yaşaması lazım."',
      tag: 'Nasıl Başladık',
      body: "Trekly, bir yazılım şirketi tarafından kurulmadı. Bir dağın zirvesinde, nefes nefese, etrafındaki manzaraya bakarken",
      bodyEm: '"bunu daha fazla insanın yaşaması lazım"',
      bodyEnd: ' diyen insanlar tarafından kuruldu.',
      bodySm: "O zirvede hissedilen şey sadece hava değildi. Türkiye'nin bu kadar zengin bir doğaya sahipken neden bu deneyimlerin hâlâ bu kadar ulaşılması zor olduğuna dair bir soru da vardı.",
    },
    geo: {
      tag: "Türkiye'nin Doğası",
      headline: "Karadeniz'in sisli ormanları, Torosların sarp yamaçları, Kapadokya'nın peri bacaları, Ağrı'nın buzlu zirvesi.",
      sub: "Bunların hepsi kapımızın hemen önünde — ama çoğumuz nereye başlayacağını bilmiyor.",
    },
    sides: {
      seekers: { title: 'Deneyim Arayanlar', body: "Her gün yüzlerce insan Türkiye'nin doğasına çıkmak istiyor. Ama güvenilir bir rehber bulmak, kaliteli bir tura ulaşmak hâlâ gereksiz yere zor." },
      guides: { title: 'Rehberler & Acentalar', body: 'Onlarca yıllık deneyim, gizli rotalar, doğayla kurulan derin bağ. Ama dijital dünyada görünür değiller — onlara ulaşmak hâlâ telefon rehberi bulmak kadar zor.' },
    },
    mission: {
      tag: 'Misyonumuz',
      headline1: 'Trekly bu ikisini',
      headline2em: 'buluşturmak',
      headline3: ' için var.',
      sub: 'Her rezervasyon, bir insan ile bir deneyim arasındaki mesafeyi ortadan kaldırıyor.',
    },
    community: {
      tag: 'Platform & Topluluk',
      headline: 'Biz bir platform olduğumuz kadar bir topluluğa da inanıyoruz. Her rezervasyon yaptığında sadece bir tura katılmıyorsun.',
      pillars: [
        { num: '01', title: 'Güvenilir Rehberler', body: 'Deneyimli, doğrulanmış rehberler ve lisanslı acentalara güveniyorsun.' },
        { num: '02', title: 'Yerel Ekonomi', body: 'Yerel bir ekonomiyi destekliyorsun, bölgeye gerçek bir katkı sağlıyorsun.' },
        { num: '03', title: 'Kendi Sınırların', body: 'Her turu tamamladığında kazandığın puanlar, bu yolculuğun küçük bir hatırası.' },
      ],
    },
    manifesto: {
      line1: 'Doğa herkese ait.',
      line2: 'Trekly de öyle.',
      cta: 'Turları Keşfet',
    },
    footer: { privacy: 'Gizlilik', terms: 'Koşullar', agency: 'Acenta Paneli →' },
  },
  en: {
    nav: { tours: 'Tours', about: 'About', becomeAgency: 'Become an Agency' },
    hero: {
      eyebrow: 'Meet Trekly',
      h1: ['Born on a', "Mountain's", 'Summit.'],
      sub: 'Not by a software company.',
      exploreTours: 'Explore Tours',
      becomeAgency: 'Become an Agency',
    },
    origin: {
      quote: '"More people need to experience this."',
      tag: 'How We Started',
      body: "Trekly wasn't founded by a software company. It was founded by people standing breathless on a mountain summit, gazing at the landscape and thinking",
      bodyEm: '"more people need to experience this."',
      bodyEnd: '',
      bodySm: "On that summit, it wasn't just the air they felt. There was also a question: why, when Turkey has such incredible nature, are these experiences still so hard to access?",
    },
    geo: {
      tag: "Turkey's Nature",
      headline: "The misty forests of the Black Sea, the steep slopes of the Taurus Mountains, the fairy chimneys of Cappadocia, the icy summit of Ağrı.",
      sub: "All of this is right on our doorstep — yet most of us don't know where to begin.",
    },
    sides: {
      seekers: { title: 'Experience Seekers', body: "Every day, hundreds of people want to explore Turkey's nature. But finding a reliable guide or accessing a quality tour is still unnecessarily hard." },
      guides: { title: 'Guides & Agencies', body: "Decades of experience, hidden routes, a deep bond with nature. But they're invisible in the digital world — reaching them is like searching a phone book." },
    },
    mission: {
      tag: 'Our Mission',
      headline1: "Trekly exists to",
      headline2em: 'connect',
      headline3: ' these two.',
      sub: 'Every booking removes the distance between a person and an experience.',
    },
    community: {
      tag: 'Platform & Community',
      headline: "We believe in community as much as platform. When you make a booking, you're not just joining a tour.",
      pillars: [
        { num: '01', title: 'Trusted Guides', body: 'You trust experienced, verified guides and licensed agencies.' },
        { num: '02', title: 'Local Economy', body: "You support a local economy and make a real contribution to the region." },
        { num: '03', title: 'Your Own Limits', body: 'The points you earn on each completed tour are a small memento of your journey.' },
      ],
    },
    manifesto: {
      line1: 'Nature belongs to everyone.',
      line2: 'So does Trekly.',
      cta: 'Explore Tours',
    },
    footer: { privacy: 'Privacy', terms: 'Terms', agency: 'Agency Panel →' },
  },
} as const;

export default function HakkimizdaPage() {
  const [lang, setLangState] = useState<Lang>('tr');

  useEffect(() => {
    setLangState(getLangClient());
  }, []);

  const switchLang = (l: Lang) => {
    setLangCookie(l);
    window.location.reload();
  };

  const hk = HK[lang];

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add('vis');
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );
    document.querySelectorAll('.rev').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="hk">
      {/* ── Navbar ─────────────────────────────── */}
      <nav className="hk-nav">
        <Link href="/" className="hk-logo">
          <Image src="/logo.png" alt="Trekly" width={28} height={28} style={{ objectFit: 'contain' }} />
          <span>Trekly</span>
        </Link>
        <div className="hk-nav-r">
          <a href="/turlar" className="hk-navlink">{hk.nav.tours}</a>
          <Link href="/hakkimizda" className="hk-navlink hk-navlink-active">{hk.nav.about}</Link>
          <a href={AGENCY_URL} target="_blank" rel="noopener noreferrer" className="hk-nav-cta">
            {hk.nav.becomeAgency}
          </a>
          <div style={{ display: 'flex', alignItems: 'center', gap: '2px', background: 'rgba(0,0,0,0.06)', borderRadius: '7px', padding: '3px', marginLeft: '8px' }}>
            {(['tr', 'en'] as const).map((l) => (
              <button key={l} onClick={() => switchLang(l)} style={{ background: lang === l ? 'white' : 'transparent', border: 'none', borderRadius: '5px', padding: '4px 10px', fontSize: '0.72rem', fontWeight: 700, color: lang === l ? '#1A1A1A' : 'rgba(0,0,0,0.35)', cursor: 'pointer', letterSpacing: '0.04em', boxShadow: lang === l ? '0 1px 2px rgba(0,0,0,0.08)' : 'none', transition: 'all 0.15s' }}>
                {l.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* ── Hero ───────────────────────────────── */}
      <section className="hk-hero">
        <div className="hk-hero-bg" aria-hidden="true">
          <div className="hk-hero-orb hk-hero-orb1" />
          <div className="hk-hero-orb hk-hero-orb2" />
          <div className="hk-hero-grid" />
        </div>

        <div className="hk-hero-inner">
          <p className="hk-eyebrow">{hk.hero.eyebrow}</p>
          <h1 className="hk-h1">
            <span className="hk-h1-line">{hk.hero.h1[0]}</span>
            <span className="hk-h1-line hk-h1-accent">{hk.hero.h1[1]}</span>
            <span className="hk-h1-line">{hk.hero.h1[2]}</span>
          </h1>
          <p className="hk-hero-sub">{hk.hero.sub}</p>
          <div className="hk-hero-actions">
            <a href="/turlar" className="hk-btn-primary">
              {hk.hero.exploreTours}
              <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </a>
            <a href={AGENCY_URL} target="_blank" rel="noopener noreferrer" className="hk-btn-ghost">
              {hk.hero.becomeAgency}
            </a>
          </div>
        </div>

        <div className="hk-hero-scroll" aria-hidden="true">
          <div className="hk-hero-scroll-track" />
        </div>
      </section>

      {/* ── Origin ─────────────────────────────── */}
      <section className="hk-origin">
        <div className="hk-origin-inner">
          <div className="hk-origin-left rev">
            <div className="hk-ol" />
            <blockquote className="hk-quote">
              {hk.origin.quote}
            </blockquote>
          </div>
          <div className="hk-origin-right rev rev-d1">
            <p className="hk-tag">{hk.origin.tag}</p>
            <p className="hk-body">
              {hk.origin.body} <em className="hk-em">{hk.origin.bodyEm}</em>{hk.origin.bodyEnd}
            </p>
            <p className="hk-body-sm">{hk.origin.bodySm}</p>
          </div>
        </div>
      </section>

      {/* ── Geography ──────────────────────────── */}
      <section className="hk-geo">
        <div className="hk-geo-bg" aria-hidden="true">
          <span className="hk-gw hk-gw1">Karadeniz</span>
          <span className="hk-gw hk-gw2">Toroslar</span>
          <span className="hk-gw hk-gw3">Kapadokya</span>
          <span className="hk-gw hk-gw4">Ağrı</span>
        </div>
        <div className="hk-geo-inner rev">
          <p className="hk-tag hk-tag-orange">{hk.geo.tag}</p>
          <p className="hk-geo-headline">{hk.geo.headline}</p>
          <p className="hk-geo-sub rev rev-d1">{hk.geo.sub}</p>
        </div>
      </section>

      {/* ── Two sides ──────────────────────────── */}
      <section className="hk-sides">
        <div className="hk-sides-inner">
          <div className="hk-side rev">
            <div className="hk-side-icon">
              <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M24 8C14 8 6 20 6 20L14 32H34L42 20C42 20 34 8 24 8Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
                <path d="M18 32L22 24L26 28L30 20L34 32" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" opacity="0.5"/>
                <circle cx="24" cy="20" r="3" stroke="currentColor" strokeWidth="1.5"/>
              </svg>
            </div>
            <h3 className="hk-side-title">{hk.sides.seekers.title}</h3>
            <p className="hk-side-body">{hk.sides.seekers.body}</p>
          </div>
          <div className="hk-sides-divider" aria-hidden="true">
            <div className="hk-sides-plus">+</div>
          </div>
          <div className="hk-side rev rev-d1">
            <div className="hk-side-icon">
              <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="24" cy="16" r="7" stroke="currentColor" strokeWidth="1.8"/>
                <path d="M10 40C10 32.3 16.3 26 24 26C31.7 26 38 32.3 38 40" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                <path d="M30 20L36 14M36 14L42 20M36 14V26" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.5"/>
              </svg>
            </div>
            <h3 className="hk-side-title">{hk.sides.guides.title}</h3>
            <p className="hk-side-body">{hk.sides.guides.body}</p>
          </div>
        </div>
      </section>

      {/* ── Mission ────────────────────────────── */}
      <section className="hk-mission">
        <div className="hk-mission-inner rev">
          <p className="hk-tag hk-tag-white">{hk.mission.tag}</p>
          <h2 className="hk-mission-headline">
            {hk.mission.headline1}<br />
            <em>{hk.mission.headline2em}</em>{hk.mission.headline3}
          </h2>
          <div className="hk-mission-rule" />
          <p className="hk-mission-sub rev rev-d1">{hk.mission.sub}</p>
        </div>
      </section>

      {/* ── Community ──────────────────────────── */}
      <section className="hk-community">
        <div className="hk-community-inner">
          <p className="hk-tag hk-tag-orange rev">{hk.community.tag}</p>
          <p className="hk-community-headline rev rev-d1">{hk.community.headline}</p>

          <div className="hk-pillars rev rev-d2">
            {hk.community.pillars.map((p) => (
              <div key={p.num} className="hk-pillar">
                <div className="hk-pillar-num">{p.num}</div>
                <h4 className="hk-pillar-title">{p.title}</h4>
                <p className="hk-pillar-body">{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Manifesto ──────────────────────────── */}
      <section className="hk-manifesto">
        <div className="hk-manifesto-inner rev">
          <h2 className="hk-man-line1">{hk.manifesto.line1}</h2>
          <h2 className="hk-man-line2">{hk.manifesto.line2}</h2>
          <div className="hk-man-cta-wrap rev rev-d1">
            <a href="/turlar" className="hk-man-cta">
              {hk.manifesto.cta}
              <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </a>
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────── */}
      <footer className="hk-footer">
        <div className="hk-footer-logo-wrap">
          <Image src="/logo.png" alt="Trekly" width={22} height={22} style={{ objectFit: 'contain' }} />
          <span className="hk-footer-logo">Trekly</span>
        </div>
        <div className="hk-footer-links">
          <a href="/privacy">{hk.footer.privacy}</a>
          <a href="/terms">{hk.footer.terms}</a>
          <a href={AGENCY_URL} target="_blank" rel="noopener noreferrer">{hk.footer.agency}</a>
        </div>
        <span className="hk-footer-copy">© {new Date().getFullYear()} Trekly</span>
      </footer>

      <style>{`
        /* ─── Base ──────────────────────────────── */
        .hk {
          font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;
          overflow-x: hidden;
          -webkit-font-smoothing: antialiased;
          color: #1A1A1A;
        }

        /* ─── Navbar ────────────────────────────── */
        .hk-nav {
          position: fixed;
          top: 0; left: 0; right: 0;
          z-index: 200;
          height: 64px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 44px;
          background: rgba(255,255,255,0.96);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border-bottom: 1px solid rgba(0,0,0,0.08);
        }
        .hk-logo {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 1.32rem;
          font-weight: 800;
          color: #FF5533;
          letter-spacing: -0.04em;
          text-decoration: none;
        }
        .hk-nav-r {
          display: flex;
          align-items: center;
          gap: 24px;
        }
        .hk-navlink {
          font-size: 0.85rem;
          font-weight: 500;
          color: rgba(0,0,0,0.45);
          text-decoration: none;
          transition: color 0.15s;
        }
        .hk-navlink:hover { color: rgba(0,0,0,0.85); }
        .hk-navlink-active { color: #FF5533 !important; }
        .hk-nav-cta {
          font-size: 0.8rem;
          font-weight: 700;
          background: #FF5533;
          color: white;
          padding: 8px 18px;
          border-radius: 9px;
          text-decoration: none;
          transition: background 0.15s;
        }
        .hk-nav-cta:hover { background: #E64420; }

        /* ─── Hero ──────────────────────────────── */
        .hk-hero {
          position: relative;
          min-height: 100vh;
          background: #FFFFFF;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }
        .hk-hero-bg {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }
        .hk-hero-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
        }
        .hk-hero-orb1 {
          width: 600px; height: 600px;
          top: -200px; right: -150px;
          background: radial-gradient(ellipse, rgba(255,85,51,0.12) 0%, transparent 70%);
          animation: orbFloat 12s ease-in-out infinite;
        }
        .hk-hero-orb2 {
          width: 400px; height: 400px;
          bottom: -100px; left: -100px;
          background: radial-gradient(ellipse, rgba(255,85,51,0.07) 0%, transparent 70%);
          animation: orbFloat 16s ease-in-out infinite;
          animation-delay: -6s;
        }
        @keyframes orbFloat {
          0%,100% { transform: translate(0,0) scale(1); }
          33% { transform: translate(30px,-20px) scale(1.04); }
          66% { transform: translate(-15px,25px) scale(0.98); }
        }
        .hk-hero-grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(255,85,51,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,85,51,0.04) 1px, transparent 1px);
          background-size: 60px 60px;
          mask-image: radial-gradient(ellipse 70% 70% at 50% 40%, black 0%, transparent 100%);
          -webkit-mask-image: radial-gradient(ellipse 70% 70% at 50% 40%, black 0%, transparent 100%);
        }
        .hk-hero-inner {
          position: relative;
          z-index: 10;
          text-align: center;
          padding: 80px 24px 0;
          max-width: 900px;
        }
        .hk-eyebrow {
          font-size: 0.62rem;
          font-weight: 700;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          color: #FF5533;
          margin: 0 0 32px;
          animation: fadeUp 0.8s ease both;
          animation-delay: 0.15s;
        }
        .hk-h1 {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(4rem, 10vw, 9.5rem);
          font-weight: 400;
          line-height: 1.06;
          letter-spacing: -0.03em;
          margin: 0 0 32px;
          display: flex;
          flex-direction: column;
          color: #0D0D1A;
        }
        .hk-h1-line { display: block; }
        .hk-h1-line:nth-child(1) { animation: titleRise 1s cubic-bezier(0.16,1,0.3,1) both; animation-delay: 0.3s; }
        .hk-h1-line:nth-child(2) { animation: titleRise 1s cubic-bezier(0.16,1,0.3,1) both; animation-delay: 0.5s; }
        .hk-h1-line:nth-child(3) { animation: titleRise 1s cubic-bezier(0.16,1,0.3,1) both; animation-delay: 0.7s; }
        .hk-h1-accent { color: #FF5533; font-style: italic; }
        @keyframes titleRise {
          from { opacity:0; transform: translateY(70px); }
          to   { opacity:1; transform: translateY(0); }
        }
        .hk-hero-sub {
          font-size: clamp(0.85rem, 1.4vw, 1rem);
          color: #999;
          letter-spacing: 0.05em;
          margin: 0 0 44px;
          font-style: italic;
          animation: fadeUp 0.8s ease both;
          animation-delay: 0.95s;
        }
        .hk-hero-actions {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 14px;
          flex-wrap: wrap;
          animation: fadeUp 0.8s ease both;
          animation-delay: 1.15s;
        }
        .hk-btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 9px;
          background: #FF5533;
          color: white;
          font-size: 0.88rem;
          font-weight: 700;
          letter-spacing: 0.03em;
          padding: 14px 32px;
          border-radius: 50px;
          text-decoration: none;
          transition: background 0.2s, transform 0.25s cubic-bezier(0.34,1.56,0.64,1);
        }
        .hk-btn-primary:hover { background: #E64420; transform: translateY(-3px); color: white; }
        .hk-btn-ghost {
          display: inline-flex;
          align-items: center;
          gap: 9px;
          background: transparent;
          color: #555;
          font-size: 0.88rem;
          font-weight: 600;
          padding: 14px 24px;
          border: 1.5px solid rgba(0,0,0,0.15);
          border-radius: 50px;
          text-decoration: none;
          transition: border-color 0.2s, color 0.2s;
        }
        .hk-btn-ghost:hover { border-color: #FF5533; color: #FF5533; }
        .hk-hero-scroll {
          position: absolute;
          bottom: 44px; left: 50%;
          transform: translateX(-50%);
          animation: fadeUp 0.8s ease both;
          animation-delay: 1.5s;
        }
        .hk-hero-scroll-track {
          width: 1px;
          height: 72px;
          background: linear-gradient(to bottom, #FF5533 0%, transparent 100%);
          animation: scrollTrack 2.2s ease-in-out infinite;
        }
        @keyframes scrollTrack {
          0%   { transform: scaleY(0); transform-origin: top; opacity:1; }
          50%  { transform: scaleY(1); transform-origin: top; opacity:1; }
          100% { transform: scaleY(1); transform-origin: bottom; opacity:0; }
        }

        /* ─── Scroll reveal ─────────────────────── */
        .rev {
          opacity: 0;
          transform: translateY(40px);
          transition: opacity 0.8s cubic-bezier(0.16,1,0.3,1),
                      transform 0.8s cubic-bezier(0.16,1,0.3,1);
        }
        .rev.vis { opacity:1; transform: translateY(0); }
        .rev-d1 { transition-delay: 0.15s; }
        .rev-d2 { transition-delay: 0.3s; }
        .rev-d3 { transition-delay: 0.45s; }

        /* ─── Shared ────────────────────────────── */
        .hk-tag {
          font-size: 0.6rem;
          font-weight: 700;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          color: #999;
          margin: 0 0 24px;
          display: block;
        }
        .hk-tag-orange { color: #FF5533; }
        .hk-tag-white  { color: rgba(255,255,255,0.55); }
        .hk-body {
          font-size: 1.05rem;
          line-height: 1.85;
          color: #4A4A4A;
          margin: 0 0 20px;
        }
        .hk-body-sm {
          font-size: 0.95rem;
          line-height: 1.8;
          color: #888;
          margin: 0;
        }
        .hk-em {
          font-style: italic;
          color: #FF5533;
          font-weight: 600;
        }

        /* ─── Origin ────────────────────────────── */
        .hk-origin {
          background: #FDF8F5;
          padding: 130px 60px;
          border-top: 1px solid rgba(0,0,0,0.05);
        }
        .hk-origin-inner {
          max-width: 1100px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 90px;
          align-items: start;
        }
        .hk-ol {
          width: 0;
          height: 3px;
          background: #FF5533;
          margin-bottom: 32px;
          transition: width 1s cubic-bezier(0.16,1,0.3,1) 0.3s;
        }
        .hk-origin-left.vis .hk-ol { width: 52px; }
        .hk-quote {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(1.8rem, 3.2vw, 3rem);
          font-weight: 400;
          font-style: italic;
          color: #0D0D1A;
          line-height: 1.3;
          margin: 0;
        }

        /* ─── Geography ─────────────────────────── */
        .hk-geo {
          background: #FFFFFF;
          padding: 140px 60px;
          overflow: hidden;
          position: relative;
          text-align: center;
          border-top: 1px solid rgba(0,0,0,0.05);
        }
        .hk-geo-bg {
          position: absolute;
          inset: 0;
          pointer-events: none;
          overflow: hidden;
        }
        .hk-gw {
          position: absolute;
          font-family: 'Cormorant Garamond', serif;
          font-weight: 300;
          color: rgba(255,85,51,0.045);
          text-transform: uppercase;
          letter-spacing: 0.04em;
          user-select: none;
          white-space: nowrap;
          line-height: 1;
        }
        .hk-gw1 { top:-3%;  left:-5%;   font-size: clamp(60px,11vw,160px); }
        .hk-gw2 { top:30%;  right:-8%;  font-size: clamp(50px,9vw,130px); }
        .hk-gw3 { bottom:5%;left:5%;    font-size: clamp(40px,7vw,100px); }
        .hk-gw4 { top:15%;  right:25%;  font-size: clamp(35px,5.5vw,80px); }
        .hk-geo-inner {
          position: relative;
          z-index: 10;
          max-width: 720px;
          margin: 0 auto;
        }
        .hk-geo-headline {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(1.6rem, 2.8vw, 2.5rem);
          font-weight: 400;
          color: #0D0D1A;
          line-height: 1.55;
          margin: 0 0 28px;
        }
        .hk-geo-sub {
          font-size: 1rem;
          color: #888;
          font-style: italic;
          line-height: 1.7;
          margin: 0;
        }

        /* ─── Two Sides ─────────────────────────── */
        .hk-sides {
          background: #FDF8F5;
          padding: 120px 60px;
          border-top: 1px solid rgba(0,0,0,0.05);
        }
        .hk-sides-inner {
          max-width: 960px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 80px 1fr;
          gap: 0;
          align-items: center;
        }
        .hk-side { padding: 0 20px; }
        .hk-side-icon {
          width: 52px;
          height: 52px;
          margin-bottom: 24px;
          color: #FF5533;
        }
        .hk-side-icon svg { width: 100%; height: 100%; }
        .hk-side-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(1.4rem, 2.2vw, 2rem);
          font-weight: 400;
          color: #0D0D1A;
          margin: 0 0 16px;
          line-height: 1.25;
        }
        .hk-side-body {
          font-size: 0.95rem;
          color: #666;
          line-height: 1.8;
          margin: 0;
        }
        .hk-sides-divider {
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .hk-sides-plus {
          width: 44px;
          height: 44px;
          background: #FF5533;
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          font-weight: 300;
          line-height: 1;
          flex-shrink: 0;
        }

        /* ─── Mission ───────────────────────────── */
        .hk-mission {
          position: relative;
          background: #FF5533;
          padding: 160px 60px;
          text-align: center;
          overflow: hidden;
        }
        .hk-mission-inner { position: relative; z-index: 10; }
        .hk-mission-headline {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(2.8rem, 7vw, 7rem);
          font-weight: 300;
          color: white;
          line-height: 1.15;
          letter-spacing: -0.025em;
          margin: 0 0 48px;
        }
        .hk-mission-headline em { font-style: italic; opacity: 0.75; }
        .hk-mission-rule {
          height: 1px;
          width: 0;
          background: rgba(255,255,255,0.35);
          margin: 0 auto 40px;
          transition: width 1.4s cubic-bezier(0.16,1,0.3,1) 0.5s;
        }
        .hk-mission-inner.vis .hk-mission-rule { width: 260px; }
        .hk-mission-sub {
          font-size: 1rem;
          color: rgba(255,255,255,0.7);
          font-style: italic;
          line-height: 1.7;
          margin: 0;
        }

        /* ─── Community ─────────────────────────── */
        .hk-community {
          background: #FFFFFF;
          padding: 130px 60px;
          border-top: 1px solid rgba(0,0,0,0.05);
        }
        .hk-community-inner {
          max-width: 1000px;
          margin: 0 auto;
        }
        .hk-community-headline {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(1.5rem, 2.5vw, 2.2rem);
          font-weight: 400;
          color: #0D0D1A;
          line-height: 1.6;
          margin: 0 0 56px;
          max-width: 680px;
        }
        .hk-pillars {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2px;
        }
        .hk-pillar {
          background: #FDF8F5;
          padding: 40px 36px;
          transition: background 0.2s;
        }
        .hk-pillar:first-child { border-radius: 16px 0 0 16px; }
        .hk-pillar:last-child  { border-radius: 0 16px 16px 0; }
        .hk-pillar:hover { background: #FFF0EB; }
        .hk-pillar-num {
          font-family: 'Cormorant Garamond', serif;
          font-size: 2.8rem;
          font-weight: 300;
          color: #FF5533;
          line-height: 1;
          margin-bottom: 20px;
          opacity: 0.45;
        }
        .hk-pillar-title {
          font-size: 1rem;
          font-weight: 700;
          color: #0D0D1A;
          margin: 0 0 12px;
          letter-spacing: -0.01em;
        }
        .hk-pillar-body {
          font-size: 0.88rem;
          color: #777;
          line-height: 1.75;
          margin: 0;
        }

        /* ─── Manifesto ─────────────────────────── */
        .hk-manifesto {
          background: #FDF8F5;
          padding: 160px 60px 140px;
          text-align: center;
          overflow: hidden;
          border-top: 1px solid rgba(0,0,0,0.05);
        }
        .hk-manifesto-inner { position: relative; z-index: 10; }
        .hk-man-line1,
        .hk-man-line2 {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(2.8rem, 8.5vw, 9rem);
          font-weight: 400;
          line-height: 1.02;
          letter-spacing: -0.025em;
          margin: 0;
          display: block;
        }
        .hk-man-line1 { color: rgba(0,0,0,0.15); }
        .hk-man-line2 { color: #FF5533; font-style: italic; }
        .hk-man-cta-wrap { margin-top: 60px; }
        .hk-man-cta {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          background: #FF5533;
          color: white;
          font-size: 0.88rem;
          font-weight: 700;
          letter-spacing: 0.03em;
          padding: 14px 34px;
          border-radius: 50px;
          text-decoration: none;
          transition: background 0.2s, transform 0.25s cubic-bezier(0.34,1.56,0.64,1);
        }
        .hk-man-cta:hover { background: #E64420; transform: translateY(-3px); color: white; }

        /* ─── Footer ────────────────────────────── */
        .hk-footer {
          background: #F5F5F5;
          border-top: 1px solid rgba(0,0,0,0.07);
          padding: 28px 48px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          flex-wrap: wrap;
        }
        .hk-footer-logo-wrap {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .hk-footer-logo {
          font-size: 1rem;
          font-weight: 800;
          color: #FF5533;
          letter-spacing: -0.04em;
        }
        .hk-footer-links {
          display: flex;
          gap: 24px;
          align-items: center;
        }
        .hk-footer-links a {
          font-size: 0.78rem;
          color: rgba(0,0,0,0.38);
          text-decoration: none;
          transition: color 0.15s;
        }
        .hk-footer-links a:hover { color: rgba(0,0,0,0.7); }
        .hk-footer-copy {
          font-size: 0.75rem;
          color: rgba(0,0,0,0.25);
        }

        /* ─── Keyframes ─────────────────────────── */
        @keyframes fadeUp {
          from { opacity:0; transform: translateY(20px); }
          to   { opacity:1; transform: translateY(0); }
        }

        /* ─── Mobile ────────────────────────────── */
        @media (max-width: 860px) {
          .hk-nav { padding: 0 20px; }
          .hk-nav-r { gap: 12px; }
          .hk-origin-inner { grid-template-columns: 1fr; gap: 48px; }
          .hk-sides-inner { grid-template-columns: 1fr; gap: 48px; }
          .hk-sides-divider { display: none; }
          .hk-pillars { grid-template-columns: 1fr; gap: 2px; }
          .hk-pillar:first-child { border-radius: 16px 16px 0 0; }
          .hk-pillar:last-child  { border-radius: 0 0 16px 16px; }
          .hk-origin,
          .hk-geo,
          .hk-sides,
          .hk-mission,
          .hk-community,
          .hk-manifesto { padding-left: 24px; padding-right: 24px; }
          .hk-footer { padding: 24px; flex-direction: column; text-align: center; }
        }
      `}</style>
    </div>
  );
}
