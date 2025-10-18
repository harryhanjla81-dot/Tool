import { createClient } from '@supabase/supabase-js';

// Provided by user from their Supabase dashboard
const supabaseUrl = 'https://ktgjnzsaznopkzloefab.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0Z2puenNhem5vcGt6bG9lZmFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0NTUxODksImV4cCI6MjA3NjAzMTE4OX0.3oSxuol8HjcDoNmJHogft_Az5pIHX6APEHaMyUK3Fiw';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
