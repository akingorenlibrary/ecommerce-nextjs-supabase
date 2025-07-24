"use client";
import { useState, useEffect } from "react";
import AdminProtectedRoute from "@/components/AdminProtectedRoute";
import AdminNavbar from "@/components/AdminNavbar";
import { db, supabase, createSupabaseClientWithToken } from "@/lib/supabase";
import toast from "react-hot-toast";
import styles from "./page.module.css";
import { useAuth } from "@/contexts/AuthContext";

function AdminOrdersContent() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [searchId, setSearchId] = useState("");
  const [searchName, setSearchName] = useState("");
  const [searchEmail, setSearchEmail] = useState("");
  const [searchStatus, setSearchStatus] = useState("");
  const [searchDate, setSearchDate] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      let customClient = undefined;
      if (user && user.id && user?.identities?.[0]?.identity_data?.sub) {
        // Eğer user'ın access_token'ı varsa kullan
        const session = await supabase.auth.getSession();
        const accessToken = session.data.session?.access_token;
        if (accessToken) {
          customClient = createSupabaseClientWithToken(accessToken);
        }
      }
      const { data, error } = await db.orders.getAll(customClient);
      console.log("data: ",data);
      console.log("error: ",error);
      if (error) {
        console.error('Siparişler yüklenirken hata:', error);
        toast.error('Siparişler yüklenirken hata oluştu!');
        return;
      }

      setOrders(data || []);
    } catch (error) {
      console.error('Siparişler yüklenirken hata:', error);
      toast.error('Siparişler yüklenirken hata oluştu!');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      let customClient = undefined;
      if (user && user.id && user?.identities?.[0]?.identity_data?.sub) {
        const session = await supabase.auth.getSession();
        const accessToken = session.data.session?.access_token;
        if (accessToken) {
          customClient = createSupabaseClientWithToken(accessToken);
        }
      }
      const { error } = await db.orders.updateStatus(orderId, newStatus, customClient);
      
      if (error) {
        console.error('Sipariş durumu güncellenirken hata:', error);
        toast.error('Sipariş durumu güncellenirken hata oluştu!');
        return;
      }

      toast.success('Sipariş durumu güncellendi!');
      loadOrders(); // Listeyi yenile
    } catch (error) {
      console.error('Sipariş durumu güncellenirken hata:', error);
      toast.error('Sipariş durumu güncellenirken hata oluştu!');
    }
  };

  // Bootstrap JS zaten AdminNavbar'da import ediliyor

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "pending": return "bg-warning";
      case "confirmed": return "bg-info";
      case "shipped": return "bg-primary";
      case "delivered": return "bg-success";
      case "cancelled": return "bg-danger";
      default: return "bg-secondary";
    }
  };

  const getStatusText = (status: string): { text: string, class: string } => {
    switch (status) {
      case "pending": return { text: "Siparişiniz Alındı", class: styles.statusPending };
      case "confirmed": return { text: "Onaylandı", class: styles.statusConfirmed };
      case "preparing": return { text: "Hazırlanıyor", class: styles.statusPreparing };
      case "shipped": return { text: "Kargoda", class: styles.statusShipped };
      case "delivered": return { text: "Teslim Edildi", class: styles.statusDelivered };
      case "cancelled": return { text: "İptal Edildi", class: styles.statusCancelled };
      default: return { text: status || "", class: "" };
    }
  };

  let filteredOrders = statusFilter === "all" 
    ? orders 
    : orders.filter(order => order.status === statusFilter);
  if (searchId.trim() !== "") {
    const q = searchId.trim().toLowerCase();
    filteredOrders = filteredOrders.filter(order => order.id.toLowerCase().includes(q));
  }
  if (searchName.trim() !== "") {
    const q = searchName.trim().toLowerCase();
    filteredOrders = filteredOrders.filter(order => (`${order.customer_first_name} ${order.customer_last_name}`).toLowerCase().includes(q));
  }
  if (searchEmail.trim() !== "") {
    const q = searchEmail.trim().toLowerCase();
    filteredOrders = filteredOrders.filter(order => (order.customer_email || '').toLowerCase().includes(q));
  }
  if (searchStatus.trim() !== "") {
    const q = searchStatus.trim().toLowerCase();
    filteredOrders = filteredOrders.filter(order => {
      const statusText = getStatusText(order.status);
      return (typeof statusText === 'object' && statusText.text && statusText.text.toLowerCase().includes(q)) || (order.status || '').toLowerCase().includes(q);
    });
  }
  if (searchDate.trim() !== "") {
    const q = searchDate.trim().toLowerCase();
    filteredOrders = filteredOrders.filter(order => {
      const dateStr = new Date(order.created_at).toLocaleString('tr-TR', { dateStyle: 'short', timeStyle: 'short' });
      return dateStr.toLowerCase().includes(q);
    });
  }
  const totalPages = Math.ceil(filteredOrders.length / pageSize);
  const pagedOrders = filteredOrders.slice((page-1)*pageSize, page*pageSize);

  return (
    <div className={styles.container}>
      {/* Main Content */}
      <div className={styles.content}>
        <div className="container-fluid">
          {/* Page Header */}
          <div className={styles.pageHeader}>
            <h1>Sipariş Yönetimi</h1>
            <p>Tüm siparişleri görüntüleyin ve yönetin</p>
          </div>

          {/* Quick Stats */}
          <div className="row g-4 mb-4">
            <div className="col-md-3">
              <div className={styles.statCard}>
                <div className={styles.statIcon}>📦</div>
                <div className={styles.statInfo}>
                  <h3>{orders.filter(o => o.status === "pending").length}</h3>
                  <p>Beklemede</p>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className={styles.statCard}>
                <div className={styles.statIcon}>🚚</div>
                <div className={styles.statInfo}>
                  <h3>{orders.filter(o => o.status === "shipped").length}</h3>
                  <p>Kargoda</p>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className={styles.statCard}>
                <div className={styles.statIcon}>✅</div>
                <div className={styles.statInfo}>
                  <h3>{orders.filter(o => o.status === "delivered").length}</h3>
                  <p>Teslim Edildi</p>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className={styles.statCard}>
                <div className={styles.statIcon}>💰</div>
                <div className={styles.statInfo}>
                  <h3>₺{orders.reduce((sum, o) => sum + parseFloat(o.total_amount), 0).toLocaleString()}</h3>
                  <p>Toplam Ciro</p>
                </div>
              </div>
            </div>
          </div>

          {/* Orders Table */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2>Tüm Siparişler ({filteredOrders.length})</h2>
              <div className="row g-2 align-items-center mb-2">
                <div className="col-12 col-md-auto">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Sipariş ID"
                    value={searchId}
                    onChange={e => { setSearchId(e.target.value); setPage(1); }}
                  />
                </div>
                <div className="col-12 col-md-auto">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Müşteri Adı"
                    value={searchName}
                    onChange={e => { setSearchName(e.target.value); setPage(1); }}
                  />
                </div>
                <div className="col-12 col-md-auto">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="E-posta"
                    value={searchEmail}
                    onChange={e => { setSearchEmail(e.target.value); setPage(1); }}
                  />
                </div>
                <div className="col-12 col-md-auto">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Durum"
                    value={searchStatus}
                    onChange={e => { setSearchStatus(e.target.value); setPage(1); }}
                  />
                </div>
                <div className="col-12 col-md-auto">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Tarih veya Saat"
                    value={searchDate}
                    onChange={e => { setSearchDate(e.target.value); setPage(1); }}
                  />
                </div>
              </div>
            </div>
            
            <div className={styles.tableContainer}>
              {loading ? (
                <div className="text-center py-4">
                  <div className="spinner-border" role="status">
                    <span className="visually-hidden">Yükleniyor...</span>
                  </div>
                </div>
              ) : (
                <>
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Sıra</th>
                      <th style={{whiteSpace:'nowrap'}}>Sipariş ID</th>
                      <th>Müşteri</th>
                      <th>E-posta</th>
                      <th>Ürün Sayısı</th>
                      <th>Toplam Tutar</th>
                      <th>Durum</th>
                      <th>Tarih</th>
                      <th>İşlemler</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pagedOrders.map((order, idx) => (
                      <tr key={order.id}>
                        <td>{(page-1)*pageSize + idx + 1}</td>
                        <td style={{whiteSpace:'nowrap'}}><strong>#{order.id}</strong></td>
                        <td>{order.customer_first_name} {order.customer_last_name}</td>
                        <td>{order.customer_email}</td>
                        <td>{Array.isArray(order.order_items) ? order.order_items.length : 0} ürün</td>
                        <td><strong>₺{parseFloat(order.total_amount).toLocaleString()}</strong></td>
                        <td>
                          <span className={`badge ${getStatusBadgeClass(order.status)}`}>
                            {getStatusText(order.status).text}
                          </span>
                        </td>
                        <td>{new Date(order.created_at).toLocaleString('tr-TR', { dateStyle: 'short', timeStyle: 'short' })}</td>
                        <td>
                          <div className="btn-group" role="group">
                            <button className="btn btn-sm btn-outline-primary" onClick={() => setSelectedOrder(order)}>Görüntüle</button>
                            <select 
                              className="form-select form-select-sm" 
                              style={{width: "120px"}}
                              value={order.status}
                              onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                            >
                              <option value="pending">Beklemede</option>
                              <option value="confirmed">Onaylandı</option>
                              <option value="shipped">Kargoda</option>
                              <option value="delivered">Teslim Edildi</option>
                              <option value="cancelled">İptal Edildi</option>
                            </select>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {/* Pagination */}
                {totalPages > 1 && (
                  <div style={{display:'flex',justifyContent:'center',alignItems:'center',gap:12,marginTop:16}}>
                    <button className="btn btn-secondary btn-sm" onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1}>← Önceki</button>
                    <span style={{fontWeight:600}}>{page} / {totalPages}</span>
                    <button className="btn btn-secondary btn-sm" onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={page===totalPages}>Sonraki →</button>
                  </div>
                )}
                </>
              )}
            </div>
          </div>
          {/* Modal */}
          {selectedOrder && (
            <div className={styles.modal}>
              <div className={styles.modalBox} style={{minWidth: 340, maxWidth: 520}}>
                <button className={styles.closeBtn} onClick={()=>setSelectedOrder(null)}>×</button>
                <h2 className={styles.modalTitle}>Sipariş #{selectedOrder.id}</h2>
                <div className={styles.modalDate}>{selectedOrder.created_at ? new Date(selectedOrder.created_at).toLocaleString('tr-TR', { dateStyle: 'short', timeStyle: 'short' }) : ''}</div>
                <div className={styles.modalRow}><b>Müşteri:</b> {selectedOrder.customer_first_name} {selectedOrder.customer_last_name}</div>
                <div className={styles.modalRow}><b>E-posta:</b> {selectedOrder.customer_email}</div>
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
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminOrders() {
  return (
    <AdminProtectedRoute>
      <AdminNavbar />
      <AdminOrdersContent />
    </AdminProtectedRoute>
  );
} 