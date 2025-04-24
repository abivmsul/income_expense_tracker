'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, WalletCards, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatDate } from '@/lib/utils';

interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
}

interface Transaction {
  id: string;
  amount: number;
  date: string;
  categoryId: string;
}

export default function IncomeCategoriesPage() {
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
        const [cats, txs]: [Category[], Transaction[]] = await Promise.all([
          catRes.json(),
          txRes.json(),
        ]);
        setCategories(cats.filter((c) => c.type === 'income'));
        setTransactions(txs);
      } catch (err) {
        console.error(err);
        setError('Failed to load data. Please try again later.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const stats = categories.map((cat) => {
    const catTxs = transactions.filter((t) => t.categoryId === cat.id);
    const total = catTxs.reduce((sum, t) => sum + t.amount, 0);
    const count = catTxs.length;
    const lastDate = count
      ? catTxs
          .map((t) => t.date)
          .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0]
      : null;
    return { ...cat, total, count, lastDate };
  });

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
          <WalletCards className="w-8 h-8 text-green-600" />
          የገቢ መረጃ ዝርዝር
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
          {stats.map((cat) => (
            <Link
              key={cat.id}
              href={`/transactions/incomes/${cat.id}`}
              className="block h-full"
            >
              <Card className="h-full hover:shadow-lg transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{cat.name} </CardTitle>
                    <Badge variant="outline" className="gap-1">
                      {cat.count}
                      <ArrowRight className="w-4 h-4" />
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-green-600">
                      {(cat.total.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }))} ብር
                    </span>
                  </div>
                  {cat.lastDate && (
                    <p className="text-sm text-muted-foreground mt-2">
                      የመጨረሻ: {formatDate(cat.lastDate)}
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
