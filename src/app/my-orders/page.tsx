"use client";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import styles from "./page.module.css";
import { useAuth } from "@/contexts/AuthContext";
import { db, supabase } from "@/lib/supabase";

export default function Siparislerim() {
  const { user } = useAuth();
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) {
        setOrders([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*, products(id, name, slug, image_url_1))')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) {
        setOrders([]);
      } else {
        setOrders(data || []);
      }
      setLoading(false);
    };
    fetchOrders();
  }, [user]);

  if (!user) {
    return (
      <div>
        <Navbar />
        <main className={styles.container}>
          <div className={styles.emptyState}>
            <h2>Giriş yapmalısınız</h2>
            <p>Siparişlerinizi görmek için lütfen giriş yapın.</p>
            <a href="/login" className={styles.shopBtn}>Giriş Yap</a>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const filteredOrders = activeFilter === "all" 
    ? (orders || [])
    : (orders || []).filter(order => order.status === activeFilter);

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending": return { text: "Siparişiniz Alındı", class: styles.statusPending };
      case "confirmed": return { text: "Onaylandı", class: styles.statusConfirmed };
      case "preparing": return { text: "Hazırlanıyor", class: styles.statusPreparing };
      case "shipped": return { text: "Kargoda", class: styles.statusShipped };
      case "delivered": return { text: "Teslim Edildi", class: styles.statusDelivered };
      case "cancelled": return { text: "İptal Edildi", class: styles.statusCancelled };
      default: return { text: status, class: "" };
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "preparing": return "⏳";
      case "shipped": return "🚚";
      case "delivered": return "✅";
      case "cancelled": return "❌";
      default: return "📦";
    }
  };

  return (
    <div>
      <Navbar />
      <div className={styles.container}>
        <div className="container">
          <div className={styles.pageHeader}>
            <h1 className={styles.pageTitle}>Siparişlerim</h1>
            <p className={styles.pageSubtitle}>Geçmiş siparişlerinizi görüntüleyin ve takip edin</p>
          </div>
          <div className={styles.ordersList}>
            {loading ? (
              <div className={styles.emptyState}>Yükleniyor...</div>
            ) : filteredOrders.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>📦</div>
                <h3>Sipariş bulunamadı</h3>
                <p>Bu kategoride henüz bir siparişiniz bulunmuyor.</p>
                <a href="/" className={styles.shopBtn}>Alışverişe Başla</a>
              </div>
            ) : (
              filteredOrders.map(order => (
                <div key={order.id} className={styles.orderCard}>
                  <div className={styles.orderHeader}>
                    <div className={styles.orderInfo}>
                      <div className={styles.orderNumber}>Sipariş {order.id}</div>
                      <div className={styles.orderDate}>{order.created_at ? new Date(order.created_at).toLocaleDateString('tr-TR') : ''}</div>
                    </div>
                    <div className={styles.orderStatus}>
                      <span className={getStatusText(order.status).class}>
                        {getStatusIcon(order.status)} {getStatusText(order.status).text}
                      </span>
                    </div>
                  </div>
                  <div className={styles.orderItems}>
                    {(order.order_items || []).map((item: any) => (
                      <div key={item.id} className={styles.orderItem}>
                        <div className={styles.itemImage}>
                          {item.products && item.products.image_url_1 ? (
                            <img src={item.products.image_url_1} alt={item.products.name} style={{width:'100%',height:'100%',objectFit:'cover',borderRadius:8}} />
                          ) : (
                            <div className={styles.imagePlaceholder}>📷</div>
                          )}
                        </div>
                        <div className={styles.itemInfo}>
                          <h4 className={styles.itemName}>{item.product_name}</h4>
                          <div className={styles.itemDetails}>
                            <span className={styles.itemPrice}>
                              {(item.product_price ?? 0).toLocaleString('tr-TR')} ₺
                            </span>
                            <span className={styles.itemQuantity}>
                              Adet: {item.quantity}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className={styles.orderFooter}>
                    <div className={styles.orderTotal}>
                      <strong>Toplam: {(order.total_amount ?? 0).toLocaleString('tr-TR')} ₺</strong>
                    </div>
                    <div className={styles.orderActions}>
                      {order.tracking_number && (
                        <a 
                          href={`/kargo-takip?tracking=${order.tracking_number}`}
                          className={styles.trackBtn}
                        >
                          🚚 Kargo Takip
                        </a>
                      )}
                      <button className={styles.detailBtn} onClick={() => setSelectedOrder(order)}>
                        Detayları Gör
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        {/* Sipariş Detay Modalı */}
        {selectedOrder && (
          <div className={styles.modal}>
            <div className={styles.modalBox}>
              <button className={styles.closeBtn} onClick={()=>setSelectedOrder(null)}>×</button>
              <h2 className={styles.modalTitle}>Sipariş {selectedOrder.id}</h2>
              <div className={styles.modalDate}>{selectedOrder.created_at ? new Date(selectedOrder.created_at).toLocaleDateString('tr-TR') : ''}</div>
              <div className={styles.modalRow} style={{marginBottom:6}}><b>Ürünler:</b></div>
              <ul className={styles.productList}>
                {(selectedOrder.order_items || []).map((item: any) => (
                  <li key={item.id} className={styles.productListItem}>
                    {item.products && item.products.image_url_1 && (
                      <img src={item.products.image_url_1} alt={item.products.name} />
                    )}
                    <span className={styles.productName}>{item.product_name}</span>
                    <span className={styles.productQty}>x{item.quantity}</span>
                    <span className={styles.productPrice}>{(item.product_price ?? 0).toLocaleString('tr-TR')} ₺</span>
                  </li>
                ))}
              </ul>
              <div className={styles.modalRow}><b>Durum:</b> {getStatusText(selectedOrder.status).text}</div>
              <div className={styles.modalRow + ' ' + styles.addressRow}><b>Adres:</b> {selectedOrder.customer_address}, {selectedOrder.customer_city} {selectedOrder.customer_postal_code}</div>
              <div className={styles.modalRow + ' ' + styles.totalRow}><b>Toplam:</b> {(selectedOrder.total_amount ?? 0).toLocaleString('tr-TR')} ₺</div>
              {selectedOrder.tracking_number && (
                <div style={{marginTop:16}}>
                  <a href={`/kargo-takip?tracking=${selectedOrder.tracking_number}`} style={{color:'#007bff',textDecoration:'underline'}}>Kargo Takip</a>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
