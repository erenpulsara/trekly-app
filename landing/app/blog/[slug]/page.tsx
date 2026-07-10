import { getBlogPost } from '@/lib/api';
import SiteFooter from '@/app/components/SiteFooter';
import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import LandingNav from '../../landing-nav';
import Image from 'next/image';
import Link from 'next/link';
import { T } from '@/lib/i18n';

export const revalidate = 60;

function fmtDate(s: string, locale: string) {
  return new Date(s).toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' });
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const lang = cookies().get('lang')?.value === 'en' ? 'en' : 'tr';
  const tb = T[lang].blog;
  const post = await getBlogPost(params.slug);
  if (!post) notFound();

  return (
    <>
      <LandingNav />

      <main style={{ minHeight: '100vh', background: '#FAFAFA' }}>
        {/* Cover image */}
        {post.cover_image && (
          <div style={{ position: 'relative', height: 'clamp(260px, 45vw, 520px)', width: '100%', background: '#1A1A1A' }}>
            <Image
              src={post.cover_image}
              alt={post.title}
              fill
              priority
              style={{ objectFit: 'cover', opacity: 0.85 }}
            />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.6) 100%)' }} />
          </div>
        )}

        {/* Article */}
        <article style={{ maxWidth: '740px', margin: '0 auto', padding: '56px 32px 100px' }}>
          <Link href="/blog" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#FF5533', textDecoration: 'none', fontWeight: 600, marginBottom: '32px' }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 7H4M7 10L4 7l3-3"/>
            </svg>
            {tb.backToBlog}
          </Link>

          {post.published_at && (
            <p style={{ fontSize: '0.72rem', color: '#B0A098', margin: '0 0 16px', fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              {fmtDate(post.published_at, tb.locale)}
            </p>
          )}

          <h1 style={{
            fontFamily: '"Cormorant Garamond", serif',
            fontSize: 'clamp(1.8rem, 5vw, 3rem)',
            fontWeight: 400,
            color: '#0D0D1A',
            lineHeight: 1.2,
            margin: '0 0 24px',
            letterSpacing: '-0.02em',
          }}>
            {post.title}
          </h1>

          {post.excerpt && (
            <p style={{ fontSize: '1.1rem', color: '#6B7280', lineHeight: 1.75, margin: '0 0 40px', borderLeft: '3px solid #FF5533', paddingLeft: '20px', fontStyle: 'italic' }}>
              {post.excerpt}
            </p>
          )}

          <div style={{
            fontSize: '1rem',
            lineHeight: 1.85,
            color: '#3A3A3A',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}>
            {post.content}
          </div>
        </article>
      </main>

      <SiteFooter />
    </>
  );
}
