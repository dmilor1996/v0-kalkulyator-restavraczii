"use client"

import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { X } from "lucide-react"

interface NewCountertopItemProps {
  countertop: any
  index: number
  onUpdate: (id: number, updates: any) => void
  onRemove: (id: number) => void
}

export function NewCountertopItem({ countertop, index, onUpdate, onRemove }: NewCountertopItemProps) {
  const calculatePrice = () => {
    const length = Number.parseFloat(countertop.length) || 0
    const width = Number.parseFloat(countertop.width) || 0
    const area = (length * width) / 1000000 // convert mm² to m²

    if (area === 0) return 0

    let basePrice = 0

    if (countertop.type === "solid-lamella") {
      if (countertop.thickness === "40") {
        if (length >= 900 && length <= 2150) {
          basePrice = 29640
        } else if (length >= 2151 && length <= 2950) {
          basePrice = 32490
        } else if (length >= 2951 && length <= 3500) {
          basePrice = 33791
        } else {
          basePrice = 29640 // default to lowest tier
        }
      } else {
        // 20mm
        if (length >= 900 && length <= 2150) {
          basePrice = 22990
        } else if (length >= 2151 && length <= 2950) {
          basePrice = 24282
        } else if (length >= 2951 && length <= 3500) {
          basePrice = 25811
        } else {
          basePrice = 22990 // default to lowest tier
        }
      }
    } else {
      // spliced
      basePrice = countertop.thickness === "40" ? 21793 : 19979
    }

    let totalPrice = basePrice * area

    if (countertop.coating === "lacquer") {
      totalPrice += 4000 * area
    }

    return Math.round(totalPrice)
  }

  const price = calculatePrice()
  const length = Number.parseFloat(countertop.length) || 0

  const getSolidLamellaPriceDisplay = () => {
    if (countertop.thickness === "40") {
      if (length >= 900 && length <= 2150) {
        return "29 640 ₽/м²"
      } else if (length >= 2151 && length <= 2950) {
        return "32 490 ₽/м²"
      } else if (length >= 2951 && length <= 3500) {
        return "33 791 ₽/м²"
      }
      return "29 640 - 33 791 ₽/м²"
    } else {
      if (length >= 900 && length <= 2150) {
        return "22 990 ₽/м²"
      } else if (length >= 2151 && length <= 2950) {
        return "24 282 ₽/м²"
      } else if (length >= 2951 && length <= 3500) {
        return "25 811 ₽/м²"
      }
      return "22 990 - 25 811 ₽/м²"
    }
  }

  const getSplicedPriceDisplay = () => {
    return countertop.thickness === "40" ? "21 793 ₽/м²" : "19 979 ₽/м²"
  }

  return (
    <Card className="p-4 bg-secondary/30 relative">
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 h-8 w-8"
        onClick={() => onRemove(countertop.id)}
      >
        <X className="h-4 w-4" />
      </Button>

      <div className="space-y-4 pr-10">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
            {index + 1}
          </div>
          <h3 className="font-semibold text-lg">Столешница #{index + 1}</h3>
          {price > 0 && (
            <span className="ml-auto text-lg font-bold text-accent">{price.toLocaleString("ru-RU")} ₽</span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor={`new-length-${countertop.id}`}>Длина (мм)</Label>
            <Input
              id={`new-length-${countertop.id}`}
              type="number"
              placeholder="1000"
              value={countertop.length}
              onChange={(e) => onUpdate(countertop.id, { length: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`new-width-${countertop.id}`}>Ширина (мм)</Label>
            <Input
              id={`new-width-${countertop.id}`}
              type="number"
              placeholder="600"
              value={countertop.width}
              onChange={(e) => onUpdate(countertop.id, { width: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-3">
          <Label>Толщина столешницы</Label>
          <RadioGroup
            value={countertop.thickness}
            onValueChange={(value) => onUpdate(countertop.id, { thickness: value })}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="40" id={`thick-40-${countertop.id}`} />
              <Label htmlFor={`thick-40-${countertop.id}`} className="font-normal cursor-pointer">
                40 мм
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="20" id={`thick-20-${countertop.id}`} />
              <Label htmlFor={`thick-20-${countertop.id}`} className="font-normal cursor-pointer">
                20 мм
              </Label>
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-3">
          <Label>Тип столешницы</Label>
          <RadioGroup value={countertop.type} onValueChange={(value) => onUpdate(countertop.id, { type: value })}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="solid-lamella" id={`solid-lamella-${countertop.id}`} />
              <Label htmlFor={`solid-lamella-${countertop.id}`} className="font-normal cursor-pointer">
                Цельноламельная
                <span className="text-muted-foreground text-sm ml-1">({getSolidLamellaPriceDisplay()})</span>
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="spliced" id={`spliced-${countertop.id}`} />
              <Label htmlFor={`spliced-${countertop.id}`} className="font-normal cursor-pointer">
                Сращенная
                <span className="text-muted-foreground text-sm ml-1">({getSplicedPriceDisplay()})</span>
              </Label>
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-3">
          <Label>Финишное покрытие</Label>
          <RadioGroup value={countertop.coating} onValueChange={(value) => onUpdate(countertop.id, { coating: value })}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="oil" id={`new-oil-${countertop.id}`} />
              <Label htmlFor={`new-oil-${countertop.id}`} className="font-normal cursor-pointer">
                Масло Osmo TopOil (включено)
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="lacquer" id={`new-lacquer-${countertop.id}`} />
              <Label htmlFor={`new-lacquer-${countertop.id}`} className="font-normal cursor-pointer">
                2К акриловый лак (+4 000 ₽/м²)
              </Label>
            </div>
          </RadioGroup>
        </div>
      </div>
    </Card>
  )
}
