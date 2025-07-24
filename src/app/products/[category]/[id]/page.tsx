"use client";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCart } from "@/contexts/CartContext";
import { db } from "@/lib/supabase";
import styles from "./page.module.css";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  original_price?: number;
  stock: number;
  image_url_1?: string;
  image_url_2?: string;
  image_url_3?: string;
  category_id: string;
  subcategory_id: string;
  is_active: boolean;
  created_at: string;
  category?: {
    id: string;
    name: string;
    slug: string;
  };
  subcategory?: {
    id: string;
    name: string;
    slug: string;
  };
}

export default function ProductDetail() {
  const params = useParams();
  const router = useRouter();
  const { addToCart } = useCart();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const productId = params.id as string;
  const categorySlug = params.category as string;

  useEffect(() => {
    loadProduct();
  }, [productId]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      setError("");

      const { data: productData, error: productError } = await db.products.getById(productId);
      
      if (productError) {
        console.error('Ürün yüklenirken hata:', productError);
        setError('Ürün yüklenirken hata oluştu.');
        return;
      }

      if (!productData) {
        setError('Ürün bulunamadı.');
        return;
      }

      console.log('Loaded product:', productData);
      console.log('Category info:', productData?.category);
      console.log('Category name:', productData?.category?.name);
      setProduct(productData);

    } catch (error) {
      console.error('Veri yüklenirken hata:', error);
      setError('Veri yüklenirken hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (product) {
      addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        image_url_1: product.image_url_1
      }, quantity);
      toast.success(`${product.name} sepete eklendi! (${quantity} adet)`);
    }
  };

  const handleImageClick = (index: number) => {
    setSelectedImageIndex(index);
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className={styles.container}>
          <div className="container">
            <div className={styles.loading}>
              <h1>Yükleniyor...</h1>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error || !product) {
    return (
      <>
        <Navbar />
        <div className={styles.container}>
          <div className="container">
            <div className={styles.notFound}>
              <h1>Ürün Bulunamadı</h1>
              <p>{error || 'Aradığınız ürün mevcut değil.'}</p>
              <button onClick={() => router.back()} className={styles.backBtn}>
                Geri Dön
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  // Ürün resimleri (3 resim)
  const productImages = [
    product.image_url_1,
    product.image_url_2,
    product.image_url_3
  ].filter(url => url && url.trim() !== '');

  return (
    <div>
      <Navbar />
      
      <div className={styles.container}>
        <div className="container">
          {/* Breadcrumb */}
          <div className={styles.breadcrumb}>
            <span onClick={() => router.push('/')} className={styles.breadcrumbLink}>Ana Sayfa</span>
            <span className={styles.separator}>{'>'}</span>
            <span onClick={() => router.push(`/products/${categorySlug}`)} className={styles.breadcrumbLink}>
              {categorySlug === 'yatak-odasi' ? 'Yatak Odası' : 
               categorySlug === 'salon' ? 'Salon' :
               categorySlug === 'mutfak' ? 'Mutfak' :
               categorySlug === 'banyo' ? 'Banyo' :
               product.category?.name || 'Kategori'}
            </span>
            {product.subcategory && product.subcategory.name !== product.name && (
              <>
                <span className={styles.separator}>{'>'}</span>
                <span className={styles.breadcrumbLink}>
                  {product.subcategory.name}
                </span>
              </>
            )}
            <span className={styles.separator}>{'>'}</span>
            <span className={styles.current}>{product.name}</span>
          </div>

          <div className={styles.productDetail}>
            {/* Product Images */}
            <div className={styles.imageSection}>
              <div className={styles.mainImage}>
                {productImages.length > 0 ? (
                <img 
                    src={productImages[selectedImageIndex]} 
                  alt={product.name}
                  className={styles.productImage}
                />
                ) : (
                  <div className={styles.noImage}>Resim Yok</div>
                )}
              </div>
              
              {productImages.length > 1 && (
                <div className={styles.thumbnails}>
                  {productImages.map((img, index) => (
                    <img
                      key={index}
                      src={img}
                      alt={`${product.name} ${index + 1}`}
                      className={`${styles.thumbnail} ${index === selectedImageIndex ? styles.activeThumbnail : ''}`}
                      onClick={() => handleImageClick(index)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className={styles.infoSection}>
              <h1 className={styles.productName}>{product.name}</h1>
              
              <div className={styles.categoryInfo}>
                <span className={styles.categoryLabel}>Kategori:</span>
                <span className={styles.categoryValue}>
                  {categorySlug === 'yatak-odasi' ? 'Yatak Odası' : 
                   categorySlug === 'salon' ? 'Salon' :
                   categorySlug === 'mutfak' ? 'Mutfak' :
                   categorySlug === 'banyo' ? 'Banyo' :
                   product.category?.name || 'Kategori'} {product.subcategory && `> ${product.subcategory.name}`}
                </span>
              </div>
              


              <div className={styles.priceSection}>
                <span className={styles.currentPrice}>
                  {product.price.toLocaleString('tr-TR')} ₺
                </span>
                {product.original_price && product.original_price > product.price && (
                  <span className={styles.originalPrice}>
                    {product.original_price.toLocaleString('tr-TR')} ₺
                  </span>
                )}
              </div>

              <div className={styles.stockStatus}>
                {product.stock > 0 ? (
                  <span className={styles.inStock}>✓ Stokta mevcut ({product.stock} adet)</span>
                ) : (
                  <span className={styles.outOfStock}>⚠ Stokta yok</span>
                )}
              </div>

              <p className={styles.description}>{product.description}</p>

              <div className={styles.purchaseSection}>
                <div className={styles.quantitySelector}>
                  <label>Adet:</label>
                  <div className={styles.quantityControls}>
                    <button 
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className={styles.quantityBtn}
                      disabled={product.stock === 0}
                    >
                      -
                    </button>
                    <span className={styles.quantity}>{quantity}</span>
                    <button 
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      className={styles.quantityBtn}
                      disabled={product.stock === 0}
                    >
                      +
                    </button>
                  </div>
                </div>

                <button 
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className={styles.addToCartBtn}
                >
                  {product.stock > 0 ? 'Sepete Ekle' : 'Stokta Yok'}
                </button>
              </div>
            </div>
          </div>

          {/* Product Specifications */}
          <div className={styles.specifications}>
            <h2>Ürün Bilgileri</h2>
            <div className={styles.specsGrid}>
              <div className={styles.specItem}>
                <span className={styles.specLabel}>Ürün Adı:</span>
                <span className={styles.specValue}>{product.name}</span>
                </div>
              <div className={styles.specItem}>
                <span className={styles.specLabel}>Kategori:</span>
                <span className={styles.specValue}>
                  {categorySlug === 'yatak-odasi' ? 'Yatak Odası' : 
                   categorySlug === 'salon' ? 'Salon' :
                   categorySlug === 'mutfak' ? 'Mutfak' :
                   categorySlug === 'banyo' ? 'Banyo' :
                   product.category?.name || 'Kategori'}
                </span>
              </div>
              {product.subcategory && (
                <div className={styles.specItem}>
                  <span className={styles.specLabel}>Alt Kategori:</span>
                  <span className={styles.specValue}>{product.subcategory.name}</span>
                </div>
              )}
              <div className={styles.specItem}>
                <span className={styles.specLabel}>Fiyat:</span>
                <span className={styles.specValue}>{product.price.toLocaleString('tr-TR')} ₺</span>
              </div>
              {product.original_price && product.original_price > product.price && (
                <div className={styles.specItem}>
                  <span className={styles.specLabel}>Orijinal Fiyat:</span>
                  <span className={styles.specValue}>{product.original_price.toLocaleString('tr-TR')} ₺</span>
                </div>
              )}
              <div className={styles.specItem}>
                <span className={styles.specLabel}>Stok Durumu:</span>
                <span className={styles.specValue}>{product.stock > 0 ? `${product.stock} adet` : 'Stokta yok'}</span>
              </div>
              <div className={styles.specItem}>
                <span className={styles.specLabel}>Ürün Kodu:</span>
                <span className={styles.specValue}>{product.id}</span>
              </div>
              <div className={styles.specItem}>
                <span className={styles.specLabel}>Eklenme Tarihi:</span>
                <span className={styles.specValue}>
                  {new Date(product.created_at).toLocaleDateString('tr-TR')}
                </span>
              </div>
            </div>
          </div>

          {/* Product Description */}
          <div className={styles.descriptionSection}>
            <h2>Ürün Açıklaması</h2>
            <div className={styles.descriptionContent}>
              <p>{product.description}</p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
} 