import Link from 'next/link'

export default function SignUpSuccessPage() {
  return (
    <main className="message-shell">
      <section className="message-card">
        <Link className="brand" href="/">CampusFlow<span>.</span></Link>
        <div className="success-mark" aria-hidden="true">✓</div>
        <div className="eyebrow">ONE LAST STEP</div>
        <h1>Check your inbox</h1>
        <p>We sent you a confirmation link. Open it to verify your email and finish creating your account.</p>
        <Link className="submit-button link-button" href="/auth/login">Back to sign in</Link>
      </section>
    </main>
  )
}
