// Validación básica de los formularios: funciones puras que devuelven un
// mensaje por campo inválido. Un objeto vacío significa "todo bien".

export type Errores = Record<string, string>

const MINIMO_CARACTERES = 10

function textoObligatorio(texto: string, que: string): string | undefined {
  const limpio = texto.trim()
  if (!limpio) return `Escribe ${que}.`
  if (limpio.length < MINIMO_CARACTERES)
    return `Escribe al menos ${MINIMO_CARACTERES} caracteres.`
}

export function validarValoracion(
  estrellas: number,
  comentario: string,
): Errores {
  const errores: Errores = {}
  if (!(estrellas >= 1 && estrellas <= 5))
    errores.estrellas = 'Elige una puntuación de 1 a 5 estrellas.'
  const error = textoObligatorio(comentario, 'un comentario')
  if (error) errores.comentario = error
  return errores
}

export function validarMensaje(mensaje: string): Errores {
  const error = textoObligatorio(mensaje, 'tu mensaje')
  return error ? { mensaje: error } : {}
}

export function validarInscripcion(aceptaRequisitos: boolean): Errores {
  return aceptaRequisitos
    ? {}
    : { requisitos: 'Confirma que cumples los requisitos.' }
}

/** Lleva el foco al primer campo con error (para teclado y lectores de pantalla). */
export function enfocarPrimerError(
  formulario: HTMLFormElement,
  errores: Errores,
) {
  const [campo] = Object.keys(errores)
  if (campo) formulario.querySelector<HTMLElement>(`[name="${campo}"]`)?.focus()
}
