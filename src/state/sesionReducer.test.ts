import { describe, expect, it } from 'vitest'
import type { EstudianteActual, Valoracion } from '../types'
import { estadoInicial, sesionReducer } from './sesionReducer'

const estudiante: EstudianteActual = {
  id: 'est_2026_01',
  nombre: 'Camila Rojas',
  carrera: 'Ingeniería Civil en Informática',
  campus_id: 'camp_7',
  correo: 'crojas21@alumnos.utalca.cl',
  favoritosEmprendimientosIds: ['emp_001', 'emp_005'],
  likesEmprendimientosIds: ['emp_001'],
  gruposInscritosIds: ['grp_09'],
}

const valoracion = (id: string): Valoracion => ({
  id,
  autor: 'Camila Rojas',
  estrellas: 5,
  comentario: 'Muy bueno',
  fecha: '2026-10-20',
})

describe('sesionReducer', () => {
  it('parte desde los favoritos, likes y grupos del estudiante', () => {
    const estado = estadoInicial(estudiante)
    expect(estado.favoritosIds).toEqual(['emp_001', 'emp_005'])
    expect(estado.likesIds).toEqual(['emp_001'])
    expect(estado.gruposInscritosIds).toEqual(['grp_09'])
    expect(estado.valoracionesNuevas).toEqual({})
  })

  it('alterna un like: dos toques vuelven al estado original', () => {
    const inicial = estadoInicial(estudiante)
    const conLike = sesionReducer(inicial, {
      type: 'TOGGLE_LIKE',
      id: 'emp_006',
    })
    expect(conLike.likesIds).toEqual(['emp_001', 'emp_006'])
    const sinLike = sesionReducer(conLike, {
      type: 'TOGGLE_LIKE',
      id: 'emp_006',
    })
    expect(sinLike.likesIds).toEqual(['emp_001'])
  })

  it('quita un favorito que venía del JSON sin mutar el estado anterior', () => {
    const inicial = estadoInicial(estudiante)
    const siguiente = sesionReducer(inicial, {
      type: 'TOGGLE_FAVORITO',
      id: 'emp_001',
    })
    expect(siguiente.favoritosIds).toEqual(['emp_005'])
    expect(inicial.favoritosIds).toEqual(['emp_001', 'emp_005'])
  })

  it('agrega la reseña nueva al principio de las del emprendimiento', () => {
    let estado = estadoInicial(estudiante)
    estado = sesionReducer(estado, {
      type: 'AGREGAR_VALORACION',
      emprendimientoId: 'emp_001',
      valoracion: valoracion('a'),
    })
    estado = sesionReducer(estado, {
      type: 'AGREGAR_VALORACION',
      emprendimientoId: 'emp_001',
      valoracion: valoracion('b'),
    })
    expect(estado.valoracionesNuevas.emp_001.map((v) => v.id)).toEqual([
      'b',
      'a',
    ])
  })

  it('no duplica una inscripción y devuelve la misma referencia', () => {
    const inicial = estadoInicial(estudiante)
    expect(
      sesionReducer(inicial, { type: 'INSCRIBIR', grupoId: 'grp_09' }),
    ).toBe(inicial)
    const inscrito = sesionReducer(inicial, {
      type: 'INSCRIBIR',
      grupoId: 'grp_01',
    })
    expect(inscrito.gruposInscritosIds).toEqual(['grp_09', 'grp_01'])
  })
})
