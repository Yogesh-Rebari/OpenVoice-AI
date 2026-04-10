# OpenVoice AI – Anonymous Complaint & Issue Reporting System

OpenVoice AI is a high-security, anonymous platform designed for reporting community issues, workplace complaints, or public service disruptions. Powered by the Gemini 3 Flash model, it provides an intelligent conversational interface that extracts structured data from natural language reports while maintaining absolute user anonymity.

![OpenVoice AI Banner](https://picsum.photos/seed/security/1200/400)

## 🚀 Key Features

- **AI-Powered Intake**: A conversational assistant that understands context, asks relevant follow-up questions, and extracts structured data (Category, Location, Time, Severity).
- **Absolute Anonymity**: No login required. The system generates a temporary `ANONYMOUS_ID` for every session and never asks for personally identifiable information (PII).
- **Real-Time Telemetry**: A "Hardware-Inspired" dashboard that displays extracted data points as you chat.
- **Secure UI/UX**: Immersive dark theme with technical grids, neon emerald accents, and monospace typography for a high-security feel.
- **Zero-Knowledge Architecture**: Designed to process information without storing user metadata.

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS 4.0
- **Backend**: Node.js, Express
- **AI Engine**: Google Gemini 3 Flash (via `@google/genai`)
- **Animations**: Framer Motion (Motion for React)
- **Icons**: Lucide React
- **UI Components**: Radix UI / Base UI

## 📋 Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- A Google Gemini API Key (Get one at [Google AI Studio](https://aistudio.google.com/))

## ⚙️ Installation & Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/openvoice-ai.git
   cd openvoice-ai
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the root directory and add your Gemini API key:
   ```env
   GEMINI_API_KEY=your_api_key_here
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:3000`.

## 🏗️ Deployment

### Recommended Hosting Platforms

Since OpenVoice AI is a full-stack application (Express + React), you should host it on platforms that support Node.js environments:

1. **Google Cloud Run (Recommended)**:
   - Perfect for containerized apps.
   - Scale to zero when not in use (cost-effective).
   - High security and reliability.

2. **Render**:
   - Very easy to set up.
   - Connect your GitHub repo and it handles the rest.
   - Choose "Web Service" for the Express backend.

3. **Railway**:
   - Excellent developer experience.
   - Automatic deployments and easy environment variable management.

4. **DigitalOcean App Platform**:
   - Robust and scalable.
   - Good for production-grade applications.

### Build Command
To prepare the app for production:
```bash
npm run build
```
This will generate the static assets in the `dist` folder, which the Express server will serve in production mode.

## 🔒 Security & Privacy

OpenVoice AI is built with a "Privacy by Design" approach:
- **No Database by Default**: In this version, reports are processed in-memory. For production, integrate with a secure database like Firestore or PostgreSQL.
- **PII Scrubbing**: The AI is instructed to never request or store names, emails, or phone numbers unless explicitly volunteered by the user for follow-up.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---
*Built with ❤️ for a more transparent and safer community.*
