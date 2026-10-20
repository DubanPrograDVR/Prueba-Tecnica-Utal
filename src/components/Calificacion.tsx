import { faStar as faStarVacia } from '@fortawesome/free-regular-svg-icons'
import { faStar, faStarHalfStroke } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { formatoPromedio, plural } from '../lib/formato'
import s from './Calificacion.module.css'

/** Promedio compacto: "★ 4,5 · 2 reseñas", o "Sin reseñas" (nunca "0,0"). */
export function Calificacion({
  promedio,
  total,
}: {
  promedio: number | null
  total: number
}) {
  if (promedio === null) return <span className={s.vacia}>Sin reseñas</span>

  return (
    <span className={s.calificacion}>
      <FontAwesomeIcon icon={faStar} className={s.estrella} />
      <span className={`${s.promedio} num`}>{formatoPromedio(promedio)}</span>
      <span className="sr-only"> de 5 estrellas,</span>
      <span className={`${s.total} num`}>
        {plural(total, 'reseña', 'reseñas')}
      </span>
    </span>
  )
}

/** Cinco estrellas de solo lectura, redondeadas a la media estrella más cercana. */
export function Estrellas({
  valor,
  grande = false,
}: {
  valor: number
  grande?: boolean
}) {
  const redondeado = Math.round(valor * 2) / 2
  return (
    <span
      className={`${s.estrellas} ${grande ? s.grandes : ''}`}
      role="img"
      aria-label={`${formatoPromedio(valor)} de 5 estrellas`}
    >
      {[1, 2, 3, 4, 5].map((n) => (
        <FontAwesomeIcon
          key={n}
          icon={
            n <= redondeado
              ? faStar
              : n - 0.5 === redondeado
                ? faStarHalfStroke
                : faStarVacia
          }
        />
      ))}
    </span>
  )
}
