'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Card, CardHeader, CardTitle, CardContent,
} from '@/components/ui/card';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { cn, formatCurrency, formatDate } from '@/lib/utils';

interface Transaction {
  id: string;
  amount: number;
  date: string;
  description: string;
  type:string;
}

interface Category {
  id: string;
  name: string;
}

export default function ExpenseDetailPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();

  const [category, setCategory] = useState<Category | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        // 1) fetch category
        const catRes = await fetch(`/api/categories/${id}`);
        if (!catRes.ok) throw new Error('Category not found');
        const catData: Category = await catRes.json();
        setCategory(catData);

        // 2) fetch only this category's transactions
        const txRes = await fetch(`/api/categories/${id}/transactions`);
        if (!txRes.ok) throw new Error('Failed to load transactions');
        const txData: Transaction[] = await txRes.json();
        setTransactions(txData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    }

    if (id) loadData();
  }, [id]);

  const total = transactions.reduce((sum, t) => sum + t.amount, 0);
  const average = transactions.length ? total / transactions.length : 0;

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
          <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
          <h2 className="text-2xl font-bold mb-2">{error}</h2>
          <Button
            onClick={() => router.back()}
            variant="outline"
            className="mt-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            ወደ ኋላ ተመለስ
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
     

      {loading || !category ? (
        <div className="space-y-6">
          <Skeleton className="h-8 w-64" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
          <Skeleton className="h-64 w-full" />
        </div>
      ) : (
        <>

         <Button
        onClick={() => router.back()}
        variant="default"
        className="gap-1 center"
      >
        <ArrowLeft className="w-4 h-4" />
        ወደ ኋላ ተመለስ
      </Button>
          {/* Header */}
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold flex items-center gap-3">
              {category.name}
              <Badge variant="secondary" className="text-sm">
                {transactions.length} ዝውውር
              </Badge>
            </h1>
           
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader><CardTitle>አጠቃላይ ወጪ </CardTitle></CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {formatCurrency(total)} ብር
                </div>
              </CardContent>
            </Card>
            {/* <Card>
              <CardHeader><CardTitle>Average Transaction</CardTitle></CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {formatCurrency(average)}
                </div>
              </CardContent>
            </Card> */}
            <Card>
              <CardHeader><CardTitle>የመጨረሻ ዝውውር </CardTitle></CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-700">
                  {transactions.length
                    ? formatDate(transactions[0].date)
                    : 'ምንም የለም'}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Transaction History */}
          <Card className="w-full">
            <CardHeader>
              <CardTitle>የ ወጪ ዝውውር መረጃ ታሪክ </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {transactions.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                 ምንም አይነት ወጪ ዝውውር የለም 
                </div>
              ) : (
                <div className="w-full overflow-x-auto">
                  <Table className="min-w-[600px] lg:min-w-full">
                    <TableHeader className="bg-muted">
                      <TableRow>
                        <TableHead className="text-lg md:text-base px-4 md:px-6 w-[140px]">ቀን</TableHead>
                        <TableHead className="text-lg md:text-base px-4 md:px-6 min-w-[200px]">ወጪ የተደረገበት ምክንያት</TableHead>
                        <TableHead className="text-lg md:text-base px-4 md:px-6 text-right w-[140px]">የብር መጠን </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactions.map((tx) => (
                        <TableRow 
                          key={tx.id}
                          className="hover:bg-muted/50 transition-colors"
                        >
                          <TableCell className="py-4 md:py-3 px-4 md:px-6">
                            <div className="text-base md:text-sm">
                              {formatDate(tx.date)}
                            </div>
                          </TableCell>
                          <TableCell className="py-4 md:py-3 px-4 md:px-6 max-w-[300px]">
                            <div className="text-base md:text-sm font-medium truncate">
                              {tx.description || 'No description'}
                            </div>
                          </TableCell>
                          <TableCell className="py-4 md:py-3 px-4 md:px-6 text-right">
                            <div className={cn(
                              "text-lg md:text-base font-semibold",
                              tx.type === 'income' 
                                ? 'text-green-600 dark:text-green-400' 
                                : 'text-red-600 dark:text-red-400'
                            )}>
                              {tx.type === 'expense' && '-'}
                              {formatCurrency(tx.amount)} ብር
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
