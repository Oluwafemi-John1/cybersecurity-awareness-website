# API Documentation - Cyberaware Platform

This document outlines the database schema, API patterns, and data flow for the Cyberaware cybersecurity education platform.

## 🗄 Database Schema

### Authentication & Users

#### `auth.users` (Supabase Auth)
Managed by Supabase Auth system.
\`\`\`sql
-- Supabase managed table
id: UUID (Primary Key)
email: TEXT
created_at: TIMESTAMP
\`\`\`

#### `public.profiles`
Extended user profile information.
\`\`\`sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
\`\`\`

### Learning Content

#### `public.modules`
Learning modules and course content.
\`\`\`sql
CREATE TABLE modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  content JSONB NOT NULL,
  difficulty_level TEXT DEFAULT 'beginner' CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  estimated_duration INTEGER DEFAULT 30, -- minutes
  category TEXT DEFAULT 'general',
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
\`\`\`

**Content JSONB Structure:**
\`\`\`json
{
  "sections": [
    {
      "id": "section-1",
      "title": "Introduction to Phishing",
      "content": "Phishing is a type of social engineering attack...",
      "type": "text"
    },
    {
      "id": "section-2", 
      "title": "Common Phishing Techniques",
      "content": "1. Email phishing\n2. Spear phishing\n3. Whaling",
      "type": "list"
    }
  ]
}
\`\`\`

#### `public.quizzes`
Quiz definitions and questions.
\`\`\`sql
CREATE TABLE quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  questions JSONB NOT NULL,
  time_limit INTEGER DEFAULT 30, -- minutes
  passing_score INTEGER DEFAULT 70, -- percentage
  difficulty_level TEXT DEFAULT 'beginner' CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  category TEXT DEFAULT 'general',
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
\`\`\`

**Questions JSONB Structure:**
\`\`\`json
{
  "questions": [
    {
      "question": "What is phishing?",
      "options": [
        "A type of fishing",
        "A social engineering attack",
        "A programming language",
        "A security protocol"
      ],
      "correct": 1
    }
  ]
}
\`\`\`

#### `public.simulations`
Interactive cybersecurity simulations.
\`\`\`sql
CREATE TABLE simulations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  scenario JSONB NOT NULL,
  difficulty_level TEXT DEFAULT 'beginner' CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  category TEXT DEFAULT 'general',
  estimated_duration INTEGER DEFAULT 45, -- minutes
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
\`\`\`

**Scenario JSONB Structure:**
\`\`\`json
{
  "steps": [
    {
      "id": "step-1",
      "title": "Email Received",
      "description": "You receive a suspicious email...",
      "options": [
        {
          "text": "Click the link immediately",
          "points": 0,
          "feedback": "Never click suspicious links!"
        },
        {
          "text": "Verify the sender first",
          "points": 10,
          "feedback": "Good! Always verify suspicious emails."
        }
      ]
    }
  ]
}
\`\`\`

### Progress Tracking

#### `public.user_module_progress`
Tracks user progress through learning modules.
\`\`\`sql
CREATE TABLE user_module_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  module_id UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  current_section TEXT,
  completed BOOLEAN DEFAULT false,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_accessed TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id, module_id)
);
\`\`\`

#### `public.user_quiz_attempts`
Records of user quiz attempts and scores.
\`\`\`sql
CREATE TABLE user_quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
  answers JSONB NOT NULL,
  passed BOOLEAN NOT NULL,
  time_taken INTEGER, -- seconds
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
\`\`\`

**Answers JSONB Structure:**
\`\`\`json
{
  "0": 1,  // Question index: Selected answer index
  "1": 2,
  "2": 0
}
\`\`\`

#### `public.user_simulation_attempts`
Records of user simulation attempts.
\`\`\`sql
CREATE TABLE user_simulation_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  simulation_id UUID NOT NULL REFERENCES simulations(id) ON DELETE CASCADE,
  score INTEGER NOT NULL CHECK (score >= 0),
  decisions JSONB NOT NULL,
  completed BOOLEAN DEFAULT false,
  time_taken INTEGER, -- seconds
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
\`\`\`

## 🔐 Row Level Security (RLS)

### Profiles Table
\`\`\`sql
-- Users can view and update their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
\`\`\`

### Modules Table
\`\`\`sql
-- Anyone can view published modules
CREATE POLICY "Anyone can view published modules" ON modules
  FOR SELECT USING (is_published = true);

-- Admins can manage all modules
CREATE POLICY "Admins can manage modules" ON modules
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
\`\`\`

### Progress Tables
\`\`\`sql
-- Users can view and insert their own progress
CREATE POLICY "Users can manage own progress" ON user_module_progress
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own quiz attempts" ON user_quiz_attempts
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own simulation attempts" ON user_simulation_attempts
  FOR ALL USING (auth.uid() = user_id);
\`\`\`

## 🔄 API Patterns

### Server Actions
The platform uses Next.js Server Actions for database operations.

#### User Progress Updates
\`\`\`typescript
// Update module progress
async function updateModuleProgress(
  moduleId: string, 
  sectionId: string, 
  progressPercentage: number
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) throw new Error('Not authenticated')
  
  const { error } = await supabase
    .from('user_module_progress')
    .upsert({
      user_id: user.id,
      module_id: moduleId,
      current_section: sectionId,
      progress_percentage: progressPercentage,
      completed: progressPercentage >= 100,
      last_accessed: new Date().toISOString(),
      ...(progressPercentage >= 100 && { completed_at: new Date().toISOString() })
    })
    
  if (error) throw error
}
\`\`\`

#### Quiz Submission
\`\`\`typescript
async function submitQuizAttempt(
  quizId: string,
  answers: Record<number, number>,
  score: number,
  passed: boolean,
  timeTaken: number
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) throw new Error('Not authenticated')
  
  const { error } = await supabase
    .from('user_quiz_attempts')
    .insert({
      user_id: user.id,
      quiz_id: quizId,
      score,
      answers: JSON.stringify(answers),
      passed,
      time_taken: timeTaken
    })
    
  if (error) throw error
}
\`\`\`

### Data Fetching Patterns

#### Dashboard Statistics
\`\`\`typescript
async function getDashboardStats(userId: string) {
  const supabase = await createClient()
  
  // Get module progress
  const { data: moduleProgress } = await supabase
    .from('user_module_progress')
    .select('*')
    .eq('user_id', userId)
  
  // Get quiz attempts
  const { data: quizAttempts } = await supabase
    .from('user_quiz_attempts')
    .select('*')
    .eq('user_id', userId)
  
  // Get simulation attempts
  const { data: simulationAttempts } = await supabase
    .from('user_simulation_attempts')
    .select('*')
    .eq('user_id', userId)
  
  return {
    completedModules: moduleProgress?.filter(p => p.completed).length || 0,
    totalQuizzes: quizAttempts?.length || 0,
    passedQuizzes: quizAttempts?.filter(q => q.passed).length || 0,
    completedSimulations: simulationAttempts?.filter(s => s.completed).length || 0
  }
}
\`\`\`

#### Content with Progress
\`\`\`typescript
async function getModulesWithProgress(userId: string) {
  const supabase = await createClient()
  
  const { data: modules } = await supabase
    .from('modules')
    .select(`
      *,
      user_module_progress!left(
        progress_percentage,
        completed,
        last_accessed
      )
    `)
    .eq('is_published', true)
    .eq('user_module_progress.user_id', userId)
  
  return modules
}
\`\`\`

## 📊 Analytics Queries

### Learning Analytics
\`\`\`sql
-- User engagement metrics
SELECT 
  DATE_TRUNC('day', last_accessed) as date,
  COUNT(DISTINCT user_id) as active_users,
  AVG(progress_percentage) as avg_progress
FROM user_module_progress 
WHERE last_accessed >= NOW() - INTERVAL '30 days'
GROUP BY DATE_TRUNC('day', last_accessed)
ORDER BY date;

-- Quiz performance by difficulty
SELECT 
  q.difficulty_level,
  COUNT(*) as total_attempts,
  AVG(qa.score) as avg_score,
  COUNT(*) FILTER (WHERE qa.passed) as passed_attempts
FROM user_quiz_attempts qa
JOIN quizzes q ON qa.quiz_id = q.id
GROUP BY q.difficulty_level;

-- Module completion rates
SELECT 
  m.title,
  m.difficulty_level,
  COUNT(mp.user_id) as started_users,
  COUNT(*) FILTER (WHERE mp.completed) as completed_users,
  ROUND(
    COUNT(*) FILTER (WHERE mp.completed) * 100.0 / COUNT(mp.user_id), 
    2
  ) as completion_rate
FROM modules m
LEFT JOIN user_module_progress mp ON m.id = mp.module_id
WHERE m.is_published = true
GROUP BY m.id, m.title, m.difficulty_level
ORDER BY completion_rate DESC;
\`\`\`

### Performance Monitoring
\`\`\`sql
-- Slow quiz takers (potential issues)
SELECT 
  u.email,
  q.title,
  qa.time_taken,
  q.time_limit * 60 as time_limit_seconds
FROM user_quiz_attempts qa
JOIN profiles p ON qa.user_id = p.id
JOIN auth.users u ON p.id = u.id
JOIN quizzes q ON qa.quiz_id = q.id
WHERE qa.time_taken > (q.time_limit * 60 * 0.9) -- Used >90% of time
ORDER BY qa.time_taken DESC;
\`\`\`

## 🔧 Database Maintenance

### Indexes for Performance
\`\`\`sql
-- User progress queries
CREATE INDEX idx_user_module_progress_user_id ON user_module_progress(user_id);
CREATE INDEX idx_user_module_progress_module_id ON user_module_progress(module_id);
CREATE INDEX idx_user_module_progress_last_accessed ON user_module_progress(last_accessed);

-- Quiz performance queries
CREATE INDEX idx_user_quiz_attempts_user_id ON user_quiz_attempts(user_id);
CREATE INDEX idx_user_quiz_attempts_quiz_id ON user_quiz_attempts(quiz_id);
CREATE INDEX idx_user_quiz_attempts_completed_at ON user_quiz_attempts(completed_at);

-- Content queries
CREATE INDEX idx_modules_published ON modules(is_published) WHERE is_published = true;
CREATE INDEX idx_modules_category ON modules(category);
CREATE INDEX idx_modules_difficulty ON modules(difficulty_level);
\`\`\`

### Data Cleanup
\`\`\`sql
-- Clean up old quiz attempts (keep last 10 per user per quiz)
WITH ranked_attempts AS (
  SELECT id,
    ROW_NUMBER() OVER (
      PARTITION BY user_id, quiz_id 
      ORDER BY completed_at DESC
    ) as rn
  FROM user_quiz_attempts
)
DELETE FROM user_quiz_attempts 
WHERE id IN (
  SELECT id FROM ranked_attempts WHERE rn > 10
);
\`\`\`

---

This API documentation provides the foundation for understanding and extending the Cyberaware platform's data layer and backend functionality.
