import { NextRequest, NextResponse } from 'next/server';

// Apple'ın "redirect" (usePopup:false) akışında, kullanıcı giriş yaptıktan
// sonra Apple bu adrese bir FORM POST gönderir (id_token, code, state ve
// ilk girişte "user" JSON'ı). Mobil tarayıcılarda popup akışı güvenilir
// çalışmadığı için (postMessage/opener iletişimi kopabiliyor) bu daha
// sağlam yöntem kullanılıyor. Token'ı /giris sayfasına query param olarak
// taşıyıp, orada normal login akışına devam ediyoruz.
export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const idToken = formData.get('id_token');
  const state = formData.get('state');

  const returnPath = typeof state === 'string' && state.startsWith('/') ? state : '/giris';
  const url = new URL(returnPath, request.url);

  if (typeof idToken === 'string' && idToken) {
    url.searchParams.set('apple_id_token', idToken);
  } else {
    url.searchParams.set('apple_error', '1');
  }

  return NextResponse.redirect(url, { status: 303 });
}
