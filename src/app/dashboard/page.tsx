'use client'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts'

interface Customer {
  id: string
  name: string
  email: string
  phone: string | null
  status: string
  value: number
  createdAt: string
}

const statusColors: Record<string, { bg: string; color: string }> = {
  active: { bg: 'rgba(16,185,129,0.12)', color: '#34d399' },
  inactive: { bg: 'rgba(84,100,120,0.15)', color: '#64748b' },
  vip: { bg: 'rgba(139,92,246,0.12)', color: '#a78bfa' },
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editCustomer, setEditCustomer] = useState<Customer | null>(null)
  const [form, setForm] = useState({ name: '', email: '', phone: '', status: 'active', value: '' })
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')
  const [aiInsight, setAiInsight] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'customers' | 'analytics'>('customers')

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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    if (editCustomer) {
      await fetch(`/api/customers/${editCustomer.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, value: parseFloat(form.value) || 0 }),
      })
      setEditCustomer(null)
    } else {
      await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, value: parseFloat(form.value) || 0 }),
      })
    }
    setForm({ name: '', email: '', phone: '', status: 'active', value: '' })
    setShowForm(false)
    fetchCustomers()
    setSaving(false)
  }

  const handleEdit = (c: Customer) => {
    setEditCustomer(c)
    setForm({ name: c.name, email: c.email, phone: c.phone || '', status: c.status, value: c.value.toString() })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this customer?')) return
    await fetch(`/api/customers/${id}`, { method: 'DELETE' })
    fetchCustomers()
  }

  const handleExportCSV = () => {
    const headers = ['Name', 'Email', 'Phone', 'Status', 'Value', 'Added']
    const rows = customers.map(c => [
      c.name, c.email, c.phone || '', c.status, c.value,
      new Date(c.createdAt).toLocaleDateString()
    ])
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'customers.csv'
    a.click()
  }

  const handleAiInsight = async () => {
    setAiLoading(true)
    setAiInsight('')
    const summary = {
      total: customers.length,
      active: customers.filter(c => c.status === 'active').length,
      vip: customers.filter(c => c.status === 'vip').length,
      inactive: customers.filter(c => c.status === 'inactive').length,
      totalValue: customers.reduce((s, c) => s + c.value, 0),
      avgValue: customers.length ? customers.reduce((s, c) => s + c.value, 0) / customers.length : 0,
    }
    const res = await fetch('/api/ai-insights', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ summary, business: session?.user?.business }),
    })
    const data = await res.json()
    setAiInsight(data.insight)
    setAiLoading(false)
  }

  if (status === 'loading' || loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '36px', height: '36px', background: 'linear-gradient(135deg, #06b6d4, #8b5cf6)', borderRadius: '10px', margin: '0 auto 1rem' }} />
          <p style={{ color: 'var(--muted)', fontSize: '0.875rem' }}>Loading...</p>
        </div>
      </div>
    )
  }

  const totalValue = customers.reduce((s, c) => s + c.value, 0)
  const activeCount = customers.filter(c => c.status === 'active').length
  const vipCount = customers.filter(c => c.status === 'vip').length
  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  )

  // Chart data
  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const d = new Date()
    d.setMonth(d.getMonth() - (5 - i))
    const month = d.toLocaleString('default', { month: 'short' })
    const monthCustomers = customers.filter(c => {
      const cd = new Date(c.createdAt)
      return cd.getMonth() === d.getMonth() && cd.getFullYear() === d.getFullYear()
    })
    return {
      month,
      customers: monthCustomers.length,
      revenue: monthCustomers.reduce((s, c) => s + c.value, 0),
    }
  })

  const pieData = [
    { name: 'Active', value: activeCount, color: '#10b981' },
    { name: 'VIP', value: vipCount, color: '#8b5cf6' },
    { name: 'Inactive', value: customers.length - activeCount - vipCount, color: '#334155' },
  ].filter(d => d.value > 0)

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Navbar */}
      <nav style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', padding: '0 2rem', height: '60px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ width: '24px', height: '24px', background: 'linear-gradient(135deg, #06b6d4, #8b5cf6)', borderRadius: '6px' }} />
            <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, color: 'var(--white)', fontSize: '0.95rem', letterSpacing: '0.05em' }}>NEXUS</span>
          </div>
          <div style={{ height: '20px', width: '1px', background: 'var(--border)' }} />
          <span style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>{session?.user?.business}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ color: 'var(--text)', fontSize: '0.85rem' }}>{session?.user?.name}</span>
          <button onClick={() => signOut({ callbackUrl: '/login' })} style={{ background: 'transparent', border: '1px solid var(--border2)', color: 'var(--muted)', padding: '0.4rem 1rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem' }}>
            Sign out
          </button>
        </div>
      </nav>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.5rem', fontWeight: 700, color: 'var(--white)', marginBottom: '0.3rem' }}>
              Good day, {session?.user?.name?.split(' ')[0]}! 👋
            </h1>
            <p style={{ color: 'var(--muted)', fontSize: '0.875rem' }}>Here is what is happening with your business.</p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button onClick={handleExportCSV} style={{ background: 'var(--surface)', border: '1px solid var(--border2)', color: 'var(--text)', padding: '0.6rem 1.2rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500 }}>
              Export CSV
            </button>
            <button onClick={handleAiInsight} disabled={aiLoading || customers.length === 0} style={{ background: 'linear-gradient(135deg, #f59e0b, #ef4444)', color: '#fff', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, opacity: aiLoading ? 0.7 : 1 }}>
              {aiLoading ? 'Thinking...' : '✦ AI Insights'}
            </button>
          </div>
        </div>

        {/* AI Insight Box */}
        {aiInsight && (
          <div style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.08), rgba(139,92,246,0.08))', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '14px', padding: '1.5rem', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <span style={{ color: '#f59e0b', fontSize: '0.8rem' }}>✦</span>
              <span style={{ color: '#f59e0b', fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>AI Business Insight</span>
            </div>
            <p style={{ color: 'var(--text)', fontSize: '0.9rem', lineHeight: 1.8 }}>{aiInsight}</p>
          </div>
        )}

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
          {[
            { label: 'Total Customers', value: customers.length, color: '#06b6d4', icon: '👥' },
            { label: 'Active', value: activeCount, color: '#10b981', icon: '✅' },
            { label: 'VIP', value: vipCount, color: '#8b5cf6', icon: '⭐' },
            { label: 'Total Value', value: `KES ${totalValue.toLocaleString()}`, color: '#f59e0b', icon: '💰' },
          ].map(stat => (
            <div key={stat.label} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', padding: '1.25rem', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: stat.color, opacity: 0.6 }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--muted)', fontWeight: 500 }}>{stat.label}</span>
                <span style={{ fontSize: '1rem' }}>{stat.icon}</span>
              </div>
              <div style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.6rem', fontWeight: 700, color: stat.color }}>{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0', marginBottom: '1.5rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', padding: '4px', width: 'fit-content' }}>
          {(['customers', 'analytics'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{ padding: '0.5rem 1.5rem', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500, textTransform: 'capitalize', background: activeTab === tab ? 'linear-gradient(135deg, #06b6d4, #8b5cf6)' : 'transparent', color: activeTab === tab ? '#fff' : 'var(--muted)', transition: 'all 0.2s', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              {tab}
            </button>
          ))}
        </div>

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', padding: '1.5rem' }}>
              <h3 style={{ color: 'var(--white)', fontSize: '0.9rem', fontWeight: 600, marginBottom: '1.5rem' }}>Revenue over 6 months</h3>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={monthlyData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e2730" />
                  <XAxis dataKey="month" stroke="#546478" fontSize={11} />
                  <YAxis stroke="#546478" fontSize={11} />
                  <Tooltip contentStyle={{ background: '#0d1117', border: '1px solid #1e2730', borderRadius: '8px', color: '#c9d4e0' }} />
                  <Area type="monotone" dataKey="revenue" stroke="#06b6d4" fill="url(#colorRevenue)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', padding: '1.5rem' }}>
              <h3 style={{ color: 'var(--white)', fontSize: '0.9rem', fontWeight: 600, marginBottom: '1.5rem' }}>Customer breakdown</h3>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={3}>
                    {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#0d1117', border: '1px solid #1e2730', borderRadius: '8px', color: '#c9d4e0' }} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' }}>
                {pieData.map(d => (
                  <div key={d.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: d.color }} />
                      <span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>{d.name}</span>
                    </div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--white)', fontWeight: 600 }}>{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Customers Tab */}
        {activeTab === 'customers' && (
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden' }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
              <div>
                <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '1rem', fontWeight: 600, color: 'var(--white)', marginBottom: '0.1rem' }}>All Customers</h2>
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
                  onClick={() => { setShowForm(!showForm); setEditCustomer(null); setForm({ name: '', email: '', phone: '', status: 'active', value: '' }) }}
                  style={{ background: 'linear-gradient(135deg, #06b6d4, #8b5cf6)', color: '#fff', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, whiteSpace: 'nowrap', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
                >
                  {showForm ? '✕ Cancel' : '+ Add Customer'}
                </button>
              </div>
            </div>

            {showForm && (
              <form onSubmit={handleSave} style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', background: 'var(--surface2)', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                {[
                  { key: 'name', label: 'Full Name', type: 'text', placeholder: 'Jane Doe' },
                  { key: 'email', label: 'Email', type: 'email', placeholder: 'jane@example.com' },
                  { key: 'phone', label: 'Phone', type: 'text', placeholder: '+254 700 000000' },
                  { key: 'value', label: 'Value (KES)', type: 'number', placeholder: '5000' },
                ].map(f => (
                  <div key={f.key}>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--muted)', marginBottom: '0.4rem', fontWeight: 500 }}>{f.label}</label>
                    <input type={f.type} placeholder={f.placeholder} value={form[f.key as keyof typeof form]} onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                      style={{ width: '100%', background: 'var(--surface)', border: '1px solid var(--border2)', color: 'var(--white)', padding: '0.65rem 0.9rem', borderRadius: '8px', fontSize: '0.875rem', outline: 'none' }} />
                  </div>
                ))}
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--muted)', marginBottom: '0.4rem', fontWeight: 500 }}>Status</label>
                  <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}
                    style={{ width: '100%', background: 'var(--surface)', border: '1px solid var(--border2)', color: 'var(--white)', padding: '0.65rem 0.9rem', borderRadius: '8px', fontSize: '0.875rem', outline: 'none' }}>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="vip">VIP</option>
                  </select>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                  <button type="submit" disabled={saving}
                    style={{ width: '100%', background: 'linear-gradient(135deg, #10b981, #06b6d4)', color: '#fff', border: 'none', padding: '0.65rem', borderRadius: '8px', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1, fontWeight: 600, fontSize: '0.875rem', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                    {saving ? 'Saving...' : editCustomer ? 'Update Customer' : 'Save Customer'}
                  </button>
                </div>
              </form>
            )}

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
                    {['Customer', 'Email', 'Phone', 'Status', 'Value', 'Added', 'Actions'].map(h => (
                      <th key={h} style={{ padding: '0.9rem 1.5rem', textAlign: 'left', color: 'var(--muted)', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((c, i) => (
                    <tr key={c.id} style={{ borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none' }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface2)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
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
                      <td style={{ padding: '1rem 1.5rem', color: 'var(--white)', fontSize: '0.875rem', fontWeight: 500 }}>KES {c.value.toLocaleString()}</td>
                      <td style={{ padding: '1rem 1.5rem', color: 'var(--muted)', fontSize: '0.8rem' }}>{new Date(c.createdAt).toLocaleDateString()}</td>
                      <td style={{ padding: '1rem 1.5rem' }}>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button onClick={() => handleEdit(c)} style={{ background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.2)', color: '#06b6d4', padding: '4px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 500 }}>
                            Edit
                          </button>
                          <button onClick={() => handleDelete(c.id)} style={{ background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.2)', color: '#f43f5e', padding: '4px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 500 }}>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  )
}