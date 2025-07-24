"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./Navbar.module.css";
import { useCart } from "@/contexts/CartContext";
import { auth, db } from "@/lib/supabase";

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

export default function Navbar() {
  const { cartCount } = useCart();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const router = useRouter();
  
  useEffect(() => {
    checkUser();
    loadCategories();
    
    // Mobile navbar toggle functionality
    const handleNavbarToggle = () => {
      const navbarToggler = document.querySelector('.navbar-toggler') as HTMLButtonElement;
      const navbarCollapse = document.querySelector('#navbarNav') as HTMLElement;
      
      if (navbarToggler && navbarCollapse) {
        navbarToggler.addEventListener('click', (e) => {
          e.preventDefault();
          
          // Toggle the collapse class
          const isCollapsed = navbarCollapse.classList.contains('show');
          
          if (isCollapsed) {
            navbarCollapse.classList.remove('show');
            navbarToggler.setAttribute('aria-expanded', 'false');
          } else {
            navbarCollapse.classList.add('show');
            navbarToggler.setAttribute('aria-expanded', 'true');
          }
        });
      }
    };

    // Dropdown menu functionality
    const handleDropdownToggle = () => {
      const dropdownToggle = document.querySelector('.dropdown-toggle') as HTMLElement;
      const dropdownMenu = document.querySelector('.dropdown-menu') as HTMLElement;
      
      if (dropdownToggle && dropdownMenu) {
        dropdownToggle.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          
          // Toggle dropdown menu
          const isOpen = dropdownMenu.classList.contains('show');
          
          // Close all other dropdowns first
          const allDropdowns = document.querySelectorAll('.dropdown-menu');
          allDropdowns.forEach(menu => menu.classList.remove('show'));
          
          if (!isOpen) {
            dropdownMenu.classList.add('show');
          }
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
          if (!dropdownToggle.contains(e.target as Node) && !dropdownMenu.contains(e.target as Node)) {
            dropdownMenu.classList.remove('show');
          }
        });
      }
    };

    // Mobile touch handling for submenu dropdowns
    const handleSubmenuClick = (e: Event) => {
      const clickedItem = e.currentTarget as HTMLElement;
      const submenuParent = clickedItem.closest('.dropdown-submenu') as HTMLElement;
      
      // Only handle clicks on main category links with arrows
      if (submenuParent && clickedItem.querySelector('.arrow')) {
        e.preventDefault();
        e.stopPropagation();
        
        // Toggle the mobile-open class
        if (submenuParent.classList.contains('mobile-open')) {
          submenuParent.classList.remove('mobile-open');
        } else {
          // Close other open submenus first
          const allSubmenus = document.querySelectorAll('.dropdown-submenu');
          allSubmenus.forEach(menu => menu.classList.remove('mobile-open'));
          
          // Open clicked submenu
          submenuParent.classList.add('mobile-open');
        }
      }
      // For sub-category links, allow normal navigation (no preventDefault)
    };
    
    const handleMobileDropdowns = () => {
      // Check if it's a mobile/touch device
      const isMobile = window.innerWidth <= 768 || 'ontouchstart' in window;
      
      if (isMobile) {
        // Only handle main category links that have arrows (submenu toggles)
        const mainCategoryItems = document.querySelectorAll('.dropdown-submenu > a');
        
        mainCategoryItems.forEach((item) => {
          // Check if this is a main category link with arrow
          if (item.querySelector('.arrow')) {
            // Remove any existing click handlers
            item.removeEventListener('click', handleSubmenuClick);
            
            // Add click handler for mobile submenu toggle
            item.addEventListener('click', handleSubmenuClick);
          }
        });
      }
    };
    
    // Initialize everything
    setTimeout(() => {
      handleNavbarToggle();
      handleDropdownToggle();
      handleMobileDropdowns();
    }, 200);
    
    // Re-initialize on window resize
    window.addEventListener('resize', handleMobileDropdowns);
    
    // Cleanup function
    return () => {
      window.removeEventListener('resize', handleMobileDropdowns);
      const submenuItems = document.querySelectorAll('.dropdown-submenu > a');
      submenuItems.forEach((item) => {
        item.removeEventListener('click', handleSubmenuClick);
      });
      
      // Remove navbar toggler event listener
      const navbarToggler = document.querySelector('.navbar-toggler') as HTMLButtonElement;
      if (navbarToggler) {
        navbarToggler.removeEventListener('click', () => {});
      }
      
      // Remove dropdown event listeners
      const dropdownToggle = document.querySelector('.dropdown-toggle') as HTMLElement;
      if (dropdownToggle) {
        dropdownToggle.removeEventListener('click', () => {});
      }
    };
  }, []);

  const checkUser = async () => {
    try {
      const { user } = await auth.getCurrentUser();
      setUser(user);
    } catch (error) {
      console.error('Kullanıcı kontrolü hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const { data, error } = await db.categories.getAllWithSubcategories();
      if (error) {
        console.error('Kategoriler yüklenirken hata:', error);
      } else {
        setCategories(data || []);
      }
    } catch (error) {
      console.error('Kategoriler yüklenirken hata:', error);
    } finally {
      setCategoriesLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      setUser(null);
      router.push('/');
    } catch (error) {
      console.error('Çıkış yapılırken hata:', error);
    }
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light sticky-top" style={{backgroundColor: '#ffffff', borderBottom: '1px solid #ddd'}}>
      <div className="container">
        <a className="navbar-brand fw-bold fs-2" href="/" style={{color: '#000000'}}>
          EvDekor
        </a>
        
        <button 
          className="navbar-toggler" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarNav"
          aria-controls="navbarNav" 
          aria-expanded="false" 
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <a className="nav-link active" href="/" style={{color: '#000000'}}>Anasayfa</a>
            </li>
            
            {/* Ürünler Dropdown */}
            <li className="nav-item dropdown">
              <a className="nav-link dropdown-toggle" href="#" role="button" style={{color: '#000000'}}>
                Ürünler
              </a>
              <ul className="dropdown-menu">
                {categoriesLoading ? (
                  <li><div className="dropdown-item">Yükleniyor...</div></li>
                ) : categories.length > 0 ? (
                  categories.map((category) => (
                    <li key={category.id} className="dropdown-submenu">
                      <a className="dropdown-item" href={`/products/${category.slug}`}>
                        {category.name}
                        {category.subcategories && category.subcategories.length > 0 && (
                          <span className="arrow">›</span>
                        )}
                      </a>
                      {category.subcategories && category.subcategories.length > 0 && (
                        <ul className="dropdown-menu">
                          {category.subcategories.map((subcategory) => (
                            <li key={subcategory.id}>
                              <a 
                                className="dropdown-item" 
                                href={`/products/${category.slug}?filter=${subcategory.slug}`}
                              >
                                {subcategory.name}
                              </a>
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  ))
                ) : (
                  <li><div className="dropdown-item">Kategori bulunamadı</div></li>
                )}
              </ul>
            </li>

            <li className="nav-item">
              <a className="nav-link" href="/about" style={{color: '#000000'}}>Hakkımızda</a>
            </li>

            <li className="nav-item">
              <a className="nav-link" href="/contact" style={{color: '#000000'}}>İletişim</a>
            </li>

            {user && (
              <>
                <li className="nav-item">
                  <a className="nav-link" href="/my-orders" style={{color: '#000000'}}>Siparişlerim</a>
                </li>

                <li className="nav-item">
                  <a className="nav-link" href="/my-account" style={{color: '#000000'}}>Hesabım</a>
                </li>
              </>
            )}

            <li className="nav-item">
              <a className="nav-link" href="/order-tracking" style={{color: '#000000'}}>Sipariş Takip</a>
            </li>
          </ul>
          
          {/* User Actions */}
          <div className="d-flex gap-2">
            {!loading && (
              <>
                {user ? (
                  // Kullanıcı giriş yapmışsa
                  <button 
                    onClick={handleLogout}
                    className="btn btn-outline-dark" 
                    style={{borderColor: '#000000', color: '#000000'}}
                  >
                    Çıkış Yap
                  </button>
                ) : (
                  // Kullanıcı giriş yapmamışsa
                  <a 
                    href="/login" 
                    className="btn btn-outline-dark" 
                    style={{borderColor: '#000000', color: '#000000', textDecoration: 'none'}}
                  >
                    Giriş
                  </a>
                )}
              </>
            )}
            
            <a 
              href="/cart"
              className={`btn ${styles.cartButton}`} 
              style={{
                backgroundColor: 'white', 
                border: '1px solid #000000', 
                padding: '8px 12px',
                fontSize: '18px',
                color: '#000000',
                textDecoration: 'none',
                position: 'relative'
              }}
            >
              🛒
              {cartCount > 0 && (
                <span 
                  style={{
                    position: 'absolute',
                    top: '-5px',
                    right: '-5px',
                    backgroundColor: '#e74c3c',
                    color: 'white',
                    borderRadius: '50%',
                    width: '20px',
                    height: '20px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    lineHeight: '1'
                  }}
                >
                  {cartCount}
                </span>
              )}
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
} 