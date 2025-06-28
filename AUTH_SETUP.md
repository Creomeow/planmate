# Authentication Setup Guide for PlanMate

## Overview

PlanMate now uses a local authentication system with AsyncStorage for data persistence. This approach works seamlessly with React Native and doesn't require external database setup.

## Features

- **User Registration**: Create new accounts with email and password
- **User Login**: Authenticate with email and password
- **Data Persistence**: User data and bookmarked events are stored locally
- **Profile Management**: User profiles with preferences and bookmarked events
- **Demo Data**: Pre-created demo account for testing

## Demo Account

For testing purposes, a demo account is automatically created:
- **Email**: demo@example.com
- **Password**: password123
- **Name**: demo (auto-generated from email)

## How It Works

### Data Storage
- User accounts are stored in AsyncStorage under the key `users`
- User profiles (preferences, bookmarked events) are stored under `profiles`
- Current user session is stored under `userData`

### Authentication Flow
1. App starts and checks for existing user session
2. If no session exists, user is redirected to login screen
3. User can either login with existing account or register new account
4. After successful authentication, user is redirected to main app
5. User data persists across app restarts

### Bookmarked Events
- Events can be bookmarked by logged-in users
- Bookmarked events are stored in the user's profile
- Data persists locally and syncs with the auth service

## Testing

1. Start the app: `npm start`
2. Try logging in with the demo account
3. Register a new account to test registration
4. Bookmark some events to test data persistence
5. Logout and login again to verify session management

## Troubleshooting

### Login Issues
- Ensure you're using the correct email/password
- Try the demo account: demo@example.com / password123
- Check console for any error messages

### Data Persistence Issues
- Clear app data and restart if needed
- Check AsyncStorage permissions
- Verify the auth service is properly initialized

### Navigation Issues
- Ensure the auth context is properly wrapped around the app
- Check that all route names are correct
- Verify the auth layout is properly configured 