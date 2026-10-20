import { Link, useParams } from 'react-router'
import { contarLikes } from '../../lib/selectores'
import { useDatosListos } from '../../state/DatosContext'
import { useSesion } from '../../state/SesionContext'

// TODO(etapa 5): detalle con reseñas y contacto. Por ahora verifica el like derivado.
export function EmprendimientoDetallePage() {
  const { id } = useParams()
  const { emprendimientos, estudianteActual } = useDatosListos()
  const { likesIds, toggleLike } = useSesion()
  const emprendimiento = emprendimientos.find((e) => e.id === id)

  if (!emprendimiento) return <p>Emprendimiento no encontrado</p>

  const likeInicial = estudianteActual.likesEmprendimientosIds.includes(
    emprendimiento.id,
  )
  const likeActual = likesIds.includes(emprendimiento.id)

  return (
    <div>
      <Link to="/emprendimientos">← Volver</Link>
      <h1>{emprendimiento.nombre}</h1>
      <button
        aria-pressed={likeActual}
        onClick={() => toggleLike(emprendimiento.id)}
      >
        Me gusta · {contarLikes(emprendimiento, likeInicial, likeActual)}
      </button>
    </div>
  )
}
