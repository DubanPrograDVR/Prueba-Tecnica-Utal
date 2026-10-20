import {
  faBookmark as faBookmarkVacio,
  faHeart as faHeartVacio,
} from '@fortawesome/free-regular-svg-icons'
import { faBookmark, faHeart } from '@fortawesome/free-solid-svg-icons'
import { memo } from 'react'
import { Link } from 'react-router'
import { BotonReaccion } from '../../components/BotonReaccion/BotonReaccion'
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

      <BotonReaccion
        tipo="like"
        activo={liked}
        onAlternar={() => onLike(id)}
        iconoVacio={faHeartVacio}
        iconoLleno={faHeart}
        cuenta={likes}
        className={`${s.accion} ${s.like}`}
      >
        <span className="sr-only"> me gusta</span>
      </BotonReaccion>

      <BotonReaccion
        tipo="guardar"
        activo={favorito}
        onAlternar={() => onFavorito(id)}
        iconoVacio={faBookmarkVacio}
        iconoLleno={faBookmark}
        className={`${s.accion} ${s.favorito}`}
      >
        <span className="sr-only">Guardar en favoritos</span>
      </BotonReaccion>
    </li>
  )
})
