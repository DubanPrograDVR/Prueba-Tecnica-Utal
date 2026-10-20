import { createContext, use, useMemo, useReducer, type ReactNode } from 'react'
import * as api from '../services/api'
import type { EstudianteActual } from '../types'
import {
  estadoInicial,
  sesionReducer,
  type EstadoSesion,
} from './sesionReducer'

/*
 * ═══ PARA EXPLICAR ═══════════════════════════════════════════════════════
 * Qué es: el contexto que reparte la sesión del estudiante a toda la app.
 *   Lo pide el enunciado: "Estado en Contexto" (favoritos, likes, valoraciones
 *   nuevas y gruposInscritosIds).
 *
 * Tres decisiones:
 *   1. El provider se monta SOLO cuando los datos ya cargaron (ver App.tsx).
 *      Por eso el reducer nace con los IDs del estudiante (inicialización
 *      diferida) y no hace falta un useEffect para "copiar" los datos.
 *   2. Las acciones están en useMemo: son estables, así que las filas
 *      memoizadas no se re-renderizan por recibirlas como props.
 *   3. Las acciones asíncronas (publicarValoracion, inscribirse) primero
 *      esperan al "servidor" y recién después despachan. El indicador de envío
 *      ("Publicando…") NO vive aquí: es estado efímero de cada formulario.
 *
 * Por qué dos contextos (este y DatosContext) y no uno: tienen distinto ciclo
 *   de vida. Los datos se cargan una vez y pueden fallar; la sesión cambia con
 *   cada toque.
 * ═════════════════════════════════════════════════════════════════════════
 */

interface AccionesSesion {
  toggleFavorito: (id: string) => void
  toggleLike: (id: string) => void
  publicarValoracion: (
    emprendimientoId: string,
    estrellas: number,
    comentario: string,
  ) => Promise<void>
  inscribirse: (grupoId: string) => Promise<void>
}

type ValorSesion = EstadoSesion & AccionesSesion

const SesionContext = createContext<ValorSesion | null>(null)

/** Se monta cuando los datos ya están listos: el reducer nace con los IDs del estudiante. */
export function SesionProvider({
  estudiante,
  children,
}: {
  estudiante: EstudianteActual
  children: ReactNode
}) {
  const [estado, dispatch] = useReducer(
    sesionReducer,
    estudiante,
    estadoInicial,
  )

  // Acciones estables (no cambian entre renders): las tarjetas con memo no se
  // re-renderizan por recibirlas como props.
  const acciones = useMemo<AccionesSesion>(
    () => ({
      toggleFavorito: (id) => dispatch({ type: 'TOGGLE_FAVORITO', id }),
      toggleLike: (id) => dispatch({ type: 'TOGGLE_LIKE', id }),
      // Las acciones asíncronas esperan al servicio y luego actualizan el estado.
      // El componente que las llama maneja su propio indicador de envío.
      publicarValoracion: async (emprendimientoId, estrellas, comentario) => {
        const valoracion = await api.publicarValoracion(
          emprendimientoId,
          estudiante.nombre,
          estrellas,
          comentario,
        )
        dispatch({ type: 'AGREGAR_VALORACION', emprendimientoId, valoracion })
      },
      inscribirse: async (grupoId) => {
        await api.inscribirEnGrupo(grupoId)
        dispatch({ type: 'INSCRIBIR', grupoId })
      },
    }),
    [estudiante.nombre],
  )

  // El valor del contexto también va memoizado: solo cambia cuando cambia el
  // estado, no en cada render del provider.
  const valor = useMemo(() => ({ ...estado, ...acciones }), [estado, acciones])
  return <SesionContext value={valor}>{children}</SesionContext>
}

export function useSesion() {
  const valor = use(SesionContext)
  if (!valor)
    throw new Error('useSesion debe usarse dentro de <SesionProvider>')
  return valor
}
