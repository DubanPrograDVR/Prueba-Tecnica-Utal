// Formato de cifras en español de Chile: "4,5" y "1.234".

const unDecimal = new Intl.NumberFormat('es-CL', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
})
const entero = new Intl.NumberFormat('es-CL')

export const formatoPromedio = (n: number) => unDecimal.format(n)

/** plural(1, 'reseña', 'reseñas') → "1 reseña"; plural(3, …) → "3 reseñas" */
export const plural = (n: number, uno: string, varios: string) =>
  `${entero.format(n)} ${n === 1 ? uno : varios}`
