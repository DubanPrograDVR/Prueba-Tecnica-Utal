import type { Emprendimiento, GrupoIntermedio, Valoracion } from '../types'

/*
 * ═══ PARA EXPLICAR ═══════════════════════════════════════════════════════
 * Qué es: el "cerebro" de la app. Funciones puras que, a partir de los datos
 *   del servidor y de la sesión, CALCULAN lo que se muestra: listas filtradas,
 *   likes, promedio de estrellas, cupos y miembros.
 *
 * Es la respuesta a "¿cómo evitaste duplicar estado?": ningún resultado se
 *   guarda. Si cambia un like, una reseña o una inscripción, estas funciones
 *   se vuelven a ejecutar (dentro de useMemo) y todo queda consistente.
 *
 * Por qué son funciones puras en vez de lógica dentro de los componentes:
 *   - Se prueban sin React (selectores.test.ts, 16 casos).
 *   - Los componentes quedan solo con la presentación.
 *
 * Casos del data.json que resuelven (menciónalos, muestran que lo analizaste):
 *   - emp_001 ya tenía "me gusta": quitarlo deja 12 → 11 (contarLikes).
 *   - 16 emprendimientos sin reseñas: promedio null, se muestra "Sin reseñas".
 *   - grp_09 tiene 0 cupos pero Camila ya es miembro: "Eres miembro" gana.
 *   - campus_ids es un arreglo en emprendimientos y un valor único en grupos.
 * ═════════════════════════════════════════════════════════════════════════
 */

/** "Música" → "musica": la búsqueda ignora mayúsculas y tildes. */
export const normalizar = (texto: string) =>
  texto
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()

const coincideTexto = (campos: string, busqueda: string) => {
  const q = normalizar(busqueda.trim())
  return !q || normalizar(campos).includes(q)
}

/** Opciones de un filtro a partir de los datos, sin repetir y en orden alfabético. */
export const valoresUnicos = (valores: string[]) =>
  [...new Set(valores)].sort((a, b) => a.localeCompare(b, 'es'))

/** Cuántas veces aparece cada valor: los conteos de los chips de categoría. */
export function contarPor(valores: string[]) {
  const conteo = new Map<string, number>()
  for (const v of valores) conteo.set(v, (conteo.get(v) ?? 0) + 1)
  return conteo
}

// ── Emprendimientos ─────────────────────────────────────────────

export interface FiltrosEmprendimientos {
  texto: string
  clasificacion: string // '' = todas
  campus: string // '' = todos
  soloFavoritos: boolean
}

// Todos los filtros se combinan con "Y": un emprendimiento debe cumplirlos
// todos. Un filtro vacío ('' o false) no descarta nada.
export function filtrarEmprendimientos(
  lista: Emprendimiento[],
  filtros: FiltrosEmprendimientos,
  favoritosIds: string[],
) {
  return lista.filter(
    (e) =>
      (!filtros.clasificacion || e.clasificacion === filtros.clasificacion) &&
      (!filtros.campus || e.campus_ids.includes(filtros.campus)) &&
      (!filtros.soloFavoritos || favoritosIds.includes(e.id)) &&
      coincideTexto(`${e.nombre} ${e.descripcion}`, filtros.texto),
  )
}

/**
 * El `likes` del JSON ya incluye el like inicial del estudiante, así que se
 * descuenta ese y se suma el actual. Quitar el like de emp_001: 12 → 11.
 */
export const contarLikes = (
  e: Emprendimiento,
  likeInicial: boolean,
  likeActual: boolean,
) => e.likes - Number(likeInicial) + Number(likeActual)

/** Reseñas del JSON más las publicadas en la sesión, de la más reciente a la más antigua. */
export const valoracionesDe = (
  e: Emprendimiento,
  nuevas: Record<string, Valoracion[]>,
) =>
  [...(nuevas[e.id] ?? []), ...e.valoraciones].sort((a, b) =>
    b.fecha.localeCompare(a.fecha),
  )

/** Promedio y total calculados desde la lista: al publicar se recalculan solos. */
export function resumenValoraciones(valoraciones: Valoracion[]) {
  const total = valoraciones.length
  const suma = valoraciones.reduce((acc, v) => acc + v.estrellas, 0)
  return { total, promedio: total ? suma / total : null }
}

// ── Grupos intermedios ──────────────────────────────────────────

export interface FiltrosGrupos {
  texto: string
  tematica: string // '' = todas
  campus: string // '' = todos
  soloMios: boolean
}

export function filtrarGrupos(
  lista: GrupoIntermedio[],
  filtros: FiltrosGrupos,
  inscritosIds: string[],
) {
  return lista.filter(
    (g) =>
      (!filtros.tematica || g.tematica === filtros.tematica) &&
      (!filtros.campus || g.campus_id === filtros.campus) &&
      (!filtros.soloMios || inscritosIds.includes(g.id)) &&
      coincideTexto(`${g.nombre} ${g.descripcion}`, filtros.texto),
  )
}

/**
 * Estado visible de un grupo. Solo una inscripción hecha en la sesión mueve
 * cupos y miembros; las iniciales ya vienen contadas en el JSON.
 * Ser miembro tiene prioridad: grp_09 tiene 0 cupos y el estudiante ya está dentro.
 */
export function estadoGrupo(
  g: GrupoIntermedio,
  inscritoInicial: boolean,
  inscritoActual: boolean,
) {
  const nuevo = Number(inscritoActual && !inscritoInicial)
  const cupos = g.cupos_disponibles - nuevo
  return {
    esMiembro: inscritoActual,
    cupos,
    miembros: g.cantidad_miembros + nuevo,
    puedeInscribirse: !inscritoActual && cupos > 0,
  }
}
