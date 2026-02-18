"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { Mail, Lock, Eye, EyeOff, ArrowLeft, Loader2 } from "lucide-react";

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

function AuthForm() {
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<"signin" | "signup">(
    searchParams.get("tab") === "signup" ? "signup" : "signin"
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();
  const supabase = createClient();

  const handleGoogle = async () => {
    setGoogleLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback?next=/dashboard` },
    });
    if (error) { setError(error.message); setGoogleLoading(false); }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      if (tab === "signup") {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { emailRedirectTo: `${window.location.origin}/dashboard` },
        });
        if (error) throw error;
        setSuccess("Check your email to confirm your account!");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", background: "#000" }}>

      {/* Left Panel */}
      <div style={{
        flex: 1, display: "flex", flexDirection: "column",
        justifyContent: "center", padding: "60px",
        borderRight: "1px solid #111", background: "#050505",
      }} className="auth-left-panel">
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none", marginBottom: "56px" }}>
          <Image src="/favicon.png" alt="LinguaAid" width={32} height={32} style={{ borderRadius: "8px" }} />
          <span style={{ fontSize: "18px", fontWeight: "800", color: "#fff" }}>LinguaAid</span>
        </Link>

        <h1 style={{ fontSize: "clamp(26px, 3.5vw, 40px)", fontWeight: "900", letterSpacing: "-1.5px", lineHeight: "1.1", marginBottom: "14px", color: "#fff" }}>
          Breaking Language<br />
          <span style={{ color: "#fff", opacity: 0.25 }}>Barriers Together</span>
        </h1>
        <p style={{ color: "#fff", opacity: 0.35, fontSize: "15px", lineHeight: "1.7", maxWidth: "380px", marginBottom: "48px" }}>
          Join thousands of immigrants and refugees who use LinguaAid to
          understand official documents in their native language.
        </p>

        <div className="glass-card" style={{ padding: "22px", maxWidth: "380px" }}>
          <p style={{ color: "#fff", opacity: 0.45, fontSize: "13px", lineHeight: "1.7", fontStyle: "italic", marginBottom: "14px" }}>
            &ldquo;I finally understood my hospital discharge papers. LinguaAid
            explained everything in Hindi — even the medical terms.&rdquo;
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{
              width: "30px", height: "30px", borderRadius: "50%",
              background: "#1a1a1a", border: "1px solid #222",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "12px", fontWeight: "700", color: "#fff", opacity: 0.5,
            }}>P</div>
            <div>
              <div style={{ fontSize: "12px", fontWeight: "600", color: "#fff" }}>Priya S.</div>
              <div style={{ fontSize: "11px", color: "#fff", opacity: 0.3 }}>New arrival, California</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div style={{
        width: "440px", display: "flex", flexDirection: "column",
        justifyContent: "center", padding: "60px 48px", flexShrink: 0,
      }} className="auth-right-panel">
        <Link href="/" style={{
          display: "inline-flex", alignItems: "center", gap: "6px",
          color: "#fff", opacity: 0.3, textDecoration: "none", fontSize: "13px",
          marginBottom: "40px", transition: "opacity 0.15s ease",
        }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.opacity = "0.7")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.opacity = "0.3")}
        >
          <ArrowLeft size={13} /> Back to home
        </Link>

        {/* Tabs */}
        <div style={{
          display: "flex", background: "#0a0a0a", borderRadius: "8px",
          padding: "3px", marginBottom: "24px", border: "1px solid #111",
        }}>
          {(["signin", "signup"] as const).map((t) => (
            <button key={t} onClick={() => { setTab(t); setError(""); setSuccess(""); }} style={{
              flex: 1, padding: "9px", borderRadius: "6px", border: "none",
              cursor: "pointer", fontSize: "13px", fontWeight: "700",
              fontFamily: "Inconsolata, monospace", transition: "all 0.15s ease",
              background: tab === t ? "#fff" : "transparent",
              color: tab === t ? "#000" : "#444",
            }}>
              {t === "signin" ? "Sign In" : "Sign Up"}
            </button>
          ))}
        </div>

        <h2 style={{ fontSize: "20px", fontWeight: "800", marginBottom: "4px", color: "#fff", letterSpacing: "-0.5px" }}>
          {tab === "signin" ? "Welcome back" : "Create your account"}
        </h2>
        <p style={{ color: "#fff", opacity: 0.35, fontSize: "13px", marginBottom: "22px" }}>
          {tab === "signin" ? "Sign in to access your translation history." : "Free forever. No credit card required."}
        </p>

        {/* Google */}
        <button onClick={handleGoogle} disabled={googleLoading} style={{
          width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
          padding: "11px", borderRadius: "8px", background: "#111", border: "1px solid #222",
          cursor: googleLoading ? "not-allowed" : "pointer",
          color: "#fff", fontFamily: "Inconsolata, monospace", fontSize: "14px", fontWeight: "600",
          transition: "all 0.15s ease", marginBottom: "16px",
          opacity: googleLoading ? 0.6 : 1,
        }}
          onMouseEnter={(e) => { if (!googleLoading) (e.currentTarget as HTMLElement).style.borderColor = "#444"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "#222"; }}
        >
          {googleLoading ? <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> : <GoogleIcon />}
          Continue with Google
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
          <div style={{ flex: 1, height: "1px", background: "#111" }} />
          <span style={{ fontSize: "11px", color: "#333", fontWeight: "600", letterSpacing: "0.06em" }}>OR</span>
          <div style={{ flex: 1, height: "1px", background: "#111" }} />
        </div>

        <form onSubmit={handleAuth} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div>
            <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "#444", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Email Address
            </label>
            <div style={{ position: "relative" }}>
              <Mail size={13} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#333" }} />
              <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com" required className="input-field" style={{ paddingLeft: "34px" }} />
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "#444", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Password
            </label>
            <div style={{ position: "relative" }}>
              <Lock size={13} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#333" }} />
              <input id="password" type={showPassword ? "text" : "password"} value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={tab === "signup" ? "Min. 6 characters" : "Your password"}
                required minLength={6} className="input-field" style={{ paddingLeft: "34px", paddingRight: "36px" }} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} style={{
                position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)",
                background: "transparent", border: "none", cursor: "pointer", color: "#333", padding: 0, display: "flex",
              }}>
                {showPassword ? <EyeOff size={13} /> : <Eye size={13} />}
              </button>
            </div>
          </div>

          {error && (
            <div style={{ padding: "10px 14px", borderRadius: "8px", background: "rgba(255,68,68,0.06)", border: "1px solid rgba(255,68,68,0.2)", color: "#ff6666", fontSize: "13px" }}>
              {error}
            </div>
          )}
          {success && (
            <div style={{ padding: "10px 14px", borderRadius: "8px", background: "rgba(68,255,136,0.06)", border: "1px solid rgba(68,255,136,0.2)", color: "#44ff88", fontSize: "13px" }}>
              {success}
            </div>
          )}

          <button id="auth-submit-btn" type="submit" disabled={loading} className="btn-primary" style={{
            marginTop: "4px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
            opacity: loading ? 0.6 : 1, cursor: loading ? "not-allowed" : "pointer",
          }}>
            {loading && <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />}
            {tab === "signin" ? "Sign In" : "Create Account"}
          </button>
        </form>

        <p style={{ marginTop: "16px", textAlign: "center", fontSize: "12px", color: "#444" }}>
          {tab === "signin" ? "Don't have an account? " : "Already have an account? "}
          <button onClick={() => { setTab(tab === "signin" ? "signup" : "signin"); setError(""); setSuccess(""); }} style={{
            background: "transparent", border: "none", cursor: "pointer",
            color: "#fff", fontFamily: "Inconsolata, monospace", fontSize: "12px", fontWeight: "600",
          }}>
            {tab === "signin" ? "Sign up free" : "Sign in"}
          </button>
        </p>
      </div>

      <style jsx>{`
        @media (max-width: 860px) {
          .auth-left-panel { display: none !important; }
          .auth-right-panel { width: 100% !important; padding: 40px 24px !important; }
        }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: "#000" }} />}>
      <AuthForm />
    </Suspense>
  );
}
