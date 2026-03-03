"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { Menu, X, LogOut, LayoutDashboard, FileText } from "lucide-react";

interface NavbarProps {
  onAuthClick?: (tab: "signin" | "signup") => void;
}

export default function Navbar({ onAuthClick }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const isHome = pathname === "/";

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);



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
        </div>
      </div>




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
