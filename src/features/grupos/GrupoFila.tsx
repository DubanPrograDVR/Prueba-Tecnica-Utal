import { faCircleCheck } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { memo, type CSSProperties } from 'react'
import { Mosaico } from '../../components/Mosaico'
import { nombreGrupo, plural } from '../../lib/formato'
import type { GrupoIntermedio } from '../../types'
import s from './GrupoFila.module.css'

export type TipoDialogo = 'info' | 'inscripcion'

interface Props {
  grupo: GrupoIntermedio
  campus: string
  esMiembro: boolean
  cupos: number
  miembros: number
  puedeInscribirse: boolean
  onAbrir: (tipo: TipoDialogo, grupo: GrupoIntermedio) => void
}

export const GrupoFila = memo(function GrupoFila({
  grupo,
  campus,
  esMiembro,
  cupos,
  miembros,
  puedeInscribirse,
  onAbrir,
}: Props) {
  // Ocupación: miembros sobre el total (miembros + cupos libres).
  const capacidad = miembros + cupos
  const ocupacion = capacidad > 0 ? miembros / capacidad : 0

  return (
    <li className={s.fila} data-miembro={esMiembro}>
      <Mosaico nombre={grupo.nombre} categoria={grupo.tematica} />

      <div className={s.identidad}>
        <h2 className={s.nombre}>{nombreGrupo(grupo.nombre)}</h2>
        <p className={s.meta}>
          <span>{grupo.tematica}</span>
          <span>{campus}</span>
        </p>
        <p className={s.descripcion}>{grupo.descripcion}</p>
        <p className={s.requisitos}>
          <strong>Requisitos:</strong> {grupo.requisitos}
        </p>
      </div>

      <dl className={s.reunion}>
        <div>
          <dt>Horario</dt>
          <dd>{grupo.horario_reunion}</dd>
        </div>
        <div>
          <dt>Lugar</dt>
          <dd className={grupo.lugar_reunion ? undefined : s.pendiente}>
            {grupo.lugar_reunion ?? 'Por confirmar'}
          </dd>
        </div>
      </dl>

      <div className={s.cupos}>
        <p className="num">
          {cupos > 0 ? (
            <>
              <strong>{cupos}</strong>{' '}
              {cupos === 1 ? 'cupo libre' : 'cupos libres'}
            </>
          ) : (
            <strong className={s.sinCupos}>Sin cupos</strong>
          )}
        </p>
        <span
          className={s.barra}
          style={{ '--ocupacion': ocupacion } as CSSProperties}
          aria-hidden="true"
        />
        <p className={`${s.miembros} num`}>
          {plural(miembros, 'miembro', 'miembros')}
        </p>
      </div>

      <div className={s.acciones}>
        {esMiembro ? (
          <span className="pill pill-positive">
            <FontAwesomeIcon icon={faCircleCheck} />
            Eres miembro
          </span>
        ) : (
          puedeInscribirse && (
            <button
              type="button"
              className="btn"
              onClick={() => onAbrir('inscripcion', grupo)}
            >
              Inscribirme
            </button>
          )
        )}
        <button
          type="button"
          className={s.enlace}
          onClick={() => onAbrir('info', grupo)}
        >
          Pedir información
        </button>
      </div>
    </li>
  )
})
