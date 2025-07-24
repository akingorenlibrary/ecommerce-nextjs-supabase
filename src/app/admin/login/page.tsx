"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { adminAuth } from "@/lib/supabase";
import styles from "./page.module.css";

export default function AdminLogin() {
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  // Check if admin is already logged in
  useEffect(() => {
    console.log("Admin authenticated:", adminAuth.isAuthenticated());
    if (adminAuth.isAuthenticated()) {
      console.log("Yönlendiriliyor...");
      router.push("/admin/dashboard");
    } else {
      console.log("Admin doğrulama başarısız!");
    }
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(""); // Clear error when user types
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (!formData.email || !formData.password) {
      setError("Lütfen email ve şifre alanlarını doldurun.");
      setIsLoading(false);
      return;
    }

    try {
      const { admin, error } = await adminAuth.signIn(formData.email, formData.password);
      console.log("error: ",error);
      console.log("admin: ",admin);
      if (error) {
        setError(error.message);
      } else if (admin) {
        console.log("admin: ",admin);
        // Successful login, redirect to dashboard
        router.push("/admin/dashboard");
      }
    } catch (err) {
      setError("Giriş yapılırken beklenmeyen bir hata oluştu.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.loginCard}>
        <div className={styles.header}>
          <h1 className={styles.title}>Admin Panel</h1>
          <p className={styles.subtitle}>Yönetici paneline giriş yapın</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {error && (
            <div className={styles.error}>
              {error}
            </div>
          )}

          <div className={styles.inputGroup}>
            <label htmlFor="email" className={styles.label}>
              Email Adresi
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={styles.input}
              placeholder="E-posta adresinizi girin"
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="password" className={styles.label}>
              Şifre
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={styles.input}
              placeholder="Şifrenizi girin"
              required
            />
          </div>

          <button
            type="submit"
            className={styles.loginBtn}
            disabled={isLoading}
          >
            {isLoading ? "Giriş yapılıyor..." : "Giriş Yap"}
          </button>
        </form>



        <div className={styles.backToSite}>
          <a href="/" className={styles.backLink}>
            ← Ana Siteye Dön
          </a>
        </div>
      </div>
    </div>
  );
} 