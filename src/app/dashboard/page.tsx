'use client'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface Customer {
  id: string
  name: string
  email: string
  phone: string | null
  status: string
  value: number
  createdAt: string
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', phone: '', status: 'active', value: '' })
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
  }, [status, router])

  useEffect(() => {
    if (status === 'authenticated') fetchCustomers()
  }, [status])

  const fetchCustomers = async () => {
    const res = await fetch('/api/customers')
    const data = await res.json()
    setCustomers(data)
    setLoading(false)
  }

  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const res = await fetch('/api/customers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, value: parseFloat(form.value) || 0 }),
    })
    if (res.ok) {
      setForm({ name: '', email: '', phone: '', status: 'active', value: '' })
      setShowForm(false)
      fetchCustomers()
    }
    setSaving(false)
  }

  if (status === 'loading' || loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '36px', height: '36px', background: 'linear-gradient(135deg, #06b6d4, #8b5cf6)', borderRadius: '10px', margin: '0 auto 1rem' }} />
          <p style={{ color: 'var(--muted)', fontSize: '0.875rem' }}>Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  const totalValue = customers.reduce((sum, c) => sum + c.value, 0)
  const activeCount = customers.filter(c => c.status === 'active').length
  const vipCount = customers.filter(c => c.status === 'vip').length
  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  )

  const statusColors: Record<string, { bg: string; color: string }> = {
    active: { bg: 'rgba(16,185,129,0.12)', color: '#34d399' },
    inactive: { bg: 'rgba(84,100,120,0.15)', color: '#64748b' },
    vip: { bg: 'rgba(139,92,246,0.12)', color: '#a78bfa' },
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>

      {/* Navbar */}
      <nav style={{
        background: 'var(--surface)', borderBottom: '1px solid var(--border)',
        padding: '0 2rem', height: '60px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        position: 'sticky', top: 0, zIndex: 50,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ width: '24px', height: '24px', background: 'linear-gradient(135deg, #06b6d4, #8b5cf6)', borderRadius: '6px' }} />
            <span style={{ fontFamily: 'Syne', fontWeight: 700, color: 'var(--white)', fontSize: '0.95rem', letterSpacing: '0.05em' }}>NEXUS</span>
          </div>
          <div style={{ height: '20px', width: '1px', background: 'var(--border)' }} />
          <span style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>{session?.user?.business}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: '28px', height: '28px', background: 'linear-gradient(135deg, #06b6d4, #8b5cf6)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, color: '#fff' }}>
              {session?.user?.name?.[0]?.toUpperCase()}
            </div>
            <span style={{ color: 'var(--text)', fontSize: '0.85rem' }}>{session?.user?.name}</span>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            style={{ background: 'transparent', border: '1px solid var(--border2)', color: 'var(--muted)', padding: '0.4rem 1rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem', transition: 'all 0.2s' }}
          >
            Sign out
          </button>
        </div>
      </nav>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>

        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontFamily: 'Syne', fontSize: '1.5rem', fontWeight: 700, color: 'var(--white)', marginBottom: '0.3rem' }}>
            Good day, {session?.user?.name?.split(' ')[0]} 👋
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '0.875rem' }}>Here's what's happening with your business today.</p>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
          {[
            { label: 'Total Customers', value: customers.length, color: '#06b6d4', bg: 'rgba(6,182,212,0.08)', icon: '👥' },
            { label: 'Active', value: activeCount, color: '#10b981', bg: 'rgba(16,185,129,0.08)', icon: '✅' },
            { label: 'VIP Customers', value: vipCount, color: '#8b5cf6', bg: 'rgba(139,92,246,0.08)', icon: '⭐' },
            { label: 'Total Value', value: `KES ${totalValue.toLocaleString()}`, color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', icon: '💰' },
          ].map(stat => (
            <div key={stat.label} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', padding: '1.25rem', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: stat.color, opacity: 0.6 }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--muted)', fontWeight: 500, letterSpacing: '0.03em' }}>{stat.label}</span>
                <div style={{ width: '32px', height: '32px', background: stat.bg, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem' }}>{stat.icon}</div>
              </div>
              <div style={{ fontFamily: 'Syne', fontSize: '1.6rem', fontWeight: 700, color: stat.color }}>{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Customers section */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden' }}>
          {/* Table header */}
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
            <div>
              <h2 style={{ fontFamily: 'Syne', fontSize: '1rem', fontWeight: 600, color: 'var(--white)', marginBottom: '0.1rem' }}>Customers</h2>
              <p style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>{customers.length} total</p>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flex: 1, maxWidth: '500px' }}>
              <input
                placeholder="Search customers..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ flex: 1, background: 'var(--surface2)', border: '1px solid var(--border2)', color: 'var(--text)', padding: '0.6rem 1rem', borderRadius: '8px', fontSize: '0.85rem', outline: 'none' }}
              />
              <button
                onClick={() => setShowForm(!showForm)}
                style={{ background: 'linear-gradient(135deg, #06b6d4, #8b5cf6)', color: '#fff', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, whiteSpace: 'nowrap', fontFamily: 'Plus Jakarta Sans' }}
              >
                {showForm ? '✕ Cancel' : '+ Add Customer'}
              </button>
            </div>
          </div>

          {/* Add form */}
          {showForm && (
            <form onSubmit={handleAddCustomer} style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', background: 'var(--surface2)', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
              {[
                { key: 'name', label: 'Full Name', type: 'text', placeholder: 'Jane Doe' },
                { key: 'email', label: 'Email', type: 'email', placeholder: 'jane@example.com' },
                { key: 'phone', label: 'Phone', type: 'text', placeholder: '+254 700 000000' },
                { key: 'value', label: 'Value (KES)', type: 'number', placeholder: '5000' },
              ].map(f => (
                <div key={f.key}>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--muted)', marginBottom: '0.4rem', fontWeight: 500 }}>{f.label}</label>
                  <input
                    type={f.type} placeholder={f.placeholder}
                    value={form[f.key as keyof typeof form]}
                    onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                    style={{ width: '100%', background: 'var(--surface)', border: '1px solid var(--border2)', color: 'var(--white)', padding: '0.65rem 0.9rem', borderRadius: '8px', fontSize: '0.875rem', outline: 'none' }}
                  />
                </div>
              ))}
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--muted)', marginBottom: '0.4rem', fontWeight: 500 }}>Status</label>
                <select
                  value={form.status}
                  onChange={e => setForm({ ...form, status: e.target.value })}
                  style={{ width: '100%', background: 'var(--surface)', border: '1px solid var(--border2)', color: 'var(--white)', padding: '0.65rem 0.9rem', borderRadius: '8px', fontSize: '0.875rem', outline: 'none' }}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="vip">VIP</option>
                </select>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                <button
                  type="submit" disabled={saving}
                  style={{ width: '100%', background: 'linear-gradient(135deg, #10b981, #06b6d4)', color: '#fff', border: 'none', padding: '0.65rem', borderRadius: '8px', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1, fontWeight: 600, fontSize: '0.875rem', fontFamily: 'Plus Jakarta Sans' }}
                >
                  {saving ? 'Saving...' : 'Save Customer'}
                </button>
              </div>
            </form>
          )}

          {/* Table */}
          {filtered.length === 0 ? (
            <div style={{ padding: '4rem', textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🔍</div>
              <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>
                {search ? 'No customers match your search' : 'No customers yet — add your first one!'}
              </p>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['Customer', 'Email', 'Phone', 'Status', 'Value', 'Added'].map(h => (
                    <th key={h} style={{ padding: '0.9rem 1.5rem', textAlign: 'left', color: 'var(--muted)', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((c, i) => (
                  <tr key={c.id} style={{ borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none', transition: 'background 0.15s' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface2)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, #06b6d4, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                          {c.name[0].toUpperCase()}
                        </div>
                        <span style={{ color: 'var(--white)', fontSize: '0.875rem', fontWeight: 500 }}>{c.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: '1rem 1.5rem', color: 'var(--muted)', fontSize: '0.875rem' }}>{c.email}</td>
                    <td style={{ padding: '1rem 1.5rem', color: 'var(--muted)', fontSize: '0.875rem' }}>{c.phone || '—'}</td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600, ...(statusColors[c.status] || statusColors.inactive) }}>
                        {c.status}
                      </span>
                    </td>
                    <td style={{ padding: '1rem 1.5rem', color: 'var(--white)', fontSize: '0.875rem', fontWeight: 500 }}>
                      KES {c.value.toLocaleString()}
                    </td>
                    <td style={{ padding: '1rem 1.5rem', color: 'var(--muted)', fontSize: '0.8rem' }}>
                      {new Date(c.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}