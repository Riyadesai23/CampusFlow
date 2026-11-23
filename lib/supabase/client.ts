import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

  if (!url || !key) throw new Error('Supabase public URL and key are required.')

  return createBrowserClient(url, key, {
    cookieOptions: { secure: process.env.NODE_ENV === 'production' },
  })
}
