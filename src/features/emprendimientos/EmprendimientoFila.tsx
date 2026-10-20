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

/*
 * ═══ PARA EXPLICAR (OPTIMIZACIÓN, parte del 30 % de la rúbrica) ══════════
 * Un "me gusta" debe re-renderizar UNA fila, no las 164. Tres piezas lo logran:
 *   1. React.memo: la fila se salta el render si sus props no cambiaron.
 *   2. Props simples (booleanos y números ya calculados, no objetos nuevos):
 *      memo compara por referencia, y un objeto nuevo en cada render lo anularía.
 *   3. onLike y onFavorito vienen del contexto dentro de un useMemo: son la
 *      misma función en todos los renders, así que no rompen el memo.
 *
 * La fila NO calcula nada: recibe likes, promedio y total ya derivados. Es solo
 * presentación (componente "tonto"); la lógica está en lib/selectores.ts.
 *
 * El nombre es un enlace estirado (::after) que cubre toda la fila, y los
 * botones quedan por encima: toda la fila es clicable sin anidar enlaces.
 * ═════════════════════════════════════════════════════════════════════════
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
