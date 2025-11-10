import { Redis } from "@upstash/redis"
import { NextResponse } from "next/server"
import { DEFAULT_PRICING, type PricingConfig } from "@/lib/pricing-types"

const redis = new Redis({
  url: process.env.UPSTASH_KV_KV_REST_API_URL!,
  token: process.env.UPSTASH_KV_KV_REST_API_TOKEN!,
})

const PRICING_KEY = "countertop_pricing"
const ADMIN_PASSWORD = "admin2024" // Измените на свой пароль

// Функция для слияния pricing с дефолтными значениями
function mergeWithDefaults(pricing: PricingConfig | null): PricingConfig {
  if (!pricing) return DEFAULT_PRICING

  return {
    ...DEFAULT_PRICING,
    ...pricing,
    restoration: {
      ...DEFAULT_PRICING.restoration,
      ...(pricing.restoration || {}),
    },
    newCountertop: {
      ...DEFAULT_PRICING.newCountertop,
      ...(pricing.newCountertop || {}),
      solid20mm: {
        ...DEFAULT_PRICING.newCountertop.solid20mm,
        ...(pricing.newCountertop?.solid20mm || {}),
      },
      solid40mm: {
        ...DEFAULT_PRICING.newCountertop.solid40mm,
        ...(pricing.newCountertop?.solid40mm || {}),
      },
    },
    materialPrices: pricing.materialPrices || DEFAULT_PRICING.materialPrices,
  }
}

export async function GET() {
  try {
    const pricing = await redis.get<PricingConfig>(PRICING_KEY)
    return NextResponse.json(mergeWithDefaults(pricing))
  } catch (error) {
    console.error("Error fetching pricing:", error)
    return NextResponse.json(DEFAULT_PRICING)
  }
}

export async function POST(request: Request) {
  try {
    const { password, pricing, verifyOnly } = await request.json()

    // Проверка пароля
    if (password !== ADMIN_PASSWORD) {
      return NextResponse.json({ error: "Неверный пароль" }, { status: 401 })
    }

    // Если это только проверка пароля (без сохранения)
    if (verifyOnly) {
      return NextResponse.json({ success: true, verified: true })
    }

    // Сохранение цен
    await redis.set(PRICING_KEY, pricing)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error saving pricing:", error)
    return NextResponse.json({ error: "Ошибка сохранения" }, { status: 500 })
  }
}
