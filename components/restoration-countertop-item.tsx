"use client"

import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { X } from "lucide-react"

interface RestorationCountertopItemProps {
  countertop: any
  index: number
  onUpdate: (id: number, updates: any) => void
  onRemove: (id: number) => void
}

export function RestorationCountertopItem({ countertop, index, onUpdate, onRemove }: RestorationCountertopItemProps) {
  const calculatePrice = () => {
    const length = Number.parseFloat(countertop.length) || 0
    const width = Number.parseFloat(countertop.width) || 0
    const area = (length * width) / 1000000 // convert mm² to m²

    if (area === 0) return 0

    const basePrice = countertop.material === "solid" ? 10500 : 12500
    let totalPrice = basePrice * area

    if (countertop.milling) {
      totalPrice += 1000
    }

    if (countertop.coating === "lacquer") {
      totalPrice += 4000 * area
    }

    return totalPrice
  }

  const price = calculatePrice()

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
            <Label htmlFor={`length-${countertop.id}`}>Длина (мм)</Label>
            <Input
              id={`length-${countertop.id}`}
              type="number"
              placeholder="1000"
              value={countertop.length}
              onChange={(e) => onUpdate(countertop.id, { length: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`width-${countertop.id}`}>Ширина (мм)</Label>
            <Input
              id={`width-${countertop.id}`}
              type="number"
              placeholder="600"
              value={countertop.width}
              onChange={(e) => onUpdate(countertop.id, { width: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-3">
          <Label>Тип материала</Label>
          <RadioGroup
            value={countertop.material}
            onValueChange={(value) => onUpdate(countertop.id, { material: value })}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="solid" id={`solid-${countertop.id}`} />
              <Label htmlFor={`solid-${countertop.id}`} className="font-normal cursor-pointer">
                Массив (10 500 ₽/м²)
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="veneer" id={`veneer-${countertop.id}`} />
              <Label htmlFor={`veneer-${countertop.id}`} className="font-normal cursor-pointer">
                Шпон (12 500 ₽/м²)
              </Label>
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-3">
          <Label>Финишное покрытие</Label>
          <RadioGroup value={countertop.coating} onValueChange={(value) => onUpdate(countertop.id, { coating: value })}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="oil" id={`oil-${countertop.id}`} />
              <Label htmlFor={`oil-${countertop.id}`} className="font-normal cursor-pointer">
                Масло Osmo TopOil (включено)
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="lacquer" id={`lacquer-${countertop.id}`} />
              <Label htmlFor={`lacquer-${countertop.id}`} className="font-normal cursor-pointer">
                2К акриловый лак (+4 000 ₽/м²)
              </Label>
            </div>
          </RadioGroup>
        </div>

        <div className="flex items-center space-x-2 pt-2">
          <Checkbox
            id={`milling-${countertop.id}`}
            checked={countertop.milling}
            onCheckedChange={(checked) => onUpdate(countertop.id, { milling: checked })}
          />
          <Label htmlFor={`milling-${countertop.id}`} className="font-normal cursor-pointer">
            Фрезеровка (+1 000 ₽)
          </Label>
        </div>
      </div>
    </Card>
  )
}
