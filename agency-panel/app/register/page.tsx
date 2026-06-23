"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { register } from "@/lib/api";
import { isAuthenticated } from "@/lib/auth";
import { Input } from "@/components/FormControls";
import Button from "@/components/Button";
import { useLang } from "@/lib/LangContext";

export default function RegisterPage() {
  const router = useRouter();
  const { t } = useLang();
  const tx = t.register;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string }>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated()) router.replace("/dashboard");
  }, [router]);

  const validate = () => {
    const errs: typeof errors = {};
    if (!name.trim()) errs.name = tx.nameRequired;
    if (!email.trim()) errs.email = tx.emailRequired;
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = tx.emailInvalid;
    if (!password) errs.password = tx.passwordRequired;
    else if (password.length < 8) errs.password = tx.passwordMin;
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setLoading(true);
    setApiError(null);
    try {
      await register({ name: name.trim(), email: email.trim(), password });
      sessionStorage.setItem("trekly_pending_email", email.trim());
      router.push("/verify-email");
    } catch (err) {
      setApiError(err instanceof Error ? err.message : tx.failed);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-bg flex">
      {/* Left panel */}
      <div className="hidden lg:flex w-1/2 bg-surface-sidebar relative overflow-hidden flex-col justify-between p-12">
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-brand-orange/10 -translate-y-1/3 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-brand-orange/5 translate-y-1/3 -translate-x-1/3" />
        <div className="absolute top-1/2 right-12 w-32 h-32 rounded-full border border-white/5" />

        <div className="relative flex items-center gap-3 animate-slide-up">
          <Image src="/logo.png" alt="Trekly" width={44} height={44} style={{ objectFit: 'contain' }} />
          <div>
            <span className="font-display font-bold text-white text-xl tracking-tight">Trekly</span>
            <span className="block text-[11px] font-body text-white/40 uppercase tracking-widest -mt-0.5">{t.common.agencyPanel}</span>
          </div>
        </div>

        <div className="relative animate-slide-up" style={{ animationDelay: "100ms" }}>
          <p className="text-5xl font-display font-bold text-white leading-tight">
            {tx.brandline}<br />
            <span className="text-brand-orange">{tx.brandlineAccent}</span><br />
            {tx.brandlineEnd}
          </p>
          <p className="mt-6 text-base font-body text-white/50 leading-relaxed max-w-sm">{tx.brandSub}</p>
        </div>

        <div className="relative flex flex-col gap-3 animate-slide-up" style={{ animationDelay: "200ms" }}>
          {tx.features.map((feat) => (
            <div key={feat} className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-brand-orange/20 flex items-center justify-center flex-shrink-0">
                <svg className="w-3 h-3 text-brand-orange" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-sm font-body text-white/60">{feat}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm animate-slide-up">
          <div className="flex lg:hidden items-center gap-3 mb-10">
            <Image src="/logo.png" alt="Trekly" width={36} height={36} style={{ objectFit: 'contain' }} />
            <span className="font-display font-bold text-text-primary text-lg">Trekly</span>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-display font-bold text-text-primary">{tx.heading}</h1>
            <p className="mt-2 text-sm font-body text-text-secondary">{tx.sub}</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label={tx.agencyName}
              type="text"
              required
              value={name}
              onChange={(e) => { setName(e.target.value); if (errors.name) setErrors((p) => ({ ...p, name: undefined })); setApiError(null); }}
              error={errors.name}
              placeholder={tx.agencyNamePlaceholder}
              autoComplete="organization"
            />
            <Input
              label={tx.email}
              type="email"
              required
              value={email}
              onChange={(e) => { setEmail(e.target.value); if (errors.email) setErrors((p) => ({ ...p, email: undefined })); setApiError(null); }}
              error={errors.email}
              placeholder={tx.emailPlaceholder}
              autoComplete="email"
            />
            <Input
              label={tx.password}
              type="password"
              required
              value={password}
              onChange={(e) => { setPassword(e.target.value); if (errors.password) setErrors((p) => ({ ...p, password: undefined })); setApiError(null); }}
              error={errors.password}
              placeholder={tx.passwordPlaceholder}
              autoComplete="new-password"
            />

            {apiError && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 animate-fade-in">
                <p className="text-sm font-body text-red-600">{apiError}</p>
              </div>
            )}

            <Button type="submit" size="lg" loading={loading} className="w-full mt-2">
              {tx.submit}
            </Button>
          </form>

          <p className="mt-8 text-center text-xs font-body text-text-muted">
            {tx.hasAccount}{" "}
            <Link href="/login" className="text-brand-orange font-semibold hover:underline">
              {tx.login}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
