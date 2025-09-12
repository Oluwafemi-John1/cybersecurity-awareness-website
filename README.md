# Cyberaware - Cybersecurity Education Platform

A comprehensive cybersecurity education platform built with Next.js, Supabase, and modern web technologies. Cyberaware helps users learn cybersecurity through interactive modules, quizzes, simulations, and progress tracking.

## 🚀 Features

### Core Functionality
- **User Authentication**: Secure sign-up, login, and email verification
- **Interactive Learning Modules**: Structured cybersecurity courses with progress tracking
- **Quiz System**: Timed quizzes with instant feedback and scoring
- **Simulations**: Hands-on cybersecurity scenarios and incident response training
- **Progress Dashboard**: Personal learning analytics and achievement tracking
- **Admin Panel**: Content management and user administration

### Technical Features
- **Modern UI/UX**: Clean, responsive design with dark mode support
- **Real-time Data**: Live progress updates and user statistics
- **Secure Authentication**: Supabase Auth with email confirmation
- **Database Integration**: PostgreSQL with Row Level Security (RLS)
- **Performance Optimized**: Server-side rendering and optimized loading

## 🛠 Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui
- **TypeScript**: Full type safety
- **Deployment**: Vercel

## 📋 Prerequisites

- Node.js 18+ 
- Supabase account and project
- Vercel account (for deployment)

## 🚀 Quick Start

### 1. Clone and Install
\`\`\`bash
git clone <repository-url>
cd cyberaware-platform
npm install
\`\`\`

### 2. Environment Setup
Create a `.env.local` file with your Supabase credentials:
\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
\`\`\`

### 3. Database Setup
Run the SQL scripts in order to set up your database:
1. `scripts/001_create_profiles.sql` - User profiles table
2. `scripts/002_create_modules.sql` - Learning modules table
3. `scripts/003_create_quizzes.sql` - Quiz system tables
4. `scripts/004_create_simulations.sql` - Simulation tables
5. `scripts/005_create_user_progress.sql` - Progress tracking tables
6. `scripts/006_create_profile_trigger.sql` - Auto-profile creation
7. `scripts/007_seed_sample_data.sql` - Sample content

### 4. Run Development Server
\`\`\`bash
npm run dev
\`\`\`

Visit `http://localhost:3000` to see the application.

## 📁 Project Structure

\`\`\`
cyberaware-platform/
├── app/                          # Next.js App Router
│   ├── auth/                     # Authentication pages
│   │   ├── login/               # Login page
│   │   ├── sign-up/             # Registration page
│   │   ├── callback/            # Auth callback handler
│   │   └── error/               # Auth error page
│   ├── dashboard/               # User dashboard
│   ├── modules/                 # Learning modules
│   ├── quizzes/                 # Quiz system
│   ├── simulations/             # Simulation system
│   ├── admin/                   # Admin panel
│   └── layout.tsx               # Root layout
├── components/                   # Reusable components
│   ├── ui/                      # shadcn/ui components
│   ├── navigation.tsx           # Main navigation
│   ├── dashboard-nav.tsx        # Dashboard navigation
│   ├── quiz-interface.tsx       # Quiz taking interface
│   ├── module-viewer.tsx        # Module content viewer
│   └── simulation-interface.tsx # Simulation interface
├── lib/                         # Utility libraries
│   ├── supabase/               # Supabase client configuration
│   └── utils.ts                # Utility functions
├── scripts/                     # Database scripts
└── middleware.ts               # Auth middleware
\`\`\`

## 🗄 Database Schema

### Core Tables

#### `profiles`
User profile information linked to Supabase Auth users.
- `id` (UUID, Primary Key)
- `full_name` (Text)
- `role` (Text: 'user' | 'admin')
- `created_at` (Timestamp)

#### `modules`
Learning modules and course content.
- `id` (UUID, Primary Key)
- `title` (Text)
- `description` (Text)
- `content` (JSONB)
- `difficulty_level` (Text)
- `estimated_duration` (Integer, minutes)
- `is_published` (Boolean)

#### `quizzes`
Quiz definitions and questions.
- `id` (UUID, Primary Key)
- `title` (Text)
- `description` (Text)
- `questions` (JSONB)
- `time_limit` (Integer, minutes)
- `passing_score` (Integer, percentage)
- `difficulty_level` (Text)

#### `simulations`
Interactive cybersecurity simulations.
- `id` (UUID, Primary Key)
- `title` (Text)
- `description` (Text)
- `scenario` (JSONB)
- `difficulty_level` (Text)
- `estimated_duration` (Integer, minutes)

### Progress Tracking Tables

#### `user_module_progress`
Tracks user progress through learning modules.
- `user_id` (UUID, Foreign Key)
- `module_id` (UUID, Foreign Key)
- `progress_percentage` (Integer)
- `completed` (Boolean)
- `last_accessed` (Timestamp)

#### `user_quiz_attempts`
Records of user quiz attempts and scores.
- `user_id` (UUID, Foreign Key)
- `quiz_id` (UUID, Foreign Key)
- `score` (Integer)
- `answers` (JSONB)
- `passed` (Boolean)
- `completed_at` (Timestamp)

#### `user_simulation_attempts`
Records of user simulation attempts.
- `user_id` (UUID, Foreign Key)
- `simulation_id` (UUID, Foreign Key)
- `score` (Integer)
- `decisions` (JSONB)
- `completed` (Boolean)
- `completed_at` (Timestamp)

## 🔐 Authentication Flow

### Sign Up Process
1. User fills registration form
2. Supabase sends confirmation email
3. User clicks email link → `/auth/callback`
4. Callback exchanges code for session
5. User redirected to dashboard
6. Profile automatically created via trigger

### Sign In Process
1. User enters credentials
2. Supabase validates and creates session
3. Middleware protects routes
4. User redirected to dashboard

### Route Protection
- Middleware checks authentication on all routes
- Unauthenticated users redirected to `/auth/login`
- Admin routes check user role

## 🎯 Key Features Guide

### Learning Modules
- **Structure**: Modules contain sections with rich content
- **Progress**: Automatic progress tracking as users read
- **Navigation**: Table of contents with section jumping
- **Completion**: Modules marked complete when fully read

### Quiz System
- **Timed Quizzes**: Configurable time limits with countdown
- **Multiple Choice**: Radio button selection interface
- **Instant Feedback**: Detailed results with correct answers
- **Retakes**: Users can retake quizzes to improve scores
- **Progress Tracking**: Best scores and attempt history

### Simulations
- **Interactive Scenarios**: Step-by-step decision making
- **Real-world Context**: Phishing, incident response, etc.
- **Scoring System**: Points based on correct decisions
- **Feedback**: Detailed explanations for each choice

### Admin Panel
- **User Management**: View and manage user accounts
- **Content Management**: Create and edit modules, quizzes
- **Analytics**: Platform usage and learning statistics
- **Role Management**: Assign admin privileges

## 🎨 Design System

### Color Palette
- **Primary**: Blue (#2563eb) - Trust and security
- **Secondary**: Cyan (#06b6d4) - Technology and innovation
- **Success**: Green (#10b981) - Achievement and progress
- **Warning**: Orange (#f59e0b) - Alerts and attention
- **Error**: Red (#ef4444) - Errors and failures

### Typography
- **Headings**: GeistSans (Bold, various sizes)
- **Body**: GeistSans (Regular, 16px base)
- **Code**: GeistMono (Monospace for technical content)

### Components
- **Cards**: Elevated surfaces for content grouping
- **Buttons**: Primary, secondary, and outline variants
- **Forms**: Consistent input styling with validation
- **Navigation**: Clean, accessible menu systems

## 🚀 Deployment

### Vercel Deployment
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Environment Variables
\`\`\`env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Optional: Custom redirect URL for development
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000/auth/callback
\`\`\`

## 🔧 Development

### Running Locally
\`\`\`bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
\`\`\`

### Database Management
- Use Supabase dashboard for schema changes
- Run migration scripts in order
- Test with sample data before production

### Adding New Features
1. Create database tables if needed
2. Add TypeScript interfaces
3. Build UI components
4. Implement server actions
5. Add proper error handling
6. Update documentation

## 🐛 Troubleshooting

### Common Issues

#### Email Confirmation Not Working
- Check callback route is properly configured
- Verify environment variables are set
- Ensure Supabase email settings are configured

#### Database Connection Issues
- Verify Supabase credentials
- Check RLS policies are properly set
- Ensure user has proper permissions

#### Authentication Errors
- Clear browser cookies and localStorage
- Check middleware configuration
- Verify Supabase project settings

#### Performance Issues
- Enable database indexing for large tables
- Optimize queries with proper joins
- Use React.memo for expensive components

## 📚 Learning Resources

### Cybersecurity Topics Covered
- **Phishing Awareness**: Email security and social engineering
- **Password Security**: Best practices and password managers
- **Network Security**: Firewalls, VPNs, and secure connections
- **Incident Response**: Handling security breaches
- **Data Protection**: Privacy and data handling practices
- **Mobile Security**: Securing devices and applications

### Educational Approach
- **Progressive Learning**: Beginner to advanced content
- **Hands-on Practice**: Interactive simulations
- **Assessment**: Regular quizzes and knowledge checks
- **Real-world Application**: Practical scenarios and case studies

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Check the troubleshooting section
- Review the documentation
- Open an issue on GitHub
- Contact the development team

---

**Cyberaware** - Building cybersecurity awareness through interactive education.
