import { DEFAULT_PRICING, type PricingConfig } from "./pricing-types"

// Функция для слияния pricing с дефолтными значениями
export function mergePricingWithDefaults(pricing: PricingConfig | null): PricingConfig {
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
