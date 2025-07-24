"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import styles from "./page.module.css";
import { db } from "@/lib/supabase";

export default function UyeOl() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { signUp, signIn } = useAuth();

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
          <div className={styles.registerBox}>
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

    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password || !formData.confirmPassword) {
      setError("Lütfen tüm alanları doldurun.");
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Şifreler eşleşmiyor.");
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError("Şifre en az 6 karakter olmalıdır.");
      setLoading(false);
      return;
    }

    // Email kontrolü signUp sırasında yapılacak

    try {
      const { data, error } = await signUp(formData.email, formData.password);
      
      if (error) {
        setError(error.message || "Kayıt olurken bir hata oluştu.");
      } else {
        // Kayıt başarılı, kullanıcıyı otomatik olarak giriş yap
        try {
          const { data: signInData, error: signInError } = await signIn(formData.email, formData.password);
          
          if (signInError) {
            setError("Kayıt başarılı ancak otomatik giriş yapılamadı. Lütfen giriş sayfasından giriş yapın.");
            router.push("/login");
          } else {
            // user_detail tablosuna ad soyad kaydet
            if (signInData?.user) {
              await db.userDetail.create({
                user_id: signInData.user.id,
                full_name: `${formData.firstName} ${formData.lastName}`
              });
            }
            // Otomatik giriş başarılı
            router.push("/");
          }
        } catch (signInErr) {
          setError("Kayıt başarılı ancak otomatik giriş yapılamadı. Lütfen giriş sayfasından giriş yapın.");
          router.push("/login");
        }
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
        <div className={styles.registerBox}>
          <h1 className={styles.title}>Üye Ol</h1>
          
          {error && <div className={styles.error}>{error}</div>}
          
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.row}>
              <div className={styles.field}>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  placeholder="Adınız"
                  className={styles.input}
                  required
                />
              </div>
              <div className={styles.field}>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  placeholder="Soyadınız"
                  className={styles.input}
                  required
                />
              </div>
            </div>

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
                placeholder="Şifreniz (en az 6 karakter)"
                className={styles.input}
                required
              />
            </div>

            <div className={styles.field}>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Şifre tekrar"
                className={styles.input}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={styles.button}
            >
              {loading ? "Kayıt oluşturuluyor..." : "Üye Ol"}
            </button>
          </form>

          <div className={styles.divider}>
            <span>Zaten hesabınız var mı?</span>
          </div>

          <a href="/login" className={styles.switchLink}>
            Giriş Yap
          </a>
        </div>
      </div>

      <Footer />
    </div>
  );
} 