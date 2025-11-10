"use client"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Plus, Trash2, Upload, X } from "lucide-react"
import * as XLSX from "xlsx"
import type { Supplier, Material } from "@/lib/supplier-types"

export function SupplierAdmin({ password }: { password: string }) {
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [newMaterial, setNewMaterial] = useState<Partial<Material>>({})
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    loadSuppliers()
  }, [])

  const loadSuppliers = async () => {
    const res = await fetch("/api/suppliers")
    const data = await res.json()
    setSuppliers(data)
  }

  const handleSaveSupplier = async () => {
    if (!selectedSupplier) return

    setIsLoading(true)
    const action = suppliers.find((s) => s.id === selectedSupplier.id) ? "update" : "add"

    await fetch("/api/suppliers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password, action, supplier: selectedSupplier }),
    })

    await loadSuppliers()
    setSelectedSupplier(null)
    setIsLoading(false)
  }

  const handleDeleteSupplier = async (id: string) => {
    if (!confirm("Удалить поставщика?")) return

    setIsLoading(true)
    await fetch("/api/suppliers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password, action: "delete", supplier: { id } }),
    })

    await loadSuppliers()
    setIsLoading(false)
  }

  const handleAddMaterial = () => {
    if (!selectedSupplier || !newMaterial.wood || !newMaterial.price) return

    const material: Material = {
      id: `mat-${Date.now()}`,
      wood: newMaterial.wood || "",
      shieldType: newMaterial.shieldType || "Цельноламельный",
      grade: newMaterial.grade || "—",
      thickness: Number.parseInt(newMaterial.thickness as any) || 40,
      width: Number.parseInt(newMaterial.width as any) || 620,
      length: Number.parseInt(newMaterial.length as any) || 1000,
      price: Number.parseInt(newMaterial.price as any) || 0,
    }

    setSelectedSupplier({
      ...selectedSupplier,
      materials: [...selectedSupplier.materials, material],
    })

    setNewMaterial({})
  }

  const handleDeleteMaterial = (materialId: string) => {
    if (!selectedSupplier) return
    setSelectedSupplier({
      ...selectedSupplier,
      materials: selectedSupplier.materials.filter((m) => m.id !== materialId),
    })
  }

  const handleExcelUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedSupplier || !event.target.files?.[0]) return

    const file = event.target.files[0]
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: "array" })
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
        const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 }) as any[][]

        // Пропускаем заголовок (первую строку)
        const materials: Material[] = []
        for (let i = 1; i < jsonData.length; i++) {
          const row = jsonData[i]
          if (!row || row.length < 7) continue

          // Ожидаемый формат: Порода/тип щита/сорт/толщина/ширина/длина/цена
          const wood = String(row[0] || "").trim()
          const shieldType = String(row[1] || "").trim()
          const grade = String(row[2] || "—").trim() || "—"
          const thickness = Number.parseFloat(String(row[3] || 0)) || 0
          const width = Number.parseFloat(String(row[4] || 0)) || 0
          const length = Number.parseFloat(String(row[5] || 0)) || 0
          const price = Number.parseFloat(String(row[6] || 0)) || 0

          if (wood && thickness > 0 && width > 0 && length > 0 && price > 0) {
            materials.push({
              id: `mat-${Date.now()}-${i}`,
              wood,
              shieldType,
              grade,
              thickness,
              width,
              length,
              price,
            })
          }
        }

        if (materials.length > 0) {
          setSelectedSupplier({
            ...selectedSupplier,
            materials: [...selectedSupplier.materials, ...materials],
          })
          alert(`Загружено ${materials.length} позиций из Excel`)
        } else {
          alert("Не удалось загрузить данные из Excel. Проверьте формат файла.")
        }
      } catch (error) {
        console.error("Error parsing Excel:", error)
        alert("Ошибка при чтении Excel файла")
      }

      // Сброс input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }

    reader.readAsArrayBuffer(file)
  }

  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        {/* Список поставщиков */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold">Поставщики</h3>
            <Button
              size="sm"
              onClick={() =>
                setSelectedSupplier({
                  id: `supplier-${Date.now()}`,
                  name: "",
                  materials: [],
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                })
              }
            >
              <Plus className="h-4 w-4 mr-1" />
              Добавить
            </Button>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {suppliers.map((supplier) => (
              <Card
                key={supplier.id}
                className="p-3 flex justify-between items-center cursor-pointer hover:bg-accent transition-colors"
                onClick={() => setSelectedSupplier(supplier)}
              >
                <div>
                  <div className="font-medium">{supplier.name}</div>
                  <div className="text-sm text-muted-foreground">{supplier.materials.length} позиций</div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDeleteSupplier(supplier.id)
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </Card>
            ))}
          </div>
        </div>

        {/* Редактор поставщика */}
        <div className="space-y-4">
          {selectedSupplier ? (
            <>
              <div>
                <Label htmlFor="supplierName">Название поставщика</Label>
                <Input
                  id="supplierName"
                  value={selectedSupplier.name}
                  onChange={(e) =>
                    setSelectedSupplier({
                      ...selectedSupplier,
                      name: e.target.value,
                    })
                  }
                />
              </div>

              <div className="border rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium text-sm">Добавить материал</h4>
                  <div className="flex gap-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".xlsx,.xls"
                      onChange={handleExcelUpload}
                      className="hidden"
                      id="excel-upload"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      type="button"
                    >
                      <Upload className="h-4 w-4 mr-1" />
                      Загрузить Excel
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    placeholder="Порода (напр. Дуб)"
                    value={newMaterial.wood || ""}
                    onChange={(e) => setNewMaterial({ ...newMaterial, wood: e.target.value })}
                  />
                  <Input
                    placeholder="Тип (Цельноламельный)"
                    value={newMaterial.shieldType || ""}
                    onChange={(e) => setNewMaterial({ ...newMaterial, shieldType: e.target.value })}
                  />
                  <Input
                    placeholder="Сорт (—)"
                    value={newMaterial.grade || ""}
                    onChange={(e) => setNewMaterial({ ...newMaterial, grade: e.target.value })}
                  />
                  <Input
                    type="number"
                    placeholder="Толщина (мм)"
                    value={newMaterial.thickness || ""}
                    onChange={(e) => setNewMaterial({ ...newMaterial, thickness: e.target.value })}
                  />
                  <Input
                    type="number"
                    placeholder="Ширина (мм)"
                    value={newMaterial.width || ""}
                    onChange={(e) => setNewMaterial({ ...newMaterial, width: e.target.value })}
                  />
                  <Input
                    type="number"
                    placeholder="Длина (мм)"
                    value={newMaterial.length || ""}
                    onChange={(e) => setNewMaterial({ ...newMaterial, length: e.target.value })}
                  />
                  <Input
                    type="number"
                    placeholder="Цена (₽)"
                    value={newMaterial.price || ""}
                    onChange={(e) => setNewMaterial({ ...newMaterial, price: e.target.value })}
                    className="col-span-2"
                  />
                </div>
                <div className="text-xs text-muted-foreground">
                  Формат Excel: Порода | Тип щита | Сорт | Толщина (мм) | Ширина (мм) | Длина (мм) | Цена (₽)
                </div>
                <Button size="sm" onClick={handleAddMaterial} className="w-full">
                  <Plus className="h-4 w-4 mr-1" />
                  Добавить позицию
                </Button>
              </div>

              <div className="text-sm">
                <p className="font-medium mb-2">Материалов: {selectedSupplier.materials.length}</p>
                <div className="max-h-64 overflow-y-auto space-y-2">
                  {selectedSupplier.materials.map((m, idx) => (
                    <div key={m.id} className="grid grid-cols-7 gap-2 items-center">
                      <Input
                        value={m.wood}
                        onChange={(e) => {
                          const next = [...selectedSupplier.materials]
                          next[idx] = { ...next[idx], wood: e.target.value }
                          setSelectedSupplier({ ...selectedSupplier, materials: next })
                        }}
                      />
                      <Input
                        value={m.shieldType}
                        onChange={(e) => {
                          const next = [...selectedSupplier.materials]
                          next[idx] = { ...next[idx], shieldType: e.target.value }
                          setSelectedSupplier({ ...selectedSupplier, materials: next })
                        }}
                      />
                      <Input
                        value={m.grade}
                        onChange={(e) => {
                          const next = [...selectedSupplier.materials]
                          next[idx] = { ...next[idx], grade: e.target.value }
                          setSelectedSupplier({ ...selectedSupplier, materials: next })
                        }}
                      />
                      <Input
                        type="number"
                        value={m.thickness}
                        onChange={(e) => {
                          const next = [...selectedSupplier.materials]
                          next[idx] = { ...next[idx], thickness: Number.parseInt(e.target.value || "0") }
                          setSelectedSupplier({ ...selectedSupplier, materials: next })
                        }}
                      />
                      <Input
                        type="number"
                        value={m.width}
                        onChange={(e) => {
                          const next = [...selectedSupplier.materials]
                          next[idx] = { ...next[idx], width: Number.parseInt(e.target.value || "0") }
                          setSelectedSupplier({ ...selectedSupplier, materials: next })
                        }}
                      />
                      <Input
                        type="number"
                        value={m.length}
                        onChange={(e) => {
                          const next = [...selectedSupplier.materials]
                          next[idx] = { ...next[idx], length: Number.parseInt(e.target.value || "0") }
                          setSelectedSupplier({ ...selectedSupplier, materials: next })
                        }}
                      />
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          value={m.price}
                          onChange={(e) => {
                            const next = [...selectedSupplier.materials]
                            next[idx] = { ...next[idx], price: Number.parseInt(e.target.value || "0") }
                            setSelectedSupplier({ ...selectedSupplier, materials: next })
                          }}
                        />
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteMaterial(m.id)}>
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSaveSupplier} disabled={isLoading} className="flex-1">
                  Сохранить
                </Button>
                <Button variant="outline" onClick={() => setSelectedSupplier(null)}>
                  Отмена
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center text-muted-foreground py-8">Выберите поставщика для редактирования</div>
          )}
        </div>
      </div>
    </div>
  )
}
