"use client"

import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { X, AlertCircle } from "lucide-react"
import { CoatingTooltip } from "./coating-tooltip"
import type { PricingConfig } from "@/lib/pricing-types"
import { DEFAULT_PRICING } from "@/lib/pricing-types"

interface NewCountertopItemProps {
  countertop: any
  index: number
  onUpdate: (id: number, updates: any) => void
  onRemove: (id: number) => void
  pricing: PricingConfig | null
}

export function NewCountertopItem({ countertop, index, onUpdate, onRemove, pricing }: NewCountertopItemProps) {
  const prices = pricing || DEFAULT_PRICING

  const calculatePrice = () => {
    const length = Number.parseFloat(countertop.length) || 0
    const width = Number.parseFloat(countertop.width) || 0
    const cutouts = Number.parseInt(countertop.cutouts) || 0
    const area = (length * width) / 1000000

    if (area === 0) return 0

    const roundedLength = Math.ceil(length / 100) * 100

    let basePrice = 0
    let widthExtraCharge = 0

    if (countertop.type === "solid-lamella") {
      if (width > 600) {
        const extraWidth = width - 600
        const extra50mmSegments = Math.ceil(extraWidth / 50)
        widthExtraCharge = extra50mmSegments * prices.newCountertop.widthSurcharge
      }

      if (countertop.thickness === "40") {
        if (roundedLength >= 900 && roundedLength <= 2150) {
          basePrice = prices.newCountertop.solid40mm.range1
        } else if (roundedLength >= 2151 && roundedLength <= 2950) {
          basePrice = prices.newCountertop.solid40mm.range2
        } else if (roundedLength >= 2951 && roundedLength <= 3500) {
          basePrice = prices.newCountertop.solid40mm.range3
        } else {
          basePrice = prices.newCountertop.solid40mm.range1
        }
      } else {
        if (roundedLength >= 900 && roundedLength <= 2150) {
          basePrice = prices.newCountertop.solid20mm.range1
        } else if (roundedLength >= 2151 && roundedLength <= 2950) {
          basePrice = prices.newCountertop.solid20mm.range2
        } else if (roundedLength >= 2951 && roundedLength <= 3500) {
          basePrice = prices.newCountertop.solid20mm.range3
        } else {
          basePrice = prices.newCountertop.solid20mm.range1
        }
      }
    } else {
      basePrice = countertop.thickness === "40" ? prices.newCountertop.spliced40mm : prices.newCountertop.spliced20mm
    }

    let totalPrice = basePrice * area + widthExtraCharge

    if (countertop.coating === "lacquer") {
      totalPrice += prices.newCountertop.coating2K * area
    }

    totalPrice += cutouts * prices.newCountertop.cutout

    return Math.round(totalPrice)
  }

  const price = calculatePrice()
  const length = Number.parseFloat(countertop.length) || 0
  const width = Number.parseFloat(countertop.width) || 0

  const showWidthWarning = countertop.type === "solid-lamella" && width > 600

  const getSolidLamellaPriceDisplay = () => {
    if (countertop.thickness === "40") {
      if (length >= 900 && length <= 2150) {
        return `${prices.newCountertop.solid40mm.range1.toLocaleString("ru-RU")} ₽/м²`
      } else if (length >= 2151 && length <= 2950) {
        return `${prices.newCountertop.solid40mm.range2.toLocaleString("ru-RU")} ₽/м²`
      } else if (length >= 2951 && length <= 3500) {
        return `${prices.newCountertop.solid40mm.range3.toLocaleString("ru-RU")} ₽/м²`
      }
      return `${prices.newCountertop.solid40mm.range1.toLocaleString("ru-RU")} - ${prices.newCountertop.solid40mm.range3.toLocaleString("ru-RU")} ₽/м²`
    } else {
      if (length >= 900 && length <= 2150) {
        return `${prices.newCountertop.solid20mm.range1.toLocaleString("ru-RU")} ₽/м²`
      } else if (length >= 2151 && length <= 2950) {
        return `${prices.newCountertop.solid20mm.range2.toLocaleString("ru-RU")} ₽/м²`
      } else if (length >= 2951 && length <= 3500) {
        return `${prices.newCountertop.solid20mm.range3.toLocaleString("ru-RU")} ₽/м²`
      }
      return `${prices.newCountertop.solid20mm.range1.toLocaleString("ru-RU")} - ${prices.newCountertop.solid20mm.range3.toLocaleString("ru-RU")} ₽/м²`
    }
  }

  const getSplicedPriceDisplay = () => {
    return countertop.thickness === "40"
      ? `${prices.newCountertop.spliced40mm.toLocaleString("ru-RU")} ₽/м²`
      : `${prices.newCountertop.spliced20mm.toLocaleString("ru-RU")} ₽/м²`
  }

  return (
    <Card className="p-4 bg-secondary/30 relative transition-all duration-200 hover:shadow-md">
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 h-8 w-8 transition-colors"
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
              className="transition-colors"
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
              className={`transition-colors ${showWidthWarning ? "border-amber-500" : ""}`}
            />
            {showWidthWarning && (
              <div className="flex items-start gap-2 text-xs text-amber-600 dark:text-amber-500 mt-1">
                <AlertCircle className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                <span>Ширина превышает стандарт 600мм. Доплата +1000₽ за каждые 50мм</span>
              </div>
            )}
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

        <div className="space-y-2">
          <Label htmlFor={`cutouts-${countertop.id}`}>Количество вырезов (плита/раковина)</Label>
          <Input
            id={`cutouts-${countertop.id}`}
            type="number"
            min="0"
            placeholder="0"
            value={countertop.cutouts || 0}
            onChange={(e) => onUpdate(countertop.id, { cutouts: e.target.value })}
            className="transition-colors"
          />
          <p className="text-xs text-muted-foreground">
            1 вырез = {prices.newCountertop.cutout.toLocaleString("ru-RU")} ₽
          </p>
        </div>

        <div className="space-y-3">
          <Label>Финишное покрытие</Label>
          <RadioGroup value={countertop.coating} onValueChange={(value) => onUpdate(countertop.id, { coating: value })}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="oil" id={`new-oil-${countertop.id}`} />
              <Label htmlFor={`new-oil-${countertop.id}`} className="font-normal cursor-pointer flex items-center">
                Масло Osmo TopOil (включено)
                <CoatingTooltip type="oil" />
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="lacquer" id={`new-lacquer-${countertop.id}`} />
              <Label htmlFor={`new-lacquer-${countertop.id}`} className="font-normal cursor-pointer flex items-center">
                2К акриловый лак (+{prices.newCountertop.coating2K.toLocaleString("ru-RU")} ₽/м²)
                <CoatingTooltip type="lacquer" />
              </Label>
            </div>
          </RadioGroup>
        </div>
      </div>
    </Card>
  )
}
