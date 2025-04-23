'use client'

import { useState } from 'react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { PlusIcon } from 'lucide-react'

interface Category {
  id: string
  name: string
  type: 'income' | 'expense'
}

export function CategoryForm({
  onSuccess,
}: {
  onSuccess: (category: Category) => void
}) {
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({ name: '', type: 'expense' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      const newCategory: Category = await res.json()
      onSuccess(newCategory)
      setOpen(false)
      setFormData({ name: '', type: 'expense' })
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <PlusIcon className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>አዲስ ዝርዝር ምክንያት ፍጠር </DialogTitle>
        </DialogHeader>
        {/* NO nested <form> here — just a div */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">የ ምክንያቱ ስያሜ </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData((f) => ({ ...f, name: e.target.value }))
              }
              required
            />
          </div>
          <div className="space-y-2">
            <Label>አይነቱአይነቱ</Label>
            <Select
              value={formData.type}
              onValueChange={(value) =>
                setFormData((f) => ({ ...f, type: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="income">ገቢ</SelectItem>
                <SelectItem value="expense">ወጪ </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button
            type="button"
            className="w-full"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? 'Saving…' : 'ፍጠር '}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
