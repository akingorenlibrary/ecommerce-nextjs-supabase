"use client";
import { useEffect, useState } from "react";
import styles from "./page.module.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { db } from "@/lib/supabase";

interface Product {
  id: string;
  name: string;
  price: number;
  image_url_1?: string;
  category_id: string;
  categories?: { slug: string };
}

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    require("bootstrap/dist/js/bootstrap.bundle.min.js");
    loadFeaturedProducts();
  }, []);

  const loadFeaturedProducts = async () => {
    setLoading(true);
    const { data, error } = await db.products.getFeatured();
    if (!error) setFeaturedProducts(data || []);
    setLoading(false);
  };

  return (
    <div>
      {/* Navigation Bar */}
      <Navbar />

      {/* Hero Section */}
      <section className={styles.hero}>
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <div className={styles.heroContent}>
                <h1 className={styles.heroTitle}>
                  Evinizi Hayalinizdeki Gibi Dekore Edin
                </h1>
                <p className={styles.heroSubtitle}>
                  Kaliteli mobilyalar ve dekorasyon ürünleri ile evinizi baştan yaratın. 
                  Modern tasarımlar, uygun fiyatlar ve hızlı teslimat garantisi.
                </p>
                <div className={styles.heroButtons}>
                  <button className="btn btn-dark btn-lg">
                    Ürünleri Keşfet
                  </button>
                </div>
                <div className={styles.heroStats}>
                  <div className={styles.stat}>
                    <h3>24/7</h3>
                    <p>Müşteri Desteği</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Products Section */}
      <section className={styles.popularProducts}>
        <div className="container">
          <div className="row">
            <div className="col-12">
              <h2 className={styles.sectionTitle}>Öne Çıkan Ürünler</h2>
              <p className={styles.sectionSubtitle}>En çok tercih edilen mobilya ve dekorasyon ürünlerimiz</p>
            </div>
          </div>
          <div className="row g-4">
            {loading ? (
              <div className="col-12 text-center py-5">Yükleniyor...</div>
            ) : featuredProducts.length === 0 ? (
              <div className={`col-12 text-center py-5 ${styles.featuredEmpty}`}>Öne çıkan ürün bulunamadı.</div>
            ) : (
              featuredProducts.slice(0, 4).map((product) => (
                <div className="col-lg-3 col-md-6" key={product.id}>
                  <div className={styles.productCard}>
                    <div className={styles.productImage}>
                      {product.image_url_1 ? (
                        <img src={product.image_url_1} alt={product.name} style={{width:'100%',height:180,objectFit:'cover',borderRadius:8}} />
                      ) : (
                        <div className={styles.productIcon}>🛋️</div>
                      )}
                    </div>
                    <div className={styles.productInfo}>
                      <h3 className={styles.productName}>{product.name}</h3>
                      <div className={styles.productPrice}>
                        <span className={styles.newPrice}>{product.price?.toLocaleString('tr-TR')} ₺</span>
                      </div>
                      <button className="btn btn-dark w-100 mt-3" onClick={() => window.location.href = `/products/${product.categories?.slug || product.category_id}/${product.id}`}>İncele</button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="row mt-5">
            <div className="col-12 text-center">
               {/* Tüm Ürünleri Görüntüle butonu kaldırıldı */}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
