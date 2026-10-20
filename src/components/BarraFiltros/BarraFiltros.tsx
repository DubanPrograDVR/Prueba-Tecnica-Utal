import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import s from './BarraFiltros.module.css'

export interface Filtro {
  id: string
  etiqueta: string
  todas: string // texto de la opción vacía: "Todas las categorías"
  valor: string
  opciones: { valor: string; etiqueta: string }[]
  onCambio: (valor: string) => void
}

interface Props {
  texto: string
  onTexto: (texto: string) => void
  ayudaBusqueda: string
  filtros: Filtro[]
  resultados: string // "23 emprendimientos"
}

/** Búsqueda y selects nativos (en el teléfono abren el selector del sistema). */
export function BarraFiltros({
  texto,
  onTexto,
  ayudaBusqueda,
  filtros,
  resultados,
}: Props) {
  return (
    <div className={s.barra} role="search">
      <label className={s.busqueda}>
        <span className="sr-only">Buscar</span>
        <FontAwesomeIcon icon={faMagnifyingGlass} className={s.lupa} />
        <input
          type="search"
          className="input"
          value={texto}
          placeholder={ayudaBusqueda}
          enterKeyHint="search"
          onChange={(e) => onTexto(e.target.value)}
        />
      </label>

      {filtros.map((filtro) => (
        <label key={filtro.id} className={s.filtro}>
          <span className="sr-only">{filtro.etiqueta}</span>
          <select
            className="input"
            value={filtro.valor}
            data-activo={filtro.valor !== ''}
            onChange={(e) => filtro.onCambio(e.target.value)}
          >
            <option value="">{filtro.todas}</option>
            {filtro.opciones.map((opcion) => (
              <option key={opcion.valor} value={opcion.valor}>
                {opcion.etiqueta}
              </option>
            ))}
          </select>
        </label>
      ))}

      <p className={`${s.resultados} num`} aria-live="polite">
        {resultados}
      </p>
    </div>
  )
}
