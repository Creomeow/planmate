# PlanMate - Event Discovery & Planning App

PlanMate is a comprehensive event discovery and planning application built with Expo and React Native. It helps users discover events in Singapore, bookmark their favorites, and integrate them with their calendar.

## Features

- **Event Discovery**: Browse events from multiple sources including Peatix and Eventbrite
- **Multiple View Modes**: List, Map, and Calendar views for different ways to explore events
- **Smart Filtering**: Filter events by category, budget, date range, and search terms
- **Bookmarking**: Save events for later reference
- **Calendar Integration**: Add events directly to your device calendar
- **AI Assistant**: Get personalized event recommendations and planning help powered by Google Gemini
- **Dark/Light Theme**: Full theme support for better user experience

## Prerequisites

Before running the app, you'll need:

1. **Node.js** (v16 or higher)
2. **Expo CLI** (`npm install -g @expo/cli`)
3. **Google Gemini API Key** (free - see setup below)

## Setup

### 1. Get Your Free Google Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy your API key (starts with `AIza...`)
5. **Free tier**: 15 requests/minute, no credit card required

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Your API Key

1. Open the app and tap the AI chat button
2. Tap the gear icon (⚙️) in the top right
3. Select "Gemini" as the AI provider
4. Enter your Gemini API key
5. Tap "Save Configuration"

## Running the App

### Start the Backend Server

First, start the backend server that provides mock events:

```bash
cd backend
node server.js
```

The server will run on `http://localhost:3000`

### Start the Frontend App

In a new terminal, start the Expo development server:

```bash
npx expo start
```

### Open the App

You'll see options to open the app in:

- [Development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go) (limited sandbox)

## AI Assistant Setup

The app includes an intelligent AI assistant powered by Google Gemini that can:

- **Recommend events** based on your interests
- **Help with planning** logistics and timing
- **Suggest activities** for specific dates
- **Find free/paid events** within your budget
- **Manage saved events** and provide insights

### AI Features

- **Real AI Responses**: Uses actual Google Gemini AI
- **Event Context**: AI knows about all available events
- **Conversation Memory**: Remembers your chat history
- **Smart Fallback**: Works even without internet
- **Free Usage**: 15 requests/minute included

## Event Sources

The app uses advanced web scraping to fetch real live events from multiple Singapore sources:
- **SISTIC**: Official Singapore ticketing platform
- **TheSmartLocal**: Local events and activities
- **TimeOut Singapore**: International events guide
- **Eventbrite Singapore**: Global event platform
- **Peatix Singapore**: Japanese event platform
- **RSS Feeds**: Additional event feeds from various sources

The app uses multiple proxy services to bypass CORS restrictions and ensure reliable data fetching. No mock data is used - only real live events are displayed.

## Troubleshooting

### AI Assistant Not Working?

1. **Check API Key**: Make sure your Gemini API key is correctly entered
2. **Verify Internet**: Ensure you have a stable internet connection
3. **Check Limits**: Free tier allows 15 requests/minute
4. **Restart App**: Close and reopen the app if issues persist

### Backend Server Issues?

1. **Port 3000**: Make sure port 3000 is not in use
2. **Node.js**: Ensure you have Node.js installed
3. **Dependencies**: Run `npm install` in the backend folder

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
