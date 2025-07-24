"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);

  const router = useRouter();

  // access_token ve refresh_token'ı URL hash'inden oku
  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.slice(1)); // remove #
    const access_token = hashParams.get("access_token");
    const refresh_token = hashParams.get("refresh_token");

    if (!access_token || !refresh_token) {
      toast.error("Geçersiz veya süresi dolmuş bağlantı.");
    } else {
      setAccessToken(access_token);
      setRefreshToken(refresh_token);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken || !refreshToken) {
      toast.error("Oturum bilgileri eksik.");
      return;
    }

    setLoading(true);

    // accessToken ve refreshToken ile oturumu başlat
    const { error: sessionError } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    if (sessionError) {
      toast.error("Oturum başlatılamadı.");
      setLoading(false);
      return;
    }

    // Şifreyi güncelle
    const { error } = await supabase.auth.updateUser({ password });
    if (!error) {
      toast.success("Şifreniz başarıyla değiştirildi!");
      router.push("/login");
    } else {
      toast.error("Şifre değiştirilemedi.");
    }

    setLoading(false);
  };

  return (
    <div style={{
      maxWidth: 400,
      margin: "3rem auto",
      padding: 24,
      background: "#fff",
      borderRadius: 8,
      boxShadow: "0 2px 16px rgba(0,0,0,0.08)",
      color: "#222"
    }}>
      <h2 style={{ marginBottom: 20, color: "#222" }}>Yeni Şifre Belirle</h2>
      <form onSubmit={handleSubmit} style={{
        display: "flex",
        flexDirection: "column",
        gap: 16
      }}>
        <input
          type="password"
          placeholder="Yeni şifre"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          style={{
            padding: 10,
            borderRadius: 6,
            border: "1px solid #ccc",
            color: "#222",
            background: "#fff"
          }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: 10,
            borderRadius: 6,
            background: "#222",
            color: "#fff",
            border: "none",
            fontWeight: 600
          }}>
          {loading ? "Kaydediliyor..." : "Şifreyi Değiştir"}
        </button>
      </form>
    </div>
  );
}
