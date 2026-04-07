import { NextRequest, NextResponse } from "next/server";

async function geminiSimplify(
  translatedText: string,
  documentType: string,
  targetLanguage: string,
  apiKey: string
): Promise<{ simple_explanation: string; key_points: string[]; urgent_actions: string[] }> {
  const systemPrompt = `You are a helpful assistant that simplifies complex official documents for immigrants and refugees.
Your job is to:
1. Explain the document in simple, plain language
2. Extract the 3-5 most important key points
3. Highlight any urgent actions required
4. Respond in ${targetLanguage} if possible, otherwise in English

Output MUST be valid JSON with these exact keys:
- "simple_explanation": A clear, 2-3 paragraph explanation.
- "key_points": An array of 3-5 strings (bullet points).
- "urgent_actions": An array of strings (actions user must take), or empty array if none.`;

  const userPrompt = `Please simplify this ${documentType} document:\n\n${translatedText.slice(0, 3000)}`;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] }],
        generationConfig: { response_mime_type: "application/json", temperature: 0.3, maxOutputTokens: 1000 },
      }),
    }
  );

  if (!res.ok) throw new Error(`Gemini API error: ${res.status}`);

  const data = await res.json();
  const raw = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "{}";
  return JSON.parse(raw);
}

export async function POST(req: NextRequest) {
  try {
    const { translatedText, documentType, targetLanguage } = await req.json();

    if (!translatedText) {
      return NextResponse.json({ error: "Missing required field: translatedText" }, { status: 400 });
    }

    const apiKey = process.env.GOOGLE_AI_API_KEY;

    if (apiKey) {
      try {
        const json = await geminiSimplify(translatedText, documentType, targetLanguage, apiKey);
        return NextResponse.json({
          simplifiedText: json.simple_explanation ?? "",
          keyPoints: json.key_points ?? [],
          urgentActions: json.urgent_actions ?? [],
        });
      } catch (e) {
        console.error("Gemini simplification failed:", e);
      }
    }

    // Mock fallback when no API key or Gemini fails
    return NextResponse.json({
      simplifiedText: `This is a ${documentType} document that has been translated for your understanding. The document contains important information that may affect your rights, benefits, or obligations.\n\nPlease read through the translated content carefully. If there are any deadlines or required actions mentioned, make sure to complete them on time. If you are unsure about anything, consider seeking help from a local community organization or legal aid service.`,
      keyPoints: [
        "This is an official document that requires your attention.",
        "Please review all sections carefully and note any deadlines.",
        "You may need to provide additional documentation.",
        "Contact the issuing authority if you have questions.",
        "Keep a copy of this document for your records.",
      ],
      urgentActions: [
        "Check for any deadlines mentioned in the text.",
        "Prepare your identification documents.",
      ],
      isMock: true,
    });
  } catch (error) {
    console.error("Simplification error:", error);
    return NextResponse.json({ error: "Simplification failed" }, { status: 500 });
  }
}
