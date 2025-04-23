'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import TransactionForm from '@/components/TransactionForm'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { PlusIcon, MinusIcon } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface Transaction {
  id: string
  amount: number
  description: string
  date: string
  type: 'income' | 'expense'
  category: { id: string; name: string } | null
}

export default function Home() {
  const router = useRouter()

  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [balance, setBalance] = useState<number | null>(null)
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null)
  const [loadingTx, setLoadingTx] = useState(true)
  const [loadingBal, setLoadingBal] = useState(true)
  const loading = loadingTx || loadingBal

  // fetch transactions
  useEffect(() => {
    fetch('/api/transactions')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch transactions')
        return res.json()
      })
      .then((data: Transaction[]) => setTransactions(data))
      .catch(console.error)
      .finally(() => setLoadingTx(false))
  }, [])

  // fetch central balance
  useEffect(() => {
    fetch('/api/balance')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch balance')
        return res.json()
      })
      .then((data: { amount: number }) => setBalance(data.amount))
      .catch(console.error)
      .finally(() => setLoadingBal(false))
  }, [])

  // color lookup for cards
  const colorClasses = {
    green: { bg: 'bg-green-50', text: 'text-green-800', value: 'text-green-600' },
    red:   { bg: 'bg-red-50',   text: 'text-red-800',   value: 'text-red-600'   },
    blue:  { bg: 'bg-blue-50',  text: 'text-blue-800',  value: 'text-blue-600'  },
  }

  // show skeleton placeholders while loading
  if (loading) {
    return (
      <div className="space-y-8">
        {/* Header skeleton */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          <Skeleton className="h-10 w-1/3" />
          <div className="flex space-x-2">
            {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-10 w-32" />)}
          </div>
        </div>

        {/* Summary skeletons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-lg" />
          ))}
        </div>

        {/* Table skeletons */}
        <div className="overflow-x-auto border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead><Skeleton className="h-6 w-20" /></TableHead>
                <TableHead><Skeleton className="h-6 w-32" /></TableHead>
                <TableHead className="text-right"><Skeleton className="h-6 w-20" /></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-full" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-6 w-24" /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    )
  }

  // compute totals
  const totalIncome  = transactions.filter(t => t.type === 'income' ).reduce((s,t) => s + t.amount, 0)
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((s,t) => s + t.amount, 0)
  const remaining    = balance ?? (totalIncome - totalExpense)

  return (
    <div className="space-y-8">
      {/* Header & actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <h1 className="text-3xl font-bold">የ ባባ ገቢ እና ወጪ ማህደር</h1>
        <div className="mt-4 sm:mt-0 flex space-x-2">
          <TransactionForm />
          <Button
            onClick={() => router.push('/transactions/incomes')}
            variant="outline"
            className="border-green-500 text-green-500 hover:bg-green-50 font-bold"
          >ገቢዎች</Button>
          <Button
            onClick={() => router.push('/transactions/expenses')}
            variant="outline"
            className="border-red-500 text-red-500 hover:bg-red-50 font-bold"
          >ወጪዎች</Button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {[
          { title: 'አጠቃላይ ገቢ', value: totalIncome,  color: 'green' },
          { title: 'አጠቃላይ ወጪ', value: totalExpense, color: 'red'   },
          { title: 'ቀሪ ብር',      value: remaining,    color: 'blue'  },
        ].map(({ title, value, color }) => {
          const c = colorClasses[color as keyof typeof colorClasses]
          return (
            <div key={title} className={`${c.bg} p-6 rounded-lg shadow ${c.text}`}>
              <h2 className="text-lg font-medium">{title}</h2>
              <p className={`mt-2 text-2xl font-bold ${c.value}`}>
                {value.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>
          )
        })}
      </div>

      {/* Transactions table */}
      <div className="overflow-x-auto border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-32 font-bold">ቀን</TableHead>
              <TableHead className="font-bold">ምክንያት</TableHead>
              <TableHead className="text-right w-32 font-bold">የብር መጠን</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((tx) => (
              <TableRow
                key={tx.id}
                className="cursor-pointer hover:bg-gray-100"
                onClick={() => setSelectedTx(tx)}
              >
                <TableCell>{format(new Date(tx.date), 'P')}</TableCell>
                <TableCell>{tx.category?.name ?? 'Uncategorized'}</TableCell>
                <TableCell
                  className={cn(
                    'text-right font-semibold flex justify-end items-center',
                    tx.type === 'income' ? 'text-green-600' : 'text-red-600'
                  )}
                >
                  {tx.type === 'income' ? (
                    <PlusIcon className="w-4 h-4 mr-1" />
                  ) : (
                    <MinusIcon className="w-4 h-4 mr-1" />
                  )}
                  {tx.amount.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

     {/* Detail dialog */}
     {selectedTx && (
        <Dialog open onOpenChange={() => setSelectedTx(null)}>
          <DialogContent className="sm:max-w-md">
            {/* Accessible header with just the title */}
            <DialogHeader className="p-4 pb-2">
              <DialogTitle>ዝርዝር  መረጃ </DialogTitle>
            </DialogHeader>

            {/* Details Grid */}
            <div className="px-4 pb-6 grid grid-cols-2 gap-4">
              {/* Date */}
              <dt className="text-sm text-gray-500">ቀን</dt>
              <dd className="font-medium">
                {format(new Date(selectedTx.date), 'PPP')}
              </dd>

              {/* Type */}
              <dt className="text-sm text-gray-500">አይነት</dt>
              <dd>
                <Badge
                  variant={selectedTx.type === 'income' ? 'default' : 'destructive'}
                  className="uppercase px-2 py-1 text-xs"
                >
                  {selectedTx.type === 'income' ? 'ገቢ' : 'ወጪ'}
                </Badge>
              </dd>

              {/* Category */}
              <dt className="text-sm text-gray-500">ምክንያት </dt>
              <dd className="font-medium">
                {selectedTx.category?.name ?? 'አይነት አልወጣም'}
              </dd>

              {/* Amount */}
              <dt className="text-sm text-gray-500">የብር መጠን </dt>
              <dd
                className={cn(
                  'flex items-center font-bold',
                  selectedTx.type === 'income'
                    ? 'text-green-600'
                    : 'text-red-600'
                )}
              >
                {selectedTx.type === 'income' ? (
                  <PlusIcon className="w-2 h-2 mr-1" />
                ) : (
                  <MinusIcon className="w-2 h-2 mr-1" />
                )}
                {selectedTx.amount.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </dd>

              {/* Description */}
              {selectedTx.description && (
                <>
                  <dt className="text-sm text-gray-500">ዝርዝር ምክንያት </dt>
                  <dd className="col-span-1 md:col-span-2">{selectedTx.description}</dd>
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

    </div>
  )
}
