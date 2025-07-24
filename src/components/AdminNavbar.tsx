"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { adminAuth } from "@/lib/supabase";

export default function AdminNavbar() {
  const router = useRouter();

  useEffect(() => {
    // Bootstrap JS yükle (çökmesin)
    if (typeof window !== "undefined") {
      require("bootstrap/dist/js/bootstrap.bundle.min.js");
    }
  }, []);

  const handleLogout = () => {
    adminAuth.signOut();
    router.push("/admin/login");
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container">
        <Link className="navbar-brand fw-bold" href="/admin/dashboard">
          Admin Panel
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#adminNavbar"
          aria-controls="adminNavbar"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="adminNavbar">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <Link className="nav-link" href="/admin/dashboard">
                Anasayfa
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" href="/admin/categories">
                Kategoriler
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" href="/admin/products">
                Ürünler
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" href="/admin/orders">
                Siparişler
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" href="/admin/profile">
                Profil
              </Link>
            </li>
          </ul>

          <button
            className="btn btn-outline-light btn-sm"
            onClick={handleLogout}
          >
            Çıkış
          </button>
        </div>
      </div>
    </nav>
  );
}
