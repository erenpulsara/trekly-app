// Gizlilik Politikası ve Kullanım Koşulları içeriği — iki dilli, yapılandırılmış.
// Sayfalar bu veriyi lang'e göre render eder. E-posta gövde metninde düz yazı,
// son "İletişim" bölümünde tıklanabilir bağlantı olarak gösterilir.

export type LegalListItem = string | { b: string; t: string };
export type LegalBlock =
  | { p: string; bold?: string }
  | { ul: LegalListItem[] }
  | { contact: string };

export interface LegalSection {
  title: string;
  blocks: LegalBlock[];
}

export interface LegalDoc {
  updated: string;
  title: string;
  intro: string;
  sections: LegalSection[];
}

const EMAIL = 'hello@treklyapp.com';

export const LEGAL: Record<'terms' | 'privacy', Record<'tr' | 'en', LegalDoc>> = {
  terms: {
    tr: {
      updated: 'Son güncelleme: 21 Haziran 2026',
      title: 'Kullanım Koşulları',
      intro: 'Bu Kullanım Koşulları, Trekly mobil uygulaması ve web sitesini ("Platform") kullanan kişiler ("Kullanıcı") ile Trekly arasındaki yasal ilişkiyi düzenler. Platformu kullanarak bu koşulları kabul etmiş sayılırsınız.',
      sections: [
        { title: '1. Hizmetin Tanımı', blocks: [
          { p: 'Trekly; kullanıcıları bağımsız tur acenteleri ve rehberleriyle buluşturan bir çevrimiçi pazaryeri platformudur. Trekly, tur operatörü değildir; yalnızca teknik altyapı ve aracılık hizmeti sunar. Turların düzenlenmesinden ve yürütülmesinden doğrudan sorumlu taraf, ilgili tur acentesidir.' },
        ] },
        { title: '2. Hesap Oluşturma ve Güvenlik', blocks: [
          { ul: [
            'Platform\'u kullanmak için 18 yaşında veya daha büyük olmanız ya da yasal veli/vasi onayına sahip olmanız gerekir.',
            'Hesap bilgilerinizin doğru, güncel ve eksiksiz olmasından siz sorumlusunuz.',
            'Hesap şifrenizi gizli tutmak ve yetkisiz erişimi derhal bildirmek sizin sorumluluğunuzdadır.',
            'Bir kişi adına yalnızca bir hesap oluşturulabilir.',
          ] },
        ] },
        { title: '3. Rezervasyon ve Ödeme Koşulları', blocks: [
          { ul: [
            'Platform üzerinden yapılan rezervasyonlar, tur acentesinin onayıyla kesinleşir.',
            'Ödeme, rezervasyon sırasında tahsil edilir. Ödeme işlemleri yetkili üçüncü taraf ödeme işlemcileri aracılığıyla güvenli biçimde gerçekleştirilir.',
            'İptal ve iade politikaları, ilgili acentenin belirlediği koşullara tabidir. Her turun ilan sayfasında iptal koşulları ayrıca belirtilir.',
            'Trekly, acente tarafından belirlenen fiyatların doğruluğunu garanti etmez; fiyatlar her an değişebilir.',
            'Rezervasyon tamamlanmadan önce gösterilen toplam tutar bağlayıcıdır.',
          ] },
        ] },
        { title: '4. Kullanıcı Yükümlülükleri', blocks: [
          { p: 'Kullanıcı, Platform\'u kullanırken aşağıdaki yükümlülükleri kabul eder:' },
          { ul: [
            'Türkiye Cumhuriyeti yasaları ile uluslararası hukuka uymak',
            'Başkalarının haklarını ihlal eden içerik paylaşmamak',
            'Platforma zarar verecek teknik saldırılardan kaçınmak',
            'Sahte rezervasyon oluşturmamak veya sistemi manipüle etmeye çalışmamak',
            'Tur değerlendirmelerinde dürüst ve gerçek bilgi paylaşmak',
            'Tur sırasında acente ve rehberin güvenlik talimatlarına uymak',
          ] },
        ] },
        { title: '5. Acenta İlişkisi ve Sorumluluk Reddi', blocks: [
          { p: 'Platform\'da listelenen tüm turlar bağımsız tur acenteleri tarafından sunulmaktadır. Bu nedenle:', bold: 'Trekly bir tur operatörü değildir.' },
          { ul: [
            'Turların içeriği, güvenliği, kalitesi ve yürütülmesinden acenteler sorumludur.',
            'Trekly, acente tarafından sağlanan bilgilerin doğruluğunu garanti etmez.',
            'Tur sırasında yaşanan kaza, kayıp, yaralanma veya hayal kırıklığından Trekly sorumlu tutulamaz.',
            'Acentelerle kullanıcılar arasındaki anlaşmazlıklarda Trekly arabulucu rolünde destek sağlayabilir; ancak hukuki sorumluluk üstlenmez.',
          ] },
        ] },
        { title: '6. Fikri Mülkiyet', blocks: [
          { p: 'Platform\'daki tüm içerik (logo, tasarım, yazılım, metin) Trekly\'e aittir ve Türk Fikir ve Sanat Eserleri Kanunu kapsamında korunmaktadır. Kullanıcılar, içerikleri önceden yazılı izin almaksızın kopyalayamaz, dağıtamaz veya ticari amaçla kullanamazlar.' },
          { p: 'Kullanıcıların platforma yüklediği içerikler (fotoğraf, yorum vb.) için kullanıcılar, Trekly\'e bu içerikleri hizmet amacıyla kullanma hakkı tanır.' },
        ] },
        { title: '7. Sorumluluk Sınırlaması', blocks: [
          { p: 'Yürürlükteki mevzuatın izin verdiği azami ölçüde:' },
          { ul: [
            'Trekly\'nin herhangi bir olay için sorumluluğu, o rezervasyon için ödenen ücretle sınırlıdır.',
            'Trekly; kâr kaybı, veri kaybı, itibar kaybı veya dolaylı zararlar için sorumlu tutulamaz.',
            'Platform\'un kesintisiz veya hatasız çalışacağı garanti edilmez.',
          ] },
        ] },
        { title: '8. Hesap Askıya Alma ve Sonlandırma', blocks: [
          { p: 'Trekly, aşağıdaki durumlarda önceden bildirimde bulunmaksızın hesabı askıya alabilir veya kalıcı olarak silebilir:' },
          { ul: [
            'Bu koşulların ihlali',
            'Sahte veya yanıltıcı bilgi sağlama',
            'Diğer kullanıcılara veya acentelere zarar verici davranışlar',
            'Yetkili makam talebi',
          ] },
          { p: `Kullanıcı da dilediği zaman hesabını silebilir. Hesap silme işlemi uygulama içi ayarlar veya ${EMAIL} aracılığıyla gerçekleştirilebilir.` },
        ] },
        { title: '9. Değişiklikler', blocks: [
          { p: 'Trekly bu koşulları dilediği zaman güncelleme hakkını saklı tutar. Önemli değişiklikler en az 15 gün öncesinden bildirilir. Güncelleme sonrası platformu kullanmaya devam etmek, yeni koşulların kabul edildiği anlamına gelir.' },
        ] },
        { title: '10. Uygulanacak Hukuk ve Uyuşmazlık Çözümü', blocks: [
          { p: 'Bu koşullar Türkiye Cumhuriyeti hukukuna tabidir. Taraflar arasında doğabilecek uyuşmazlıklarda önce müzakere yoluyla çözüm aranır. Çözüme kavuşturulamazsa İstanbul Mahkemeleri ve İcra Daireleri yetkilidir.' },
        ] },
        { title: '11. İletişim', blocks: [
          { contact: 'Kullanım koşullarına ilişkin sorularınız için:' },
        ] },
      ],
    },
    en: {
      updated: 'Last updated: June 21, 2026',
      title: 'Terms of Use',
      intro: 'These Terms of Use govern the legal relationship between Trekly and the individuals ("Users") who use the Trekly mobile app and website ("Platform"). By using the Platform, you are deemed to have accepted these terms.',
      sections: [
        { title: '1. Description of Service', blocks: [
          { p: 'Trekly is an online marketplace platform that connects users with independent tour agencies and guides. Trekly is not a tour operator; it only provides the technical infrastructure and intermediary service. The party directly responsible for organizing and running the tours is the relevant tour agency.' },
        ] },
        { title: '2. Account Creation and Security', blocks: [
          { ul: [
            'To use the Platform, you must be 18 years or older, or have the consent of a legal parent/guardian.',
            'You are responsible for keeping your account information accurate, current and complete.',
            'It is your responsibility to keep your password confidential and to report unauthorized access immediately.',
            'Only one account may be created per person.',
          ] },
        ] },
        { title: '3. Booking and Payment Terms', blocks: [
          { ul: [
            'Bookings made through the Platform are finalized upon the tour agency\'s confirmation.',
            'Payment is collected at the time of booking. Payment transactions are carried out securely through authorized third-party payment processors.',
            'Cancellation and refund policies are subject to the conditions set by the relevant agency. Cancellation terms are also stated on each tour\'s listing page.',
            'Trekly does not guarantee the accuracy of prices set by the agency; prices may change at any time.',
            'The total amount shown before completing a booking is binding.',
          ] },
        ] },
        { title: '4. User Obligations', blocks: [
          { p: 'When using the Platform, the User agrees to the following obligations:' },
          { ul: [
            'To comply with the laws of the Republic of Turkey and international law',
            'To not share content that violates the rights of others',
            'To avoid technical attacks that could harm the Platform',
            'To not create fraudulent bookings or attempt to manipulate the system',
            'To share honest and truthful information in tour reviews',
            'To follow the safety instructions of the agency and guide during the tour',
          ] },
        ] },
        { title: '5. Agency Relationship and Disclaimer', blocks: [
          { p: 'All tours listed on the Platform are provided by independent tour agencies. Therefore:', bold: 'Trekly is not a tour operator.' },
          { ul: [
            'Agencies are responsible for the content, safety, quality and execution of the tours.',
            'Trekly does not guarantee the accuracy of information provided by the agency.',
            'Trekly cannot be held responsible for any accident, loss, injury or disappointment experienced during a tour.',
            'In disputes between agencies and users, Trekly may provide support as a mediator; however, it assumes no legal liability.',
          ] },
        ] },
        { title: '6. Intellectual Property', blocks: [
          { p: 'All content on the Platform (logo, design, software, text) belongs to Trekly and is protected under Turkish Intellectual and Artistic Works Law. Users may not copy, distribute or use the content for commercial purposes without prior written permission.' },
          { p: 'For content uploaded to the platform by users (photos, comments, etc.), users grant Trekly the right to use such content for service purposes.' },
        ] },
        { title: '7. Limitation of Liability', blocks: [
          { p: 'To the maximum extent permitted by applicable law:' },
          { ul: [
            'Trekly\'s liability for any event is limited to the fee paid for that booking.',
            'Trekly cannot be held liable for loss of profit, loss of data, loss of reputation or indirect damages.',
            'The Platform is not guaranteed to operate uninterrupted or error-free.',
          ] },
        ] },
        { title: '8. Account Suspension and Termination', blocks: [
          { p: 'Trekly may suspend or permanently delete an account without prior notice in the following cases:' },
          { ul: [
            'Violation of these terms',
            'Providing false or misleading information',
            'Behavior harmful to other users or agencies',
            'Request from an authorized authority',
          ] },
          { p: `Users may also delete their account at any time. Account deletion can be done via in-app settings or through ${EMAIL}.` },
        ] },
        { title: '9. Changes', blocks: [
          { p: 'Trekly reserves the right to update these terms at any time. Significant changes are announced at least 15 days in advance. Continuing to use the platform after an update means the new terms are accepted.' },
        ] },
        { title: '10. Governing Law and Dispute Resolution', blocks: [
          { p: 'These terms are subject to the laws of the Republic of Turkey. In disputes that may arise between the parties, a solution is first sought through negotiation. If not resolved, the Istanbul Courts and Enforcement Offices have jurisdiction.' },
        ] },
        { title: '11. Contact', blocks: [
          { contact: 'For your questions regarding the terms of use:' },
        ] },
      ],
    },
  },
  privacy: {
    tr: {
      updated: 'Son güncelleme: 21 Haziran 2026',
      title: 'Gizlilik Politikası',
      intro: 'Trekly olarak kişisel verilerinizin güvenliğini ciddiye alıyoruz. Bu politika, Trekly mobil uygulaması ve web sitesi ("Hizmet") aracılığıyla toplanan verilerin nasıl işlendiğini açıklar.',
      sections: [
        { title: '1. Veri Sorumlusu', blocks: [
          { p: `Veri sorumlusu Trekly'dir. İletişim: ${EMAIL}`, bold: '' },
        ] },
        { title: '2. Toplanan Veriler', blocks: [
          { p: 'Hizmetimizi kullanırken aşağıdaki kişisel veriler toplanmaktadır:' },
          { ul: [
            { b: 'Kimlik verileri:', t: 'Ad, soyad' },
            { b: 'İletişim verileri:', t: 'E-posta adresi, telefon numarası' },
            { b: 'Rezervasyon verileri:', t: 'Seçilen tur, katılım tarihi, kişi sayısı, ödeme bilgileri (kart numarası saklanmaz; ödeme işlemcisi üzerinden işlenir)' },
            { b: 'Hesap verileri:', t: 'Kullanıcı adı, şifre (şifrelenmiş olarak saklanır), profil fotoğrafı (isteğe bağlı)' },
            { b: 'Kullanım verileri:', t: 'Uygulama içi gezinme, tıklama verileri, hata logları' },
            { b: 'Cihaz verileri:', t: 'Cihaz modeli, işletim sistemi, benzersiz cihaz tanımlayıcısı, IP adresi' },
            { b: 'Konum verileri:', t: 'Yalnızca uygulama içinde tur rotalarını görüntülemek için (izin vermeniz durumunda)' },
          ] },
        ] },
        { title: '3. Verilerin Kullanım Amaçları', blocks: [
          { p: 'Toplanan veriler aşağıdaki amaçlarla işlenmektedir:' },
          { ul: [
            'Hesap oluşturma ve kimlik doğrulama',
            'Tur rezervasyonlarının gerçekleştirilmesi ve yönetimi',
            'Rezervasyon onayı, hatırlatma ve değişiklik bildirimleri (e-posta/SMS/push)',
            'Müşteri desteği sağlanması',
            'Hizmet kalitesinin iyileştirilmesi ve yeni özelliklerin geliştirilmesi',
            'Yasal yükümlülüklerin yerine getirilmesi',
            'Güvenlik ve sahtekârlık önleme',
          ] },
        ] },
        { title: '4. Verilerin Paylaşılması', blocks: [
          { p: 'Kişisel verileriniz aşağıdaki taraflarla paylaşılabilir:' },
          { ul: [
            { b: 'Tur acenteleri:', t: 'Rezervasyonunuzun yerine getirilmesi amacıyla ad, iletişim bilgileri ve rezervasyon detaylarınız ilgili acenteyle paylaşılır. Acenteler bu verileri yalnızca tur organizasyonu için kullanmakla yükümlüdür.' },
            { b: 'Ödeme işlemcileri:', t: 'Ödeme güvenliğini sağlamak amacıyla yetkili ödeme altyapı sağlayıcılarıyla çalışılır.' },
            { b: 'Altyapı sağlayıcıları:', t: 'Google Cloud Platform (sunucu altyapısı). Veriler Avrupa Birliği sınırları içinde işlenir.' },
            { b: 'Yasal zorunluluklar:', t: 'Mahkeme kararı veya yasal yükümlülük gerektirdiği durumlarda yetkili makamlarla paylaşılır.' },
          ] },
          { p: 'Verileriniz hiçbir şekilde üçüncü taraflara reklam amaçlı satılmaz veya kiralanmaz.' },
        ] },
        { title: '5. Veri Saklama Süreleri', blocks: [
          { ul: [
            { b: 'Hesap verileri:', t: 'Hesabınız aktif olduğu sürece saklanır; hesap silinmesinden itibaren 30 gün içinde kalıcı olarak silinir.' },
            { b: 'Rezervasyon kayıtları:', t: 'Türk Ticaret Kanunu gereği 10 yıl saklanır.' },
            { b: 'Kullanım logları:', t: '12 ay saklanır.' },
            { b: 'Ödeme kayıtları:', t: 'Finansal mevzuat gereği 10 yıl saklanır.' },
          ] },
        ] },
        { title: '6. Kullanıcı Hakları', blocks: [
          { p: '6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) kapsamında aşağıdaki haklara sahipsiniz:' },
          { ul: [
            'Kişisel verilerinizin işlenip işlenmediğini öğrenme',
            'İşlenen verileriniz hakkında bilgi talep etme',
            'Verilerin işlenme amacını ve amaca uygun kullanılıp kullanılmadığını öğrenme',
            'Yurt içinde veya yurt dışında verilerin aktarıldığı üçüncü kişileri öğrenme',
            'Verilerin eksik veya yanlış işlenmesi hâlinde düzeltilmesini talep etme',
            'Verilerin silinmesini veya yok edilmesini talep etme',
            'Otomatik sistemler vasıtasıyla aleyhinize bir sonucun ortaya çıkmasına itiraz etme',
            'Kanuna aykırı işleme nedeniyle zarara uğramanız hâlinde zararın giderilmesini talep etme',
          ] },
          { p: `Bu haklarınızı kullanmak için ${EMAIL} adresine başvurabilirsiniz. Talepler 30 gün içinde yanıtlanır.` },
        ] },
        { title: '7. Çerezler ve İzleme Teknolojileri', blocks: [
          { p: 'Web sitemiz oturum yönetimi ve analitik amaçlı çerezler kullanır. Analitik çerezler hizmet kullanımını anonim olarak ölçer. Tarayıcı ayarlarınızdan çerezleri devre dışı bırakabilirsiniz; ancak bu durumda bazı özellikler çalışmayabilir.' },
        ] },
        { title: '8. Veri Güvenliği', blocks: [
          { p: 'Verileriniz endüstri standardı güvenlik önlemleriyle korunmaktadır: TLS şifrelemesi, şifrelenmiş şifre saklama (bcrypt), erişim kontrolü ve düzenli güvenlik denetimleri. Bununla birlikte internet üzerinden hiçbir iletimin %100 güvenli olmadığını hatırlatırız.' },
        ] },
        { title: '9. Çocukların Gizliliği', blocks: [
          { p: 'Hizmetimiz 13 yaşın altındaki bireylere yönelik değildir. 13 yaşın altındaki kullanıcılara ait verilerin sistemimizde bulunduğundan haberdar olursak bu verileri derhal sileriz.' },
        ] },
        { title: '10. Politika Değişiklikleri', blocks: [
          { p: 'Bu politikayı zaman zaman güncelleyebiliriz. Önemli değişiklikler e-posta veya uygulama bildirimi ile duyurulur. Güncel politika her zaman bu sayfada yayımlanır.' },
        ] },
        { title: '11. İletişim', blocks: [
          { contact: 'Gizlilik politikamıza ilişkin sorularınız için:' },
        ] },
      ],
    },
    en: {
      updated: 'Last updated: June 21, 2026',
      title: 'Privacy Policy',
      intro: 'At Trekly, we take the security of your personal data seriously. This policy explains how data collected through the Trekly mobile app and website ("Service") is processed.',
      sections: [
        { title: '1. Data Controller', blocks: [
          { p: `The data controller is Trekly. Contact: ${EMAIL}`, bold: '' },
        ] },
        { title: '2. Data Collected', blocks: [
          { p: 'The following personal data is collected while using our Service:' },
          { ul: [
            { b: 'Identity data:', t: 'First name, last name' },
            { b: 'Contact data:', t: 'Email address, phone number' },
            { b: 'Booking data:', t: 'Selected tour, participation date, number of people, payment information (card number is not stored; processed via the payment processor)' },
            { b: 'Account data:', t: 'Username, password (stored encrypted), profile photo (optional)' },
            { b: 'Usage data:', t: 'In-app navigation, click data, error logs' },
            { b: 'Device data:', t: 'Device model, operating system, unique device identifier, IP address' },
            { b: 'Location data:', t: 'Only to display tour routes within the app (if you grant permission)' },
          ] },
        ] },
        { title: '3. Purposes of Data Use', blocks: [
          { p: 'Collected data is processed for the following purposes:' },
          { ul: [
            'Account creation and identity verification',
            'Carrying out and managing tour bookings',
            'Booking confirmation, reminder and change notifications (email/SMS/push)',
            'Providing customer support',
            'Improving service quality and developing new features',
            'Fulfilling legal obligations',
            'Security and fraud prevention',
          ] },
        ] },
        { title: '4. Data Sharing', blocks: [
          { p: 'Your personal data may be shared with the following parties:' },
          { ul: [
            { b: 'Tour agencies:', t: 'Your name, contact details and booking details are shared with the relevant agency in order to fulfill your booking. Agencies are obliged to use this data only for tour organization.' },
            { b: 'Payment processors:', t: 'We work with authorized payment infrastructure providers to ensure payment security.' },
            { b: 'Infrastructure providers:', t: 'Google Cloud Platform (server infrastructure). Data is processed within the borders of the European Union.' },
            { b: 'Legal obligations:', t: 'Shared with authorized authorities when required by court order or legal obligation.' },
          ] },
          { p: 'Your data is never sold or rented to third parties for advertising purposes.' },
        ] },
        { title: '5. Data Retention Periods', blocks: [
          { ul: [
            { b: 'Account data:', t: 'Stored as long as your account is active; permanently deleted within 30 days of account deletion.' },
            { b: 'Booking records:', t: 'Stored for 10 years as required by the Turkish Commercial Code.' },
            { b: 'Usage logs:', t: 'Stored for 12 months.' },
            { b: 'Payment records:', t: 'Stored for 10 years as required by financial regulations.' },
          ] },
        ] },
        { title: '6. User Rights', blocks: [
          { p: 'Under the Turkish Personal Data Protection Law No. 6698 (KVKK), you have the following rights:' },
          { ul: [
            'To learn whether your personal data is being processed',
            'To request information about your processed data',
            'To learn the purpose of processing and whether it is used accordingly',
            'To learn the third parties to whom data is transferred domestically or abroad',
            'To request correction if data is processed incompletely or incorrectly',
            'To request deletion or destruction of the data',
            'To object to an adverse outcome arising against you through automated systems',
            'To request compensation for damages if you suffer loss due to unlawful processing',
          ] },
          { p: `To exercise these rights, you can contact ${EMAIL}. Requests are answered within 30 days.` },
        ] },
        { title: '7. Cookies and Tracking Technologies', blocks: [
          { p: 'Our website uses cookies for session management and analytics. Analytics cookies measure service usage anonymously. You can disable cookies in your browser settings; however, some features may not work in that case.' },
        ] },
        { title: '8. Data Security', blocks: [
          { p: 'Your data is protected by industry-standard security measures: TLS encryption, encrypted password storage (bcrypt), access control and regular security audits. That said, we remind you that no transmission over the internet is 100% secure.' },
        ] },
        { title: "9. Children's Privacy", blocks: [
          { p: 'Our Service is not intended for individuals under the age of 13. If we become aware that we hold data belonging to users under 13, we delete such data immediately.' },
        ] },
        { title: '10. Policy Changes', blocks: [
          { p: 'We may update this policy from time to time. Significant changes are announced by email or in-app notification. The current policy is always published on this page.' },
        ] },
        { title: '11. Contact', blocks: [
          { contact: 'For your questions regarding our privacy policy:' },
        ] },
      ],
    },
  },
};

export const LEGAL_EMAIL = EMAIL;
