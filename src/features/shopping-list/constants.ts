import {
  Apple,
  Beef,
  Milk,
  Package,
  Sparkles,
  ShoppingBag,
  LucideIcon
} from "lucide-react";

export type CategoryType = 'almacen' | 'verduleria' | 'carniceria' | 'lacteos' | 'limpieza' | 'otros';

export interface CategoryInfo {
  id: CategoryType;
  label: string;
  icon: LucideIcon;
  color: string;
  bgColor: string;
}

export const CATEGORIES: Record<CategoryType, CategoryInfo> = {
  verduleria: {
    id: 'verduleria',
    label: 'Verdulería',
    icon: Apple,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
  },
  carniceria: {
    id: 'carniceria',
    label: 'Carnicería',
    icon: Beef,
    color: 'text-red-600',
    bgColor: 'bg-red-100',
  },
  lacteos: {
    id: 'lacteos',
    label: 'Lácteos',
    icon: Milk,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
  },
  almacen: {
    id: 'almacen',
    label: 'Almacén',
    icon: Package,
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
  },
  limpieza: {
    id: 'limpieza',
    label: 'Limpieza',
    icon: Sparkles,
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-100',
  },
  otros: {
    id: 'otros',
    label: 'Otros',
    icon: ShoppingBag,
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
  }
};

export const CATEGORY_ORDER: CategoryType[] = [
  'verduleria',
  'carniceria',
  'lacteos',
  'almacen',
  'limpieza',
  'otros'
];

// Opcional: Mini-diccionario para autodetectar categoría por nombre
export const KEYWORD_TO_CATEGORY: Record<string, CategoryType> = {
  'manzana': 'verduleria',
  'banana': 'verduleria',
  'lechuga': 'verduleria',
  'tomate': 'verduleria',
  'cebolla': 'verduleria',
  'carne': 'carniceria',
  'pollo': 'carniceria',
  'cerdo': 'carniceria',
  'leche': 'lacteos',
  'queso': 'lacteos',
  'yogurt': 'lacteos',
  'manteca': 'lacteos',
  'arroz': 'almacen',
  'fideo': 'almacen',
  'aceite': 'almacen',
  'pan': 'almacen',
  'jabon': 'limpieza',
  'detergente': 'limpieza',
  'lavandina': 'limpieza',
  'papel': 'limpieza',
};

export function guessCategoryFromName(name: string): CategoryType {
  const normalized = name.toLowerCase();
  for (const [keyword, category] of Object.entries(KEYWORD_TO_CATEGORY)) {
    if (normalized.includes(keyword)) {
      return category;
    }
  }
  return 'otros';
}
