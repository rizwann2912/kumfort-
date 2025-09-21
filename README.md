# 🚐 Kumfort - School Van Tracker

A comprehensive school van tracking system built with React Native (Expo) and Django REST Framework. This production-ready mobile application provides real-time GPS tracking for school vans, ensuring the safety and peace of mind of parents.

## 🌟 Features

### 📱 Mobile App (React Native + Expo)
- **OTP-based Authentication**: Secure phone number verification
- **Phone-first Login Flow**: Streamlined user experience
- **Role-based Dashboards**: Different interfaces for parents and drivers
- **Real-time GPS Tracking**: Live location updates for drivers
- **Van Tracking**: Parents can track their children's van in real-time
- **Modern UI/UX**: Professional design suitable for users aged 30-50
- **Onboarding Flow**: Complete user setup process
- **Push Notifications**: Alerts and updates
- **Offline Support**: Works without constant internet connection

### 🔧 Backend (Django REST Framework)
- **RESTful API**: Clean, well-documented endpoints
- **Custom User Model**: Phone number-based authentication
- **OTP Verification System**: Secure one-time password generation
- **Location Tracking**: GPS coordinate storage and management
- **Van Assignment System**: Links drivers, vans, and children
- **Real-time Updates**: WebSocket support for live tracking
- **Admin Interface**: Complete management system

## 🏗️ Architecture

```
kumfort-/
├── KumfortMobile/          # React Native mobile app
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── screens/        # App screens
│   │   ├── navigation/     # Navigation logic
│   │   ├── services/       # API and location services
│   │   └── config/         # Configuration files
│   └── assets/             # Images and static files
└── school_van_tracker/     # Django backend
    ├── accounts/           # User authentication
    ├── locations/          # GPS tracking
    ├── vans/              # Van management
    ├── students/          # Student records
    ├── notifications/     # Push notifications
    └── payments/          # Payment processing
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Python 3.8+
- Git

### Backend Setup
```bash
cd school_van_tracker
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### Mobile App Setup
```bash
cd KumfortMobile
npm install
npm start
```

## 📱 User Flows

### For Parents
1. **Welcome Screen** → Enter phone number
2. **OTP Verification** → Verify with SMS
3. **Profile Setup** → Add parent and child details
4. **School Linking** → Connect with school and van
5. **Dashboard** → Track van location in real-time

### For Drivers
1. **Welcome Screen** → Enter phone number
2. **OTP Verification** → Verify with SMS
3. **Registration** → Basic driver details
4. **Dashboard** → Start GPS tracking, manage students

## 🔐 Security Features

- **Phone Number Authentication**: No passwords required
- **OTP Verification**: Time-limited verification codes
- **Token-based API**: Secure API access
- **Role-based Access**: Parents and drivers have different permissions
- **Data Encryption**: Sensitive data is encrypted
- **CORS Protection**: Secure cross-origin requests

## 📊 API Endpoints

### Authentication
- `POST /api/auth/send-otp/` - Send OTP to phone number
- `POST /api/auth/verify-otp/` - Verify OTP and login
- `POST /api/auth/logout/` - Logout user
- `GET /api/auth/profile/` - Get user profile

### Location Tracking
- `POST /api/locations/update-location/` - Update driver location
- `GET /api/locations/van-location/` - Get van location (parents)
- `GET /api/locations/driver-location/` - Get driver location
- `POST /api/locations/toggle-gps/` - Enable/disable GPS tracking

## 🛠️ Technology Stack

### Frontend
- **React Native** - Cross-platform mobile development
- **Expo** - Development platform and tools
- **TypeScript** - Type-safe JavaScript
- **React Navigation** - Navigation library
- **AsyncStorage** - Local data persistence
- **Expo Location** - GPS location services

### Backend
- **Django** - Web framework
- **Django REST Framework** - API framework
- **PostgreSQL** - Database (production)
- **SQLite** - Database (development)
- **Twilio** - SMS OTP delivery
- **CORS** - Cross-origin resource sharing

## 📈 Production Features

- **Scalable Architecture**: Handles multiple schools and users
- **Real-time Updates**: Live location tracking
- **Error Handling**: Comprehensive error management
- **Logging**: Detailed application logs
- **Testing**: Unit and integration tests
- **Documentation**: Complete API documentation

## 🔧 Development

### Running Tests
```bash
# Backend tests
cd school_van_tracker
python manage.py test

# Mobile app tests
cd KumfortMobile
npm test
```

### Code Quality
- **ESLint** - JavaScript/TypeScript linting
- **Prettier** - Code formatting
- **TypeScript** - Type checking
- **Django Best Practices** - Python code standards

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📞 Support

For support and questions, please contact the development team or create an issue in the repository.

---

**Built with ❤️ for school safety and parent peace of mind**
