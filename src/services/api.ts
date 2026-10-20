import type { DatosIniciales, Valoracion } from '../types'

/*
 * ═══ PARA EXPLICAR ═══════════════════════════════════════════════════════
 * Qué es: la capa de servicios. Es el único archivo que sabe que los datos
 *   vienen de public/data/data.json. El enunciado pide consumirlo "simulando
 *   una llamada asíncrona": aquí se hace con fetch + 700 ms de latencia.
 *
 * Por qué no hay backend: el enunciado dice que es opcional y da el mismo
 *   puntaje. Esta capa permite pasar a una API real cambiando SOLO este archivo;
 *   ningún componente conoce de dónde vienen los datos.
 *
 * Tres detalles para destacar:
 *   1. La promesa se guarda en caché: StrictMode monta todo dos veces en
 *      desarrollo y no queremos pedir el JSON dos veces.
 *   2. Si falla, se borra la caché para que "Reintentar" realmente reintente.
 *   3. Se valida que la respuesta sea JSON: un hosting de SPA (Vercel) responde
 *      200 con index.html cuando falta el archivo, y `res.ok` solo no lo detecta.
 *      Lo descubrí probando el estado de error quitando el archivo.
 * ═════════════════════════════════════════════════════════════════════════
 */

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

const SIN_CONEXION = 'Revisa tu conexión a internet e inténtalo de nuevo.'
const DATOS_INVALIDOS =
  'El servidor no entregó los datos esperados. Inténtalo de nuevo en unos minutos.'

async function cargarDatos(): Promise<DatosIniciales> {
  try {
    const [respuesta] = await Promise.all([
      fetch(`${import.meta.env.BASE_URL}data/data.json`),
      esperar(),
    ])
    // Un hosting de SPA responde 200 con index.html si el archivo falta:
    // además de `ok` se exige que la respuesta sea JSON.
    const esJson = respuesta.headers.get('content-type')?.includes('json')
    if (!respuesta.ok || !esJson) throw new Error(DATOS_INVALIDOS)
    return (await respuesta.json()) as DatosIniciales
  } catch (error) {
    datosEnCurso = null // sin caché del fallo: "Reintentar" vuelve a pedir
    // fetch lanza TypeError cuando no hay red; el resto se informa sin jerga técnica.
    throw new Error(error instanceof TypeError ? SIN_CONEXION : DATOS_INVALIDOS)
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

/** Simula `POST /emprendimientos/:id/mensajes`. No cambia el estado global. */
export async function enviarMensaje(
  _emprendimientoId: string,
  _mensaje: string,
): Promise<void> {
  await esperar()
}

export interface SolicitudInfo {
  motivo: string
  mensaje: string
}

/** Simula `POST /grupos/:id/solicitudes`. No cambia el estado global. */
export async function enviarSolicitudInfo(
  _grupoId: string,
  _solicitud: SolicitudInfo,
): Promise<void> {
  await esperar()
}

// Fecha local en formato AAAA-MM-DD (toISOString usaría UTC y en Chile
// podría marcar el día siguiente por la noche).
function hoy() {
  const d = new Date()
  const dosDigitos = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${dosDigitos(d.getMonth() + 1)}-${dosDigitos(d.getDate())}`
}
