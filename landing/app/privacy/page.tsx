import Link from 'next/link';

const AGENCY_URL = process.env.NEXT_PUBLIC_AGENCY_URL ?? 'https://acenta.treklyapp.com';

export const metadata = {
  title: 'Gizlilik Politikası — Trekly',
};

export default function PrivacyPage() {
  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", background: '#fff', minHeight: '100vh' }}>
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
          Gizlilik Politikası
        </h1>
        <p style={{ fontSize: '1rem', color: 'var(--text-2)', lineHeight: 1.8, marginBottom: '48px' }}>
          Trekly olarak kişisel verilerinizin güvenliğini ciddiye alıyoruz. Bu politika, Trekly mobil uygulaması ve web sitesi ("Hizmet") aracılığıyla toplanan verilerin nasıl işlendiğini açıklar.
        </p>

        <Section title="1. Veri Sorumlusu">
          <p>Veri sorumlusu <strong>Trekly</strong>'dir. İletişim: <a href="mailto:hello@treklyapp.com" style={{ color: 'var(--brand)' }}>hello@treklyapp.com</a></p>
        </Section>

        <Section title="2. Toplanan Veriler">
          <p>Hizmetimizi kullanırken aşağıdaki kişisel veriler toplanmaktadır:</p>
          <ul>
            <li><strong>Kimlik verileri:</strong> Ad, soyad</li>
            <li><strong>İletişim verileri:</strong> E-posta adresi, telefon numarası</li>
            <li><strong>Rezervasyon verileri:</strong> Seçilen tur, katılım tarihi, kişi sayısı, ödeme bilgileri (kart numarası saklanmaz; ödeme işlemcisi üzerinden işlenir)</li>
            <li><strong>Hesap verileri:</strong> Kullanıcı adı, şifre (şifrelenmiş olarak saklanır), profil fotoğrafı (isteğe bağlı)</li>
            <li><strong>Kullanım verileri:</strong> Uygulama içi gezinme, tıklama verileri, hata logları</li>
            <li><strong>Cihaz verileri:</strong> Cihaz modeli, işletim sistemi, benzersiz cihaz tanımlayıcısı, IP adresi</li>
            <li><strong>Konum verileri:</strong> Yalnızca uygulama içinde tur rotalarını görüntülemek için (izin vermeniz durumunda)</li>
          </ul>
        </Section>

        <Section title="3. Verilerin Kullanım Amaçları">
          <p>Toplanan veriler aşağıdaki amaçlarla işlenmektedir:</p>
          <ul>
            <li>Hesap oluşturma ve kimlik doğrulama</li>
            <li>Tur rezervasyonlarının gerçekleştirilmesi ve yönetimi</li>
            <li>Rezervasyon onayı, hatırlatma ve değişiklik bildirimleri (e-posta/SMS/push)</li>
            <li>Müşteri desteği sağlanması</li>
            <li>Hizmet kalitesinin iyileştirilmesi ve yeni özelliklerin geliştirilmesi</li>
            <li>Yasal yükümlülüklerin yerine getirilmesi</li>
            <li>Güvenlik ve sahtekârlık önleme</li>
          </ul>
        </Section>

        <Section title="4. Verilerin Paylaşılması">
          <p>Kişisel verileriniz aşağıdaki taraflarla paylaşılabilir:</p>
          <ul>
            <li><strong>Tur acenteleri:</strong> Rezervasyonunuzun yerine getirilmesi amacıyla ad, iletişim bilgileri ve rezervasyon detaylarınız ilgili acenteyle paylaşılır. Acenteler bu verileri yalnızca tur organizasyonu için kullanmakla yükümlüdür.</li>
            <li><strong>Ödeme işlemcileri:</strong> Ödeme güvenliğini sağlamak amacıyla yetkili ödeme altyapı sağlayıcılarıyla çalışılır.</li>
            <li><strong>Altyapı sağlayıcıları:</strong> Google Cloud Platform (sunucu altyapısı). Veriler Avrupa Birliği sınırları içinde işlenir.</li>
            <li><strong>Yasal zorunluluklar:</strong> Mahkeme kararı veya yasal yükümlülük gerektirdiği durumlarda yetkili makamlarla paylaşılır.</li>
          </ul>
          <p>Verileriniz hiçbir şekilde üçüncü taraflara reklam amaçlı satılmaz veya kiralanmaz.</p>
        </Section>

        <Section title="5. Veri Saklama Süreleri">
          <ul>
            <li><strong>Hesap verileri:</strong> Hesabınız aktif olduğu sürece saklanır; hesap silinmesinden itibaren 30 gün içinde kalıcı olarak silinir.</li>
            <li><strong>Rezervasyon kayıtları:</strong> Türk Ticaret Kanunu gereği 10 yıl saklanır.</li>
            <li><strong>Kullanım logları:</strong> 12 ay saklanır.</li>
            <li><strong>Ödeme kayıtları:</strong> Finansal mevzuat gereği 10 yıl saklanır.</li>
          </ul>
        </Section>

        <Section title="6. Kullanıcı Hakları">
          <p>6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) kapsamında aşağıdaki haklara sahipsiniz:</p>
          <ul>
            <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
            <li>İşlenen verileriniz hakkında bilgi talep etme</li>
            <li>Verilerin işlenme amacını ve amaca uygun kullanılıp kullanılmadığını öğrenme</li>
            <li>Yurt içinde veya yurt dışında verilerin aktarıldığı üçüncü kişileri öğrenme</li>
            <li>Verilerin eksik veya yanlış işlenmesi hâlinde düzeltilmesini talep etme</li>
            <li>Verilerin silinmesini veya yok edilmesini talep etme</li>
            <li>Otomatik sistemler vasıtasıyla aleyhinize bir sonucun ortaya çıkmasına itiraz etme</li>
            <li>Kanuna aykırı işleme nedeniyle zarara uğramanız hâlinde zararın giderilmesini talep etme</li>
          </ul>
          <p>Bu haklarınızı kullanmak için <a href="mailto:hello@treklyapp.com" style={{ color: 'var(--brand)' }}>hello@treklyapp.com</a> adresine başvurabilirsiniz. Talepler 30 gün içinde yanıtlanır.</p>
        </Section>

        <Section title="7. Çerezler ve İzleme Teknolojileri">
          <p>Web sitemiz oturum yönetimi ve analitik amaçlı çerezler kullanır. Analitik çerezler hizmet kullanımını anonim olarak ölçer. Tarayıcı ayarlarınızdan çerezleri devre dışı bırakabilirsiniz; ancak bu durumda bazı özellikler çalışmayabilir.</p>
        </Section>

        <Section title="8. Veri Güvenliği">
          <p>Verileriniz endüstri standardı güvenlik önlemleriyle korunmaktadır: TLS şifrelemesi, şifrelenmiş şifre saklama (bcrypt), erişim kontrolü ve düzenli güvenlik denetimleri. Bununla birlikte internet üzerinden hiçbir iletimin %100 güvenli olmadığını hatırlatırız.</p>
        </Section>

        <Section title="9. Çocukların Gizliliği">
          <p>Hizmetimiz 13 yaşın altındaki bireylere yönelik değildir. 13 yaşın altındaki kullanıcılara ait verilerin sistemimizde bulunduğundan haberdar olursak bu verileri derhal sileriz.</p>
        </Section>

        <Section title="10. Politika Değişiklikleri">
          <p>Bu politikayı zaman zaman güncelleyebiliriz. Önemli değişiklikler e-posta veya uygulama bildirimi ile duyurulur. Güncel politika her zaman bu sayfada yayımlanır.</p>
        </Section>

        <Section title="11. İletişim">
          <p>Gizlilik politikamıza ilişkin sorularınız için:<br />
          <a href="mailto:hello@treklyapp.com" style={{ color: 'var(--brand)', fontWeight: 600 }}>hello@treklyapp.com</a></p>
        </Section>
      </div>

      <footer className="footer">
        <span className="footer-logo">Trekly</span>
        <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
          <Link href="/privacy" style={{ fontSize: '0.8rem', color: 'var(--text-3)' }}>Gizlilik Politikası</Link>
          <Link href="/terms" style={{ fontSize: '0.8rem', color: 'var(--text-3)' }}>Kullanım Koşulları</Link>
        </div>
        <span className="footer-copy">© {new Date().getFullYear()} Trekly. Tüm hakları saklıdır.</span>
      </footer>
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
