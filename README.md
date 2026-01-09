# 🔎 FindIt AI
### 🚀 [Click here to use the Live App](https://ayushitelrandhe.github.io/FindIt/)

---

![Project Screenshot](Screenshot 2026-01-08 200853.jpg)

### About the Project
FindIt AI is a smart Lost & Found platform for campuses powered by AI matching.

# FindIt AI - Smart Lost & Found for Campuses
A hackathon-ready MVP demonstrating AI-based matching and intelligent agent logic for campus lost and found items.

## 🚀 Features

### Core Functionality
- **Home Page**: Simple navigation with two main actions
- **Lost Item Reporting**: Complete form with image upload support
- **Found Item Reporting**: Matching form with location dropdown
- **AI Matching**: Simulated Gemini-inspired text similarity algorithm
- **Smart Agents**: Three specialized AI agents for different tasks

### AI Agents

#### 🎯 Matching Agent
- Calculates match confidence using multiple factors:
  - Category matching (40% weight)
  - Color matching (25% weight) 
  - Name similarity (20% weight)
  - Description similarity (15% weight)
- Minimum 50% confidence threshold for matches

#### 🔔 Notification Agent
- Real-time in-app notifications for new matches
- Shows match confidence and pickup location
- Animated notification cards

#### 🔐 Verification Agent
- Generates security questions for item handover
- Prevents fraudulent claims
- One-question verification system

### Matching Algorithm
The AI matching uses a weighted scoring system inspired by Google Gemini's text understanding:

```javascript
confidence = (category_match * 0.4) + 
            (color_match * 0.25) + 
            (text_similarity * 0.35)
```

Text similarity uses word overlap analysis between item names and descriptions.

## 🛠 Tech Stack

- **Frontend**: HTML5, Tailwind CSS, Vanilla JavaScript
- **Storage**: LocalStorage (JSON-based)
- **AI Logic**: Simulated text similarity and pattern matching
- **UI/UX**: Responsive design with animations

## 📁 Project Structure

```
FindIt/
├── index.html          # Single-page application
├── app.js             # All JavaScript logic
├── README.md          # This file
└── package.json       # Project metadata
```

## 🚀 Quick Start

1. Open `index.html` in a web browser
2. No installation required - runs entirely in browser
3. Data persists in browser's LocalStorage

## 🎯 Demo Flow

1. **Report a Lost Item**: Fill out the red form
2. **Report a Found Item**: Fill out the green form  
3. **View Matches**: Check the purple matches page
4. **Verify Matches**: Click verify to see AI agent questions
5. **Confirm Handover**: Complete the process

## 🏆 Hackathon Pitch Points

### AI Innovation
- **Multi-agent architecture**: Specialized agents for matching, notifications, and verification
- **Intelligent matching**: Weighted algorithm mimics Gemini's text understanding
- **Real-time processing**: Instant matching when new items are reported

### User Experience
- **Minimal clicks**: 3-click workflow from report to match
- **Visual confidence**: Color-coded match scores
- **Clear agent actions**: Each AI agent's role is clearly explained

### Technical Excellence
- **Zero dependencies**: Runs entirely in browser
- **Fast performance**: Instant matching and notifications
- **Clean architecture**: Separated agent logic and UI components

## 🔮 Future Enhancements

- Real image similarity using computer vision
- Push notifications for matches
- User authentication and profiles
- Campus map integration
- Machine learning for improved matching

## 📊 Metrics for Judges

- **Match Accuracy**: Simulated 85%+ confidence for good matches
- **Response Time**: <100ms matching algorithm
- **User Engagement**: 3-step completion funnel
- **AI Integration**: 3 specialized agents with clear roles

---

**Built in under 2 hours for hackathon demonstration** 🚀
