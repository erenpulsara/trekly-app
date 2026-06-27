'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { type Lang, getLangClient } from '@/lib/i18n';
import LandingNav from '../landing-nav';

const AGENCY_URL = process.env.NEXT_PUBLIC_AGENCY_URL ?? 'https://acenta.treklyapp.com';

const HK = {
  tr: {
    nav: { tours: 'Turlar', about: 'Hakkımızda', becomeAgency: 'Acenta Ol' },
    hero: {
      eyebrow: "Trekly'i Tanıyın",
      h1: ['Macera Şimdi', 'Daha Erişilebilir,', 'Filtresiz ve Gerçek.'],
      sub: '',
      exploreTours: 'Turları Keşfet',
      becomeAgency: 'Acenta Ol',
    },
    origin: {
      quote: 'Macera şimdi daha erişilebilir, filtresiz ve gerçek.',
      tag: 'Biz Kimiz',
      body: 'Trekly; doğayı sadece bir dekor olarak görenlerden, rotalara sadece ticari birer meta olarak bakan acentelerden ve bizi durmadan tüketime zorlayan sosyal medya algoritmalarından uzaklaşmak isteyenler için kuruldu.',
      bodyEm: '',
      bodyEnd: '',
      bodySm: "Bizim için doğa; kusursuz bir fotoğraf karesinden çok daha fazlası — bir disiplin, bir nefes ve kendimize dönüş yolculuğudur. Bu yüzden Trekly'de sadece en popüler olanları değil, en nitelikli ve gerçek deneyimleri bir araya getiriyoruz.",
    },
    geo: {
      tag: '',
      headline: '',
      sub: '',
    },
    sides: {
      seekers: { title: '', body: '' },
      guides: { title: '', body: '' },
    },
    mission: {
      tag: 'Misyonumuz',
      headline1: 'Gerçek macerayı',
      headline2em: 'herkes için',
      headline3: ' erişilebilir kılmak.',
      sub: "Doğayı keşfetmek için sosyal medyanın gürültüsünden kurtulun. Biz burayı, sadece gerçek maceracıların ve işini tutkuyla yapan profesyonellerin buluşma noktası olarak tasarladık.",
    },
    community: {
      tag: 'Neden Trekly?',
      headline: '',
      pillars: [
        { num: '01', title: 'Seçilmiş Deneyimler', body: 'Sadece ticari kaygı güden değil, doğaya saygı duyan, profesyonel ve etik değerleri olan kulüplerle çalışıyoruz.' },
        { num: '02', title: 'Algoritmadan Uzak', body: 'Size "popüler olanı" değil, ihtiyacınız olanı sunuyoruz. Kondisyonunuza, ruh halinize ve ilginize en uygun macerayı saniyeler içinde, gürültüsüzce bulun.' },
        { num: '03', title: 'Organize ve Güvenli', body: "Dağınık ve güven vermeyen bilgi kirliliğini ortadan kaldırıyoruz. Türkiye'nin tüm doğa disiplinleri, herkes için erişilebilir ve şeffaf bir vitrinde." },
      ],
    },
    manifesto: {
      line1: 'Doğa herkese ait.',
      line2: 'Trekly de öyle.',
      cta: 'Turları Keşfet',
    },
    footer: { privacy: 'Gizlilik', terms: 'Koşullar', agency: 'Acenta Paneli →' },
  },
  en: {
    nav: { tours: 'Tours', about: 'About', becomeAgency: 'Become an Agency' },
    hero: {
      eyebrow: 'Meet Trekly',
      h1: ['Adventure Is Now', 'More Accessible,', 'Unfiltered & Real.'],
      sub: '',
      exploreTours: 'Explore Tours',
      becomeAgency: 'Become an Agency',
    },
    origin: {
      quote: 'Adventure is now more accessible, unfiltered and real.',
      tag: 'Who We Are',
      body: "Trekly was built for those who want to step away from people who see nature as mere decoration, agencies that treat routes as commercial commodities, and social media algorithms that push us into endless consumption.",
      bodyEm: '',
      bodyEnd: '',
      bodySm: "For us, nature is far more than a perfect photo — it's a discipline, a breath, and a journey back to ourselves. That's why at Trekly we bring together not just the most popular experiences, but the most genuine ones.",
    },
    geo: {
      tag: '',
      headline: '',
      sub: '',
    },
    sides: {
      seekers: { title: '', body: '' },
      guides: { title: '', body: '' },
    },
    mission: {
      tag: 'Our Mission',
      headline1: 'Making real adventure',
      headline2em: 'accessible',
      headline3: ' for everyone.',
      sub: "Escape the noise of social media to discover nature. We built this as the meeting point for true adventurers and professionals who are passionate about what they do.",
    },
    community: {
      tag: 'Why Trekly?',
      headline: '',
      pillars: [
        { num: '01', title: 'Curated Experiences', body: 'We work only with clubs that respect nature and hold professional and ethical values — not just commercial interests.' },
        { num: '02', title: 'Beyond the Algorithm', body: "We show you what you need, not what's popular. Find the adventure that fits your fitness, mood and interests in seconds." },
        { num: '03', title: 'Organized & Safe', body: "We eliminate scattered, unreliable information. All of Turkey's nature disciplines in one accessible, transparent showcase." },
      ],
    },
    manifesto: {
      line1: 'Nature belongs to everyone.',
      line2: 'So does Trekly.',
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
      <LandingNav navLinks={[
        { label: hk.nav.about,   href: '/hakkimizda', active: true },
        { label: 'Etkinlikler',  href: '/turlar' },
        { label: 'Blog',         href: '/blog' },
        { label: 'İletişim',     href: '/iletisim' },
      ]} />

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
          {hk.hero.sub && <p className="hk-hero-sub">{hk.hero.sub}</p>}
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
            <p className="hk-body">{hk.origin.body}</p>
            <p className="hk-body-sm">{hk.origin.bodySm}</p>
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
          <Image src="/logo.png" alt="Trekly" width={36} height={36} style={{ objectFit: 'contain' }} />
          <span style={{ fontFamily: '"Montserrat", sans-serif', fontWeight: 900, fontSize: '1.1rem', color: '#ff751f', letterSpacing: '-0.02em', lineHeight: 1 }}>Trekly</span>
        </div>
        <div className="hk-footer-links">
          <a href="/privacy">{hk.footer.privacy}</a>
          <a href="/terms">{hk.footer.terms}</a>
          <a href={AGENCY_URL} target="_blank" rel="noopener noreferrer">{hk.footer.agency}</a>
        </div>
        <span className="hk-footer-copy">© {new Date().getFullYear()} Trekly</span>
      </footer>

      <style>{`
        .hk {
          font-family: inherit;
          overflow-x: hidden;
          -webkit-font-smoothing: antialiased;
          color: #1A1A1A;
        }
        .hk-hero {
          position: relative;
          min-height: calc(100vh - 80px);
          background: #FFFFFF;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }
        .hk-hero-bg { position: absolute; inset: 0; pointer-events: none; }
        .hk-hero-orb { position: absolute; border-radius: 50%; filter: blur(80px); }
        .hk-hero-orb1 { width: 600px; height: 600px; top: -200px; right: -150px; background: radial-gradient(ellipse, rgba(255,85,51,0.12) 0%, transparent 70%); animation: orbFloat 12s ease-in-out infinite; }
        .hk-hero-orb2 { width: 400px; height: 400px; bottom: -100px; left: -100px; background: radial-gradient(ellipse, rgba(255,85,51,0.07) 0%, transparent 70%); animation: orbFloat 16s ease-in-out infinite; animation-delay: -6s; }
        @keyframes orbFloat {
          0%,100% { transform: translate(0,0) scale(1); }
          33% { transform: translate(30px,-20px) scale(1.04); }
          66% { transform: translate(-15px,25px) scale(0.98); }
        }
        .hk-hero-grid {
          position: absolute; inset: 0;
          background-image: linear-gradient(rgba(255,85,51,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,85,51,0.04) 1px, transparent 1px);
          background-size: 60px 60px;
          mask-image: radial-gradient(ellipse 70% 70% at 50% 40%, black 0%, transparent 100%);
          -webkit-mask-image: radial-gradient(ellipse 70% 70% at 50% 40%, black 0%, transparent 100%);
        }
        .hk-hero-inner { position: relative; z-index: 10; text-align: center; padding: 40px 24px 0; max-width: 900px; }
        .hk-eyebrow { font-size: 0.62rem; font-weight: 700; letter-spacing: 0.3em; text-transform: uppercase; color: #FF5533; margin: 0 0 32px; animation: fadeUp 0.8s ease both; animation-delay: 0.15s; }
        .hk-h1 { font-family: 'Cormorant Garamond', serif; font-size: clamp(3.5rem, 8vw, 8rem); font-weight: 400; line-height: 1.06; letter-spacing: -0.03em; margin: 0 0 48px; display: flex; flex-direction: column; color: #0D0D1A; }
        .hk-h1-line { display: block; }
        .hk-h1-line:nth-child(1) { animation: titleRise 1s cubic-bezier(0.16,1,0.3,1) both; animation-delay: 0.3s; }
        .hk-h1-line:nth-child(2) { animation: titleRise 1s cubic-bezier(0.16,1,0.3,1) both; animation-delay: 0.5s; }
        .hk-h1-line:nth-child(3) { animation: titleRise 1s cubic-bezier(0.16,1,0.3,1) both; animation-delay: 0.7s; }
        .hk-h1-accent { color: #FF5533; font-style: italic; }
        @keyframes titleRise { from { opacity:0; transform: translateY(70px); } to { opacity:1; transform: translateY(0); } }
        .hk-hero-sub { font-size: clamp(0.85rem, 1.4vw, 1rem); color: #999; letter-spacing: 0.05em; margin: 0 0 44px; font-style: italic; animation: fadeUp 0.8s ease both; animation-delay: 0.95s; }
        .hk-hero-actions { display: flex; align-items: center; justify-content: center; gap: 14px; flex-wrap: wrap; animation: fadeUp 0.8s ease both; animation-delay: 1.15s; }
        .hk-btn-primary { display: inline-flex; align-items: center; gap: 9px; background: #FF5533; color: white; font-size: 0.88rem; font-weight: 700; letter-spacing: 0.03em; padding: 14px 32px; border-radius: 50px; text-decoration: none; transition: background 0.2s, transform 0.25s cubic-bezier(0.34,1.56,0.64,1); }
        .hk-btn-primary:hover { background: #E64420; transform: translateY(-3px); color: white; }
        .hk-btn-ghost { display: inline-flex; align-items: center; gap: 9px; background: transparent; color: #555; font-size: 0.88rem; font-weight: 600; padding: 14px 24px; border: 1.5px solid rgba(0,0,0,0.15); border-radius: 50px; text-decoration: none; transition: border-color 0.2s, color 0.2s; }
        .hk-btn-ghost:hover { border-color: #FF5533; color: #FF5533; }
        .hk-hero-scroll { position: absolute; bottom: 44px; left: 50%; transform: translateX(-50%); animation: fadeUp 0.8s ease both; animation-delay: 1.5s; }
        .hk-hero-scroll-track { width: 1px; height: 72px; background: linear-gradient(to bottom, #FF5533 0%, transparent 100%); animation: scrollTrack 2.2s ease-in-out infinite; }
        @keyframes scrollTrack { 0% { transform: scaleY(0); transform-origin: top; opacity:1; } 50% { transform: scaleY(1); transform-origin: top; opacity:1; } 100% { transform: scaleY(1); transform-origin: bottom; opacity:0; } }

        .rev { opacity: 0; transform: translateY(40px); transition: opacity 0.8s cubic-bezier(0.16,1,0.3,1), transform 0.8s cubic-bezier(0.16,1,0.3,1); }
        .rev.vis { opacity:1; transform: translateY(0); }
        .rev-d1 { transition-delay: 0.15s; }
        .rev-d2 { transition-delay: 0.3s; }

        .hk-tag { font-size: 0.6rem; font-weight: 700; letter-spacing: 0.3em; text-transform: uppercase; color: #999; margin: 0 0 24px; display: block; }
        .hk-tag-orange { color: #FF5533; }
        .hk-tag-white  { color: rgba(255,255,255,0.55); }
        .hk-body { font-size: 1.05rem; line-height: 1.85; color: #4A4A4A; margin: 0 0 20px; }
        .hk-body-sm { font-size: 0.95rem; line-height: 1.8; color: #888; margin: 0; }

        .hk-origin { background: #FDF8F5; padding: 130px 60px; border-top: 1px solid rgba(0,0,0,0.05); }
        .hk-origin-inner { max-width: 1100px; margin: 0 auto; display: grid; grid-template-columns: 1fr 1fr; gap: 90px; align-items: start; }
        .hk-ol { width: 0; height: 3px; background: #FF5533; margin-bottom: 32px; transition: width 1s cubic-bezier(0.16,1,0.3,1) 0.3s; }
        .hk-origin-left.vis .hk-ol { width: 52px; }
        .hk-quote { font-family: 'Cormorant Garamond', serif; font-size: clamp(1.6rem, 2.8vw, 2.6rem); font-weight: 400; font-style: italic; color: #0D0D1A; line-height: 1.35; margin: 0; }

        .hk-mission { position: relative; background: #FF5533; padding: 160px 60px; text-align: center; overflow: hidden; }
        .hk-mission-inner { position: relative; z-index: 10; }
        .hk-mission-headline { font-family: 'Cormorant Garamond', serif; font-size: clamp(2.8rem, 7vw, 7rem); font-weight: 300; color: white; line-height: 1.15; letter-spacing: -0.025em; margin: 0 0 48px; }
        .hk-mission-headline em { font-style: italic; opacity: 0.75; }
        .hk-mission-rule { height: 1px; width: 0; background: rgba(255,255,255,0.35); margin: 0 auto 40px; transition: width 1.4s cubic-bezier(0.16,1,0.3,1) 0.5s; }
        .hk-mission-inner.vis .hk-mission-rule { width: 260px; }
        .hk-mission-sub { font-size: 1rem; color: rgba(255,255,255,0.7); font-style: italic; line-height: 1.7; margin: 0; max-width: 560px; margin: 0 auto; }

        .hk-community { background: #FFFFFF; padding: 130px 60px; border-top: 1px solid rgba(0,0,0,0.05); }
        .hk-community-inner { max-width: 1000px; margin: 0 auto; }
        .hk-pillars { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2px; }
        .hk-pillar { background: #FDF8F5; padding: 40px 36px; transition: background 0.2s; }
        .hk-pillar:first-child { border-radius: 16px 0 0 16px; }
        .hk-pillar:last-child  { border-radius: 0 16px 16px 0; }
        .hk-pillar:hover { background: #FFF0EB; }
        .hk-pillar-num { font-family: 'Cormorant Garamond', serif; font-size: 2.8rem; font-weight: 300; color: #FF5533; line-height: 1; margin-bottom: 20px; opacity: 0.45; }
        .hk-pillar-title { font-size: 1rem; font-weight: 700; color: #0D0D1A; margin: 0 0 12px; letter-spacing: -0.01em; }
        .hk-pillar-body { font-size: 0.88rem; color: #777; line-height: 1.75; margin: 0; }

        .hk-manifesto { background: #FDF8F5; padding: 160px 60px 140px; text-align: center; overflow: hidden; border-top: 1px solid rgba(0,0,0,0.05); }
        .hk-manifesto-inner { position: relative; z-index: 10; }
        .hk-man-line1, .hk-man-line2 { font-family: 'Cormorant Garamond', serif; font-size: clamp(2.8rem, 8.5vw, 9rem); font-weight: 400; line-height: 1.02; letter-spacing: -0.025em; margin: 0; display: block; }
        .hk-man-line1 { color: rgba(0,0,0,0.15); }
        .hk-man-line2 { color: #FF5533; font-style: italic; }
        .hk-man-cta-wrap { margin-top: 60px; }
        .hk-man-cta { display: inline-flex; align-items: center; gap: 10px; background: #FF5533; color: white; font-size: 0.88rem; font-weight: 700; letter-spacing: 0.03em; padding: 14px 34px; border-radius: 50px; text-decoration: none; transition: background 0.2s, transform 0.25s cubic-bezier(0.34,1.56,0.64,1); }
        .hk-man-cta:hover { background: #E64420; transform: translateY(-3px); color: white; }

        .hk-footer { background: #F5F5F5; border-top: 1px solid rgba(0,0,0,0.07); padding: 28px 48px; display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap; }
        .hk-footer-logo-wrap { display: flex; align-items: center; gap: 8px; }
        .hk-footer-links { display: flex; gap: 24px; align-items: center; }
        .hk-footer-links a { font-size: 0.78rem; color: rgba(0,0,0,0.38); text-decoration: none; transition: color 0.15s; }
        .hk-footer-links a:hover { color: rgba(0,0,0,0.7); }
        .hk-footer-copy { font-size: 0.75rem; color: rgba(0,0,0,0.25); }

        @keyframes fadeUp { from { opacity:0; transform: translateY(20px); } to { opacity:1; transform: translateY(0); } }

        @media (max-width: 860px) {
          .hk-origin-inner { grid-template-columns: 1fr; gap: 48px; }
          .hk-pillars { grid-template-columns: 1fr; gap: 2px; }
          .hk-pillar:first-child { border-radius: 16px 16px 0 0; }
          .hk-pillar:last-child  { border-radius: 0 0 16px 16px; }
          .hk-origin, .hk-mission, .hk-community, .hk-manifesto { padding-left: 24px; padding-right: 24px; }
          .hk-footer { padding: 24px; flex-direction: column; text-align: center; }
        }
      `}</style>
    </div>
  );
}
