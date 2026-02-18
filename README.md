# 🌍 LinguaAid

**Breaking Information Barriers for Immigrants & Refugees**

> "Every Document, Every Language, Instantly Understood."

---

## 💡 Inspiration
Navigating a new country is hard. For millions of immigrants and refugees, understanding critical documents—like eviction notices, hospital discharge instructions, or government benefit letters—can be the difference between stability and crisis.

Language barriers often mean these vital documents are misunderstood or ignored until it's too late. We built **LinguaAid** to bridge this gap, not just by translating words, but by explaining the *context* and *actions required* in plain language.

## 🚀 What It Does
LinguaAid is an intelligent document assistant that:
1.  **Extracts Text from PDFs**: Users can drag-and-drop complex legal or medical forms.
2.  **Instantly Translates**: Supports **50+ languages**, from Spanish and Mandarin to Amharic and Hmong, prioritizing underserved communities.
3.  **Simplifies Jargon**: Uses AI to rewrite complex legalese into **plain, simple language**.
4.  **Extracts Key Points**: Automatically identifies critical information (dates, deadlines, amounts due).
5.  **Flags Urgent Actions**: Highlights immediate steps the user needs to take to protect their rights or health.

## 🛠️ How We Built It
We built LinguaAid using a modern, scalable tech stack:

-   **Frontend**: [Next.js 16](https://nextjs.org/) (App Router) for a fast, responsive UI.
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/) with a custom glassmorphism design system for a premium, accessible feel.
-   **Database & Auth**: [Supabase](https://supabase.com/) for secure user authentication and storing translation history.
-   **Translation Engine**:
    -   **Lingo.dev**: Primary translation API for high-quality, culturally aware translations.
    -   **OpenAI (GPT-4o)**: Fallback translation and powerful simplification logic to "de-jargon" complex text.
-   **PDF Processing**: Custom API route for text extraction.

## 🧠 Challenges We Ran Into
-   **Handling PDF Layouts**: Extracting clean text from scans or complex layouts was tricky. We implemented a robust extraction pipeline.
-   **Cultural Context**: Translations often lose nuance. We tuned our AI prompts to prioritize *meaning* over literal translation, and to explain concepts that might not exist in the target culture.
-   **Latency**: Chaining multiple AI calls (translation -> simplification -> key points) builds up latency to users. We optimized this by parallelizing requests and using streaming UI updates.

## 🏅 Accomplishments That We're Proud Of
-   **Global Accessibility**: We support over 50 languages, including many that are often overlooked by major translation tools (e.g., Tigrinya, Hmong, Pashto).
-   **Real-time Logic**: The "Urgent Action" detection can genuinely save users from missing court dates or medical follow-ups.
-   **Selection Translator**: Just highlight any text on the result page to get an instant, context-aware translation popup—a feature we use daily!

## 🔮 What's Next for LinguaAid
-   **Voice Interface**: Adding text-to-speech for users with low literacy.
-   **Community Verified Translations**: Allowing trusted community members to verify and improve translations for local dialects.
-   **Offline Mode**: A mobile app version for users with limited fast internet access.

---

## 📦 Getting Started

### Prerequisites
-   Node.js 18+
-   Supabase Account
-   Lingo.dev / OpenAI API Keys

### Installation

1.  **Clone the repo**
    ```bash
    git clone https://github.com/yourusername/LinguaAid.git
    cd LinguaAid
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Set up Environment Variables**
    Create a `.env.local` file in the root directory:
    ```bash
    NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
    OPENAI_API_KEY=your_openai_key
    LINGODOTDEV_API_KEY=your_lingo_key
    ```

4.  **Run the development server**
    ```bash
    npm run dev
    ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

---

## 🤝 Contributing
We welcome contributions! Please feel free to verify translations or suggest new document types.

## 📄 License
MIT

---
*Built with ❤️ for the [Your Hackathon Name] Hackathon.*
