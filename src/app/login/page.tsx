'use client'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const res = await signIn('credentials', {
      email: form.email,
      password: form.password,
      redirect: false,
    })
    if (res?.ok) {
      router.push('/dashboard')
    } else {
      setError('Invalid email or password.')
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
        justifyContent: 'space-between', padding: '3rem',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Decorative circles */}
        <div style={{ position: 'absolute', top: '-80px', right: '-80px', width: '300px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(6,182,212,0.08) 0%, transparent 70%)' }} />
        <div style={{ position: 'absolute', bottom: '-60px', left: '-60px', width: '250px', height: '250px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)' }} />

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '4rem' }}>
            <div style={{ width: '28px', height: '28px', background: 'linear-gradient(135deg, #06b6d4, #8b5cf6)', borderRadius: '8px' }} />
            <span style={{ fontFamily: 'Syne', fontWeight: 700, color: 'var(--white)', fontSize: '1rem', letterSpacing: '0.05em' }}>NEXUS</span>
          </div>
          <h1 style={{ fontFamily: 'Syne', fontSize: '2.5rem', fontWeight: 700, color: 'var(--white)', lineHeight: 1.2, marginBottom: '1rem' }}>
            Manage your<br />business<br />
            <span style={{ color: 'var(--cyan)' }}>smarter.</span>
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '0.9rem', lineHeight: 1.8, maxWidth: '320px' }}>
            Track customers, monitor revenue, and grow your business with powerful insights.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          {[
            { label: 'Businesses', value: '2,400+' },
            { label: 'Customers tracked', value: '180K+' },
            { label: 'Revenue managed', value: '$12M+' },
            { label: 'Uptime', value: '99.9%' },
          ].map(s => (
            <div key={s.label} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: '10px', padding: '1rem' }}>
              <div style={{ fontFamily: 'Syne', fontSize: '1.3rem', fontWeight: 700, color: 'var(--cyan)', marginBottom: '0.2rem' }}>{s.value}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem' }}>
        <div style={{ width: '100%', maxWidth: '380px' }}>
          <h2 style={{ fontFamily: 'Syne', fontSize: '1.6rem', fontWeight: 700, color: 'var(--white)', marginBottom: '0.4rem' }}>
            Welcome back
          </h2>
          <p style={{ color: 'var(--muted)', fontSize: '0.875rem', marginBottom: '2rem' }}>
            Sign in to your dashboard
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {error && (
              <div style={{ background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.3)', color: '#f87171', padding: '0.75rem 1rem', borderRadius: '10px', fontSize: '0.85rem' }}>
                {error}
              </div>
            )}
            {[
              { key: 'email', label: 'Email address', type: 'email', placeholder: 'you@example.com' },
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
                    fontSize: '0.9rem', outline: 'none', transition: 'border 0.2s',
                  }}
                />
              </div>
            ))}
            <button
              type="submit" disabled={loading}
              style={{
                background: 'linear-gradient(135deg, #06b6d4, #8b5cf6)',
                color: '#fff', border: 'none', padding: '0.9rem',
                borderRadius: '10px', fontSize: '0.9rem', fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1, marginTop: '0.5rem',
                fontFamily: 'Plus Jakarta Sans',
              }}
            >
              {loading ? 'Signing in...' : 'Sign in →'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--muted)', fontSize: '0.85rem' }}>
            Don't have an account?{' '}
            <Link href="/signup" style={{ color: 'var(--cyan)', textDecoration: 'none', fontWeight: 500 }}>
              Create one free
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}