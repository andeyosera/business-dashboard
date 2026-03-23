import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const customers = await prisma.customer.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(customers)
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const { name, email, phone, status, value } = await req.json()

  if (!name || !email) {
    return NextResponse.json({ message: 'Name and email are required.' }, { status: 400 })
  }

  const customer = await prisma.customer.create({
    data: {
      name, email,
      phone: phone || null,
      status: status || 'active',
      value: value || 0,
      userId: session.user.id,
    },
  })

  return NextResponse.json(customer, { status: 201 })
}