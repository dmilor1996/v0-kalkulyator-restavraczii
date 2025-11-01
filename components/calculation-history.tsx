"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Clock, Trash2, ChevronDown, ChevronUp } from "lucide-react"
import { getSavedCalculations, deleteCalculation, type SavedCalculation } from "@/lib/storage"
import { useState, useEffect } from "react"

interface CalculationHistoryProps {
  onLoad: (calculation: SavedCalculation) => void
}

export function CalculationHistory({ onLoad }: CalculationHistoryProps) {
  const [calculations, setCalculations] = useState<SavedCalculation[]>([])
  const [isOpen, setIsOpen] = useState(false) // Added state to control visibility

  useEffect(() => {
    setCalculations(getSavedCalculations())
  }, [])

  const handleToggle = () => {
    if (!isOpen) {
      setCalculations(getSavedCalculations())
    }
    setIsOpen(!isOpen)
  }

  const handleDelete = (id: string) => {
    deleteCalculation(id)
    setCalculations(getSavedCalculations())
  }

  const handleLoad = (calc: SavedCalculation) => {
    onLoad(calc)
    setIsOpen(false) // Close history after loading
  }

  if (calculations.length === 0) {
    return null
  }

  return (
    <Card className="bg-secondary/30">
      <CardHeader className="cursor-pointer" onClick={handleToggle}>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-5 w-5" />
            История расчетов ({calculations.length})
          </CardTitle>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>
      {isOpen && (
        <CardContent className="space-y-2">
          {calculations.map((calc) => (
            <div
              key={calc.id}
              className="flex items-center justify-between p-3 bg-card rounded-lg border border-border hover:border-primary/50 transition-colors"
            >
              <button
                onClick={() => handleLoad(calc)}
                className="flex-1 text-left hover:text-primary transition-colors"
              >
                <div className="font-medium">{calc.total.toLocaleString("ru-RU")} ₽</div>
                <div className="text-xs text-muted-foreground">
                  {new Date(calc.timestamp).toLocaleString("ru-RU", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                onClick={() => handleDelete(calc.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </CardContent>
      )}
    </Card>
  )
}
