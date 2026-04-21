-- Enable Realtime for the Notification table
ALTER TABLE "Notification" REPLICA IDENTITY FULL;

-- Add Notification to the realtime publication
-- (Supabase default publication is usually 'supabase_realtime')
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'Notification'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE "Notification";
  END IF;
END $$;
