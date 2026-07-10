import { cookies } from 'next/headers';
import SiteFooter from '@/app/components/SiteFooter';
import LandingNav from '../landing-nav';
import { LEGAL, LEGAL_EMAIL, type LegalBlock } from '@/lib/legal';

export const metadata = {
  title: 'Kullanım Koşulları — Trekly',
};

export default function TermsPage() {
  const lang = cookies().get('lang')?.value === 'en' ? 'en' : 'tr';
  const doc = LEGAL.terms[lang];

  return (
    <div style={{ background: '#fff', minHeight: '100vh' }}>
      <LandingNav
        logoHref="/anasayfa"
        navLinks={[
          { label: 'Anasayfa',    href: '/anasayfa' },
          { label: 'Etkinlikler', href: '/etkinlikler' },
          { label: 'Blog',        href: '/blog' },
          { label: 'Hakkımızda', href: '/hakkimizda' },
          { label: 'İletişim',   href: '/iletisim' },
        ]}
      />

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '60px 40px 100px' }}>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-3)', marginBottom: '12px' }}>{doc.updated}</p>
        <h1 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.6rem)', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.03em', marginBottom: '12px' }}>
          {doc.title}
        </h1>
        <p style={{ fontSize: '1rem', color: 'var(--text-2)', lineHeight: 1.8, marginBottom: '48px' }}>
          {doc.intro}
        </p>

        {doc.sections.map((section) => (
          <Section key={section.title} title={section.title}>
            {section.blocks.map((block, i) => <Block key={i} block={block} />)}
          </Section>
        ))}
      </div>

      <SiteFooter />
    </div>
  );
}

function Block({ block }: { block: LegalBlock }) {
  if ('ul' in block) {
    return (
      <ul>
        {block.ul.map((item, i) => (
          <li key={i}>
            {typeof item === 'string' ? item : <><strong>{item.b}</strong> {item.t}</>}
          </li>
        ))}
      </ul>
    );
  }
  if ('contact' in block) {
    return (
      <p>{block.contact}<br />
        <a href={`mailto:${LEGAL_EMAIL}`} style={{ color: 'var(--brand)', fontWeight: 600 }}>{LEGAL_EMAIL}</a>
      </p>
    );
  }
  return <p>{block.bold ? <><strong>{block.bold}</strong> </> : null}{block.p}</p>;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '40px' }}>
      <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.02em', marginBottom: '14px', paddingBottom: '10px', borderBottom: '1px solid var(--border)' }}>
        {title}
      </h2>
      <div style={{ fontSize: '0.95rem', color: 'var(--text-2)', lineHeight: 1.85 }}>
        {children}
      </div>
    </div>
  );
}
