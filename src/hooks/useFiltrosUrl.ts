import { useState } from 'react'
import { useSearchParams } from 'react-router'

/**
 * Filtros de una lista guardados en la URL (estado efímero de la vista, no
 * global): sobreviven a ir al detalle y volver con "atrás".
 *
 * El texto de búsqueda vive además en useState: el router actualiza la URL de
 * forma asíncrona y un input leído directo de ella perdería letras al escribir.
 */
export function useFiltrosUrl() {
  const [params, setParams] = useSearchParams()
  const [texto, setTextoLocal] = useState(() => params.get('q') ?? '')

  function actualizar(clave: string, valor: string) {
    setParams(
      (previos) => {
        const siguientes = new URLSearchParams(previos)
        if (valor) siguientes.set(clave, valor)
        else siguientes.delete(clave)
        return siguientes
      },
      { replace: true },
    )
  }

  return {
    texto,
    valor: (clave: string) => params.get(clave) ?? '',
    actualizar,
    buscar(valor: string) {
      setTextoLocal(valor)
      actualizar('q', valor)
    },
    /** Borra los filtros; `conservar` mantiene, por ejemplo, la pestaña activa. */
    limpiar(conservar: string[] = []) {
      setTextoLocal('')
      setParams(
        (previos) =>
          new URLSearchParams(
            conservar.flatMap((clave) => {
              const v = previos.get(clave)
              return v ? [[clave, v]] : []
            }),
          ),
        { replace: true },
      )
    },
  }
}
