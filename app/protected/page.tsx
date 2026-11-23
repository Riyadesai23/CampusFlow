import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { SignOutButton } from './sign-out-button'

export default async function ProtectedPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  return (
    <main className="dashboard-shell">
      <header className="dashboard-header"><Link className="brand" href="/">CampusFlow<span>.</span></Link><SignOutButton /></header>
      <section className="dashboard-content">
        <div className="eyebrow">CAMPUSFLOW WORKSPACE</div>
        <h1>You&apos;re signed in.</h1>
        <p>Your account is connected as <strong>{user.email}</strong>.</p>
        <div className="dashboard-panel"><span className="status-dot" /> Your Supabase session is active and protected by server-verified auth.</div>
      </section>
    </main>
  )
}
