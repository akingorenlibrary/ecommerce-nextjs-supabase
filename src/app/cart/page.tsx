"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCart } from "@/contexts/CartContext";
import styles from "./page.module.css";

export default function CartPage() {
  const router = useRouter();
  const { cartItems, cartCount, cartTotal, removeFromCart, updateQuantity } = useCart();

  const handleCheckout = () => {
    if (cartCount === 0) {
      toast.error('Sepetiniz boş!');
      return;
    }
    router.push('/checkout');
  };

  if (cartCount === 0) {
    return (
      <>
        <Navbar />
        <main className={styles.container}>
          <div className={styles.empty}>
            <i className="bi bi-cart-x" style={{ fontSize: '3rem', marginBottom: '1rem' }}></i>
            <h2>Sepetiniz Boş</h2>
            <button onClick={() => router.push("/")} className={styles.btnPrimary}>Alışverişe Başla</button>
          </div>
        </main>
        <Footer />
      </>
    );
  }
  
  

  return (
    <>
      <Navbar />
      <main className={styles.container}>
        <h1 className={styles.title}>Sepetim</h1>
        <div className={styles.content}>
          <section className={styles.items}>
            {cartItems.map((item) => (
              <div key={item.id} className={styles.item}>
                <img src={item.image_url_1 || ""} alt={item.name} />
                <div className={styles.info}>
                  <h3>{item.name}</h3>
                  <p>{item.price.toLocaleString("tr-TR")} ₺</p>
                  <div className={styles.controls}>
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)} disabled={item.quantity <= 1}>-</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                  </div>
                </div>
                <button onClick={() => removeFromCart(item.id)} className={styles.remove}>×</button>
              </div>
            ))}
          </section>

                     <aside className={styles.summary}>
             <h2>Özet</h2>
             <p>Toplam: <strong>{cartTotal.toLocaleString("tr-TR")} ₺</strong></p>
             <button onClick={handleCheckout} className={styles.btnPrimary}>Alışverişi Tamamla</button>
           </aside>
        </div>
      </main>
      <Footer />
    </>
  );
}
