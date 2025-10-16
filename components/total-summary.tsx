"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Copy, Download, Save } from "lucide-react"
import { useState, useEffect } from "react"
import { saveCalculation } from "@/lib/storage"

interface TotalSummaryProps {
  restorationCountertops: any[]
  newCountertops: any[]
}

export function TotalSummary({ restorationCountertops, newCountertops }: TotalSummaryProps) {
  const [copied, setCopied] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [saved, setSaved] = useState(false)

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

    const roundedLength = Math.ceil(length / 100) * 100

    let basePrice = 0
    let widthExtraCharge = 0

    if (countertop.type === "solid-lamella") {
      if (width > 600) {
        const extraWidth = width - 600
        const extra50mmSegments = Math.ceil(extraWidth / 50)
        widthExtraCharge = extra50mmSegments * 1000
      }

      if (countertop.thickness === "40") {
        if (roundedLength >= 900 && roundedLength <= 2150) {
          basePrice = 29640
        } else if (roundedLength >= 2151 && roundedLength <= 2950) {
          basePrice = 32490
        } else if (roundedLength >= 2951 && roundedLength <= 3500) {
          basePrice = 33791
        } else {
          basePrice = 29640
        }
      } else {
        if (roundedLength >= 900 && roundedLength <= 2150) {
          basePrice = 22990
        } else if (roundedLength >= 2151 && roundedLength <= 2950) {
          basePrice = 24282
        } else if (roundedLength >= 2951 && roundedLength <= 3500) {
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
        report += `\n   Стоимость: ${price.toLocaleString("ru-RU")}₽\n\n`
      })
      report += `Итого реставрация: ${restorationTotal.toLocaleString("ru-RU")}₽\n\n`
    }

    if (newCountertops.length > 0) {
      report += "ИЗГОТОВЛЕНИЕ:\n"
      newCountertops.forEach((c, idx) => {
        const length = Number.parseFloat(c.length) || 0
        const width = Number.parseFloat(c.width) || 0
        const area = (length * width) / 1000000
        const price = calculateNewPrice(c)

        report += `${idx + 1}. ${length}×${width}мм (${area.toFixed(2)}м²)\n`
        report += `   ${c.thickness}мм | `
        report += `${c.type === "solid-lamella" ? "Цельноламельная" : "Сращенная"} | `
        report += `${c.coating === "oil" ? "Масло Osmo" : "2К Лак"}`
        if (c.type === "solid-lamella" && width > 600) {
          report += `\n   Доплата за ширину >600мм`
        }
        report += `\n   Стоимость: ${price.toLocaleString("ru-RU")}₽\n\n`
      })
      report += `Итого изготовление: ${newTotal.toLocaleString("ru-RU")}₽\n\n`
    }

    report += "=".repeat(50) + "\n"
    report += `Общая площадь: ${totalArea.toFixed(2)}м²\n`
    report += `Сумма: ${subtotal.toLocaleString("ru-RU")}₽\n`

    if (discountPercent > 0) {
      report += `Скидка ${discountPercent.toFixed(1)}%: -${discountAmount.toLocaleString("ru-RU")}₽\n`
    }

    report += `\nИТОГО К ОПЛАТЕ: ${finalTotal.toLocaleString("ru-RU")}₽\n`

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

  const handleSaveCalculation = () => {
    if (mounted && finalTotal > 0) {
      saveCalculation(restorationCountertops, newCountertops, finalTotal)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
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

      // Use built-in fonts and proper encoding
      let yPos = 20

      // Title
      doc.setFontSize(18)
      doc.setFont("helvetica", "bold")
      doc.text("RASCHET STOIMOSTI STOLESHNIC", 105, yPos, { align: "center" })
      yPos += 10
      doc.setFontSize(10)
      doc.text("(Calculation of Countertop Cost)", 105, yPos, { align: "center" })
      yPos += 15

      doc.setFont("helvetica", "normal")
      doc.setFontSize(11)

      if (restorationCountertops.length > 0) {
        doc.setFont("helvetica", "bold")
        doc.text("RESTAVRACIYA (Restoration):", 20, yPos)
        yPos += 7
        doc.setFont("helvetica", "normal")

        restorationCountertops.forEach((c, idx) => {
          const length = Number.parseFloat(c.length) || 0
          const width = Number.parseFloat(c.width) || 0
          const area = (length * width) / 1000000
          const price = calculateRestorationPrice(c)

          doc.text(`${idx + 1}. ${length}x${width}mm (${area.toFixed(2)}m²)`, 25, yPos)
          yPos += 5
          const details = `   ${c.material === "solid" ? "Massiv" : "Shpon"} | ${c.coating === "oil" ? "Maslo Osmo" : "2K Lak"}${c.milling ? " | Frezerovka" : ""}`
          doc.text(details, 25, yPos)
          yPos += 5
          doc.text(`   ${price.toLocaleString("ru-RU")} RUB`, 25, yPos)
          yPos += 7
        })

        doc.setFont("helvetica", "bold")
        doc.text(`Itogo: ${restorationTotal.toLocaleString("ru-RU")} RUB`, 25, yPos)
        yPos += 10
      }

      if (newCountertops.length > 0) {
        doc.setFont("helvetica", "bold")
        doc.text("IZGOTOVLENIE (Manufacturing):", 20, yPos)
        yPos += 7
        doc.setFont("helvetica", "normal")

        newCountertops.forEach((c, idx) => {
          const length = Number.parseFloat(c.length) || 0
          const width = Number.parseFloat(c.width) || 0
          const area = (length * width) / 1000000
          const price = calculateNewPrice(c)

          doc.text(`${idx + 1}. ${length}x${width}mm (${area.toFixed(2)}m²)`, 25, yPos)
          yPos += 5
          const details = `   ${c.thickness}mm | ${c.type === "solid-lamella" ? "Cel'nolamel'naya" : "Srashchennaya"} | ${c.coating === "oil" ? "Maslo" : "Lak"}`
          doc.text(details, 25, yPos)
          yPos += 5
          if (c.type === "solid-lamella" && width > 600) {
            doc.text(`   Doplata za shirinu >600mm`, 25, yPos)
            yPos += 5
          }
          doc.text(`   ${price.toLocaleString("ru-RU")} RUB`, 25, yPos)
          yPos += 7
        })

        doc.setFont("helvetica", "bold")
        doc.text(`Itogo: ${newTotal.toLocaleString("ru-RU")} RUB`, 25, yPos)
        yPos += 10
      }

      doc.setDrawColor(0)
      doc.line(20, yPos, 190, yPos)
      yPos += 7

      doc.setFont("helvetica", "normal")
      doc.setFontSize(11)
      doc.text(`Obshchaya ploshchad': ${totalArea.toFixed(2)} m²`, 20, yPos)
      yPos += 6
      doc.text(`Summa: ${subtotal.toLocaleString("ru-RU")} RUB`, 20, yPos)
      yPos += 6

      if (discountPercent > 0) {
        doc.text(`Skidka ${discountPercent.toFixed(1)}%: -${discountAmount.toLocaleString("ru-RU")} RUB`, 20, yPos)
        yPos += 6
      }

      yPos += 3
      doc.setFont("helvetica", "bold")
      doc.setFontSize(14)
      doc.text("ITOGO K OPLATE:", 20, yPos)
      doc.text(`${finalTotal.toLocaleString("ru-RU")} RUB`, 190, yPos, { align: "right" })

      doc.save(`raschet-stoleshnic-${new Date().toLocaleDateString("ru-RU").replace(/\./g, "-")}.pdf`)
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

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Button onClick={handleSaveCalculation} className="w-full" variant="default">
            <Save className="h-4 w-4 mr-2" />
            {saved ? "Сохранено!" : "Сохранить"}
          </Button>

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
