
-- Add settings column to profiles to store notifications and other user preferences
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{
  "notifications": {
    "email_digests": true,
    "project_updates": true,
    "book_reminders": false,
    "system_announcements": true
  },
  "appearance": {
    "theme": "dark",
    "compact_mode": false
  }
}'::jsonb;
