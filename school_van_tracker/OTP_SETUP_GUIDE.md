# Mobile OTP Login System Setup Guide

This guide will help you set up the mobile number OTP-based login system for your School Van Tracker application.

## Features Implemented

✅ **Backend (Django)**
- Custom User model with phone number authentication
- OTP generation and verification system
- SMS integration with Twilio
- Rate limiting for OTP requests
- REST API endpoints for authentication
- User profile management

✅ **Frontend (React)**
- Beautiful OTP login interface
- Phone number validation
- OTP input with auto-formatting
- User dashboard with profile management
- Persistent authentication
- Responsive design

## Prerequisites

- Python 3.8+
- Node.js 16+
- Twilio account (for SMS)

## Backend Setup

### 1. Install Dependencies

```bash
cd school_van_tracker
pip install -r requirements.txt
```

### 2. Environment Configuration

Create a `.env` file in the `school_van_tracker` directory:

```bash
cp env.example .env
```

Edit `.env` with your configuration:

```env
# Django Settings
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1,0.0.0.0

# Twilio SMS Configuration
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=your-twilio-phone-number
```

### 3. Database Migration

```bash
python manage.py makemigrations
python manage.py migrate
```

### 4. Create Superuser (Optional)

```bash
python manage.py createsuperuser
```

### 5. Run Django Server

```bash
python manage.py runserver
```

The API will be available at `http://localhost:8000`

## Frontend Setup

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Start React Development Server

```bash
npm start
```

The frontend will be available at `http://localhost:3000`

## Twilio SMS Setup

### 1. Create Twilio Account

1. Go to [Twilio Console](https://console.twilio.com/)
2. Sign up for a free account
3. Verify your phone number

### 2. Get Credentials

1. In the Twilio Console, go to "Account" → "API keys & tokens"
2. Copy your Account SID and Auth Token
3. Go to "Phone Numbers" → "Manage" → "Active numbers"
4. Copy your Twilio phone number

### 3. Configure Environment

Add your Twilio credentials to the `.env` file:

```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your-auth-token-here
TWILIO_PHONE_NUMBER=+1234567890
```

## API Endpoints

### Authentication Endpoints

- `POST /api/auth/send-otp/` - Send OTP to phone number
- `POST /api/auth/verify-otp/` - Verify OTP and login
- `POST /api/auth/resend-otp/` - Resend OTP
- `POST /api/auth/logout/` - Logout user

### Profile Endpoints

- `GET /api/auth/profile/` - Get user profile
- `PUT /api/auth/update-profile/` - Update user profile

### Example API Usage

#### Send OTP
```bash
curl -X POST http://localhost:8000/api/auth/send-otp/ \
  -H "Content-Type: application/json" \
  -d '{"phone_number": "+1234567890", "user_type": "parent"}'
```

#### Verify OTP
```bash
curl -X POST http://localhost:8000/api/auth/verify-otp/ \
  -H "Content-Type: application/json" \
  -d '{"phone_number": "+1234567890", "otp_code": "123456"}'
```

## User Types

The system supports three user types:

1. **Parent** - Can track their child's van
2. **Driver** - Can update van location and status
3. **Admin** - Can manage the entire system

## Security Features

- **Rate Limiting**: 1 OTP per minute per phone number
- **OTP Expiry**: OTPs expire after 10 minutes
- **Attempt Limiting**: Maximum 3 attempts per OTP
- **Phone Validation**: International phone number format validation
- **Token Authentication**: Secure API access with tokens

## Development vs Production

### Development Mode
- OTP codes are returned in API responses for testing
- Debug mode enabled
- Uses SQLite database

### Production Mode
- OTP codes only sent via SMS
- Debug mode disabled
- Use PostgreSQL or MySQL
- Set up proper environment variables
- Configure HTTPS

## Troubleshooting

### Common Issues

1. **SMS not sending**
   - Check Twilio credentials
   - Verify phone number format
   - Check Twilio account balance

2. **CORS errors**
   - Ensure frontend URL is in CORS_ALLOWED_ORIGINS
   - Check if both servers are running

3. **Database errors**
   - Run migrations: `python manage.py migrate`
   - Check database configuration

4. **Phone number validation**
   - Use international format: +1234567890
   - Include country code

### Testing Without SMS

In development mode, OTP codes are logged to the console and returned in API responses. Check the Django console or browser developer tools.

## Next Steps

1. **Add more features**:
   - Van tracking functionality
   - Push notifications
   - Payment integration
   - Real-time updates

2. **Enhance security**:
   - Add CAPTCHA for OTP requests
   - Implement device fingerprinting
   - Add audit logging

3. **Improve UX**:
   - Add loading animations
   - Implement offline support
   - Add dark mode

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review the API documentation
3. Check Django and React console logs
4. Verify environment configuration
