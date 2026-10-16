# Simply IGCSE — AI Study & Exam Platform (Cambridge & Edexcel)

The ultimate AI-integrated study platform designed specifically for **Cambridge (CIE)** and **Pearson Edexcel IGCSE** students to achieve Grade 9 / A*.

---

## 🌟 Key Upgrades & Highlights

### 1. 👥 Complete Student Account & Authentication System
- **Sign Up**: Students register with their Name, Email, Password, Year Level, Exam Board, Target Grade, and Subjects.
- **Sign In**: Secure SHA-256 hashed password verification.
- **Forgot Password System**:
  - Enter registered email.
  - Generates a verified 6-digit security reset code.
  - Auto-fill verification code & choose new password with instant confirmation.
- **No Gemini API Key Required for Students**: The platform uses a centralized backend proxy. Students never have to provide an API key or create a Google account.

---

### 2. 🌍 English as a Second Language (ESL) & Expanded Subjects
The platform now includes full curriculum coverage for **English as a Second Language**:
- **Cambridge CIE 0510 / 0511** & **Pearson Edexcel 4ES1**:
  - **Exercise 1**: Reading Comprehension & Factual Scanning.
  - **Exercise 2**: Multiple Matching (Attitudes & Opinions).
  - **Exercise 3**: Note-Taking & Headings.
  - **Exercise 4**: Summary Writing (100–120 words, paraphrasing, no lifting, cohesive linkers).
  - **Exercise 5**: Informal Email / Letter Writing (Friendly register, contractions, conversational idioms).
  - **Exercise 6**: Formal School Magazine Article, Report & Review Writing.
  - Preloaded with past-paper sample questions, flashcards, mock quizzes, and top-band revision guides!

#### Full Subject List:
- **Languages**: English as a Second Language (0510/0511/4ES1), English First Language (0500).
- **Mathematics**: Mathematics (0580/4MA1), Additional Mathematics (0606).
- **Sciences**: Physics (0625/4PH1), Chemistry (0620/4CH1), Biology (0610/4BI1), Combined Sciences (0653/0654).
- **Technology**: Computer Science (0478/4CP0).
- **Humanities**: History (0470/4HI1), Geography (0460/4GE1), Sociology (0495), Environmental Management (0680).
- **Commercial & Business**: Economics (0455/4EC1), Business Studies (0450/4BS1), Accounting (0452/4AC1).

---

### 3. 🚀 Ready for Vercel Deployment

The application includes:
- `vercel.json` with SPA routing and serverless function forwarding.
- `api/gemini.ts` Vercel Serverless Function that proxies requests to Google Gemini using your central environment variable `GEMINI_API_KEY`.

#### How to Deploy to Vercel:
1. Push this project to GitHub (or import the folder directly in Vercel CLI).
2. Go to your [Vercel Dashboard](https://vercel.com/) and click **Add New > Project**.
3. Under **Environment Variables**, add:
   - **Name**: `GEMINI_API_KEY`
   - **Value**: Your Google Gemini API Key (get a free key at [Google AI Studio](https://aistudio.google.com/app/apikey))
4. Click **Deploy**. That's it! Your students can now sign up and use the platform seamlessly.

---

### 4. 🛠️ Local Development

```bash
# Install dependencies
npm install

# Start local development server
npm run dev

# Run production build
npm run build
```

The local development server runs at `http://localhost:5173/`.
