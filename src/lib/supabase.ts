import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'

const supabaseUrl = 'https://xsfrulufohnfzlfmywkz.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhzZnJ1bHVmb2huZnpsZm15d2t6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4NDg2MjksImV4cCI6MjA3NzQyNDYyOX0.rk69Kfru-PwuPyKTHjD1Dahejb6NE4gUgjrebkK4bSc'

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// Export createClient for API routes
export { createClient }
