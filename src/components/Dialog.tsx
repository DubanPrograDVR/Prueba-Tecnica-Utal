import { faXmark } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useEffect, useId, useRef, type ReactNode } from 'react'
import s from './Dialog.module.css'

interface Props {
  abierto: boolean
  onCerrar: () => void
  titulo: string
  descripcion?: ReactNode
  children: ReactNode
}

/**
 * <dialog> nativo: atrapa el foco, cierra con Esc y deja el fondo inerte sin
 * librerías. `abierto` es estado efímero del componente que lo abre; useRef +
 * useEffect lo sincronizan con showModal()/close(), la API imperativa del navegador.
 */
export function Dialog({
  abierto,
  onCerrar,
  titulo,
  descripcion,
  children,
}: Props) {
  const ref = useRef<HTMLDialogElement>(null)
  const idTitulo = useId()

  useEffect(() => {
    const dialogo = ref.current
    if (!dialogo) return
    if (abierto && !dialogo.open) dialogo.showModal()
    if (!abierto && dialogo.open) dialogo.close()
  }, [abierto])

  return (
    <dialog
      ref={ref}
      className={s.dialogo}
      aria-labelledby={idTitulo}
      onClose={onCerrar} // Esc
      onClick={(e) => {
        if (e.target === e.currentTarget) onCerrar() // clic en el fondo
      }}
    >
      <div className={s.contenido}>
        <header className={s.cabecera}>
          <div>
            <h2 id={idTitulo}>{titulo}</h2>
            {descripcion && <p className={s.descripcion}>{descripcion}</p>}
          </div>
          <button type="button" className={s.cerrar} onClick={onCerrar}>
            <FontAwesomeIcon icon={faXmark} />
            <span className="sr-only">Cerrar</span>
          </button>
        </header>
        {children}
      </div>
    </dialog>
  )
}
