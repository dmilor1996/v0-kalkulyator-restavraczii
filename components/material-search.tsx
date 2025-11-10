"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Loader2 } from "lucide-react"
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
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Поиск материала</CardTitle>
          <CardDescription>Укажите размеры столешницы и выберите параметры (опционально)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="length">Длина (мм) *</Label>
              <Input
                id="length"
                type="number"
                value={length}
                onChange={(e) => setLength(e.target.value)}
                placeholder="2000"
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
            <div>
              <Label htmlFor="width">Ширина (мм) *</Label>
              <Input
                id="width"
                type="number"
                value={width}
                onChange={(e) => setWidth(e.target.value)}
                placeholder="600"
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Толщина (мм)</Label>
              <div className="border rounded-md p-2 max-h-32 overflow-y-auto space-y-2">
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

            <div className="space-y-2">
              <Label>Порода</Label>
              <div className="border rounded-md p-2 max-h-32 overflow-y-auto space-y-2">
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

            <div className="space-y-2">
              <Label>Тип щита</Label>
              <div className="border rounded-md p-2 max-h-32 overflow-y-auto space-y-2">
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

            <div className="space-y-2">
              <Label>Сорт</Label>
              <div className="border rounded-md p-2 max-h-32 overflow-y-auto space-y-2">
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

          <Button onClick={() => handleSearch()} disabled={isLoading || !length || !width} className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Поиск...
              </>
            ) : (
              <>
                <Search className="h-4 w-4 mr-2" />
                Найти материалы
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {results.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Результаты поиска ({results.length})</CardTitle>
                <CardDescription>
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
                >
                  Показать меньшие размеры
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {results.map((result, idx) => (
                <Card key={idx} className="p-4 border-l-4 border-l-primary">
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-lg">{result.supplier}</span>
                        <span
                          className={`text-xs px-2 py-1 rounded font-medium ${
                            result.matchType === "exact"
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                              : result.matchType === "smaller"
                                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                                : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                          }`}
                        >
                          {getMatchLabel(result.matchType)}
                        </span>
                      </div>

                      <div className="text-sm text-muted-foreground space-y-1">
                        <div>
                          <span className="font-medium">Порода:</span> {result.material.wood} •{" "}
                          <span className="font-medium">Тип:</span> {result.material.shieldType} •{" "}
                          <span className="font-medium">Сорт:</span> {result.material.grade}
                        </div>
                        <div>
                          <span className="font-medium">Размер:</span> {result.material.length} × {result.material.width} ×{" "}
                          {result.material.thickness} мм
                        </div>
                      </div>
                    </div>

                    <div className="text-right space-y-1">
                      <div className="text-sm text-muted-foreground">Закупка:</div>
                      <div className="text-lg font-semibold line-through text-muted-foreground">{result.material.price.toLocaleString("ru-RU")} ₽</div>
                      {result.sellPrice > 0 ? (
                        <>
                          <div className="text-sm text-muted-foreground">Продажа:</div>
                          <div className="text-2xl font-bold text-primary">{result.sellPrice.toLocaleString("ru-RU")} ₽</div>
                          <div className="text-xs text-muted-foreground">
                            {((result.material.length * result.material.width) / 1000000).toFixed(2)} м²
                            {result.pricePerM2 && ` • ${result.pricePerM2.toLocaleString("ru-RU")} ₽/м²`}
                          </div>
                          {result.markup > 0 && (
                            <div className="text-xs font-medium text-green-600 dark:text-green-400">+{result.markup}%</div>
                          )}
                        </>
                      ) : (
                        <div className="text-sm text-muted-foreground">Цена за м² не задана</div>
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
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Материалы не найдены. Попробуйте изменить параметры поиска.
          </CardContent>
        </Card>
      )}
    </div>
  )
}
