import { getBlogPost } from '@/lib/api';
import { notFound } from 'next/navigation';
import LandingNav from '../../landing-nav';
import Image from 'next/image';
import Link from 'next/link';

export const revalidate = 60;

function fmtDate(s: string) {
  return new Date(s).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
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
            Blog'a Dön
          </Link>

          {post.published_at && (
            <p style={{ fontSize: '0.72rem', color: '#B0A098', margin: '0 0 16px', fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              {fmtDate(post.published_at)}
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

      <footer style={{ background: '#1A1A1A', color: 'white', padding: '24px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)' }}>© {new Date().getFullYear()} Trekly</span>
        <Link href="/turlar" style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.45)', textDecoration: 'none' }}>Turları Keşfet →</Link>
      </footer>
    </>
  );
}
