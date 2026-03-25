import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const { name, email, phone, status, value } = await req.json()

  const customer = await prisma.customer.updateMany({
    where: { id: params.id, userId: session.user.id },
    data: { name, email, phone, status, value: parseFloat(value) || 0 },
  })

  return NextResponse.json(customer)
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  await prisma.customer.deleteMany({
    where: { id: params.id, userId: session.user.id },
  })

  return NextResponse.json({ message: 'Customer deleted.' })
}