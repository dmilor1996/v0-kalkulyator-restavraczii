"use client"

import { useState, useEffect, useCallback, useRef, Suspense } from "react"
import { MaterialSearch } from "@/components/material-search"
import { RestorationCalculator } from "@/components/restoration-calculator"
import { NewCountertopCalculator } from "@/components/new-countertop-calculator"
import { TotalSummary } from "@/components/total-summary"
import { CalculationHistory } from "@/components/calculation-history"
import { AdminPanel } from "@/components/admin-panel"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MessageCircle, Phone, ArrowRight } from "lucide-react"
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

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    timeoutRef.current = setTimeout(() => setClickCount(0), 1000)
  }, [])

  const handleHeroScroll = useCallback(() => {
    document
      .getElementById("material-search-section")
      ?.scrollIntoView({ behavior: "smooth", block: "start" })
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/35 py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-12">
        <section className="relative overflow-hidden rounded-3xl border border-border/50 bg-gradient-to-br from-primary/20 via-accent/12 to-transparent px-6 py-12 sm:px-10 sm:py-16 card-shadow">
          <div className="absolute inset-0 -z-10 opacity-40 blur-3xl gradient-primary" />
          <div className="absolute -right-10 -top-12 h-44 w-44 rounded-full bg-primary/25 blur-3xl" />
          <div className="absolute -left-16 bottom-0 h-60 w-60 rounded-full bg-accent/25 blur-3xl" />
          <div className="relative mx-auto flex max-w-4xl flex-col items-center text-center space-y-6">
            <span className="inline-flex items-center rounded-full bg-card/70 px-4 py-1 text-sm font-medium text-primary shadow-sm ring-1 ring-primary/20">
              Новый цифровой формат расчёта мебели
            </span>
            <h1
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent text-balance cursor-pointer select-none transition-transform duration-500 hover:scale-[1.02]"
              onClick={handleTitleClick}
            >
              Калькулятор стоимости столешниц
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground/90 leading-relaxed">
              Сравнивайте предложения поставщиков, рассчитывайте себестоимость и продавайте с нужной маржой в едином интерфейсе. Умный поиск сам найдёт оптимальный щит по вашим параметрам.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <Button
                size="lg"
                onClick={handleHeroScroll}
                className="h-12 px-6 text-base font-semibold gradient-primary hover:opacity-90 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Начать поиск
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => setShowAdminPanel(true)}
                className="h-12 px-6 text-base font-semibold border-border/60 hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 hover-lift"
              >
                Панель администратора
              </Button>
            </div>
          </div>
        </section>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,3fr)_minmax(300px,1.15fr)]">
          <div className="space-y-8">
            <section id="material-search-section" className="space-y-6">
              <Suspense fallback={<div className="card-shadow rounded-3xl bg-card p-8 text-center text-muted-foreground">Загрузка поиска...</div>}>
                <MaterialSearch />
              </Suspense>
            </section>

            <section className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
                <div>
                  <h2 className="text-xl font-semibold text-foreground">Калькулятор производства</h2>
                  <p className="text-sm text-muted-foreground">Рассчитайте стоимость реставрации и изготовления под ваш проект</p>
                </div>
              </div>
              <Tabs defaultValue="restoration" className="w-full">
                <TabsList className="grid w-full grid-cols-2 rounded-xl bg-muted/60 p-1">
                  <TabsTrigger value="restoration" className="rounded-lg text-sm font-semibold data-[state=active]:bg-card data-[state=active]:shadow-sm">
                    Реставрация
                  </TabsTrigger>
                  <TabsTrigger value="new" className="rounded-lg text-sm font-semibold data-[state=active]:bg-card data-[state=active]:shadow-sm">
                    Изготовление
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="restoration" className="mt-5">
                  <Suspense fallback={<div className="card-shadow rounded-2xl bg-card p-6 text-center text-muted-foreground">Загрузка калькулятора...</div>}>
                    <RestorationCalculator
                      countertops={restorationCountertops}
                      setCountertops={setRestorationCountertops}
                      pricing={pricing}
                    />
                  </Suspense>
                </TabsContent>
                <TabsContent value="new" className="mt-5">
                  <Suspense fallback={<div className="card-shadow rounded-2xl bg-card p-6 text-center text-muted-foreground">Загрузка калькулятора...</div>}>
                    <NewCountertopCalculator
                      countertops={newCountertops}
                      setCountertops={setNewCountertops}
                      pricing={pricing}
                    />
                  </Suspense>
                </TabsContent>
              </Tabs>
            </section>
          </div>

          <aside className="space-y-6 lg:sticky lg:top-24">
            <Suspense fallback={<div className="card-shadow rounded-2xl bg-card p-6 text-center text-muted-foreground">Загрузка итогов...</div>}>
              <TotalSummary restorationCountertops={restorationCountertops} newCountertops={newCountertops} pricing={pricing} />
            </Suspense>
            <Suspense fallback={<div className="card-shadow rounded-2xl bg-card p-6 text-center text-muted-foreground">Загрузка истории...</div>}>
              <CalculationHistory onLoad={handleLoadCalculation} />
            </Suspense>
          </aside>
        </div>

        <footer className="pt-10 sm:pt-14 border-t border-border/40">
          <div className="text-center space-y-4">
            <p className="text-sm text-muted-foreground/80">Разработано</p>
            <p className="font-semibold text-lg sm:text-xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Лоренцсон Дмитрий
            </p>
            <div className="flex items-center justify-center gap-4 sm:gap-6 flex-wrap">
              <a
                href="tel:+79817382028"
                className="group flex items-center gap-2 px-4 py-2 rounded-lg bg-card border border-border/50 text-muted-foreground hover:text-foreground hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 hover-lift"
              >
                <Phone className="h-4 w-4 group-hover:scale-110 transition-transform" />
                <span className="text-sm sm:text-base">+7-981-738-20-28</span>
              </a>
              <a
                href="https://t.me/dmilor"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-2 px-4 py-2 rounded-lg bg-card border border-border/50 text-muted-foreground hover:text-foreground hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 hover-lift"
              >
                <MessageCircle className="h-4 w-4 group-hover:scale-110 transition-transform" />
                <span className="text-sm sm:text-base">Telegram</span>
              </a>
              <a
                href="https://wa.me/79817382028"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-2 px-4 py-2 rounded-lg bg-card border border-border/50 text-muted-foreground hover:text-foreground hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 hover-lift"
              >
                <MessageCircle className="h-4 w-4 group-hover:scale-110 transition-transform" />
                <span className="text-sm sm:text-base">WhatsApp</span>
              </a>
            </div>
          </div>
        </footer>
      </div>

      {showAdminPanel && (
        <AdminPanel
          onClose={() => {
            setShowAdminPanel(false)
            loadPricing()
          }}
        />
      )}
    </main>
  )
}
