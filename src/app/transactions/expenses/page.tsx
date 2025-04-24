'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useParams, useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ArrowRight, WalletCards } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
}

interface Transaction {
  id: string;
  amount: number;
  categoryId: string;
  date: string;
}

export default function ExpenseCategoriesPage() {
    const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [catRes, txRes] = await Promise.all([
          fetch('/api/categories'),
          fetch('/api/transactions'),
        ]);
        
        if (!catRes.ok || !txRes.ok) throw new Error('Failed to fetch data');
        
        const [cats, txs] = await Promise.all([catRes.json(), txRes.json()]);
        setCategories(cats.filter((c: Category) => c.type === 'expense'));
        setTransactions(txs);
      } catch (err) {
        setError('Failed to load data. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const totals = categories.map((cat) => ({
    ...cat,
    total: transactions
      .filter((t) => t.categoryId === cat.id)
      .reduce((acc, t) => acc + t.amount, 0),
    count: transactions.filter((t) => t.categoryId === cat.id).length,
    lastTransaction: transactions
      .filter((t) => t.categoryId === cat.id)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]?.date,
  }));

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 text-center">
        <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-lg">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <WalletCards className="w-8 h-8 text-red-600" />
          የወጪ መረጃ ዝርዝር 
        </h1>
        <Button
        onClick={() => router.back()}
        variant="default"
        className="gap-1"
      >
        <ArrowLeft className="w-4 h-4" />
        ወደ ኋላ ተመለስ
      </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-6">
          {totals.map((cat) => (
            <Link key={cat.id} href={`/transactions/expenses/${cat.id}`}>
              <Card className="hover:shadow-lg transition-shadow h-full">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{cat.name}</CardTitle>
                    <Badge variant="outline" className="gap-1">
                      {cat.count}
                      <ArrowRight className="w-4 h-4" />
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-red-600 dark:text-red-400">
                      {(cat.total.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }))} ብር
                    </span>
                  </div>
                  {cat.lastTransaction && (
                    <p className="text-sm text-muted-foreground mt-2">
                      የመጨረሻ: {formatDate(cat.lastTransaction)}
                    </p>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}