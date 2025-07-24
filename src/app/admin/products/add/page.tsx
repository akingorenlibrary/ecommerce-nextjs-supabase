'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { db, supabase } from '@/lib/supabase';
import AdminNavbar from '@/components/AdminNavbar';
import AdminProtectedRoute from '@/components/AdminProtectedRoute';
import styles from './page.module.css';
import toast from 'react-hot-toast';

interface Category {
  id: string;
  name: string;
  subcategories?: Subcategory[];
}

interface Subcategory {
  id: string;  
  name: string;
}

interface ProductFormData {
  name: string;
  description: string;
  price: string;
  stock: string;
  category_id: string;
  subcategory_id: string;
  is_featured: boolean;
}

function AddProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [imageFile1, setImageFile1] = useState<File | null>(null);
  const [imageFile2, setImageFile2] = useState<File | null>(null);
  const [imageFile3, setImageFile3] = useState<File | null>(null);

  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    price: '',
    stock: '',
    category_id: '',
    subcategory_id: '',
    is_featured: false
  });

  useEffect(() => {
    loadCategories();
  }, []);

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
    }
  };

  const handleCategoryChange = (categoryId: string) => {
    setFormData(prev => ({ ...prev, category_id: categoryId, subcategory_id: '' }));
    
    if (categoryId) {
      const category = categories.find(cat => cat.id === categoryId);
      setSubcategories(category?.subcategories || []);
    } else {
      setSubcategories([]);
    }
  };

  const handleImageChange1 = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
        toast.error('Sadece JPG, JPEG ve PNG formatları kabul edilir!');
        e.target.value = '';
        return;
      }
      setImageFile1(file);
    }
  };

  const handleImageChange2 = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
        toast.error('Sadece JPG, JPEG ve PNG formatları kabul edilir!');
        e.target.value = '';
        return;
      }
      setImageFile2(file);
    }
  };

  const handleImageChange3 = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
        toast.error('Sadece JPG, JPEG ve PNG formatları kabul edilir!');
        e.target.value = '';
        return;
      }
      setImageFile3(file);
    }
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `products/${fileName}`;

      console.log('Resim yükleniyor:', { filePath, fileSize: file.size });

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Resim yükleme hatası:', uploadError);
        toast.error(`Resim yükleme hatası: ${uploadError.message}`);
        return null;
      }

      console.log('Resim başarıyla yüklendi');

      const { data } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error('Resim yükleme hatası:', error);
      toast.error(`Resim yükleme hatası: ${error}`);
      return null;
    }
  };

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Form validasyonu
    if (!formData.name.trim()) {
      toast.error('Ürün adı zorunludur!');
      return;
    }
    
    if (!formData.category_id) {
      toast.error('Kategori seçimi zorunludur!');
      return;
    }
    
    if (!formData.subcategory_id) {
      toast.error('Alt kategori seçimi zorunludur!');
      return;
    }
    
    if (!formData.price || Number(formData.price) <= 0) {
      toast.error('Geçerli bir satış fiyatı girmelisiniz!');
      return;
    }


    
    if (!formData.stock || Number(formData.stock) < 0) {
      toast.error('Geçerli bir stok adedi girmelisiniz!');
      return;
    }
    
    if (!imageFile1) {
      toast.error('En az bir ürün fotoğrafı seçmelisiniz!');
      return;
    }

    setLoading(true);

    try {
      // Resimleri yükleme
      const uploadedUrls: string[] = [];
      
      // İlk resim (zorunlu)
      if (imageFile1) {
        const uploadedUrl = await uploadImage(imageFile1);
        if (uploadedUrl) {
          uploadedUrls.push(uploadedUrl);
        }
      }
      
      // İkinci resim (opsiyonel)
      if (imageFile2) {
        const uploadedUrl = await uploadImage(imageFile2);
        if (uploadedUrl) {
          uploadedUrls.push(uploadedUrl);
        }
      }
      
      // Üçüncü resim (opsiyonel)
      if (imageFile3) {
        const uploadedUrl = await uploadImage(imageFile3);
        if (uploadedUrl) {
          uploadedUrls.push(uploadedUrl);
        }
      }

      if (uploadedUrls.length === 0) {
        toast.error('Resim yüklenirken hata oluştu!');
        setLoading(false);
        return;
      }

      const slug = createSlug(formData.name);

      const { error } = await db.products.create({
        name: formData.name.trim(),
        slug: slug,
        description: formData.description.trim() || undefined,
        price: Number(formData.price),
        stock: Number(formData.stock),
        image_url_1: uploadedUrls[0], // İlk resim
        image_url_2: uploadedUrls[1] || undefined, // İkinci resim
        image_url_3: uploadedUrls[2] || undefined, // Üçüncü resim
        category_id: formData.category_id,
        subcategory_id: formData.subcategory_id,
        is_featured: formData.is_featured
      });

      if (error) {
        console.error('Ürün oluşturulurken hata:', error);
        toast.error(`Ürün oluşturulurken hata: ${error.message}`);
        return;
      }

      toast.success('Ürün başarıyla eklendi!');
      router.push('/admin/products');
    } catch (error) {
      console.error('İşlem sırasında hata:', error);
      toast.error('Ürün eklenirken bir hata oluştu!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Yeni Ürün Ekle</h1>
        <button 
          onClick={() => router.push('/admin/products')}
          className={styles.backBtn}
        >
          ← Geri
        </button>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label>Ürün Adı *</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            required
            className={styles.input}
          />
        </div>

        <div className={styles.formGroup}>
          <label>Kategori *</label>
          <select
            value={formData.category_id}
            onChange={(e) => handleCategoryChange(e.target.value)}
            required
            className={styles.select}
          >
            <option value="">Kategori Seçin</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.formGroup}>
          <label>Alt Kategori *</label>
          <select
            value={formData.subcategory_id}
            onChange={(e) => setFormData(prev => ({ ...prev, subcategory_id: e.target.value }))}
            required
            className={styles.select}
            disabled={!formData.category_id}
          >
            <option value="">Alt Kategori Seçin</option>
            {subcategories.map((subcategory) => (
              <option key={subcategory.id} value={subcategory.id}>
                {subcategory.name}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.formGroup}>
          <label>Satış Fiyatı (₺) *</label>
          <input
            type="number"
            value={formData.price}
            onChange={e => {
              setFormData(prev => ({
                ...prev,
                price: e.target.value
              }));
            }}
            required
            min="0"
            step="1"
            className={styles.input}
            placeholder="0"
          />
        </div>





        <div className={styles.formGroup}>
          <label>Stok Adedi *</label>
          <input
            type="number"
            value={formData.stock}
            onChange={e => {
              setFormData(prev => ({
                ...prev,
                stock: e.target.value
              }));
            }}
            required
            min="0"
            step="1"
            className={styles.input}
          />
        </div>

        <div className={styles.formGroup}>
          <label>Açıklama</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            rows={4}
            className={styles.textarea}
          />
        </div>

        <div className={styles.formGroup}>
          <label>
            <input
              type="checkbox"
              className={styles.checkbox}
              checked={formData.is_featured}
              onChange={e => setFormData(prev => ({ ...prev, is_featured: e.target.checked }))}
            />
            Öne Çıkan Ürün
          </label>
        </div>

        <div className={styles.formGroup}>
          <label>Resim 1 (Ana Resim) - Sadece JPG ve PNG *</label>
          <input
            type="file"
            accept=".jpg,.jpeg,.png"
            onChange={handleImageChange1}
            className={styles.fileInput}
            required
          />
          {imageFile1 && (
            <p style={{ fontSize: '12px', color: '#28a745', marginTop: '5px' }}>
              ✓ {imageFile1.name} seçildi
            </p>
          )}
        </div>

        <div className={styles.formGroup}>
          <label>Resim 2 (Opsiyonel) - Sadece JPG ve PNG</label>
          <input
            type="file"
            accept=".jpg,.jpeg,.png"
            onChange={handleImageChange2}
            className={styles.fileInput}
          />
          {imageFile2 && (
            <p style={{ fontSize: '12px', color: '#28a745', marginTop: '5px' }}>
              ✓ {imageFile2.name} seçildi
            </p>
          )}
        </div>

        <div className={styles.formGroup}>
          <label>Resim 3 (Opsiyonel) - Sadece JPG ve PNG</label>
          <input
            type="file"
            accept=".jpg,.jpeg,.png"
            onChange={handleImageChange3}
            className={styles.fileInput}
          />
          {imageFile3 && (
            <p style={{ fontSize: '12px', color: '#28a745', marginTop: '5px' }}>
              ✓ {imageFile3.name} seçildi
            </p>
          )}
        </div>

        <p style={{ fontSize: '11px', color: '#6c757d', marginTop: '5px' }}>
          Sadece JPG, JPEG ve PNG formatları kabul edilir. <strong>En az 1 resim zorunludur.</strong>
        </p>



        <div className={styles.actions}>
          <button 
            type="button" 
            onClick={() => router.push('/admin/products')}
            className={styles.cancelBtn}
          >
            İptal
          </button>
          <button 
            type="submit" 
            className={styles.submitBtn}
            disabled={loading}
          >
            {loading ? 'Ekleniyor...' : 'Ekle'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function AddProductPageWrapper() {
  return (
    <AdminProtectedRoute>
      <AdminNavbar />
      <AddProductPage />
    </AdminProtectedRoute>
  );
} 