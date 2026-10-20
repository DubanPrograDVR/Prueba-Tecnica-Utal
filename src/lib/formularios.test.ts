import { describe, expect, it } from 'vitest'
import type { Emprendimiento } from '../types'
import { canalesDeContacto } from './contacto'
import { formatoFecha } from './formato'
import {
  validarInscripcion,
  validarMensaje,
  validarValoracion,
} from './validaciones'

describe('validaciones', () => {
  it('exige estrellas y un comentario con contenido', () => {
    expect(validarValoracion(0, '')).toEqual({
      estrellas: 'Elige una puntuación de 1 a 5 estrellas.',
      comentario: 'Escribe un comentario.',
    })
    expect(validarValoracion(5, '   corto  ').comentario).toBe(
      'Escribe al menos 10 caracteres.',
    )
    expect(validarValoracion(4, 'Muy rico y a buen precio')).toEqual({})
  })

  it('valida el mensaje y la confirmación de requisitos', () => {
    expect(validarMensaje('')).toEqual({ mensaje: 'Escribe tu mensaje.' })
    expect(validarMensaje('¿Hacen envíos a Lircay?')).toEqual({})
    expect(validarInscripcion(false)).toHaveProperty('requisitos')
    expect(validarInscripcion(true)).toEqual({})
  })
})

describe('canalesDeContacto', () => {
  const base = {
    id: 'emp_003',
    nombre: 'Rincón del Apunte #3',
  } as Emprendimiento

  it('omite los canales nulos y arma enlaces válidos', () => {
    const canales = canalesDeContacto({
      ...base,
      redes_y_contacto: {
        telefono: '+56941227216',
        correo: null,
        instagram: '@rincóndelapunte_3',
      },
    })
    expect(canales.map((c) => c.tipo)).toEqual(['whatsapp', 'instagram'])
    expect(canales[0].url).toMatch(/^https:\/\/wa\.me\/56941227216\?text=/)
    expect(canales[1].url).toBe('https://instagram.com/rinc%C3%B3ndelapunte_3')
  })
})

describe('formatoFecha', () => {
  it('no se corre un día por la zona horaria', () => {
    expect(formatoFecha('2026-10-06')).toMatch(/^6 oct/)
  })
})
