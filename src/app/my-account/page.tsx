"use client";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import styles from "./page.module.css";
import { db, auth } from "@/lib/supabase";
import toast from "react-hot-toast";
import { useAuth } from "@/contexts/AuthContext";
import { notFound } from "next/navigation";
import { useRouter } from "next/navigation";

interface UserProfile {
  name: string;
  email: string;
  phone: string;
  birthDate: string;
  gender: string;
}

interface Address {
  id: number;
  title: string;
  fullName: string;
  phone: string;
  address: string;
  city: string;
  district: string;
  zipCode: string;
  isDefault: boolean;
}

export default function Hesabim() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [editProfile, setEditProfile] = useState<UserProfile | null>(null);
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

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [showEditAddressModal, setShowEditAddressModal] = useState(false);
  const [editAddress, setEditAddress] = useState<any>(null);
  const [showDeleteAddressModal, setShowDeleteAddressModal] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState<Address | null>(null);

  // Şifre değiştirme formu state
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    newPasswordRepeat: ""
  });
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Fetch addresses from DB
  const fetchAddresses = async (userId: string) => {
    const { data } = await db.userAddress.getByUserId(userId);
    if (data) {
      setAddresses(data.map((addr: any) => ({
        ...addr,
        isDefault: addr.is_default
      })));
    } else {
      setAddresses([]);
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      const { user } = await auth.getCurrentUser();
      if (user) {
        const { data } = await db.userDetail.getByUserId(user.id);
        setProfile({
          name: data?.full_name || "",
          email: user.email || "",
          phone: data?.phone || "",
          birthDate: data?.birth_date || "",
          gender: data?.gender || ""
        });
        setEditProfile({
          name: data?.full_name || "",
          email: user.email || "",
          phone: data?.phone || "",
          birthDate: data?.birth_date || "",
          gender: data?.gender || ""
        });
        await fetchAddresses(user.id);
      }
      setLoading(false);
    };
    fetchProfile();
  }, []);

  // Kullanıcı giriş yapmamışsa anasayfaya yönlendir (useEffect ile)
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/");
    }
  }, [authLoading, user, router]);
  if (!authLoading && !user) {
    return null;
  }

  const handleProfileSave = async () => {
    if (editProfile) {
      const { user } = await auth.getCurrentUser();
      if (!user) {
        toast.error("Kullanıcı oturumu bulunamadı.");
        return;
      }
      const updates = {
        full_name: editProfile.name,
        phone: editProfile.phone,
        birth_date: (editProfile.birthDate && editProfile.birthDate.trim() !== "") ? editProfile.birthDate : undefined,
        gender: editProfile.gender
      };
      const { error } = await db.userDetail.update(user.id, updates);
      if (!error) {
        setProfile(editProfile);
        setIsEditing(false);
        toast.success("Profil bilgileri güncellendi!");
      } else {
        if (error.message && error.message.includes('invalid input syntax for type date')) {
          toast.error("Lütfen geçerli bir doğum tarihi giriniz.");
        } else {
          toast.error("Profil güncellenemedi. Lütfen bilgilerinizi kontrol edin veya daha sonra tekrar deneyin.");
        }
      }
    }
  };

  const handleProfileCancel = () => {
    setEditProfile(profile);
    setIsEditing(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditProfile(prev => prev ? { ...prev, [name]: value } : null);
  };

  const handleAddAddress = () => {
    setNewAddress({
      title: "",
      full_name: profile?.name || "",
      phone: profile?.phone || "",
      address: "",
      city: "",
      district: "",
      zip_code: "",
      is_default: false
    });
    setShowAddressModal(true);
  };

  const handleAddressInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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

  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { user } = await auth.getCurrentUser();
    if (!user) {
      toast.error("Kullanıcı oturumu bulunamadı.");
      return;
    }
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
      await fetchAddresses(user.id);
    } else {
      toast.error("Adres eklenemedi. Lütfen tekrar deneyin.");
    }
  };

  const setDefaultAddress = async (id: number) => {
    const { user } = await auth.getCurrentUser();
    if (!user) {
      toast.error("Kullanıcı oturumu bulunamadı.");
      return;
    }
    const { error } = await db.userAddress.setDefault(user.id, String(id));
    if (!error) {
      toast.success("Varsayılan adres güncellendi!");
      await fetchAddresses(user.id);
    } else {
      toast.error("Varsayılan adres güncellenemedi.");
    }
  };

  const deleteAddress = (id: number) => {
    if (confirm("Bu adresi silmek istediğinizden emin misiniz?")) {
      setAddresses(prev => prev.filter(addr => addr.id !== id));
    }
  };

  const handleEditAddress = (address: Address) => {
    setEditAddress({ ...address });
    setShowEditAddressModal(true);
  };

  const handleEditAddressInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === "checkbox" && e.target instanceof HTMLInputElement) {
      setEditAddress((prev: any) => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked
      }));
    } else {
      setEditAddress((prev: any) => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleEditAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { user } = await auth.getCurrentUser();
    if (!user) {
      toast.error("Kullanıcı oturumu bulunamadı.");
      return;
    }
    if (!editAddress.title || !editAddress.full_name || !editAddress.phone || !editAddress.address || !editAddress.city || !editAddress.district || !editAddress.zip_code) {
      toast.error("Lütfen tüm alanları doldurun.");
      return;
    }
    const { error } = await db.userAddress.update(String(editAddress.id), {
      title: editAddress.title,
      full_name: editAddress.full_name,
      phone: editAddress.phone,
      address: editAddress.address,
      city: editAddress.city,
      district: editAddress.district,
      zip_code: editAddress.zip_code,
      is_default: !!editAddress.is_default
    });
    if (!error) {
      toast.success("Adres başarıyla güncellendi!");
      setShowEditAddressModal(false);
      await fetchAddresses(user.id);
    } else {
      toast.error("Adres güncellenemedi. Lütfen tekrar deneyin.");
    }
  };

  const handleDeleteAddress = (address: Address) => {
    setAddressToDelete(address);
    setShowDeleteAddressModal(true);
  };

  const confirmDeleteAddress = async () => {
    if (!addressToDelete) return;
    const { user } = await auth.getCurrentUser();
    if (!user) {
      toast.error("Kullanıcı oturumu bulunamadı.");
      return;
    }
    // Adresi sil
    const { error } = await db.userAddress.delete(String(addressToDelete.id));
    if (!error) {
      toast.success("Adres başarıyla silindi!");
      setShowDeleteAddressModal(false);
      setAddressToDelete(null);
      await fetchAddresses(user.id);
    } else {
      toast.error("Adres silinemedi. Lütfen tekrar deneyin.");
    }
  };

  const handlePasswordInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordLoading(true);
    if (!passwordForm.oldPassword || !passwordForm.newPassword || !passwordForm.newPasswordRepeat) {
      toast.error("Lütfen tüm alanları doldurun.");
      setPasswordLoading(false);
      return;
    }
    if (passwordForm.newPassword !== passwordForm.newPasswordRepeat) {
      toast.error("Yeni şifreler eşleşmiyor.");
      setPasswordLoading(false);
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      toast.error("Yeni şifre en az 6 karakter olmalı.");
      setPasswordLoading(false);
      return;
    }
    // Supabase: önce tekrar giriş yapıp sonra update
    const { user, error: userError } = await auth.getCurrentUser();
    if (!user) {
      toast.error("Kullanıcı oturumu bulunamadı.");
      setPasswordLoading(false);
      return;
    }
    // Tekrar giriş (reauth)
    const { error: signInError1 } = await auth.signIn(user.email || '', passwordForm.oldPassword);
    if (signInError1) {
      toast.error("Eski şifreniz yanlış.");
      setPasswordLoading(false);
      return;
    }
    // Şifre güncelle
    const { error: updateError } = await auth.updateUserPassword(passwordForm.newPassword);
    if (!updateError) {
      toast.success("Şifreniz başarıyla değiştirildi!");
      setPasswordForm({ oldPassword: "", newPassword: "", newPasswordRepeat: "" });
    } else {
      toast.error("Şifre değiştirilemedi. Lütfen tekrar deneyin.");
    }
    setPasswordLoading(false);
  };

  const handleForgotPassword = async () => {
    const { user } = await auth.getCurrentUser();
    if (!user || !user.email) {
      toast.error("Kullanıcı e-posta adresi bulunamadı.");
      return;
    }
    //console.log("user.email: ",user.email);
    const { error } = await auth.resetPassword(user.email || '');
    //console.log("handleForgotPassword-error: ",error);
    if (!error) {
      toast.success("Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.");
    } else {
      toast.error("Şifre sıfırlama e-postası gönderilemedi.");
    }
  };

  return (
    <div>
      <Navbar />
      
      <div className={styles.container}>
        <div className="container">
          {/* Header */}
          <div className={styles.pageHeader}>
            <h1 className={styles.pageTitle}>Hesabım</h1>
            <p className={styles.pageSubtitle}>Hesap bilgilerinizi yönetin</p>
          </div>
          {loading ? (
            <div style={{textAlign:'center',padding:'2rem'}}>Yükleniyor...</div>
          ) : profile && (
          <div className={styles.accountLayout}>
            {/* Sidebar */}
            <aside className={styles.sidebar}>
              <div className={styles.userInfo}>
                <div className={styles.userName}>{profile.name}</div>
                <div className={styles.userEmail}>{profile.email}</div>
              </div>

              <nav className={styles.nav}>
                <button
                  onClick={() => setActiveTab("profile")}
                  className={`${styles.navItem} ${activeTab === "profile" ? styles.active : ""}`}
                >
                  👤 Profil Bilgileri
                </button>
                <button
                  onClick={() => setActiveTab("addresses")}
                  className={`${styles.navItem} ${activeTab === "addresses" ? styles.active : ""}`}
                >
                  📍 Adres Defteri
                </button>
                <button
                  onClick={() => setActiveTab("security")}
                  className={`${styles.navItem} ${activeTab === "security" ? styles.active : ""}`}
                >
                  🔒 Güvenlik
                </button>
              </nav>
            </aside>

            {/* Main Content */}
            <main className={styles.mainContent}>
              {/* Profile Tab */}
              {activeTab === "profile" && (
                <div className={styles.tabContent}>
                  <div className={styles.tabHeader}>
                    <h2>Profil Bilgileri</h2>
                    {!isEditing ? (
                      <button onClick={() => setIsEditing(true)} className={styles.editBtn}>
                        ✏️ Düzenle
                      </button>
                    ) : (
                      <div className={styles.editActions}>
                        <button onClick={handleProfileSave} className={styles.saveBtn}>
                          ✅ Kaydet
                        </button>
                        <button onClick={handleProfileCancel} className={styles.cancelBtn}>
                          ❌ İptal
                        </button>
                      </div>
                    )}
                  </div>

                  <div className={styles.profileForm}>
                    <div className={styles.formGrid}>
                      <div className={styles.formGroup}>
                        <label>Ad Soyad</label>
                        {isEditing ? (
                          <input
                            type="text"
                            name="name"
                            value={editProfile?.name || ""}
                            onChange={handleInputChange}
                            className={styles.input}
                          />
                        ) : (
                          <div className={styles.fieldValue}>{profile.name}</div>
                        )}
                      </div>

                      <div className={styles.formGroup}>
                        <label>E-posta</label>
                        {isEditing ? (
                          <input
                            type="email"
                            name="email"
                            value={editProfile?.email || ""}
                            onChange={handleInputChange}
                            className={styles.input}
                            disabled
                          />
                        ) : (
                          <div className={styles.fieldValue}>{profile.email}</div>
                        )}
                      </div>

                      <div className={styles.formGroup}>
                        <label>Telefon</label>
                        {isEditing ? (
                          <input
                            type="tel"
                            name="phone"
                            value={editProfile?.phone || ""}
                            onChange={handleInputChange}
                            className={styles.input}
                          />
                        ) : (
                          <div className={styles.fieldValue}>{profile.phone}</div>
                        )}
                      </div>

                      <div className={styles.formGroup}>
                        <label>Doğum Tarihi</label>
                        {isEditing ? (
                          <input
                            type="date"
                            name="birthDate"
                            value={editProfile?.birthDate || ""}
                            onChange={handleInputChange}
                            className={styles.input}
                          />
                        ) : (
                          <div className={styles.fieldValue}>
                            {profile.birthDate ? new Date(profile.birthDate).toLocaleDateString('tr-TR') : ""}
                          </div>
                        )}
                      </div>

                      <div className={styles.formGroup}>
                        <label>Cinsiyet</label>
                        {isEditing ? (
                          <select
                            name="gender"
                            value={editProfile?.gender || ""}
                            onChange={handleInputChange}
                            className={styles.input}
                          >
                            <option value="">Seçiniz</option>
                            <option value="male">Erkek</option>
                            <option value="female">Kadın</option>
                            <option value="other">Diğer</option>
                          </select>
                        ) : (
                          <div className={styles.fieldValue}>
                            {profile.gender === "male" ? "Erkek" : 
                             profile.gender === "female" ? "Kadın" : profile.gender === "other" ? "Diğer" : ""}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Addresses Tab */}
              {activeTab === "addresses" && (
                <div className={styles.tabContent}>
                  <div className={styles.tabHeader}>
                    <h2>Adres Defteri</h2>
                    <button className={styles.addBtn} onClick={handleAddAddress}>+ Yeni Adres</button>
                  </div>

                  <div className={styles.addressesList}>
                    {addresses.length === 0 && !showAddressModal ? (
                      <div style={{textAlign:'center',color:'#888',padding:'2rem'}}>Adres bulunamadı.</div>
                    ) : (
                      addresses.map(address => (
                        <div key={address.id} className={styles.addressCard}>
                          <div className={styles.addressHeader}>
                            <div className={styles.addressTitle}>
                              {address.title}
                              {address.isDefault && (
                                <span className={styles.defaultBadge}>Varsayılan</span>
                              )}
                            </div>
                            <div className={styles.addressActions}>
                              <button className={styles.editAddressBtn} onClick={() => handleEditAddress(address)}>Düzenle</button>
                              <button 
                                onClick={() => handleDeleteAddress(address)}
                                className={styles.deleteAddressBtn}
                              >
                                Sil
                              </button>
                            </div>
                          </div>
                          <div className={styles.addressContent}>
                            <div className={styles.addressName}>{address.fullName}</div>
                            <div className={styles.addressPhone}>{address.phone}</div>
                            <div className={styles.addressText}>
                              {address.address}<br />
                              {address.district}/{address.city} {address.zipCode}
                            </div>
                            {!address.isDefault && (
                              <button 
                                onClick={() => setDefaultAddress(address.id)}
                                className={styles.setDefaultBtn}
                              >
                                Varsayılan Yap
                              </button>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                 {/* Yeni Adres Modalı */}
                 {showAddressModal && (
                   <div className={styles.modal}>
                     <div className={styles.modalContent} style={{maxWidth: 420}}>
                       <div className={styles.modalHeader}>
                         <h2 style={{color:'#111'}}>Yeni Adres Ekle</h2>
                         <button onClick={() => setShowAddressModal(false)} className={styles.closeBtn}>×</button>
                       </div>
                       <form onSubmit={handleAddressSubmit} className={styles.form}>
                         <div className={styles.formGroup}>
                           <label>Adres Başlığı</label>
                           <input type="text" name="title" value={newAddress.title} onChange={handleAddressInputChange} className={styles.input} required />
                         </div>
                         <div className={styles.formGroup}>
                           <label>Ad Soyad</label>
                           <input type="text" name="full_name" value={newAddress.full_name} onChange={handleAddressInputChange} className={styles.input} required />
                         </div>
                         <div className={styles.formGroup}>
                           <label>Telefon</label>
                           <input type="text" name="phone" value={newAddress.phone} onChange={handleAddressInputChange} className={styles.input} required />
                         </div>
                         <div className={styles.formGroup}>
                           <label>Adres</label>
                           <textarea name="address" value={newAddress.address} onChange={handleAddressInputChange} className={styles.input} required />
                         </div>
                         <div className={styles.formGroup}>
                           <label>Şehir</label>
                           <input type="text" name="city" value={newAddress.city} onChange={handleAddressInputChange} className={styles.input} required />
                         </div>
                         <div className={styles.formGroup}>
                           <label>İlçe</label>
                           <input type="text" name="district" value={newAddress.district} onChange={handleAddressInputChange} className={styles.input} required />
                         </div>
                         <div className={styles.formGroup}>
                           <label>Posta Kodu</label>
                           <input type="text" name="zip_code" value={newAddress.zip_code} onChange={handleAddressInputChange} className={styles.input} required />
                         </div>
                         <div className={styles.formGroup}>
                           <label>
                             <input type="checkbox" name="is_default" checked={newAddress.is_default} onChange={handleAddressInputChange} /> Varsayılan Adres
                           </label>
                         </div>
                         <div className={styles.formActions}>
                           <button type="button" onClick={() => setShowAddressModal(false)} className={styles.cancelBtn}>İptal</button>
                           <button type="submit" className={styles.saveBtn}>Kaydet</button>
                         </div>
                       </form>
                     </div>
                   </div>
                 )}
                 {/* Adres Düzenle Modalı */}
                 {showEditAddressModal && editAddress && (
                   <div className={styles.modal}>
                     <div className={styles.modalContent} style={{maxWidth: 420}}>
                       <div className={styles.modalHeader}>
                         <h2 style={{color:'#111'}}>Adres Düzenle</h2>
                         <button onClick={() => setShowEditAddressModal(false)} className={styles.closeBtn}>×</button>
                       </div>
                       <form onSubmit={handleEditAddressSubmit} className={styles.form}>
                         <div className={styles.formGroup}>
                           <label>Adres Başlığı</label>
                           <input type="text" name="title" value={editAddress.title} onChange={handleEditAddressInputChange} className={styles.input} required />
                         </div>
                         <div className={styles.formGroup}>
                           <label>Ad Soyad</label>
                           <input type="text" name="full_name" value={editAddress.full_name} onChange={handleEditAddressInputChange} className={styles.input} required />
                         </div>
                         <div className={styles.formGroup}>
                           <label>Telefon</label>
                           <input type="text" name="phone" value={editAddress.phone} onChange={handleEditAddressInputChange} className={styles.input} required />
                         </div>
                         <div className={styles.formGroup}>
                           <label>Adres</label>
                           <textarea name="address" value={editAddress.address} onChange={handleEditAddressInputChange} className={styles.input} required />
                         </div>
                         <div className={styles.formGroup}>
                           <label>Şehir</label>
                           <input type="text" name="city" value={editAddress.city} onChange={handleEditAddressInputChange} className={styles.input} required />
                         </div>
                         <div className={styles.formGroup}>
                           <label>İlçe</label>
                           <input type="text" name="district" value={editAddress.district} onChange={handleEditAddressInputChange} className={styles.input} required />
                         </div>
                         <div className={styles.formGroup}>
                           <label>Posta Kodu</label>
                           <input type="text" name="zip_code" value={editAddress.zip_code} onChange={handleEditAddressInputChange} className={styles.input} required />
                         </div>
                         <div className={styles.formGroup}>
                           <label>
                             <input type="checkbox" name="is_default" checked={editAddress.is_default} onChange={handleEditAddressInputChange} /> Varsayılan Adres
                           </label>
                         </div>
                         <div className={styles.formActions}>
                           <button type="button" onClick={() => setShowEditAddressModal(false)} className={styles.cancelBtn}>İptal</button>
                           <button type="submit" className={styles.saveBtn}>Kaydet</button>
                         </div>
                       </form>
                     </div>
                   </div>
                 )}
                 {/* Adres Sil Modalı */}
                 {showDeleteAddressModal && addressToDelete && (
                   <div className={styles.modal}>
                     <div className={styles.modalContent} style={{maxWidth: 380}}>
                       <div className={styles.modalHeader}>
                         <h2 style={{color:'#111',fontSize:'1.1rem'}}>Adresi Sil</h2>
                         <button onClick={() => setShowDeleteAddressModal(false)} className={styles.closeBtn}>×</button>
                       </div>
                       <div style={{margin:'1.2rem 0',color:'#333',fontSize:15}}>
                         <strong>{addressToDelete.title}</strong> başlıklı adresi silmek istediğinize emin misiniz?
                       </div>
                       <div className={styles.formActions}>
                         <button type="button" onClick={() => setShowDeleteAddressModal(false)} className={styles.cancelBtn}>Vazgeç</button>
                         <button type="button" onClick={confirmDeleteAddress} className={styles.saveBtn}>Evet, Sil</button>
                       </div>
                     </div>
                   </div>
                 )}
                </div>
              )}

              {/* Security Tab */}
              {activeTab === "security" && (
                <div className={styles.tabContent}>
                  <div className={styles.tabHeader}>
                    <h2>Güvenlik Ayarları</h2>
                  </div>

                  <div className={styles.securityOptions}>
                    <div className={styles.securityCard}>
                      <h3>Şifre Değiştir</h3>
                      <form onSubmit={handlePasswordChange} style={{display:'flex',flexDirection:'column',gap:14,maxWidth:340}}>
                        <input
                          type="password"
                          name="oldPassword"
                          value={passwordForm.oldPassword}
                          onChange={handlePasswordInputChange}
                          className={styles.input}
                          placeholder="Eski şifreniz"
                          autoComplete="current-password"
                        />
                        <input
                          type="password"
                          name="newPassword"
                          value={passwordForm.newPassword}
                          onChange={handlePasswordInputChange}
                          className={styles.input}
                          placeholder="Yeni şifre"
                          autoComplete="new-password"
                        />
                        <input
                          type="password"
                          name="newPasswordRepeat"
                          value={passwordForm.newPasswordRepeat}
                          onChange={handlePasswordInputChange}
                          className={styles.input}
                          placeholder="Yeni şifre tekrar"
                          autoComplete="new-password"
                        />
                        <div className={styles.formActions}>
                          <button type="submit" className={styles.saveBtn} disabled={passwordLoading}>
                            {passwordLoading ? "Kaydediliyor..." : "Kaydet"}
                          </button>
                        </div>
                      </form>
                      <div style={{marginTop:16}}>
                        <button type="button" className={styles.cancelBtn} style={{fontSize:13}} onClick={handleForgotPassword}>
                          Şifremi unuttum
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </main>
          </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
} 