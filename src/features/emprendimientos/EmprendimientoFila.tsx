import {
  faBookmark as faBookmarkVacio,
  faHeart as faHeartVacio,
} from '@fortawesome/free-regular-svg-icons'
import { faBookmark, faHeart } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { memo } from 'react'
import { Link } from 'react-router'
import { Calificacion } from '../../components/Calificacion/Calificacion'
import { Mosaico } from '../../components/Mosaico/Mosaico'
import type { Emprendimiento } from '../../types'
import s from './EmprendimientoFila.module.css'

interface Props {
  emprendimiento: Emprendimiento
  campus: string
  likes: number
  liked: boolean
  favorito: boolean
  promedio: number | null
  totalResenas: number
  onLike: (id: string) => void
  onFavorito: (id: string) => void
}

/**
 * memo + props simples + acciones estables del contexto: al dar "me gusta"
 * solo se vuelve a renderizar esta fila, no las otras 163.
 */
export const EmprendimientoFila = memo(function EmprendimientoFila({
  emprendimiento,
  campus,
  likes,
  liked,
  favorito,
  promedio,
  totalResenas,
  onLike,
  onFavorito,
}: Props) {
  const { id, nombre, descripcion, clasificacion } = emprendimiento

  return (
    <li className={s.fila}>
      <Mosaico nombre={nombre} categoria={clasificacion} />

      <div className={s.identidad}>
        {/* El enlace cubre toda la fila (::after); los botones quedan por encima. */}
        <Link to={`/emprendimientos/${id}`} className={s.nombre}>
          {nombre}
        </Link>
        <p className={s.descripcion}>{descripcion}</p>
      </div>

      <p className={s.meta}>
        <span>{clasificacion}</span>
        <span className={s.campus}>{campus}</span>
      </p>

      <div className={s.calificacion}>
        <Calificacion promedio={promedio} total={totalResenas} />
      </div>

      <button
        type="button"
        className={`${s.accion} ${s.like}`}
        aria-pressed={liked}
        onClick={() => onLike(id)}
      >
        {/* key: el ícono nuevo se monta y @starting-style le da el "pop" */}
        <FontAwesomeIcon
          key={String(liked)}
          icon={liked ? faHeart : faHeartVacio}
        />
        <span className="num">{likes}</span>
        <span className="sr-only"> me gusta</span>
      </button>

      <button
        type="button"
        className={`${s.accion} ${s.favorito}`}
        aria-pressed={favorito}
        onClick={() => onFavorito(id)}
      >
        <FontAwesomeIcon
          key={String(favorito)}
          icon={favorito ? faBookmark : faBookmarkVacio}
        />
        <span className="sr-only">Guardar en favoritos</span>
      </button>
    </li>
  )
})
