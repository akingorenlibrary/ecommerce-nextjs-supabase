"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { adminAuth } from "@/lib/supabase";

interface AdminProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function AdminProtectedRoute({ children, fallback }: AdminProtectedRouteProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [admin, setAdmin] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
      const currentAdmin = adminAuth.getCurrentAdmin();
      
      if (currentAdmin) {
        setAdmin(currentAdmin);
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
        // Redirect to admin login if not authenticated
        router.push("/admin/login");
      }
    };

    checkAuth();

    // Check auth on localStorage changes (in case user logs out in another tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'adminSession') {
        checkAuth();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [router]);

  // Show loading state while checking authentication
  if (isAuthenticated === null) {
    return fallback || (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px'
      }}>
        Yükleniyor...
      </div>
    );
  }

  // If not authenticated, don't render children (redirect will happen)
  if (!isAuthenticated) {
    return null;
  }

  // If authenticated, render children with admin context
  return (
    <div>
      {/* Admin info can be passed to children if needed */}
      {children}
    </div>
  );
} 