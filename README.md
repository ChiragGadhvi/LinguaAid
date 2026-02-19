# 🌍 LinguaAid

**Breaking Information Barriers for Immigrants & Refugees**

> "Every Document, Every Language, Instantly Understood."

## 🎬 Presentation & Demo Video

<video src="https://res.cloudinary.com/db5gbpl3a/video/upload/v1771499452/Linguaaidnew_yi8jyy.mp4" controls width="100%" poster="https://res.cloudinary.com/db5gbpl3a/image/upload/v1739964528/thumbnail_linguaaid.png">
  Your browser does not support the video tag.
</video>

---

## 📚 Technical Writing
Check out the deep-dive articles on how LinguaAid was built using Lingo.dev:

- **Medium**: <a href="https://medium.com/@chiraggadhvi/i-built-a-document-translator-in-48-hours-heres-what-lingo-dev-changed-7eed149bf0f2" target="_blank">I built a document translator in 48 hours — here’s what Lingo.dev changed</a>
- **Hashnode**: <a href="https://chiraggadhvi.hashnode.dev/i-built-a-document-translator-in-48-hours-heres-what-lingodev-changed?showSharer=true" target="_blank">I built a document translator in 48 hours — here’s what Lingo.dev changed</a>
- **Personal Blog**: <a href="https://www.chiraggadhvi.in/blog/i-built-a-document-translator-in-48-hours-here-s-what-lingo-dev-changed" target="_blank">Building LinguaAid with Lingo.dev</a>
- **Dev.to**: <a href="https://dev.to/chiraggadhvi/i-built-a-document-translator-in-48-hours-heres-what-lingodev-changed-5cdd" target="_blank">I built a document translator in 48 hours — here’s what Lingo.dev changed</a>

---

## 💡 Inspiration
Navigating a new country is hard. For millions of immigrants and refugees, understanding critical documents—like eviction notices, hospital discharge instructions, or government benefit letters—can be the difference between stability and crisis.

Language barriers often mean these vital documents are misunderstood or ignored until it's too late. We built **LinguaAid** to bridge this gap, not just by translating words, but by explaining the *context* and *actions required* in plain language.

## 🛠️ Tech Stack & Integration

<a href="https://nextjs.org/" target="_blank"><img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js" /></a>
<a href="https://lingo.dev/" target="_blank"><img src="https://img.shields.io/badge/Lingo.dev-blueviolet?style=for-the-badge&logo=i18next&logoColor=white" alt="Lingo.dev" /></a>
<a href="https://supabase.com/" target="_blank"><img src="https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase" /></a>
<a href="https://openai.com/" target="_blank"><img src="https://img.shields.io/badge/OpenAI-412991?style=for-the-badge&logo=openai&logoColor=white" alt="OpenAI" /></a>
<a href="https://tailwindcss.com/" target="_blank"><img src="https://img.shields.io/badge/TailwindCSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="TailwindCSS" /></a>

### 🌍 Lingo.dev Integration
LinguaAid leverages **Lingo.dev** as its high-performance translation core:
- **Context-Aware Translation**: Beyond literal word-to-word translation, Lingo.dev preserves the legal and medical context critical for immigrant documentation.
- **Workflow Efficiency**: We utilized the Lingo.dev ecosystem to manage complex locale mappings smoothly.
- **Speed**: Optimized API response times ensure users get results in seconds, even for lengthy documents.

## 🏗️ How We Built It
We engineered LinguaAid as a production-ready solution:

-   **Frontend**: Built with **Next.js 16** and **Framer Motion** for a fluid, accessible experience.
-   **Intelligent Processing**: A custom pipeline that chain-extracts text, translates via **Lingo.dev**, and then "de-jargons" using **GPT-4o**.
-   **Security**: **Supabase SSR** ensures that sensitive documents are only accessible to their owners.
-   **Real-time Insights**: A custom algorithm to scan translated text for "Urgent Action Items" (Deadlines, Fees, Medical Instructions).

## 🧠 Challenges & Solutions
-   **PDF Complexity**: Handling disparate layouts was solved with a modular text-extraction strategy using `pdf-parse`.
-   **The "Nuance" Problem**: Translation alone isn't enough. We bridged the cultural gap by adding an AI "Simplification" layer that explains host-country concepts.

## 🏅 Accomplishments That We're Proud Of
-   **Global Accessibility**: We support over 50 languages, including many that are often overlooked (e.g., Tigrinya, Hmong, Pashto).
-   **Real-time Logic**: The "Urgent Action" detection can genuinely save users from missing court dates or medical follow-ups.
-   **Selection Translator**: Just highlight any text on the result page to get an instant, context-aware translation popup!

## 🔮 What's Next for LinguaAid
-   **Voice Interface**: Adding text-to-speech for users with low literacy.
-   **Community Verified Translations**: Allowing trusted community members to verify and improve translations.
-   **Offline Mode**: A mobile app version for users with limited data access.

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

---

*Built with ❤️ for the **Multilingual Hackathon #2**.*

