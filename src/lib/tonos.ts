// Cada categoría tiene un tinte pálido con la tinta oscura de su mismo tono
// (rasgo del estilo "pastel-consumer"). El color refuerza, no reemplaza: el
// nombre de la categoría siempre aparece también como texto.

export interface Tono {
  fondo: string
  tinta: string
}

const AMBAR = { fondo: '#fdecd3', tinta: '#7a3e06' }
const ROSA = { fondo: '#fbe3f1', tinta: '#7d1d55' }
const TEAL = { fondo: '#d7f2ee', tinta: '#0f5a52' }
const AZUL = { fondo: '#dcebfc', tinta: '#163f73' }
const OLIVA = { fondo: '#ebf0d2', tinta: '#4a5413' }
const ACERO = { fondo: '#e6e8ee', tinta: '#2e3646' }
const VERDE = { fondo: '#dcf3df', tinta: '#1d5a2c' }
const ARENA = { fondo: '#efe6dc', tinta: '#5b4127' }
const NARANJA = { fondo: '#fde3d6', tinta: '#7c2d12' }
const NEUTRO = { fondo: '#eef1f4', tinta: '#3a3d40' }

const TONOS: Record<string, Tono> = {
  // Clasificaciones de emprendimientos
  'Alimentación y Repostería': AMBAR,
  'Diseño, Stickers y Pines': ROSA,
  'Vestuario y Moda Circular': TEAL,
  'Papelería e Impresiones': AZUL,
  'Artesanía y Tejidos': OLIVA,
  'Tecnología y Reparaciones': ACERO,
  'Clases Particulares y Ayudantías': VERDE,
  // Temáticas de grupos intermedios
  'Videojuegos y E-Sports': AZUL,
  'Voluntariado Social y Preu': NARANJA,
  'Fotografía Analógica y Digital': ACERO,
  'Música y Bandas U': ROSA,
  'Debate y Oratoria': ARENA,
  'Juegos de Mesa y Rol': AMBAR,
  'Danza y K-Pop': TEAL,
  'Sustentabilidad y Huertos': VERDE,
  Animalista: OLIVA,
}

/** Una categoría desconocida (datos nuevos) cae en un tono neutro. */
export const tonoDe = (categoria: string) => TONOS[categoria] ?? NEUTRO

const TONOS_PERSONA = [AZUL, VERDE, NARANJA, TEAL, ROSA, OLIVA, ARENA, AMBAR]

/** Cada persona conserva su tono en toda la app: se deriva de su nombre. */
export function tonoDePersona(nombre: string) {
  const suma = [...nombre].reduce((acc, letra) => acc + letra.charCodeAt(0), 0)
  return TONOS_PERSONA[suma % TONOS_PERSONA.length]
}

const CONECTORES = new Set(['y', 'de', 'del', 'la', 'el', 'los', 'las', '&'])

/** "Kombucha Estudiantil #1" → "KE"; "Agrupación Danza y K-Pop (Campus Lircay) #9" → "DK" */
export function iniciales(nombre: string) {
  return nombre
    .replace(/\(.*?\)|#\d+|^Agrupación\s+/gi, '')
    .split(/\s+/)
    .filter((palabra) => palabra && !CONECTORES.has(palabra.toLowerCase()))
    .slice(0, 2)
    .map((palabra) => palabra[0].toUpperCase())
    .join('')
}
