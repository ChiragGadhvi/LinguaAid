import { NextRequest, NextResponse } from "next/server";
import { execFile } from "child_process";
import path from "path";

export const runtime = "nodejs";

function runExtractor(pdfBuffer: Buffer): Promise<{ text: string; pages: number }> {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(process.cwd(), "scripts", "extract-pdf.js");

    const child = execFile(
      "node",
      [scriptPath],
      { timeout: 30_000, maxBuffer: 50 * 1024 * 1024 },
      (err, stdout, stderr) => {
        if (stderr) console.warn("PDF extractor stderr:", stderr);

        // stdout may have warnings before the JSON — find the JSON object
        const jsonMatch = stdout.match(/\{[\s\S]*\}$/);
        if (!jsonMatch) {
          return reject(new Error("No JSON output from PDF extractor"));
        }

        try {
          const result = JSON.parse(jsonMatch[0]);
          if (!result.ok) {
            return reject(new Error(result.error ?? "PDF extraction failed"));
          }
          resolve({ text: result.text, pages: result.pages ?? 1 });
        } catch {
          reject(new Error("Failed to parse PDF extractor output"));
        }
      }
    );

    // Send the PDF as base64 via stdin
    if (child.stdin) {
      child.stdin.write(pdfBuffer.toString("base64"));
      child.stdin.end();
    } else {
      reject(new Error("Could not open stdin to PDF extractor"));
    }
  });
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

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

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { text, pages } = await runExtractor(buffer);

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
      pages,
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
