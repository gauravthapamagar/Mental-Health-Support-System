# Mental Health Support System

A comprehensive full-stack web application designed to provide mental health support services, connecting patients with therapists and fostering a supportive community. The platform offers appointment booking, video consultations, mental health assessments, therapy blogs, journaling, and community features.

## Features

[Screenshot: Patient Dashboard - Add screenshot here]

### For Patients
- **User Authentication & Profiles** - Secure sign-up and personalized patient profiles
- **Therapist Matching** - Intelligent algorithm to match patients with suitable therapists
- **Appointment Booking** - Schedule therapy sessions with real-time availability
- **Video Consultations** - Real-time video sessions using Agora RTC
- **Mental Health Assessments** - Comprehensive surveys and psychological assessments
- **Therapy Blogs** - Educational content and therapeutic articles
- **Digital Journal** - Private journaling for emotional expression
- **Community Support** - Connect with others, share experiences, and support each other
- **Session Reports** - Post-session documentation and progress tracking
- **Payment Processing** - Khalti payment integration for booking sessions

[Screenshot: Therapist Matching Feature - Add screenshot here]

### For Therapists
- **Professional Profiles** - Showcase credentials, specializations, and experience
- **Availability Management** - Set working hours and manage schedules
- **Client Management** - View and manage patient appointments
- **Session Reports** - Document therapy sessions and progress notes
- **Verification** - Identity and credential verification system
- **Analytics** - Track client interactions and session history

[Screenshot: Therapist Profile - Add screenshot here]

### Admin Features
- **User Management** - Manage patients, therapists, and admin accounts
- **Content Management** - Moderate blogs and community posts
- **Assessment Management** - Create and manage psychological assessments
- **System Analytics** - Monitor platform usage and health metrics
- **Payment Tracking** - View and manage payment transactions

[Screenshot: Admin Dashboard - Add screenshot here]

##  Project Architecture
[Architecture Diagram - Add system architecture diagram here]
### Backend Stack
- **Framework**: Django 4.x with Django REST Framework
- **Database**: PostgreSQL (via Django ORM)
- **Real-time Communication**: Django Channels with Redis
- **API**: RESTful API with JWT authentication
- **Payment**: Khalti integration for payment processing
- **Video**: Agora RTC SDK for video consultations
- **AI/ML**: Google Generative AI (Gemini), Ollama for intelligent features

### Frontend Stack
- **Framework**: Next.js 16.x with React 19
- **Styling**: Tailwind CSS with PostCSS
- **UI Components**: Radix UI, Lucide Icons
- **Real-time Video**: Agora RTC React SDK
- **HTTP Client**: Axios
- **Charts & Visualization**: Chart.js, Recharts
- **Notifications**: React Hot Toast, React Toastify
- **Authentication**: JWT-based with Axios interceptors

## Project Structure

```
Mental-Health-Support-System/
├── backend/
│   ├── accounts/              # User authentication & profiles
│   ├── booking/               # Appointment booking & payments
│   ├── blogs/                 # Therapy blog content
│   ├── chatbot/               # AI chatbot for support
│   ├── community/             # Community features & discussions
│   ├── journal/               # Digital journaling
│   ├── matching/              # Therapist matching algorithm
│   ├── surveys/               # Assessment & survey management
│   ├── backend/               # Django settings & configuration
│   ├── media/                 # Media storage (documents, images)
│   ├── manage.py              # Django management script
│   └── requirements.txt       # Python dependencies
│
└── frontend/
    ├── app/                   # Next.js app directory
    ├── components/            # Reusable React components
    ├── context/               # React context for state management
    ├── hooks/                 # Custom React hooks
    ├── lib/                   # Utility functions & helpers
    ├── public/                # Static assets
    ├── package.json           # Node dependencies
    └── tsconfig.json          # TypeScript configuration
```

## Getting Started

[Demo Video - Add demo or walkthrough video here]

### Prerequisites
- Python 3.8+
- Node.js 16+
- PostgreSQL 12+
- Redis (for Django Channels)

### Backend Setup

1. **Clone the repository**
```bash
git clone <repository-url>
cd Mental-Health-Support-System/backend
```

2. **Create a virtual environment**
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. **Install dependencies**
```bash
pip install -r requirements.txt
```

4. **Create .env file**
```bash
# Create .env file in backend/ directory with:
GEMINI_API_KEY=your_gemini_api_key
SECRET_KEY=your_django_secret_key
DEBUG=True
DATABASE_URL=postgresql://user:password@localhost/mental_health_db
REDIS_URL=redis://localhost:6379/0
KHALTI_SECRET_KEY=your_khalti_secret
AGORA_APP_ID=your_agora_app_id
AGORA_APP_CERTIFICATE=your_agora_certificate
```

5. **Run migrations**
```bash
python manage.py migrate
```

6. **Create superuser**
```bash
python manage.py createsuperuser
```

7. **Start the development server**
```bash
python manage.py runserver
```

The backend API will be available at `http://localhost:8000`

### Frontend Setup

1. **Navigate to frontend directory**
```bash
cd ../frontend
```

2. **Install dependencies**
```bash
npm install
```

3. **Create .env.local file**
```bash
# Create .env.local with:
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_AGORA_APP_ID=your_agora_app_id
```

4. **Start development server**
```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`

##  Key Modules

### Accounts Module
- User authentication (patients, therapists, admins)
- Profile management
- Identity verification for therapists
- User role-based access control

### Booking Module
- Appointment scheduling and management
- Therapist availability scheduling
- Payment processing via Khalti
- Video session management
- Session reporting and documentation

### Matching Module
- Intelligent therapist matching algorithm
- Quality scoring system
- Patient-therapist compatibility assessment

### Community Module
- Discussion posts and comments
- Category-based community forums
- Social features for peer support

### Surveys Module
- Mental health assessments
- Psychological evaluation forms
- Integration with Llama service for analysis

### Blogs Module
- Therapeutic content management
- Blog recommendations
- Editorial content system

### Journal Module
- Personal journaling feature
- Private user entries
- Reflection and tracking

##  Authentication & Authorization

The application uses JWT (JSON Web Tokens) for API authentication:

- **Access Token**: Short-lived token for API requests
- **Refresh Token**: Long-lived token for obtaining new access tokens
- **Role-based Access Control**: Different permissions for patients, therapists, and admins

## API Documentation

API endpoints are organized by module:
- `/api/auth/` - Authentication endpoints
- `/api/accounts/` - User and profile management
- `/api/bookings/` - Appointment management
- `/api/therapists/` - Therapist information
- `/api/blogs/` - Blog content
- `/api/community/` - Community features
- `/api/surveys/` - Assessment surveys
- `/api/journal/` - Journal entries
- `/api/matching/` - Therapist matching

[API Documentation Diagram - Add API endpoints overview here]

## Core Technologies

### Backend
- Django & DRF
- PostgreSQL
- Redis
- Django Channels (WebSockets)
- Agora RTC SDK
- Google Generative AI
- Khalti Payment Gateway

### Frontend
- Next.js with React
- TypeScript
- Tailwind CSS
- Radix UI
- Agora RTC React
- Axios

## Environment Variables

[Configuration Guide - Add environment setup screenshot here]

### Backend
```
GEMINI_API_KEY - Google Generative AI API key
SECRET_KEY - Django secret key
DEBUG - Debug mode (True/False)
DATABASE_URL - PostgreSQL connection string
REDIS_URL - Redis connection string
KHALTI_SECRET_KEY - Khalti payment gateway secret
AGORA_APP_ID - Agora RTC application ID
AGORA_APP_CERTIFICATE - Agora RTC certificate
```

### Frontend
```
NEXT_PUBLIC_API_URL - Backend API URL
NEXT_PUBLIC_AGORA_APP_ID - Agora RTC application ID
```

##  Testing

[Test Results - Add test coverage report here]

### Run backend tests
```bash
cd backend
python manage.py test
```

### Run frontend tests
```bash
cd frontend
npm test
```

##  Deployment

[Deployment Architecture - Add deployment setup diagram here]

### Backend Deployment
- Use Daphne as ASGI server for production
- Configure Django settings for production (DEBUG=False, ALLOWED_HOSTS)
- Use environment variables for sensitive data
- Set up PostgreSQL and Redis on production servers

### Frontend Deployment
- Build: `npm run build`
- Deploy to Vercel, Netlify, or similar platforms
- Configure API endpoints for production

##  Additional Resources

- [Django Documentation](https://docs.djangoproject.com/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Django REST Framework](https://www.django-rest-framework.org/)
- [Agora RTC Documentation](https://docs.agora.io/)
- [Khalti API Documentation](https://khalti.com/developers/)

##  Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

##  License

This project is licensed under the MIT License - see the LICENSE file for details.

##  Support

For support, issues, or questions, please open an issue in the repository or contact the development team.

##  About

The Mental Health Support System is built with the goal of making mental health services more accessible and affordable to everyone. By connecting patients with qualified therapists and fostering a supportive community, we aim to contribute to better mental health outcomes for our users.

---

**Last Updated**: May 2026
