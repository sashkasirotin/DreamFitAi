# DreamFitAI 🚀

DreamFitAI is an advanced, AI-powered fitness and nutrition ecosystem designed to help users reach their body goals through personalized roadmaps, real-time meal analysis, and motivational journey storytelling.

## ✨ Features

- **🤖 AI-Powered Roadmap**: Generates a custom 4-week fitness and nutrition plan based on user profile (age, weight, goal, dietary preferences) using Gemini 2.5 Flash.
- **📸 Smart Meal Analysis**: Upload a photo or provide a description of your meal to get instant calorie estimates and nutritional breakdowns powered by Gemini AI.
- **📈 Progress Tracking**: Track weight and body fat with a visual trend chart (powered by Recharts) and a transformation photo gallery.
- **📖 Journey Stories**: Generates a motivational "Fitness Journey" story based on your progress photos and weight loss milestones.
- **💡 Daily AI Coach**: Personalized fitness and nutrition advice provided 3 times daily based on your recent activity.
- **📰 Fitness News**: Stay updated with the latest health and fitness trends via an integrated news widget.

## 🗺️ User Flows & Use Cases

1. **Onboarding & Goal Setting**
   - *Flow*: User signs up ➡️ Redirected to AI Roadmap ➡️ Enters physical stats & goals ➡️ AI generates a structured 4-week workout and nutrition plan.
   - *Value*: Instantly provides the user with an actionable path forward tailored to their specific body type and objectives.

2. **Daily Activity Logging**
   - *Flow*: User goes to "Log Activity" ➡️ Takes a photo of their meal ➡️ AI instantly estimates calories ➡️ User saves the meal. User logs their workout duration and type.
   - *Value*: Removes the friction of manual calorie counting by leveraging Computer Vision. Mistakes can be instantly undone with the "Undo Last" button.

3. **Transformation Tracking**
   - *Flow*: User logs their weight and a mirror selfie weekly ➡️ Views the visual trend chart ➡️ Browses their transformation gallery.
   - *Value*: Keeps the user motivated by visualizing their progress over time. Users can delete bad photos without losing their weight data.

4. **Motivational Review**
   - *Flow*: After a few weeks of consistent logging, user clicks "My Journey Story" ➡️ AI analyzes their history and photos ➡️ Generates a personalized, narrative timeline of their progress.
   - *Value*: Turns raw data into an emotional and shareable success story.

5. **Daily Check-ins**
   - *Flow*: User opens the Dashboard ➡️ Reads their dynamic "AI Coach" advice (updates based on their latest logs) ➡️ Checks their daily calorie and workout summaries ➡️ Reads the latest fitness news.
   - *Value*: Provides a central hub for daily accountability and education.

## 🛠 Tech Stack

- **Frontend**: React (Vite), Mantine UI, Recharts, Tabler Icons.
- **Backend**: Node.js, Express.
- **Database**: PostgreSQL.
- **AI Engine**: Google Gemini 2.5 Flash.
- **Image Hosting**: Cloudinary.
- **Deployment**: Render.

---

## 🔗 External Integrations
- **Google Gemini 2.5 Flash**: Core AI engine for generating the 4-week Roadmap, Journey Story, Daily Coach advice, and Vision-based meal calorie estimation.
- **Cloudinary**: Cloud storage provider for securing user progress photos.
- **Neon.tech / PostgreSQL**: Primary relational database for all user and activity data.
- **NewsAPI Proxy**: Used to fetch real-time health and fitness articles.

## 🔌 Core API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Authenticate user & get JWT

### Activity Logging (Meals & Workouts)
- `GET /api/meals` - Get all logged meals
- `POST /api/meals` - Log a new meal
- `POST /api/meals/analyze` - AI estimation from meal description/photo
- `DELETE /api/meals/last` - Undo the most recent meal
- `GET /api/workouts` - Get all logged workouts
- `POST /api/workouts` - Log a new workout
- `DELETE /api/workouts/last` - Undo the most recent workout

### Progress Tracking
- `GET /api/progress` - Fetch weight and photo entries
- `POST /api/progress` - Add a new weight/photo entry (FormData)
- `DELETE /api/progress/last` - Undo the last progress entry
- `DELETE /api/progress/:id` - Delete a specific progress entry
- `PATCH /api/progress/:id/photo` - Remove only the photo from an entry

### AI Features
- `GET /api/advice` - Fetch dynamic personalized fitness advice (updates 3x daily)
- `POST /api/roadmap` - Generate or retrieve the 4-week fitness roadmap
- `POST /api/story/generate` - Generate the AI journey story based on progress

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
