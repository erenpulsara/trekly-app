'use client';
import type { ReactNode } from 'react';

export default function StickyCard({ children }: { children: ReactNode }) {
  return (
    <div style={{ position: 'sticky', top: '88px', alignSelf: 'start' }}>
      {children}
    </div>
  );
}
