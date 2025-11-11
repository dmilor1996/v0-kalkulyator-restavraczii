"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Copy } from "lucide-react"
import { useState } from "react"
import { RestorationCountertopItem } from "./restoration-countertop-item"
import type { PricingConfig } from "@/lib/pricing-types"

interface RestorationCalculatorProps {
  countertops: any[]
  setCountertops: (countertops: any[]) => void
  pricing: PricingConfig | null
}

export function RestorationCalculator({ countertops, setCountertops, pricing }: RestorationCalculatorProps) {
  const [quantity, setQuantity] = useState(1)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const addCountertop = () => {
    setCountertops([
      ...countertops,
      {
        id: Date.now(),
        length: "",
        width: "",
        material: "solid",
        milling: false,
        coating: "oil",
      },
    ])
  }

  const addMultipleCountertops = () => {
    const newCountertops = Array.from({ length: quantity }, () => ({
      id: Date.now() + Math.random(),
      length: "",
      width: "",
      material: "solid",
      milling: false,
      coating: "oil",
    }))
    setCountertops([...countertops, ...newCountertops])
    setIsDialogOpen(false)
    setQuantity(1)
  }

  const updateCountertop = (id: number, updates: any) => {
    setCountertops(countertops.map((c) => (c.id === id ? { ...c, ...updates } : c)))
  }

  const removeCountertop = (id: number) => {
    setCountertops(countertops.filter((c) => c.id !== id))
  }

  return (
    <Card className="card-shadow border-border/50 hover:card-shadow-hover transition-all duration-300 animate-fade-in">
      <CardHeader className="pb-4">
        <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Реставрация столешниц
        </CardTitle>
        <CardDescription className="text-base mt-2">
          Добавьте столешницы для реставрации и выберите параметры обработки
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {countertops.map((countertop, index) => (
          <div
            key={countertop.id}
            className="animate-in fade-in slide-in-from-top-4 duration-300"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <RestorationCountertopItem
              countertop={countertop}
              index={index}
              onUpdate={updateCountertop}
              onRemove={removeCountertop}
              pricing={pricing}
            />
          </div>
        ))}

        <div className="flex gap-3">
          <Button
            onClick={addCountertop}
            variant="outline"
            className="flex-1 border-2 border-dashed border-border/50 hover:border-primary/50 hover:bg-primary/5 bg-transparent transition-all duration-300 hover-lift"
          >
            <Plus className="mr-2 h-5 w-5" />
            Добавить столешницу
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all">
                <Copy className="mr-2 h-5 w-5" />
                Несколько
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Добавить несколько столешниц</DialogTitle>
                <DialogDescription>
                  Все столешницы будут созданы с одинаковыми начальными параметрами. Вы сможете изменить параметры каждой отдельно после добавления.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="quantity">Количество столешниц</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    max="50"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, Math.min(50, Number.parseInt(e.target.value) || 1)))}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Отмена
                </Button>
                <Button onClick={addMultipleCountertops}>
                  Добавить {quantity} {quantity === 1 ? "столешницу" : quantity < 5 ? "столешницы" : "столешниц"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  )
}
