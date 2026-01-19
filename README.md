# Firebase Studio

# 🚀 SkillPilotAI – AI-Powered Career Coach

SkillPilotAI is an intelligent, LLM-powered career guidance platform that helps students and professionals plan their careers, analyze resumes, identify skill gaps, and receive personalized learning and job recommendations.

The platform uses AI-driven resume analysis and smart recommendation algorithms to provide a seamless and automated career coaching experience.

---

## 🌟 Features

### 🔐 User Onboarding
- Upload resume during onboarding  
- Automatic resume parsing using AI  
- Extraction of skills, experience, education, and projects  
- Personalized profile creation stored in Firestore  
- Eliminates need for manual data entry  

### 🤖 AI Career Coach Chatbot
- Context-aware chatbot powered by LLM  
- Provides career guidance based on user profile  
- Suggests learning paths and job roles  
- Answers domain-specific career queries  

### 💼 Smart Job Matching
- Matches user skills with real-time job postings  
- Calculates compatibility scores  
- Highlights missing skills  
- Direct job application links  

### 📚 Personalized Course Recommendations
- Suggests courses based on skill gaps  
- Adaptive learning pathways  
- Curated resources for upskilling  

### 🧩 Skill Gap Analysis
- Compares resume skills with target roles  
- Generates personalized improvement plans  
- Identifies priority learning areas  

### 🎮 Gamified Experience
- Progress tracking  
- Skill improvement visualization  
- Engaging UI with neon-themed interface  

---

## 🛠 Tech Stack

| Layer | Technology |
|------|-----------|
| Frontend | Next.js, React, Tailwind CSS |
| Backend | Next.js API Routes |
| Database | Firebase Firestore |
| Authentication | Firebase Auth |
| Storage | Firebase Storage |
| AI | Google Gemini / OpenAI GPT |
| Resume Parsing | AI + Mammoth.js |
| Job Data | External Job APIs |

---

## 🧠 How It Works

1. User signs up and completes onboarding  
2. Resume is uploaded and parsed using AI  
3. Profile is automatically generated  
4. All modules fetch data from stored profile  
5. AI chatbot and recommendation engines use this context  
6. User receives personalized career guidance  

---

## ⚙️ Setup Instructions

### Prerequisites

- Node.js (v18+ recommended)
- Firebase Project
- Google Gemini or OpenAI API Key

---

### Clone Repository

```bash
git clone https://github.com/yourusername/skillpilotai.git
cd skillpilotai
