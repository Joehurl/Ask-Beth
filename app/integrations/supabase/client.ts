import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Database } from './types';
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = "https://ziujnqcpjbflceercdij.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InppdWpucWNwamJmbGNlZXJjZGlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE0MjI2NDIsImV4cCI6MjEwNjk5ODY0Mn0.wS8Tq6usV9oxlIuo5Hyu3IxK_XFCC3lbbwccKVbaiRc";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})
