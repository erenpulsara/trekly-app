import Link from 'next/link';
import SiteFooter from '@/app/components/SiteFooter';

const AGENCY_URL = process.env.NEXT_PUBLIC_AGENCY_URL ?? 'https://acenta.treklyapp.com';

export const metadata = {
  title: 'Kullanım Koşulları — Trekly',
};

export default function TermsPage() {
  return (
    <div style={{ background: '#fff', minHeight: '100vh' }}>
      <nav className="navbar">
        <Link href="/" className="logo">Trekly</Link>
        <div className="nav-links">
          <Link href="/" className="nav-link">← Ana Sayfa</Link>
          <a href={AGENCY_URL} target="_blank" rel="noopener noreferrer" className="nav-cta">Acenta Ol</a>
        </div>
      </nav>

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '60px 40px 100px' }}>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-3)', marginBottom: '12px' }}>Son güncelleme: 21 Haziran 2026</p>
        <h1 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.6rem)', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.03em', marginBottom: '12px' }}>
          Kullanım Koşulları
        </h1>
        <p style={{ fontSize: '1rem', color: 'var(--text-2)', lineHeight: 1.8, marginBottom: '48px' }}>
          Bu Kullanım Koşulları, Trekly mobil uygulaması ve web sitesini ("Platform") kullanan kişiler ("Kullanıcı") ile Trekly arasındaki yasal ilişkiyi düzenler. Platformu kullanarak bu koşulları kabul etmiş sayılırsınız.
        </p>

        <Section title="1. Hizmetin Tanımı">
          <p>Trekly; kullanıcıları bağımsız tur acenteleri ve rehberleriyle buluşturan bir çevrimiçi pazaryeri platformudur. Trekly, tur operatörü değildir; yalnızca teknik altyapı ve aracılık hizmeti sunar. Turların düzenlenmesinden ve yürütülmesinden doğrudan sorumlu taraf, ilgili tur acentesidir.</p>
        </Section>

        <Section title="2. Hesap Oluşturma ve Güvenlik">
          <ul>
            <li>Platform'u kullanmak için 18 yaşında veya daha büyük olmanız ya da yasal veli/vasi onayına sahip olmanız gerekir.</li>
            <li>Hesap bilgilerinizin doğru, güncel ve eksiksiz olmasından siz sorumlusunuz.</li>
            <li>Hesap şifrenizi gizli tutmak ve yetkisiz erişimi derhal bildirmek sizin sorumluluğunuzdadır.</li>
            <li>Bir kişi adına yalnızca bir hesap oluşturulabilir.</li>
          </ul>
        </Section>

        <Section title="3. Rezervasyon ve Ödeme Koşulları">
          <ul>
            <li>Platform üzerinden yapılan rezervasyonlar, tur acentesinin onayıyla kesinleşir.</li>
            <li>Ödeme, rezervasyon sırasında tahsil edilir. Ödeme işlemleri yetkili üçüncü taraf ödeme işlemcileri aracılığıyla güvenli biçimde gerçekleştirilir.</li>
            <li>İptal ve iade politikaları, ilgili acentenin belirlediği koşullara tabidir. Her turun ilan sayfasında iptal koşulları ayrıca belirtilir.</li>
            <li>Trekly, acente tarafından belirlenen fiyatların doğruluğunu garanti etmez; fiyatlar her an değişebilir.</li>
            <li>Rezervasyon tamamlanmadan önce gösterilen toplam tutar bağlayıcıdır.</li>
          </ul>
        </Section>

        <Section title="4. Kullanıcı Yükümlülükleri">
          <p>Kullanıcı, Platform'u kullanırken aşağıdaki yükümlülükleri kabul eder:</p>
          <ul>
            <li>Türkiye Cumhuriyeti yasaları ile uluslararası hukuka uymak</li>
            <li>Başkalarının haklarını ihlal eden içerik paylaşmamak</li>
            <li>Platforma zarar verecek teknik saldırılardan kaçınmak</li>
            <li>Sahte rezervasyon oluşturmamak veya sistemi manipüle etmeye çalışmamak</li>
            <li>Tur değerlendirmelerinde dürüst ve gerçek bilgi paylaşmak</li>
            <li>Tur sırasında acente ve rehberin güvenlik talimatlarına uymak</li>
          </ul>
        </Section>

        <Section title="5. Acenta İlişkisi ve Sorumluluk Reddi">
          <p><strong>Trekly bir tur operatörü değildir.</strong> Platform'da listelenen tüm turlar bağımsız tur acenteleri tarafından sunulmaktadır. Bu nedenle:</p>
          <ul>
            <li>Turların içeriği, güvenliği, kalitesi ve yürütülmesinden acenteler sorumludur.</li>
            <li>Trekly, acente tarafından sağlanan bilgilerin doğruluğunu garanti etmez.</li>
            <li>Tur sırasında yaşanan kaza, kayıp, yaralanma veya hayal kırıklığından Trekly sorumlu tutulamaz.</li>
            <li>Acentelerle kullanıcılar arasındaki anlaşmazlıklarda Trekly arabulucu rolünde destek sağlayabilir; ancak hukuki sorumluluk üstlenmez.</li>
          </ul>
        </Section>

        <Section title="6. Fikri Mülkiyet">
          <p>Platform'daki tüm içerik (logo, tasarım, yazılım, metin) Trekly'e aittir ve Türk Fikir ve Sanat Eserleri Kanunu kapsamında korunmaktadır. Kullanıcılar, içerikleri önceden yazılı izin almaksızın kopyalayamaz, dağıtamaz veya ticari amaçla kullanamazlar.</p>
          <p>Kullanıcıların platforma yüklediği içerikler (fotoğraf, yorum vb.) için kullanıcılar, Trekly'e bu içerikleri hizmet amacıyla kullanma hakkı tanır.</p>
        </Section>

        <Section title="7. Sorumluluk Sınırlaması">
          <p>Yürürlükteki mevzuatın izin verdiği azami ölçüde:</p>
          <ul>
            <li>Trekly'nin herhangi bir olay için sorumluluğu, o rezervasyon için ödenen ücretle sınırlıdır.</li>
            <li>Trekly; kâr kaybı, veri kaybı, itibar kaybı veya dolaylı zararlar için sorumlu tutulamaz.</li>
            <li>Platform'un kesintisiz veya hatasız çalışacağı garanti edilmez.</li>
          </ul>
        </Section>

        <Section title="8. Hesap Askıya Alma ve Sonlandırma">
          <p>Trekly, aşağıdaki durumlarda önceden bildirimde bulunmaksızın hesabı askıya alabilir veya kalıcı olarak silebilir:</p>
          <ul>
            <li>Bu koşulların ihlali</li>
            <li>Sahte veya yanıltıcı bilgi sağlama</li>
            <li>Diğer kullanıcılara veya acentelere zarar verici davranışlar</li>
            <li>Yetkili makam talebi</li>
          </ul>
          <p>Kullanıcı da dilediği zaman hesabını silebilir. Hesap silme işlemi uygulama içi ayarlar veya <a href="mailto:hello@treklyapp.com" style={{ color: 'var(--brand)' }}>hello@treklyapp.com</a> aracılığıyla gerçekleştirilebilir.</p>
        </Section>

        <Section title="9. Değişiklikler">
          <p>Trekly bu koşulları dilediği zaman güncelleme hakkını saklı tutar. Önemli değişiklikler en az 15 gün öncesinden bildirilir. Güncelleme sonrası platformu kullanmaya devam etmek, yeni koşulların kabul edildiği anlamına gelir.</p>
        </Section>

        <Section title="10. Uygulanacak Hukuk ve Uyuşmazlık Çözümü">
          <p>Bu koşullar Türkiye Cumhuriyeti hukukuna tabidir. Taraflar arasında doğabilecek uyuşmazlıklarda önce müzakere yoluyla çözüm aranır. Çözüme kavuşturulamazsa İstanbul Mahkemeleri ve İcra Daireleri yetkilidir.</p>
        </Section>

        <Section title="11. İletişim">
          <p>Kullanım koşullarına ilişkin sorularınız için:<br />
          <a href="mailto:hello@treklyapp.com" style={{ color: 'var(--brand)', fontWeight: 600 }}>hello@treklyapp.com</a></p>
        </Section>
      </div>

      <SiteFooter />
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '40px' }}>
      <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.02em', marginBottom: '14px', paddingBottom: '10px', borderBottom: '1px solid var(--border)' }}>
        {title}
      </h2>
      <div style={{ fontSize: '0.95rem', color: 'var(--text-2)', lineHeight: 1.85 }}>
        {children}
      </div>
    </div>
  );
}
