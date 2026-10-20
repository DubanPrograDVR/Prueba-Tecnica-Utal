import { useId, useState, type FormEvent } from 'react'
import { toast } from 'sonner'
import { Dialog } from '../../components/Dialog'
import { nombreGrupo } from '../../lib/formato'
import { enfocarPrimerError, validarMensaje } from '../../lib/validaciones'
import { enviarSolicitudInfo } from '../../services/api'
import { useDatosListos } from '../../state/DatosContext'
import type { GrupoIntermedio } from '../../types'

const MOTIVOS = [
  'Horarios y actividades',
  'Requisitos de ingreso',
  'Cómo participar',
  'Otro',
]

interface Props {
  grupo: GrupoIntermedio
  abierto: boolean
  onCerrar: () => void
}

/**
 * Consulta a la coordinación del grupo. Disponible para cualquier grupo (incluso
 * sin cupos). No cambia el estado global: llama al servicio directamente.
 */
export function SolicitudInfoDialog({ grupo, abierto, onCerrar }: Props) {
  const { estudianteActual } = useDatosListos()
  const [motivo, setMotivo] = useState(MOTIVOS[0])
  const [mensaje, setMensaje] = useState('')
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)
  const id = useId()
  const { representante } = grupo.contacto_directiva

  async function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    const errores = validarMensaje(mensaje)
    setError(errores.mensaje ?? '')
    if (errores.mensaje) {
      enfocarPrimerError(evento.currentTarget, errores)
      return
    }

    setEnviando(true)
    try {
      await enviarSolicitudInfo(grupo.id, { motivo, mensaje: mensaje.trim() })
      setMensaje('')
      onCerrar()
      toast.success(`Solicitud enviada a ${representante}`, {
        description: `Te responderá a ${estudianteActual.correo}.`,
      })
    } catch {
      toast.error('No pudimos enviar tu solicitud. Inténtalo de nuevo.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <Dialog
      abierto={abierto}
      onCerrar={onCerrar}
      titulo="Pedir información"
      descripcion={
        <>
          La recibirá {representante}, de la directiva de{' '}
          {nombreGrupo(grupo.nombre)}.
        </>
      }
    >
      <form className="formulario" noValidate onSubmit={enviar}>
        <div className="campo">
          <label htmlFor={`${id}-motivo`}>Motivo</label>
          <select
            id={`${id}-motivo`}
            name="motivo"
            className="input"
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
          >
            {MOTIVOS.map((m) => (
              <option key={m}>{m}</option>
            ))}
          </select>
        </div>

        <div className="campo">
          <label htmlFor={`${id}-mensaje`}>Tu consulta</label>
          <textarea
            id={`${id}-mensaje`}
            name="mensaje"
            className="input"
            rows={4}
            maxLength={500}
            value={mensaje}
            placeholder="¿Necesito experiencia previa para unirme?"
            aria-invalid={Boolean(error)}
            aria-describedby={`${id}-ayuda`}
            onChange={(e) => {
              setMensaje(e.target.value)
              setError('')
            }}
          />
          <p
            id={`${id}-ayuda`}
            className={error ? 'error-campo' : 'ayuda-campo'}
          >
            {error || `Te responderán a ${estudianteActual.correo}.`}
          </p>
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
            {enviando ? 'Enviando…' : 'Enviar solicitud'}
          </button>
        </div>
      </form>
    </Dialog>
  )
}
