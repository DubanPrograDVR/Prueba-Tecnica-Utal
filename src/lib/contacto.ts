import type { Emprendimiento } from '../types'

export type TipoCanal = 'whatsapp' | 'instagram' | 'correo'

export interface Canal {
  tipo: TipoCanal
  etiqueta: string
  detalle: string
  url: string
}

/**
 * Canales registrados del emprendimiento, solo los que existen (el JSON trae
 * `null` en muchos). Supuesto: el teléfono registrado es el de WhatsApp.
 */
export function canalesDeContacto(e: Emprendimiento): Canal[] {
  const { telefono, instagram, correo } = e.redes_y_contacto
  const canales: Canal[] = []

  if (telefono) {
    const saludo = `Hola, te escribo por ${e.nombre} desde Comunidad UTalca.`
    canales.push({
      tipo: 'whatsapp',
      etiqueta: 'WhatsApp',
      detalle: telefono,
      // wa.me solo acepta dígitos: "+56913356886" → "56913356886"
      url: `https://wa.me/${telefono.replace(/\D/g, '')}?text=${encodeURIComponent(saludo)}`,
    })
  }
  if (instagram) {
    canales.push({
      tipo: 'instagram',
      etiqueta: 'Instagram',
      detalle: instagram,
      // algunos usuarios del JSON traen tildes: se codifican
      url: `https://instagram.com/${encodeURIComponent(instagram.replace(/^@/, ''))}`,
    })
  }
  if (correo) {
    canales.push({
      tipo: 'correo',
      etiqueta: 'Correo',
      detalle: correo,
      url: `mailto:${correo}?subject=${encodeURIComponent(`Consulta sobre ${e.nombre}`)}`,
    })
  }
  return canales
}
