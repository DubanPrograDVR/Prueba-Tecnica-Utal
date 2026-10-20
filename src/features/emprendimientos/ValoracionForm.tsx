import { useId, useState, type FormEvent } from 'react'
import { toast } from 'sonner'
import { EstrellasInput } from '../../components/EstrellasInput'
import {
  enfocarPrimerError,
  validarValoracion,
  type Errores,
} from '../../lib/validaciones'
import { useSesion } from '../../state/SesionContext'

const MAXIMO = 280

/**
 * Todo el estado del formulario es efímero (useState): valores, errores y
 * "enviando". Solo al publicar se toca el contexto, que recalcula promedio y total.
 */
export function ValoracionForm({
  emprendimientoId,
}: {
  emprendimientoId: string
}) {
  const { publicarValoracion } = useSesion()
  const [estrellas, setEstrellas] = useState(0)
  const [comentario, setComentario] = useState('')
  const [errores, setErrores] = useState<Errores>({})
  const [enviando, setEnviando] = useState(false)
  const id = useId()

  async function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    const encontrados = validarValoracion(estrellas, comentario)
    setErrores(encontrados)
    if (Object.keys(encontrados).length > 0) {
      enfocarPrimerError(evento.currentTarget, encontrados)
      return
    }

    setEnviando(true)
    try {
      await publicarValoracion(emprendimientoId, estrellas, comentario.trim())
      setEstrellas(0)
      setComentario('')
      toast.success('Tu recomendación ya está publicada. ¡Gracias!')
    } catch {
      // El texto se conserva: el estudiante no pierde lo que escribió.
      toast.error('No pudimos publicar tu recomendación. Inténtalo de nuevo.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <form className="formulario" noValidate onSubmit={enviar}>
      <EstrellasInput
        nombre="estrellas"
        valor={estrellas}
        onCambio={(n) => {
          setEstrellas(n)
          setErrores((previos) => ({ ...previos, estrellas: '' }))
        }}
        error={errores.estrellas}
        idError={`${id}-error-estrellas`}
      />
      {errores.estrellas && (
        <p id={`${id}-error-estrellas`} className="error-campo">
          {errores.estrellas}
        </p>
      )}

      <div className="campo">
        <label htmlFor={`${id}-comentario`}>Tu recomendación</label>
        <textarea
          id={`${id}-comentario`}
          name="comentario"
          className="input"
          rows={3}
          maxLength={MAXIMO}
          value={comentario}
          placeholder="¿Qué te gustó? ¿Lo recomendarías?"
          aria-invalid={Boolean(errores.comentario)}
          aria-describedby={`${id}-ayuda-comentario`}
          onChange={(e) => {
            setComentario(e.target.value)
            setErrores((previos) => ({ ...previos, comentario: '' }))
          }}
        />
        <p
          id={`${id}-ayuda-comentario`}
          className={errores.comentario ? 'error-campo' : 'ayuda-campo'}
        >
          {errores.comentario || (
            <span className="num">
              {comentario.length}/{MAXIMO} caracteres
            </span>
          )}
        </p>
      </div>

      <div className="acciones-formulario">
        <button
          type="submit"
          className="btn btn-primary"
          disabled={enviando}
          aria-busy={enviando}
        >
          {enviando ? 'Publicando…' : 'Publicar recomendación'}
        </button>
      </div>
    </form>
  )
}
