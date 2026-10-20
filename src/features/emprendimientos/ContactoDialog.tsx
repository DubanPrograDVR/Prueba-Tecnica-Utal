import { useId, useState, type FormEvent } from 'react'
import { toast } from 'sonner'
import { Dialog } from '../../components/Dialog/Dialog'
import { enfocarPrimerError, validarMensaje } from '../../lib/validaciones'
import { enviarMensaje } from '../../services/api'
import { useDatosListos } from '../../state/DatosContext'
import type { Emprendimiento } from '../../types'

interface Props {
  emprendimiento: Emprendimiento
  abierto: boolean
  onCerrar: () => void
}

/**
 * Mensaje directo al emprendimiento. Enviar no cambia el estado global, así
 * que el formulario llama al servicio directamente (sin pasar por el contexto).
 * Si se cierra sin enviar, el borrador se conserva.
 */
export function ContactoDialog({ emprendimiento, abierto, onCerrar }: Props) {
  const { estudianteActual } = useDatosListos()
  const [mensaje, setMensaje] = useState('')
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)
  const id = useId()

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
      await enviarMensaje(emprendimiento.id, mensaje.trim())
      setMensaje('')
      onCerrar()
      toast.success(`Mensaje enviado a ${emprendimiento.nombre}`, {
        description: `Te responderán a ${estudianteActual.correo}.`,
      })
    } catch {
      toast.error('No pudimos enviar tu mensaje. Inténtalo de nuevo.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <Dialog
      abierto={abierto}
      onCerrar={onCerrar}
      titulo={`Escribir a ${emprendimiento.nombre}`}
      descripcion={`Te responderán a ${estudianteActual.correo}.`}
    >
      <form className="formulario" noValidate onSubmit={enviar}>
        <div className="campo">
          <label htmlFor={`${id}-mensaje`}>Mensaje</label>
          <textarea
            id={`${id}-mensaje`}
            name="mensaje"
            className="input"
            rows={4}
            maxLength={500}
            value={mensaje}
            placeholder="Hola, ¿tienen disponibilidad esta semana?"
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
            {error || 'Pregunta por productos, precios o disponibilidad.'}
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
            {enviando ? 'Enviando…' : 'Enviar mensaje'}
          </button>
        </div>
      </form>
    </Dialog>
  )
}
