import { getBlogPosts } from '@/lib/api';
import LandingNav from '../landing-nav';
import Image from 'next/image';
import Link from 'next/link';

export const revalidate = 60;

function fmtDate(s: string) {
  return new Date(s).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default async function BlogPage() {
  const posts = await getBlogPosts();

  return (
    <>
      <LandingNav />

      <style>{`
        .blog-card { transition: box-shadow 0.2s, transform 0.2s; }
        .blog-card:hover { box-shadow: 0 8px 32px rgba(0,0,0,0.1); transform: translateY(-3px); }
      `}</style>

      <main style={{ minHeight: '100vh', background: '#FAFAFA' }}>
        <div style={{ background: 'white', borderBottom: '1px solid #EAEAEA', padding: '56px 48px 48px' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <p style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.25em', textTransform: 'uppercase', color: '#FF5533', margin: '0 0 12px' }}>
              Trekly Blog
            </p>
            <h1 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 'clamp(2rem, 5vw, 3.6rem)', fontWeight: 400, color: '#0D0D1A', margin: 0, lineHeight: 1.1 }}>
              Doğadan Hikayeler
            </h1>
          </div>
        </div>

        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '56px 48px 80px' }}>
          {posts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 0', color: '#9A9A9A' }}>
              <p style={{ fontSize: '1.1rem', marginBottom: '8px' }}>Henüz blog yazısı yok.</p>
              <p style={{ fontSize: '0.9rem' }}>Yakında burada güzel içerikler olacak.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '28px' }}>
              {posts.map((post) => (
                <Link key={post.id} href={`/blog/${post.slug}`} style={{ textDecoration: 'none', color: 'inherit', display: 'flex' }}>
                  <article className="blog-card" style={{
                    background: 'white',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    border: '1px solid #EAEAEA',
                    display: 'flex',
                    flexDirection: 'column',
                    width: '100%',
                  }}>
                    <div style={{ position: 'relative', height: '200px', background: '#F0EDE8', flexShrink: 0 }}>
                      {post.cover_image ? (
                        <Image src={post.cover_image} alt={post.title} fill style={{ objectFit: 'cover' }} />
                      ) : (
                        <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#C8B8A8" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="3" width="18" height="18" rx="2"/>
                            <circle cx="8.5" cy="8.5" r="1.5"/>
                            <path d="M21 15l-5-5L5 21"/>
                          </svg>
                        </div>
                      )}
                    </div>
                    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                      {post.published_at && (
                        <p style={{ fontSize: '0.7rem', color: '#B0A098', margin: '0 0 10px', fontWeight: 500, letterSpacing: '0.04em' }}>
                          {fmtDate(post.published_at)}
                        </p>
                      )}
                      <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#1A1A1A', margin: '0 0 10px', lineHeight: 1.35 }}>
                        {post.title}
                      </h2>
                      {post.excerpt && (
                        <p style={{ fontSize: '0.875rem', color: '#6B7280', lineHeight: 1.7, margin: '0 0 16px', flex: 1 }}>
                          {post.excerpt}
                        </p>
                      )}
                      <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#FF5533', display: 'flex', alignItems: 'center', gap: '4px', marginTop: 'auto' }}>
                        Devamını Oku
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M2 6h8M6 2l4 4-4 4"/>
                        </svg>
                      </span>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>

      <footer style={{ background: '#1A1A1A', color: 'white', padding: '24px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)' }}>© {new Date().getFullYear()} Trekly</span>
        <Link href="/turlar" style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.45)', textDecoration: 'none' }}>Turları Keşfet →</Link>
      </footer>
    </>
  );
}
