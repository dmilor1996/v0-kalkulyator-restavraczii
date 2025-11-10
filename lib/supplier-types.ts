// Типы данных для системы поставщиков

export interface Material {
  id: string
  wood: string // Порода дерева
  shieldType: string // Тип щита (Цельноламельный, Сращённый)
  grade: string // Сорт
  thickness: number // Толщина в мм
  width: number // Ширина в мм
  length: number // Длина в мм
  price: number // Цена закупки
}

export interface Supplier {
  id: string
  name: string
  materials: Material[]
  createdAt: string
  updatedAt: string
}

export interface SearchParams {
  length: number
  width: number
  thickness?: number[] // Массив толщин
  wood?: string[] // Массив пород
  shieldType?: string[] // Массив типов щитов
  grade?: string[] // Массив сортов
  showSmaller?: boolean // Показывать меньшие размеры
}

export interface SearchResult {
  supplier: string
  supplierId: string
  material: Material
  matchType: "exact" | "smaller" | "larger"
  sellPrice: number // Цена продажи с наценкой
  markup: number // Процент наценки
  pricePerM2: number | null // Цена за м²
}

// Наценки по породам (в процентах)
export const MARKUP_RATES: Record<string, number> = {
  Дуб: 250, // 250% наценка для дуба (можно настроить)
  default: 0, // Для остальных пород пока без наценки
}

// Дефолтный поставщик "Два дуба" с данными из таблицы
export const DEFAULT_SUPPLIER: Supplier = {
  id: "dva-duba",
  name: "Два дуба",
  materials: [
    // Цельноламельный 20мм
    {
      id: "1",
      wood: "Дуб",
      shieldType: "Цельноламельный",
      grade: "—",
      thickness: 20,
      width: 620,
      length: 900,
      price: 3350,
    },
    {
      id: "2",
      wood: "Дуб",
      shieldType: "Цельноламельный",
      grade: "—",
      thickness: 20,
      width: 620,
      length: 1000,
      price: 3850,
    },
    {
      id: "3",
      wood: "Дуб",
      shieldType: "Цельноламельный",
      grade: "—",
      thickness: 20,
      width: 620,
      length: 1100,
      price: 4250,
    },
    { id: "4", wood: "Дуб", shieldType: "Сращённый", grade: "—", thickness: 20, width: 620, length: 1200, price: 2700 },
    {
      id: "5",
      wood: "Дуб",
      shieldType: "Цельноламельный",
      grade: "—",
      thickness: 20,
      width: 620,
      length: 1200,
      price: 4650,
    },
    {
      id: "6",
      wood: "Дуб",
      shieldType: "Цельноламельный",
      grade: "—",
      thickness: 20,
      width: 620,
      length: 1300,
      price: 5000,
    },
    {
      id: "7",
      wood: "Дуб",
      shieldType: "Цельноламельный",
      grade: "—",
      thickness: 20,
      width: 620,
      length: 1400,
      price: 5400,
    },
    { id: "8", wood: "Дуб", shieldType: "Сращённый", grade: "—", thickness: 20, width: 620, length: 1500, price: 3350 },
    {
      id: "9",
      wood: "Дуб",
      shieldType: "Цельноламельный",
      grade: "—",
      thickness: 20,
      width: 620,
      length: 1500,
      price: 5800,
    },
    {
      id: "10",
      wood: "Дуб",
      shieldType: "Цельноламельный",
      grade: "—",
      thickness: 20,
      width: 620,
      length: 1600,
      price: 6350,
    },
    {
      id: "11",
      wood: "Дуб",
      shieldType: "Цельноламельный",
      grade: "—",
      thickness: 20,
      width: 620,
      length: 1700,
      price: 6750,
    },
    {
      id: "12",
      wood: "Дуб",
      shieldType: "Сращённый",
      grade: "—",
      thickness: 20,
      width: 620,
      length: 1800,
      price: 4050,
    },
    {
      id: "13",
      wood: "Дуб",
      shieldType: "Цельноламельный",
      grade: "—",
      thickness: 20,
      width: 620,
      length: 1800,
      price: 7150,
    },
    {
      id: "14",
      wood: "Дуб",
      shieldType: "Цельноламельный",
      grade: "—",
      thickness: 20,
      width: 620,
      length: 1900,
      price: 7550,
    },
    {
      id: "15",
      wood: "Дуб",
      shieldType: "Сращённый",
      grade: "—",
      thickness: 20,
      width: 620,
      length: 2000,
      price: 4500,
    },
    {
      id: "16",
      wood: "Дуб",
      shieldType: "Цельноламельный",
      grade: "—",
      thickness: 20,
      width: 620,
      length: 2000,
      price: 7950,
    },
    {
      id: "17",
      wood: "Дуб",
      shieldType: "Цельноламельный",
      grade: "—",
      thickness: 20,
      width: 620,
      length: 2100,
      price: 9150,
    },
    {
      id: "18",
      wood: "Дуб",
      shieldType: "Цельноламельный",
      grade: "—",
      thickness: 20,
      width: 620,
      length: 2200,
      price: 9550,
    },
    {
      id: "19",
      wood: "Дуб",
      shieldType: "Цельноламельный",
      grade: "—",
      thickness: 20,
      width: 620,
      length: 2300,
      price: 10000,
    },
    {
      id: "20",
      wood: "Дуб",
      shieldType: "Сращённый",
      grade: "—",
      thickness: 20,
      width: 620,
      length: 2400,
      price: 5400,
    },
    {
      id: "21",
      wood: "Дуб",
      shieldType: "Цельноламельный",
      grade: "—",
      thickness: 20,
      width: 620,
      length: 2400,
      price: 11950,
    },
    {
      id: "22",
      wood: "Дуб",
      shieldType: "Цельноламельный",
      grade: "—",
      thickness: 20,
      width: 620,
      length: 2500,
      price: 12400,
    },
    {
      id: "23",
      wood: "Дуб",
      shieldType: "Цельноламельный",
      grade: "—",
      thickness: 20,
      width: 620,
      length: 2600,
      price: 12900,
    },
    {
      id: "24",
      wood: "Дуб",
      shieldType: "Цельноламельный",
      grade: "—",
      thickness: 20,
      width: 620,
      length: 2700,
      price: 13400,
    },
    {
      id: "25",
      wood: "Дуб",
      shieldType: "Цельноламельный",
      grade: "—",
      thickness: 20,
      width: 620,
      length: 2800,
      price: 14250,
    },
    {
      id: "26",
      wood: "Дуб",
      shieldType: "Цельноламельный",
      grade: "—",
      thickness: 20,
      width: 620,
      length: 2900,
      price: 14750,
    },
    {
      id: "27",
      wood: "Дуб",
      shieldType: "Сращённый",
      grade: "—",
      thickness: 20,
      width: 620,
      length: 3000,
      price: 6700,
    },
    {
      id: "28",
      wood: "Дуб",
      shieldType: "Цельноламельный",
      grade: "—",
      thickness: 20,
      width: 620,
      length: 3000,
      price: 15400,
    },
    {
      id: "29",
      wood: "Дуб",
      shieldType: "Сращённый",
      grade: "—",
      thickness: 20,
      width: 620,
      length: 4000,
      price: 8950,
    },
    {
      id: "30",
      wood: "Дуб",
      shieldType: "Сращённый",
      grade: "—",
      thickness: 20,
      width: 900,
      length: 2000,
      price: 6500,
    },
    {
      id: "31",
      wood: "Дуб",
      shieldType: "Сращённый",
      grade: "—",
      thickness: 20,
      width: 900,
      length: 3000,
      price: 9750,
    },
    {
      id: "32",
      wood: "Дуб",
      shieldType: "Сращённый",
      grade: "—",
      thickness: 20,
      width: 1200,
      length: 3000,
      price: 13000,
    },

    // Сращённый 30мм
    {
      id: "33",
      wood: "Дуб",
      shieldType: "Сращённый",
      grade: "—",
      thickness: 30,
      width: 620,
      length: 1800,
      price: 6100,
    },
    {
      id: "34",
      wood: "Дуб",
      shieldType: "Сращённый",
      grade: "—",
      thickness: 30,
      width: 620,
      length: 2000,
      price: 6700,
    },
    {
      id: "35",
      wood: "Дуб",
      shieldType: "Сращённый",
      grade: "—",
      thickness: 30,
      width: 620,
      length: 2400,
      price: 8100,
    },
    {
      id: "36",
      wood: "Дуб",
      shieldType: "Сращённый",
      grade: "—",
      thickness: 30,
      width: 620,
      length: 3000,
      price: 10100,
    },
    {
      id: "37",
      wood: "Дуб",
      shieldType: "Сращённый",
      grade: "—",
      thickness: 30,
      width: 900,
      length: 3000,
      price: 14600,
    },
    {
      id: "38",
      wood: "Дуб",
      shieldType: "Сращённый",
      grade: "—",
      thickness: 30,
      width: 1200,
      length: 3000,
      price: 19500,
    },

    // Цельноламельный 40мм
    {
      id: "39",
      wood: "Дуб",
      shieldType: "Цельноламельный",
      grade: "—",
      thickness: 40,
      width: 620,
      length: 900,
      price: 6700,
    },
    {
      id: "40",
      wood: "Дуб",
      shieldType: "Цельноламельный",
      grade: "—",
      thickness: 40,
      width: 620,
      length: 1000,
      price: 7700,
    },
    {
      id: "41",
      wood: "Дуб",
      shieldType: "Цельноламельный",
      grade: "—",
      thickness: 40,
      width: 620,
      length: 1100,
      price: 8500,
    },
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}
