"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Menu, X, LogOut, LayoutDashboard, FileText } from "lucide-react";

interface NavbarProps {
  onAuthClick?: (tab: "signin" | "signup") => void;
}

export default function Navbar({ onAuthClick }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState<{ email?: string } | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();
  const isHome = pathname === "/";

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user ? { email: data.user.email } : null);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ? { email: session.user.email } : null);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  const handleAuth = (tab: "signin" | "signup") => {
    setMenuOpen(false);
    if (isHome && onAuthClick) {
      onAuthClick(tab);
    } else {
      router.push(`/auth?tab=${tab}`);
    }
  };

  return (
    <nav className="navbar" style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 200,
      transition: "all 0.2s ease",
      background: scrolled ? "rgba(0,0,0,0.96)" : "rgba(0,0,0,0.7)",
      backdropFilter: "blur(20px)",
      borderBottom: "1px solid #1a1a1a",
    }}>
      <div style={{
        maxWidth: "1100px", margin: "0 auto", padding: "0 20px",
        height: "60px", display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>

        {/* Logo */}
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "9px", textDecoration: "none", flexShrink: 0 }}>
          <Image src="/favicon.png" alt="LinguaAid" width={26} height={26} style={{ borderRadius: "6px" }} />
          <span style={{ fontSize: "16px", fontWeight: "800", color: "#fff", letterSpacing: "-0.3px" }}>
            LinguaAid
          </span>
        </Link>

        {/* Desktop right side */}
        <div className="desk-actions" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {user ? (
            <>
              {/* Single set: icon always shown, text shown only on desktop via CSS */}
              <Link href="/dashboard" className="nav-action-btn" style={{
                display: "flex", alignItems: "center", gap: "6px",
                padding: "7px 10px", borderRadius: "7px", textDecoration: "none",
                fontSize: "13px", fontWeight: "600", color: "#ccc",
                border: "1px solid #2a2a2a", background: "#0d0d0d",
                transition: "all 0.15s ease",
              }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.color = "#fff";
                  (e.currentTarget as HTMLElement).style.borderColor = "#444";
                  (e.currentTarget as HTMLElement).style.background = "#1a1a1a";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.color = "#ccc";
                  (e.currentTarget as HTMLElement).style.borderColor = "#2a2a2a";
                  (e.currentTarget as HTMLElement).style.background = "#0d0d0d";
                }}
              >
                <LayoutDashboard size={15} />
                <span className="nav-btn-label">Dashboard</span>
              </Link>

              <Link href="/translate" className="nav-action-btn" style={{
                display: "flex", alignItems: "center", gap: "6px",
                padding: "7px 10px", borderRadius: "7px", textDecoration: "none",
                fontSize: "13px", fontWeight: "700", color: "#000",
                background: "#fff", border: "1px solid #fff",
                transition: "all 0.15s ease",
              }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#e0e0e0"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "#fff"; }}
              >
                <FileText size={15} />
                <span className="nav-btn-label">Translate</span>
              </Link>

              <button onClick={handleSignOut} className="nav-action-btn" style={{
                display: "flex", alignItems: "center", gap: "6px",
                padding: "7px 10px", borderRadius: "7px",
                background: "#0d0d0d", border: "1px solid #2a2a2a",
                cursor: "pointer", color: "#888",
                fontFamily: "Inconsolata, monospace",
                fontSize: "12px", fontWeight: "600",
                transition: "all 0.15s ease",
              }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.color = "#ff6666";
                  (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,68,68,0.3)";
                  (e.currentTarget as HTMLElement).style.background = "rgba(255,68,68,0.06)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.color = "#888";
                  (e.currentTarget as HTMLElement).style.borderColor = "#2a2a2a";
                  (e.currentTarget as HTMLElement).style.background = "#0d0d0d";
                }}
              >
                <LogOut size={15} />
                <span className="nav-btn-label">Sign Out</span>
              </button>
            </>
          ) : (
            <>
              <button onClick={() => handleAuth("signin")} className="mob-hide-btn" style={{
                padding: "7px 14px", borderRadius: "7px",
                fontSize: "13px", fontWeight: "600", color: "#ccc",
                border: "1px solid #2a2a2a", background: "#0d0d0d",
                cursor: "pointer", fontFamily: "Inconsolata, monospace",
                transition: "all 0.15s ease",
              }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.color = "#fff";
                  (e.currentTarget as HTMLElement).style.borderColor = "#444";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.color = "#ccc";
                  (e.currentTarget as HTMLElement).style.borderColor = "#2a2a2a";
                }}
              >
                Sign In
              </button>
              <button onClick={() => handleAuth("signup")} className="mob-hide-btn" style={{
                padding: "7px 14px", borderRadius: "7px",
                fontSize: "13px", fontWeight: "700", color: "#000",
                background: "#fff", border: "1px solid #fff",
                cursor: "pointer", fontFamily: "Inconsolata, monospace",
                transition: "all 0.15s ease",
              }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#e0e0e0"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "#fff"; }}
              >
                Get Started
              </button>
              {/* Hamburger — only for logged-out mobile */}
              <button onClick={() => setMenuOpen(!menuOpen)} className="mob-btn" style={{
                background: "#0d0d0d", border: "1px solid #2a2a2a",
                borderRadius: "7px", cursor: "pointer", color: "#fff",
                padding: "7px", display: "none", alignItems: "center",
              }}>
                {menuOpen ? <X size={17} /> : <Menu size={17} />}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="mobile-menu" style={{
          background: "#050505", borderTop: "1px solid #111",
          padding: "16px 20px",
        }}>
          {user ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <button onClick={handleSignOut} style={{
                display: "flex", alignItems: "center", gap: "8px",
                padding: "12px 14px", borderRadius: "8px",
                fontSize: "14px", fontWeight: "600", color: "#ff6666",
                background: "rgba(255,68,68,0.06)", border: "1px solid rgba(255,68,68,0.2)",
                cursor: "pointer", fontFamily: "Inconsolata, monospace", textAlign: "left",
              }}>
                <LogOut size={15} /> Sign Out
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", gap: "8px" }}>
              <button onClick={() => handleAuth("signin")} style={{
                flex: 1, padding: "11px", borderRadius: "8px",
                fontSize: "14px", fontWeight: "600", color: "#fff",
                background: "#0d0d0d", border: "1px solid #333",
                cursor: "pointer", fontFamily: "Inconsolata, monospace",
              }}>
                Sign In
              </button>
              <button onClick={() => handleAuth("signup")} style={{
                flex: 1, padding: "11px", borderRadius: "8px",
                fontSize: "14px", fontWeight: "700", color: "#000",
                background: "#fff", border: "none",
                cursor: "pointer", fontFamily: "Inconsolata, monospace",
              }}>
                Get Started
              </button>
            </div>
          )}
        </div>
      )}


      <style>{`
        /* Desktop: show text labels in nav buttons */
        .nav-btn-label { display: inline; }

        /* Mobile: icon only — hide text labels */
        @media (max-width: 640px) {
          .nav-btn-label { display: none; }
          /* Tighten padding on mobile so buttons fit */
          .nav-action-btn { padding: 8px !important; }
          /* Hide Sign In / Get Started (logged-out) buttons, show hamburger */
          .mob-hide-btn { display: none !important; }
          .mob-btn { display: flex !important; }
        }

        /* Mobile Menu */
        .mobile-menu {
          position: fixed !important;
          top: 60px !important;
          left: 0 !important;
          right: 0 !important;
          bottom: 0 !important;
          height: calc(100vh - 60px) !important;
          background: rgba(5,5,5,0.98) !important;
          backdrop-filter: blur(24px);
          padding: 40px 24px !important;
          z-index: 1000 !important;
          display: flex !important;
          flex-direction: column;
          gap: 16px;
          animation: slideDown 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .mobile-menu a, .mobile-menu button {
           font-size: 16px !important;
           padding: 16px !important;
           justify-content: flex-start !important;
        }

        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </nav>
  );
}
