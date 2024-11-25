import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  "https://ivoetjclejmrvnbrqryg.supabase.co", 
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml2b2V0amNsZWptcnZuYnJxcnlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI1NDE4NDQsImV4cCI6MjA0ODExNzg0NH0.6u9I8ssWkbFveR5RFjv-MeIFVOOz9S6KgHEFmtLOpec",
  process.env.SUPABASE_KEY, 
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  }
);

export { supabase };