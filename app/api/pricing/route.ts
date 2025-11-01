import { Redis } from "@upstash/redis"
import { NextResponse } from "next/server"
import { DEFAULT_PRICING, type PricingConfig } from "@/lib/pricing-types"

const redis = new Redis({
  url: process.env.UPSTASH_KV_KV_REST_API_URL!,
  token: process.env.UPSTASH_KV_KV_REST_API_TOKEN!,
})

const PRICING_KEY = "countertop_pricing"
const ADMIN_PASSWORD = "admin2024" // Измените на свой пароль

export async function GET() {
  try {
    const pricing = await redis.get<PricingConfig>(PRICING_KEY)
    return NextResponse.json(pricing || DEFAULT_PRICING)
  } catch (error) {
    console.error("Error fetching pricing:", error)
    return NextResponse.json(DEFAULT_PRICING)
  }
}

export async function POST(request: Request) {
  try {
    const { password, pricing } = await request.json()

    // Проверка пароля
    if (password !== ADMIN_PASSWORD) {
      return NextResponse.json({ error: "Неверный пароль" }, { status: 401 })
    }

    // Сохранение цен
    await redis.set(PRICING_KEY, pricing)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error saving pricing:", error)
    return NextResponse.json({ error: "Ошибка сохранения" }, { status: 500 })
  }
}
