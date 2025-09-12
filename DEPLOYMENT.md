# Deployment Guide - Cyberaware Platform

This guide covers deploying the Cyberaware cybersecurity education platform to production.

## 🚀 Quick Deploy to Vercel

### Prerequisites
- GitHub account with the repository
- Vercel account
- Supabase project set up

### Step 1: Prepare Supabase
1. **Create Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Create new project
   - Note your project URL and anon key

2. **Run Database Scripts**
   Execute these scripts in order in your Supabase SQL editor:
   \`\`\`sql
   -- Run each script file in order:
   -- 001_create_profiles.sql
   -- 002_create_modules.sql  
   -- 003_create_quizzes.sql
   -- 004_create_simulations.sql
   -- 005_create_user_progress.sql
   -- 006_create_profile_trigger.sql
   -- 007_seed_sample_data.sql
   \`\`\`

3. **Configure Authentication**
   - Go to Authentication > Settings
   - Set Site URL to your domain (e.g., `https://cyberaware.vercel.app`)
   - Add redirect URLs:
     - `https://yourdomain.com/auth/callback`
     - `http://localhost:3000/auth/callback` (for development)

### Step 2: Deploy to Vercel
1. **Connect Repository**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository

2. **Configure Environment Variables**
   Add these in Vercel project settings:
   \`\`\`env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   \`\`\`

3. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Visit your live site!

## 🔧 Manual Deployment

### Environment Setup
Create production environment file:
\`\`\`env
# Production Environment Variables
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Optional: Custom redirect for development
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000/auth/callback
\`\`\`

### Build Process
\`\`\`bash
# Install dependencies
npm install

# Build for production
npm run build

# Start production server
npm start
\`\`\`

## 🗄 Database Configuration

### Required Tables
Ensure all tables are created in this order:

1. **profiles** - User profile data
2. **modules** - Learning content
3. **quizzes** - Quiz definitions
4. **simulations** - Interactive scenarios
5. **user_module_progress** - Learning progress
6. **user_quiz_attempts** - Quiz results
7. **user_simulation_attempts** - Simulation results

### Row Level Security (RLS)
All tables have RLS enabled with policies for:
- Users can read their own data
- Users can insert their own progress
- Admins can manage all content
- Public read access for published content

### Sample Data
The seed script includes:
- 5 cybersecurity learning modules
- 3 interactive quizzes
- 2 simulation scenarios
- Sample admin user

## 🔐 Security Configuration

### Supabase Auth Settings
1. **Email Templates**
   - Customize confirmation email
   - Set proper redirect URLs
   - Configure email rate limiting

2. **Security Settings**
   - Enable email confirmation
   - Set session timeout
   - Configure password requirements

3. **API Settings**
   - Restrict API access if needed
   - Set up CORS policies
   - Configure rate limiting

### Next.js Security
- Middleware protects all routes
- Server-side authentication checks
- Secure cookie handling
- CSRF protection via Supabase

## 🚀 Performance Optimization

### Database Optimization
\`\`\`sql
-- Add indexes for better performance
CREATE INDEX idx_user_module_progress_user_id ON user_module_progress(user_id);
CREATE INDEX idx_user_quiz_attempts_user_id ON user_quiz_attempts(user_id);
CREATE INDEX idx_modules_published ON modules(is_published) WHERE is_published = true;
\`\`\`

### Next.js Optimization
- Static generation for public pages
- Server-side rendering for dynamic content
- Image optimization with Next.js Image
- Code splitting and lazy loading

### Caching Strategy
- Static assets cached by CDN
- Database queries cached where appropriate
- User sessions cached in browser

## 📊 Monitoring & Analytics

### Vercel Analytics
- Automatic performance monitoring
- User analytics and insights
- Error tracking and reporting

### Supabase Monitoring
- Database performance metrics
- Authentication analytics
- API usage statistics

### Custom Monitoring
\`\`\`typescript
// Add custom analytics events
const trackLearningProgress = (moduleId: string, progress: number) => {
  // Your analytics implementation
}
\`\`\`

## 🔄 CI/CD Pipeline

### Automatic Deployment
\`\`\`yaml
# .github/workflows/deploy.yml
name: Deploy to Vercel
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Vercel
        uses: vercel/action@v1
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
\`\`\`

### Database Migrations
- Version control your SQL scripts
- Test migrations in staging first
- Backup database before major changes

## 🐛 Troubleshooting

### Common Deployment Issues

#### Build Failures
\`\`\`bash
# Check for TypeScript errors
npm run type-check

# Check for linting issues
npm run lint

# Clear Next.js cache
rm -rf .next
npm run build
\`\`\`

#### Authentication Issues
- Verify Supabase URLs in environment variables
- Check redirect URLs in Supabase dashboard
- Ensure callback route is properly deployed

#### Database Connection Issues
- Verify service role key permissions
- Check RLS policies are correctly set
- Ensure all required tables exist

### Performance Issues
- Monitor Vercel function execution times
- Check database query performance
- Optimize large data fetches

## 🔄 Updates & Maintenance

### Regular Updates
- Keep dependencies updated
- Monitor security advisories
- Update Supabase client libraries

### Content Management
- Regular content reviews
- Update quiz questions
- Add new learning modules

### User Management
- Monitor user registrations
- Handle support requests
- Manage admin permissions

## 📈 Scaling Considerations

### Database Scaling
- Monitor connection limits
- Consider read replicas for heavy read workloads
- Implement connection pooling

### Application Scaling
- Vercel automatically scales functions
- Consider edge functions for global performance
- Implement caching strategies

### Content Scaling
- Organize content into categories
- Implement search functionality
- Add content recommendation system

---

Your Cyberaware platform is now ready for production! 🎉

For support, check the main README.md or open an issue on GitHub.
