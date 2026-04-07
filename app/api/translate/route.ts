import { NextRequest, NextResponse } from "next/server";

// Map language names to ISO 639-1 codes for MyMemory API
const LANG_CODES: Record<string, string> = {
  English: "en", Hindi: "hi", Arabic: "ar", Spanish: "es", French: "fr",
  Mandarin: "zh", Portuguese: "pt", Bengali: "bn", Russian: "ru", Urdu: "ur",
  Japanese: "ja", Swahili: "sw", Turkish: "tr", Korean: "ko", Vietnamese: "vi",
  Thai: "th", Tagalog: "tl", Amharic: "am", Somali: "so", "Haitian Creole": "ht",
  Pashto: "ps", Dari: "prs", Tigrinya: "ti", Burmese: "my", Nepali: "ne",
  Khmer: "km", Lao: "lo", Hmong: "hmn", Yoruba: "yo", Igbo: "ig", Zulu: "zu",
  Malay: "ms", Indonesian: "id", Persian: "fa", Punjabi: "pa", Tamil: "ta",
  Telugu: "te", Gujarati: "gu", Marathi: "mr", Kannada: "kn", Malayalam: "ml",
  Sinhala: "si", Ukrainian: "uk", Polish: "pl", Romanian: "ro", Dutch: "nl",
  Swedish: "sv", Norwegian: "no", German: "de", Italian: "it",
};

// Split text into chunks <= 450 chars at word boundaries
function chunkText(text: string, maxLen = 450): string[] {
  const chunks: string[] = [];
  let remaining = text.trim();
  while (remaining.length > maxLen) {
    let cutAt = remaining.lastIndexOf(" ", maxLen);
    if (cutAt <= 0) cutAt = maxLen;
    chunks.push(remaining.slice(0, cutAt));
    remaining = remaining.slice(cutAt).trim();
  }
  if (remaining) chunks.push(remaining);
  return chunks;
}

async function myMemoryTranslate(text: string, from: string, to: string): Promise<string> {
  const chunks = chunkText(text);
  const results: string[] = [];

  for (const chunk of chunks) {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(chunk)}&langpair=${from}|${to}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`MyMemory error: ${res.status}`);
    const data = await res.json();
    if (data.responseStatus !== 200) throw new Error(data.responseDetails ?? "MyMemory failed");
    results.push(data.responseData.translatedText);
  }

  return results.join(" ");
}

export async function POST(req: NextRequest) {
  try {
    const { text, targetLanguage, sourceLanguage = "en" } = await req.json();

    if (!text || !targetLanguage) {
      return NextResponse.json(
        { error: "Missing required fields: text, targetLanguage" },
        { status: 400 }
      );
    }

    const fromCode = LANG_CODES[sourceLanguage] ?? sourceLanguage;
    const toCode = LANG_CODES[targetLanguage] ?? targetLanguage;

    // If source and target are the same, return as-is
    if (fromCode === toCode) {
      return NextResponse.json({ translatedText: text, sourceLanguage, targetLanguage, provider: "passthrough" });
    }

    // 1. Try MyMemory (free, no key required)
    try {
      const translatedText = await myMemoryTranslate(text, fromCode, toCode);
      return NextResponse.json({ translatedText, sourceLanguage, targetLanguage, provider: "mymemory" });
    } catch (e) {
      console.warn("MyMemory translation failed:", e);
    }

    // 2. Mock fallback
    console.warn("No translation provider succeeded. Using mock.");
    const translatedText = `[${targetLanguage} Translation] ${text.slice(0, 200)}... (Translation service temporarily unavailable — please try again)`;
    return NextResponse.json({ translatedText, sourceLanguage, targetLanguage, isMock: true });

  } catch (error) {
    console.error("Translation route error:", error);
    return NextResponse.json({ error: "Translation failed internal error" }, { status: 500 });
  }
}
