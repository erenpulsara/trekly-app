'use client';

const isProd = process.env.NODE_ENV === 'production';

interface Props {
  exploreTours: string;
  becomeAgency: string;
  agencyUrl: string;
}

export default function HeroButtons({ exploreTours, becomeAgency, agencyUrl }: Props) {
  const handleProd = (e: React.MouseEvent) => {
    if (isProd) e.preventDefault();
  };

  return (
    <div className="lp-hero-btns" style={{ display: 'flex', alignItems: 'center', gap: '14px', alignSelf: 'center', marginTop: '96px' }}>
      <a
        href="/anasayfa"
        className="lp-hero-btn-primary"
        onClick={handleProd}
        style={{ cursor: isProd ? 'default' : 'pointer' }}
      >
        {exploreTours}
      </a>
      <a
        href={agencyUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="lp-hero-btn-secondary"
        onClick={handleProd}
        style={{ cursor: isProd ? 'default' : 'pointer' }}
      >
        {becomeAgency}
      </a>
    </div>
  );
}
