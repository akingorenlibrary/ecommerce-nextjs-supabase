"use client";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import styles from "./not-found.module.css";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className={styles.page}>
      <Navbar />
      
      <div className={styles.container}>
        <div className={styles.content}>
          {/* 404 İkonu ve Başlık */}
          <div className={styles.errorSection}>
            <div className={styles.errorCode}>404</div>
            <div className={styles.errorIcon}>🔍</div>
          </div>

          {/* Mesaj */}
          <div className={styles.messageSection}>
            <h1 className={styles.title}>Sayfa Bulunamadı</h1>
            <p className={styles.description}>
              Aradığınız sayfa mevcut değil, taşınmış veya silinmiş olabilir.
              <br />
              URL'yi kontrol edin veya ana sayfaya dönün.
            </p>
          </div>

          {/* Eylem Butonları */}
          <div className={styles.actions}>
            <button 
              onClick={() => router.back()}
              className={styles.backButton}
            >
              ← Geri Dön
            </button>
            
            <a href="/" className={styles.homeButton}>
              🏠 Ana Sayfa
            </a>
          </div>


        </div>
      </div>

      <Footer />
    </div>
  );
} 