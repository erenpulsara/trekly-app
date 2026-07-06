'use client';

interface Props {
  exploreTours: string;
  becomeAgency: string;
  agencyUrl: string;
}

export default function HeroButtons({ exploreTours, becomeAgency, agencyUrl }: Props) {
  return (
    <div className="lp-hero-btns" style={{ display: 'flex', alignItems: 'center', gap: '14px', alignSelf: 'center', marginTop: '96px' }}>
      <a
        href="/anasayfa"
        className="lp-hero-btn-primary"
      >
        {exploreTours}
      </a>
      <a
        href={agencyUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="lp-hero-btn-secondary"
      >
        {becomeAgency}
      </a>
    </div>
  );
}
