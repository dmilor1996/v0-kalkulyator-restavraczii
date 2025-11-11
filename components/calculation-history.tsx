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
    <Card className="card-shadow border-border/50 bg-secondary/20 hover:card-shadow-hover transition-all duration-300 animate-fade-in">
      <CardHeader className="cursor-pointer pb-4" onClick={handleToggle}>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold flex items-center gap-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            <Clock className="h-5 w-5 text-primary" />
            История расчетов ({calculations.length})
          </CardTitle>
          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/10 transition-all">
            {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>
      {isOpen && (
        <CardContent className="space-y-3">
          {calculations.map((calc) => (
            <div
              key={calc.id}
              className="flex items-center justify-between p-4 bg-card rounded-xl border border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 hover-lift card-shadow"
            >
              <button
                onClick={() => handleLoad(calc)}
                className="flex-1 text-left hover:text-primary transition-colors"
              >
                <div className="font-bold text-lg bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  {calc.total.toLocaleString("ru-RU")} ₽
                </div>
                <div className="text-xs text-muted-foreground mt-1">
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
                className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
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
