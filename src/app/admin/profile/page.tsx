"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AdminProtectedRoute from "@/components/AdminProtectedRoute";
import AdminNavbar from "@/components/AdminNavbar";
import { adminAuth } from "@/lib/supabase";
import styles from "./page.module.css";

interface AdminProfile {
  id: string;
  full_name: string;
  email: string;
  is_active: boolean;
  created_at: string;
}

function AdminProfileContent() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const router = useRouter();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = () => {
    try {
      const currentAdmin = adminAuth.getCurrentAdmin();
      if (currentAdmin) {
        setProfile({
          id: currentAdmin.id,
          full_name: currentAdmin.full_name,
          email: currentAdmin.email,
          is_active: currentAdmin.is_active,
          created_at: currentAdmin.created_at || new Date().toISOString()
        });
      } else {
        router.push("/admin/login");
        return;
      }
    } catch (error) {
      console.error('Profil yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    adminAuth.signOut();
    router.push("/admin/login");
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Yükleniyor...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>Profil bulunamadı</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Profil</h1>
      </div>

      <div className={styles.profileCard}>
        <div className={styles.profileInfo}>
          <div className={styles.infoItem}>
            <label>Ad Soyad</label>
            <span>{profile.full_name}</span>
          </div>

          <div className={styles.infoItem}>
            <label>Email</label>
            <span>{profile.email}</span>
          </div>

          <div className={styles.infoItem}>
            <label>Durum</label>
            <span className={profile.is_active ? styles.active : styles.inactive}>
              {profile.is_active ? 'Aktif' : 'Pasif'}
            </span>
          </div>

          <div className={styles.infoItem}>
            <label>Kayıt Tarihi</label>
            <span>{formatDate(profile.created_at)}</span>
          </div>
        </div>

        <div className={styles.actions}>
          <button onClick={handleLogout} className={styles.logoutBtn}>
            Çıkış Yap
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminProfile() {
  return (
    <AdminProtectedRoute>
      <AdminNavbar />
      <AdminProfileContent />
    </AdminProtectedRoute>
  );
} 