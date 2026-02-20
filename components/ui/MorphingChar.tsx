"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";

// The word "Language" translated into 50 languages
// Each morph IS the product — a live translation
const TRANSLATIONS = [
  { word: "Language",    lang: "English",    code: "en",  rtl: false },
  { word: "Lingua",      lang: "Italian",    code: "it",  rtl: false },
  { word: "Langue",      lang: "French",     code: "fr",  rtl: false },
  { word: "Lengua",      lang: "Spanish",    code: "es",  rtl: false },
  { word: "Língua",      lang: "Portuguese", code: "pt",  rtl: false },
  { word: "Sprache",     lang: "German",     code: "de",  rtl: false },
  { word: "Язык",        lang: "Russian",    code: "ru",  rtl: false },
  { word: "Мова",        lang: "Ukrainian",  code: "uk",  rtl: false },
  { word: "Γλώσσα",     lang: "Greek",      code: "el",  rtl: false },
  { word: "لغة",         lang: "Arabic",     code: "ar",  rtl: true  },
  { word: "زبان",        lang: "Persian",    code: "fa",  rtl: true  },
  { word: "زبان",        lang: "Urdu",       code: "ur",  rtl: true  },
  { word: "שפה",         lang: "Hebrew",     code: "he",  rtl: true  },
  { word: "ژبه",         lang: "Pashto",     code: "ps",  rtl: true  },
  { word: "भाषा",        lang: "Hindi",      code: "hi",  rtl: false },
  { word: "ভাষা",        lang: "Bengali",    code: "bn",  rtl: false },
  { word: "ਭਾਸ਼ਾ",       lang: "Punjabi",    code: "pa",  rtl: false },
  { word: "ભાષા",        lang: "Gujarati",   code: "gu",  rtl: false },
  { word: "भाषा",        lang: "Nepali",     code: "ne",  rtl: false },
  { word: "மொழி",       lang: "Tamil",      code: "ta",  rtl: false },
  { word: "భాష",         lang: "Telugu",     code: "te",  rtl: false },
  { word: "ಭಾಷೆ",        lang: "Kannada",    code: "kn",  rtl: false },
  { word: "ഭാഷ",         lang: "Malayalam",  code: "ml",  rtl: false },
  { word: "භාෂාව",       lang: "Sinhala",    code: "si",  rtl: false },
  { word: "言語",         lang: "Japanese",   code: "ja",  rtl: false },
  { word: "语言",         lang: "Chinese",    code: "zh",  rtl: false },
  { word: "언어",         lang: "Korean",     code: "ko",  rtl: false },
  { word: "ภาษา",        lang: "Thai",       code: "th",  rtl: false },
  { word: "ພາສາ",        lang: "Lao",        code: "lo",  rtl: false },
  { word: "ဘာသာ",       lang: "Burmese",    code: "my",  rtl: false },
  { word: "ភាសា",        lang: "Khmer",      code: "km",  rtl: false },
  { word: "Bahasa",      lang: "Malay",      code: "ms",  rtl: false },
  { word: "Ngôn ngữ",   lang: "Vietnamese", code: "vi",  rtl: false },
  { word: "Dil",         lang: "Turkish",    code: "tr",  rtl: false },
  { word: "Lugha",       lang: "Swahili",    code: "sw",  rtl: false },
  { word: "ቋንቋ",         lang: "Amharic",    code: "am",  rtl: false },
  { word: "ቛንቛ",         lang: "Tigrinya",   code: "ti",  rtl: false },
  { word: "ენა",         lang: "Georgian",   code: "ka",  rtl: false },
  { word: "Լեզու",      lang: "Armenian",   code: "hy",  rtl: false },
  { word: "Хэл",        lang: "Mongolian",  code: "mn",  rtl: false },
  { word: "Taal",        lang: "Dutch",      code: "nl",  rtl: false },
  { word: "Język",       lang: "Polish",     code: "pl",  rtl: false },
  { word: "Limbă",       lang: "Romanian",   code: "ro",  rtl: false },
  { word: "Jazyk",       lang: "Czech",      code: "cs",  rtl: false },
  { word: "Ziman",       lang: "Kurdish",    code: "ku",  rtl: false },
  { word: "Luqad",       lang: "Somali",     code: "so",  rtl: false },
  { word: "Lang",        lang: "Haitian",    code: "ht",  rtl: false },
  { word: "Език",        lang: "Bulgarian",  code: "bg",  rtl: false },
  { word: "Dili",        lang: "Tagalog",    code: "tl",  rtl: false },
  { word: "Förde",       lang: "Swedish",    code: "sv",  rtl: false },
];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const INTERVAL = 3000;

export function MorphingChar({ size = 48 }: { size?: number }) {
  const [items, setItems] = useState(TRANSLATIONS);
  const [idx, setIdx]     = useState(0);

  // Shuffle only on the client after first render — avoids SSR/client mismatch
  useEffect(() => {
    setItems(shuffle(TRANSLATIONS));
    setIdx(0);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % items.length), INTERVAL);
    return () => clearInterval(t);
  }, [items.length]);

  const current = items[idx];

  // Font size scales with the word length so short words stay large, long ones shrink gracefully
  const wordLen   = current.word.length;
  const fontSize  = wordLen <= 3  ? size
                  : wordLen <= 6  ? size * 0.75
                  : wordLen <= 9  ? size * 0.58
                  :                 size * 0.46;

  return (
    <div
      style={{
        position: "relative",
        minWidth: size * 2.5,
        height: size * 1.1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 2,
      }}
    >
      {/* Subtle ambient glow */}
      <div
        style={{
          position: "absolute",
          inset: "-20%",
          borderRadius: "50%",
          background:
            "radial-gradient(ellipse at center, rgba(255,255,255,0.06) 0%, transparent 65%)",
          pointerEvents: "none",
        }}
      />

      <AnimatePresence mode="wait">
        <motion.div
          key={idx}
          initial={{ opacity: 0, scale: 0.78, filter: "blur(8px)",  y: 4 }}
          animate={{ opacity: 1, scale: 1,    filter: "blur(0px)",  y: 0 }}
          exit={{    opacity: 0, scale: 1.18,  filter: "blur(8px)", y: -4 }}
          transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
          style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
        >
          {/* The translated word */}
          <span
            dir={current.rtl ? "rtl" : "ltr"}
            style={{
              fontSize,
              lineHeight: 1.1,
              fontWeight: 700,
              color: "#fff",
              userSelect: "none",
              textShadow: "0 0 20px rgba(255,255,255,0.15)",
              fontFamily:
                "'Noto Sans', 'Noto Sans JP', 'Noto Sans Devanagari', 'Noto Sans Arabic', " +
                "'Noto Sans Tamil', 'Noto Sans Ethiopic', 'Noto Sans Georgian', " +
                "'Noto Sans Armenian', 'Noto Sans Thai', 'Noto Sans Myanmar', sans-serif",
              letterSpacing: current.code === "en" ? "-0.5px" : "0",
            }}
          >
            {current.word}
          </span>

          {/* Language label — tiny, muted */}
          <span
            style={{
              fontSize: 10,
              color: "#666",
              fontWeight: 500,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              marginTop: 4,
              fontFamily: "inherit",
              userSelect: "none",
            }}
          >
            {current.lang}
          </span>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
