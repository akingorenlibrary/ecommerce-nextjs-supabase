"use client";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import styles from "./page.module.css";

export default function SifremiUnuttum() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    if (!email) {
      setError("Lütfen e-posta adresinizi girin.");
      setLoading(false);
      return;
    }

    try {
      const { error } = await resetPassword(email);
      
      if (error) {
        setError(error.message || "Şifre sıfırlama e-postası gönderilirken bir hata oluştu.");
      } else {
      setIsSubmitted(true);
      }
    } catch (err) {
      setError("Beklenmeyen bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <Navbar />
      
      <div className={styles.container}>
        <div className={styles.formContainer}>
          <div className={styles.header}>
            <h1>Şifremi Unuttum</h1>
            <p>
              {isSubmitted 
                ? "Şifre sıfırlama bağlantısı e-posta adresinize gönderildi."
                : "E-posta adresinizi girin, size şifre sıfırlama bağlantısı gönderelim."
              }
            </p>
          </div>

          {error && <div className={styles.error}>{error}</div>}

          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.field}>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="E-posta adresiniz"
                  className={styles.input}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className={styles.button}
              >
                {loading ? "Gönderiliyor..." : "Şifre Sıfırlama Bağlantısı Gönder"}
              </button>
            </form>
          ) : (
            <div className={styles.successMessage}>
              <div className={styles.icon}>✅</div>
              <h3>E-posta Gönderildi!</h3>
              <p><strong>{email}</strong> adresine şifre sıfırlama bağlantısı gönderdik. E-posta gelmezse spam klasörünüzü kontrol edin.</p>
              <div className={styles.infoBox}>
                <h4>Sonraki Adımlar:</h4>
                <ul>
                  <li>E-posta kutunuzu kontrol edin</li>
                  <li>Şifre sıfırlama linkine tıklayın</li>
                  <li>Yeni şifrenizi belirleyin</li>
                  <li>Yeni şifrenizle giriş yapın</li>
                </ul>
              </div>
              <div style={{marginTop: '1.2rem', color: '#888', fontSize: '0.97rem', textAlign: 'center'}}>
                Eğer e-posta gelmezse, bu e-posta adresiyle kayıtlı bir hesabınız yok demektir.
              </div>
            </div>
          )}

          <div className={styles.backToLogin}>
            <a href="/login" className={styles.backLink}>
              ← Giriş Sayfasına Dön
            </a>
          </div>

          <div className={styles.helpSection}>
            <h4>Yardıma mı ihtiyacınız var?</h4>
            <p>
              E-posta alamıyorsanız veya başka bir sorun yaşıyorsanız 
              <a href="/contact" className={styles.contactLink}> müşteri hizmetleri</a> ile iletişime geçin.
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
} 