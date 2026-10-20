import type { EstudianteActual, Valoracion } from '../types'

/*
 * ═══ PARA EXPLICAR ═══════════════════════════════════════════════════════
 * Qué es: el reducer (función pura) que maneja TODO lo que el estudiante hace
 *   durante la sesión: likes, favoritos, reseñas nuevas e inscripciones.
 *
 * Decisión clave: aquí se guarda solo la ACCIÓN del estudiante, nunca el
 *   resultado. No hay un "contador de likes" ni un "promedio": esos se calculan
 *   en lib/selectores.ts. Así no hay datos duplicados que sincronizar.
 *
 * Por qué un reducer y no varios useState:
 *   - Las 4 acciones son transiciones de un mismo estado, y quedan nombradas.
 *   - Es una función pura: se prueba sin React (sesionReducer.test.ts).
 *   - Es inmutable: cada caso devuelve un objeto nuevo, jamás muta el anterior.
 *
 * Frase para la entrevista: "El estado guarda hechos, no consecuencias".
 * ═════════════════════════════════════════════════════════════════════════
 */

// Estado de la sesión: solo lo que el estudiante hace. Contadores, promedios
// y cupos NO se guardan aquí: se derivan en lib/selectores.ts.
export interface EstadoSesion {
  favoritosIds: string[]
  likesIds: string[]
  valoracionesNuevas: Record<string, Valoracion[]> // por id de emprendimiento
  gruposInscritosIds: string[]
}

export type AccionSesion =
  | { type: 'TOGGLE_FAVORITO'; id: string }
  | { type: 'TOGGLE_LIKE'; id: string }
  | {
      type: 'AGREGAR_VALORACION'
      emprendimientoId: string
      valoracion: Valoracion
    }
  | { type: 'INSCRIBIR'; grupoId: string }

/**
 * La sesión parte desde lo que el "servidor" dice del estudiante: los likes,
 * favoritos y grupos que Camila ya tenía en el data.json. Sin esto, el
 * enunciado se incumpliría (los iniciales deben verse).
 */
export function estadoInicial(estudiante: EstudianteActual): EstadoSesion {
  return {
    favoritosIds: estudiante.favoritosEmprendimientosIds,
    likesIds: estudiante.likesEmprendimientosIds,
    valoracionesNuevas: {},
    gruposInscritosIds: estudiante.gruposInscritosIds,
  }
}

// Si el id está lo quita; si no está lo agrega. Siempre devuelve un arreglo
// nuevo (filter y spread no mutan el original).
const alternar = (ids: string[], id: string) =>
  ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]

export function sesionReducer(
  estado: EstadoSesion,
  accion: AccionSesion,
): EstadoSesion {
  switch (accion.type) {
    case 'TOGGLE_FAVORITO':
      return {
        ...estado,
        favoritosIds: alternar(estado.favoritosIds, accion.id),
      }

    case 'TOGGLE_LIKE':
      return { ...estado, likesIds: alternar(estado.likesIds, accion.id) }

    case 'AGREGAR_VALORACION': {
      // Se guardan solo las reseñas NUEVAS, aparte de las del JSON. Promedio y
      // total no se tocan aquí: se recalculan solos al unir ambas listas.
      const { emprendimientoId, valoracion } = accion
      const previas = estado.valoracionesNuevas[emprendimientoId] ?? []
      return {
        ...estado,
        valoracionesNuevas: {
          ...estado.valoracionesNuevas,
          [emprendimientoId]: [valoracion, ...previas],
        },
      }
    }

    case 'INSCRIBIR':
      // Misma referencia si ya es miembro: React no re-renderiza.
      if (estado.gruposInscritosIds.includes(accion.grupoId)) return estado
      return {
        ...estado,
        gruposInscritosIds: [...estado.gruposInscritosIds, accion.grupoId],
      }
  }
}
