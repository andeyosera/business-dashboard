import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const { summary, business } = await req.json()

  const prompt = `You are a business analyst AI. Analyze this business data for "${business}" and give ONE concise, actionable insight in 2-3 sentences. Be specific and practical.

Data:
- Total customers: ${summary.total}
- Active customers: ${summary.active}
- VIP customers: ${summary.vip}
- Inactive customers: ${summary.inactive}
- Total customer value: KES ${summary.totalValue.toLocaleString()}
- Average customer value: KES ${Math.round(summary.avgValue).toLocaleString()}

Give a specific business insight and one actionable recommendation.`

  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 150,
      }),
    })

    const data = await res.json()
    console.log('Groq response:', JSON.stringify(data))
    const insight = data.choices?.[0]?.message?.content || 'Unable to generate insight at this time.'
    return NextResponse.json({ insight })
  } catch (err) {
    console.error('Groq error:', err)
    return NextResponse.json({ insight: 'AI insights temporarily unavailable.' })
  }
}