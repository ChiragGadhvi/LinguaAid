"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import AuthModal from "@/components/AuthModal";
import {
  Upload, Zap, Shield, FileText, Heart, ArrowRight,
  CheckCircle, Languages, Sparkles, BookOpen, Home,
  Stethoscope, Scale, ChevronRight, Globe,
} from "lucide-react";

const LANGUAGES = [
  "Hindi","Arabic","Spanish","French","Mandarin","Portuguese",
  "Bengali","Russian","Urdu","Japanese","Swahili","Turkish",
  "Korean","Vietnamese","Thai","Tagalog","Amharic","Somali",
  "Haitian Creole","Pashto","Dari","Tigrinya","Burmese","Nepali",
  "Khmer","Lao","Hmong","Yoruba","Igbo","Zulu","Malay",
  "Indonesian","Persian","Punjabi","Tamil","Telugu","Gujarati",
  "Marathi","Kannada","Malayalam","Sinhala","Ukrainian","Polish",
  "Romanian","Dutch","Swedish","Norwegian","German","Italian",
];

const DOCUMENT_TYPES = [
  { icon: Stethoscope, label: "Healthcare Forms",     desc: "Hospital discharge, prescriptions, insurance" },
  { icon: Scale,       label: "Legal Notices",        desc: "Court summons, contracts, rights notices" },
  { icon: Home,        label: "Housing Applications", desc: "Lease agreements, housing assistance" },
  { icon: BookOpen,    label: "Civic Documents",      desc: "Voter registration, benefits, permits" },
];

const STEPS = [
  { num: "01", title: "Upload Your Document",  desc: "Drag and drop any PDF, or paste text directly. We support government forms, medical records, legal notices, and more.", icon: Upload },
  { num: "02", title: "Choose Your Language",  desc: "Select from 50+ languages. Our AI detects the source language automatically and translates with cultural context.", icon: Languages },
  { num: "03", title: "Understand Instantly",  desc: "Get a plain-language explanation alongside the translation. Key points highlighted, jargon decoded.", icon: Sparkles },
];

const FEATURES = [
  { icon: Zap,      title: "Instant Translation",  desc: "Real-time translation powered by Lingo.dev — no waiting, no uploads to third parties." },
  { icon: Shield,   title: "Privacy First",         desc: "Your documents are encrypted and only accessible to you. We never train on your data." },
  { icon: Sparkles, title: "AI Simplification",     desc: "Complex legalese transformed into plain language with key points extracted automatically." },
  { icon: Globe,    title: "50+ Languages",         desc: "From Hindi to Haitian Creole, Somali to Swahili — we cover the languages that matter most." },
  { icon: Heart,    title: "Culturally Aware",      desc: "Translations include cultural context, not just word-for-word conversions." },
  { icon: FileText, title: "Any Document Type",     desc: "Healthcare, legal, housing, civic — if it's official, we can translate and explain it." },
];

export default function HomePage() {
  const [visible, setVisible] = useState<Set<string>>(new Set());
  const refs = useRef<Record<string, HTMLElement | null>>({});
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState<"signin" | "signup">("signup");

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) setVisible((p) => new Set([...p, e.target.id]));
      }),
      { threshold: 0.08 }
    );
    Object.values(refs.current).forEach((r) => r && obs.observe(r));
    return () => obs.disconnect();
  }, []);

  const ref = (id: string) => (el: HTMLElement | null) => { refs.current[id] = el; };

  const openModal = (tab: "signin" | "signup") => {
    setModalTab(tab);
    setModalOpen(true);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#000" }}>
      <Navbar onAuthClick={openModal} />
      <AuthModal open={modalOpen} defaultTab={modalTab} onClose={() => setModalOpen(false)} />

      {/* ── HERO ── */}
      <section className="grid-pattern hero-section" style={{
        minHeight: "100vh",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "100px 24px 60px",
        position: "relative",
      }}>
        <div style={{ maxWidth: "800px", width: "100%", textAlign: "center" }}>

          {/* Icon */}
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "24px" }}>
            <div style={{
              width: "56px", height: "56px", borderRadius: "14px",
              border: "1px solid #222", background: "#0a0a0a",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Image src="/favicon.png" alt="LinguaAid" width={36} height={36} style={{ borderRadius: "8px" }} />
            </div>
          </div>

          <div style={{ marginBottom: "18px" }}>
            <span className="badge badge-primary">50+ Languages · Free to Start · Instant Results</span>
          </div>

          <h1 className="hero-heading" style={{
            fontSize: "clamp(12px, 5vw, 50px)",
            fontWeight: "900",
            lineHeight: "1.08",
            letterSpacing: "-1.5px",
            marginBottom: "20px",
            color: "#fff",
          }}>
            Every Document, Every Language,<br />
            <span style={{ color: "#444" }}>Instantly Understood.</span>
          </h1>

          <p style={{
            fontSize: "clamp(10px, 1.8vw, 15px)",
            color: "#888",
            lineHeight: "1.75",
            maxWidth: "500px",
            margin: "0 auto 36px",
          }}>
            Upload any government form, healthcare notice, or legal document.
            LinguaAid translates, simplifies, and explains it in your native language.
          </p>

          <div style={{ display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap" }}>
            <button
              onClick={() => openModal("signup")}
              className="btn-primary"
              style={{
                display: "inline-flex", alignItems: "center",
                gap: "8px", fontSize: "14px", padding: "12px 26px",
              }}
            >
              Start Translating Free <ArrowRight size={15} />
            </button>
            <a href="#how-it-works" className="btn-secondary" style={{
              display: "inline-flex", alignItems: "center",
              gap: "8px", fontSize: "14px", padding: "12px 26px",
              textDecoration: "none",
            }}>
              How It Works
            </a>
          </div>

          {/* Trust row */}
          <div style={{
            marginTop: "48px", display: "flex", gap: "24px",
            justifyContent: "center", flexWrap: "wrap",
          }}>
            {["50+ Languages", "Free to Start", "Instant Results"].map((l) => (
              <div key={l} style={{
                display: "flex", alignItems: "center", gap: "6px",
                color: "#fff", fontSize: "12px", fontWeight: "500",
              }}>
                <CheckCircle size={13} color="#555" /> {l}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DOCUMENT TYPES ── */}
      <section id="features" ref={ref("features")} style={{
        padding: "64px 24px", maxWidth: "1100px", margin: "0 auto",
      }}>
        <div style={{ marginBottom: "40px" }}>
          <span className="badge badge-accent" style={{ marginBottom: "10px", display: "inline-block" }}>Document Types</span>
          <h2 className="section-heading" style={{ color: "#fff", marginBottom: "10px" }}>
            Built for Real-World Documents
          </h2>
          <p style={{ color: "#fff", fontSize: "15px", maxWidth: "440px", opacity: 0.4 }}>
            Not toy examples. We handle the documents that actually affect people&apos;s lives.
          </p>
        </div>

        <div className="doc-grid">
          {DOCUMENT_TYPES.map(({ icon: Icon, label, desc }, i) => (
            <div key={label} className="glass-card" style={{
              padding: "24px",
              opacity: visible.has("features") ? 1 : 0,
              transform: visible.has("features") ? "translateY(0)" : "translateY(20px)",
              transition: `all 0.5s ease ${i * 0.08}s`,
            }}>
              <div style={{
                width: "38px", height: "38px", borderRadius: "9px",
                background: "#0a0a0a", border: "1px solid #1a1a1a",
                display: "flex", alignItems: "center", justifyContent: "center",
                marginBottom: "14px",
              }}>
                <Icon size={18} color="#fff" />
              </div>
              <h3 style={{ fontSize: "15px", fontWeight: "700", marginBottom: "6px", color: "#fff" }}>{label}</h3>
              <p style={{ color: "#fff", fontSize: "13px", lineHeight: "1.6", opacity: 0.35 }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" ref={ref("how-it-works")} style={{
        padding: "64px 24px",
        background: "#050505",
        borderTop: "1px solid #111",
        borderBottom: "1px solid #111",
      }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ marginBottom: "40px" }}>
            <span className="badge badge-primary" style={{ marginBottom: "10px", display: "inline-block" }}>Process</span>
            <h2 className="section-heading" style={{ color: "#fff" }}>
              Three Steps to Full Understanding
            </h2>
          </div>

          <div className="steps-grid">
            {STEPS.map(({ num, title, desc, icon: Icon }, i) => (
              <div key={num} className="glass-card" style={{
                padding: "28px",
                opacity: visible.has("how-it-works") ? 1 : 0,
                transform: visible.has("how-it-works") ? "translateY(0)" : "translateY(24px)",
                transition: `all 0.6s ease ${i * 0.12}s`,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "18px" }}>
                  <div style={{
                    width: "40px", height: "40px", borderRadius: "9px",
                    background: "#0a0a0a", border: "1px solid #1a1a1a",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <Icon size={20} color="#fff" />
                  </div>
                  <span style={{ fontSize: "36px", fontWeight: "900", color: "#1a1a1a", letterSpacing: "-2px", lineHeight: 1 }}>
                    {num}
                  </span>
                </div>
                <h3 style={{ fontSize: "16px", fontWeight: "700", marginBottom: "8px", color: "#fff" }}>{title}</h3>
                <p style={{ color: "#fff", lineHeight: "1.7", fontSize: "13px", opacity: 0.35 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features-grid" ref={ref("features-grid")} style={{
        padding: "64px 24px", maxWidth: "1100px", margin: "0 auto",
      }}>
        <div style={{ marginBottom: "40px" }}>
          <h2 className="section-heading" style={{ color: "#fff" }}>Everything You Need</h2>
        </div>

        <div className="features-grid">
          {FEATURES.map(({ icon: Icon, title, desc }, i) => (
            <div key={title} className="glass-card" style={{
              padding: "20px", display: "flex", gap: "14px",
              opacity: visible.has("features-grid") ? 1 : 0,
              transform: visible.has("features-grid") ? "translateY(0)" : "translateY(16px)",
              transition: `all 0.4s ease ${i * 0.06}s`,
            }}>
              <div style={{
                width: "34px", height: "34px", borderRadius: "8px",
                background: "#0a0a0a", border: "1px solid #1a1a1a",
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}>
                <Icon size={16} color="#fff" />
              </div>
              <div>
                <h3 style={{ fontSize: "14px", fontWeight: "700", marginBottom: "5px", color: "#fff" }}>{title}</h3>
                <p style={{ color: "#fff", fontSize: "12px", lineHeight: "1.6", opacity: 0.35 }}>{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── LANGUAGES ── */}
      <section id="languages" ref={ref("languages")} style={{
        padding: "64px 24px",
        background: "#050505",
        borderTop: "1px solid #111",
        borderBottom: "1px solid #111",
      }}>
        <div style={{ maxWidth: "860px", margin: "0 auto", textAlign: "center" }}>
          <span className="badge badge-accent" style={{ marginBottom: "10px", display: "inline-block" }}>Global Reach</span>
          <h2 className="section-heading" style={{ color: "#fff", marginBottom: "10px" }}>
            50+ Languages, One Platform
          </h2>
          <p style={{ color: "#fff", fontSize: "15px", marginBottom: "36px", opacity: 0.4 }}>
            We prioritize the languages spoken by the world&apos;s largest immigrant and refugee populations.
          </p>

          <div style={{
            display: "flex", flexWrap: "wrap", gap: "7px", justifyContent: "center",
            opacity: visible.has("languages") ? 1 : 0,
            transform: visible.has("languages") ? "translateY(0)" : "translateY(16px)",
            transition: "all 0.6s ease",
          }}>
            {LANGUAGES.slice(0, 32).map((lang) => (
              <span key={lang} className="lang-pill">{lang}</span>
            ))}
            <span className="lang-pill" style={{ borderColor: "#333", color: "#fff" }}>+18 more</span>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: "80px 24px", textAlign: "center" }}>
        <div style={{ maxWidth: "520px", margin: "0 auto" }}>
          <div className="glass-card" style={{ padding: "48px 32px" }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px" }}>
              <Image src="/favicon.png" alt="LinguaAid" width={44} height={44} style={{ borderRadius: "11px" }} />
            </div>
            <h2 style={{
              fontSize: "clamp(22px, 3vw, 32px)", fontWeight: "800",
              letterSpacing: "-0.8px", marginBottom: "12px", color: "#fff",
            }}>
              Start Understanding Today
            </h2>
            <p style={{ color: "#fff", fontSize: "14px", marginBottom: "28px", lineHeight: "1.7", opacity: 0.4 }}>
              No credit card required. Upload your first document and get a full
              translation and explanation in seconds.
            </p>
            <button
              onClick={() => openModal("signup")}
              className="btn-primary"
              style={{
                display: "inline-flex", alignItems: "center",
                gap: "8px", fontSize: "14px", padding: "12px 28px",
              }}
            >
              Create Free Account <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{
        borderTop: "1px solid #111", padding: "28px 24px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexWrap: "wrap", gap: "12px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Image src="/favicon.png" alt="LinguaAid" width={22} height={22} style={{ borderRadius: "5px" }} />
          <span style={{ fontWeight: "700", color: "#fff", fontSize: "13px", opacity: 0.5 }}>LinguaAid</span>
        </div>
        <p style={{ color: "#fff", fontSize: "12px", opacity: 0.25 }}>
          Breaking language barriers for immigrants and refugees worldwide.
        </p>
        <p style={{ color: "#fff", fontSize: "12px", opacity: 0.25 }}>
          Next.js · Supabase · Lingo.dev
        </p>
      </footer>

      <style jsx>{`
        /* Hero heading — smaller on mobile */
        .hero-heading { font-size: clamp(30px, 5.5vw, 56px); }

        /* Section headings */
        .section-heading {
          font-size: clamp(22px, 3.5vw, 36px);
          font-weight: 800;
          letter-spacing: -0.8px;
          margin: 0;
        }

        /* Grids */
        .doc-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 12px;
        }
        .steps-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 12px;
        }
        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 10px;
        }

        /* Mobile overrides */
        @media (max-width: 640px) {
          .hero-section { padding: 80px 16px 48px !important; }
          .doc-grid, .steps-grid, .features-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
