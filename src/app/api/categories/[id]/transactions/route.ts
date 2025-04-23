// /app/api/categories/[id]/transactions/route.ts
import { NextResponse } from 'next/server'
import {prisma} from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const txs = await prisma.transaction.findMany({
      where: { categoryId: params.id },
      orderBy: { date: 'desc' },
      include: { category: true },
    })
    return NextResponse.json(txs)
  } catch (error) {
    console.error('Error fetching category transactions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch transactions for this category' },
      { status: 500 }
    )
  }
}
