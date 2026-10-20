import { useEffect, useRef, type CSSProperties } from 'react'
import { tonoDe } from '../../lib/tonos'
import s from './Chips.module.css'

interface Opcion {
  valor: string
  cuenta: number
}

interface Props {
  etiqueta: string // nombre accesible del grupo: "Categoría"
  todas: string // primer chip: "Todas"
  total: number
  opciones: Opcion[]
  valor: string // '' = todas
  onCambio: (valor: string) => void
}

/**
 * Filtro de una sola elección como fila de chips, cada uno con el tinte de su
 * categoría (el rasgo visual de la app). Los conteos siguen a los demás filtros.
 * En el teléfono la fila se desliza de lado sin mover la página.
 */
export function Chips({
  etiqueta,
  todas,
  total,
  opciones,
  valor,
  onCambio,
}: Props) {
  const fila = useRef<HTMLDivElement>(null)

  // Solo al montar: si se llega con un filtro ya elegido (desde la URL o al
  // volver del detalle), su chip puede estar fuera de la fila visible.
  useEffect(() => {
    fila.current
      ?.querySelector('[aria-pressed="true"]')
      ?.scrollIntoView({ inline: 'center', block: 'nearest' })
  }, [])

  return (
    <div ref={fila} role="group" aria-label={etiqueta} className={s.chips}>
      <button
        type="button"
        className={s.chip}
        aria-pressed={valor === ''}
        onClick={() => onCambio('')}
      >
        {todas}
        <span className={`${s.cuenta} num`}>{total}</span>
      </button>

      {opciones.map((opcion) => {
        const tono = tonoDe(opcion.valor)
        const activo = opcion.valor === valor
        return (
          <button
            key={opcion.valor}
            type="button"
            className={s.chip}
            style={
              { '--fondo': tono.fondo, '--tinta': tono.tinta } as CSSProperties
            }
            aria-pressed={activo}
            // Tocar el chip activo lo desmarca: vuelve a "Todas".
            onClick={() => onCambio(activo ? '' : opcion.valor)}
          >
            {opcion.valor}
            <span className={`${s.cuenta} num`}>{opcion.cuenta}</span>
          </button>
        )
      })}
    </div>
  )
}
