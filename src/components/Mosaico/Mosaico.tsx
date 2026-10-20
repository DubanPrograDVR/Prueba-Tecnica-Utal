import type { CSSProperties } from 'react'
import { iniciales, tonoDe, tonoDePersona, type Tono } from '../../lib/tonos'
import s from './Mosaico.module.css'

const estilo = (tono: Tono) =>
  ({ '--fondo': tono.fondo, '--tinta': tono.tinta }) as CSSProperties

/** Iniciales sobre el tinte pálido de su categoría. Decorativo: el texto va al lado. */
export function Mosaico({
  nombre,
  categoria,
  grande = false,
}: {
  nombre: string
  categoria: string
  grande?: boolean
}) {
  return (
    <span
      className={`${s.mosaico} ${grande ? s.grande : ''}`}
      style={estilo(tonoDe(categoria))}
      aria-hidden="true"
    >
      {iniciales(nombre)}
    </span>
  )
}

/** Persona: círculo con sus iniciales y su tono estable. */
export function Avatar({ nombre }: { nombre: string }) {
  return (
    <span
      className={s.avatar}
      style={estilo(tonoDePersona(nombre))}
      aria-hidden="true"
    >
      {iniciales(nombre)}
    </span>
  )
}
