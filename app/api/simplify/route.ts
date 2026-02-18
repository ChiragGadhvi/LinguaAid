import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(req: NextRequest) {
  try {
    const { translatedText, documentType, targetLanguage } = await req.json();

    if (!translatedText) {
      return NextResponse.json(
        { error: "Missing required field: translatedText" },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;

    if (apiKey) {
      const openai = new OpenAI({ apiKey });

      const systemPrompt = `You are a helpful assistant that simplifies complex official documents for immigrants and refugees.
Your job is to:
1. Explain the document in simple, plain language
2. Extract the 3-5 most important key points
3. Highlight any urgent actions required
4. Respond in ${targetLanguage} if possible, otherwise in English

Output MUST be valid JSON with the following keys:
- "simple_explanation": A clear, 2-3 paragraph explanation.
- "key_points": An array of 3-5 strings (bullet points).
- "urgent_actions": An array of strings (actions user must take), or empty array if none.`;

      const userPrompt = `Please simplify this ${documentType} document:

${translatedText.slice(0, 3000)}`;

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_object" },
        max_tokens: 1000,
        temperature: 0.3,
      });

      const content = completion.choices[0]?.message?.content ?? "{}";
      let json;
      try {
        json = JSON.parse(content);
      } catch (e) {
        console.error("JSON parse error", e);
        json = { simple_explanation: content, key_points: [], urgent_actions: [] };
      }

      return NextResponse.json({
        simplifiedText: json.simple_explanation ?? "",
        keyPoints: json.key_points ?? [],
        urgentActions: json.urgent_actions ?? []
      });
    }

    // Mock simplification when no API key
    const mockKeyPoints = [
      "This is an official document that requires your attention.",
      "Please review all sections carefully and note any deadlines.",
      "You may need to provide additional documentation.",
      "Contact the issuing authority if you have questions.",
      "Keep a copy of this document for your records.",
    ];
    
    const mockUrgentActions = [
      "Check for any deadlines mentioned in the text.",
      "Prepare your identification documents.",
    ];

    const mockSimplified = `This is a ${documentType} document that has been translated for your understanding. The document contains important information that may affect your rights, benefits, or obligations.\n\nPlease read through the translated content carefully. If there are any deadlines or required actions mentioned, make sure to complete them on time. If you are unsure about anything, consider seeking help from a local community organization or legal aid service.`;

    return NextResponse.json({
      simplifiedText: mockSimplified,
      keyPoints: mockKeyPoints,
      urgentActions: mockUrgentActions,
      isMock: true,
    });
  } catch (error) {
    console.error("Simplification error:", error);
    return NextResponse.json(
      { error: "Simplification failed" },
      { status: 500 }
    );
  }
}
