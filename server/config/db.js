import { createClient } from '@supabase/supabase-js'

// Server-side Supabase client. The service role key bypasses Row Level Security,
// so it must only ever live in server/.env — never in the frontend.
let client = null

export function getSupabase() {
  if (client) return client

  const url = process.env.SUPABASE_URL?.trim()
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
  if (!url || !key || url.includes('your-project-ref') || key.startsWith('replace-with')) {
    throw new Error(
      'SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set '
      + '(server/.env locally, or the Vercel project’s Environment Variables for the live site).'
    )
  }

  client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  return client
}

// Called once at startup: fails fast with a clear message if the keys are wrong
// or server/supabase-schema.sql has not been run yet.
const connectDB = async () => {
  const { error } = await getSupabase().from('users').select('id', { head: true, count: 'exact' })
  if (error) {
    const hint = error.code === '42P01' || /does not exist|schema cache/i.test(error.message)
      ? ' Run server/supabase-schema.sql in the Supabase SQL Editor first.'
      : ''
    throw new Error(`Supabase connection failed: ${error.message}.${hint}`)
  }
  console.log('Supabase connected')
}

export default connectDB
