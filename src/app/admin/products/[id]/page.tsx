"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import AdminProtectedRoute from "@/components/AdminProtectedRoute";
import AdminNavbar from "@/components/AdminNavbar";
import { db } from "@/lib/supabase";
import styles from "./page.module.css";
import toast from 'react-hot-toast';

interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  original_price?: number;
  stock: number;
  image_url_1?: string;
  image_url_2?: string;
  image_url_3?: string;
  category_id: string;
  subcategory_id: string;
  is_active: boolean;
  is_new: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
  categories?: { name: string; slug: string };
  subcategories?: { name: string; slug: string };
}

function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const productId = params.id as string;

  useEffect(() => {
    loadProduct();
  }, [productId]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const { data, error } = await db.products.getById(productId);
      
      if (error) {
        console.error('Ürün yüklenirken hata:', error);
        alert(`Ürün yüklenirken hata: ${error.message || 'Bilinmeyen hata'}`);
        return;
      }

      if (!data) {
        alert('Ürün bulunamadı!');
        router.push('/admin/products');
        return;
      }

      setProduct(data);
    } catch (error) {
      console.error('Ürün yüklenirken hata:', error);
      alert('Ürün yüklenirken beklenmeyen bir hata oluştu!');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setShowDeleteModal(false);
    try {
      setDeleting(true);
      
      const { error } = await db.products.delete(productId);
      if (error) {
        console.error('Ürün silinirken hata:', error);
        alert(`Ürün silinirken hata oluştu: ${error.message || 'Bilinmeyen hata'}`);
        return;
      }
      
      toast.success('Ürün ve tüm resimleri başarıyla silindi!');
      router.push('/admin/products');
    } catch (error) {
      console.error('Ürün silinirken hata:', error);
      alert('Ürün silinirken beklenmeyen bir hata oluştu!');
    } finally {
      setDeleting(false);
    }
  };

  const handleImageClick = (index: number) => {
    setSelectedImageIndex(index);
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Yükleniyor...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>Ürün bulunamadı!</div>
      </div>
    );
  }

  // Ürün resimlerini topla
  const productImages = [
    product.image_url_1,
    product.image_url_2,
    product.image_url_3
  ].filter(url => url && url.trim() !== '');

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button 
          onClick={() => router.push('/admin/products')}
          className={styles.backBtn}
        >
          ← Geri
        </button>
        <h1>{product.name}</h1>
        <div className={styles.actions}>
          <button
            onClick={() => setShowDeleteModal(true)}
            className={styles.deleteBtn}
            disabled={deleting}
          >
            {deleting ? 'Siliniyor...' : 'Sil'}
          </button>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.info}>
          <div className={styles.infoRow}>
            <span className={styles.label}>Kategori:</span>
            <span className={styles.value}>{product.categories?.name} &gt; {product.subcategories?.name}</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.label}>Fiyat:</span>
            <span className={styles.value}>₺{product.price.toLocaleString('tr-TR')}</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.label}>Stok:</span>
            <span className={styles.value}>{product.stock} adet</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.label}>Durum:</span>
            <span className={`${styles.value} ${product.is_active ? styles.active : styles.inactive}`}>
              {product.is_active ? 'Aktif' : 'Pasif'}
            </span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.label}>Öne Çıkan:</span>
            <span className={styles.value}>{product.is_featured ? 'Evet' : 'Hayır'}</span>
          </div>
          {product.description && (
            <div className={styles.infoRow}>
              <span className={styles.label}>Açıklama:</span>
              <span className={styles.value}>{product.description}</span>
            </div>
          )}
        </div>

        {productImages.length > 0 && (
          <div className={styles.images}>
            <img 
              src={productImages[selectedImageIndex]} 
              alt={product.name}
              className={styles.mainImage}
            />
            {productImages.length > 1 && (
              <div className={styles.thumbnails}>
                {productImages.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`${product.name} - Resim ${index + 1}`}
                    className={`${styles.thumbnail} ${selectedImageIndex === index ? styles.selected : ''}`}
                    onClick={() => handleImageClick(index)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.25)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: '#fff',
            borderRadius: 8,
            padding: '32px 24px',
            minWidth: 320,
            boxShadow: '0 2px 16px rgba(0,0,0,0.10)'
          }}>
            <h3 style={{marginBottom: 16, fontSize: 20, fontWeight: 600}}>Ürünü Sil</h3>
            <p style={{marginBottom: 24, color: '#333'}}>Bu ürünü ve tüm resimlerini silmek istediğinize emin misiniz?</p>
            <div style={{display: 'flex', gap: 12, justifyContent: 'flex-end'}}>
              <button
                onClick={() => setShowDeleteModal(false)}
                style={{
                  background: '#f3f3f3',
                  color: '#222',
                  border: 'none',
                  borderRadius: 4,
                  padding: '8px 18px',
                  fontSize: 15,
                  cursor: 'pointer'
                }}
                disabled={deleting}
              >Vazgeç</button>
              <button
                onClick={handleDelete}
                style={{
                  background: '#e74c3c',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 4,
                  padding: '8px 18px',
                  fontSize: 15,
                  fontWeight: 600,
                  cursor: 'pointer',
                  opacity: deleting ? 0.7 : 1
                }}
                disabled={deleting}
              >{deleting ? 'Siliniyor...' : 'Evet, Sil'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProductDetailPageWrapper() {
  return (
    <AdminProtectedRoute>
      <AdminNavbar />
      <ProductDetailPage />
    </AdminProtectedRoute>
  );
} 