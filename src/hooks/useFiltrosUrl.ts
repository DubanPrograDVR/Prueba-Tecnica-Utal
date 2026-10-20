import { useState } from 'react'
import { useSearchParams } from 'react-router'

/*
 * ═══ PARA EXPLICAR ═══════════════════════════════════════════════════════
 * Qué es: un hook que guarda los filtros de una lista (búsqueda, categoría,
 *   campus, pestaña) en la URL, por ejemplo ?q=tutorias&campus=camp_7.
 *
 * Es ESTADO EFÍMERO (el enunciado dice que no va al contexto): pertenece a la
 *   vista, no a la sesión. Pero lo pongo en la URL en vez de un useState porque
 *   si el estudiante entra a un emprendimiento y vuelve con "atrás", con useState
 *   perdería sus filtros. Con la URL se conservan y además se pueden compartir.
 *
 * Un bug real que encontré (muy buena anécdota para la entrevista): al leer el
 *   texto del input directamente de la URL, se perdían letras al escribir,
 *   porque el router actualiza la URL de forma asíncrona y el input se
 *   repintaba con el valor viejo. Solución: el texto vive en un useState local
 *   (respuesta inmediata) y la URL guarda solo una copia.
 *
 * Lo usan EmprendimientosPage y GruposPage: la lógica está escrita una sola vez.
 * ═════════════════════════════════════════════════════════════════════════
 */
export function useFiltrosUrl() {
  const [params, setParams] = useSearchParams()
  const [texto, setTextoLocal] = useState(() => params.get('q') ?? '')

  // `replace: true`: cada cambio de filtro reemplaza la entrada del historial
  // en vez de agregar una nueva. Así "atrás" sale de la lista, no deshace filtros.
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
