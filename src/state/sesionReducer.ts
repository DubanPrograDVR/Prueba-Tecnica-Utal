import type { EstudianteActual, Valoracion } from '../types'

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

/** La sesión parte desde lo que el "servidor" dice del estudiante. */
export function estadoInicial(estudiante: EstudianteActual): EstadoSesion {
  return {
    favoritosIds: estudiante.favoritosEmprendimientosIds,
    likesIds: estudiante.likesEmprendimientosIds,
    valoracionesNuevas: {},
    gruposInscritosIds: estudiante.gruposInscritosIds,
  }
}

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
