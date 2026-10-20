import { faStar as faStarVacia } from '@fortawesome/free-regular-svg-icons'
import { faStar } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useState } from 'react'
import s from './EstrellasInput.module.css'

interface Props {
  nombre: string
  valor: number // 0 = sin elegir
  onCambio: (estrellas: number) => void
  error?: string
  idError?: string
}

const ETIQUETAS = ['', 'Mala', 'Regular', 'Buena', 'Muy buena', 'Excelente']

/** Cinco radios reales: se eligen con clic, toque o flechas del teclado. */
export function EstrellasInput({
  nombre,
  valor,
  onCambio,
  error,
  idError,
}: Props) {
  // Estado efímero puramente visual: la estrella bajo el puntero.
  const [resaltada, setResaltada] = useState(0)
  const visible = resaltada || valor

  return (
    <fieldset
      className={s.estrellas}
      aria-invalid={Boolean(error)}
      aria-describedby={error ? idError : undefined}
    >
      <legend className={s.leyenda}>Puntuación</legend>
      <div className={s.fila}>
        <div className={s.opciones} onMouseLeave={() => setResaltada(0)}>
          {[1, 2, 3, 4, 5].map((n) => (
            <label
              key={n}
              className={s.estrella}
              data-llena={n <= visible}
              onMouseEnter={() => setResaltada(n)}
            >
              <input
                type="radio"
                name={nombre}
                value={n}
                checked={valor === n}
                onChange={() => onCambio(n)}
                className="sr-only"
              />
              <FontAwesomeIcon icon={n <= visible ? faStar : faStarVacia} />
              <span className="sr-only">
                {n} {n === 1 ? 'estrella' : 'estrellas'},{' '}
                {ETIQUETAS[n].toLowerCase()}
              </span>
            </label>
          ))}
        </div>
        <span className={s.etiqueta} aria-hidden="true">
          {ETIQUETAS[visible]}
        </span>
      </div>
    </fieldset>
  )
}
