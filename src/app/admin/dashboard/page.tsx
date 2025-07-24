"use client";
import { useState, useEffect } from "react";
import AdminProtectedRoute from "@/components/AdminProtectedRoute";
import AdminNavbar from "@/components/AdminNavbar";
import { db } from "@/lib/supabase";
import styles from "./page.module.css";

interface DashboardStats {
  totalProducts: number;
  totalCategories: number;
  totalSubcategories: number;
}

function DashboardContent() {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalCategories: 0,
    totalSubcategories: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();

    const session = localStorage.getItem('adminSession');
console.log("Admin session:", session);

if (session) {
  const parsedSession = JSON.parse(session);
  console.log("Parsed session:", parsedSession);
}


  }, []);

  

  const loadStats = async () => {
    try {
      // Ürün sayısını getir
      const { data: products, error: productsError } = await db.products.getAll();
      if (productsError) {
        console.error('Ürünler yüklenirken hata:', productsError);
      }

      // Kategori sayısını getir
      const { data: categories, error: categoriesError } = await db.categories.getAll();
      if (categoriesError) {
        console.error('Kategoriler yüklenirken hata:', categoriesError);
      }

      // Alt kategori sayısını getir
      const { data: subcategories, error: subcategoriesError } = await db.subcategories.getAll();
      if (subcategoriesError) {
        console.error('Alt kategoriler yüklenirken hata:', subcategoriesError);
      }

      setStats({
        totalProducts: products?.length || 0,
        totalCategories: categories?.length || 0,
        totalSubcategories: subcategories?.length || 0
      });
    } catch (error) {
      console.error('İstatistikler yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Dashboard</h1>
      </div>

      <div className={styles.stats}>
        <div className={styles.statCard}>
          <div className={styles.statNumber}>{stats.totalProducts}</div>
          <div className={styles.statLabel}>Ürün</div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statNumber}>{stats.totalCategories}</div>
          <div className={styles.statLabel}>Kategori</div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statNumber}>{stats.totalSubcategories}</div>
          <div className={styles.statLabel}>Alt Kategori</div>
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <AdminProtectedRoute>
      <AdminNavbar />
      <DashboardContent />
    </AdminProtectedRoute>
  );
} 