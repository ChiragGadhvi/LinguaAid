"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import Navbar from "@/components/Navbar";
import {
  FileText, Globe, Clock, Plus, Trash2,
  ChevronRight, Languages, BarChart3, Loader2,
  Stethoscope, Scale, Home, BookOpen, MoreHorizontal,
} from "lucide-react";

interface Translation {
  id: string;
  document_id: string;
  target_language: string;
  translated_text: string;
  simplified_text: string;
  created_at: string;
  documents: {
    file_name: string;
    document_type: string;
    original_text: string;
  };
}

const DOC_TYPE_ICONS: Record<string, React.ElementType> = {
  healthcare: Stethoscope,
  legal: Scale,
  housing: Home,
  civic: BookOpen,
  other: MoreHorizontal,
};

const DOC_TYPE_LABELS: Record<string, string> = {
  healthcare: "Healthcare",
  legal: "Legal",
  housing: "Housing",
  civic: "Civic",
  other: "Other",
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function DashboardPage() {
  const [translations, setTranslations] = useState<Translation[]>([]);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState("");
  const [topLanguages, setTopLanguages] = useState<string[]>([]);
  const [topDocTypes, setTopDocTypes] = useState<string[]>([]);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/auth"); return; }
      setUserEmail(user.email ?? "");

      const { data } = await supabase
        .from("translations")
        .select(`id, document_id, target_language, translated_text, simplified_text, created_at,
          documents ( file_name, document_type, original_text )`)
        .order("created_at", { ascending: false })
        .limit(50);

      setTranslations((data as unknown as Translation[]) ?? []);

      // Calculate stats
      const langs: Record<string, number> = {};
      const types: Record<string, number> = {};
      (data as unknown as Translation[] ?? []).forEach(t => {
        langs[t.target_language] = (langs[t.target_language] || 0) + 1;
        const type = t.documents?.document_type || "Other";
        types[type] = (types[type] || 0) + 1;
      });

      setTopLanguages(Object.entries(langs).sort((a, b) => b[1] - a[1]).slice(0, 5).map(e => e[0]));
      setTopDocTypes(Object.entries(types).sort((a, b) => b[1] - a[1]).slice(0, 5).map(e => e[0]));

      setLoading(false);
    };
    init();
  }, []);

  const handleDelete = async (translationId: string, documentId: string) => {
    setDeleting(translationId);
    setConfirmDelete(null);
    await supabase.from("translations").delete().eq("id", translationId);
    await supabase.from("documents").delete().eq("id", documentId);
    setTranslations((prev) => prev.filter((t) => t.id !== translationId));
    setDeleting(null);
  };

  const stats = [
    { icon: FileText,  label: "Documents Translated", value: translations.length, isList: false },
    { icon: Languages, label: "Languages Used",       value: topLanguages.join(", "), isList: true },
    { icon: BarChart3, label: "Document Types",       value: topDocTypes.length > 0 ? topDocTypes.map(t => DOC_TYPE_LABELS[t] || t).join(", ") : "None", isList: true },
  ];

  // Card style shared
  const card: React.CSSProperties = {
    background: "#0a0a0a",
    border: "1px solid #1a1a1a",
    borderRadius: "12px",
  };

  return (
    <div style={{ minHeight: "100vh", background: "#000" }}>
      <Navbar />

      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "76px 16px 80px" }}>

        {/* ── Header ── */}
        <div className="dash-header" style={{
          display: "flex", alignItems: "flex-start", justifyContent: "space-between",
          marginBottom: "28px", flexWrap: "wrap", gap: "12px",
        }}>
          <div>
            <h1 style={{
              fontSize: "clamp(20px, 4vw, 32px)", fontWeight: "900",
              letterSpacing: "-0.8px", color: "#fff", marginBottom: "4px",
            }}>
              My Dashboard
            </h1>
            <p style={{ color: "#fff", opacity: 0.35, fontSize: "13px" }}>
              {userEmail || "Loading…"}
            </p>
          </div>
          <Link href="/translate" className="new-trans-btn" style={{
            display: "inline-flex", alignItems: "center", gap: "7px",
            padding: "10px 20px", borderRadius: "8px",
            background: "#fff", border: "1px solid #fff",
            color: "#000", fontFamily: "Inconsolata, monospace",
            fontSize: "13px", fontWeight: "800", textDecoration: "none",
            transition: "background 0.15s ease",
          }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#e0e0e0"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "#fff"; }}
          >
            <Plus size={14} /> New Translation
          </Link>
        </div>

        {/* ── Stats ── */}
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(3, 1fr)",
          gap: "10px", marginBottom: "28px",
        }} className="stats-grid">
          {stats.map(({ icon: Icon, label, value, isList }) => (
            <div key={label} style={{ ...card, padding: "18px 20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                <div style={{
                  width: "30px", height: "30px", borderRadius: "7px",
                  background: "#111", border: "1px solid #222",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Icon size={15} color="#fff" style={{ opacity: 0.5 }} />
                </div>
                <span style={{ fontSize: "11px", color: "#fff", opacity: 0.4, fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.07em" }}>
                  {label}
                </span>
              </div>
              <div style={{ 
                fontSize: isList ? "15px" : "34px", 
                fontWeight: isList ? "500" : "900", 
                letterSpacing: isList ? "normal" : "-1.5px", 
                color: isList ? "rgba(255,255,255,0.9)" : "#fff",
                lineHeight: isList ? "1.5" : "1.1"
              }}>
                {loading
                  ? <div style={{ width: "40px", height: "30px", background: "#111", borderRadius: "4px", animation: "pulse 1.5s ease infinite" }} />
                  : (value || "None")}
              </div>
            </div>
          ))}
        </div>

        {/* ── Translations list ── */}
        <div>
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            marginBottom: "14px",
          }}>
            <h2 style={{
              fontSize: "13px", fontWeight: "700", color: "#fff", opacity: 0.5,
              textTransform: "uppercase", letterSpacing: "0.1em",
              display: "flex", alignItems: "center", gap: "7px",
            }}>
              <Clock size={13} /> Recent Translations
            </h2>
            {translations.length > 0 && (
              <span style={{ fontSize: "12px", color: "#fff", opacity: 0.25 }}>
                {translations.length} total
              </span>
            )}
          </div>

          {/* Loading skeletons */}
          {loading && (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {[1, 2, 3, 4].map(i => (
                <div key={i} style={{
                  ...card, height: "76px",
                  animation: "pulse 1.5s ease infinite",
                  animationDelay: `${i * 0.1}s`,
                }} />
              ))}
            </div>
          )}

          {/* Empty state */}
          {!loading && translations.length === 0 && (
            <div style={{ ...card, padding: "56px 32px", textAlign: "center" }}>
              <div style={{
                width: "52px", height: "52px", borderRadius: "13px",
                background: "#111", border: "1px solid #1a1a1a",
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 16px",
              }}>
                <FileText size={22} color="#fff" style={{ opacity: 0.3 }} />
              </div>
              <h3 style={{ fontSize: "16px", fontWeight: "800", color: "#fff", marginBottom: "6px" }}>
                No translations yet
              </h3>
              <p style={{ color: "#fff", opacity: 0.35, fontSize: "13px", marginBottom: "20px", lineHeight: "1.6" }}>
                Upload a PDF or paste text to translate your first document.<br />
                It only takes a few seconds.
              </p>
              <Link href="/translate" style={{
                display: "inline-flex", alignItems: "center", gap: "7px",
                padding: "10px 22px", borderRadius: "8px",
                background: "#fff", color: "#000",
                fontFamily: "Inconsolata, monospace",
                fontSize: "13px", fontWeight: "800", textDecoration: "none",
              }}>
                <Plus size={14} /> Translate a Document
              </Link>
            </div>
          )}

          {/* Translation rows */}
          {!loading && translations.length > 0 && (
            <div className="translations-grid" style={{
              display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
              gap: "16px",
            }}>
              {translations.map((t) => {
                const docType = t.documents?.document_type ?? "other";
                const DocIcon = DOC_TYPE_ICONS[docType] ?? MoreHorizontal;
                const docLabel = DOC_TYPE_LABELS[docType] ?? "Other";
                const fileName = t.documents?.file_name ?? "Pasted text";
                const preview = t.translated_text?.slice(0, 120) ?? "";
                const isDeleting = deleting === t.id;
                const isConfirming = confirmDelete === t.id;

                return (
                  <div key={t.id} style={{
                    ...card,
                    padding: "20px",
                    display: "flex", flexDirection: "column", gap: "16px",
                    transition: "all 0.2s ease",
                    position: "relative",
                  }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.borderColor = "#444";
                      (e.currentTarget as HTMLElement).style.background = "#0f0f0f";
                      (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.borderColor = "#1a1a1a";
                      (e.currentTarget as HTMLElement).style.background = "#0a0a0a";
                      (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                    }}
                  >
                    {/* Top Row: Icon + Date */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div style={{
                          width: "36px", height: "36px", borderRadius: "10px",
                          background: "#111", border: "1px solid #222",
                          display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                          <DocIcon size={16} color="#fff" style={{ opacity: 0.6 }} />
                        </div>
                        <span style={{
                          padding: "3px 10px", borderRadius: "20px",
                          background: "#111", border: "1px solid #222",
                          fontSize: "10px", fontWeight: "700", color: "#fff", opacity: 0.6,
                          textTransform: "uppercase", letterSpacing: "0.05em",
                        }}>
                          {docLabel}
                        </span>
                      </div>
                      <span style={{ fontSize: "11px", color: "#fff", opacity: 0.3 }}>
                        {timeAgo(t.created_at)}
                      </span>
                    </div>

                    {/* Middle: Content */}
                    <div style={{ flex: 1 }}>
                      <h4 style={{
                        fontSize: "15px", fontWeight: "700", color: "#fff",
                        marginBottom: "6px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                      }}>
                        {fileName}
                      </h4>
                      <p style={{
                        fontSize: "13px", color: "#fff", opacity: 0.4,
                        display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical",
                        overflow: "hidden", lineHeight: "1.6",
                      }}>
                        {preview}{preview.length >= 120 ? "…" : ""}
                      </p>
                    </div>

                    {/* Bottom: Language & Actions */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "16px", borderTop: "1px solid #1a1a1a" }}>
                       <span style={{
                          display: "flex", alignItems: "center", gap: "6px",
                          fontSize: "12px", fontWeight: "600", color: "#fff", opacity: 0.8,
                        }}>
                          <Globe size={12} style={{ opacity: 0.5 }} /> {t.target_language}
                        </span>

                       <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          {isConfirming ? (
                            <>
                              <button onClick={() => handleDelete(t.id, t.document_id)} style={{
                                fontSize: "11px", fontWeight: "700", color: "#ff6666", background: "transparent", border: "none", cursor: "pointer"
                              }}>Confirm</button>
                              <button onClick={() => setConfirmDelete(null)} style={{
                                fontSize: "11px", color: "#fff", opacity: 0.5, background: "transparent", border: "none", cursor: "pointer"
                              }}>Cancel</button>
                            </>
                          ) : (
                            <>
                              <button onClick={() => setConfirmDelete(t.id)} disabled={isDeleting} style={{
                                padding: "6px", color: "#fff", opacity: 0.2, background: "transparent", border: "none", cursor: "pointer", transition: "opacity 0.2s"
                              }} onMouseEnter={e => (e.currentTarget as HTMLElement).style.opacity = "1"} onMouseLeave={e => (e.currentTarget as HTMLElement).style.opacity = "0.2"}>
                                {isDeleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                              </button>
                              
                              <Link href={`/translate?id=${t.id}`} style={{
                                padding: "6px 14px", borderRadius: "6px",
                                background: "#fff", color: "#000",
                                fontSize: "12px", fontWeight: "700", textDecoration: "none",
                                fontFamily: "Inconsolata, monospace",
                              }}>
                                View
                              </Link>
                            </>
                          )}
                       </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes pulse {
          0%, 100% { opacity: 0.4; }
          50%       { opacity: 0.7; }
        }
        @media (max-width: 600px) {
          .stats-grid { grid-template-columns: 1fr !important; }
          .translations-grid { grid-template-columns: 1fr !important; }
          .dash-header { flex-direction: column !important; align-items: stretch !important; }
          .new-trans-btn { justify-content: center !important; }
        }
      `}</style>
    </div>
  );
}
