// Диапазон длины с ценой
export interface LengthRange {
  id: string
  minLength: number // Минимальная длина в мм
  maxLength: number // Максимальная длина в мм
  pricePerM2: number // Цена за м² для этого диапазона
}

// Материал для цены продажи за м²
export interface MaterialPrice {
  id: string
  wood: string // Порода дерева
  shieldType: string // Тип щита (Цельноламельный, Сращённый)
  thickness: number // Толщина в мм
  grade?: string // Сорт (опционально)
  pricePerM2: LengthRange[] | number // Массив диапазонов или единая цена для всех длин
}

export interface PricingConfig {
  restoration: {
    solid: number // цена за м² для массива
    veneer: number // цена за м² для шпона
    milling: number // доплата за фрезеровку
    coating2K: number // доплата за 2К лак за м²
  }
  newCountertop: {
    solid20mm: {
      range1: number // 900-2150мм
      range2: number // 2151-2950мм
      range3: number // 2951-3500мм
    }
    solid40mm: {
      range1: number // 900-2150мм
      range2: number // 2151-2950мм
      range3: number // 2951-3500мм
    }
    spliced20mm: number // до 4000мм
    spliced40mm: number // до 4000мм
    coating2K: number // доплата за 2К лак за м²
    widthSurcharge: number // доплата за каждые 50мм свыше 600мм
    cutout: number // цена за вырез
  }
  materialPrices: MaterialPrice[] // Динамический список материалов с ценами за м²
}

export const DEFAULT_PRICING: PricingConfig = {
  restoration: {
    solid: 10500,
    veneer: 12500,
    milling: 1000,
    coating2K: 4000,
  },
  newCountertop: {
    solid20mm: {
      range1: 22990,
      range2: 24282,
      range3: 25811,
    },
    solid40mm: {
      range1: 29640,
      range2: 32490,
      range3: 33791,
    },
    spliced20mm: 19979,
    spliced40mm: 21793,
    coating2K: 4000,
    widthSurcharge: 1000,
    cutout: 1500,
  },
  materialPrices: [
    // Дефолтные цены для дуба (можно редактировать в админке)
    {
      id: "oak-solid-20",
      wood: "Дуб",
      shieldType: "Цельноламельный",
      thickness: 20,
      pricePerM2: [
        { id: "r1", minLength: 900, maxLength: 2150, pricePerM2: 22990 },
        { id: "r2", minLength: 2151, maxLength: 2950, pricePerM2: 24282 },
        { id: "r3", minLength: 2951, maxLength: 3500, pricePerM2: 25811 },
      ],
    },
    {
      id: "oak-solid-40",
      wood: "Дуб",
      shieldType: "Цельноламельный",
      thickness: 40,
      pricePerM2: [
        { id: "r1", minLength: 900, maxLength: 2150, pricePerM2: 29640 },
        { id: "r2", minLength: 2151, maxLength: 2950, pricePerM2: 32490 },
        { id: "r3", minLength: 2951, maxLength: 3500, pricePerM2: 33791 },
      ],
    },
    {
      id: "oak-spliced-20",
      wood: "Дуб",
      shieldType: "Сращённый",
      thickness: 20,
      pricePerM2: 19979, // Единая цена для всех длин
    },
    {
      id: "oak-spliced-40",
      wood: "Дуб",
      shieldType: "Сращённый",
      thickness: 40,
      pricePerM2: 21793, // Единая цена для всех длин
    },
  ],
}
