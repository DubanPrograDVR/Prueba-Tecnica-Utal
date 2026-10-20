// Formato de cifras y fechas en español de Chile: "4,5", "1.234", "6 oct 2026".

const unDecimal = new Intl.NumberFormat('es-CL', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
})
const entero = new Intl.NumberFormat('es-CL')
const fecha = new Intl.DateTimeFormat('es-CL', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
})

export const formatoPromedio = (n: number) => unDecimal.format(n)

/** plural(1, 'reseña', 'reseñas') → "1 reseña"; plural(3, …) → "3 reseñas" */
export const plural = (n: number, uno: string, varios: string) =>
  `${entero.format(n)} ${n === 1 ? uno : varios}`

/** "Agrupación Danza y K-Pop (Campus Lircay) #9" → "Agrupación Danza y K-Pop #9": el campus se muestra aparte. */
export const nombreGrupo = (nombre: string) => nombre.replace(/\s*\(.*?\)/, '')

/**
 * "2026-10-06" → "6 oct 2026". Se arma como fecha local: `new Date("2026-10-06")`
 * la interpreta en UTC y en Chile mostraría el 5 de octubre.
 */
export function formatoFecha(iso: string) {
  const [anio, mes, dia] = iso.split('-').map(Number)
  return fecha.format(new Date(anio, mes - 1, dia))
}
