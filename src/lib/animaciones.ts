// Animaciones que responden a una acción del usuario y nunca a la carga de la
// página: se disparan con la Web Animations API (element.animate) desde el
// manejador del evento. Solo transform y opacity. Con movimiento reducido no corren.

const movimientoReducido = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

// WAAPI no entiende var(): se leen las curvas de tokens.css para no duplicarlas.
const token = (nombre: string) =>
  getComputedStyle(document.documentElement).getPropertyValue(nombre).trim()

/**
 * "Latido": sube rápido (ease-out) y se asienta (ease-in-out). Confirma que el
 * toque se registró. `retraso` permite escalonar varios elementos.
 */
export function latido(
  el: Element | null | undefined,
  escala = 1.2,
  retraso = 0,
) {
  if (!el || movimientoReducido()) return
  el.animate(
    [
      { transform: 'scale(1)', easing: token('--ease-out') },
      {
        transform: `scale(${escala})`,
        offset: 0.4,
        easing: token('--ease-in-out'),
      },
      { transform: 'scale(1)' },
    ],
    { duration: 280, delay: retraso },
  )
}

/** Anillo que se expande y se desvanece alrededor del corazón al marcar "me gusta". */
export function destello(el: Element | null | undefined) {
  if (!el || movimientoReducido()) return
  el.animate(
    [
      { transform: 'scale(0.6)', opacity: 0.5 },
      { transform: 'scale(1.9)', opacity: 0 },
    ],
    { duration: 300, easing: token('--ease-out') },
  )
}

/** Una cifra que cambia entra desde abajo si sube y desde arriba si baja. */
export function cambioDeCifra(el: Element | null | undefined, sube: boolean) {
  if (!el || movimientoReducido()) return
  el.animate(
    [
      { transform: `translateY(${sube ? 45 : -45}%)`, opacity: 0 },
      { transform: 'none', opacity: 1 },
    ],
    { duration: 200, easing: token('--ease-out') },
  )
}
