// Test the PDF API endpoint end-to-end
const fs = require("fs");
const http = require("http");
const path = require("path");

const pdfPath = "C:\\Users\\chirag.gadhvi\\Downloads\\ChiragGadhvi_Resume.pdf";
const pdfBuf = fs.readFileSync(pdfPath);

const boundary = "----FormBoundary" + Math.random().toString(36).slice(2);
const body = Buffer.concat([
    Buffer.from(
        "--" + boundary + "\r\n" +
        "Content-Disposition: form-data; name=\"file\"; filename=\"test.pdf\"\r\n" +
        "Content-Type: application/pdf\r\n\r\n"
    ),
    pdfBuf,
    Buffer.from("\r\n--" + boundary + "--\r\n"),
]);

const options = {
    hostname: "localhost",
    port: 3000,
    path: "/api/extract-pdf",
    method: "POST",
    headers: {
        "Content-Type": "multipart/form-data; boundary=" + boundary,
        "Content-Length": body.length,
    },
};

const req = http.request(options, (res) => {
    let data = "";
    res.on("data", (chunk) => (data += chunk));
    res.on("end", () => {
        console.log("HTTP Status:", res.statusCode);
        try {
            const r = JSON.parse(data);
            if (r.text) {
                console.log("✅ SUCCESS!");
                console.log("   chars:", r.text.length);
                console.log("   pages:", r.pages);
                console.log("   preview:", r.text.slice(0, 120));
            } else {
                console.log("❌ Error response:", JSON.stringify(r));
            }
        } catch {
            console.log("Raw response:", data.slice(0, 300));
        }
    });
});

req.on("error", (e) => console.log("Request error:", e.message));
req.write(body);
req.end();
