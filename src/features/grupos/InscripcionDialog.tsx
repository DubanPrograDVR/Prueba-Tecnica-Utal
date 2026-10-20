import { useId, useState, type FormEvent } from 'react'
import { toast } from 'sonner'
import { Dialog } from '../../components/Dialog'
import { nombreGrupo } from '../../lib/formato'
import { enfocarPrimerError, validarInscripcion } from '../../lib/validaciones'
import { useSesion } from '../../state/SesionContext'
import type { GrupoIntermedio } from '../../types'
import s from './Dialogos.module.css'

interface Props {
  grupo: GrupoIntermedio
  abierto: boolean
  onCerrar: () => void
}

/** Confirmación de inscripción: resume la reunión y pide aceptar los requisitos. */
export function InscripcionDialog({ grupo, abierto, onCerrar }: Props) {
  const { inscribirse } = useSesion()
  const [acepta, setAcepta] = useState(false)
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)
  const id = useId()

  async function confirmar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    const errores = validarInscripcion(acepta)
    setError(errores.requisitos ?? '')
    if (errores.requisitos) {
      enfocarPrimerError(evento.currentTarget, errores)
      return
    }

    setEnviando(true)
    try {
      await inscribirse(grupo.id)
      onCerrar()
      toast.success('¡Inscripción confirmada!', {
        description: `Primera reunión: ${grupo.horario_reunion.toLowerCase()}.`,
      })
    } catch {
      toast.error('No pudimos completar tu inscripción. Inténtalo de nuevo.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <Dialog
      abierto={abierto}
      onCerrar={onCerrar}
      titulo="Confirmar inscripción"
      descripcion={nombreGrupo(grupo.nombre)}
    >
      <form className="formulario" noValidate onSubmit={confirmar}>
        <dl className={s.resumen}>
          <div>
            <dt>Horario</dt>
            <dd>{grupo.horario_reunion}</dd>
          </div>
          <div>
            <dt>Lugar</dt>
            <dd>{grupo.lugar_reunion ?? 'Por confirmar'}</dd>
          </div>
          <div>
            <dt>Requisitos</dt>
            <dd>{grupo.requisitos}</dd>
          </div>
        </dl>

        <div className="campo">
          <label className={s.casilla}>
            <input
              type="checkbox"
              name="requisitos"
              checked={acepta}
              aria-invalid={Boolean(error)}
              aria-describedby={error ? `${id}-error` : undefined}
              onChange={(e) => {
                setAcepta(e.target.checked)
                setError('')
              }}
            />
            Cumplo con los requisitos del grupo
          </label>
          {error && (
            <p id={`${id}-error`} className="error-campo">
              {error}
            </p>
          )}
        </div>

        <div className="acciones-formulario">
          <button type="button" className="btn" onClick={onCerrar}>
            Cancelar
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={enviando}
            aria-busy={enviando}
          >
            {enviando ? 'Inscribiendo…' : 'Confirmar inscripción'}
          </button>
        </div>
      </form>
    </Dialog>
  )
}
