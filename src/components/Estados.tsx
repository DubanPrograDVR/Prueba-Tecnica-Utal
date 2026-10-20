import {
  faRotateRight,
  faTriangleExclamation,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import type { ReactNode } from 'react'
import { Link } from 'react-router'
import s from './Estados.module.css'

/** Carga: la misma estructura final con barras grises a su tamaño real, sin shimmer. */
export function SkeletonLista() {
  return (
    <div className={s.skeleton} aria-busy="true" aria-label="Cargando">
      <span className={s.barraTitulo} />
      <span className={s.barraSub} />
      <span className={s.barraFiltros} />
      <ul role="list" className={s.panel}>
        {Array.from({ length: 6 }, (_, i) => (
          <li key={i} className={s.fila}>
            <span className={s.cuadro} />
            <span className={s.lineas}>
              <span />
              <span />
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

/** Error dentro del bloque que falló, con una acción para reintentar. */
export function EstadoError({
  mensaje,
  onReintentar,
}: {
  mensaje: string
  onReintentar: () => void
}) {
  return (
    <div role="alert" className={s.error}>
      <FontAwesomeIcon icon={faTriangleExclamation} className={s.iconoError} />
      <div>
        <p className={s.tituloError}>
          No pudimos cargar los emprendimientos y grupos.
        </p>
        <p className={s.detalle}>{mensaje}</p>
      </div>
      <button type="button" className="btn" onClick={onReintentar}>
        <FontAwesomeIcon icon={faRotateRight} />
        Reintentar
      </button>
    </div>
  )
}

/** Vacío: conserva el marco y dice qué pasó y qué hacer. */
export function EstadoVacio({
  children,
  accion,
}: {
  children: ReactNode
  accion?: ReactNode
}) {
  return (
    <div className={s.vacio}>
      <p>{children}</p>
      {accion}
    </div>
  )
}

/** 404: ruta desconocida o un emprendimiento que no existe. */
export function NoEncontrado({ mensaje }: { mensaje: string }) {
  return (
    <div className={s.noEncontrado}>
      <h1>No encontramos esta página</h1>
      <EstadoVacio
        accion={
          <Link to="/emprendimientos" className="btn">
            Ver emprendimientos
          </Link>
        }
      >
        {mensaje}
      </EstadoVacio>
    </div>
  )
}
