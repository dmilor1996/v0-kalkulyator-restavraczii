"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Loader2, SlidersHorizontal } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import type { SearchResult, Supplier } from "@/lib/supplier-types"

export function MaterialSearch() {
  const [length, setLength] = useState("")
  const [width, setWidth] = useState("")
  const [thickness, setThickness] = useState<number[]>([])
  const [showSmaller, setShowSmaller] = useState(false)
  const [wood, setWood] = useState<string[]>([])
  const [shieldType, setShieldType] = useState<string[]>([])
  const [grade, setGrade] = useState<string[]>([])
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [availableOptions, setAvailableOptions] = useState<{
    woods: string[]
    shieldTypes: string[]
    grades: string[]
    thicknesses: number[]
  }>({ woods: [], shieldTypes: [], grades: [], thicknesses: [] })
  const [filtersExpanded, setFiltersExpanded] = useState(true)

  const loadSuppliers = useCallback(async () => {
    try {
      const res = await fetch("/api/suppliers")
      const data = await res.json()
      setSuppliers(data)

      // Извлекаем уникальные значения для фильтров
      const woods = new Set<string>()
      const shieldTypes = new Set<string>()
      const grades = new Set<string>()
      const thicknesses = new Set<number>()

      data.forEach((supplier: Supplier) => {
        supplier.materials.forEach((material) => {
          if (material.wood) woods.add(material.wood)
          if (material.shieldType) shieldTypes.add(material.shieldType)
          if (material.grade) grades.add(material.grade)
          if (material.thickness) thicknesses.add(material.thickness)
        })
      })

      setAvailableOptions({
        woods: Array.from(woods).sort(),
        shieldTypes: Array.from(shieldTypes).sort(),
        grades: Array.from(grades).sort(),
        thicknesses: Array.from(thicknesses).sort((a, b) => a - b),
      })
    } catch (error) {
      console.error("Error loading suppliers:", error)
    }
  }, [])

  useEffect(() => {
    loadSuppliers()
  }, [loadSuppliers])

  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      setFiltersExpanded(false)
    }
  }, [])

  const handleSearch = useCallback(
    async (includeSmaller = false) => {
      if (!length || !width) return

      setIsLoading(true)

      try {
        const res = await fetch("/api/suppliers/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            length: Number.parseInt(length),
            width: Number.parseInt(width),
            thickness: thickness.length > 0 ? thickness : undefined,
            wood: wood.length > 0 ? wood : undefined,
            shieldType: shieldType.length > 0 ? shieldType : undefined,
            grade: grade.length > 0 ? grade : undefined,
            showSmaller: includeSmaller,
          }),
        })

        const data = await res.json()
        setResults(data)
      } catch (error) {
        console.error("Error searching materials:", error)
      } finally {
        setIsLoading(false)
      }
    },
    [length, width, thickness, wood, shieldType, grade],
  )

  const getMatchLabel = useCallback((matchType: string) => {
    switch (matchType) {
      case "exact":
        return "✓ Точное совпадение"
      case "smaller":
        return "↓ Меньший размер"
      case "larger":
        return "↑ Больший размер"
      default:
        return ""
    }
  }, [])

  return (
    <div className="space-y-6 animate-fade-in">
      <Card className="card-shadow border-border/50 hover:card-shadow-hover transition-all duration-300 hover-lift">
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Поиск материала
              </CardTitle>
              <CardDescription className="text-base mt-2">
                Укажите размеры столешницы и выберите параметры (опционально)
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setFiltersExpanded((prev) => !prev)}
              className="flex items-center justify-center gap-2 w-full sm:w-auto text-sm text-muted-foreground hover:text-primary"
              aria-expanded={filtersExpanded}
            >
              <SlidersHorizontal className="h-4 w-4" />
              {filtersExpanded ? "Скрыть фильтры" : "Показать фильтры"}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="length" className="text-sm font-semibold">
                Длина (мм) *
              </Label>
              <Input
                id="length"
                type="number"
                value={length}
                onChange={(e) => setLength(e.target.value)}
                placeholder="2000"
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="h-11 text-base border-border/50 focus:border-primary focus:ring-primary/20 transition-all"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="width" className="text-sm font-semibold">
                Ширина (мм) *
              </Label>
              <Input
                id="width"
                type="number"
                value={width}
                onChange={(e) => setWidth(e.target.value)}
                placeholder="600"
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="h-11 text-base border-border/50 focus:border-primary focus:ring-primary/20 transition-all"
              />
            </div>
          </div>

          <div
            className={`transition-all duration-300 gap-4 ${
              filtersExpanded ? "grid md:grid-cols-2 lg:grid-cols-4" : "hidden md:grid md:grid-cols-2 lg:grid-cols-4"
            }`}
          >
            <div className="space-y-3">
              <Label className="text-sm font-semibold">Толщина (мм)</Label>
              <div className="border border-border/50 rounded-xl p-3 max-h-40 overflow-y-auto space-y-2.5 bg-card/50 backdrop-blur-sm">
                {availableOptions.thicknesses.map((t) => {
                  const handleChange = (checked: boolean) => {
                    setThickness((prev) => (checked ? [...prev, t] : prev.filter((th) => th !== t)))
                  }
                  return (
                    <div key={t} className="flex items-center space-x-2">
                      <Checkbox id={`thickness-${t}`} checked={thickness.includes(t)} onCheckedChange={handleChange} />
                      <Label htmlFor={`thickness-${t}`} className="text-sm font-normal cursor-pointer">
                        {t} мм
                      </Label>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-semibold">Порода</Label>
              <div className="border border-border/50 rounded-xl p-3 max-h-40 overflow-y-auto space-y-2.5 bg-card/50 backdrop-blur-sm">
                {availableOptions.woods.map((w) => {
                  const handleChange = (checked: boolean) => {
                    setWood((prev) => (checked ? [...prev, w] : prev.filter((wo) => wo !== w)))
                  }
                  return (
                    <div key={w} className="flex items-center space-x-2">
                      <Checkbox id={`wood-${w}`} checked={wood.includes(w)} onCheckedChange={handleChange} />
                      <Label htmlFor={`wood-${w}`} className="text-sm font-normal cursor-pointer">
                        {w}
                      </Label>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-semibold">Тип щита</Label>
              <div className="border border-border/50 rounded-xl p-3 max-h-40 overflow-y-auto space-y-2.5 bg-card/50 backdrop-blur-sm">
                {availableOptions.shieldTypes.map((st) => {
                  const handleChange = (checked: boolean) => {
                    setShieldType((prev) => (checked ? [...prev, st] : prev.filter((s) => s !== st)))
                  }
                  return (
                    <div key={st} className="flex items-center space-x-2">
                      <Checkbox id={`shieldType-${st}`} checked={shieldType.includes(st)} onCheckedChange={handleChange} />
                      <Label htmlFor={`shieldType-${st}`} className="text-sm font-normal cursor-pointer">
                        {st}
                      </Label>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-semibold">Сорт</Label>
              <div className="border border-border/50 rounded-xl p-3 max-h-40 overflow-y-auto space-y-2.5 bg-card/50 backdrop-blur-sm">
                {availableOptions.grades.map((g) => {
                  const handleChange = (checked: boolean) => {
                    setGrade((prev) => (checked ? [...prev, g] : prev.filter((gr) => gr !== g)))
                  }
                  return (
                    <div key={g} className="flex items-center space-x-2">
                      <Checkbox id={`grade-${g}`} checked={grade.includes(g)} onCheckedChange={handleChange} />
                      <Label htmlFor={`grade-${g}`} className="text-sm font-normal cursor-pointer">
                        {g}
                      </Label>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          <Button
            onClick={() => handleSearch()}
            disabled={isLoading || !length || !width}
            className="w-full h-12 text-base font-semibold gradient-primary hover:opacity-90 shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Поиск...
              </>
            ) : (
              <>
                <Search className="h-5 w-5 mr-2" />
                Найти материалы
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {results.length > 0 && (
        <Card className="card-shadow border-border/50 animate-fade-in">
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Результаты поиска ({results.length})
                </CardTitle>
                <CardDescription className="text-sm mt-1.5">
                  Сортировка: сначала по марже (наценке), затем по цене (от меньшей к большей), затем по размеру
                </CardDescription>
              </div>
              {!showSmaller && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowSmaller(true)
                    handleSearch(true)
                  }}
                  className="border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all"
                >
                  Показать меньшие размеры
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {results.map((result, idx) => (
                <Card
                  key={idx}
                  className="p-5 border-l-4 border-l-primary card-shadow hover:card-shadow-hover transition-all duration-300 hover-lift bg-gradient-to-r from-card to-card/50"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-5">
                    <div className="space-y-3 flex-1">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="font-bold text-xl text-foreground">{result.supplier}</span>
                        <span
                          className={`text-xs px-3 py-1.5 rounded-full font-semibold shadow-sm ${
                            result.matchType === "exact"
                              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                              : result.matchType === "smaller"
                                ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
                                : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
                          }`}
                        >
                          {getMatchLabel(result.matchType)}
                        </span>
                      </div>

                      <div className="text-sm text-muted-foreground space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-semibold text-foreground">Порода:</span>
                          <span className="px-2 py-0.5 rounded-md bg-secondary/50">{result.material.wood}</span>
                          <span className="text-muted-foreground">•</span>
                          <span className="font-semibold text-foreground">Тип:</span>
                          <span className="px-2 py-0.5 rounded-md bg-secondary/50">{result.material.shieldType}</span>
                          <span className="text-muted-foreground">•</span>
                          <span className="font-semibold text-foreground">Сорт:</span>
                          <span className="px-2 py-0.5 rounded-md bg-secondary/50">{result.material.grade}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-foreground">Размер:</span>
                          <span className="px-2.5 py-1 rounded-md bg-primary/10 text-primary font-medium">
                            {result.material.length} × {result.material.width} × {result.material.thickness} мм
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right space-y-2 min-w-[180px]">
                      <div className="text-xs text-muted-foreground/80 uppercase tracking-wide">Закупка</div>
                      <div className="text-base font-semibold line-through text-muted-foreground">
                        {result.material.price.toLocaleString("ru-RU")} ₽
                      </div>
                      {result.sellPrice > 0 ? (
                        <>
                          <div className="text-xs text-muted-foreground/80 uppercase tracking-wide mt-3">Продажа</div>
                          <div className="text-3xl font-extrabold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                            {result.sellPrice.toLocaleString("ru-RU")} ₽
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {((result.material.length * result.material.width) / 1000000).toFixed(2)} м²
                            {result.pricePerM2 && (
                              <span className="ml-1.5 px-2 py-0.5 rounded-md bg-accent/10 text-accent font-medium">
                                {result.pricePerM2.toLocaleString("ru-RU")} ₽/м²
                              </span>
                            )}
                          </div>
                          {result.markup > 0 && (
                            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-200 dark:border-emerald-800">
                              <span>+{result.markup}%</span>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="text-sm text-muted-foreground italic">Цена за м² не задана</div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {!isLoading && results.length === 0 && length && width && (
        <Card className="card-shadow border-border/50 animate-fade-in">
          <CardContent className="py-12 text-center">
            <div className="space-y-2">
              <p className="text-muted-foreground text-lg">Материалы не найдены</p>
              <p className="text-sm text-muted-foreground/80">Попробуйте изменить параметры поиска</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
