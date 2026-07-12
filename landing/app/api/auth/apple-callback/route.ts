import { NextRequest, NextResponse } from 'next/server';

// Cloud Run konteynerinin içinde `request.url` genelde public domain yerine
// dahili bir adresi (ör. 0.0.0.0:PORT) yansıtabiliyor — bunu redirect'in
// tabanı olarak kullanırsak tarayıcı ulaşılamaz bir adrese yönlenir
// ("0.0.0.0" hatası). Bu yüzden herkese açık domain'i sabit veriyoruz.
const PUBLIC_BASE_URL = 'https://www.treklyapp.com';

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
  const userRaw = formData.get('user');

  const returnPath = typeof state === 'string' && state.startsWith('/') ? state : '/giris';
  const url = new URL(returnPath, PUBLIC_BASE_URL);

  if (typeof idToken === 'string' && idToken) {
    url.searchParams.set('apple_id_token', idToken);

    // Apple yalnızca İLK yetkilendirmede "user" alanında ad-soyad JSON'ı
    // gönderir; sonraki girişlerde bu alan hiç gelmez.
    if (typeof userRaw === 'string' && userRaw) {
      try {
        const parsed = JSON.parse(userRaw) as { name?: { firstName?: string; lastName?: string } };
        const fullName = [parsed.name?.firstName, parsed.name?.lastName].filter(Boolean).join(' ').trim();
        if (fullName) url.searchParams.set('apple_full_name', fullName);
      } catch {
        // yok say, isim olmadan devam
      }
    }
  } else {
    url.searchParams.set('apple_error', '1');
  }

  return NextResponse.redirect(url, { status: 303 });
}
