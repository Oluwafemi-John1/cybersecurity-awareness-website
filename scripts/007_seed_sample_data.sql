-- Insert sample learning modules
insert into public.modules (title, description, content, difficulty_level, category, is_published, created_by) values
(
  'Introduction to Cybersecurity',
  'Learn the fundamentals of cybersecurity and why it matters in today''s digital world.',
  '{"sections": [{"title": "What is Cybersecurity?", "content": "Cybersecurity is the practice of protecting systems, networks, and programs from digital attacks..."}, {"title": "Common Threats", "content": "Learn about malware, phishing, ransomware, and other common cyber threats..."}]}',
  'beginner',
  'fundamentals',
  true,
  (select id from public.profiles where role = 'admin' limit 1)
),
(
  'Password Security Best Practices',
  'Master the art of creating and managing secure passwords.',
  '{"sections": [{"title": "Strong Password Creation", "content": "Learn how to create passwords that are both secure and memorable..."}, {"title": "Password Managers", "content": "Discover how password managers can simplify your digital life..."}]}',
  'beginner',
  'authentication',
  true,
  (select id from public.profiles where role = 'admin' limit 1)
),
(
  'Phishing Attack Recognition',
  'Learn to identify and avoid phishing attempts.',
  '{"sections": [{"title": "What is Phishing?", "content": "Phishing is a type of social engineering attack..."}, {"title": "Red Flags to Watch For", "content": "Learn the warning signs of phishing emails and websites..."}]}',
  'intermediate',
  'social-engineering',
  true,
  (select id from public.profiles where role = 'admin' limit 1)
);

-- Insert sample quizzes
insert into public.quizzes (title, description, questions, difficulty_level, category, time_limit, is_published, created_by) values
(
  'Cybersecurity Basics Quiz',
  'Test your knowledge of fundamental cybersecurity concepts.',
  '{"questions": [{"question": "What does CIA stand for in cybersecurity?", "options": ["Central Intelligence Agency", "Confidentiality, Integrity, Availability", "Computer Information Access", "Cyber Intelligence Analysis"], "correct": 1}, {"question": "Which of the following is NOT a type of malware?", "options": ["Virus", "Trojan", "Firewall", "Ransomware"], "correct": 2}]}',
  'beginner',
  'fundamentals',
  15,
  true,
  (select id from public.profiles where role = 'admin' limit 1)
),
(
  'Password Security Assessment',
  'Evaluate your understanding of password security principles.',
  '{"questions": [{"question": "What makes a password strong?", "options": ["Length only", "Complexity only", "Both length and complexity", "Using personal information"], "correct": 2}, {"question": "How often should you change your passwords?", "options": ["Daily", "Weekly", "When compromised or as needed", "Never"], "correct": 2}]}',
  'beginner',
  'authentication',
  10,
  true,
  (select id from public.profiles where role = 'admin' limit 1)
);

-- Insert sample simulations
insert into public.simulations (title, description, scenario_data, difficulty_level, category, estimated_duration, is_published, created_by) values
(
  'Phishing Email Detection',
  'Practice identifying phishing emails in a realistic inbox environment.',
  '{"scenario": "email_inbox", "emails": [{"from": "security@yourbank.com", "subject": "Urgent: Verify Your Account", "content": "Your account has been compromised. Click here to verify immediately.", "isPhishing": true, "indicators": ["Urgent language", "Generic greeting", "Suspicious link"]}, {"from": "newsletter@techcompany.com", "subject": "Weekly Tech Updates", "content": "Here are this week''s latest technology news and updates.", "isPhishing": false, "indicators": ["Legitimate sender", "Expected content"]}]}',
  'beginner',
  'social-engineering',
  20,
  true,
  (select id from public.profiles where role = 'admin' limit 1)
),
(
  'Incident Response Simulation',
  'Navigate through a cybersecurity incident as a security analyst.',
  '{"scenario": "incident_response", "incident": {"type": "data_breach", "description": "Suspicious network activity detected", "steps": [{"action": "Assess the situation", "options": ["Ignore the alert", "Investigate immediately", "Wait for more information"], "correct": 1}, {"action": "Contain the threat", "options": ["Shut down all systems", "Isolate affected systems", "Continue monitoring"], "correct": 1}]}}',
  'advanced',
  'incident-response',
  45,
  true,
  (select id from public.profiles where role = 'admin' limit 1)
);
