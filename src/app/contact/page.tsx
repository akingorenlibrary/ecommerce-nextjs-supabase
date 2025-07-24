import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import styles from "./page.module.css";

export default function Iletisim() {
  return (
    <div>
      {/* Navigation Bar */}
      <Navbar />

      {/* Page Header */}
      <section className={styles.pageHeader}>
        <div className="container">
          <div className="row">
            <div className="col-12">
              <h1 className={styles.pageTitle}>İletişim</h1>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Content */}
      <section className={styles.contactSection}>
        <div className="container">
          <div className="row">
            {/* Contact Information */}
            <div className="col-lg-6 mb-5">
              <div className={styles.contactInfo}>
                <h2 className={styles.sectionTitle}>Bizimle İletişime Geçin</h2>
                <p className={styles.sectionSubtitle}>
                  Sorularınız, önerileriniz veya destek talebiniz için bize ulaşabilirsiniz.
                </p>

                <div className={styles.contactItem}>
                  <div className={styles.contactIcon}>📍</div>
                  <div className={styles.contactDetails}>
                    <h4>Adresimiz</h4>
                    <p>Atatürk Caddesi No:123<br />Çankaya, Ankara 06100</p>
                  </div>
                </div>

                <div className={styles.contactItem}>
                  <div className={styles.contactIcon}>📞</div>
                  <div className={styles.contactDetails}>
                    <h4>Telefon</h4>
                    <p>0312 456 78 90<br />0532 123 45 67</p>
                  </div>
                </div>

                <div className={styles.contactItem}>
                  <div className={styles.contactIcon}>✉️</div>
                  <div className={styles.contactDetails}>
                    <h4>E-posta</h4>
                    <p>info@evdekor.com<br />destek@evdekor.com</p>
                  </div>
                </div>

                <div className={styles.contactItem}>
                  <div className={styles.contactIcon}>🕐</div>
                  <div className={styles.contactDetails}>
                    <h4>Çalışma Saatleri</h4>
                    <p>Pazartesi - Cumartesi: 09:00 - 18:00<br />Pazar: Kapalı</p>
                  </div>
                </div>

                {/* Social Media */}
                <div className={styles.socialSection}>
                  <h4>Sosyal Medyada Bizi Takip Edin</h4>
                  <div className={styles.socialLinks}>
                    <a href="#" className={styles.socialLink}>📘 Facebook</a>
                    <a href="#" className={styles.socialLink}>📷 Instagram</a>
                    <a href="#" className={styles.socialLink}>🐦 Twitter</a>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="col-lg-6">
              <div className={styles.contactForm}>
                <h3 className={styles.formTitle}>Mesaj Gönder</h3>
                <form>
                  <div className="row">
                    <div className="col-md-6">
                      <div className={styles.formGroup}>
                        <label htmlFor="firstName">Ad</label>
                        <input 
                          type="text" 
                          id="firstName" 
                          className={styles.formControl}
                          placeholder="Adınız"
                          required
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className={styles.formGroup}>
                        <label htmlFor="lastName">Soyad</label>
                        <input 
                          type="text" 
                          id="lastName" 
                          className={styles.formControl}
                          placeholder="Soyadınız"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="email">E-posta</label>
                    <input 
                      type="email" 
                      id="email" 
                      className={styles.formControl}
                      placeholder="E-posta adresiniz"
                      required
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="phone">Telefon</label>
                    <input 
                      type="tel" 
                      id="phone" 
                      className={styles.formControl}
                      placeholder="Telefon numaranız"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="subject">Konu</label>
                    <select id="subject" className={styles.formControl} required>
                      <option value="">Konu seçiniz</option>
                      <option value="genel">Genel Bilgi</option>
                      <option value="urun">Ürün Bilgisi</option>
                      <option value="siparis">Sipariş Durumu</option>
                      <option value="destek">Teknik Destek</option>
                      <option value="oneri">Öneri/Şikayet</option>
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="message">Mesajınız</label>
                    <textarea 
                      id="message" 
                      className={styles.formControl}
                      rows={5}
                      placeholder="Mesajınızı buraya yazın..."
                      required
                    ></textarea>
                  </div>

                  <button type="submit" className={styles.submitButton}>
                    Mesaj Gönder
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className={styles.mapSection}>
        <div className="container-fluid">
          <div className={styles.mapPlaceholder}>
            <div className={styles.mapContent}>
              <h3>📍 Konumumuz</h3>
              <p>Atatürk Caddesi No:123, Çankaya/Ankara</p>
              <small>* Interaktif harita entegrasyonu yapılabilir</small>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
} 