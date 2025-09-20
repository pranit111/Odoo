# Django REST User Authentication with OTP

This Django REST API provides user authentication using username/password with OTP verification via email.

## Features

- User registration with username, email, and password
- OTP-based account verification via email (using Google Gmail)
- Username/password login after OTP verification
- JWT token-based authentication
- User profile management

## API Endpoints

### 1. User Registration
**POST** `/api/auth/register/`

Register a new user account.

**Request Body:**
```json
{
    "username": "john_doe",
    "email": "john@example.com",
    "password": "SecurePass123!",
    "password_confirm": "SecurePass123!"
}
```

**Response:**
```json
{
    "message": "User registered successfully. Please verify your account with OTP.",
    "user_id": 1,
    "username": "john_doe"
}
```

### 2. Send OTP
**POST** `/api/auth/send-otp/`

Send OTP to user's registered email address.

**Request Body:**
```json
{
    "username": "john_doe"
}
```

**Response:**
```json
{
    "message": "OTP sent successfully to your registered email.",
    "username": "john_doe"
}
```

### 3. Verify OTP
**POST** `/api/auth/verify-otp/`

Verify OTP and activate user account.

**Request Body:**
```json
{
    "username": "john_doe",
    "otp": "123456"
}
```

**Response:**
```json
{
    "message": "OTP verified successfully. Account activated.",
    "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
    "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
    "user": {
        "id": 1,
        "username": "john_doe",
        "email": "john@example.com",
        "first_name": "John",
        "last_name": "Doe",
        "is_verified": true,
        "date_joined": "2025-09-20T10:30:00Z"
    }
}
```

### 4. Login
**POST** `/api/auth/login/`

Login with username and password (only for verified users).

**Request Body:**
```json
{
    "username": "john_doe",
    "password": "SecurePass123!"
}
```

**Response:**
```json
{
    "message": "Login successful.",
    "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
    "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
    "user": {
        "id": 1,
        "username": "john_doe",
        "email": "john@example.com",
        "first_name": "John",
        "last_name": "Doe",
        "is_verified": true,
        "date_joined": "2025-09-20T10:30:00Z"
    }
}
```

### 5. Get User Profile
**GET** `/api/auth/profile/`

Get current user's profile (requires authentication).

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "is_verified": true,
    "date_joined": "2025-09-20T10:30:00Z"
}
```

### 6. Update Profile
**PUT** `/api/auth/profile/update/`

Update user profile (requires authentication).

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
    "email": "newemail@example.com"
}
```

### 7. Logout
**POST** `/api/auth/logout/`

Logout user and blacklist refresh token.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
    "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

### 8. Refresh Token
**POST** `/api/auth/token/refresh/`

Refresh access token using refresh token.

**Request Body:**
```json
{
    "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

## Setup Instructions

### 1. Environment Configuration

Update the `.env` file with your Google Gmail credentials:

```env
EMAIL_HOST_USER=your-gmail@gmail.com
EMAIL_HOST_PASSWORD=your-16-character-app-password
DEFAULT_FROM_EMAIL=your-gmail@gmail.com
```

### 2. Google App Password Setup

1. Go to your Google Account settings
2. Navigate to Security > 2-Step Verification
3. Scroll down to "App Passwords"
4. Generate a password for "Mail" application
5. Use the 16-character password (no spaces) in `EMAIL_HOST_PASSWORD`

### 3. Database Migration

Run the following commands to set up the database:

```bash
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser
```

### 4. Run the Server

```bash
python manage.py runserver
```

## Authentication Flow

1. **Register** → User creates account with username, email, and password
2. **Send OTP** → System sends 6-digit OTP to user's email
3. **Verify OTP** → User verifies OTP to activate account and receive JWT tokens
4. **Login** → User can login with username/password (only if verified)
5. **Access Protected Endpoints** → Use JWT access token in Authorization header

## Security Features

- Password validation using Django's built-in validators
- OTP expires after 10 minutes
- JWT tokens with configurable expiration
- Refresh token rotation
- Account must be OTP-verified before login
- Email uniqueness validation
- Username uniqueness validation

## Error Handling

The API returns appropriate HTTP status codes and error messages:

- `400 Bad Request` - Invalid data or validation errors
- `401 Unauthorized` - Invalid credentials or missing authentication
- `404 Not Found` - User not found
- `500 Internal Server Error` - Email sending failure or server errors