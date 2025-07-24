"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { auth, db } from "@/lib/supabase";
import styles from "./page.module.css";

interface AddressForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { cartItems, cartCount, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [formData, setFormData] = useState<AddressForm>({
    firstName: "",
    lastName: "",
    email: user?.email || "",
    phone: "",
    address: "",
    city: "",
    postalCode: ""
  });
  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [newAddress, setNewAddress] = useState({
    title: "",
    full_name: "",
    phone: "",
    address: "",
    city: "",
    district: "",
    zip_code: "",
    is_default: false
  });

  useEffect(() => {
    if (cartCount === 0) {
      toast.error("Sepetiniz boş!");
      router.push("/cart");
    }
  }, [cartCount, router]);

  // Kullanıcı giriş yaptıysa ad ve soyadı user_detail'dan, adres bilgilerini user_address'ten çek
  useEffect(() => {
    const fetchUserDetailAndAddress = async () => {
      if (user) {
        // Ad Soyad
        const { data: detail, error: detailError } = await db.userDetail.getByUserId(user.id);
        let firstName = "";
        let lastName = "";
        if (detail && detail.full_name) {
          const [f, ...rest] = detail.full_name.split(" ");
          firstName = f || "";
          lastName = rest.join(" ");
        }
        // Adres Bilgileri
        const { data: addresses, error: addressError } = await db.userAddress.getByUserId(user.id);
        let phone = "";
        let address = "";
        let city = "";
        let postalCode = "";
        if (addresses && addresses.length > 0) {
          // Varsayılan adresi bul, yoksa ilk adresi kullan
          const defaultAddr = addresses.find((a: any) => a.is_default) || addresses[0];
          phone = defaultAddr.phone || "";
          address = defaultAddr.address || "";
          city = defaultAddr.city || "";
          postalCode = defaultAddr.zip_code || "";
        }
        setFormData(prev => ({
          ...prev,
          firstName,
          lastName,
          phone,
          address,
          city,
          postalCode,
        }));
      }
    };
    fetchUserDetailAndAddress();
  }, [user]);

  // Adresleri getir
  useEffect(() => {
    const fetchAddresses = async () => {
      if (user) {
        const { data } = await db.userAddress.getByUserId(user.id);
        if (data) {
          setAddresses(data);
          // Varsayılan adresi seçili yap
          const defaultAddr = data.find((a: any) => a.is_default) || data[0];
          if (defaultAddr) setSelectedAddressId(defaultAddr.id);
        }
      }
    };
    fetchAddresses();
  }, [user, showAddressModal]);

  // Adres seçilince formu doldur
  useEffect(() => {
    if (selectedAddressId && addresses.length > 0) {
      const addr = addresses.find(a => a.id === selectedAddressId);
      if (addr) {
        setFormData(prev => ({
          ...prev,
          phone: addr.phone || "",
          address: addr.address || "",
          city: addr.city || "",
          postalCode: addr.zip_code || "",
        }));
      }
    }
  }, [selectedAddressId, addresses]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const checkEmailExists = async (email: string) => {
    try {
      setCheckingEmail(true);
      const { data, error } = await auth.signIn(email, "dummy-password");
      
      // Eğer hata "Invalid login credentials" ise, e-posta mevcut ama şifre yanlış
      // Eğer hata "User not found" ise, e-posta mevcut değil
      if (error && error.message.includes("Invalid login credentials")) {
        return true; // E-posta mevcut
      }
      return false; // E-posta mevcut değil
    } catch (error) {
      console.error("E-posta kontrolü hatası:", error);
      return false;
    } finally {
      setCheckingEmail(false);
    }
  };

  // Yeni adres input değişimi
  const handleNewAddressInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === "checkbox" && e.target instanceof HTMLInputElement) {
      setNewAddress((prev) => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked
      }));
    } else {
      setNewAddress((prev) => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Yeni adres ekle
  const handleNewAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!newAddress.title || !newAddress.full_name || !newAddress.phone || !newAddress.address || !newAddress.city || !newAddress.district || !newAddress.zip_code) {
      toast.error("Lütfen tüm alanları doldurun.");
      return;
    }
    const { error } = await db.userAddress.create({
      ...newAddress,
      user_id: user.id
    });
    if (!error) {
      toast.success("Adres başarıyla eklendi!");
      setShowAddressModal(false);
      setNewAddress({
        title: "",
        full_name: "",
        phone: "",
        address: "",
        city: "",
        district: "",
        zip_code: "",
        is_default: false
      });
    } else {
      toast.error("Adres eklenemedi. Lütfen tekrar deneyin.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Form validasyonu
    if (!formData.firstName || !formData.lastName || !formData.email || 
        !formData.phone || !formData.address || !formData.city || !formData.postalCode) {
      toast.error("Lütfen tüm alanları doldurun!");
      return;
    }

    if (!formData.email.includes("@")) {
      toast.error("Geçerli bir e-posta adresi girin!");
      return;
    }

    // Eğer kullanıcı giriş yapmamışsa, e-posta kontrolü yap
    if (!user) {
      const emailExists = await checkEmailExists(formData.email);
      if (emailExists) {
        toast.error("Bu e-posta adresi zaten kayıtlı! Lütfen giriş yapın.");
        return;
      }
    }

    setLoading(true);
    
    try {
      // Veritabanı tablolarının varlığını kontrol et
      const { exists, error: tableError } = await db.orders.checkTablesExist();
      
      if (!exists) {
        console.error('Veritabanı tablosu hatası:', tableError);
        toast.error("Sipariş sistemi henüz hazır değil. Lütfen daha sonra tekrar deneyin.");
        setLoading(false);
        return;
      }

      // Sipariş verilerini hazırla
      const orderData = {
        user_id: user?.id || undefined,
        customer_email: formData.email,
        customer_first_name: formData.firstName,
        customer_last_name: formData.lastName,
        customer_phone: formData.phone,
        customer_address: formData.address,
        customer_city: formData.city,
        customer_postal_code: formData.postalCode,
        total_amount: cartTotal,
        status: 'pending',
        items: cartItems.map(item => ({
          product_id: item.id,
          product_name: item.name,
          product_price: item.price,
          quantity: item.quantity,
          subtotal: item.price * item.quantity
        }))
      };

      // Siparişi veritabanına kaydet
      const { data: order, error } = await db.orders.create(orderData);

      if (error) {
        console.error('Sipariş kaydetme hatası:', JSON.stringify(error, null, 2));
        let errorMessage = "Sipariş kaydedilirken hata oluştu!";
        toast.error(errorMessage);
        return;
      }

      // Sipariş başarıyla oluşturulduysa e-posta gönder
      try {
        const productListHtml = orderData.items.map(item => `
          <li>
            <b>${item.product_name}</b> x${item.quantity} - ${(item.product_price).toLocaleString('tr-TR')} ₺
          </li>
        `).join('');
        
                // Sipariş mailini gönderme
          await fetch('/api/send-order-mail', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              to: formData.email,  // Alıcı e-posta adresi
              subject: `Siparişiniz Alındı! (#${order.id})`,  // E-posta başlığı
              html: `
                <h2>Sayın ${formData.firstName} ${formData.lastName},</h2>
                <p>Siparişiniz başarıyla alındı.</p>
                <p><b>Sipariş No:</b> ${order.id}</p>
                <p><b>Toplam Tutar:</b> ${(order.total_amount ?? 0).toLocaleString('tr-TR')} ₺</p>
                <p><b>Adres:</b> ${formData.address}, ${formData.city} ${formData.postalCode}</p>
                <p><b>Ürünler:</b></p>
                <ul>${productListHtml}</ul>
                <hr/>
                <p>Teşekkürler!</p>
              `
            })
          });

      } catch (mailError) {
        console.error('Sipariş maili gönderilemedi:', mailError);
        // Kullanıcıya mail hatası gösterme, sadece logla
      }

      toast.success(`Siparişiniz başarıyla oluşturuldu! Sipariş No: ${order.id}`);
      clearCart();
      router.push("/");
    } catch (error) {
      console.error('Sipariş oluşturma hatası:', error);
      toast.error("Sipariş oluşturulurken hata oluştu!");
    } finally {
      setLoading(false);
    }
  };

  if (cartCount === 0) {
    return null; // Sepet boşsa, sayfa render edilmez
  }

  return (
    <>
      <Navbar />
      <main className={styles.container}>
        <h1 className={styles.title}>Sipariş Özeti</h1>
        
        <div className={styles.content}>
          {/* Sipariş Özeti */}
          <section className={styles.summary}>
            <h2>Sipariş Detayları</h2>
            <div className={styles.items}>
              {cartItems.map((item) => (
                <div key={item.id} className={styles.item}>
                  <img src={item.image_url_1 || ""} alt={item.name} />
                  <div className={styles.itemInfo}>
                    <h3>{item.name}</h3>
                    <p>Adet: {item.quantity}</p>
                    <p>Fiyat: {item.price.toLocaleString("tr-TR")} ₺</p>
                  </div>
                  <div className={styles.itemTotal}>
                    {(item.price * item.quantity).toLocaleString("tr-TR")} ₺
                  </div>
                </div>
              ))}
            </div>
            
            <div className={styles.totalSection}>
              <div className={styles.totalRow}>
                <span>Toplam Tutar:</span>
                <strong>{cartTotal.toLocaleString("tr-TR")} ₺</strong>
              </div>
            </div>
          </section>

          {/* Adres Formu */}
          <section className={styles.addressForm}>
            <h2>Teslimat Bilgileri</h2>
            <form onSubmit={handleSubmit}>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="firstName">Ad *</label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="lastName">Soyad *</label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="email">
                    E-posta * 
                    {user && <span className={styles.loggedInNote}> (Giriş yapmış kullanıcı)</span>}
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    readOnly={!!user}
                    className={user ? styles.readonlyInput : ''}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="phone">Telefon *</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              {/* Adres kartları ve seçim alanı (formun üstüne ekle) */}
              {user && addresses.length > 0 && (
                <section style={{ marginBottom: 24 }}>
                  <h3 style={{ fontSize: 16, marginBottom: 12 }}>Adres Seç</h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
                    {addresses.map(addr => (
                      <div
                        key={addr.id}
                        style={{
                          border: selectedAddressId === addr.id ? '2px solid #333' : '1px solid #ddd',
                          borderRadius: 8,
                          padding: 16,
                          minWidth: 220,
                          background: selectedAddressId === addr.id ? '#f8f9fa' : '#fff',
                          cursor: 'pointer',
                          boxShadow: selectedAddressId === addr.id ? '0 2px 8px rgba(44,62,80,0.08)' : 'none'
                        }}
                        onClick={() => setSelectedAddressId(addr.id)}
                      >
                        <div style={{ fontWeight: 600 }}>{addr.title} {addr.is_default && <span style={{ color: '#007bff', fontSize: 12 }}>(Varsayılan)</span>}</div>
                        <div style={{ fontSize: 14 }}>{addr.full_name}</div>
                        <div style={{ fontSize: 14 }}>{addr.phone}</div>
                        <div style={{ fontSize: 13, color: '#555' }}>{addr.address}, {addr.district}/{addr.city} {addr.zip_code}</div>
                      </div>
                    ))}
                    <button
                      type="button"
                      style={{ minWidth: 220, border: '1px dashed #aaa', borderRadius: 8, background: '#fafbfc', color: '#333', padding: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      onClick={() => setShowAddressModal(true)}
                    >
                      + Yeni Adres
                    </button>
                  </div>
                </section>
              )}

              <div className={styles.formGroup}>
                <label htmlFor="address">Adres *</label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="city">Şehir *</label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="postalCode">Posta Kodu *</label>
                  <input
                    type="text"
                    id="postalCode"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className={styles.actions}>
                <button 
                  type="button" 
                  onClick={() => router.push("/cart")} 
                  className={styles.btnSecondary}
                >
                  Sepete Dön
                </button>
                <button 
                  type="submit" 
                  className={styles.btnPrimary}
                  disabled={loading || checkingEmail}
                >
                  {loading ? "İşleniyor..." : 
                   checkingEmail ? "E-posta Kontrol Ediliyor..." : 
                   "Siparişi Tamamla"}
                </button>
              </div>
            </form>
          </section>
        </div>
      </main>
      <Footer />

      {/* Yeni Adres Modalı */}
      {showAddressModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.18)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', padding: 24, borderRadius: 8, maxWidth: 500, width: '90%' }}>
            <h3>Yeni Adres Ekle</h3>
            <form onSubmit={handleNewAddressSubmit}>
              <div style={{ marginBottom: 16 }}>
                <label htmlFor="title">Adres Başlığı</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={newAddress.title}
                  onChange={handleNewAddressInputChange}
                  required
                />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label htmlFor="full_name">Ad Soyad</label>
                <input
                  type="text"
                  id="full_name"
                  name="full_name"
                  value={newAddress.full_name}
                  onChange={handleNewAddressInputChange}
                  required
                />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label htmlFor="phone">Telefon</label>
                <input
                  type="text"
                  id="phone"
                  name="phone"
                  value={newAddress.phone}
                  onChange={handleNewAddressInputChange}
                  required
                />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label htmlFor="address">Adres</label>
                <textarea
                  id="address"
                  name="address"
                  value={newAddress.address}
                  onChange={handleNewAddressInputChange}
                  required
                />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label htmlFor="city">Şehir</label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={newAddress.city}
                  onChange={handleNewAddressInputChange}
                  required
                />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label htmlFor="district">İlçe</label>
                <input
                  type="text"
                  id="district"
                  name="district"
                  value={newAddress.district}
                  onChange={handleNewAddressInputChange}
                  required
                />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label htmlFor="zip_code">Posta Kodu</label>
                <input
                  type="text"
                  id="zip_code"
                  name="zip_code"
                  value={newAddress.zip_code}
                  onChange={handleNewAddressInputChange}
                  required
                />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label>
                  <input
                    type="checkbox"
                    name="is_default"
                    checked={newAddress.is_default}
                    onChange={handleNewAddressInputChange}
                  />
                  Varsayılan Adres Olsun
                </label>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <button type="button" onClick={() => setShowAddressModal(false)} className={styles.btnSecondary}>İptal</button>
                <button type="submit" className={styles.btnPrimary}>Kaydet</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
