import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className="row g-4">
          <div className="col-lg-4">
            <h3 className={styles.footerBrand}>EvDekor</h3>
            <p className={styles.footerDescription}>
              2010'dan beri kaliteli mobilya ve dekorasyon ürünleri ile evlerinizi güzelleştiriyoruz. 
              Müşteri memnuniyeti bizim için her şeyden önemli.
            </p>
            <div className={styles.socialLinks}>
              <a href="#" className={styles.socialLink}>📘</a>
              <a href="#" className={styles.socialLink}>📷</a>
              <a href="#" className={styles.socialLink}>🐦</a>
            </div>
          </div>
          
          <div className="col-lg-2 col-md-6">
            <h5 className={styles.footerTitle}>Ürünler</h5>
            <ul className={styles.footerLinks}>
              <li><a href="#">Oturma Odası</a></li>
              <li><a href="#">Yatak Odası</a></li>
              <li><a href="#">Mutfak</a></li>
              <li><a href="#">Dekorasyon</a></li>
              <li><a href="#">Aydınlatma</a></li>
            </ul>
          </div>
          
          <div className="col-lg-2 col-md-6">
            <h5 className={styles.footerTitle}>Hizmetler</h5>
            <ul className={styles.footerLinks}>
              <li><a href="#">Ücretsiz Kargo</a></li>
              <li><a href="#">Kurulum Hizmeti</a></li>
              <li><a href="#">3D Tasarım</a></li>
              <li><a href="#">Geri İade</a></li>
              <li><a href="#">Garanti</a></li>
            </ul>
          </div>
          
          <div className="col-lg-4">
            <h5 className={styles.footerTitle}>İletişim</h5>
            <div className={styles.contactInfo}>
              <p>📍 Atatürk Cad. No:123, Çankaya/Ankara</p>
              <p>📞 0312 456 78 90</p>
              <p>✉️ info@evdekor.com</p>
              <p>🕐 Pazartesi - Cumartesi: 09:00 - 18:00</p>
            </div>
          </div>
        </div>
        
        <hr className={styles.footerDivider} />
        
        <div className="row">
          <div className="col-md-6">
            <p className={styles.copyright}>© 2024 EvDekor. Tüm hakları saklıdır.</p>
          </div>
          <div className="col-md-6">
            <div className={styles.footerTerms}>
              <a href="#">Gizlilik Politikası</a>
              <a href="#">Kullanım Şartları</a>
              <a href="#">Çerez Politikası</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
} 