'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { WalletCards, Coins, Type, ListFilter, CalendarIcon, PlusIcon } from 'lucide-react'
import { CategoryForm } from './CategoryForm'
import { ScrollArea } from '@/components/ui/scroll-area'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

// Import react-datepicker
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'

export default function TransactionForm() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [categories, setCategories] = useState<any[]>([])
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    date: new Date(),
    type: 'expense' as 'income' | 'expense',
    categoryId: '',
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) fetchCategories()
  }, [open, formData.type])

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories')
      const data = await res.json()
      setCategories(data)
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    toast.promise(
      (async () => {
        const res = await fetch('/api/transactions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...formData,
            amount: parseFloat(formData.amount),
            date: formData.date.toISOString(),
          }),
        })

        if (!res.ok) throw new Error('Failed to create transaction')

        setOpen(false)
        window.location.reload()
      })(),
      {
        loading: 'Creating transaction...',
        success: 'Transaction created successfully!',
        error: (error) => error.message || 'Failed to create transaction',
        finally: () => setLoading(false),
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <PlusIcon className="h-4 w-4" />
          <span className="sm:inline">አዲስ አስገባ</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md lg:max-w-lg">
        <ScrollArea className="max-h-[80vh] pr-4">
          <DialogHeader className="border-b pb-4">
            <DialogTitle className="flex items-center gap-2">
              <WalletCards className="h-5 w-5" />
              <span className="font-semibold">አዲስ ዝርዝር አስገባ</span>
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6 pt-4">
            {/* Amount & Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="amount" className="flex items-center gap-2">
                  <Coins className="h-4 w-4 text-muted-foreground" />
                  የብር መጠን
                </Label>
                <Input
                  id="amount"
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData(f => ({ ...f, amount: e.target.value }))}
                  placeholder="0.00"
                  className="text-lg font-medium"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                  ቀን
                </Label>
                <DatePicker
                  selected={formData.date}
                  onChange={(date) => date && setFormData(f => ({ ...f, date }))}
                  dateFormat="yyyy/MM/dd"
                  className="w-full py-2 px-3 border rounded"
                  placeholderText="Select date"
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="flex items-center gap-2">
                <Type className="h-4 w-4 text-muted-foreground" />
                ዝርዝር ምክንያት
              </Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(f => ({ ...f, description: e.target.value }))}
                placeholder=" ዝርዝር ምክንያት እዚ አስገባ ..."
                required
              />
            </div>

            {/* Type & Category */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <ListFilter className="h-4 w-4 text-muted-foreground" />
                  አይነት
                </Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData(f => ({ ...f, type: value as any }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="income" className="flex items-center gap-2">
                      <span className="text-green-600">ገቢ</span>
                    </SelectItem>
                    <SelectItem value="expense" className="flex items-center gap-2">
                      <span className="text-red-600">ወጪ</span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label className="flex items-center gap-2">
                    <ListFilter className="h-4 w-4 text-muted-foreground" />
                    ለምን ምክንያት
                  </Label>
                  <CategoryForm
                    onSuccess={(newCat) => {
                      setCategories(prev => [...prev, newCat])
                      setFormData(f => ({ ...f, categoryId: newCat.id }))
                      toast.success(`Category "${newCat.name}" created`)
                    }}
                  />
                </div>
                <Select
                  value={formData.categoryId}
                  onValueChange={(value) => setFormData(f => ({ ...f, categoryId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="ምክንያት ምረጥ" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        <span className="font-medium">{cat.name}</span>
                        <span className="ml-2 text-xs text-muted-foreground">
                          ({cat.type})
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  እያስገባ ነው...
                </div>
              ) : (
                'አስገባ'
              )}
            </Button>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
