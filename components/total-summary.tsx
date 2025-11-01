"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Copy, Download, Calculator } from "lucide-react"
import { useState, useEffect } from "react"
import { saveCalculation } from "@/lib/storage"
import type { PricingConfig } from "@/lib/pricing-types"
import { DEFAULT_PRICING } from "@/lib/pricing-types"

interface TotalSummaryProps {
  restorationCountertops: any[]
  newCountertops: any[]
  pricing: PricingConfig | null
}

export function TotalSummary({ restorationCountertops, newCountertops, pricing }: TotalSummaryProps) {
  const [copied, setCopied] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [isCalculated, setIsCalculated] = useState(false)

  const prices = pricing || DEFAULT_PRICING

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    setIsCalculated(false)
  }, [restorationCountertops, newCountertops])

  const calculateRestorationPrice = (countertop: any) => {
    const length = Number.parseFloat(countertop.length) || 0
    const width = Number.parseFloat(countertop.width) || 0
    const area = (length * width) / 1000000

    if (area === 0) return 0

    const basePrice = countertop.material === "solid" ? prices.restoration.solid : prices.restoration.veneer
    let totalPrice = basePrice * area

    if (countertop.milling) {
      totalPrice += prices.restoration.milling
    }

    if (countertop.coating === "lacquer") {
      totalPrice += prices.restoration.coating2K * area
    }

    return Math.round(totalPrice)
  }

  const calculateNewPrice = (countertop: any) => {
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

  const calculateTotalArea = () => {
    let totalArea = 0

    restorationCountertops.forEach((c) => {
      const length = Number.parseFloat(c.length) || 0
      const width = Number.parseFloat(c.width) || 0
      totalArea += (length * width) / 1000000
    })

    newCountertops.forEach((c) => {
      const length = Number.parseFloat(c.length) || 0
      const width = Number.parseFloat(c.width) || 0
      totalArea += (length * width) / 1000000
    })

    return totalArea
  }

  const calculateDiscount = (area: number) => {
    if (area < 3) return 0

    const discount = 3 + 0.75 * (area - 3)
    return Math.min(discount, 12)
  }

  const restorationTotal = restorationCountertops.reduce((sum, c) => sum + calculateRestorationPrice(c), 0)
  const newTotal = newCountertops.reduce((sum, c) => sum + calculateNewPrice(c), 0)
  const subtotal = restorationTotal + newTotal

  const totalArea = calculateTotalArea()
  const discountPercent = calculateDiscount(totalArea)
  const discountAmount = Math.round(subtotal * (discountPercent / 100))
  const finalTotal = subtotal - discountAmount

  const handleCalculate = () => {
    if (mounted && finalTotal > 0) {
      setIsCalculated(true)
      saveCalculation(restorationCountertops, newCountertops, finalTotal)
    }
  }

  const generateReport = () => {
    let report = "РАСЧЕТ СТОИМОСТИ СТОЛЕШНИЦ\n"
    report += "=".repeat(50) + "\n\n"

    if (restorationCountertops.length > 0) {
      report += "РЕСТАВРАЦИЯ:\n"
      restorationCountertops.forEach((c, idx) => {
        const length = Number.parseFloat(c.length) || 0
        const width = Number.parseFloat(c.width) || 0
        const area = (length * width) / 1000000
        const price = calculateRestorationPrice(c)

        report += `${idx + 1}. ${length}×${width}мм (${area.toFixed(2)}м²)\n`
        report += `   ${c.material === "solid" ? "Массив" : "Шпон"} | `
        report += `${c.coating === "oil" ? "Масло Osmo" : "2К Лак"}`
        if (c.milling) report += ` | Фрезеровка`
        report += `\n   Стоимость: ${price.toLocaleString("ru-RU")} ₽\n\n`
      })
      report += `Итого реставрация: ${restorationTotal.toLocaleString("ru-RU")} ₽\n\n`
    }

    if (newCountertops.length > 0) {
      report += "ИЗГОТОВЛЕНИЕ:\n"
      newCountertops.forEach((c, idx) => {
        const length = Number.parseFloat(c.length) || 0
        const width = Number.parseFloat(c.width) || 0
        const cutouts = Number.parseInt(c.cutouts) || 0
        const area = (length * width) / 1000000
        const price = calculateNewPrice(c)

        report += `${idx + 1}. ${length}×${width}мм (${area.toFixed(2)}м²)\n`
        report += `   ${c.thickness}мм | `
        report += `${c.type === "solid-lamella" ? "Цельноламельная" : "Сращенная"} | `
        report += `${c.coating === "oil" ? "Масло Osmo" : "2К Лак"}`
        if (cutouts > 0) {
          report += `\n   Вырезы: ${cutouts} шт`
        }
        if (c.type === "solid-lamella" && width > 600) {
          report += `\n   Доплата за ширину >600мм`
        }
        report += `\n   Стоимость: ${price.toLocaleString("ru-RU")} ₽\n\n`
      })
      report += `Итого изготовление: ${newTotal.toLocaleString("ru-RU")} ₽\n\n`
    }

    report += "=".repeat(50) + "\n"
    report += `Общая площадь: ${totalArea.toFixed(2)} м²\n`
    report += `Сумма: ${subtotal.toLocaleString("ru-RU")} ₽\n`

    if (discountPercent > 0) {
      report += `Скидка ${discountPercent.toFixed(1)}%: -${discountAmount.toLocaleString("ru-RU")} ₽\n`
    }

    report += `\nИТОГО К ОПЛАТЕ: ${finalTotal.toLocaleString("ru-RU")} ₽\n`

    return report
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generateReport())
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  const exportToPDF = async () => {
    try {
      const { jsPDF } = await import("jspdf")

      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      })

      let yPos = 20

      doc.setFontSize(16)
      doc.setFont("helvetica", "bold")
      doc.text("RASCHET STOIMOSTI STOLESHNIC", 105, yPos, { align: "center" })
      yPos += 15

      doc.setFont("helvetica", "normal")
      doc.setFontSize(10)

      if (restorationCountertops.length > 0) {
        doc.setFont("helvetica", "bold")
        doc.text("RESTAVRACIYA:", 20, yPos)
        yPos += 6
        doc.setFont("helvetica", "normal")

        restorationCountertops.forEach((c, idx) => {
          const length = Number.parseFloat(c.length) || 0
          const width = Number.parseFloat(c.width) || 0
          const area = (length * width) / 1000000
          const price = calculateRestorationPrice(c)

          doc.text(`${idx + 1}. ${length}x${width}mm (${area.toFixed(2)}m2)`, 25, yPos)
          yPos += 5
          const material = c.material === "solid" ? "Massiv" : "Shpon"
          const coating = c.coating === "oil" ? "Maslo Osmo" : "2K Lak"
          const milling = c.milling ? " | Frezerovka" : ""
          doc.text(`   ${material} | ${coating}${milling}`, 25, yPos)
          yPos += 5
          doc.text(`   ${price.toLocaleString("ru-RU")} RUB`, 25, yPos)
          yPos += 6
        })

        doc.setFont("helvetica", "bold")
        doc.text(`Itogo: ${restorationTotal.toLocaleString("ru-RU")} RUB`, 25, yPos)
        yPos += 10
      }

      if (newCountertops.length > 0) {
        doc.setFont("helvetica", "bold")
        doc.text("IZGOTOVLENIE:", 20, yPos)
        yPos += 6
        doc.setFont("helvetica", "normal")

        newCountertops.forEach((c, idx) => {
          const length = Number.parseFloat(c.length) || 0
          const width = Number.parseFloat(c.width) || 0
          const cutouts = Number.parseInt(c.cutouts) || 0
          const area = (length * width) / 1000000
          const price = calculateNewPrice(c)

          doc.text(`${idx + 1}. ${length}x${width}mm (${area.toFixed(2)}m2)`, 25, yPos)
          yPos += 5
          const type = c.type === "solid-lamella" ? "Cel'nolamel'naya" : "Srashchennaya"
          const coating = c.coating === "oil" ? "Maslo" : "Lak"
          doc.text(`   ${c.thickness}mm | ${type} | ${coating}`, 25, yPos)
          yPos += 5
          if (cutouts > 0) {
            doc.text(`   Vyrezy: ${cutouts} sht`, 25, yPos)
            yPos += 5
          }
          if (c.type === "solid-lamella" && width > 600) {
            doc.text(`   Doplata za shirinu >600mm`, 25, yPos)
            yPos += 5
          }
          doc.text(`   ${price.toLocaleString("ru-RU")} RUB`, 25, yPos)
          yPos += 6
        })

        doc.setFont("helvetica", "bold")
        doc.text(`Itogo: ${newTotal.toLocaleString("ru-RU")} RUB`, 25, yPos)
        yPos += 10
      }

      doc.setDrawColor(0)
      doc.line(20, yPos, 190, yPos)
      yPos += 7

      doc.setFont("helvetica", "normal")
      doc.text(`Obshchaya ploshchad': ${totalArea.toFixed(2)} m2`, 20, yPos)
      yPos += 6
      doc.text(`Summa: ${subtotal.toLocaleString("ru-RU")} RUB`, 20, yPos)
      yPos += 6

      if (discountPercent > 0) {
        doc.text(`Skidka ${discountPercent.toFixed(1)}%: -${discountAmount.toLocaleString("ru-RU")} RUB`, 20, yPos)
        yPos += 6
      }

      yPos += 3
      doc.setFont("helvetica", "bold")
      doc.setFontSize(12)
      doc.text("ITOGO K OPLATE:", 20, yPos)
      doc.text(`${finalTotal.toLocaleString("ru-RU")} RUB`, 190, yPos, { align: "right" })

      doc.save(`raschet-${new Date().toISOString().split("T")[0]}.pdf`)
    } catch (error) {
      console.error("PDF generation error:", error)
    }
  }

  if (subtotal === 0) {
    return null
  }

  return (
    <Card className="border-2 border-primary/20 bg-card">
      <CardHeader>
        <CardTitle className="text-2xl">Итоговая стоимость</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {restorationTotal > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Реставрация столешниц:</span>
              <span className="font-semibold text-lg">{restorationTotal.toLocaleString("ru-RU")} ₽</span>
            </div>
          )}

          {newTotal > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Изготовление столешниц:</span>
              <span className="font-semibold text-lg">{newTotal.toLocaleString("ru-RU")} ₽</span>
            </div>
          )}

          <Separator />

          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Общая площадь:</span>
            <span className="font-semibold">{totalArea.toFixed(2)} м²</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Промежуточная сумма:</span>
            <span className="font-semibold text-lg">{subtotal.toLocaleString("ru-RU")} ₽</span>
          </div>

          {discountPercent > 0 && (
            <>
              <div className="flex justify-between items-center text-accent">
                <span className="font-medium">Скидка ({discountPercent.toFixed(1)}%):</span>
                <span className="font-semibold text-lg">-{discountAmount.toLocaleString("ru-RU")} ₽</span>
              </div>

              <Separator />
            </>
          )}

          <div className="flex justify-between items-center pt-2">
            <span className="text-xl font-bold">Итого к оплате:</span>
            <span className="text-3xl font-bold text-accent">{finalTotal.toLocaleString("ru-RU")} ₽</span>
          </div>
        </div>

        {!isCalculated && (
          <Button onClick={handleCalculate} className="w-full" size="lg">
            <Calculator className="h-5 w-5 mr-2" />
            Рассчитать и сохранить
          </Button>
        )}

        {isCalculated && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button onClick={copyToClipboard} className="w-full bg-transparent" variant="outline">
              <Copy className="h-4 w-4 mr-2" />
              {copied ? "Скопировано!" : "Копировать"}
            </Button>

            <Button onClick={exportToPDF} className="w-full bg-transparent" variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Скачать PDF
            </Button>
          </div>
        )}

        {discountPercent === 0 && totalArea > 0 && totalArea < 3 && (
          <div className="mt-4 p-3 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground text-center">
              Добавьте ещё {(3 - totalArea).toFixed(2)} м² для получения скидки
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
