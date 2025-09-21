# Kumfort Mobile App

A React Native mobile application for the School Van Tracker system with OTP-based authentication.

## Features

- 📱 **Mobile-First Design**: Native mobile experience with React Native
- 🔐 **OTP Authentication**: Secure phone number-based login
- 👤 **User Profiles**: Manage personal information
- 🚌 **Van Tracking**: Real-time van location tracking (Coming Soon)
- 🔔 **Push Notifications**: Get updates about van status (Coming Soon)
- 💳 **Payment Integration**: Manage van service payments (Coming Soon)

## Prerequisites

- Node.js 16+ 
- Expo CLI
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)

## Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm start
   ```

3. **Run on device/emulator:**
   ```bash
   # Android
   npm run android
   
   # iOS (macOS only)
   npm run ios
   
   # Web
   npm run web
   ```

## Backend Setup

Make sure your Django backend is running on `http://localhost:8000`:

```bash
cd ../school_van_tracker
python manage.py runserver
```

## API Configuration

The app is configured to connect to your Django backend. Update the API configuration in `src/config/api.ts` if needed:

- **Android Emulator**: Uses `http://10.0.2.2:8000`
- **iOS Simulator**: Uses `http://localhost:8000`
- **Physical Device**: Use your computer's IP address

## Project Structure

```
src/
├── components/          # Reusable components
├── screens/            # Screen components
│   ├── OTPLoginScreen.tsx
│   └── DashboardScreen.tsx
├── config/
│   └── api.ts          # API configuration
└── types/              # TypeScript type definitions
```

## Key Components

### OTPLoginScreen
- Phone number input with validation
- User type selection (Parent/Driver)
- OTP verification with resend functionality
- Beautiful mobile UI with animations

### DashboardScreen
- User profile display and editing
- Feature cards for upcoming functionality
- Logout functionality
- Modal-based profile editing

## Development

### Running on Android Emulator
1. Start Android Studio
2. Launch an Android emulator
3. Run `npm run android`

### Running on iOS Simulator (macOS only)
1. Install Xcode
2. Run `npm run ios`

### Running on Physical Device
1. Install Expo Go app on your device
2. Run `npm start`
3. Scan the QR code with Expo Go

## API Endpoints

The app connects to these Django REST API endpoints:

- `POST /api/auth/send-otp/` - Send OTP to phone number
- `POST /api/auth/verify-otp/` - Verify OTP and login
- `POST /api/auth/resend-otp/` - Resend OTP
- `GET /api/auth/profile/` - Get user profile
- `PUT /api/auth/update-profile/` - Update user profile
- `POST /api/auth/logout/` - Logout user

## Troubleshooting

### Common Issues

1. **Network Error**: Make sure the Django backend is running
2. **API Connection**: Check the API base URL in `src/config/api.ts`
3. **Android Emulator**: Use `10.0.2.2` instead of `localhost`
4. **Physical Device**: Use your computer's IP address

### Debug Mode

In development mode, OTP codes are displayed in alerts for easy testing.

## Building for Production

1. **Android APK:**
   ```bash
   expo build:android
   ```

2. **iOS App:**
   ```bash
   expo build:ios
   ```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is part of the Kumfort School Van Tracker system.