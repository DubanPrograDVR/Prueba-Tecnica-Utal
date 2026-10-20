import { faStar } from '@fortawesome/free-solid-svg-icons'
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
