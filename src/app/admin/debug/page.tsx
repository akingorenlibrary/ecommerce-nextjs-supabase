"use client";
import { useState, useEffect } from "react";
import AdminProtectedRoute from "@/components/AdminProtectedRoute";
import AdminNavbar from "@/components/AdminNavbar";
import { db, supabase } from "@/lib/supabase";
import toast from "react-hot-toast";
import styles from "./page.module.css";

function AdminDebugContent() {
  const [tableStatus, setTableStatus] = useState<any>(null);
  const [productStatus, setProductStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkTables();
    checkProducts();
  }, []);

  const checkTables = async () => {
    try {
      setLoading(true);
      const { exists, error } = await db.orders.checkTablesExist();
      setTableStatus({ exists, error });
      
      // Eğer tablolar varsa, test siparişi oluşturmayı dene
      if (exists) {
        toast.success('Tablolar mevcut! Sipariş sistemi hazır.');
      }
    } catch (error) {
      console.error('Tablo kontrolü hatası:', error);
      setTableStatus({ exists: false, error: 'Kontrol sırasında hata oluştu' });
    } finally {
      setLoading(false);
    }
  };

  const checkProducts = async () => {
    try {
      const { data: products, error } = await supabase
        .from('products')
        .select('id, name, price')
        .limit(5);

      if (error) {
        setProductStatus({ exists: false, error: error.message, count: 0 });
      } else {
        setProductStatus({ 
          exists: true, 
          error: null, 
          count: products?.length || 0,
          products: products || []
        });
      }
    } catch (error) {
      console.error('Ürün kontrolü hatası:', error);
      setProductStatus({ exists: false, error: 'Kontrol sırasında hata oluştu', count: 0 });
    }
  };

    const createTables = async () => {
    try {
      setLoading(true);
      
      // SQL komutlarını çalıştır
      const sqlCommands = [
        `CREATE TABLE IF NOT EXISTS orders (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
          customer_email VARCHAR(255) NOT NULL,
          customer_first_name VARCHAR(100) NOT NULL,
          customer_last_name VARCHAR(100) NOT NULL,
          customer_phone VARCHAR(20) NOT NULL,
          customer_address TEXT NOT NULL,
          customer_city VARCHAR(100) NOT NULL,
          customer_postal_code VARCHAR(20) NOT NULL,
          total_amount DECIMAL(10,2) NOT NULL,
          status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )`,
        `CREATE TABLE IF NOT EXISTS order_items (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
          product_id UUID REFERENCES products(id) ON DELETE SET NULL,
          product_name VARCHAR(255) NOT NULL,
          product_price DECIMAL(10,2) NOT NULL,
          quantity INTEGER NOT NULL CHECK (quantity > 0),
          subtotal DECIMAL(10,2) NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )`
      ];

      // Her SQL komutunu çalıştır
      for (const sql of sqlCommands) {
        const { error } = await supabase.rpc('exec_sql', { sql_query: sql });
        if (error) {
          console.error('SQL çalıştırma hatası:', error);
          toast.error(`Tablo oluşturma hatası: ${error.message}`);
          return;
        }
      }

      toast.success('Tablolar başarıyla oluşturuldu!');
      checkTables(); // Durumu yenile
    } catch (error) {
      console.error('Tablo oluşturma hatası:', error);
      toast.error('Tablo oluşturulurken hata oluştu!');
    } finally {
      setLoading(false);
    }
  };

  const createTestOrder = async () => {
    try {
      setLoading(true);
      
      // Önce mevcut ürünleri kontrol et
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('id, name, price')
        .limit(1);

      if (productsError) {
        console.error('Ürün kontrolü hatası:', productsError);
        toast.error('Ürün kontrolü yapılamadı!');
        return;
      }

      if (!products || products.length === 0) {
        toast.error('Hiç ürün bulunamadı! Önce ürün ekleyin.');
        return;
      }

      const product = products[0];
      
      // Test siparişi oluştur
      const testOrderData = {
        customer_email: 'test@example.com',
        customer_first_name: 'Test',
        customer_last_name: 'Kullanıcı',
        customer_phone: '0555 123 45 67',
        customer_address: 'Test Adres',
        customer_city: 'İstanbul',
        customer_postal_code: '34000',
        total_amount: product.price * 2,
        status: 'pending',
        items: [
          {
            product_id: product.id,
            product_name: product.name,
            product_price: product.price,
            quantity: 2,
            subtotal: product.price * 2
          }
        ]
      };

      console.log('Test siparişi verileri:', testOrderData);

      const { data: order, error } = await db.orders.create(testOrderData);

      if (error) {
        console.error('Test siparişi oluşturma hatası:', error);
        console.error('Hata detayları:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
          fullError: JSON.stringify(error, null, 2)
        });
        toast.error(`Test siparişi oluşturma hatası: ${error.message}`);
        return;
      }

      toast.success(`Test siparişi başarıyla oluşturuldu! Sipariş ID: ${order.id}`);
    } catch (error) {
      console.error('Test siparişi oluşturma hatası:', error);
      toast.error('Test siparişi oluşturulurken hata oluştu!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className="container-fluid">
          <div className={styles.pageHeader}>
            <h1>Veritabanı Debug</h1>
            <p>Sipariş sistemi tablolarının durumunu kontrol edin</p>
          </div>

          <div className="row">
            <div className="col-md-6">
              <div className="card">
                <div className="card-header">
                  <h5>Tablo Durumu</h5>
                </div>
                <div className="card-body">
                  {loading ? (
                    <div className="text-center">
                      <div className="spinner-border" role="status">
                        <span className="visually-hidden">Kontrol ediliyor...</span>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="mb-3">
                        <strong>Durum:</strong> 
                        <span className={`badge ${tableStatus?.exists ? 'bg-success' : 'bg-danger'} ms-2`}>
                          {tableStatus?.exists ? 'Tablolar Mevcut' : 'Tablolar Eksik'}
                        </span>
                      </div>
                      
                      {tableStatus?.error && (
                        <div className="alert alert-warning">
                          <strong>Hata:</strong> {tableStatus.error}
                        </div>
                      )}

                      {!tableStatus?.exists && (
                        <div className="alert alert-info">
                          <strong>Çözüm:</strong> Aşağıdaki butona tıklayarak tabloları oluşturabilirsiniz.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="col-md-6">
              <div className="card">
                <div className="card-header">
                  <h5>Ürün Durumu</h5>
                </div>
                <div className="card-body">
                  <div className="mb-3">
                    <strong>Durum:</strong> 
                    <span className={`badge ${productStatus?.exists ? 'bg-success' : 'bg-warning'} ms-2`}>
                      {productStatus?.exists ? `${productStatus.count} Ürün Mevcut` : 'Ürün Yok'}
                    </span>
                  </div>
                  
                  {productStatus?.error && (
                    <div className="alert alert-warning">
                      <strong>Hata:</strong> {productStatus.error}
                    </div>
                  )}

                  {productStatus?.products && productStatus.products.length > 0 && (
                    <div className="alert alert-info">
                      <strong>Mevcut Ürünler:</strong>
                      <ul className="mb-0 mt-2">
                        {productStatus.products.map((product: any, index: number) => (
                          <li key={index}>
                            {product.name} - ₺{product.price}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {productStatus?.exists && productStatus.count === 0 && (
                    <div className="alert alert-warning">
                      <strong>Uyarı:</strong> Hiç ürün bulunamadı. Test siparişi oluşturmak için önce ürün ekleyin.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

            <div className="col-md-4">
              <div className="card">
                <div className="card-header">
                  <h5>İşlemler</h5>
                </div>
                <div className="card-body">
                  <button 
                    className="btn btn-primary w-100 mb-2"
                    onClick={checkTables}
                    disabled={loading}
                  >
                    Durumu Kontrol Et
                  </button>
                  
                  {!tableStatus?.exists && (
                    <button 
                      className="btn btn-success w-100 mb-2"
                      onClick={createTables}
                      disabled={loading}
                    >
                      Tabloları Oluştur
                    </button>
                  )}

                  {tableStatus?.exists && (
                    <button 
                      className="btn btn-info w-100"
                      onClick={createTestOrder}
                      disabled={loading}
                    >
                      Test Siparişi Oluştur
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="row mt-4">
            <div className="col-12">
              <div className="card">
                <div className="card-header">
                  <h5>Manuel SQL Çalıştırma</h5>
                </div>
                <div className="card-body">
                  <p className="text-muted">
                    Eğer otomatik tablo oluşturma çalışmazsa, aşağıdaki SQL komutlarını 
                    Supabase SQL Editor'da manuel olarak çalıştırabilirsiniz:
                  </p>
                  
                  <div className="bg-light p-3 rounded">
                    <pre className="mb-0">
{`-- Orders tablosu
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_email VARCHAR(255) NOT NULL,
  customer_first_name VARCHAR(100) NOT NULL,
  customer_last_name VARCHAR(100) NOT NULL,
  customer_phone VARCHAR(20) NOT NULL,
  customer_address TEXT NOT NULL,
  customer_city VARCHAR(100) NOT NULL,
  customer_postal_code VARCHAR(20) NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order Items tablosu
CREATE TABLE IF NOT EXISTS order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name VARCHAR(255) NOT NULL,
  product_price DECIMAL(10,2) NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  subtotal DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);`}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminDebug() {
  return (
    <AdminProtectedRoute>
      <AdminNavbar />
      <AdminDebugContent />
    </AdminProtectedRoute>
  );
} 