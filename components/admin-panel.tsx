"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { X, Save, Loader2 } from "lucide-react"
import { DEFAULT_PRICING, type PricingConfig } from "@/lib/pricing-types"

interface AdminPanelProps {
  onClose: () => void
}

export function AdminPanel({ onClose }: AdminPanelProps) {
  const [password, setPassword] = useState("")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [pricing, setPricing] = useState<PricingConfig>(DEFAULT_PRICING)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState("")

  useEffect(() => {
    loadPricing()
  }, [])

  const loadPricing = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/pricing")
      const data = await response.json()
      setPricing(data)
    } catch (error) {
      console.error("Error loading pricing:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = () => {
    if (password) {
      setIsAuthenticated(true)
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
          onClose()
          window.location.reload()
        }, 1500)
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
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleLogin} className="flex-1">
                Войти
              </Button>
              <Button onClick={onClose} variant="outline">
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
            <CardTitle>Управление ценами</CardTitle>
            <CardDescription>Изменение цен синхронизируется на всех устройствах</CardDescription>
          </div>
          <Button onClick={onClose} variant="ghost" size="icon">
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Реставрация */}
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
            <h3 className="text-lg font-semibold">Изготовление новых столешниц</h3>

            <div className="space-y-3">
              <h4 className="font-medium">Цельноламельный дуб (₽/м²)</h4>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2 font-medium">Длина / Толщина</th>
                      <th className="text-center p-2 font-medium">20мм</th>
                      <th className="text-center p-2 font-medium">40мм</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="p-2 font-medium">900-2150мм</td>
                      <td className="p-2">
                        <Input
                          type="number"
                          value={pricing.newCountertop.solid20mm.range1}
                          onChange={(e) => updatePrice(["newCountertop", "solid20mm", "range1"], e.target.value)}
                          className="text-center"
                        />
                      </td>
                      <td className="p-2">
                        <Input
                          type="number"
                          value={pricing.newCountertop.solid40mm.range1}
                          onChange={(e) => updatePrice(["newCountertop", "solid40mm", "range1"], e.target.value)}
                          className="text-center"
                        />
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-2 font-medium">2151-2950мм</td>
                      <td className="p-2">
                        <Input
                          type="number"
                          value={pricing.newCountertop.solid20mm.range2}
                          onChange={(e) => updatePrice(["newCountertop", "solid20mm", "range2"], e.target.value)}
                          className="text-center"
                        />
                      </td>
                      <td className="p-2">
                        <Input
                          type="number"
                          value={pricing.newCountertop.solid40mm.range2}
                          onChange={(e) => updatePrice(["newCountertop", "solid40mm", "range2"], e.target.value)}
                          className="text-center"
                        />
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-2 font-medium">2951-3500мм</td>
                      <td className="p-2">
                        <Input
                          type="number"
                          value={pricing.newCountertop.solid20mm.range3}
                          onChange={(e) => updatePrice(["newCountertop", "solid20mm", "range3"], e.target.value)}
                          className="text-center"
                        />
                      </td>
                      <td className="p-2">
                        <Input
                          type="number"
                          value={pricing.newCountertop.solid40mm.range3}
                          onChange={(e) => updatePrice(["newCountertop", "solid40mm", "range3"], e.target.value)}
                          className="text-center"
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium">Сращенный дуб (₽/м²)</h4>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2 font-medium">Толщина</th>
                      <th className="text-center p-2 font-medium">Цена</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="p-2 font-medium">20мм (до 4000мм)</td>
                      <td className="p-2">
                        <Input
                          type="number"
                          value={pricing.newCountertop.spliced20mm}
                          onChange={(e) => updatePrice(["newCountertop", "spliced20mm"], e.target.value)}
                          className="text-center"
                        />
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-2 font-medium">40мм (до 4000мм)</td>
                      <td className="p-2">
                        <Input
                          type="number"
                          value={pricing.newCountertop.spliced40mm}
                          onChange={(e) => updatePrice(["newCountertop", "spliced40mm"], e.target.value)}
                          className="text-center"
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium">Дополнительные услуги</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>2К лак (₽/м²)</Label>
                  <Input
                    type="number"
                    value={pricing.newCountertop.coating2K}
                    onChange={(e) => updatePrice(["newCountertop", "coating2K"], e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Доплата за ширину &gt;600мм (₽/50мм)</Label>
                  <Input
                    type="number"
                    value={pricing.newCountertop.widthSurcharge}
                    onChange={(e) => updatePrice(["newCountertop", "widthSurcharge"], e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Вырез (₽)</Label>
                  <Input
                    type="number"
                    value={pricing.newCountertop.cutout}
                    onChange={(e) => updatePrice(["newCountertop", "cutout"], e.target.value)}
                  />
                </div>
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
            <Button onClick={onClose} variant="outline">
              Отмена
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
