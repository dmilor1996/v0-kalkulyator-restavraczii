"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { X, Save, Loader2 } from "lucide-react"
import { DEFAULT_PRICING, type PricingConfig, type MaterialPrice, type LengthRange } from "@/lib/pricing-types"
import { mergePricingWithDefaults } from "@/lib/pricing-utils"
import { type Supplier } from "@/lib/supplier-types"
import { Plus, Trash2, Copy } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SupplierAdmin } from "./supplier-admin"

interface AdminPanelProps {
  onClose: () => void
}

export function AdminPanel({ onClose }: AdminPanelProps) {
  const [password, setPassword] = useState("")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [pricing, setPricing] = useState<PricingConfig>(DEFAULT_PRICING)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [loginError, setLoginError] = useState("")
  const [message, setMessage] = useState("")
  const [isVerifying, setIsVerifying] = useState(false)
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [newMaterialPrice, setNewMaterialPrice] = useState<Partial<MaterialPrice>>({
    pricePerM2: [],
  })
  const [priceType, setPriceType] = useState<"ranges" | "single">("ranges") // Тип цены: диапазоны или единая
  const [activeTab, setActiveTab] = useState("pricing")

  useEffect(() => {
    if (isAuthenticated) {
      loadPricing()
      loadSuppliers()
    }
  }, [isAuthenticated])

  const loadSuppliers = async () => {
    try {
      const res = await fetch("/api/suppliers")
      const data = await res.json()
      setSuppliers(data)
    } catch (error) {
      console.error("Error loading suppliers:", error)
    }
  }

  const loadPricing = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/pricing")
      const data = await response.json()
      setPricing(mergePricingWithDefaults(data))
    } catch (error) {
      console.error("Error loading pricing:", error)
      setPricing(DEFAULT_PRICING)
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = async () => {
    if (!password) {
      setLoginError("Введите пароль")
      return
    }

    setIsVerifying(true)
    setLoginError("")

    try {
      const response = await fetch("/api/pricing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, verifyOnly: true }),
      })

      if (response.ok) {
        setIsAuthenticated(true)
        setLoginError("")
      } else {
        const data = await response.json()
        setLoginError(data.error || "Неверный пароль")
      }
    } catch (error) {
      console.error("Error verifying password:", error)
      setLoginError("Ошибка проверки пароля")
    } finally {
      setIsVerifying(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setMessage("")
    try {
      const response = await fetch("/api/pricing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, pricing }),
      })

      if (response.ok) {
        setMessage("Цены успешно сохранены!")
        setTimeout(() => {
          setMessage("")
        }, 3000)
      } else {
        setMessage("Ошибка: неверный пароль")
      }
    } catch (error) {
      setMessage("Ошибка сохранения")
    } finally {
      setSaving(false)
    }
  }

  const updatePrice = (path: string[], value: string) => {
    const newPricing = { ...pricing }
    let current: any = newPricing

    for (let i = 0; i < path.length - 1; i++) {
      current = current[path[i]]
    }

    current[path[path.length - 1]] = Number.parseFloat(value) || 0
    setPricing(newPricing)
  }

  const handleAddMaterialPrice = () => {
    if (!newMaterialPrice.wood || !newMaterialPrice.shieldType || !newMaterialPrice.thickness) return

    let pricePerM2: MaterialPrice["pricePerM2"]
    if (priceType === "ranges") {
      const ranges = newMaterialPrice.pricePerM2 as LengthRange[]
      if (!ranges || ranges.length === 0) return
      // Проверяем, что все диапазоны заполнены
      const validRanges = ranges.filter((r) => r.minLength > 0 && r.maxLength > 0 && r.pricePerM2 > 0)
      if (validRanges.length === 0) return
      pricePerM2 = validRanges
    } else {
      const single = newMaterialPrice.pricePerM2 as any
      if (typeof single !== "number" && !single) return
      pricePerM2 = typeof single === "number" ? single : Number.parseFloat(String(single)) || 0
    }

    const materialPrice: MaterialPrice = {
      id: `mp-${Date.now()}`,
      wood: newMaterialPrice.wood,
      shieldType: newMaterialPrice.shieldType,
      thickness: Number.parseInt(newMaterialPrice.thickness as any) || 0,
      grade: newMaterialPrice.grade || undefined,
      pricePerM2,
    }

    setPricing({
      ...pricing,
      materialPrices: [...pricing.materialPrices, materialPrice],
    })

    setNewMaterialPrice({ pricePerM2: [] })
    setPriceType("ranges")
  }

  const handleDuplicateMaterialPrice = (id: string) => {
    const material = pricing.materialPrices.find((mp) => mp.id === id)
    if (!material) return

    const duplicated: MaterialPrice = {
      ...material,
      id: `mp-${Date.now()}`,
      pricePerM2: Array.isArray(material.pricePerM2)
        ? material.pricePerM2.map((r) => ({ ...r, id: `lr-${Date.now()}-${Math.random()}` }))
        : material.pricePerM2,
    }

    const index = pricing.materialPrices.findIndex((mp) => mp.id === id)
    const newMaterialPrices = [...pricing.materialPrices]
    newMaterialPrices.splice(index + 1, 0, duplicated)

    setPricing({
      ...pricing,
      materialPrices: newMaterialPrices,
    })
  }

  const handleAddLengthRange = (materialId: string) => {
    setPricing({
      ...pricing,
      materialPrices: pricing.materialPrices.map((mp) => {
        if (mp.id === materialId && Array.isArray(mp.pricePerM2)) {
          return {
            ...mp,
            pricePerM2: [
              ...mp.pricePerM2,
              { id: `lr-${Date.now()}`, minLength: 0, maxLength: 0, pricePerM2: 0 },
            ],
          }
        }
        return mp
      }),
    })
  }

  const handleDeleteLengthRange = (materialId: string, rangeId: string) => {
    setPricing({
      ...pricing,
      materialPrices: pricing.materialPrices.map((mp) => {
        if (mp.id === materialId && Array.isArray(mp.pricePerM2)) {
          return {
            ...mp,
            pricePerM2: mp.pricePerM2.filter((r) => r.id !== rangeId),
          }
        }
        return mp
      }),
    })
  }

  const handleUpdateLengthRange = (materialId: string, rangeId: string, field: keyof LengthRange, value: any) => {
    setPricing({
      ...pricing,
      materialPrices: pricing.materialPrices.map((mp) => {
        if (mp.id === materialId && Array.isArray(mp.pricePerM2)) {
          return {
            ...mp,
            pricePerM2: mp.pricePerM2.map((r) => (r.id === rangeId ? { ...r, [field]: value } : r)),
          }
        }
        return mp
      }),
    })
  }

  const handleAddNewRange = () => {
    const ranges = (newMaterialPrice.pricePerM2 as LengthRange[]) || []
    setNewMaterialPrice({
      ...newMaterialPrice,
      pricePerM2: [...ranges, { id: `lr-${Date.now()}`, minLength: 0, maxLength: 0, pricePerM2: 0 }],
    })
  }

  const handleDeleteMaterialPrice = (id: string) => {
    setPricing({
      ...pricing,
      materialPrices: pricing.materialPrices.filter((mp) => mp.id !== id),
    })
  }

  const handleUpdateMaterialPrice = (id: string, field: keyof MaterialPrice, value: any) => {
    setPricing({
      ...pricing,
      materialPrices: pricing.materialPrices.map((mp) => (mp.id === id ? { ...mp, [field]: value } : mp)),
    })
  }

  // Получить уникальные значения из поставщиков
  const getAvailableOptions = () => {
    const woods = new Set<string>()
    const shieldTypes = new Set<string>()
    const grades = new Set<string>()
    const thicknesses = new Set<number>()

    suppliers.forEach((supplier: Supplier) => {
      supplier.materials?.forEach((material) => {
        if (material.wood) woods.add(material.wood)
        if (material.shieldType) shieldTypes.add(material.shieldType)
        if (material.grade) grades.add(material.grade)
        if (material.thickness) thicknesses.add(material.thickness)
      })
    })

    return {
      woods: Array.from(woods).sort(),
      shieldTypes: Array.from(shieldTypes).sort(),
      grades: Array.from(grades).sort(),
      thicknesses: Array.from(thicknesses).sort((a, b) => a - b),
    }
  }

  const availableOptions = getAvailableOptions()

  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Панель администратора</CardTitle>
            <CardDescription>Введите пароль для доступа</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Пароль</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  setLoginError("")
                }}
                onKeyDown={(e) => e.key === "Enter" && !isVerifying && handleLogin()}
                disabled={isVerifying}
              />
              {loginError && <p className="text-sm text-destructive">{loginError}</p>}
            </div>
            <div className="flex gap-2">
              <Button onClick={handleLogin} className="flex-1" disabled={isVerifying}>
                {isVerifying ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Проверка...
                  </>
                ) : (
                  "Войти"
                )}
              </Button>
              <Button onClick={onClose} variant="outline" disabled={isVerifying}>
                Отмена
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <Loader2 className="w-8 h-8 animate-spin text-white" />
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <Card className="w-full max-w-5xl my-8">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Панель администратора</CardTitle>
            <CardDescription>Управление ценами и поставщиками</CardDescription>
          </div>
          <Button onClick={onClose} variant="ghost" size="icon">
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="pricing">Цены продажи</TabsTrigger>
              <TabsTrigger value="suppliers">Поставщики</TabsTrigger>
            </TabsList>

            <TabsContent value="pricing" className="space-y-6 mt-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Реставрация</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Массив (₽/м²)</Label>
                    <Input
                      type="number"
                      value={pricing.restoration.solid}
                      onChange={(e) => updatePrice(["restoration", "solid"], e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Шпон (₽/м²)</Label>
                    <Input
                      type="number"
                      value={pricing.restoration.veneer}
                      onChange={(e) => updatePrice(["restoration", "veneer"], e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Фрезеровка (₽)</Label>
                    <Input
                      type="number"
                      value={pricing.restoration.milling}
                      onChange={(e) => updatePrice(["restoration", "milling"], e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>2К лак (₽/м²)</Label>
                    <Input
                      type="number"
                      value={pricing.restoration.coating2K}
                      onChange={(e) => updatePrice(["restoration", "coating2K"], e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Цены материалов за м²</h3>
                </div>

                <div className="border rounded-lg p-4 space-y-3">
                  <h4 className="font-medium text-sm">Добавить материал</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    <Select
                      value={newMaterialPrice.wood || "all"}
                      onValueChange={(value) => setNewMaterialPrice({ ...newMaterialPrice, wood: value === "all" ? "" : value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Порода" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Выберите породу</SelectItem>
                        {availableOptions.woods.map((w) => (
                          <SelectItem key={w} value={w}>
                            {w}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select
                      value={newMaterialPrice.shieldType || "all"}
                      onValueChange={(value) => setNewMaterialPrice({ ...newMaterialPrice, shieldType: value === "all" ? "" : value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Тип щита" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Выберите тип</SelectItem>
                        {availableOptions.shieldTypes.map((st) => (
                          <SelectItem key={st} value={st}>
                            {st}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select
                      value={newMaterialPrice.thickness?.toString() || "all"}
                      onValueChange={(value) =>
                        setNewMaterialPrice({ ...newMaterialPrice, thickness: value === "all" ? undefined : Number.parseInt(value) })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Толщина (мм)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Выберите толщину</SelectItem>
                        {availableOptions.thicknesses.map((t) => (
                          <SelectItem key={t} value={t.toString()}>
                            {t} мм
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select
                      value={newMaterialPrice.grade || "all"}
                      onValueChange={(value) => setNewMaterialPrice({ ...newMaterialPrice, grade: value === "all" ? undefined : value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Сорт (опционально)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Любой сорт</SelectItem>
                        {availableOptions.grades.map((g) => (
                          <SelectItem key={g} value={g}>
                            {g}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant={priceType === "ranges" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setPriceType("ranges")}
                      >
                        По диапазонам длины
                      </Button>
                      <Button
                        type="button"
                        variant={priceType === "single" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setPriceType("single")}
                      >
                        Единая цена
                      </Button>
                    </div>
                    {priceType === "ranges" ? (
                      <div className="space-y-2">
                        {(newMaterialPrice.pricePerM2 as LengthRange[])?.map((range, idx) => (
                          <div key={range.id || idx} className="grid grid-cols-4 gap-2 items-end">
                            <div className="space-y-1">
                              <Label className="text-xs">От (мм)</Label>
                              <Input
                                type="number"
                                value={range.minLength || ""}
                                onChange={(e) => {
                                  const ranges = (newMaterialPrice.pricePerM2 as LengthRange[]) || []
                                  const updated = ranges.map((r, i) =>
                                    i === idx ? { ...r, minLength: Number.parseInt(e.target.value) || 0 } : r,
                                  )
                                  setNewMaterialPrice({ ...newMaterialPrice, pricePerM2: updated })
                                }}
                                className="text-sm h-8"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">До (мм)</Label>
                              <Input
                                type="number"
                                value={range.maxLength || ""}
                                onChange={(e) => {
                                  const ranges = (newMaterialPrice.pricePerM2 as LengthRange[]) || []
                                  const updated = ranges.map((r, i) =>
                                    i === idx ? { ...r, maxLength: Number.parseInt(e.target.value) || 0 } : r,
                                  )
                                  setNewMaterialPrice({ ...newMaterialPrice, pricePerM2: updated })
                                }}
                                className="text-sm h-8"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">Цена (₽/м²)</Label>
                              <Input
                                type="number"
                                value={range.pricePerM2 || ""}
                                onChange={(e) => {
                                  const ranges = (newMaterialPrice.pricePerM2 as LengthRange[]) || []
                                  const updated = ranges.map((r, i) =>
                                    i === idx ? { ...r, pricePerM2: Number.parseFloat(e.target.value) || 0 } : r,
                                  )
                                  setNewMaterialPrice({ ...newMaterialPrice, pricePerM2: updated })
                                }}
                                className="text-sm h-8"
                              />
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                const ranges = (newMaterialPrice.pricePerM2 as LengthRange[]) || []
                                setNewMaterialPrice({
                                  ...newMaterialPrice,
                                  pricePerM2: ranges.filter((_, i) => i !== idx),
                                })
                              }}
                              className="h-8 w-8"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                        <Button type="button" size="sm" variant="outline" onClick={handleAddNewRange} className="w-full">
                          <Plus className="h-4 w-4 mr-1" />
                          Добавить диапазон
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <Label className="text-xs">Цена за м² (₽)</Label>
                        <Input
                          type="number"
                          value={typeof newMaterialPrice.pricePerM2 === "number" ? newMaterialPrice.pricePerM2 : ""}
                          onChange={(e) => setNewMaterialPrice({ ...newMaterialPrice, pricePerM2: Number.parseFloat(e.target.value) || 0 })}
                        />
                      </div>
                    )}
                  </div>
                  <Button size="sm" onClick={handleAddMaterialPrice} className="w-full">
                    <Plus className="h-4 w-4 mr-1" />
                    Добавить материал
                  </Button>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium">Материалов: {pricing.materialPrices.length}</p>
                  <div className="max-h-96 overflow-y-auto space-y-3">
                    {pricing.materialPrices.map((mp) => (
                      <Card key={mp.id} className="p-3">
                        <div className="space-y-2">
                          <div className="grid grid-cols-2 md:grid-cols-5 gap-2 items-center">
                            <Select
                              value={mp.wood}
                              onValueChange={(value) => handleUpdateMaterialPrice(mp.id, "wood", value)}
                            >
                              <SelectTrigger className="text-sm h-8">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {availableOptions.woods.map((w) => (
                                  <SelectItem key={w} value={w}>
                                    {w}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Select
                              value={mp.shieldType}
                              onValueChange={(value) => handleUpdateMaterialPrice(mp.id, "shieldType", value)}
                            >
                              <SelectTrigger className="text-sm h-8">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {availableOptions.shieldTypes.map((st) => (
                                  <SelectItem key={st} value={st}>
                                    {st}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Select
                              value={mp.thickness.toString()}
                              onValueChange={(value) => handleUpdateMaterialPrice(mp.id, "thickness", Number.parseInt(value))}
                            >
                              <SelectTrigger className="text-sm h-8">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {availableOptions.thicknesses.map((t) => (
                                  <SelectItem key={t} value={t.toString()}>
                                    {t} мм
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Select
                              value={mp.grade || "all"}
                              onValueChange={(value) => handleUpdateMaterialPrice(mp.id, "grade", value === "all" ? undefined : value)}
                            >
                              <SelectTrigger className="text-sm h-8">
                                <SelectValue placeholder="Сорт" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">Любой сорт</SelectItem>
                                {availableOptions.grades.map((g) => (
                                  <SelectItem key={g} value={g}>
                                    {g}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDuplicateMaterialPrice(mp.id)}
                                className="h-8 w-8"
                                title="Дублировать"
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteMaterialPrice(mp.id)}
                                className="h-8 w-8"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          {Array.isArray(mp.pricePerM2) ? (
                            <div className="space-y-2">
                              {mp.pricePerM2.map((range) => (
                                <div key={range.id} className="grid grid-cols-4 gap-2 items-end">
                                  <div className="space-y-1">
                                    <Label className="text-xs">От (мм)</Label>
                                    <Input
                                      type="number"
                                      value={range.minLength}
                                      onChange={(e) =>
                                        handleUpdateLengthRange(mp.id, range.id, "minLength", Number.parseInt(e.target.value) || 0)
                                      }
                                      className="text-sm h-8"
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <Label className="text-xs">До (мм)</Label>
                                    <Input
                                      type="number"
                                      value={range.maxLength}
                                      onChange={(e) =>
                                        handleUpdateLengthRange(mp.id, range.id, "maxLength", Number.parseInt(e.target.value) || 0)
                                      }
                                      className="text-sm h-8"
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <Label className="text-xs">Цена (₽/м²)</Label>
                                    <Input
                                      type="number"
                                      value={range.pricePerM2}
                                      onChange={(e) =>
                                        handleUpdateLengthRange(mp.id, range.id, "pricePerM2", Number.parseFloat(e.target.value) || 0)
                                      }
                                      className="text-sm h-8"
                                    />
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleDeleteLengthRange(mp.id, range.id)}
                                    className="h-8 w-8"
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              ))}
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() => handleAddLengthRange(mp.id)}
                                className="w-full"
                              >
                                <Plus className="h-4 w-4 mr-1" />
                                Добавить диапазон
                              </Button>
                            </div>
                          ) : (
                            <div className="space-y-1">
                              <Label className="text-xs">Цена за м² (₽)</Label>
                              <Input
                                type="number"
                                value={mp.pricePerM2}
                                onChange={(e) => handleUpdateMaterialPrice(mp.id, "pricePerM2", Number.parseFloat(e.target.value) || 0)}
                                className="text-sm h-8"
                              />
                            </div>
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>

              {message && (
                <div
                  className={`p-3 rounded-lg text-sm ${
                    message.includes("успешно") ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                  }`}
                >
                  {message}
                </div>
              )}

              <div className="flex gap-2">
                <Button onClick={handleSave} disabled={saving} className="flex-1">
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Сохранение...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Сохранить изменения
                    </>
                  )}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="suppliers" className="mt-6">
              <SupplierAdmin password={password} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
