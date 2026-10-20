import { useRef, type KeyboardEvent } from 'react'
import s from './Tabs.module.css'

interface Opcion<T> {
  valor: T
  etiqueta: string
  cuenta: number
}

interface Props<T extends string> {
  etiqueta: string
  opciones: Opcion<T>[]
  valor: T
  onCambio: (valor: T) => void
  controla: string // id del panel (la lista) que filtran las pestañas
}

/** Pestañas subrayadas (patrón WAI-ARIA: flechas para moverse, activación automática). */
export function Tabs<T extends string>({
  etiqueta,
  opciones,
  valor,
  onCambio,
  controla,
}: Props<T>) {
  const botones = useRef<(HTMLButtonElement | null)[]>([])

  function alPresionarTecla(evento: KeyboardEvent, indice: number) {
    const paso = { ArrowRight: 1, ArrowLeft: -1 }[evento.key]
    if (!paso) return
    const siguiente = (indice + paso + opciones.length) % opciones.length
    botones.current[siguiente]?.focus()
    onCambio(opciones[siguiente].valor)
  }

  return (
    <div role="tablist" aria-label={etiqueta} className={s.tabs}>
      {opciones.map((opcion, indice) => {
        const activa = opcion.valor === valor
        return (
          <button
            key={opcion.valor}
            ref={(el) => {
              botones.current[indice] = el
            }}
            type="button"
            role="tab"
            aria-selected={activa}
            aria-controls={controla}
            tabIndex={activa ? 0 : -1}
            className={s.tab}
            onClick={() => onCambio(opcion.valor)}
            onKeyDown={(evento) => alPresionarTecla(evento, indice)}
          >
            {opcion.etiqueta}
            <span className={`${s.cuenta} num`}>{opcion.cuenta}</span>
          </button>
        )
      })}
    </div>
  )
}
