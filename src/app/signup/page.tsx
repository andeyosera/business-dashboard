'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SignupPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', email: '', password: '', business: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    if (res.ok) {
      router.push('/login')
    } else {
      setError(data.message || 'Something went wrong.')
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      background: 'var(--bg)',
    }}>
      {/* Left panel */}
      <div style={{
        background: 'linear-gradient(135deg, #0d1117 0%, #0a1628 50%, #080b12 100%)',
        borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column',
        justifyContent: 'center', padding: '3rem',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: '-80px', right: '-80px', width: '300px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)' }} />
        <div style={{ position: 'absolute', bottom: '-60px', left: '-60px', width: '250px', height: '250px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(6,182,212,0.08) 0%, transparent 70%)' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '3rem' }}>
          <div style={{ width: '28px', height: '28px', background: 'linear-gradient(135deg, #06b6d4, #8b5cf6)', borderRadius: '8px' }} />
          <span style={{ fontFamily: 'Syne', fontWeight: 700, color: 'var(--white)', fontSize: '1rem', letterSpacing: '0.05em' }}>NEXUS</span>
        </div>

        <h1 style={{ fontFamily: 'Syne', fontSize: '2.2rem', fontWeight: 700, color: 'var(--white)', lineHeight: 1.2, marginBottom: '1rem' }}>
          Start growing<br />your business<br />
          <span style={{ color: 'var(--emerald)' }}>today.</span>
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: '0.9rem', lineHeight: 1.8, maxWidth: '320px', marginBottom: '2.5rem' }}>
          Join thousands of businesses using Nexus to track customers and grow revenue.
        </p>

        {[
          { icon: '✦', text: 'Free forever — no credit card required' },
          { icon: '✦', text: 'Unlimited customer tracking' },
          { icon: '✦', text: 'Real-time revenue analytics' },
        ].map(f => (
          <div key={f.text} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <span style={{ color: 'var(--emerald)', fontSize: '0.7rem' }}>{f.icon}</span>
            <span style={{ color: 'var(--muted)', fontSize: '0.875rem' }}>{f.text}</span>
          </div>
        ))}
      </div>

      {/* Right panel */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem' }}>
        <div style={{ width: '100%', maxWidth: '380px' }}>
          <h2 style={{ fontFamily: 'Syne', fontSize: '1.6rem', fontWeight: 700, color: 'var(--white)', marginBottom: '0.4rem' }}>
            Create your account
          </h2>
          <p style={{ color: 'var(--muted)', fontSize: '0.875rem', marginBottom: '2rem' }}>
            Get started in under a minute
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {error && (
              <div style={{ background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.3)', color: '#f87171', padding: '0.75rem 1rem', borderRadius: '10px', fontSize: '0.85rem' }}>
                {error}
              </div>
            )}
            {[
              { key: 'name', label: 'Full Name', type: 'text', placeholder: 'John Doe' },
              { key: 'business', label: 'Business Name', type: 'text', placeholder: 'My Business Ltd' },
              { key: 'email', label: 'Email Address', type: 'email', placeholder: 'you@example.com' },
              { key: 'password', label: 'Password', type: 'password', placeholder: '••••••••' },
            ].map(f => (
              <div key={f.key}>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--muted)', marginBottom: '0.5rem', fontWeight: 500, letterSpacing: '0.03em' }}>
                  {f.label}
                </label>
                <input
                  type={f.type} required
                  value={form[f.key as keyof typeof form]}
                  onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                  placeholder={f.placeholder}
                  style={{
                    width: '100%', background: 'var(--surface)',
                    border: '1px solid var(--border2)', color: 'var(--white)',
                    padding: '0.8rem 1rem', borderRadius: '10px',
                    fontSize: '0.9rem', outline: 'none',
                  }}
                />
              </div>
            ))}
            <button
              type="submit" disabled={loading}
              style={{
                background: 'linear-gradient(135deg, #10b981, #06b6d4)',
                color: '#fff', border: 'none', padding: '0.9rem',
                borderRadius: '10px', fontSize: '0.9rem', fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1, marginTop: '0.5rem',
                fontFamily: 'Plus Jakarta Sans',
              }}
            >
              {loading ? 'Creating account...' : 'Create account →'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--muted)', fontSize: '0.85rem' }}>
            Already have an account?{' '}
            <Link href="/login" style={{ color: 'var(--cyan)', textDecoration: 'none', fontWeight: 500 }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}