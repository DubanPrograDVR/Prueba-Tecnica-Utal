import type { DatosIniciales, Valoracion } from '../types'

// Capa de servicios: el único lugar que sabe que los datos vienen de un archivo
// estático. Con un backend real, solo cambia este archivo.

const LATENCIA_MS = 700

const esperar = () =>
  new Promise<void>((resolve) => setTimeout(resolve, LATENCIA_MS))

let datosEnCurso: Promise<DatosIniciales> | null = null

/**
 * Simula `GET /datos`. La promesa se guarda en caché para no repetir la
 * petición (StrictMode monta los componentes dos veces en desarrollo).
 */
export function obtenerDatos(): Promise<DatosIniciales> {
  datosEnCurso ??= cargarDatos()
  return datosEnCurso
}

async function cargarDatos(): Promise<DatosIniciales> {
  try {
    const [respuesta] = await Promise.all([
      fetch(`${import.meta.env.BASE_URL}data/data.json`),
      esperar(),
    ])
    if (!respuesta.ok)
      throw new Error(`Error ${respuesta.status} al cargar los datos`)
    return (await respuesta.json()) as DatosIniciales
  } catch (error) {
    datosEnCurso = null // sin caché del fallo: "Reintentar" vuelve a pedir
    throw error
  }
}

/** Simula `POST /emprendimientos/:id/valoraciones`; el "servidor" asigna id y fecha. */
export async function publicarValoracion(
  emprendimientoId: string,
  autor: string,
  estrellas: number,
  comentario: string,
): Promise<Valoracion> {
  await esperar()
  return {
    id: `val_${emprendimientoId}_${Date.now()}`,
    autor,
    estrellas,
    comentario,
    fecha: hoy(),
  }
}

/** Simula `POST /grupos/:id/inscripciones`. */
export async function inscribirEnGrupo(_grupoId: string): Promise<void> {
  await esperar()
}

// Fecha local en formato AAAA-MM-DD (toISOString usaría UTC y en Chile
// podría marcar el día siguiente por la noche).
function hoy() {
  const d = new Date()
  const dosDigitos = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${dosDigitos(d.getMonth() + 1)}-${dosDigitos(d.getDate())}`
}
