"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AdminProtectedRoute from "@/components/AdminProtectedRoute";
import AdminNavbar from "@/components/AdminNavbar";
import { db } from "@/lib/supabase";
import styles from "./page.module.css";

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  image_url_1?: string;
  image_url_2?: string;
  image_url_3?: string;
  categories?: { name: string };
  subcategories?: { name: string };
}

function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const { data, error } = await db.products.getAll();
      if (error) {
        console.error('Ürünler yüklenirken hata:', error);
        alert(`Ürünler yüklenirken hata: ${error.message || 'Bilinmeyen hata'}`);
        return;
      }
      setProducts(data || []);
    } catch (error) {
      console.error('Ürünler yüklenirken hata:', error);
      alert('Ürünler yüklenirken beklenmeyen bir hata oluştu.');
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
        <h1>Ürünler</h1>
        <button 
          onClick={() => router.push('/admin/products/add')}
          className={styles.addBtn}
        >
          + Ürün Ekle
        </button>
      </div>

      <div className={styles.productsList}>
                  {products.length > 0 ? (
            products.map((product) => (
              <div key={product.id} className={styles.productCard}>
                <div className={styles.productInfo}>
                  <h3>{product.name}</h3>
                  <p>{product.categories?.name} &gt; {product.subcategories?.name}</p>
                  <p>₺{product.price} | Stok: {product.stock}</p>
                </div>
                <button 
                  onClick={() => router.push(`/admin/products/${product.id}`)}
                  className={styles.detailBtn}
                >
                  Detay
                </button>
              </div>
            ))
          ) : (
          <div className={styles.empty}>
            <p>Henüz ürün eklenmemiş.</p>
            <p>İlk ürününüzü eklemek için yukarıdaki "Ürün Ekle" butonunu kullanın.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ProductsPageWrapper() {
  return (
    <AdminProtectedRoute>
      <AdminNavbar />
      <ProductsPage />
    </AdminProtectedRoute>
  );
} 