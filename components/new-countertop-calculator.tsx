"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { NewCountertopItem } from "./new-countertop-item"
import type { PricingConfig } from "@/lib/pricing-types"

interface NewCountertopCalculatorProps {
  countertops: any[]
  setCountertops: (countertops: any[]) => void
  pricing: PricingConfig | null
}

export function NewCountertopCalculator({ countertops, setCountertops, pricing }: NewCountertopCalculatorProps) {
  const addCountertop = () => {
    setCountertops([
      ...countertops,
      {
        id: Date.now(),
        length: "",
        width: "",
        thickness: "40",
        type: "solid-lamella",
        coating: "oil",
        cutouts: 0,
      },
    ])
  }

  const updateCountertop = (id: number, updates: any) => {
    setCountertops(countertops.map((c) => (c.id === id ? { ...c, ...updates } : c)))
  }

  const removeCountertop = (id: number) => {
    setCountertops(countertops.filter((c) => c.id !== id))
  }

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle className="text-2xl">Изготовление новых столешниц</CardTitle>
        <CardDescription className="text-base">Добавьте столешницы для изготовления из дуба</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {countertops.map((countertop, index) => (
          <NewCountertopItem
            key={countertop.id}
            countertop={countertop}
            index={index}
            onUpdate={updateCountertop}
            onRemove={removeCountertop}
            pricing={pricing}
          />
        ))}

        <Button
          onClick={addCountertop}
          variant="outline"
          className="w-full border-2 border-dashed hover:border-primary hover:bg-secondary bg-transparent"
        >
          <Plus className="mr-2 h-5 w-5" />
          Добавить столешницу
        </Button>
      </CardContent>
    </Card>
  )
}
