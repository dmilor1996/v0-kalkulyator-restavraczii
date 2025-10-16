"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { RestorationCountertopItem } from "./restoration-countertop-item"

interface RestorationCalculatorProps {
  countertops: any[]
  setCountertops: (countertops: any[]) => void
}

export function RestorationCalculator({ countertops, setCountertops }: RestorationCalculatorProps) {
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

  const updateCountertop = (id: number, updates: any) => {
    setCountertops(countertops.map((c) => (c.id === id ? { ...c, ...updates } : c)))
  }

  const removeCountertop = (id: number) => {
    setCountertops(countertops.filter((c) => c.id !== id))
  }

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle className="text-2xl">Реставрация столешниц</CardTitle>
        <CardDescription className="text-base">
          Добавьте столешницы для реставрации и выберите параметры обработки
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {countertops.map((countertop, index) => (
          <RestorationCountertopItem
            key={countertop.id}
            countertop={countertop}
            index={index}
            onUpdate={updateCountertop}
            onRemove={removeCountertop}
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
