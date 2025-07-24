'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/supabase';
import AdminNavbar from '@/components/AdminNavbar';
import AdminProtectedRoute from '@/components/AdminProtectedRoute';
import styles from './page.module.css';
import toast from 'react-hot-toast';

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  is_active: boolean;
  subcategories?: Subcategory[];
}

interface Subcategory {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  description?: string;
  is_active: boolean;
}

function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'category' | 'subcategory'>('category');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'category' | 'subcategory'; id: string } | null>(null);
  const [modalMessage, setModalMessage] = useState<string | null>(null);

  // Form states
  const [categoryData, setCategoryData] = useState({
    name: '',
    description: ''
  });

  const [subcategoryData, setSubcategoryData] = useState({
    categoryId: '',
    name: '',
    description: ''
  });

  // Kategorileri yükle
  const loadCategories = async () => {
    try {
      const { data, error } = await db.categories.getAllWithSubcategories();
      if (error) {
        console.error('Kategoriler yüklenirken hata:', error);
      return;
    }
      setCategories(data || []);
    } catch (error) {
      console.error('Kategoriler yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  // Slug oluştur
  const createSlug = (text: string): string => {
    return text
      .toLowerCase()
      .replace(/ğ/g, 'g')
      .replace(/ü/g, 'u')
      .replace(/ş/g, 's')
      .replace(/ı/g, 'i')
      .replace(/ö/g, 'o')
      .replace(/ç/g, 'c')
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .trim();
  };

  // Kategori ekle
  const handleAddCategory = () => {
    setModalType('category');
    setCategoryData({ name: '', description: '' });
    setShowModal(true);
  };

  // Alt kategori ekle
  const handleAddSubcategory = (categoryId: string) => {
    setModalType('subcategory');
    setSubcategoryData({ categoryId, name: '', description: '' });
    setShowModal(true);
  };

  // Form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (modalType === 'category') {
        if (!categoryData.name.trim()) {
          setModalMessage('Kategori adı zorunludur!');
          return;
        }
        const slug = createSlug(categoryData.name);
        const { error: createError } = await db.categories.create({
          name: categoryData.name,
          description: categoryData.description || undefined,
          slug: slug
        });

        if (createError) {
          toast.error('Kategori oluşturulurken hata: ' + (createError.message || JSON.stringify(createError)));
          return;
        }
        toast.success('Kategori başarıyla eklendi!');
      } else {
        if (!subcategoryData.name.trim()) {
          setModalMessage('Alt kategori adı zorunludur!');
          return;
        }
        const slug = createSlug(subcategoryData.name);
        const { error: createError } = await db.subcategories.create({
          category_id: subcategoryData.categoryId,
          name: subcategoryData.name,
          description: subcategoryData.description || undefined,
          slug: slug
        });

        if (createError) {
          toast.error('Alt kategori oluşturulurken hata: ' + (createError.message || JSON.stringify(createError)));
          return;
        }
        toast.success('Alt kategori başarıyla eklendi!');
      }

      setShowModal(false);
      loadCategories();
    } catch (error) {
      toast.error('İşlem sırasında beklenmeyen bir hata oluştu!');
    }
  };

  // Kategori sil
  const handleDeleteCategory = (id: string) => {
    setDeleteTarget({ type: 'category', id });
    setShowDeleteModal(true);
  };

  // Alt kategori sil (modal ile)
  const handleDeleteSubcategory = (id: string) => {
    setDeleteTarget({ type: 'subcategory', id });
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setShowDeleteModal(false);
    try {
      if (deleteTarget.type === 'category') {
        const { error } = await db.categories.delete(deleteTarget.id);
        if (error) {
          toast.error('Kategori silinirken hata: ' + (error.message || 'Bilinmeyen hata'));
          return;
        }
        toast.success('Kategori başarıyla silindi!');
      } else {
        const { error } = await db.subcategories.delete(deleteTarget.id);
        if (error) {
          toast.error('Alt kategori silinirken hata: ' + (error.message || 'Bilinmeyen hata'));
          return;
        }
        toast.success('Alt kategori başarıyla silindi!');
      }
      loadCategories();
    } catch (error) {
      toast.error('Silme işlemi sırasında beklenmeyen bir hata oluştu!');
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Kategoriler yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
        
        <div className={styles.main}>
          <div className={styles.header}>
            <h1>Kategoriler</h1>
            <button onClick={handleAddCategory} className={styles.addBtn}>
              + Kategori Ekle
            </button>
          </div>

          <div className={styles.categoriesList}>
            {categories.length > 0 ? (
              categories.map((category) => (
                <div key={category.id} className={styles.categoryCard}>
                  <div className={styles.categoryHeader}>
                    <h3>{category.name}</h3>
                    <div className={styles.categoryActions}>
                      <button 
                        onClick={() => handleAddSubcategory(category.id)}
                        className={styles.addSubBtn}
                      >
                        + Alt Kategori
                      </button>
                      <button 
                        onClick={() => handleDeleteCategory(category.id)}
                        className={styles.deleteBtn}
                      >
                        Sil
                      </button>
        </div>
      </div>

                  {category.description && (
                    <p className={styles.description}>{category.description}</p>
                  )}

                  <div className={styles.subcategories}>
                    <h4>Alt Kategoriler</h4>
                    {category.subcategories && category.subcategories.length > 0 ? (
                      <div className={styles.subcategoryList}>
                        {category.subcategories.map((sub) => (
                          <div key={sub.id} className={styles.subcategoryItem}>
                            <span>{sub.name}</span>
                            <button 
                              onClick={() => handleDeleteSubcategory(sub.id)}
                              className={styles.deleteSubBtn}
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className={styles.empty}>Alt kategori yok</p>
                    )}
            </div>
              </div>
              ))
            ) : (
              <div className={styles.emptyState}>
                <p>Henüz hiçbir kategori eklenmemiş.</p>
                <p>İlk kategorinizi eklemek için yukarıdaki "Kategori Ekle" butonunu kullanın.</p>
              </div>
            )}
          </div>
        </div>

        {/* Modal */}
        {showModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
                <h2>
                  {modalType === 'category' ? 'Yeni Kategori' : 'Yeni Alt Kategori'}
                </h2>
                <button 
                  onClick={() => setShowModal(false)}
                  className={styles.closeBtn}
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formGroup}>
                  <label>Ad</label>
                <input
                  type="text"
                    value={modalType === 'category' ? categoryData.name : subcategoryData.name}
                    onChange={(e) => {
                      if (modalType === 'category') {
                        setCategoryData(prev => ({ ...prev, name: e.target.value }));
                      } else {
                        setSubcategoryData(prev => ({ ...prev, name: e.target.value }));
                      }
                    }}
                    className={styles.input}
                  required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Açıklama</label>
                  <input
                    type="text"
                    value={modalType === 'category' ? categoryData.description : subcategoryData.description}
                    onChange={(e) => {
                      if (modalType === 'category') {
                        setCategoryData(prev => ({ ...prev, description: e.target.value }));
                      } else {
                        setSubcategoryData(prev => ({ ...prev, description: e.target.value }));
                      }
                    }}
                  className={styles.input}
                />
              </div>

              <div className={styles.formActions}>
                  <button 
                    type="button" 
                    onClick={() => setShowModal(false)}
                    className={styles.cancelBtn}
                  >
                  İptal
                </button>
                <button type="submit" className={styles.submitBtn}>
                  Ekle
                </button>
              </div>
              {modalMessage && (
                <div style={{ color: '#c0392b', marginTop: 10, fontWeight: 500, textAlign: 'center' }}>{modalMessage}</div>
              )}
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2>Silme Onayı</h2>
            </div>
            <div style={{ margin: '18px 0', color: '#333', fontSize: 16 }}>
              {deleteTarget?.type === 'category'
                ? 'Bu kategoriyi silmek istediğinize emin misiniz?'
                : 'Bu alt kategoriyi silmek istediğinize emin misiniz?'}
            </div>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
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
              >Vazgeç</button>
              <button
                onClick={confirmDelete}
                style={{
                  background: '#e74c3c',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 4,
                  padding: '8px 18px',
                  fontSize: 15,
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >Evet, Sil</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CategoriesPageWrapper() {
  return (
    <AdminProtectedRoute>
       <AdminNavbar />
      <CategoriesPage />
    </AdminProtectedRoute>
  );
} 