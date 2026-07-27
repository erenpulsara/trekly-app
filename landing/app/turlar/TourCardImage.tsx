'use client';

import { useState } from 'react';
import { sizedImageUrl } from '@/lib/img';

interface Props {
  src: string;
  fallbackSrc: string;
  alt: string;
  className?: string;
  width?: number;
}

export default function TourCardImage({ src, fallbackSrc, alt, className, width = 640 }: Props) {
  const [imgSrc, setImgSrc] = useState(src);

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={sizedImageUrl(imgSrc, width)}
      alt={alt}
      loading="lazy"
      className={className}
      onError={() => setImgSrc(fallbackSrc)}
      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
    />
  );
}
