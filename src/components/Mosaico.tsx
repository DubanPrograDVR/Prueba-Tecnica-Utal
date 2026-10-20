import type { CSSProperties } from 'react'
import { iniciales, tonoDe } from '../lib/tonos'
import s from './Mosaico.module.css'

/** Iniciales sobre el tinte pálido de su categoría. Decorativo: el texto va al lado. */
export function Mosaico({
  nombre,
  categoria,
}: {
  nombre: string
  categoria: string
}) {
  const tono = tonoDe(categoria)
  return (
    <span
      className={s.mosaico}
      style={{ '--fondo': tono.fondo, '--tinta': tono.tinta } as CSSProperties}
      aria-hidden="true"
    >
      {iniciales(nombre)}
    </span>
  )
}
