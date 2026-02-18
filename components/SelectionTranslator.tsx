"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Globe, Search, ArrowRight, X, Loader2, CheckCircle } from "lucide-react";

const LANGUAGES = [
  "English", "Hindi","Arabic","Spanish","French","Mandarin","Portuguese",
  "Bengali","Russian","Urdu","Japanese","Swahili","Turkish",
  "Korean","Vietnamese","Thai","Tagalog","Amharic","Somali",
  "Haitian Creole","Pashto","Dari","Tigrinya","Burmese","Nepali",
  "Khmer","Lao","Hmong","Yoruba","Igbo","Zulu","Malay",
  "Indonesian","Persian","Punjabi","Tamil","Telugu","Gujarati",
  "Marathi","Kannada","Malayalam","Sinhala","Ukrainian","Polish",
  "Romanian","Dutch","Swedish","Norwegian","German","Italian",
];

const RECENT_KEY = "lingua_recent_langs";

interface PopoverPos { x: number; y: number; }

interface SelectionTranslatorProps {
  /** CSS selector for the container(s) to watch. Defaults to the whole document. */
  watchSelector?: string;
}

export default function SelectionTranslator({ watchSelector }: SelectionTranslatorProps) {
  const [pos, setPos]               = useState<PopoverPos | null>(null);
  const [selectedText, setSelectedText] = useState("");
  const [search, setSearch]         = useState("");
  const [lang, setLang]             = useState("Hindi");
  const [phase, setPhase]           = useState<"pick" | "loading" | "done">("pick");
  const [result, setResult]         = useState("");
  const [displayed, setDisplayed]   = useState("");
  const [recentLangs, setRecentLangs] = useState<string[]>([]);
  const popoverRef  = useRef<HTMLDivElement>(null);
  const searchRef   = useRef<HTMLInputElement>(null);
  const animRef     = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load recent langs
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]");
      if (Array.isArray(stored)) setRecentLangs(stored.slice(0, 3));
    } catch { /* ignore */ }
  }, []);

  const saveRecent = (l: string) => {
    const next = [l, ...recentLangs.filter(x => x !== l)].slice(0, 3);
    setRecentLangs(next);
    localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  };

  // Filtered language list
  const filtered = LANGUAGES.filter(l =>
    l.toLowerCase().includes(search.toLowerCase())
  );

  // Listen for text selection
  const handleMouseUp = useCallback((e: MouseEvent) => {
    // Don't trigger if click is inside our own popover
    if (popoverRef.current?.contains(e.target as Node)) return;

    setTimeout(() => {
      const sel = window.getSelection();
      const text = sel?.toString().trim() ?? "";

      if (!text || text.length < 3) {
        setPos(null);
        return;
      }

      // If watchSelector is set, only trigger inside matching elements
      if (watchSelector) {
        const containers = document.querySelectorAll(watchSelector);
        let inside = false;
        containers.forEach(c => { if (c.contains(e.target as Node)) inside = true; });
        if (!inside) { setPos(null); return; }
      }

      const range = sel!.getRangeAt(0);
      const rect  = range.getBoundingClientRect();

      // Position popover above the selection, centred
      const x = rect.left + rect.width / 2 + window.scrollX;
      const y = rect.top + window.scrollY - 12; // 12px gap above selection

      setSelectedText(text);
      setPos({ x, y });
      setPhase("pick");
      setResult("");
      setDisplayed("");
      setSearch("");
    }, 10);
  }, [watchSelector]);

  useEffect(() => {
    document.addEventListener("mouseup", handleMouseUp);
    return () => document.removeEventListener("mouseup", handleMouseUp);
  }, [handleMouseUp]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (pos && popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        // Only close if the user didn't just make a new selection
        const sel = window.getSelection();
        if (!sel?.toString().trim()) setPos(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [pos]);

  // Focus search when popover opens
  useEffect(() => {
    if (pos && phase === "pick") {
      setTimeout(() => searchRef.current?.focus(), 80);
    }
  }, [pos, phase]);

  // Typewriter animation
  const typewrite = useCallback((text: string) => {
    setDisplayed("");
    let i = 0;
    const tick = () => {
      if (i <= text.length) {
        setDisplayed(text.slice(0, i));
        i++;
        animRef.current = setTimeout(tick, 18);
      }
    };
    tick();
  }, []);

  useEffect(() => () => { if (animRef.current) clearTimeout(animRef.current); }, []);

  const handleTranslate = async () => {
    if (!selectedText || !lang) return;
    setPhase("loading");
    saveRecent(lang);

    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: selectedText,
          targetLanguage: lang,
          sourceLanguage: "en",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Translation failed");
      const translated: string = data.translatedText ?? data.text ?? "";
      setResult(translated);
      setPhase("done");
      setDisplayed(translated);
    } catch {
      setResult("Translation failed. Please try again.");
      setPhase("done");
      setDisplayed("Translation failed. Please try again.");
    }
  };

  if (!pos) return null;

  // Clamp popover so it doesn't go off-screen
  const vpW = typeof window !== "undefined" ? window.innerWidth : 800;
  const popW = 320;
  const rawX = pos.x - popW / 2;
  const clampedX = Math.max(12, Math.min(rawX, vpW - popW - 12));

  return (
    <div
      ref={popoverRef}
      style={{
        position: "absolute",
        left: clampedX,
        top: pos.y,
        transform: "translateY(-100%)",
        width: popW,
        background: "#0d0d0d",
        border: "1px solid #2a2a2a",
        borderRadius: "12px",
        boxShadow: "0 20px 60px rgba(0,0,0,0.9), 0 0 0 1px rgba(255,255,255,0.04)",
        zIndex: 9999,
        overflow: "hidden",
        animation: "popIn 0.15s cubic-bezier(0.34,1.56,0.64,1) forwards",
      }}
    >
      {/* ── PICK PHASE ── */}
      {phase === "pick" && (
        <>
          {/* Header */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "10px 12px 8px",
            borderBottom: "1px solid #1a1a1a",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Globe size={13} color="#fff" style={{ opacity: 0.5 }} />
              <span style={{ fontSize: "11px", fontWeight: "700", color: "#fff", opacity: 0.5, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Translate Selection
              </span>
            </div>
            <button onClick={() => setPos(null)} style={{
              background: "transparent", border: "none", cursor: "pointer",
              color: "#fff", opacity: 0.3, padding: "2px", display: "flex",
            }}><X size={13} /></button>
          </div>

          {/* Selected text preview */}
          <div style={{ padding: "8px 12px", borderBottom: "1px solid #111" }}>
            <p style={{
              fontSize: "12px", color: "#fff", opacity: 0.55,
              lineHeight: "1.5", fontStyle: "italic",
              overflow: "hidden", textOverflow: "ellipsis",
              display: "-webkit-box", WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
            }}>
              &ldquo;{selectedText.slice(0, 120)}{selectedText.length > 120 ? "…" : ""}&rdquo;
            </p>
          </div>

          {/* Recent langs */}
          {recentLangs.length > 0 && (
            <div style={{ padding: "8px 12px 4px", display: "flex", gap: "6px", flexWrap: "wrap" }}>
              {recentLangs.map(l => (
                <button key={l} onClick={() => setLang(l)} style={{
                  padding: "3px 10px", borderRadius: "20px",
                  background: lang === l ? "#fff" : "#111",
                  border: `1px solid ${lang === l ? "#fff" : "#222"}`,
                  color: lang === l ? "#000" : "#fff",
                  opacity: lang === l ? 1 : 0.55,
                  fontSize: "11px", fontWeight: "700",
                  fontFamily: "Inconsolata, monospace",
                  cursor: "pointer", transition: "all 0.12s ease",
                }}>
                  {l}
                </button>
              ))}
            </div>
          )}

          {/* Search */}
          <div style={{ padding: "8px 12px", position: "relative" }}>
            <Search size={12} style={{
              position: "absolute", left: "20px", top: "50%",
              transform: "translateY(-50%)", color: "#fff", opacity: 0.3,
            }} />
            <input
              ref={searchRef}
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => {
                if (e.key === "Enter" && filtered.length > 0) {
                  setLang(filtered[0]);
                  setSearch("");
                }
              }}
              placeholder="Search language…"
              style={{
                width: "100%", padding: "8px 10px 8px 28px",
                background: "#111", border: "1px solid #1a1a1a",
                borderRadius: "7px", color: "#fff",
                fontFamily: "Inconsolata, monospace", fontSize: "12px",
                outline: "none",
              }}
            />
          </div>

          {/* Language list */}
          <div style={{ maxHeight: "160px", overflowY: "auto", padding: "0 6px 6px" }}>
            {filtered.slice(0, 20).map(l => (
              <button key={l} onClick={() => { setLang(l); setSearch(""); }} style={{
                width: "100%", padding: "7px 10px",
                background: lang === l ? "#1a1a1a" : "transparent",
                border: "none", borderRadius: "6px",
                cursor: "pointer", textAlign: "left",
                color: "#fff",
                opacity: lang === l ? 1 : 0.55,
                fontFamily: "Inconsolata, monospace",
                fontSize: "13px", fontWeight: lang === l ? "700" : "400",
                transition: "all 0.1s ease",
                display: "flex", alignItems: "center", justifyContent: "space-between",
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = "1"; (e.currentTarget as HTMLElement).style.background = "#111"; }}
                onMouseLeave={e => {
                  if (lang !== l) {
                    (e.currentTarget as HTMLElement).style.opacity = "0.55";
                    (e.currentTarget as HTMLElement).style.background = "transparent";
                  }
                }}
              >
                {l}
                {lang === l && <CheckCircle size={12} />}
              </button>
            ))}
            {filtered.length === 0 && (
              <p style={{ padding: "10px", color: "#fff", opacity: 0.3, fontSize: "12px", textAlign: "center" }}>
                No languages found
              </p>
            )}
          </div>

          {/* Translate button */}
          <div style={{ padding: "8px 12px 12px" }}>
            <button onClick={handleTranslate} style={{
              width: "100%", display: "flex", alignItems: "center",
              justifyContent: "center", gap: "8px",
              padding: "10px", borderRadius: "8px",
              background: "#fff", border: "none",
              color: "#000", fontFamily: "Inconsolata, monospace",
              fontSize: "13px", fontWeight: "800",
              cursor: "pointer", transition: "background 0.15s ease",
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#e0e0e0"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "#fff"; }}
            >
              Translate to {lang} <ArrowRight size={13} />
            </button>
          </div>
        </>
      )}

      {/* ── LOADING PHASE ── */}
      {phase === "loading" && (
        <div style={{ padding: "28px 20px", textAlign: "center" }}>
          <Loader2 size={22} color="#fff" style={{ animation: "spin 1s linear infinite", marginBottom: "10px" }} />
          <p style={{ fontSize: "13px", color: "#fff", opacity: 0.5 }}>
            Translating to {lang}…
          </p>
        </div>
      )}

      {/* ── DONE PHASE ── */}
      {phase === "done" && (
        <>
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "10px 12px 8px", borderBottom: "1px solid #1a1a1a",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Globe size={13} color="#fff" style={{ opacity: 0.5 }} />
              <span style={{ fontSize: "11px", fontWeight: "700", color: "#fff", opacity: 0.5, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                {lang} Translation
              </span>
            </div>
            <div style={{ display: "flex", gap: "6px" }}>
              <button
                onClick={() => { setPhase("pick"); setResult(""); setDisplayed(""); }}
                style={{
                  background: "#111", border: "1px solid #222", borderRadius: "5px",
                  cursor: "pointer", color: "#fff", opacity: 0.5,
                  padding: "3px 8px", fontSize: "11px", fontWeight: "600",
                  fontFamily: "Inconsolata, monospace",
                }}
              >
                ← Back
              </button>
              <button onClick={() => setPos(null)} style={{
                background: "transparent", border: "none", cursor: "pointer",
                color: "#fff", opacity: 0.3, padding: "2px", display: "flex",
              }}><X size={13} /></button>
            </div>
          </div>

          {/* Result with typewriter */}
          <div style={{ padding: "14px 14px 16px" }}>
            <p style={{
              fontSize: "16px", lineHeight: "1.75", color: "#fff",
              whiteSpace: "pre-wrap", maxHeight: "220px", overflowY: "auto",
            }}>
              {displayed}
            </p>

            {/* Copy button — appears after animation */}
            {displayed === result && result.length > 0 && (
              <button
                onClick={async () => {
                  await navigator.clipboard.writeText(result);
                }}
                style={{
                  marginTop: "10px", display: "flex", alignItems: "center", gap: "5px",
                  padding: "5px 12px", borderRadius: "6px",
                  background: "#111", border: "1px solid #222",
                  color: "#fff", opacity: 0.6,
                  fontFamily: "Inconsolata, monospace", fontSize: "11px", fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                Copy translation
              </button>
            )}
          </div>
        </>
      )}

      <style jsx>{`
        @keyframes popIn {
          from { opacity: 0; transform: translateY(calc(-100% + 8px)) scale(0.95); }
          to   { opacity: 1; transform: translateY(-100%) scale(1); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0; }
        }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #222; border-radius: 2px; }
      `}</style>
    </div>
  );
}
