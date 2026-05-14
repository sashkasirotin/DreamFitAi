# DreamFitAI 🚀

DreamFitAI is an advanced, AI-powered fitness and nutrition ecosystem designed to help users reach their body goals through personalized roadmaps, real-time meal analysis, and motivational journey storytelling.

## ✨ Features

- **🤖 AI-Powered Roadmap**: Generates a custom 4-week fitness and nutrition plan based on user profile (age, weight, goal, dietary preferences) using Gemini 2.5 Flash.
- **📸 Smart Meal Analysis**: Upload a photo or provide a description of your meal to get instant calorie estimates and nutritional breakdowns powered by Gemini AI.
- **📈 Progress Tracking**: Track weight and body fat with a visual trend chart (powered by Recharts) and a transformation photo gallery.
- **📖 Journey Stories**: Generates a motivational "Fitness Journey" story based on your progress photos and weight loss milestones.
- **💡 Daily AI Coach**: Personalized fitness and nutrition advice provided 3 times daily based on your recent activity.
- **📰 Fitness News**: Stay updated with the latest health and fitness trends via an integrated news widget.

## 🛠 Tech Stack

- **Frontend**: React (Vite), Mantine UI, Recharts, Tabler Icons.
- **Backend**: Node.js, Express.
- **Database**: PostgreSQL.
- **AI Engine**: Google Gemini 2.5 Flash.
- **Image Hosting**: Cloudinary.
- **Deployment**: Render.

---

## 🚀 Local Setup

### 1. Prerequisites
- Node.js (v18 or higher)
- PostgreSQL (Local or Cloud instance like Neon.tech)
- Google AI Studio API Key (Gemini)
- Cloudinary Account

### 2. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd dreamFitAi-backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file and fill in the following:
   ```env
   PORT=5000
   DATABASE_URL=your_postgresql_connection_string
   JWT_SECRET=your_random_secret_string
   GEMINI_API_KEY=your_google_ai_studio_key
   CLOUDINARY_URL=your_cloudinary_url (cloudinary://api_key:api_secret@cloud_name)
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```

### 3. Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd fittrack-frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```
4. Run the frontend:
   ```bash
   npm run dev
   ```

---

## 🌍 Deployment on Render

1. **Database**: Create a **Web Service** or **Managed PostgreSQL** instance on Render.
2. **Backend**:
   - Build Command: `npm install`
   - Start Command: `node server.js` (or `npm start`)
   - Add all Environment Variables from your local `.env` to the Render Dashboard.
3. **Frontend**:
   - Build Command: `npm install && npm run build`
   - Publish Directory: `dist`
   - Add `VITE_API_URL` pointing to your deployed backend URL.

---

## 🔑 Where to get API Keys

- **Gemini API Key**: [Google AI Studio](https://aistudio.google.com/)
- **Cloudinary URL**: Sign up at [Cloudinary](https://cloudinary.com/) and find your connection string in the Dashboard.
- **PostgreSQL**: Use [Neon.tech](https://neon.tech/) for a free, scalable cloud database.

## ⚠️ Known Limitations (Beta)
- **AI Quota**: Since this uses the Gemini Free Tier, you may encounter `Daily AI quota exceeded` errors during peak usage.
- **Latency**: AI responses may occasionally take 5-10 seconds due to the complexity of the vision analysis.

---

Created by sashkasirotin | Powered by Gemini 2.5 Flash
