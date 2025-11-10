import { Redis } from "@upstash/redis"
import { NextResponse } from "next/server"
import { type Supplier, type SearchParams, type SearchResult } from "@/lib/supplier-types"
import { type PricingConfig, DEFAULT_PRICING, type MaterialPrice } from "@/lib/pricing-types"

const redis = new Redis({
  url: process.env.UPSTASH_KV_KV_REST_API_URL!,
  token: process.env.UPSTASH_KV_KV_REST_API_TOKEN!,
})

const SUPPLIERS_KEY = "suppliers"
const PRICING_KEY = "countertop_pricing"

function mergePricingWithDefaults(pricing: PricingConfig | null): PricingConfig {
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

// Найти цену за м² для материала с учетом длины
function findMaterialPrice(
  material: { wood: string; shieldType: string; thickness: number; length: number; grade?: string },
  materialPrices: MaterialPrice[],
): { pricePerM2: number | null; purchasePrice: number } {
  // Ищем точное совпадение: порода + тип + толщина + сорт (если указан)
  const exactMatch = materialPrices.find(
    (mp) =>
      mp.wood === material.wood &&
      mp.shieldType === material.shieldType &&
      mp.thickness === material.thickness &&
      (material.grade ? mp.grade === material.grade : !mp.grade),
  )

  if (exactMatch) {
    // Если цена задана диапазонами
    if (Array.isArray(exactMatch.pricePerM2)) {
      const matchingRange = exactMatch.pricePerM2.find(
        (range) => material.length >= range.minLength && material.length <= range.maxLength,
      )
      if (matchingRange) {
        return { pricePerM2: matchingRange.pricePerM2, purchasePrice: 0 }
      }
    } else {
      // Если единая цена для всех длин
      return { pricePerM2: exactMatch.pricePerM2, purchasePrice: 0 }
    }
  }

  // Если сорт не указан, ищем без учета сорта
  if (material.grade) {
    const matchWithoutGrade = materialPrices.find(
      (mp) => mp.wood === material.wood && mp.shieldType === material.shieldType && mp.thickness === material.thickness && !mp.grade,
    )
    if (matchWithoutGrade) {
      if (Array.isArray(matchWithoutGrade.pricePerM2)) {
        const matchingRange = matchWithoutGrade.pricePerM2.find(
          (range) => material.length >= range.minLength && material.length <= range.maxLength,
        )
        if (matchingRange) {
          return { pricePerM2: matchingRange.pricePerM2, purchasePrice: 0 }
        }
      } else {
        return { pricePerM2: matchWithoutGrade.pricePerM2, purchasePrice: 0 }
      }
    }
  }

  return { pricePerM2: null, purchasePrice: 0 }
}

// Рассчитать цену продажи на основе цены за м² (используя размеры из поиска, а не размеры материала)
function calcSellPrice(
  searchLength: number,
  searchWidth: number,
  material: { wood: string; shieldType: string; thickness: number; grade?: string; price: number },
  materialPrices: MaterialPrice[],
): { sellPrice: number; pricePerM2: number | null; markup: number } {
  const areaM2 = (searchLength * searchWidth) / 1000000 // Переводим мм² в м² (используем размеры из поиска)
  const { pricePerM2 } = findMaterialPrice(
    { ...material, length: searchLength },
    materialPrices,
  )

  if (pricePerM2) {
    const sellPrice = Math.round(areaM2 * pricePerM2)
    // Рассчитываем наценку в процентах
    const purchasePrice = material.price
    const markup = purchasePrice > 0 ? Math.round(((sellPrice - purchasePrice) / purchasePrice) * 100) : 0

    return {
      sellPrice,
      pricePerM2,
      markup,
    }
  }

  // Если цена не найдена, возвращаем 0 (только цена закупки)
  return {
    sellPrice: 0,
    pricePerM2: null,
    markup: 0,
  }
}

export async function POST(request: Request) {
  try {
    const searchParams: SearchParams = await request.json()
    const suppliers = (await redis.get<Supplier[]>(SUPPLIERS_KEY)) || []
    const pricingRaw = await redis.get<PricingConfig>(PRICING_KEY)
    const pricing = mergePricingWithDefaults(pricingRaw)

    const results: SearchResult[] = []

    for (const supplier of suppliers) {
      // Фильтруем материалы по параметрам (поддержка массивов)
      let filtered = supplier.materials

      if (searchParams.wood && searchParams.wood.length > 0) {
        filtered = filtered.filter((m) => searchParams.wood!.includes(m.wood))
      }
      if (searchParams.thickness && searchParams.thickness.length > 0) {
        filtered = filtered.filter((m) => searchParams.thickness!.includes(m.thickness))
      }
      if (searchParams.shieldType && searchParams.shieldType.length > 0) {
        filtered = filtered.filter((m) => searchParams.shieldType!.includes(m.shieldType))
      }
      if (searchParams.grade && searchParams.grade.length > 0) {
        filtered = filtered.filter((m) => m.grade && searchParams.grade!.includes(m.grade))
      }

      // Ищем точные совпадения по длине и ширине
      const exactMatches = filtered.filter((m) => m.length === searchParams.length && m.width === searchParams.width)

      // Ищем ближайшие большие размеры (только по длине >= искомой, ширина может быть любой)
      const largerMatches = filtered
        .filter((m) => {
          // Исключаем точные совпадения
          if (m.length === searchParams.length && m.width === searchParams.width) return false
          // Только материалы с длиной >= искомой (ширина может быть любой)
          return m.length >= searchParams.length
        })
        .map((m) => {
          // Вычисляем "расстояние" от искомого размера
          const lengthDiff = m.length - searchParams.length
          const widthDiff = Math.abs(m.width - searchParams.width)
          const totalDiff = lengthDiff + widthDiff

          return { material: m, totalDiff, lengthDiff, widthDiff }
        })
        .sort((a, b) => {
          // Сначала по разнице длины (ближайшие по длине)
          if (a.lengthDiff !== b.lengthDiff) return a.lengthDiff - b.lengthDiff
          // Затем по разнице ширины
          return a.widthDiff - b.widthDiff
        })
        .slice(0, 1) // Берём только один ближайший больший размер
        .map((c) => c.material)

      // Ищем меньшие размеры только если запрошено
      const smallerMatches: typeof filtered = []
      if (searchParams.showSmaller) {
        const smaller = filtered
          .filter((m) => {
            // Исключаем точные совпадения
            if (m.length === searchParams.length && m.width === searchParams.width) return false
            // Только материалы с длиной < искомой (ширина может быть любой)
            return m.length < searchParams.length
          })
          .map((m) => {
            // Вычисляем "расстояние" от искомого размера
            const lengthDiff = searchParams.length - m.length
            const widthDiff = Math.abs(m.width - searchParams.width)
            const totalDiff = lengthDiff + widthDiff

            return { material: m, totalDiff, lengthDiff, widthDiff }
          })
          .sort((a, b) => {
            // Сначала по разнице длины (ближайшие по длине)
            if (a.lengthDiff !== b.lengthDiff) return a.lengthDiff - b.lengthDiff
            // Затем по разнице ширины
            return a.widthDiff - b.widthDiff
          })
          .slice(0, 1) // Берём только один ближайший меньший размер
          .map((c) => c.material)
        smallerMatches.push(...smaller)
      }

      // Формируем все возможные варианты для сортировки
      const allCandidates: Array<{
        material: typeof filtered[0]
        matchType: "exact" | "smaller" | "larger"
        lengthDiff: number
        widthDiff: number
        sellPrice: number
        markup: number
        pricePerM2: number | null
      }> = []

      // Добавляем точные совпадения
      exactMatches.forEach((material) => {
        const { sellPrice, pricePerM2, markup } = calcSellPrice(
          searchParams.length,
          searchParams.width,
          {
            wood: material.wood,
            shieldType: material.shieldType,
            thickness: material.thickness,
            grade: material.grade,
            price: material.price,
          },
          pricing.materialPrices,
        )
        allCandidates.push({
          material,
          matchType: "exact",
          lengthDiff: 0,
          widthDiff: 0,
          sellPrice,
          markup,
          pricePerM2,
        })
      })

      // Добавляем большие размеры
      largerMatches.forEach((material) => {
        const { sellPrice, pricePerM2, markup } = calcSellPrice(
          searchParams.length,
          searchParams.width,
          {
            wood: material.wood,
            shieldType: material.shieldType,
            thickness: material.thickness,
            grade: material.grade,
            price: material.price,
          },
          pricing.materialPrices,
        )
        const lengthDiff = material.length - searchParams.length
        const widthDiff = Math.abs(material.width - searchParams.width)
        allCandidates.push({
          material,
          matchType: "larger",
          lengthDiff,
          widthDiff,
          sellPrice,
          markup,
          pricePerM2,
        })
      })

      // Добавляем меньшие размеры если запрошено
      if (searchParams.showSmaller) {
        smallerMatches.forEach((material) => {
          const { sellPrice, pricePerM2, markup } = calcSellPrice(
            searchParams.length,
            searchParams.width,
            {
              wood: material.wood,
              shieldType: material.shieldType,
              thickness: material.thickness,
              grade: material.grade,
              price: material.price,
            },
            pricing.materialPrices,
          )
          const lengthDiff = searchParams.length - material.length
          const widthDiff = Math.abs(material.width - searchParams.width)
          allCandidates.push({
            material,
            matchType: "smaller",
            lengthDiff,
            widthDiff,
            sellPrice,
            markup,
            pricePerM2,
          })
        })
      }

      // Если нет результатов, добавляем все материалы поставщика (если параметры не заданы)
      if (allCandidates.length === 0 && filtered.length > 0) {
        filtered.forEach((material) => {
          const { sellPrice, pricePerM2, markup } = calcSellPrice(
            searchParams.length,
            searchParams.width,
            {
              wood: material.wood,
              shieldType: material.shieldType,
              thickness: material.thickness,
              grade: material.grade,
              price: material.price,
            },
            pricing.materialPrices,
          )
          const lengthDiff = Math.abs(material.length - searchParams.length)
          const widthDiff = Math.abs(material.width - searchParams.width)
          let matchType: "exact" | "smaller" | "larger" = "larger"
          if (material.length === searchParams.length && material.width === searchParams.width) {
            matchType = "exact"
          } else if (material.length < searchParams.length) {
            matchType = "smaller"
          }
          allCandidates.push({
            material,
            matchType,
            lengthDiff,
            widthDiff,
            sellPrice,
            markup,
            pricePerM2,
          })
        })
      }

      // Сортируем кандидатов по приоритету:
      // 1. Сначала по марже (наценке) - от большей к меньшей
      // 2. Затем по конечной цене - от меньшей к большей
      // 3. Затем по размеру - сначала больший (exact > larger > smaller), затем по разнице длины, затем по разнице ширины
      allCandidates.sort((a, b) => {
        // 1. По марже (наценке) - от большей к меньшей
        if (a.markup !== b.markup) {
          return b.markup - a.markup
        }
        // 2. По конечной цене - от меньшей к большей
        if (a.sellPrice !== b.sellPrice) {
          if (a.sellPrice === 0) return 1 // Материалы без цены в конец
          if (b.sellPrice === 0) return -1
          return a.sellPrice - b.sellPrice
        }
        // 3. По типу совпадения (exact > larger > smaller)
        const matchTypeOrder = { exact: 0, larger: 1, smaller: 2 }
        if (matchTypeOrder[a.matchType] !== matchTypeOrder[b.matchType]) {
          return matchTypeOrder[a.matchType] - matchTypeOrder[b.matchType]
        }
        // 4. По разнице длины (ближайшие по длине)
        if (a.lengthDiff !== b.lengthDiff) {
          return a.lengthDiff - b.lengthDiff
        }
        // 5. По разнице ширины
        return a.widthDiff - b.widthDiff
      })

      // Берём лучший результат от каждого поставщика (хотя бы 1)
      const bestResult = allCandidates[0]
      if (bestResult) {
        results.push({
          supplier: supplier.name,
          supplierId: supplier.id,
          material: bestResult.material,
          matchType: bestResult.matchType,
          sellPrice: bestResult.sellPrice,
          markup: bestResult.markup,
          pricePerM2: bestResult.pricePerM2,
        })
      }
    }

    // Сортируем результаты по приоритету:
    // 1. Сначала по марже (наценке) - от большей к меньшей
    // 2. Затем по конечной цене - от меньшей к большей
    // 3. Затем по размеру - сначала больший
    results.sort((a, b) => {
      // 1. По марже (наценке) - от большей к меньшей
      if (a.markup !== b.markup) {
        return b.markup - a.markup
      }
      // 2. По конечной цене - от меньшей к большей
      if (a.sellPrice !== b.sellPrice) {
        if (a.sellPrice === 0) return 1 // Материалы без цены в конец
        if (b.sellPrice === 0) return -1
        return a.sellPrice - b.sellPrice
      }
      // 3. По типу совпадения (exact > larger > smaller)
      const matchTypeOrder = { exact: 0, larger: 1, smaller: 2 }
      return matchTypeOrder[a.matchType] - matchTypeOrder[b.matchType]
    })

    return NextResponse.json(results)
  } catch (error) {
    console.error("Error searching materials:", error)
    return NextResponse.json({ error: "Ошибка поиска" }, { status: 500 })
  }
}
