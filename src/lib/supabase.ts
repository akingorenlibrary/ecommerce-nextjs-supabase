import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Auth helper functions
export const auth = {
  signUp: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: {
          email_confirmed: true
        }
      }
    })
    
    // Hata mesajlarını Türkçe'ye çevir
    if (error) {
      let turkishMessage = 'Kayıt olurken bir hata oluştu.';
      
      if (error.message.includes('User already registered')) {
        turkishMessage = 'Bu email adresi zaten kayıtlı! Lütfen giriş yapmayı deneyin.';
      } else if (error.message.includes('Password should be at least')) {
        turkishMessage = 'Şifre en az 6 karakter olmalıdır.';
      } else if (error.message.includes('Invalid email')) {
        turkishMessage = 'Geçersiz email adresi.';
      } else if (error.message.includes('Too many requests')) {
        turkishMessage = 'Çok fazla deneme yaptınız. Lütfen biraz bekleyin.';
      }
      
      return { 
        data, 
        error: { 
          ...error, 
          message: turkishMessage 
        } 
      };
    }
    
    return { data, error }
  },

  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    
    // Hata mesajlarını Türkçe'ye çevir
    if (error) {
      let turkishMessage = 'Giriş yapılırken bir hata oluştu.';
      
      if (error.message.includes('Invalid login credentials')) {
        turkishMessage = 'Email veya şifre hatalı!';
      } else if (error.message.includes('Email not confirmed')) {
        turkishMessage = 'Email adresiniz henüz onaylanmamış.';
      } else if (error.message.includes('Too many requests')) {
        turkishMessage = 'Çok fazla deneme yaptınız. Lütfen biraz bekleyin.';
      } else if (error.message.includes('User not found')) {
        turkishMessage = 'Bu email adresi ile kayıtlı kullanıcı bulunamadı.';
      }
      
      return { 
        data, 
        error: { 
          ...error, 
          message: turkishMessage 
        } 
      };
    }
    
    return { data, error }
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  getCurrentUser: async () => {
    const { data: { user }, error } = await supabase.auth.getUser()
    return { user, error }
  },

  resetPassword: async (email: string) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    //console.log("resetPassword-email: ",email);
    //console.log("resetPassword-redirectTo: ",`${window.location.origin}/reset-password`);
    //console.log("resetPassword-data: ",data);
    //console.log("resetPassword-error: ",error);
    if (error) {
      let turkishMessage = 'Şifre sıfırlama işlemi başarısız.';
      if (error.message.includes('User not found')) {
        turkishMessage = 'Bu email adresi ile kayıtlı kullanıcı bulunamadı.';
      }
      return {
        data,
        error: {
          ...error,
          message: turkishMessage
        }
      };
    }
  
    return { data, error };
  },

  updateUserPassword: async (newPassword: string) => {
    const { data, error } = await supabase.auth.updateUser({ password: newPassword });
    return { data, error };
  }
}

// Admin authentication functions
export const adminAuth = {
  signIn: async (email: string, password: string) => {
    try {
      console.log('Admin login attempt:', { email });

      // Get admin from Supabase database by email
      const { data, error } = await supabase
        .from('admins')
        .select('*')
        .eq('email', email)
        .eq('is_active', true)
        .single();

      console.log('Supabase query result:', { data, error });
      
      // If admin not found in database
      if (error || !data) {
        console.log('Admin not found in database:', error?.message);
        return { admin: null, error: { message: 'Geçersiz email veya şifre!' } };
      }

      // Admin found, check password
      // For now, simple password comparison (in production, use bcrypt.compare)
      if (data.password_hash === password) {
        console.log('Password match - login successful');
        
        // Store admin session
        if (typeof window !== 'undefined') {
          localStorage.setItem('adminSession', JSON.stringify({
            id: data.id,
            email: data.email,
            full_name: data.full_name,
            is_active: data.is_active,
            created_at: data.created_at,
            loginTime: new Date().toISOString()
          }));
        }

        return { admin: data, error: null };
      } else {
        console.log('Password mismatch');
        return { admin: null, error: { message: 'Geçersiz şifre!' } };
      }

    } catch (error) {
      console.error('Admin login error:', error);
      return { admin: null, error: { message: 'Giriş yapılırken bir hata oluştu.' } };
    }
  },

  signOut: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('adminSession');
    }
    return { error: null };
  },

  getCurrentAdmin: () => {
    if (typeof window !== 'undefined') {
      const session = localStorage.getItem('adminSession');
      if (session) {
        try {
          return JSON.parse(session);
        } catch {
          return null;
        }
      }
    }
    return null;
  },

  isAuthenticated: () => {
    return !!adminAuth.getCurrentAdmin();
  }
};

// Database helper functions
export const db = {
  // Categories (Kategoriler) functions
  categories: {
    // Tüm kategorileri getir
    getAll: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('name');
      return { data, error };
    },

    // Kategori ekle
    create: async (categoryData: {
      name: string;
      slug: string;
      description?: string;
    }) => {
      const { data, error } = await supabase
        .from('categories')
        .insert([categoryData])
        .select()
        .single();
      return { data, error };
    },

    // Kategori güncelle
    update: async (id: string, updates: {
      name?: string;
      slug?: string;
      description?: string;
      is_active?: boolean;
    }) => {
      const { data, error } = await supabase
        .from('categories')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      return { data, error };
    },

    // Kategori sil
    delete: async (id: string) => {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);
      return { error };
    },

    // Kategorileri alt kategorilerle birlikte getir
    getAllWithSubcategories: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select(`
          *,
          subcategories (
            id,
            name,
            slug,
            description,
            is_active
          )
        `)
        .eq('is_active', true)
        .order('name');
      return { data, error };
    }
  },

  // Subcategories (Alt Kategoriler) functions
  subcategories: {
    // Belirli kategorinin alt kategorilerini getir
    getByCategory: async (categoryId: string) => {
      const { data, error } = await supabase
        .from('subcategories')
        .select('*')
        .eq('category_id', categoryId)
        .eq('is_active', true)
        .order('name');
      return { data, error };
    },

    // Tüm alt kategorileri getir
    getAll: async () => {
      const { data, error } = await supabase
        .from('subcategories')
        .select(`
          *,
          categories (
            id,
            name,
            slug
          )
        `)
        .eq('is_active', true)
        .order('name');
      return { data, error };
    },

    // Alt kategori ekle
    create: async (subcategoryData: {
      category_id: string;
      name: string;
      slug: string;
      description?: string;
    }) => {
      const { data, error } = await supabase
        .from('subcategories')
        .insert([subcategoryData])
        .select()
        .single();
      return { data, error };
    },

    // Alt kategori güncelle
    update: async (id: string, updates: {
      name?: string;
      slug?: string;
      description?: string;
      is_active?: boolean;
    }) => {
      const { data, error } = await supabase
        .from('subcategories')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      return { data, error };
    },

    // Alt kategori sil
    delete: async (id: string) => {
      const { error } = await supabase
        .from('subcategories')
        .delete()
        .eq('id', id);
      return { error };
    }
  },

  // Products (Ürünler) functions
  products: {
    // Tüm ürünleri getir
    getAll: async () => {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories (
            id,
            name,
            slug
          ),
          subcategories (
            id,
            name,
            slug
          )
        `)
        .order('created_at', { ascending: false });
      return { data, error };
    },

    // Aktif ürünleri getir
    getActive: async () => {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories (
            id,
            name,
            slug
          ),
          subcategories (
            id,
            name,
            slug
          )
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      return { data, error };
    },

    // Ürün ekle
    create: async (productData: {
      name: string;
      slug: string;
      description?: string;
      price: number;
      original_price?: number;
      stock: number;
      image_url_1?: string;
      image_url_2?: string;
      image_url_3?: string;
      category_id: string;
      subcategory_id: string;
      is_new?: boolean;
      is_featured?: boolean;
    }) => {
      const { data, error } = await supabase
        .from('products')
        .insert([productData])
        .select()
        .single();
      return { data, error };
    },

    // Ürün güncelle
    update: async (id: string, updates: {
      name?: string;
      slug?: string;
      description?: string;
      price?: number;
      original_price?: number;
      stock?: number;
      image_url_1?: string;
      image_url_2?: string;
      image_url_3?: string;
      category_id?: string;
      subcategory_id?: string;
      is_active?: boolean;
      is_new?: boolean;
      is_featured?: boolean;
    }) => {
      const { data, error } = await supabase
        .from('products')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      return { data, error };
    },

    // Ürün sil
    delete: async (id: string) => {
      try {
        // Önce ürünü getir (resim URL'lerini almak için)
        const { data: product, error: fetchError } = await supabase
          .from('products')
          .select('image_url_1, image_url_2, image_url_3')
          .eq('id', id)
          .single();

        if (fetchError) {
          console.error('Ürün getirme hatası:', fetchError);
          return { error: fetchError };
        }

        // Resim URL'lerinden dosya yollarını çıkar
        const extractFilePath = (url: string): string | null => {
          if (!url) return null;
          try {
            // URL'den dosya yolunu çıkar (products/filename.ext formatında)
            const urlObj = new URL(url);
            const pathParts = urlObj.pathname.split('/');
            const productsIndex = pathParts.findIndex(part => part === 'products');
            if (productsIndex !== -1 && productsIndex < pathParts.length - 1) {
              return pathParts.slice(productsIndex).join('/');
            }
          } catch (error) {
            console.error('URL parse hatası:', error);
          }
          return null;
        };

        // Silinecek resim dosyalarını topla
        const imageFiles = [
          product.image_url_1,
          product.image_url_2,
          product.image_url_3
        ]
          .filter(url => url && url.trim() !== '')
          .map(url => extractFilePath(url))
          .filter(path => path !== null);

        // Resimleri storage'dan sil
        if (imageFiles.length > 0) {
          const { error: storageError } = await supabase.storage
            .from('product-images')
            .remove(imageFiles);

          if (storageError) {
            console.error('Resim silme hatası:', storageError);
            // Resim silme hatası olsa bile ürünü silmeye devam et
          }
        }

        // Ürünü veritabanından sil
        const { error } = await supabase
          .from('products')
          .delete()
          .eq('id', id);

        return { error };
      } catch (error) {
        console.error('Ürün silme işlemi hatası:', error);
        return { error: error as any };
      }
    },

    // Slug'a göre ürün getir
    getBySlug: async (slug: string) => {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories (
            id,
            name,
            slug
          ),
          subcategories (
            id,
            name,
            slug
          )
        `)
        .eq('slug', slug)
        .eq('is_active', true)
        .single();
      return { data, error };
    },

    // ID'ye göre ürün getir
    getById: async (id: string) => {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories (
            id,
            name,
            slug
          ),
          subcategories (
            id,
            name,
            slug
          )
        `)
        .eq('id', id)
        .single();

      return { data, error };
    },

    // Kategoriye göre ürünleri getir
    getByCategory: async (categoryId: string, subcategorySlug?: string) => {
      let query = supabase
        .from('products')
        .select(`
          *,
          categories (
            id,
            name,
            slug
          ),
          subcategories (
            id,
            name,
            slug
          )
        `)
        .eq('category_id', categoryId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      // Eğer alt kategori slug'ı verilmişse, önce o alt kategoriyi bul
      if (subcategorySlug) {
        const { data: subcategoryData } = await supabase
          .from('subcategories')
          .select('id')
          .eq('slug', subcategorySlug)
          .eq('category_id', categoryId)
          .single();

        if (subcategoryData) {
          query = query.eq('subcategory_id', subcategoryData.id);
        }
      }

      const { data, error } = await query;
      return { data, error };
    },

    // Öne çıkan ürünleri getir
    getFeatured: async () => {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories (slug)
        `)
        .eq('is_active', true)
        .eq('is_featured', true)
        .order('created_at', { ascending: false });
      return { data, error };
    }
  },

  // Orders (Siparişler) functions
  orders: {
    // Sipariş oluştur
    create: async (orderData: {
      user_id?: string;
      customer_email: string;
      customer_first_name: string;
      customer_last_name: string;
      customer_phone: string;
      customer_address: string;
      customer_city: string;
      customer_postal_code: string;
      total_amount: number;
      status: string;
      items: Array<{
        product_id: string;
        product_name: string;
        product_price: number;
        quantity: number;
        subtotal: number;
      }>;
    }, customClient?: any) => {
      const client = customClient || supabase;
      try {
        // Sipariş ana kaydını oluştur
        const { data: order, error: orderError } = await client
          .from('orders')
          .insert([{
            user_id: orderData.user_id || null,
            customer_email: orderData.customer_email,
            customer_first_name: orderData.customer_first_name,
            customer_last_name: orderData.customer_last_name,
            customer_phone: orderData.customer_phone,
            customer_address: orderData.customer_address,
            customer_city: orderData.customer_city,
            customer_postal_code: orderData.customer_postal_code,
            total_amount: orderData.total_amount,
            status: orderData.status || 'pending'
          }])
          .select()
          .single();

        if (orderError) {
          console.error('Sipariş oluşturma hatası:', orderError);
          console.error('Hata detayları:', {
            message: orderError.message,
            details: orderError.details,
            hint: orderError.hint,
            code: orderError.code,
            fullError: JSON.stringify(orderError, null, 2)
          });
          return { data: null, error: orderError };
        }

        // Sipariş detaylarını oluştur
        const orderItems = orderData.items.map(item => ({
          order_id: order.id,
          product_id: item.product_id,
          product_name: item.product_name,
          product_price: item.product_price,
          quantity: item.quantity,
          subtotal: item.subtotal
        }));

        const { error: itemsError } = await client
          .from('order_items')
          .insert(orderItems);

        if (itemsError) {
          console.error('Sipariş detayları oluşturma hatası:', itemsError);
          console.error('Items hata detayları:', {
            message: itemsError.message,
            details: itemsError.details,
            hint: itemsError.hint,
            code: itemsError.code,
            fullError: JSON.stringify(itemsError, null, 2)
          });
          // Ana siparişi sil
          await client.from('orders').delete().eq('id', order.id);
          return { data: null, error: itemsError };
        }

        return { data: order, error: null };
      } catch (error) {
        console.error('Sipariş oluşturma işlemi hatası:', error);
        return { data: null, error: error as any };
      }
    },

    // Kullanıcının siparişlerini getir
    getByUserId: async (userId: string, customClient?: any) => {
      const client = customClient || supabase;
      const { data, error } = await client
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            products (
              id,
              name,
              slug,
              image_url_1
            )
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      return { data, error };
    },

    // E-posta ile siparişleri getir
    getByEmail: async (email: string, customClient?: any) => {
      const client = customClient || supabase;
      const { data, error } = await client
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            products (
              id,
              name,
              slug,
              image_url_1
            )
          )
        `)
        .eq('customer_email', email)
        .order('created_at', { ascending: false });
      return { data, error };
    },

    // Sipariş detayını getir
    getById: async (orderId: string, customClient?: any) => {
      const client = customClient || supabase;
      const { data, error } = await client
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            products (
              id,
              name,
              slug,
              image_url_1
            )
          )
        `)
        .eq('id', orderId)
        .single();
      return { data, error };
    },

    // Sipariş durumunu güncelle
    updateStatus: async (orderId: string, status: string, customClient?: any) => {
      const client = customClient || supabase;
      const { data, error } = await client
        .from('orders')
        .update({ 
          status,
          updated_at: new Date().toISOString() 
        })
        .eq('id', orderId)
        .select()
        .single();
      return { data, error };
    },

    // Tüm siparişleri getir (admin için)
    getAll: async (customClient?: any) => {
      const client = customClient || supabase;
      const { data, error } = await client
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            products (
              id,
              name,
              slug,
              image_url_1
            )
          )
        `)
        .order('created_at', { ascending: false });
      return { data, error };
    },

    // Veritabanı tablolarının varlığını kontrol et
    checkTablesExist: async (customClient?: any) => {
      const client = customClient || supabase;
      try {
        // Orders tablosunu kontrol et
        const { error: ordersError } = await client
          .from('orders')
          .select('id')
          .limit(1);
        
        if (ordersError && ordersError.message.includes('relation "orders" does not exist')) {
          return { exists: false, error: 'Orders tablosu bulunamadı' };
        }

        // Order items tablosunu kontrol et
        const { error: itemsError } = await client
          .from('order_items')
          .select('id')
          .limit(1);
        
        if (itemsError && itemsError.message.includes('relation "order_items" does not exist')) {
          return { exists: false, error: 'Order items tablosu bulunamadı' };
        }

        return { exists: true, error: null };
      } catch (error) {
        return { exists: false, error: 'Tablolar kontrol edilirken hata oluştu' };
      }
    }
  },

  // UserDetail (Kullanıcı Detay) functions
  userDetail: {
    // Kullanıcı detay ekle
    create: async (userDetailData: {
      user_id: string;
      full_name: string;
      phone?: string;
      birth_date?: string;
      gender?: string;
    }) => {
      const { data, error } = await supabase
        .from('user_detail')
        .insert([userDetailData])
        .select()
        .single();
      return { data, error };
    },
    // Kullanıcı detayını getir
    getByUserId: async (user_id: string) => {
      const { data, error } = await supabase
        .from('user_detail')
        .select('*')
        .eq('user_id', user_id)
        .single();
      return { data, error };
    },
    // Kullanıcı detayını güncelle
    update: async (user_id: string, updates: {
      full_name?: string;
      phone?: string;
      birth_date?: string;
      gender?: string;
    }) => {
      const { data, error } = await supabase
        .from('user_detail')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('user_id', user_id)
        .select()
        .single();
      return { data, error };
    }
  },

  // UserAddress (Kullanıcı Adresleri) functions
  userAddress: {
    // Adres ekle
    create: async (addressData: {
      user_id: string;
      title: string;
      full_name: string;
      phone: string;
      address: string;
      city: string;
      district: string;
      zip_code: string;
      is_default?: boolean;
    }) => {
      const { data, error } = await supabase
        .from('user_address')
        .insert([addressData])
        .select()
        .single();
      return { data, error };
    },
    // Kullanıcının adreslerini getir
    getByUserId: async (user_id: string) => {
      const { data, error } = await supabase
        .from('user_address')
        .select('*')
        .eq('user_id', user_id)
        .order('created_at', { ascending: false });
      return { data, error };
    },
    // Adresi varsayılan yap
    setDefault: async (user_id: string, address_id: string) => {
      // Önce tüm adreslerde is_default=false yap
      await supabase
        .from('user_address')
        .update({ is_default: false })
        .eq('user_id', user_id);
      // Sonra seçilen adreste is_default=true yap
      const { data, error } = await supabase
        .from('user_address')
        .update({ is_default: true })
        .eq('id', address_id)
        .select()
        .single();
      return { data, error };
    },
    // Adres güncelle
    update: async (address_id: string, updates: {
      title?: string;
      full_name?: string;
      phone?: string;
      address?: string;
      city?: string;
      district?: string;
      zip_code?: string;
      is_default?: boolean;
    }) => {
      const { data, error } = await supabase
        .from('user_address')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', address_id)
        .select()
        .single();
      return { data, error };
    },
    // Adres sil
    delete: async (address_id: string) => {
      const { error } = await supabase
        .from('user_address')
        .delete()
        .eq('id', address_id);
      return { error };
    }
  },

  // Helper functions
  helpers: {
    // String'den slug oluştur
    generateSlug: (text: string): string => {
      return text
        .toLowerCase()
        .replace(/ç/g, 'c')
        .replace(/ğ/g, 'g')
        .replace(/ı/g, 'i')
        .replace(/ö/g, 'o')
        .replace(/ş/g, 's')
        .replace(/ü/g, 'u')
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '-')
        .trim();
    }
  }
} 

export const createSupabaseClientWithToken = (accessToken: string) => {
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  });
}; 