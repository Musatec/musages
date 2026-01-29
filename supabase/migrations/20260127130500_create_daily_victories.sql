-- Create Daily Victories Table
CREATE TABLE IF NOT EXISTS public.daily_victories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    is_completed BOOLEAN DEFAULT false,
    victory_date DATE DEFAULT CURRENT_DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    UNIQUE(user_id, victory_date)
);

-- Enable RLS
ALTER TABLE public.daily_victories ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can manage their own victors" ON public.daily_victories
    FOR ALL USING (auth.uid() = user_id);

-- Add to Database types if needed (manual update for now)
