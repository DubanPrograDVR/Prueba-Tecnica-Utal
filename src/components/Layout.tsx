import { faStore, faUsers } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import type { ReactNode } from 'react'
import { Link, NavLink } from 'react-router'
import { useDatos } from '../state/DatosContext'
import s from './Layout.module.css'
import { Avatar } from './Mosaico'

// Un solo <nav>: barra lateral en escritorio, barra inferior en el teléfono (CSS).
const SECCIONES = [
  { ruta: '/emprendimientos', etiqueta: 'Emprendimientos', icono: faStore },
  { ruta: '/grupos', etiqueta: 'Grupos', icono: faUsers },
]

export function Layout({ children }: { children: ReactNode }) {
  const carga = useDatos()
  const datos = carga.estado === 'listo' ? carga.datos : null
  const estudiante = datos?.estudianteActual
  const campus = datos?.campus.find((c) => c.id === estudiante?.campus_id)

  return (
    <div className={s.app}>
      <a href="#contenido" className={s.saltar}>
        Saltar al contenido
      </a>

      <aside className={s.lateral}>
        <Link to="/emprendimientos" className={s.marca}>
          <span className={s.sello} aria-hidden="true">
            U
          </span>
          <span>
            <strong>Comunidad UTalca</strong>
            <small>Universidad de Talca</small>
          </span>
        </Link>

        <nav aria-label="Secciones" className={s.nav}>
          {SECCIONES.map((seccion) => (
            <NavLink key={seccion.ruta} to={seccion.ruta} className={s.enlace}>
              <FontAwesomeIcon icon={seccion.icono} className={s.icono} />
              {seccion.etiqueta}
            </NavLink>
          ))}
        </nav>

        {estudiante && (
          <div className={s.usuario}>
            <Avatar nombre={estudiante.nombre} />
            <span className={s.datosUsuario}>
              <strong>{estudiante.nombre}</strong>
              <small>{campus?.nombre}</small>
            </span>
          </div>
        )}
      </aside>

      <main id="contenido" className={s.contenido}>
        {children}
      </main>
    </div>
  )
}
