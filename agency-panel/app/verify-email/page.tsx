"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { verifyEmail, resendOtp } from "@/lib/api";
import { setToken, setAgency } from "@/lib/auth";
import { useLang } from "@/lib/LangContext";

const OTP_LENGTH = 6;
const OTP_TTL = 15 * 60;

export default function VerifyEmailPage() {
  const router = useRouter();
  const { t } = useLang();
  const tx = t.verify;

  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [email, setEmail] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [seconds, setSeconds] = useState(OTP_TTL);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const pending = sessionStorage.getItem("trekly_pending_email");
    if (!pending) { router.replace("/register"); return; }
    setEmail(pending);
    inputRefs.current[0]?.focus();
  }, [router]);

  useEffect(() => {
    if (seconds <= 0) return;
    const id = setInterval(() => setSeconds((s) => s - 1), 1000);
    return () => clearInterval(id);
  }, [seconds]);

  const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const handleDigit = (index: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...digits];
    next[index] = val.slice(-1);
    setDigits(next);
    setError(null);
    if (val && index < OTP_LENGTH - 1) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (!pasted) return;
    const next = Array(OTP_LENGTH).fill("");
    pasted.split("").forEach((c, i) => { next[i] = c; });
    setDigits(next);
    const focusIdx = Math.min(pasted.length, OTP_LENGTH - 1);
    inputRefs.current[focusIdx]?.focus();
  };

  const submit = useCallback(async (otp: string) => {
    if (otp.length < OTP_LENGTH) return;
    setLoading(true);
    setError(null);
    try {
      const res = await verifyEmail({ email, otp });
      setToken(res.access_token);
      setAgency({ id: res.id, name: res.name, email: res.email, logo_url: res.logo_url, phone: res.phone, description: res.description, created_at: res.created_at });
      sessionStorage.removeItem("trekly_pending_email");
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : tx.invalidCode);
      setDigits(Array(OTP_LENGTH).fill(""));
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  }, [email, router, tx.invalidCode]);

  useEffect(() => {
    const otp = digits.join("");
    if (otp.length === OTP_LENGTH) submit(otp);
  }, [digits, submit]);

  const handleResend = async () => {
    setResending(true);
    setError(null);
    try {
      await resendOtp({ email });
      setSeconds(OTP_TTL);
      setDigits(Array(OTP_LENGTH).fill(""));
      inputRefs.current[0]?.focus();
      setSuccess(tx.newCodeSent);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : tx.sendFailed);
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-bg flex">
      {/* Left panel */}
      <div className="hidden lg:flex w-1/2 bg-surface-sidebar relative overflow-hidden flex-col justify-between p-12">
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-brand-orange/10 -translate-y-1/3 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-brand-orange/5 translate-y-1/3 -translate-x-1/3" />

        <div className="relative flex items-center gap-3 animate-slide-up">
          <Image src="/logo.png" alt="Trekly" width={44} height={44} style={{ objectFit: 'contain' }} />
          <div>
            <span className="font-display font-bold text-white text-xl tracking-tight">Trekly</span>
            <span className="block text-[11px] font-body text-white/40 uppercase tracking-widest -mt-0.5">{t.common.agencyPanel}</span>
          </div>
        </div>

        <div className="relative animate-slide-up" style={{ animationDelay: "100ms" }}>
          <div className="w-20 h-20 rounded-3xl bg-brand-orange/15 flex items-center justify-center mb-8">
            <svg className="w-10 h-10 text-brand-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-4xl font-display font-bold text-white leading-tight">
            {tx.brandHeading}<br />
            <span className="text-brand-orange">{tx.brandHeadingAccent}</span>
          </p>
          <p className="mt-6 text-base font-body text-white/50 leading-relaxed max-w-sm">{tx.brandSub}</p>
        </div>

        <div className="relative animate-slide-up" style={{ animationDelay: "200ms" }}>
          <p className="text-sm font-body text-white/30">{email}</p>
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
            <p className="mt-2 text-sm font-body text-text-secondary">
              <span className="font-semibold text-text-primary">{email}</span> {tx.sentTo}
            </p>
          </div>

          <div className="flex gap-2 mb-6" onPaste={handlePaste}>
            {digits.map((d, i) => (
              <input
                key={i}
                ref={(el) => { inputRefs.current[i] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={d}
                onChange={(e) => handleDigit(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                disabled={loading}
                style={{ width: '48px', height: '56px', flexShrink: 0 }}
                className={[
                  "rounded-xl border-2 text-center text-xl font-display font-bold",
                  "transition-all duration-150 outline-none",
                  "bg-surface-bg text-text-primary",
                  error ? "border-red-400 bg-red-50" : d ? "border-brand-orange bg-orange-50" : "border-gray-200 focus:border-brand-orange",
                  loading ? "opacity-50 cursor-not-allowed" : "",
                ].join(" ")}
              />
            ))}
          </div>

          <div className="flex items-center justify-between mb-6">
            <span className={`text-sm font-body font-mono ${seconds <= 60 ? "text-red-500" : "text-text-muted"}`}>
              {seconds > 0 ? `${tx.codeExpires} ${fmt(seconds)}` : tx.codeExpired}
            </span>
            <button
              onClick={handleResend}
              disabled={resending || seconds > 0}
              className={`text-sm font-body font-semibold transition-colors ${seconds > 0 ? "text-text-muted cursor-not-allowed" : "text-brand-orange hover:underline"}`}
            >
              {resending ? tx.resending : tx.resend}
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4 animate-fade-in">
              <p className="text-sm font-body text-red-600">{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 mb-4 animate-fade-in">
              <p className="text-sm font-body text-green-700">{success}</p>
            </div>
          )}

          {loading && (
            <div className="flex items-center justify-center gap-2 py-2">
              <div className="w-4 h-4 rounded-full border-2 border-brand-orange border-t-transparent animate-spin" />
              <span className="text-sm font-body text-text-secondary">{tx.verifying}</span>
            </div>
          )}

          <p className="mt-8 text-center text-xs font-body text-text-muted">
            {tx.backToRegister}{" "}
            <a href="/register" className="text-brand-orange font-semibold hover:underline">{tx.back}</a>
          </p>
        </div>
      </div>
    </div>
  );
}
