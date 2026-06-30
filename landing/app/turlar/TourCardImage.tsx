'use client';

import { useState } from 'react';

interface Props {
  src: string;
  fallbackSrc: string;
  alt: string;
  className?: string;
}

export default function TourCardImage({ src, fallbackSrc, alt, className }: Props) {
  const [imgSrc, setImgSrc] = useState(src);

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={imgSrc}
      alt={alt}
      className={className}
      onError={() => setImgSrc(fallbackSrc)}
      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
    />
  );
}
