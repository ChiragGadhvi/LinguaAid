import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(req: NextRequest) {
  try {
    const { text, targetLanguage, sourceLanguage = "en" } = await req.json();

    if (!text || !targetLanguage) {
      return NextResponse.json(
        { error: "Missing required fields: text, targetLanguage" },
        { status: 400 }
      );
    }

    const lingoKey = process.env.LINGODOTDEV_API_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;

    // 1. Try Lingo.dev first if key exists
    if (lingoKey) {
      try {
        const response = await fetch("https://api.lingo.dev/v1/translate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${lingoKey}`,
          },
          body: JSON.stringify({
            text,
            sourceLocale: sourceLanguage,
            targetLocale: targetLanguage,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          return NextResponse.json({
            translatedText: data.translatedText ?? data.text ?? text,
            sourceLanguage,
            targetLanguage,
            provider: "lingo",
          });
        }
      } catch (e) {
        console.warn("Lingo.dev translation failed, falling back...", e);
      }
    }

    // 2. Fallback to OpenAI if key exists
    if (openaiKey) {
      try {
        const openai = new OpenAI({ apiKey: openaiKey });
        
        // System prompt for high-quality, direct translation
        const completion = await openai.chat.completions.create({
          model: "gpt-4o-mini", // Fast and cheap model
          messages: [
            {
              role: "system",
              content: `You are a professional translator. 
              Translate the following text from ${sourceLanguage === "en" ? "English" : sourceLanguage} into ${targetLanguage}.
              - Maintain the original tone and formatting.
              - Do not add any introductory or concluding remarks.
              - Provide ONLY the translated text.
              - If the target language is English, refine the text for clarity and flow.`,
            },
            {
              role: "user",
              content: text,
            },
          ],
          temperature: 0.3,
        });

        const translatedText = completion.choices[0]?.message?.content?.trim();

        if (translatedText) {
          return NextResponse.json({
            translatedText,
            sourceLanguage,
            targetLanguage,
            provider: "openai",
          });
        }
      } catch (e) {
        console.error("OpenAI translation failed:", e);
      }
    }

    // 3. Fallback to Mock if NO keys work
    // We only show mock if we really have to, but we mark it clearly.
    console.warn("No translation provider available. Using mock.");

    const mockTranslations: Record<string, string> = {
      Hindi: `[हिंदी अनुवाद Demo] ${text.slice(0, 100)}... (Real translation requires API key)`,
      Spanish: `[Traducción Demo] ${text.slice(0, 100)}... (Real translation requires API key)`,
      French: `[Traduction Demo] ${text.slice(0, 100)}... (Real translation requires API key)`,
      // ... add others if needed or rely on generic fallback
    };

    const translatedText =
      mockTranslations[targetLanguage] ??
      `[${targetLanguage} Translation Demo] ${text.slice(0, 200)}... (Please add OPENAI_API_KEY or LINGODOTDEV_API_KEY to .env.local)`;

    return NextResponse.json({
      translatedText,
      sourceLanguage,
      targetLanguage,
      isMock: true,
    });

  } catch (error) {
    console.error("Translation route error:", error);
    return NextResponse.json(
      { error: "Translation failed internal error" },
      { status: 500 }
    );
  }
}
