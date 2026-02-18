"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { X, Mail, Lock, Eye, EyeOff, Loader2, Chrome } from "lucide-react";

interface AuthModalProps {
  open: boolean;
  defaultTab?: "signin" | "signup";
  onClose: () => void;
}

export default function AuthModal({ open, defaultTab = "signin", onClose }: AuthModalProps) {
  const [tab, setTab] = useState<"signin" | "signup">(defaultTab);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();
  const supabase = createClient();

  // Sync tab when prop changes
  useEffect(() => { setTab(defaultTab); }, [defaultTab]);

  // Lock body scroll when open
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const reset = () => { setEmail(""); setPassword(""); setError(""); setSuccess(""); };

  const handleTab = (t: "signin" | "signup") => { setTab(t); reset(); };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback?next=/dashboard` },
    });
    if (error) { setError(error.message); setGoogleLoading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
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
        onClose();
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(0,0,0,0.85)",
        backdropFilter: "blur(8px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "20px",
        animation: "fadeIn 0.15s ease",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#0a0a0a",
          border: "1px solid #222",
          borderRadius: "16px",
          width: "100%",
          maxWidth: "420px",
          padding: "32px",
          position: "relative",
          animation: "slideUp 0.2s ease",
        }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          style={{
            position: "absolute", top: "16px", right: "16px",
            background: "transparent", border: "none", cursor: "pointer",
            color: "#444", padding: "4px", borderRadius: "6px",
            display: "flex", transition: "color 0.15s ease",
          }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "#fff")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "#444")}
        >
          <X size={18} />
        </button>

        {/* Logo + Title */}
        <div style={{ marginBottom: "24px" }}>
          <h2 style={{
            fontSize: "20px", fontWeight: "800", color: "#fff",
            letterSpacing: "-0.5px", marginBottom: "4px",
          }}>
            {tab === "signin" ? "Welcome back" : "Create your account"}
          </h2>
          <p style={{ fontSize: "13px", color: "#444" }}>
            {tab === "signin" ? "Sign in to access your translations." : "Free forever. No credit card required."}
          </p>
        </div>

        {/* Tab switcher */}
        <div style={{
          display: "flex", background: "#050505", borderRadius: "8px",
          padding: "3px", marginBottom: "20px", border: "1px solid #111",
        }}>
          {(["signin", "signup"] as const).map((t) => (
            <button key={t} onClick={() => handleTab(t)} style={{
              flex: 1, padding: "8px", borderRadius: "6px", border: "none",
              cursor: "pointer", fontSize: "13px", fontWeight: "700",
              fontFamily: "Inconsolata, monospace", transition: "all 0.15s ease",
              background: tab === t ? "#fff" : "transparent",
              color: tab === t ? "#000" : "#444",
            }}>
              {t === "signin" ? "Sign In" : "Sign Up"}
            </button>
          ))}
        </div>

        {/* Google */}
        <button
          onClick={handleGoogle}
          disabled={googleLoading}
          style={{
            width: "100%", display: "flex", alignItems: "center",
            justifyContent: "center", gap: "10px",
            padding: "11px", borderRadius: "8px",
            background: "#111", border: "1px solid #222",
            cursor: googleLoading ? "not-allowed" : "pointer",
            color: "#fff", fontFamily: "Inconsolata, monospace",
            fontSize: "14px", fontWeight: "600",
            transition: "all 0.15s ease",
            marginBottom: "16px",
            opacity: googleLoading ? 0.6 : 1,
          }}
          onMouseEnter={(e) => {
            if (!googleLoading) (e.currentTarget as HTMLElement).style.borderColor = "#444";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.borderColor = "#222";
          }}
        >
          {googleLoading
            ? <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />
            : <GoogleIcon />}
          Continue with Google
        </button>

        {/* Divider */}
        <div style={{
          display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px",
        }}>
          <div style={{ flex: 1, height: "1px", background: "#111" }} />
          <span style={{ fontSize: "11px", color: "#333", fontWeight: "600", letterSpacing: "0.06em" }}>OR</span>
          <div style={{ flex: 1, height: "1px", background: "#111" }} />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div>
            <label style={{
              display: "block", fontSize: "11px", fontWeight: "700",
              color: "#444", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.08em",
            }}>Email</label>
            <div style={{ position: "relative" }}>
              <Mail size={13} style={{
                position: "absolute", left: "11px", top: "50%",
                transform: "translateY(-50%)", color: "#333",
              }} />
              <input
                id="modal-email"
                type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com" required
                className="input-field" style={{ paddingLeft: "32px", fontSize: "13px", padding: "10px 10px 10px 32px" }}
              />
            </div>
          </div>

          <div>
            <label style={{
              display: "block", fontSize: "11px", fontWeight: "700",
              color: "#444", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.08em",
            }}>Password</label>
            <div style={{ position: "relative" }}>
              <Lock size={13} style={{
                position: "absolute", left: "11px", top: "50%",
                transform: "translateY(-50%)", color: "#333",
              }} />
              <input
                id="modal-password"
                type={showPw ? "text" : "password"} value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={tab === "signup" ? "Min. 6 characters" : "Your password"}
                required minLength={6}
                className="input-field"
                style={{ paddingLeft: "32px", paddingRight: "36px", fontSize: "13px", padding: "10px 36px 10px 32px" }}
              />
              <button type="button" onClick={() => setShowPw(!showPw)} style={{
                position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)",
                background: "transparent", border: "none", cursor: "pointer",
                color: "#333", padding: 0, display: "flex",
              }}>
                {showPw ? <EyeOff size={13} /> : <Eye size={13} />}
              </button>
            </div>
          </div>

          {error && (
            <div style={{
              padding: "9px 12px", borderRadius: "7px",
              background: "rgba(255,68,68,0.06)", border: "1px solid rgba(255,68,68,0.2)",
              color: "#ff6666", fontSize: "12px",
            }}>{error}</div>
          )}
          {success && (
            <div style={{
              padding: "9px 12px", borderRadius: "7px",
              background: "rgba(68,255,136,0.06)", border: "1px solid rgba(68,255,136,0.2)",
              color: "#44ff88", fontSize: "12px",
            }}>{success}</div>
          )}

          <button
            id="modal-submit-btn"
            type="submit" disabled={loading} className="btn-primary"
            style={{
              marginTop: "4px", display: "flex", alignItems: "center",
              justifyContent: "center", gap: "8px",
              opacity: loading ? 0.6 : 1, cursor: loading ? "not-allowed" : "pointer",
              padding: "11px",
            }}
          >
            {loading && <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />}
            {tab === "signin" ? "Sign In" : "Create Account"}
          </button>
        </form>

        <p style={{ marginTop: "16px", textAlign: "center", fontSize: "12px", color: "#333" }}>
          {tab === "signin" ? "Don't have an account? " : "Already have an account? "}
          <button
            onClick={() => handleTab(tab === "signin" ? "signup" : "signin")}
            style={{
              background: "transparent", border: "none", cursor: "pointer",
              color: "#888", fontFamily: "Inconsolata, monospace",
              fontSize: "12px", fontWeight: "600",
            }}
          >
            {tab === "signin" ? "Sign up free" : "Sign in"}
          </button>
        </p>
      </div>

      <style jsx>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

// Inline Google SVG icon
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
