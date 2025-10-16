"use client"

import { useState, useEffect } from "react"
import { RestorationCalculator } from "@/components/restoration-calculator"
import { NewCountertopCalculator } from "@/components/new-countertop-calculator"
import { TotalSummary } from "@/components/total-summary"
import { CalculationHistory } from "@/components/calculation-history"
import { MessageCircle, Phone } from "lucide-react"
import type { SavedCalculation } from "@/lib/storage"

export default function Home() {
  const [restorationCountertops, setRestorationCountertops] = useState<any[]>([])
  const [newCountertops, setNewCountertops] = useState<any[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleLoadCalculation = (calc: SavedCalculation) => {
    setRestorationCountertops(calc.restorationCountertops)
    setNewCountertops(calc.newCountertops)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  if (!mounted) {
    return null
  }

  return (
    <main className="min-h-screen bg-background py-4 sm:py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-3 text-balance">
            Калькулятор стоимости столешниц
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground text-pretty">
            Рассчитайте стоимость реставрации и изготовления столешниц из дуба
          </p>
        </header>

        <div className="space-y-6 sm:space-y-8">
          <CalculationHistory onLoad={handleLoadCalculation} />

          <RestorationCalculator countertops={restorationCountertops} setCountertops={setRestorationCountertops} />

          <NewCountertopCalculator countertops={newCountertops} setCountertops={setNewCountertops} />

          <TotalSummary restorationCountertops={restorationCountertops} newCountertops={newCountertops} />
        </div>

        <footer className="mt-12 sm:mt-16 pt-6 sm:pt-8 border-t border-border">
          <div className="text-center space-y-3">
            <p className="text-sm text-muted-foreground">Разработано</p>
            <p className="font-semibold text-base sm:text-lg">Лоренцсон Дмитрий</p>
            <div className="flex items-center justify-center gap-3 sm:gap-4 flex-wrap text-sm sm:text-base">
              <a
                href="tel:+79817382028"
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <Phone className="h-4 w-4" />
                <span>+7-981-738-20-28</span>
              </a>
              <a
                href="https://t.me/dmilor"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <MessageCircle className="h-4 w-4" />
                <span>Telegram</span>
              </a>
              <a
                href="https://wa.me/79817382028"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <MessageCircle className="h-4 w-4" />
                <span>WhatsApp</span>
              </a>
            </div>
          </div>
        </footer>
      </div>
    </main>
  )
}
