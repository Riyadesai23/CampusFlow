import Link from 'next/link'

export default function AuthErrorPage() {
  return (
    <main className="message-shell">
      <section className="message-card">
        <Link className="brand" href="/">CampusFlow<span>.</span></Link>
        <div className="eyebrow">SIGN-IN LINK</div>
        <h1>This link could not be verified</h1>
        <p>It may have expired or already been used. Request a fresh confirmation email and try again.</p>
        <Link className="submit-button link-button" href="/auth/login">Return to sign in</Link>
      </section>
    </main>
  )
}
