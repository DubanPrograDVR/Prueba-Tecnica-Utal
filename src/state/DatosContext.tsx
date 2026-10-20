import {
  createContext,
  use,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { obtenerDatos } from '../services/api'
import type { DatosIniciales } from '../types'

// Datos del "servidor": se cargan una vez y no se modifican. Lo que el
// estudiante cambia vive en SesionContext.

type EstadoCarga =
  | { estado: 'cargando' }
  | { estado: 'error'; mensaje: string }
  | { estado: 'listo'; datos: DatosIniciales }

type ValorDatos = EstadoCarga & { reintentar: () => void }

const DatosContext = createContext<ValorDatos | null>(null)

export function DatosProvider({ children }: { children: ReactNode }) {
  const [carga, setCarga] = useState<EstadoCarga>({ estado: 'cargando' })
  const [intento, setIntento] = useState(0)

  // useEffect legítimo: sincroniza con un sistema externo (la "red").
  useEffect(() => {
    let vigente = true // evita actualizar estado de un efecto ya descartado
    obtenerDatos()
      .then((datos) => {
        if (vigente) setCarga({ estado: 'listo', datos })
      })
      .catch((error: unknown) => {
        const mensaje =
          error instanceof Error
            ? error.message
            : 'No se pudieron cargar los datos'
        if (vigente) setCarga({ estado: 'error', mensaje })
      })
    return () => {
      vigente = false
    }
  }, [intento])

  const reintentar = useCallback(() => {
    setCarga({ estado: 'cargando' })
    setIntento((n) => n + 1)
  }, [])

  const valor = useMemo(() => ({ ...carga, reintentar }), [carga, reintentar])
  return <DatosContext value={valor}>{children}</DatosContext>
}

/** Estado completo de la carga (para mostrar carga o error). */
export function useDatos() {
  const valor = use(DatosContext)
  if (!valor) throw new Error('useDatos debe usarse dentro de <DatosProvider>')
  return valor
}

/** Datos ya cargados: solo para componentes que se montan después de la carga. */
export function useDatosListos(): DatosIniciales {
  const valor = useDatos()
  if (valor.estado !== 'listo')
    throw new Error(
      'useDatosListos se usó antes de que los datos estuvieran listos',
    )
  return valor.datos
}
