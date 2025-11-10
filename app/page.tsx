"use client"

import { useState, useEffect, useCallback, useRef, Suspense } from "react"
import { MaterialSearch } from "@/components/material-search"
import { RestorationCalculator } from "@/components/restoration-calculator"
import { NewCountertopCalculator } from "@/components/new-countertop-calculator"
import { TotalSummary } from "@/components/total-summary"
import { CalculationHistory } from "@/components/calculation-history"
import { AdminPanel } from "@/components/admin-panel"
import { MessageCircle, Phone } from "lucide-react"
import type { SavedCalculation } from "@/lib/storage"
import type { PricingConfig } from "@/lib/pricing-types"

interface Countertop {
  length: string
  width: string
  thickness: string
  type: string
  [key: string]: any
}

export default function Home() {
  const [restorationCountertops, setRestorationCountertops] = useState<Countertop[]>([])
  const [newCountertops, setNewCountertops] = useState<Countertop[]>([])
  const [mounted, setMounted] = useState(false)
  const [showAdminPanel, setShowAdminPanel] = useState(false)
  const [clickCount, setClickCount] = useState(0)
  const [pricing, setPricing] = useState<PricingConfig | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    setMounted(true)
    loadPricing()
  }, [])

  const loadPricing = useCallback(async () => {
    try {
      const response = await fetch("/api/pricing")
      const data = await response.json()
      setPricing(data)
    } catch (error) {
      console.error("Error loading pricing:", error)
    }
  }, [])

  const handleLoadCalculation = useCallback((calc: SavedCalculation) => {
    setRestorationCountertops(calc.restorationCountertops)
    setNewCountertops(calc.newCountertops)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }, [])

  const handleTitleClick = useCallback(() => {
    setClickCount((prev) => {
      const newCount = prev + 1
      if (newCount === 3) {
        setShowAdminPanel(true)
        return 0
      }
      return newCount
    })

    // Очищаем предыдущий timeout, если он есть
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    // Устанавливаем новый timeout
    timeoutRef.current = setTimeout(() => setClickCount(0), 1000)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <main className="min-h-screen bg-background py-4 sm:py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8 sm:mb-12 relative">
          <h1
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-3 text-balance cursor-pointer select-none"
            onClick={handleTitleClick}
          >
            Калькулятор стоимости столешниц
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground text-pretty">
            Найдите материалы у поставщиков и рассчитайте стоимость с наценкой
          </p>
        </header>

        <div className="space-y-6 sm:space-y-8">
          <Suspense fallback={<div>Загрузка...</div>}>
            <MaterialSearch />
          </Suspense>

          <Suspense fallback={<div>Загрузка...</div>}>
            <CalculationHistory onLoad={handleLoadCalculation} />
          </Suspense>

          <Suspense fallback={<div>Загрузка...</div>}>
            <RestorationCalculator
              countertops={restorationCountertops}
              setCountertops={setRestorationCountertops}
              pricing={pricing}
            />
          </Suspense>

          <Suspense fallback={<div>Загрузка...</div>}>
            <NewCountertopCalculator
              countertops={newCountertops}
              setCountertops={setNewCountertops}
              pricing={pricing}
            />
          </Suspense>

          <Suspense fallback={<div>Загрузка...</div>}>
            <TotalSummary restorationCountertops={restorationCountertops} newCountertops={newCountertops} pricing={pricing} />
          </Suspense>
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

        {showAdminPanel && (
          <AdminPanel
            onClose={() => {
              setShowAdminPanel(false)
              loadPricing()
            }}
          />
        )}
      </div>
    </main>
  )
}
