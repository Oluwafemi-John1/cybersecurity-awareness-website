# Cyberaware - Cybersecurity Education Platform

A comprehensive cybersecurity education platform built with Next.js, Supabase, and modern web technologies. Cyberaware helps users learn cybersecurity through interactive modules, quizzes, simulations, and progress tracking.

## 🚀 Features

### Core Functionality
- **User Authentication**: Secure sign-up, login, and email verification
- **Interactive Learning Modules**: Structured cybersecurity courses with progress tracking
- **Quiz System**: Timed quizzes with instant feedback and scoring
- **Simulations**: Hands-on cybersecurity scenarios and incident response training
- **Progress Dashboard**: Personal learning analytics and achievement tracking
- **Admin Panel**: Comprehensive content management and user administration

### Technical Features
- **Modern UI/UX**: Clean, responsive design with dark mode support
- **Real-time Data**: Live progress updates and user statistics
- **Secure Authentication**: Supabase Auth with email confirmation
- **Database Integration**: PostgreSQL with Row Level Security (RLS)
- **Performance Optimized**: Server-side rendering and optimized loading
- **Responsive Design**: Mobile-first approach with proper padding and spacing

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
8. `scripts/008_create_admin_schema.sql` - Admin-specific tables
9. `scripts/009_create_user_schema.sql` - User-specific tables

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
│   │   ├── users/              # User management
│   │   ├── modules/            # Module management
│   │   ├── quizzes/            # Quiz management
│   │   ├── simulations/        # Simulation management
│   │   └── analytics/          # Analytics dashboard
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

## 🗄 Database Architecture

### Separate Schema Design
The platform uses separate database schemas for admin and user functionality to ensure data isolation and security:

#### Admin Schema (`admin`)
- **admin_settings**: Platform configuration and settings
- **admin_logs**: Administrative action logs
- **content_management**: Content creation and editing workflows
- **user_management**: User administration and role management
- **analytics_data**: Aggregated analytics and reporting data

#### User Schema (`public`)
- **profiles**: User profile information
- **modules**: Learning content and materials
- **quizzes**: Quiz definitions and questions
- **simulations**: Interactive scenarios
- **user_progress**: Learning progress tracking

### Core Tables

#### `profiles` (User Schema)
User profile information linked to Supabase Auth users.
- `id` (UUID, Primary Key)
- `email` (Text, Not Null)
- `full_name` (Text)
- `role` (Text: 'user' | 'admin')
- `avatar_url` (Text)
- `created_at` (Timestamp)
- `updated_at` (Timestamp)

#### `modules` (User Schema)
Learning modules and course content.
- `id` (UUID, Primary Key)
- `title` (Text, Not Null)
- `description` (Text)
- `content` (JSONB)
- `difficulty_level` (Text)
- `estimated_duration` (Integer, minutes)
- `is_published` (Boolean)
- `created_by` (UUID, Foreign Key to profiles)
- `created_at` (Timestamp)
- `updated_at` (Timestamp)

#### `quizzes` (User Schema)
Quiz definitions and questions.
- `id` (UUID, Primary Key)
- `title` (Text, Not Null)
- `description` (Text)
- `questions` (JSONB)
- `time_limit` (Integer, minutes)
- `passing_score` (Integer, percentage)
- `difficulty_level` (Text)
- `is_published` (Boolean)
- `created_by` (UUID, Foreign Key to profiles)
- `created_at` (Timestamp)
- `updated_at` (Timestamp)

#### `simulations` (User Schema)
Interactive cybersecurity simulations.
- `id` (UUID, Primary Key)
- `title` (Text, Not Null)
- `description` (Text)
- `scenario` (JSONB)
- `difficulty_level` (Text)
- `estimated_duration` (Integer, minutes)
- `is_published` (Boolean)
- `created_by` (UUID, Foreign Key to profiles)
- `created_at` (Timestamp)
- `updated_at` (Timestamp)

### Progress Tracking Tables

#### `user_module_progress` (User Schema)
Tracks user progress through learning modules.
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key to profiles)
- `module_id` (UUID, Foreign Key to modules)
- `progress_percentage` (Integer, 0-100)
- `completed` (Boolean)
- `last_accessed` (Timestamp)
- `time_spent` (Integer, seconds)
- `created_at` (Timestamp)
- `updated_at` (Timestamp)

#### `user_quiz_attempts` (User Schema)
Records of user quiz attempts and scores.
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key to profiles)
- `quiz_id` (UUID, Foreign Key to quizzes)
- `score` (Integer, 0-100)
- `answers` (JSONB)
- `passed` (Boolean)
- `time_taken` (Integer, seconds)
- `completed_at` (Timestamp)
- `created_at` (Timestamp)

#### `user_simulation_attempts` (User Schema)
Records of user simulation attempts.
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key to profiles)
- `simulation_id` (UUID, Foreign Key to simulations)
- `score` (Integer, 0-100)
- `decisions` (JSONB)
- `completed` (Boolean)
- `time_taken` (Integer, seconds)
- `completed_at` (Timestamp)
- `created_at` (Timestamp)

### Admin Tables

#### `admin_settings` (Admin Schema)
Platform configuration and settings.
- `id` (UUID, Primary Key)
- `setting_key` (Text, Unique)
- `setting_value` (JSONB)
- `description` (Text)
- `updated_by` (UUID, Foreign Key to profiles)
- `updated_at` (Timestamp)

#### `admin_logs` (Admin Schema)
Administrative action logs for audit trail.
- `id` (UUID, Primary Key)
- `admin_id` (UUID, Foreign Key to profiles)
- `action` (Text)
- `resource_type` (Text)
- `resource_id` (UUID)
- `details` (JSONB)
- `ip_address` (Text)
- `user_agent` (Text)
- `created_at` (Timestamp)

## 🔐 Authentication Flow

### Sign Up Process
1. User fills registration form at `/auth/sign-up`
2. Supabase sends confirmation email
3. User clicks email link → `/auth/callback`
4. Callback exchanges code for session
5. User redirected to dashboard
6. Profile automatically created via trigger

### Sign In Process
1. User enters credentials at `/auth/login`
2. Supabase validates and creates session
3. Middleware protects routes
4. User redirected to dashboard

### Route Protection
- Middleware checks authentication on all routes
- Unauthenticated users redirected to `/auth/login`
- Admin routes check user role in database
- Protected routes: `/dashboard/*`, `/admin/*`

## 🎯 Admin Panel Features

### Dashboard Overview (`/admin`)
- **User Statistics**: Total users, new registrations, active users
- **Content Statistics**: Published/draft modules, quizzes, simulations
- **Activity Monitoring**: Recent user activities and system events
- **Quick Actions**: Fast access to content creation and management

### User Management (`/admin/users`)
- **User List**: Paginated view of all registered users
- **User Details**: Individual user profiles and activity history
- **Role Management**: Assign/revoke admin privileges
- **Account Actions**: Suspend, activate, or delete user accounts
- **Bulk Operations**: Mass user management actions

### Content Management
#### Modules (`/admin/modules`)
- **Module List**: All learning modules with status indicators
- **Create/Edit**: Rich content editor for module creation
- **Publishing**: Draft/publish workflow with version control
- **Analytics**: Module completion rates and user engagement

#### Quizzes (`/admin/quizzes`)
- **Quiz Builder**: Interactive quiz creation interface
- **Question Bank**: Reusable question library
- **Scoring Configuration**: Custom scoring and passing criteria
- **Performance Analytics**: Quiz attempt statistics and success rates

#### Simulations (`/admin/simulations`)
- **Scenario Builder**: Interactive simulation creation tools
- **Decision Trees**: Complex branching scenario logic
- **Scoring System**: Custom scoring based on user decisions
- **Usage Analytics**: Simulation completion and performance data

### Analytics Dashboard (`/admin/analytics`)
- **User Engagement**: Login frequency, session duration, feature usage
- **Learning Progress**: Module completion rates, quiz performance
- **Content Performance**: Most popular content, completion rates
- **System Health**: Performance metrics, error rates, uptime

### System Settings (`/admin/settings`)
- **Platform Configuration**: Site settings, feature toggles
- **Email Templates**: Customizable notification templates
- **Security Settings**: Password policies, session management
- **Integration Settings**: Third-party service configurations

## 🎨 Design System & Responsive Design

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

### Responsive Breakpoints
- **Mobile**: 320px - 768px (sm)
- **Tablet**: 768px - 1024px (md)
- **Desktop**: 1024px - 1280px (lg)
- **Large Desktop**: 1280px+ (xl)

### Spacing System
- **Container Padding**: 
  - Mobile: `px-4` (16px)
  - Tablet: `px-6` (24px)
  - Desktop: `px-8` (32px)
- **Section Spacing**: `py-8` to `py-16` based on screen size
- **Component Spacing**: Consistent `gap-4` to `gap-8` throughout

### Components
- **Cards**: Elevated surfaces with proper padding and responsive layouts
- **Buttons**: Primary, secondary, and outline variants with touch-friendly sizing
- **Forms**: Consistent input styling with validation and mobile optimization
- **Navigation**: Responsive menu systems with mobile hamburger menu
- **Tables**: Responsive tables with horizontal scroll on mobile

## 📱 Route Documentation

### Public Routes
- `/` - Landing page with platform overview
- `/auth/login` - User login page
- `/auth/sign-up` - User registration page
- `/auth/callback` - Email confirmation callback
- `/auth/error` - Authentication error handling

### Protected User Routes
- `/dashboard` - User dashboard with progress overview
- `/modules` - Learning modules listing
- `/modules/[id]` - Individual module viewer
- `/quizzes` - Available quizzes listing
- `/quizzes/[id]` - Quiz taking interface
- `/simulations` - Simulation scenarios listing
- `/simulations/[id]` - Interactive simulation interface

### Admin Routes (Role-Protected)
- `/admin` - Admin dashboard overview
- `/admin/users` - User management interface
- `/admin/users/[id]` - Individual user management
- `/admin/modules` - Module content management
- `/admin/modules/create` - Create new module
- `/admin/modules/[id]/edit` - Edit existing module
- `/admin/quizzes` - Quiz management interface
- `/admin/quizzes/create` - Create new quiz
- `/admin/quizzes/[id]/edit` - Edit existing quiz
- `/admin/simulations` - Simulation management
- `/admin/simulations/create` - Create new simulation
- `/admin/simulations/[id]/edit` - Edit existing simulation
- `/admin/analytics` - Platform analytics dashboard
- `/admin/settings` - System configuration

### API Routes
- `/api/auth/callback` - Supabase auth callback handler
- `/api/modules/[id]/progress` - Update module progress
- `/api/quizzes/[id]/submit` - Submit quiz answers
- `/api/simulations/[id]/submit` - Submit simulation results
- `/api/admin/users` - User management API
- `/api/admin/content` - Content management API
- `/api/admin/analytics` - Analytics data API

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
- Maintain separate admin and user schemas

### Adding New Features
1. Create database tables if needed
2. Add TypeScript interfaces
3. Build UI components with responsive design
4. Implement server actions
5. Add proper error handling
6. Update documentation
7. Test on multiple screen sizes

## 🐛 Troubleshooting

### Common Issues

#### Email Confirmation Not Working
- Check callback route is properly configured at `/auth/callback`
- Verify environment variables are set correctly
- Ensure Supabase email settings are configured
- Check redirect URL matches your domain

#### Database Connection Issues
- Verify Supabase credentials in environment variables
- Check RLS policies are properly set for both schemas
- Ensure user has proper permissions for admin functions
- Verify schema separation is working correctly

#### Authentication Errors
- Clear browser cookies and localStorage
- Check middleware configuration in `middleware.ts`
- Verify Supabase project settings
- Ensure admin role is properly assigned in database

#### Performance Issues
- Enable database indexing for large tables
- Optimize queries with proper joins
- Use React.memo for expensive components
- Implement proper loading states

#### Responsive Design Issues
- Test on multiple device sizes
- Check Tailwind breakpoints are properly applied
- Ensure proper padding and spacing on mobile
- Verify touch targets are appropriately sized

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
3. Make your changes with proper responsive design
4. Add tests if applicable
5. Update documentation
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Check the troubleshooting section
- Review the route documentation
- Test admin functionality with proper role assignment
- Open an issue on GitHub
- Contact the development team

---

**Cyberaware** - Building cybersecurity awareness through interactive education.
