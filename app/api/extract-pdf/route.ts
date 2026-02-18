import { NextRequest, NextResponse } from "next/server";
import pdfParse from "pdf-parse";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Basic validation
    const isPdf =
      file.type === "application/pdf" ||
      file.type === "application/octet-stream" ||
      file.name.toLowerCase().endsWith(".pdf");

    if (!isPdf) {
      return NextResponse.json(
        { error: "Only PDF files are supported. Please upload a .pdf file." },
        { status: 400 }
      );
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size must be under 10MB." },
        { status: 400 }
      );
    }

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Extract text using pdf-parse directly
    const data = await pdfParse(buffer);
    
    // Clean up text
    const text = (data.text || "")
      .replace(/\r\n/g, "\n") // Windows newlines
      .replace(/\r/g, "\n")   // Mac newlines
      .replace(/\n{4,}/g, "\n\n\n") // Collapse excessive newlines
      .replace(/[ \t]{3,}/g, "  ") // Collapse excessive tabs/spaces
      .trim();

    if (!text || text.length < 10) {
      return NextResponse.json(
        {
          error:
            "No readable text found in this PDF. It may be a scanned image. Please copy and paste the text manually instead.",
        },
        { status: 422 }
      );
    }

    return NextResponse.json({
      text,
      pages: data.numpages,
      fileName: file.name,
      charCount: text.length,
    });
  } catch (error) {
    console.error("PDF extraction error:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      {
        error: `Failed to read the PDF: ${msg}. Please try again, or switch to 'Paste Text' and copy-paste the content manually.`,
      },
      { status: 500 }
    );
  }
}
