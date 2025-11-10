import { Redis } from "@upstash/redis"
import { NextResponse } from "next/server"
import { DEFAULT_SUPPLIER, type Supplier } from "@/lib/supplier-types"

const redis = new Redis({
  url: process.env.UPSTASH_KV_KV_REST_API_URL!,
  token: process.env.UPSTASH_KV_KV_REST_API_TOKEN!,
})

const SUPPLIERS_KEY = "suppliers"
const ADMIN_PASSWORD = "admin2024"

// GET - получить всех поставщиков
export async function GET() {
  try {
    let suppliers = await redis.get<Supplier[]>(SUPPLIERS_KEY)

    // Если базы нет, создаём с дефолтным поставщиком
    if (!suppliers || suppliers.length === 0) {
      suppliers = [DEFAULT_SUPPLIER]
      await redis.set(SUPPLIERS_KEY, suppliers)
    }

    return NextResponse.json(suppliers)
  } catch (error) {
    console.error("Error fetching suppliers:", error)
    return NextResponse.json([DEFAULT_SUPPLIER])
  }
}

// POST - добавить или обновить поставщика
export async function POST(request: Request) {
  try {
    const { password, action, supplier } = await request.json()

    if (password !== ADMIN_PASSWORD) {
      return NextResponse.json({ error: "Неверный пароль" }, { status: 401 })
    }

    const suppliers = (await redis.get<Supplier[]>(SUPPLIERS_KEY)) || []

    if (action === "add") {
      const newSupplier: Supplier = {
        ...supplier,
        id: supplier.id || `supplier-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      suppliers.push(newSupplier)
    } else if (action === "update") {
      const index = suppliers.findIndex((s) => s.id === supplier.id)
      if (index !== -1) {
        suppliers[index] = {
          ...supplier,
          updatedAt: new Date().toISOString(),
        }
      }
    } else if (action === "delete") {
      const filteredSuppliers = suppliers.filter((s) => s.id !== supplier.id)
      await redis.set(SUPPLIERS_KEY, filteredSuppliers)
      return NextResponse.json({ success: true })
    }

    await redis.set(SUPPLIERS_KEY, suppliers)
    return NextResponse.json({ success: true, suppliers })
  } catch (error) {
    console.error("Error managing suppliers:", error)
    return NextResponse.json({ error: "Ошибка обработки" }, { status: 500 })
  }
}
