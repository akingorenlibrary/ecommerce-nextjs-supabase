"use client";
import { useState, useEffect } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import { db } from "@/lib/supabase";
import styles from "./page.module.css";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  image_url_1?: string;
  image_url_2?: string;
  image_url_3?: string;
  category_id: string;
  subcategory_id: string;
  is_active: boolean;
  created_at: string;
  category?: {
    name: string;
    slug: string;
  };
  subcategory?: {
    name: string;
    slug: string;
  };
}

interface Category {
  id: string;
  name: string;
  slug: string;
  subcategories: Subcategory[];
}

interface Subcategory {
  id: string;
  name: string;
  slug: string;
  category_id: string;
}

export default function ProductsPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const categorySlug = params.category as string;
  
  const [sortBy, setSortBy] = useState("name");
  const [filterBy, setFilterBy] = useState("all");
  const [products, setProducts] = useState<Product[]>([]);
  const [categoryData, setCategoryData] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Check for filter parameter in URL
  useEffect(() => {
    const filterParam = searchParams.get('filter');
    console.log('URL filter param:', filterParam);
    if (filterParam) {
      setFilterBy(filterParam);
    }
  }, [searchParams]);

  // Load category and products data
  useEffect(() => {
    loadCategoryAndProducts();
  }, [categorySlug, filterBy]);

  const loadCategoryAndProducts = async () => {
    try {
      setLoading(true);
      setError("");

      // Load category with subcategories
      const { data: categories, error: categoryError } = await db.categories.getAllWithSubcategories();
      
      if (categoryError) {
        console.error('Kategori yüklenirken hata:', categoryError);
        setError('Kategori yüklenirken hata oluştu.');
        return;
      }

      const currentCategory = categories?.find(cat => cat.slug === categorySlug);
      
      if (!currentCategory) {
        setError('Kategori bulunamadı.');
        return;
      }

      setCategoryData(currentCategory);

      // Load products for this category with subcategory filter if specified
      const { data: productsData, error: productsError } = await db.products.getByCategory(
        currentCategory.id, 
        filterBy !== "all" ? filterBy : undefined
      );
      
      if (productsError) {
        console.error('Ürünler yüklenirken hata:', productsError);
        setError('Ürünler yüklenirken hata oluştu.');
        return;
      }

      console.log('Loaded products with filter:', filterBy, productsData);
      setProducts(productsData || []);

    } catch (error) {
      console.error('Veri yüklenirken hata:', error);
      setError('Veri yüklenirken hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  // Sort products
  const sortedProducts = [...products].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return a.price - b.price;
      case "price-high":
        return b.price - a.price;
      case "name":
      default:
        return a.name.localeCompare(b.name);
    }
  });

  // Dynamic page title based on filter
  const getPageTitle = () => {
    if (filterBy !== "all" && categoryData) {
      const subcategory = categoryData.subcategories.find(sub => sub.slug === filterBy);
      return subcategory?.name || categoryData.name;
    }
    return categoryData?.name || "Ürünler";
  };

  // Handle product click to navigate to detail page
  const handleProductClick = (productId: string) => {
    router.push(`/products/${categorySlug}/${productId}`);
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className={styles.container}>
          <div className="container">
            <div className={styles.pageHeader}>
              <h1 className={styles.pageTitle}>Yükleniyor...</h1>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error || !categoryData) {
    return (
      <>
        <Navbar />
        <div className={styles.container}>
          <div className="container">
            <div className={styles.pageHeader}>
              <h1 className={styles.pageTitle}>Hata</h1>
              <p className={styles.pageSubtitle}>{error || 'Kategori bulunamadı'}</p>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      
      <div className={styles.container}>
        <div className="container">
          {/* Simple title */}
          <div className={styles.pageHeader}>
            <h1 className={styles.pageTitle}>{getPageTitle()}</h1>
            {filterBy !== "all" && (
              <p className={styles.pageSubtitle}>
                {categoryData.name} kategorisinde
              </p>
            )}
          </div>

          {/* Filter bar */}
          <div className={styles.filterBar}>
            <div className={styles.filterGroup}>
              <select 
                value={filterBy} 
                onChange={(e) => setFilterBy(e.target.value)}
                className={styles.select}
              >
                <option value="all">Tüm Ürünler</option>
                {categoryData.subcategories.map((subcategory) => (
                  <option key={subcategory.id} value={subcategory.slug}>
                    {subcategory.name}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.filterGroup}>
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                className={styles.select}
              >
                <option value="name">İsim (A-Z)</option>
                <option value="price-low">Fiyat (Düşük-Yüksek)</option>
                <option value="price-high">Fiyat (Yüksek-Düşük)</option>
              </select>
            </div>

            <div className={styles.resultCount}>
              {sortedProducts.length} ürün
            </div>
          </div>

          {/* Products Grid */}
          <div className={styles.productsGrid}>
            {sortedProducts.length > 0 ? (
              sortedProducts.map((product) => (
                <div 
                  key={product.id} 
                  className={styles.productCard}
                  onClick={() => handleProductClick(product.id)}
                >
                  <div className={styles.productImage}>
                    {product.image_url_1 ? (
                      <img src={product.image_url_1} alt={product.name} />
                    ) : (
                      <div className={styles.noImage}>Resim Yok</div>
                    )}
                  </div>
                  
                  <div className={styles.productInfo}>
                    <h3 className={styles.productName}>{product.name}</h3>
                    
                    <p className={styles.productDescription}>
                      {product.description.length > 100 
                        ? `${product.description.substring(0, 100)}...` 
                        : product.description
                      }
                    </p>
                    
                    <div className={styles.priceSection}>
                      <span className={styles.currentPrice}>
                        {product.price.toLocaleString('tr-TR')} ₺
                      </span>
                    </div>
                    
                    <div className={styles.stockInfo}>
                      Stok: {product.stock} adet
                    </div>
                    
                    <button 
                      className={styles.inspectBtn}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleProductClick(product.id);
                      }}
                    >
                      İncele
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className={styles.noProducts}>
                <p>Bu kategoride henüz ürün bulunmuyor.</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <Footer />
    </>
  );
} 