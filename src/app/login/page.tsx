"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import styles from "./page.module.css";

export default function Giris() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { signIn } = useAuth();

  // Kullanıcı zaten giriş yapmışsa ana sayfaya yönlendir
  useEffect(() => {
    if (!authLoading && user) {
      router.push("/");
    }
  }, [user, authLoading, router]);

  // Kullanıcı giriş yapmışsa sayfayı gösterme
  if (authLoading || user) {
    return (
      <div>
        <Navbar />
        <div className={styles.container}>
          <div className={styles.loginBox}>
            <div className={styles.loading}>Yükleniyor...</div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!formData.email || !formData.password) {
      setError("Lütfen tüm alanları doldurun.");
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await signIn(formData.email, formData.password);
      
      if (error) {
        setError(error.message || "Giriş yapılırken bir hata oluştu.");
      } else {
        // Giriş başarılı, ana sayfaya yönlendir
        router.push("/");
      }
    } catch (err) {
      setError("Beklenmeyen bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Navbar />
      
      <div className={styles.container}>
        <div className={styles.loginBox}>
          <h1 className={styles.title}>Giriş Yap</h1>
          
          {error && <div className={styles.error}>{error}</div>}
          
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.field}>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="E-posta adresiniz"
                className={styles.input}
                required
              />
            </div>

            <div className={styles.field}>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Şifreniz"
                className={styles.input}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={styles.button}
            >
              {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
            </button>
          </form>

          <div className={styles.forgotPassword}>
            <a href="/forgot-password" className={styles.forgotLink}>
              Şifremi Unuttum
            </a>
          </div>

          <div className={styles.divider}>
            <span>Hesabınız yok mu?</span>
          </div>

          <a href="/register" className={styles.switchLink}>
            Üye Ol
          </a>
        </div>
      </div>

      <Footer />
    </div>
  );
} 