import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useRef, type MouseEvent, type ReactNode } from 'react'
import { destello, latido } from '../../lib/animaciones'
import { Contador } from '../Contador/Contador'
import s from './BotonReaccion.module.css'

interface Props {
  tipo: 'like' | 'guardar'
  activo: boolean
  onAlternar: () => void
  iconoVacio: IconDefinition
  iconoLleno: IconDefinition
  cuenta?: number
  className?: string
  children: ReactNode // texto accesible o visible ("me gusta", "Guardar")
}

/**
 * Toggle de "me gusta" o "guardar". El ícono de contorno y el relleno están
 * apilados: el relleno aparece con una transición CSS (no corre al cargar la
 * página y se puede interrumpir). El latido y el destello son WAAPI y solo
 * ocurren al pulsar con el puntero; con teclado no se anima (Emil Kowalski).
 * La forma del botón (borde, tamaño) la decide quien lo usa con `className`.
 */
export function BotonReaccion({
  tipo,
  activo,
  onAlternar,
  iconoVacio,
  iconoLleno,
  cuenta,
  className = '',
  children,
}: Props) {
  const icono = useRef<HTMLSpanElement>(null)
  const anillo = useRef<HTMLSpanElement>(null)

  function alternar(evento: MouseEvent) {
    // detail === 0 cuando el clic viene del teclado (Enter o Espacio).
    if (evento.detail > 0) {
      latido(icono.current, activo ? 0.85 : 1.2) // marcar celebra; desmarcar solo responde
      if (tipo === 'like' && !activo) destello(anillo.current)
    }
    onAlternar()
  }

  return (
    <button
      type="button"
      className={`${s.boton} ${className}`}
      data-tipo={tipo}
      aria-pressed={activo}
      onClick={alternar}
    >
      <span ref={icono} className={s.icono}>
        <FontAwesomeIcon icon={iconoVacio} className={s.vacio} />
        <FontAwesomeIcon icon={iconoLleno} className={s.lleno} />
        {tipo === 'like' && (
          <span ref={anillo} className={s.anillo} aria-hidden="true" />
        )}
      </span>
      {cuenta !== undefined && <Contador valor={cuenta} />}
      {children}
    </button>
  )
}
