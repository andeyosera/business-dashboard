import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(req: Request) {
  try {
    const { name, email, password, business } = await req.json()

    if (!name || !email || !password || !business) {
      return NextResponse.json({ message: 'All fields are required.' }, { status: 400 })
    }

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ message: 'Email already in use.' }, { status: 409 })
    }

    const hashed = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({
      data: { name, email, password: hashed, business },
    })

    return NextResponse.json(
      { message: 'Account created!', user: { id: user.id, email: user.email } },
      { status: 201 }
    )
  } catch {
    return NextResponse.json({ message: 'Server error.' }, { status: 500 })
  }
}