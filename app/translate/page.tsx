"use client";

import { useState, useCallback, useRef, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import Navbar from "@/components/Navbar";
import SelectionTranslator from "@/components/SelectionTranslator";
import {
  Upload, FileText, Globe, Sparkles, Loader2, CheckCircle,
  AlertCircle, Copy, ChevronDown, X, ArrowLeft,
  Stethoscope, Scale, Home, BookOpen, MoreHorizontal, RotateCcw,
  Download, AlertTriangle,
} from "lucide-react";



const LANGUAGES = [
  "English","Hindi","Arabic","Spanish","French","Mandarin","Portuguese",
  "Bengali","Russian","Urdu","Japanese","Swahili","Turkish",
  "Korean","Vietnamese","Thai","Tagalog","Amharic","Somali",
  "Haitian Creole","Pashto","Dari","Tigrinya","Burmese","Nepali",
  "Khmer","Lao","Hmong","Yoruba","Igbo","Zulu","Malay",
  "Indonesian","Persian","Punjabi","Tamil","Telugu","Gujarati",
  "Marathi","Kannada","Malayalam","Sinhala","Ukrainian","Polish",
  "Romanian","Dutch","Swedish","Norwegian","German","Italian",
];

const DOC_TYPES = [
  { value: "healthcare", label: "Healthcare", icon: Stethoscope },
  { value: "legal",      label: "Legal",      icon: Scale },
  { value: "housing",    label: "Housing",    icon: Home },
  { value: "civic",      label: "Civic",      icon: BookOpen },
  { value: "other",      label: "Other",      icon: MoreHorizontal },
];

const SAMPLE_DOCUMENTS = [
  {
    file: "eviction-court-summons.pdf",
    label: "Eviction Court Summons",
    description: "Court notice for eviction hearing",
    docType: "legal",
    icon: Scale,
    emoji: "⚖️",
  },
  {
    file: "hospital-discharge-instructions.pdf",
    label: "Hospital Discharge Instructions",
    description: "Post-hospital care & medication info",
    docType: "healthcare",
    icon: Stethoscope,
    emoji: "🏥",
  },
  {
    file: "housing-lease-section8.pdf",
    label: "Section 8 Housing Lease",
    description: "Government-assisted housing agreement",
    docType: "housing",
    icon: Home,
    emoji: "🏠",
  },
  {
    file: "ssi-benefits-approval.pdf",
    label: "SSI Benefits Approval",
    description: "Social Security benefit approval letter",
    docType: "civic",
    icon: BookOpen,
    emoji: "📋",
  },
  {
    file: "uscis-i485-receipt-notice.pdf",
    label: "USCIS I-485 Receipt",
    description: "Immigration green card application notice",
    docType: "civic",
    icon: Globe,
    emoji: "🛂",
  },
];

type Step = "input" | "translating" | "result";

function TranslatePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<Step>("input");
  const [inputText, setInputText] = useState("");
  const [inputMode, setInputMode] = useState<"paste" | "upload">("paste");
  const [dragOver, setDragOver] = useState(false);
  const [fileName, setFileName] = useState("");
  const [docType, setDocType] = useState("other");
  const [targetLang, setTargetLang] = useState("Hindi");
  const [langOpen, setLangOpen] = useState(false);
  const [langSearch, setLangSearch] = useState("");
  const [loadingSample, setLoadingSample] = useState<string | null>(null);

  const [translatedText, setTranslatedText] = useState("");
  const [simplifiedText, setSimplifiedText] = useState("");
  const [keyPoints, setKeyPoints] = useState<string[]>([]);
  const [urgentActions, setUrgentActions] = useState<string[]>([]);
  const [isMock, setIsMock] = useState(false);

  const [error, setError] = useState("");
  const [progress, setProgress] = useState("");
  const [progressStep, setProgressStep] = useState(0);
  const [copied, setCopied] = useState<"original" | "translated" | "simplified" | null>(null);

  const filteredLangs = LANGUAGES.filter(l =>
    l.toLowerCase().includes(langSearch.toLowerCase())
  );

  useEffect(() => {
    const id = searchParams.get("id");
    if (!id) return;
    const load = async () => {
      const { data } = await supabase
        .from("translations")
        .select("*, documents(*)")
        .eq("id", id)
        .single();
      if (data) {
        setTranslatedText(data.translated_text ?? "");
        setSimplifiedText(data.simplified_text ?? "");
        setKeyPoints(data.key_points ?? []);
        setTargetLang(data.target_language);
        setInputText(data.documents?.original_text ?? "");
        setDocType(data.documents?.document_type ?? "other");
        setFileName(data.documents?.file_name ?? "");
        setStep("result");
      }
    };
    load();
  }, []);

  const handleFileUpload = useCallback(async (file: File) => {
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      setError("Only PDF files are supported. Please upload a .pdf file.");
      return;
    }
    setFileName(file.name);
    setProgress("Reading your PDF…");
    setError("");
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/extract-pdf", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setInputText(data.text);
      setInputMode("paste");
      setProgress("");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to read PDF. Try pasting the text instead.");
      setProgress("");
      setFileName("");
    }
  }, []);

  const handleSampleDocument = useCallback(async (sample: typeof SAMPLE_DOCUMENTS[0]) => {
    setLoadingSample(sample.file);
    setError("");
    try {
      const res = await fetch(`/Sample%20Documents/${encodeURIComponent(sample.file)}`);
      if (!res.ok) throw new Error("Could not load sample document.");
      const blob = await res.blob();
      const file = new File([blob], sample.file, { type: "application/pdf" });
      setDocType(sample.docType);
      await handleFileUpload(file);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load sample document.");
    } finally {
      setLoadingSample(null);
    }
  }, [handleFileUpload]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  }, [handleFileUpload]);

  const handleTranslate = async () => {
    if (!inputText.trim()) { setError("Please enter or upload some text first."); return; }
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/auth"); return; }

    setStep("translating");
    setError("");
    setProgressStep(0);

    try {
      setProgress("Translating your document…");
      setProgressStep(1);
      const translateRes = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: inputText, targetLanguage: targetLang, sourceLanguage: "en" }),
      });
      const translateData = await translateRes.json();
      if (!translateRes.ok) throw new Error(translateData.error);
      const translated = translateData.translatedText;
      setTranslatedText(translated);
      if (translateData.isMock) setIsMock(true);

      setProgress("Creating plain-language explanation…");
      setProgressStep(2);
      const simplifyRes = await fetch("/api/simplify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ translatedText: translated, documentType: docType, targetLanguage: targetLang }),
      });
      const simplifyData = await simplifyRes.json();
      if (!simplifyRes.ok) throw new Error(simplifyData.error);
      setSimplifiedText(simplifyData.simplifiedText ?? "");
      setKeyPoints(simplifyData.keyPoints ?? []);
      setUrgentActions(simplifyData.urgentActions ?? []);
      if (simplifyData.isMock) setIsMock(true);

      setProgress("Saving to your history…");
      setProgressStep(3);
      const { data: doc } = await supabase.from("documents").insert({
        user_id: user.id, original_text: inputText,
        file_name: fileName || "Pasted text", document_type: docType,
      }).select().single();

      if (doc) {
        await supabase.from("translations").insert({
          document_id: doc.id, user_id: user.id,
          source_language: "en", target_language: targetLang,
          translated_text: translated,
          simplified_text: simplifyData.simplifiedText ?? "",
          key_points: simplifyData.keyPoints ?? [],
        });
      }

      setStep("result");
      setProgress("");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Translation failed. Please try again.");
      setStep("input");
      setProgress("");
    }
  };

  const handleCopy = async (type: "original" | "translated" | "simplified") => {
    const text = type === "original" ? inputText : type === "translated" ? translatedText : simplifiedText;
    await navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleReset = () => {
    setStep("input");
    setInputText(""); setFileName(""); setTranslatedText("");
    setSimplifiedText(""); setKeyPoints([]); setError(""); setIsMock(false);
    setUrgentActions([]);
    setProgressStep(0);
  };

  const handleDownload = () => {
    const blob = new Blob([translatedText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${fileName ? fileName.replace(".pdf", "") : "translation"}_${targetLang}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSpeak = (text: string, langName: string) => {
    // Removed as per request
  };

  // Shared card header style
  const cardHeaderStyle: React.CSSProperties = {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    marginBottom: "14px", paddingBottom: "12px", borderBottom: "1px solid #1a1a1a",
  };
  const cardLabelStyle: React.CSSProperties = {
    fontSize: "11px", fontWeight: "700", color: "#fff", opacity: 0.5,
    textTransform: "uppercase", letterSpacing: "0.1em",
    display: "flex", alignItems: "center", gap: "6px",
  };

  return (
    <div style={{ minHeight: "100vh", background: "#000", position: "relative" }}>
      <Navbar />
      {/* Selection-to-translate popover — active on result panels */}
      {step === "result" && <SelectionTranslator watchSelector="[data-selectable]" />}

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "76px 20px 100px" }}>

        {/* Header */}
        <div style={{ marginBottom: "28px" }}>
          <Link href="/dashboard" style={{
            display: "inline-flex", alignItems: "center", gap: "6px",
            color: "#fff", opacity: 0.4, textDecoration: "none", fontSize: "13px",
            marginBottom: "14px", transition: "opacity 0.15s ease",
          }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.opacity = "0.8")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.opacity = "0.4")}
          >
            <ArrowLeft size={13} /> Back to Dashboard
          </Link>
          <h1 style={{
            fontSize: "clamp(22px, 3vw, 32px)", fontWeight: "900",
            letterSpacing: "-0.8px", color: "#fff", marginBottom: "4px",
          }}>
            {step === "result" ? "Translation Complete ✓" : "Translate a Document"}
          </h1>
          <p style={{ color: "#fff", opacity: 0.4, fontSize: "13px" }}>
            {step === "result"
              ? `Translated to ${targetLang} · Scroll down to see all results`
              : "Upload a PDF or paste text · Choose your language · Get instant translation"}
          </p>
        </div>

        {/* ── TRANSLATING ── */}
        {step === "translating" && (
          <div style={{
            maxWidth: "520px", margin: "0 auto",
            background: "#0a0a0a", border: "1px solid #1a1a1a",
            borderRadius: "16px", padding: "48px 40px", textAlign: "center",
          }}>
            <div style={{
              width: "56px", height: "56px", borderRadius: "14px",
              background: "#111", border: "1px solid #222",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 20px",
            }}>
              <Loader2 size={26} color="#fff" style={{ animation: "spin 1s linear infinite" }} />
            </div>
            <h2 style={{ fontSize: "18px", fontWeight: "800", marginBottom: "6px", color: "#fff" }}>
              Processing Your Document
            </h2>
            <p style={{ color: "#fff", opacity: 0.4, fontSize: "13px", marginBottom: "28px" }}>{progress}</p>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px", textAlign: "left" }}>
              {[
                { label: "Translating document",              done: progressStep > 1 },
                { label: "Creating plain-language summary",   done: progressStep > 2 },
                { label: "Saving to your history",           done: progressStep > 3 },
              ].map(({ label, done }, i) => (
                <div key={label} style={{
                  display: "flex", alignItems: "center", gap: "10px",
                  padding: "10px 14px", borderRadius: "8px",
                  background: done ? "rgba(255,255,255,0.04)" : "#0d0d0d",
                  border: `1px solid ${done ? "#2a2a2a" : "#111"}`,
                }}>
                  {done
                    ? <CheckCircle size={15} color="#fff" />
                    : progressStep === i + 1
                      ? <Loader2 size={15} color="#555" style={{ animation: "spin 1s linear infinite" }} />
                      : <div style={{ width: 15, height: 15, borderRadius: "50%", border: "1px solid #222" }} />}
                  <span style={{ fontSize: "13px", color: done ? "#fff" : "#fff", opacity: done ? 1 : 0.35 }}>
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── INPUT ── */}
        {step === "input" && (
          <div className="translate-layout" style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: "16px", alignItems: "start" }}>

            {/* Main input area */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>

              {/* Mode toggle */}
              <div style={{
                display: "flex", background: "#0a0a0a", borderRadius: "8px",
                padding: "3px", border: "1px solid #1a1a1a", width: "fit-content",
              }}>
                {(["paste", "upload"] as const).map((mode) => (
                  <button key={mode} onClick={() => setInputMode(mode)} style={{
                    padding: "7px 20px", borderRadius: "6px", border: "none",
                    cursor: "pointer", fontSize: "13px", fontWeight: "700",
                    fontFamily: "Inconsolata, monospace", transition: "all 0.15s ease",
                    background: inputMode === mode ? "#fff" : "transparent",
                    color: inputMode === mode ? "#000" : "#fff",
                    opacity: inputMode === mode ? 1 : 0.4,
                  }}>
                    {mode === "paste" ? "✏️  Paste Text" : "📄  Upload PDF"}
                  </button>
                ))}
              </div>

              {/* Upload zone */}
              {inputMode === "upload" ? (<>
                <div
                  className={`drop-zone ${dragOver ? "drag-over" : ""}`}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  style={{ minHeight: "220px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}
                >
                  <input ref={fileInputRef} type="file" accept=".pdf,application/pdf" style={{ display: "none" }}
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileUpload(f); }} />
                  {progress ? (
                    <>
                      <Loader2 size={28} color="#fff" style={{ animation: "spin 1s linear infinite", marginBottom: "12px" }} />
                      <p style={{ color: "#fff", fontSize: "14px" }}>{progress}</p>
                    </>
                  ) : fileName ? (
                    <>
                      <CheckCircle size={28} color="#fff" style={{ marginBottom: "12px" }} />
                      <h3 style={{ fontSize: "15px", fontWeight: "700", color: "#fff", marginBottom: "4px" }}>{fileName}</h3>
                      <p style={{ color: "#fff", opacity: 0.5, fontSize: "13px" }}>
                        {inputText.length.toLocaleString()} characters extracted · Click to change file
                      </p>
                    </>
                  ) : (
                    <>
                      <Upload size={28} color="#fff" style={{ opacity: 0.4, marginBottom: "12px" }} />
                      <h3 style={{ fontSize: "15px", fontWeight: "700", color: "#fff", marginBottom: "6px" }}>
                        Drop your PDF here
                      </h3>
                      <p style={{ color: "#fff", opacity: 0.4, fontSize: "13px" }}>
                        or click to browse · PDF files up to 10MB
                      </p>
                      <p style={{ color: "#fff", opacity: 0.25, fontSize: "12px", marginTop: "8px" }}>
                        Tip: If PDF fails, switch to &quot;Paste Text&quot; and copy-paste the content
                      </p>
                    </>
                  )}
                </div>

                {/* Sample Documents */}
                {!fileName && !progress && (
                  <div style={{ marginTop: "20px" }}>
                    <p style={{
                      fontSize: "11px", fontWeight: "700", color: "#fff",
                      opacity: 0.4, textTransform: "uppercase", letterSpacing: "0.1em",
                      marginBottom: "10px",
                    }}>
                      ✦ Try a Sample Document
                    </p>
                    <div style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
                      gap: "8px",
                    }}>
                      {SAMPLE_DOCUMENTS.map((sample) => {
                        const isLoading = loadingSample === sample.file;
                        return (
                          <button
                            key={sample.file}
                            onClick={(e) => { e.stopPropagation(); handleSampleDocument(sample); }}
                            disabled={loadingSample !== null}
                            style={{
                              display: "flex", flexDirection: "column", alignItems: "flex-start",
                              gap: "6px", padding: "12px", borderRadius: "10px",
                              background: isLoading ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.04)",
                              border: isLoading ? "1px solid #444" : "1px solid #1e1e1e",
                              cursor: loadingSample !== null ? "not-allowed" : "pointer",
                              textAlign: "left", transition: "all 0.15s ease",
                              opacity: loadingSample !== null && !isLoading ? 0.4 : 1,
                            }}
                            onMouseEnter={(e) => {
                              if (!loadingSample) {
                                (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.08)";
                                (e.currentTarget as HTMLElement).style.borderColor = "#333";
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (!loadingSample) {
                                (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)";
                                (e.currentTarget as HTMLElement).style.borderColor = "#1e1e1e";
                              }
                            }}
                          >
                            <span style={{ fontSize: "20px", lineHeight: 1 }}>
                              {isLoading ? "⏳" : sample.emoji}
                            </span>
                            <span style={{
                              fontSize: "12px", fontWeight: "700", color: "#fff",
                              fontFamily: "Inconsolata, monospace", lineHeight: "1.3",
                            }}>
                              {sample.label}
                            </span>
                            <span style={{
                              fontSize: "11px", color: "#fff", opacity: 0.4,
                              fontFamily: "Inconsolata, monospace", lineHeight: "1.4",
                            }}>
                              {isLoading ? "Loading…" : sample.description}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </>) : (
                <div style={{ position: "relative" }}>
                  <textarea
                    id="document-text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder={"Paste your document text here...\n\nWorks great with:\n• Hospital discharge instructions\n• Court notices and summons\n• Housing lease agreements\n• Government benefit letters\n• Immigration notices"}
                    style={{
                      width: "100%", minHeight: "280px",
                      background: "#0a0a0a", border: "1px solid #1a1a1a",
                      borderRadius: "12px", padding: "16px",
                      color: "#fff", fontFamily: "Inconsolata, monospace",
                      fontSize: "14px", lineHeight: "1.7", resize: "vertical",
                      outline: "none", transition: "border-color 0.2s ease",
                    }}
                    onFocus={(e) => { (e.target as HTMLElement).style.borderColor = "#333"; }}
                    onBlur={(e) => { (e.target as HTMLElement).style.borderColor = "#1a1a1a"; }}
                  />
                  {inputText && (
                    <button onClick={() => setInputText("")} style={{
                      position: "absolute", top: "10px", right: "10px",
                      background: "#111", border: "1px solid #222",
                      borderRadius: "5px", cursor: "pointer", color: "#fff",
                      opacity: 0.5, padding: "4px", display: "flex",
                    }}><X size={13} /></button>
                  )}
                </div>
              )}

              {inputText && (
                <p style={{ fontSize: "12px", color: "#fff", opacity: 0.3 }}>
                  {inputText.length.toLocaleString()} characters · ready to translate
                </p>
              )}

              {error && (
                <div style={{
                  padding: "12px 14px", borderRadius: "8px",
                  background: "rgba(255,68,68,0.06)", border: "1px solid rgba(255,68,68,0.2)",
                  color: "#ff8888", fontSize: "13px",
                  display: "flex", alignItems: "flex-start", gap: "8px",
                }}>
                  <AlertCircle size={15} style={{ flexShrink: 0, marginTop: "1px" }} /> {error}
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>

              {/* Doc type */}
              <div style={{ background: "#0a0a0a", border: "1px solid #1a1a1a", borderRadius: "12px", padding: "16px" }}>
                <p style={{ fontSize: "11px", fontWeight: "700", color: "#fff", opacity: 0.5, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "10px" }}>
                  Document Type
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                  {DOC_TYPES.map(({ value, label, icon: Icon }) => (
                    <button key={value} onClick={() => setDocType(value)} style={{
                      display: "flex", alignItems: "center", gap: "8px",
                      padding: "9px 12px", borderRadius: "7px",
                      border: `1px solid ${docType === value ? "#444" : "#111"}`,
                      background: docType === value ? "#1a1a1a" : "transparent",
                      cursor: "pointer",
                      color: "#fff",
                      opacity: docType === value ? 1 : 0.45,
                      fontFamily: "Inconsolata, monospace", fontSize: "13px", fontWeight: "600",
                      transition: "all 0.15s ease", textAlign: "left",
                    }}>
                      <Icon size={13} /> {label}
                      {docType === value && <CheckCircle size={12} style={{ marginLeft: "auto" }} />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Language */}
              <div style={{ background: "#0a0a0a", border: "1px solid #1a1a1a", borderRadius: "12px", padding: "16px" }}>
                <p style={{ fontSize: "11px", fontWeight: "700", color: "#fff", opacity: 0.5, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "10px" }}>
                  Translate To
                </p>
                <div style={{ position: "relative" }}>
                  <button id="language-selector" onClick={() => setLangOpen(!langOpen)} style={{
                    width: "100%", display: "flex", alignItems: "center",
                    justifyContent: "space-between", padding: "10px 12px",
                    borderRadius: "8px", border: "1px solid #222",
                    background: "#111", cursor: "pointer",
                    color: "#fff", fontFamily: "Inconsolata, monospace",
                    fontSize: "14px", fontWeight: "700", transition: "all 0.15s ease",
                  }}>
                    <span style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                      <Globe size={13} color="#fff" style={{ opacity: 0.5 }} /> {targetLang}
                    </span>
                    <ChevronDown size={13} color="#fff" style={{
                      opacity: 0.4,
                      transform: langOpen ? "rotate(180deg)" : "rotate(0deg)",
                      transition: "transform 0.2s ease",
                    }} />
                  </button>

                  {langOpen && (
                    <div style={{
                      position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0,
                      background: "#0d0d0d", border: "1px solid #222",
                      borderRadius: "10px", zIndex: 50,
                      boxShadow: "0 16px 40px rgba(0,0,0,0.8)",
                    }}>
                      <div style={{ padding: "8px" }}>
                        <input
                          autoFocus
                          placeholder="Search language…"
                          value={langSearch}
                          onChange={(e) => setLangSearch(e.target.value)}
                          style={{
                            width: "100%", padding: "8px 10px",
                            background: "#111", border: "1px solid #222",
                            borderRadius: "6px", color: "#fff",
                            fontFamily: "Inconsolata, monospace", fontSize: "13px",
                            outline: "none",
                          }}
                        />
                      </div>
                      <div style={{ maxHeight: "200px", overflowY: "auto" }}>
                        {filteredLangs.map((lang) => (
                          <button key={lang} onClick={() => { setTargetLang(lang); setLangOpen(false); setLangSearch(""); }} style={{
                            width: "100%", padding: "9px 14px",
                            background: targetLang === lang ? "#1a1a1a" : "transparent",
                            border: "none", cursor: "pointer",
                            color: "#fff",
                            opacity: targetLang === lang ? 1 : 0.55,
                            fontFamily: "Inconsolata, monospace", fontSize: "13px",
                            fontWeight: targetLang === lang ? "700" : "400",
                            textAlign: "left", transition: "all 0.1s ease",
                          }}
                            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.opacity = "1"; (e.currentTarget as HTMLElement).style.background = "#111"; }}
                            onMouseLeave={(e) => {
                              if (targetLang !== lang) {
                                (e.currentTarget as HTMLElement).style.opacity = "0.55";
                                (e.currentTarget as HTMLElement).style.background = "transparent";
                              }
                            }}
                          >
                            {lang}
                          </button>
                        ))}
                        {filteredLangs.length === 0 && (
                          <p style={{ padding: "12px 14px", color: "#fff", opacity: 0.3, fontSize: "13px" }}>No languages found</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Translate button */}
              <button
                id="translate-btn"
                onClick={handleTranslate}
                disabled={!inputText.trim()}
                style={{
                  width: "100%", display: "flex", alignItems: "center",
                  justifyContent: "center", gap: "8px",
                  padding: "13px", borderRadius: "9px",
                  background: inputText.trim() ? "#fff" : "#111",
                  border: `1px solid ${inputText.trim() ? "#fff" : "#222"}`,
                  color: inputText.trim() ? "#000" : "#fff",
                  opacity: inputText.trim() ? 1 : 0.4,
                  cursor: inputText.trim() ? "pointer" : "not-allowed",
                  fontFamily: "Inconsolata, monospace",
                  fontSize: "14px", fontWeight: "800",
                  transition: "all 0.2s ease",
                }}
              >
                <Globe size={15} /> Translate &amp; Explain
              </button>

              <p style={{ fontSize: "11px", color: "#fff", opacity: 0.25, textAlign: "center", lineHeight: "1.5" }}>
                Translation + plain-language summary + key points
              </p>
            </div>
          </div>
        )}

        {/* ── RESULT ── */}
        {step === "result" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

            {isMock && (
              <div style={{
                padding: "12px 16px", borderRadius: "8px",
                background: "rgba(255,170,68,0.06)", border: "1px solid rgba(255,170,68,0.2)",
                color: "#ffbb66", fontSize: "13px",
                display: "flex", alignItems: "center", gap: "8px",
              }}>
                <AlertCircle size={14} />
                Demo mode — add your API keys to .env.local for real translations.
              </div>
            )}

            {/* Hint Bar */}
            <div style={{
              display: "flex", alignItems: "center", gap: "8px",
              padding: "10px 14px", borderRadius: "8px",
              background: "rgba(255,255,255,0.03)", border: "1px solid #1a1a1a",
              fontSize: "12px", color: "#fff", opacity: 0.45,
            }}>
              <Globe size={13} />
              <span>
                <strong style={{ opacity: 1, fontWeight: "700" }}>Tip:</strong> Highlight any word or sentence below to instantly translate it into another language.
              </span>
            </div>

            {/* 1. TOP SECTION: Original & Translation Side-by-Side */}
            <div className="result-grid">

              {/* Original */}
              <div data-selectable style={{ background: "#0a0a0a", border: "1px solid #1a1a1a", borderRadius: "12px", padding: "24px", display: "flex", flexDirection: "column" }}>
                <div style={cardHeaderStyle}>
                  <span style={cardLabelStyle}><FileText size={13} /> Original (English)</span>
                  <button onClick={() => handleCopy("original")} style={{
                    display: "flex", alignItems: "center", gap: "5px",
                    padding: "6px 14px", borderRadius: "6px",
                    background: copied === "original" ? "rgba(255,255,255,0.1)" : "#111",
                    border: "1px solid #222", cursor: "pointer",
                    color: "#fff", opacity: copied === "original" ? 1 : 0.6,
                    fontFamily: "Inconsolata, monospace", fontSize: "12px", fontWeight: "600",
                    transition: "all 0.15s ease",
                  }}>
                    {copied === "original" ? <CheckCircle size={12} /> : <Copy size={12} />}
                    {copied === "original" ? "Copied!" : "Copy Text"}
                  </button>
                </div>
                <div style={{
                  flex: 1, overflowY: "auto",
                  fontSize: "16px", lineHeight: "1.75", color: "#fff", opacity: 0.85,
                  whiteSpace: "pre-wrap", padding: "10px 0",
                  fontFamily: "system-ui, -apple-system, sans-serif",
                }}>
                  {inputText}
                </div>
              </div>

              {/* Translation */}
              <div data-selectable style={{ background: "#0a0a0a", border: "1px solid #333", borderRadius: "12px", padding: "24px", display: "flex", flexDirection: "column" }}>
                <div style={cardHeaderStyle}>
                  <span style={{ ...cardLabelStyle, opacity: 1 }}><Globe size={13} /> {targetLang} Translation</span>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button onClick={handleDownload} title="Download" style={{
                      display: "flex", alignItems: "center", gap: "5px",
                      padding: "6px 12px", borderRadius: "6px",
                      background: "#111", border: "1px solid #333", cursor: "pointer",
                      color: "#fff", fontSize: "12px", fontWeight: "600",
                      fontFamily: "Inconsolata, monospace", transition: "all 0.15s ease",
                    }}>
                      <Download size={13} /> Download
                    </button>
                    <button onClick={() => handleCopy("translated")} style={{
                      display: "flex", alignItems: "center", gap: "5px",
                      padding: "6px 14px", borderRadius: "6px",
                      background: copied === "translated" ? "rgba(255,255,255,0.1)" : "#fff",
                      border: "1px solid #fff", cursor: "pointer",
                      color: copied === "translated" ? "#fff" : "#000",
                      opacity: 1,
                      fontFamily: "Inconsolata, monospace", fontSize: "12px", fontWeight: "700",
                      transition: "all 0.15s ease",
                    }}>
                      {copied === "translated" ? <CheckCircle size={12} /> : <Copy size={12} />}
                      {copied === "translated" ? "Copied!" : "Copy"}
                    </button>
                  </div>
                </div>
                <div style={{
                  flex: 1, overflowY: "auto",
                  fontSize: "16px", lineHeight: "1.75", color: "#fff",
                  whiteSpace: "pre-wrap", padding: "10px 0",
                  fontFamily: "system-ui, -apple-system, sans-serif",
                }}>
                  {translatedText}
                </div>
              </div>
            </div>

             {/* 2. BOTTOM SECTION: Simple Explanation & Key Points */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              
              {/* Simple Explanation */}
              <div data-selectable style={{ background: "#0a0a0a", border: "1px solid #1a1a1a", borderRadius: "12px", padding: "24px" }}>
                <div style={cardHeaderStyle}>
                  <span style={cardLabelStyle}><Sparkles size={13} /> Simple Explanation</span>
                  <button onClick={() => handleCopy("simplified")} style={{
                    display: "flex", alignItems: "center", gap: "5px",
                    padding: "6px 14px", borderRadius: "6px",
                    background: copied === "simplified" ? "rgba(255,255,255,0.1)" : "#111",
                    border: "1px solid #222", cursor: "pointer",
                    color: "#fff", opacity: copied === "simplified" ? 1 : 0.6,
                    fontFamily: "Inconsolata, monospace", fontSize: "12px", fontWeight: "600",
                    transition: "all 0.15s ease",
                  }}>
                    {copied === "simplified" ? <CheckCircle size={12} /> : <Copy size={12} />}
                    {copied === "simplified" ? "Copied!" : "Copy Explanation"}
                  </button>
                </div>
                <div style={{
                  fontSize: "16px", lineHeight: "1.8", color: "#fff", opacity: 0.9,
                  whiteSpace: "pre-wrap", padding: "4px 0",
                  fontFamily: "system-ui, -apple-system, sans-serif",
                }}>
                  {simplifiedText}
                </div>
              </div>

              {/* Key Points */}
              {keyPoints.length > 0 && (
                <div style={{ background: "#0a0a0a", border: "1px solid #1a1a1a", borderRadius: "12px", padding: "24px" }}>
                  <div style={cardHeaderStyle}>
                    <span style={cardLabelStyle}><CheckCircle size={13} /> Key Points to Know</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                    {keyPoints.map((point, i) => (
                      <div key={i} style={{
                        display: "flex", gap: "14px", alignItems: "flex-start",
                        padding: "16px", borderRadius: "10px",
                        background: "#0d0d0d", border: "1px solid #141414",
                      }}>
                        <div style={{
                          width: "24px", height: "24px", borderRadius: "50%",
                          background: "#fff", color: "#000",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: "12px", fontWeight: "800", flexShrink: 0, marginTop: "2px",
                        }}>{i + 1}</div>
                        <p style={{
                          fontSize: "16px", lineHeight: "1.7", color: "#fff", opacity: 0.9,
                          fontFamily: "system-ui, -apple-system, sans-serif"
                        }}>{point}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Urgent Actions */}
              {urgentActions.length > 0 && (
                <div style={{ background: "rgba(255,68,68,0.04)", border: "1px solid rgba(255,68,68,0.15)", borderRadius: "12px", padding: "24px" }}>
                  <div style={{...cardHeaderStyle, borderColor: "rgba(255,68,68,0.15)"}}>
                    <span style={{...cardLabelStyle, color: "#ff6666", opacity: 1}}><AlertTriangle size={13} /> Urgent Actions Required</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {urgentActions.map((action, i) => (
                      <div key={i} style={{
                        display: "flex", gap: "12px", alignItems: "flex-start",
                      }}>
                        <AlertTriangle size={18} color="#ff6666" style={{ marginTop: "3px", flexShrink: 0 }} />
                        <p style={{
                          fontSize: "16px", lineHeight: "1.6", color: "#ffcccc",
                          fontFamily: "system-ui, -apple-system, sans-serif", fontWeight: "500"
                        }}>{action}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", paddingTop: "12px" }}>
              <button onClick={handleReset} style={{
                display: "inline-flex", alignItems: "center", gap: "7px",
                padding: "10px 20px", borderRadius: "8px",
                background: "#fff", border: "1px solid #fff",
                color: "#000", fontFamily: "Inconsolata, monospace",
                fontSize: "13px", fontWeight: "700", cursor: "pointer",
                transition: "all 0.15s ease",
              }}>
                <RotateCcw size={13} /> Translate Another Document
              </button>
              <Link href="/dashboard" style={{
                display: "inline-flex", alignItems: "center", gap: "7px",
                padding: "10px 20px", borderRadius: "8px",
                background: "transparent", border: "1px solid #2a2a2a",
                color: "#fff", fontFamily: "Inconsolata, monospace",
                fontSize: "13px", fontWeight: "600", textDecoration: "none",
                opacity: 0.7, transition: "opacity 0.15s ease",
              }}>
                View History
              </Link>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        /* Desktop: Fixed height panels */
        .result-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          height: calc(100vh - 280px); /* Fit within desktop view */
          min-height: 400px;
          overflow-y: auto; /* Allow scrolling within the fixed height container? No, result-grid is the container for panels */
        }
        
        /* Make children scrollable individually */
        .result-grid > div {
           overflow-y: auto;
           height: 100%;
        }

        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

        @media (max-width: 900px) {
          .translate-layout { grid-template-columns: 1fr !important; }
          /* Mobile: Stack and auto height */
          .result-grid { 
            grid-template-columns: 1fr !important; 
            height: auto !important;
            display: flex !important;
            flex-direction: column !important;
          }
          .result-grid > div { height: auto !important; overflow-y: visible !important; }
        }

        @media (max-width: 640px) {
          .result-grid { grid-template-columns: 1fr !important; height: auto !important; }
        }
      `}</style>
    </div>
  );
}

export default function TranslatePageWrapper() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: "#000" }} />}>
      <TranslatePage />
    </Suspense>
  );
}
