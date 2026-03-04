import { createClient } from '@supabase/supabase-js'

// IMPORTANT: Never expose the service_role key to the client.
// This client should strictly be used in server-side API routes or background jobs
// (like webhooks) that require bypassing Row Level Security (RLS).
export const createAdminClient = () => {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
        process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder_key'
    )
}
