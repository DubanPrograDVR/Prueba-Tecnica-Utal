import { Link } from 'react-router'
import { useDatosListos } from '../../state/DatosContext'
import { useSesion } from '../../state/SesionContext'

// TODO(etapa 5): directorio con filtros e inscripción. Por ahora verifica datos y sesión.
export function GruposPage() {
  const { grupos_intermedios } = useDatosListos()
  const { gruposInscritosIds } = useSesion()

  return (
    <div>
      <h1>Grupos intermedios ({grupos_intermedios.length})</h1>
      <p>Inscrito en: {gruposInscritosIds.join(', ')}</p>
      <Link to="/emprendimientos">Emprendimientos</Link>
    </div>
  )
}
