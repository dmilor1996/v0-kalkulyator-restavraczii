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
}
