# PlanMate - Event Discovery & Planning App

PlanMate is a comprehensive event discovery and planning application built with Expo and React Native. It helps users discover events in Singapore, bookmark their favorites, and integrate them with their calendar.

## Features

- **Event Discovery**: Browse events from multiple sources including Peatix and Eventbrite
- **Multiple View Modes**: List, Map, and Calendar views for different ways to explore events
- **Smart Filtering**: Filter events by category, budget, date range, and search terms
- **Bookmarking**: Save events for later reference
- **Calendar Integration**: Add events directly to your device calendar
- **AI Assistant**: Get personalized event recommendations and planning help
- **Dark/Light Theme**: Full theme support for better user experience

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

## Event Sources

The app uses advanced web scraping to fetch real live events from multiple Singapore sources:
- **SISTIC**: Official Singapore ticketing platform
- **TheSmartLocal**: Local events and activities
- **TimeOut Singapore**: International events guide
- **Eventbrite Singapore**: Global event platform
- **Peatix Singapore**: Japanese event platform
- **RSS Feeds**: Additional event feeds from various sources

The app uses multiple proxy services to bypass CORS restrictions and ensure reliable data fetching. No mock data is used - only real live events are displayed.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
