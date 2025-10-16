"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Copy, Download } from "lucide-react"
import { useState, useEffect } from "react"
import { saveCalculation } from "@/lib/storage"

interface TotalSummaryProps {
  restorationCountertops: any[]
  newCountertops: any[]
}

export function TotalSummary({ restorationCountertops, newCountertops }: TotalSummaryProps) {
  const [copied, setCopied] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const calculateRestorationPrice = (countertop: any) => {
    const length = Number.parseFloat(countertop.length) || 0
    const width = Number.parseFloat(countertop.width) || 0
    const area = (length * width) / 1000000

    if (area === 0) return 0

    const basePrice = countertop.material === "solid" ? 10500 : 12500
    let totalPrice = basePrice * area

    if (countertop.milling) {
      totalPrice += 1000
    }

    if (countertop.coating === "lacquer") {
      totalPrice += 4000 * area
    }

    return Math.round(totalPrice)
  }

  const calculateNewPrice = (countertop: any) => {
    const length = Number.parseFloat(countertop.length) || 0
    const width = Number.parseFloat(countertop.width) || 0
    const area = (length * width) / 1000000

    if (area === 0) return 0

    let basePrice = 0
    let widthExtraCharge = 0

    if (countertop.type === "solid-lamella") {
      if (width > 600) {
        const extraWidth = width - 600
        const extra50mmSegments = Math.ceil(extraWidth / 50)
        widthExtraCharge = extra50mmSegments * 1000
      }

      if (countertop.thickness === "40") {
        if (length >= 900 && length <= 2150) {
          basePrice = 29640
        } else if (length >= 2151 && length <= 2950) {
          basePrice = 32490
        } else if (length >= 2951 && length <= 3500) {
          basePrice = 33791
        } else {
          basePrice = 29640
        }
      } else {
        if (length >= 900 && length <= 2150) {
          basePrice = 22990
        } else if (length >= 2151 && length <= 2950) {
          basePrice = 24282
        } else if (length >= 2951 && length <= 3500) {
          basePrice = 25811
        } else {
          basePrice = 22990
        }
      }
    } else {
      basePrice = countertop.thickness === "40" ? 21793 : 19979
    }

    let totalPrice = basePrice * area + widthExtraCharge

    if (countertop.coating === "lacquer") {
      totalPrice += 4000 * area
    }

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

  const generateReport = () => {
    let report = "РАСЧЕТ СТОИМОСТИ СТОЛЕШНИЦ\n"
    report += "=".repeat(40) + "\n\n"

    if (restorationCountertops.length > 0) {
      report += "РЕСТАВРАЦИЯ:\n"
      restorationCountertops.forEach((c, idx) => {
        const length = Number.parseFloat(c.length) || 0
        const width = Number.parseFloat(c.width) || 0
        const area = (length * width) / 1000000
        const price = calculateRestorationPrice(c)

        report += `${idx + 1}. ${length}×${width}мм (${area.toFixed(2)}м²) | `
        report += `${c.material === "solid" ? "Массив" : "Шпон"} | `
        report += `${c.coating === "oil" ? "Масло" : "Лак"}`
        if (c.milling) report += ` | Фрезеровка`
        report += ` → ${price.toLocaleString("ru-RU")}₽\n`
      })
      report += `Итого: ${restorationTotal.toLocaleString("ru-RU")}₽\n\n`
    }

    if (newCountertops.length > 0) {
      report += "ИЗГОТОВЛЕНИЕ:\n"
      newCountertops.forEach((c, idx) => {
        const length = Number.parseFloat(c.length) || 0
        const width = Number.parseFloat(c.width) || 0
        const area = (length * width) / 1000000
        const price = calculateNewPrice(c)

        report += `${idx + 1}. ${length}×${width}мм (${area.toFixed(2)}м²) | `
        report += `${c.thickness}мм | `
        report += `${c.type === "solid-lamella" ? "Цельноламельная" : "Сращенная"} | `
        report += `${c.coating === "oil" ? "Масло" : "Лак"}`
        report += ` → ${price.toLocaleString("ru-RU")}₽\n`
      })
      report += `Итого: ${newTotal.toLocaleString("ru-RU")}₽\n\n`
    }

    report += "=".repeat(40) + "\n"
    report += `Площадь: ${totalArea.toFixed(2)}м² | Сумма: ${subtotal.toLocaleString("ru-RU")}₽\n`

    if (discountPercent > 0) {
      report += `Скидка: ${discountPercent.toFixed(1)}% (-${discountAmount.toLocaleString("ru-RU")}₽)\n`
    }

    report += `\nИТОГО: ${finalTotal.toLocaleString("ru-RU")}₽\n`

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
    const { jsPDF } = await import("jspdf")
    const doc = new jsPDF()

    doc.setFont("helvetica", "bold")
    doc.setFontSize(16)
    doc.text("РАСЧЕТ СТОИМОСТИ СТОЛЕШНИЦ", 20, 20)

    let yPos = 35
    doc.setFont("helvetica", "normal")
    doc.setFontSize(10)

    if (restorationCountertops.length > 0) {
      doc.setFont("helvetica", "bold")
      doc.text("РЕСТАВРАЦИЯ:", 20, yPos)
      yPos += 7
      doc.setFont("helvetica", "normal")

      restorationCountertops.forEach((c, idx) => {
        const length = Number.parseFloat(c.length) || 0
        const width = Number.parseFloat(c.width) || 0
        const area = (length * width) / 1000000
        const price = calculateRestorationPrice(c)

        const line = `${idx + 1}. ${length}x${width}mm (${area.toFixed(2)}m²) | ${c.material === "solid" ? "Массив" : "Шпон"} | ${c.coating === "oil" ? "Масло" : "Лак"}${c.milling ? " | Фрезеровка" : ""}`
        doc.text(line, 20, yPos)
        doc.text(`${price.toLocaleString("ru-RU")} ₽`, 190, yPos, { align: "right" })
        yPos += 6
      })

      doc.setFont("helvetica", "bold")
      doc.text(`Итого: ${restorationTotal.toLocaleString("ru-RU")} ₽`, 20, yPos)
      yPos += 10
    }

    if (newCountertops.length > 0) {
      doc.setFont("helvetica", "bold")
      doc.text("ИЗГОТОВЛЕНИЕ:", 20, yPos)
      yPos += 7
      doc.setFont("helvetica", "normal")

      newCountertops.forEach((c, idx) => {
        const length = Number.parseFloat(c.length) || 0
        const width = Number.parseFloat(c.width) || 0
        const area = (length * width) / 1000000
        const price = calculateNewPrice(c)

        const line = `${idx + 1}. ${length}x${width}mm (${area.toFixed(2)}m²) | ${c.thickness}mm | ${c.type === "solid-lamella" ? "Цельноламельная" : "Сращенная"} | ${c.coating === "oil" ? "Масло" : "Лак"}`
        doc.text(line, 20, yPos)
        doc.text(`${price.toLocaleString("ru-RU")} ₽`, 190, yPos, { align: "right" })
        yPos += 6
      })

      doc.setFont("helvetica", "bold")
      doc.text(`Итого: ${newTotal.toLocaleString("ru-RU")} ₽`, 20, yPos)
      yPos += 10
    }

    doc.setDrawColor(0)
    doc.line(20, yPos, 190, yPos)
    yPos += 7

    doc.setFont("helvetica", "normal")
    doc.text(`Площадь: ${totalArea.toFixed(2)} м²`, 20, yPos)
    doc.text(`Сумма: ${subtotal.toLocaleString("ru-RU")} ₽`, 190, yPos, { align: "right" })
    yPos += 6

    if (discountPercent > 0) {
      doc.text(`Скидка: ${discountPercent.toFixed(1)}%`, 20, yPos)
      doc.text(`-${discountAmount.toLocaleString("ru-RU")} ₽`, 190, yPos, { align: "right" })
      yPos += 6
    }

    yPos += 3
    doc.setFont("helvetica", "bold")
    doc.setFontSize(14)
    doc.text("ИТОГО:", 20, yPos)
    doc.text(`${finalTotal.toLocaleString("ru-RU")} ₽`, 190, yPos, { align: "right" })

    doc.save(`расчет-столешниц-${new Date().toLocaleDateString("ru-RU")}.pdf`)
  }

  useEffect(() => {
    if (mounted && finalTotal > 0) {
      saveCalculation(restorationCountertops, newCountertops, finalTotal)
    }
  }, [finalTotal, mounted, restorationCountertops, newCountertops])

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
