import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

// The homepage moved from /turlar to /anasayfa — this keeps old links/bookmarks working.
export default function TurlarRedirectPage() {
  redirect('/anasayfa');
}
