// /app/api/transactions/route.ts
import { NextResponse } from 'next/server'
import {prisma} from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get('categoryId') ?? undefined

    const transactions = await prisma.transaction.findMany({
      where: categoryId ? { categoryId } : undefined,
      include: { category: true },
      orderBy: { date: 'desc' },
      // take: 10,
    })

    return NextResponse.json(transactions)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { amount, description, type, date, categoryId } = await request.json()

    // 1) Create the transaction
    const tx = await prisma.transaction.create({
      data: {
        amount: parseFloat(amount),
        description,
        type,
        date: new Date(date),
        ...(categoryId ? { category: { connect: { id: categoryId } } } : {}),
      },
      include: { category: true },
    })

    // 2) Update the central balance
    const delta = type === 'income' ? tx.amount : -tx.amount
    await prisma.balance.update({
      where: { id: 'main-balance' },      // your seeded balance ID
      data: { amount: { increment: delta } },
    })

    return NextResponse.json(tx)
  } catch (error) {
    console.error('Failed to create transaction:', error)
    return NextResponse.json({ error: 'Failed to create transaction' }, { status: 500 })
  }
}
