'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FormEvent, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export function AuthForm({ mode }: { mode: 'login' | 'signup' }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const signingUp = mode === 'signup'

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (event.nativeEvent instanceof SubmitEvent && (event.nativeEvent as SubmitEvent & { isComposing?: boolean }).isComposing) return
    setMessage('')
    if (signingUp && password !== confirmPassword) {
      setMessage('Passwords do not match.')
      return
    }

    setLoading(true)
    try {
      const supabase = createClient()
      if (signingUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ?? `${window.location.origin}/auth/callback`,
          },
        })
        if (error) {
          const code = 'code' in error ? error.code : ''
          if (code === 'weak_password') throw new Error('Choose a stronger password.')
          if (code === 'email_address_invalid') throw new Error('Enter a valid email address.')
          if (code === 'over_email_send_rate_limit' || error.status === 429) throw new Error('Too many attempts. Wait a little and try again.')
          throw new Error('Unable to create your account. Check your details and try again.')
        }
        router.push('/auth/sign-up-success')
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) {
          const code = 'code' in error ? error.code : ''
          if (code === 'email_not_confirmed') throw new Error('Confirm your email using the link we sent, then sign in.')
          if (code === 'invalid_credentials') throw new Error('Invalid email or password.')
          if (code === 'over_request_rate_limit' || error.status === 429) throw new Error('Too many attempts. Wait a little and try again.')
          throw new Error('Unable to sign in right now. Please try again.')
        }
        router.replace('/protected')
        router.refresh()
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="auth-shell">
      <section className="auth-card" aria-labelledby="form-title">
        <Link className="brand" href="/">CampusFlow<span>.</span></Link>
        <div className="eyebrow">YOUR CAMPUS, IN SYNC</div>
        <h1 id="form-title">{signingUp ? 'Create your account' : 'Welcome back'}</h1>
        <p className="intro">{signingUp ? 'Start organizing campus life in one place.' : 'Sign in to pick up where you left off.'}</p>
        <form onSubmit={submit}>
          <label htmlFor="email">Email address</label>
          <input id="email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@school.edu" />
          <label htmlFor="password">Password</label>
          <input id="password" type="password" autoComplete={signingUp ? 'new-password' : 'current-password'} minLength={8} required value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 8 characters" />
          {signingUp && <>
            <label htmlFor="confirm-password">Confirm password</label>
            <input id="confirm-password" type="password" autoComplete="new-password" minLength={8} required value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} placeholder="Enter your password again" />
          </>}
          {message && <p className="form-message" role="alert">{message}</p>}
          <button className="submit-button" type="submit" disabled={loading}>{loading ? 'Please wait…' : signingUp ? 'Create account' : 'Sign in'}</button>
        </form>
        <p className="switch-mode">{signingUp ? 'Already have an account?' : 'New to CampusFlow?'}{' '}
          <Link href={signingUp ? '/auth/login' : '/auth/sign-up'}>{signingUp ? 'Sign in' : 'Create an account'}</Link>
        </p>
        <p className="legal">By continuing, you agree to use CampusFlow responsibly within your campus community.</p>
      </section>
      <aside className="auth-aside" aria-label="CampusFlow overview">
        <div className="aside-orb" aria-hidden="true" />
        <div className="aside-copy"><span>LESS CHAOS. MORE CAMPUS.</span><h2>Make room for the moments that matter.</h2><p>Keep your campus plans, people, and projects moving together.</p></div>
        <div className="aside-footer">Built for campus life <span>●</span> Made to move with you</div>
      </aside>
    </main>
  )
}
