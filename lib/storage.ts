export interface SavedCalculation {
  id: string
  timestamp: number
  restorationCountertops: any[]
  newCountertops: any[]
  total: number
}

export function saveCalculation(restorationCountertops: any[], newCountertops: any[], total: number): void {
  const calculation: SavedCalculation = {
    id: Date.now().toString(),
    timestamp: Date.now(),
    restorationCountertops,
    newCountertops,
    total,
  }

  const saved = getSavedCalculations()
  saved.unshift(calculation)

  // Keep only last 5
  const limited = saved.slice(0, 5)

  localStorage.setItem("countertop-calculations", JSON.stringify(limited))
}

export function getSavedCalculations(): SavedCalculation[] {
  if (typeof window === "undefined") return []

  const saved = localStorage.getItem("countertop-calculations")
  if (!saved) return []

  try {
    return JSON.parse(saved)
  } catch {
    return []
  }
}

export function deleteCalculation(id: string): void {
  const saved = getSavedCalculations()
  const filtered = saved.filter((calc) => calc.id !== id)
  localStorage.setItem("countertop-calculations", JSON.stringify(filtered))
}
