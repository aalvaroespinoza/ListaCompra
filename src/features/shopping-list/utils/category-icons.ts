export const categoryEmojis: Record<string, string> = {
  almacen: '🥫',
  verduleria: '🥬',
  carniceria: '🥩',
  lacteos: '🧀',
  limpieza: '🧼',
  otros: '🛒'
};

const commonProductEmojis: Record<string, string> = {
  leche: '🥛',
  bananas: '🍌',
  banana: '🍌',
  pan: '🍞',
  manzana: '🍎',
  manzanas: '🍎',
  huevo: '🥚',
  huevos: '🥚',
  queso: '🧀',
  pollo: '🍗',
  carne: '🥩',
  pescado: '🐟',
  agua: '💧',
  jugo: '🧃',
  cerveza: '🍺',
  vino: '🍷',
  cafe: '☕',
  café: '☕',
  te: '🍵',
  té: '🍵',
  arroz: '🍚',
  fideos: '🍝',
  pasta: '🍝',
  papa: '🥔',
  papas: '🥔',
  tomate: '🍅',
  tomates: '🍅',
  cebolla: '🧅',
  cebollas: '🧅',
  ajo: '🧄',
  zanahoria: '🥕',
  zanahorias: '🥕',
  limon: '🍋',
  limón: '🍋',
  naranja: '🍊',
  naranjas: '🍊',
  palta: '🥑',
  aguacate: '🥑',
  lechuga: '🥬',
  yogur: '🥛',
  mantequilla: '🧈',
  manteca: '🧈',
  aceite: '🫙',
  sal: '🧂',
  azucar: '🍬',
  azúcar: '🍬',
  galletas: '🍪',
  chocolate: '🍫',
  helado: '🍦',
  jabon: '🧼',
  jabón: '🧼',
  shampoo: '🧴',
  champu: '🧴',
  papel: '🧻'
};

/**
 * Returns the appropriate emoji for a product based on its name.
 * Falls back to the category emoji if no specific product emoji is found.
 */
export function getCategoryIcon(name: string, category: string | null = null): string {
  const normalizedName = name.toLowerCase().trim();
  
  // Try to find exact match or partial match in common products
  for (const [key, emoji] of Object.entries(commonProductEmojis)) {
    if (normalizedName.includes(key)) {
      return emoji;
    }
  }

  // Fallback to category
  const normalizedCategory = (category || 'otros').toLowerCase().trim();
  return categoryEmojis[normalizedCategory] || categoryEmojis.otros;
}
