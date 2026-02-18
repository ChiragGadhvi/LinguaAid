#!/usr/bin/env node
/**
 * Standalone PDF text extractor.
 * Called as a child process by the Next.js API route.
 * Reads a base64-encoded PDF from stdin, writes JSON to stdout.
 * This runs in plain Node.js, completely outside Turbopack bundling.
 */

const chunks = [];
process.stdin.on("data", (chunk) => chunks.push(chunk));
process.stdin.on("end", async () => {
    try {
        const b64 = Buffer.concat(chunks).toString("utf8").trim();
        const pdfBuffer = Buffer.from(b64, "base64");

        // pdf-parse v1.x — require returns the function directly in plain Node.js
        const pdfParse = require("pdf-parse");
        const fn = typeof pdfParse === "function" ? pdfParse : pdfParse.default ?? pdfParse.PDFParse;

        if (typeof fn !== "function") {
            throw new Error("pdf-parse did not export a callable function. Keys: " + Object.keys(pdfParse).join(", "));
        }

        const data = await fn(pdfBuffer);
        let text = (data.text ?? "")
            .replace(/\r\n/g, "\n")
            .replace(/\r/g, "\n")
            .replace(/\n{4,}/g, "\n\n\n")
            .replace(/[ \t]{3,}/g, "  ")
            .trim();

        process.stdout.write(JSON.stringify({ ok: true, text, pages: data.numpages }));
    } catch (err) {
        process.stdout.write(JSON.stringify({ ok: false, error: String(err?.message ?? err) }));
    }
});
