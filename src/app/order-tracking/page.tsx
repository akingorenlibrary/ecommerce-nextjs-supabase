"use client";
import { useState } from "react";
import { db } from "@/lib/supabase";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import styles from "../my-orders/page.module.css";

export default function OrderTrackingPage() {
  const [orderId, setOrderId] = useState("");
  const [order, setOrder] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setOrder(null); // Reset state before fetch
    setError("");
    if (!orderId.trim()) {
      setError("Lütfen bir sipariş numarası girin.");
      return;
    }
    setLoading(true);
    const { data, error } = await db.orders.getById(orderId.trim());
    if (error || !data) {
      setError("Sipariş bulunamadı. Lütfen numarayı kontrol edin.");
      setOrder(null);
    } else {
      setOrder(data); // Set order only after data is fetched
    }
    setLoading(false);
  };
  

  return (
    <>
      <Navbar />
      <main className={styles.container} style={{minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <div className="container" style={{maxWidth: 500, width: '100%', margin: '0 auto', padding: '32px 0'}}>
          <h1 className={styles.pageTitle} style={{textAlign:'center', marginBottom: 32}}>Sipariş Takip</h1>
          <form onSubmit={handleSearch} className="mb-4">
            <div className="input-group mb-3">
              <input
                type="text"
                className="form-control"
                placeholder="Sipariş Numarası"
                value={orderId}
                onChange={e => setOrderId(e.target.value)}
                style={{fontSize:16, padding: '12px'}}
              />
              <button className={"btn " + styles.btnPrimary} type="submit" disabled={loading} style={{fontSize:16}}>
                {loading ? "Sorgulanıyor..." : "Sorgula"}
              </button>
            </div>
          </form>
          {error && <div className="alert alert-danger text-center">{error}</div>}
          {order && (
            <div style={{background:'#fff', borderRadius:16, boxShadow:'0 4px 24px rgba(44,62,80,0.13)', padding:'32px 20px 28px 20px', marginTop:32, color:'#222', border:'1.5px solid #e9ecef', maxWidth:520, margin:'0 auto'}}>
              <h2 className={styles.modalTitle} style={{fontSize:22, marginBottom:14, letterSpacing:0.01}}>Sipariş {order.id}</h2>
              <div className={styles.modalDate} style={{marginBottom:14, fontWeight:600}}>{order.created_at ? new Date(order.created_at).toLocaleString('tr-TR', { dateStyle: 'short', timeStyle: 'short' }) : ''}</div>
              <div className={styles.modalRow} style={{marginBottom:10}}><b>Durum:</b> <span style={{color:'#222'}}>{order.status}</span></div>
              <div className={styles.modalRow} style={{marginBottom:10}}><b>Müşteri:</b> <span style={{color:'#222'}}>{order.customer_first_name} {order.customer_last_name}</span></div>
              <div className={styles.modalRow + ' ' + styles.addressRow} style={{marginBottom:18}}><b>Adres:</b> <span style={{color:'#222'}}>{order.customer_address}, {order.customer_city} {order.customer_postal_code}</span></div>
              <div className={styles.modalRow} style={{marginBottom:8}}><b>Ürünler:</b></div>
              <ul className={styles.productList}>
                {(order.order_items || []).map((item: any) => (
                  <li key={item.id} className={styles.productListItem} style={{color:'#222'}}>
                    {item.products && item.products.image_url_1 && (
                      <img src={item.products.image_url_1} alt={item.products.name} />
                    )}
                    <span className={styles.productName}>{item.product_name}</span>
                    <span className={styles.productQty}>x{item.quantity}</span>
                    <span className={styles.productPrice}>{(item.product_price ?? 0).toLocaleString('tr-TR')} ₺</span>
                  </li>
                ))}
              </ul>
              <div className={styles.modalRow + ' ' + styles.totalRow} style={{marginTop:18}}><b>Toplam:</b> <span style={{color:'#222'}}>{(order.total_amount ?? 0).toLocaleString('tr-TR')} ₺</span></div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
} 