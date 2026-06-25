"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { adminLogin } from "@/lib/api";
import { setAdminToken, isAdminAuthenticated } from "@/lib/auth";
import { ApiError } from "@/lib/api";
import Button from "@/components/Button";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAdminAuthenticated()) router.replace("/admin/agencies");
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await adminLogin(email, password);
      setAdminToken(res.access_token);
      router.replace("/admin/agencies");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Giriş başarısız");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 w-full max-w-sm">
        <div className="mb-8 text-center">
          <span className="inline-block text-2xl font-bold text-gray-900 tracking-tight">
            Trekly <span className="text-brand-orange">Admin</span>
          </span>
          <p className="text-sm text-gray-500 mt-1">Yönetim Paneli</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">E-posta</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/30 focus:border-brand-orange"
              placeholder="admin@treklyapp.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Şifre</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/30 focus:border-brand-orange"
            />
          </div>

          {error && (
            <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>
          )}

          <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full mt-2">
            Giriş Yap
          </Button>
        </form>
      </div>
    </div>
  );
}
