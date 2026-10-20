import { useLayoutEffect, useRef, type ReactNode } from 'react'
import { cambioDeCifra } from '../../lib/animaciones'
import s from './Contador.module.css'

/**
 * Cifra que se desliza cuando cambia (12 → 13 sube, 13 → 12 baja).
 * Compara con el valor anterior, así que el primer render nunca anima.
 */
export function Contador({
  valor,
  children,
}: {
  valor: number
  children?: ReactNode
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const anterior = useRef(valor)

  // useLayoutEffect: la animación arranca antes de que se pinte la cifra nueva.
  useLayoutEffect(() => {
    if (anterior.current !== valor)
      cambioDeCifra(ref.current, valor > anterior.current)
    anterior.current = valor
  }, [valor])

  return (
    <span ref={ref} className={`${s.contador} num`}>
      {children ?? valor}
    </span>
  )
}
