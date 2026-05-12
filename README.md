# DreamFitAI 🚀

**DreamFitAI** is an AI-powered fitness and nutrition tracker designed to make health management effortless. By leveraging Claude 3.5 Sonnet's vision and reasoning capabilities, DreamFitAI allows users to log meals from photos, track workouts, and receive personalized fitness coaching.

## ✨ Key Features

- **📸 AI Meal Analysis**: Take a photo of your meal and let Claude estimate the calories and provide a nutritional breakdown.
- **🤖 AI Coach**: Get personalized advice based on your recent meal and workout history.
- **📊 Progress Visualizations**: Track your weight and body fat with beautiful, interactive charts.
- **🎯 Calorie Goal Tracking**: Set daily targets and monitor your progress in real-time.
- **🌓 Modern UI**: Sleek, glassmorphic design with full Dark Mode support.
- **🔐 Secure Auth**: Robust JWT-based authentication and authorization.

## 🛠 Tech Stack

### Frontend
- **React 19**
- **Mantine UI** (Glassmorphism & Responsive Design)
- **Recharts** (Progress Visualizations)
- **Context API** (State Management)

### Backend
- **Node.js & Express** (MVC Architecture)
- **PostgreSQL** (Relational Data)
- **Anthropic Claude 3.5 Sonnet** (AI Integration)
- **Cloudinary** (Media Storage)
- **JWT & Bcrypt** (Security)

## 🚦 Getting Started

### Prerequisites
- Node.js (v18+)
- PostgreSQL
- Anthropic API Key
- Cloudinary Account

### Installation

1. **Clone the repo**
   ```bash
   git clone https://github.com/your-repo/DreamFitAi.git
   ```

2. **Backend Setup**
   ```bash
   cd dreamFitAi-backend
   npm install
   # Create a .env file based on .env.example
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd fittrack-frontend
   npm install
   npm run dev
   ```

## 🎥 Presentation Points
- **Innovation**: Real-time image analysis for nutrition is a unique differentiator.
- **Complexity**: Full MVC structure, external storage integration, and AI-driven insights.
- **UX**: Premium look and feel with dark mode and smooth transitions.

---
Built with ❤️ for the Final Fullstack Course Project.
