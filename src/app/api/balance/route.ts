// /app/api/balance/route.ts
import { NextResponse } from 'next/server'
import {prisma} from '@/lib/prisma'

export async function GET() {
  try {
    // fetch the singleton balance row by its known ID
    const bal = await prisma.balance.findUniqueOrThrow({
      where: { id: 'main-balance' },
    })
    return NextResponse.json({
      amount: bal.amount,
      updatedAt: bal.updatedAt,
    })
  } catch (error) {
    console.error('Failed to fetch balance:', error)
    return NextResponse.json(
      { error: 'Failed to fetch balance' },
      { status: 500 }
    )
  }
}
