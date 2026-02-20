import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LinguaAid",
  description:
    "Upload any government form, healthcare document, or legal notice and get it instantly translated, simplified, and explained in your native language.",
  keywords: [
    "translation", "immigrants", "refugees", "multilingual",
    "civic", "government forms", "healthcare", "legal",
  ],
  icons: {
    icon: [
      { url: "/favicon.png", type: "image/png" },
    ],
    apple: "/favicon.png",
  },
  openGraph: {
    title: "LinguaAid",
    description:
      "Breaking language barriers for immigrants and refugees. Translate and simplify official documents instantly.",
    type: "website",
  },
};

import SelectionTranslator from "@/components/SelectionTranslator";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" href="/moon.svg" type="image/png" />
        <link rel="apple-touch-icon" href="/favicon.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inconsolata:wght@300;400;500;600;700;800;900&family=Noto+Sans:wght@700&family=Noto+Sans+JP:wght@700&family=Noto+Sans+Devanagari:wght@700&family=Noto+Sans+Arabic:wght@700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <SelectionTranslator />
        {children}
      </body>
    </html>
  );
}
