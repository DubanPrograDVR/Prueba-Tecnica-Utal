import { describe, expect, it } from 'vitest'
import type { Emprendimiento, GrupoIntermedio, Valoracion } from '../types'
import {
  contarLikes,
  estadoGrupo,
  filtrarEmprendimientos,
  filtrarGrupos,
  normalizar,
  resumenValoraciones,
  valoracionesDe,
  valoresUnicos,
} from './selectores'

const valoracion = (estrellas: number, fecha = '2026-10-06'): Valoracion => ({
  id: `val_${estrellas}_${fecha}`,
  autor: 'Sebastián Mora',
  estrellas,
  comentario: 'Comentario',
  fecha,
})

const emprendimiento = (parcial: Partial<Emprendimiento>): Emprendimiento => ({
  id: 'emp_001',
  nombre: 'Kombucha Estudiantil #1',
  descripcion:
    'Bebidas fermentadas naturales de distintos sabores y snacks saludables.',
  clasificacion: 'Alimentación y Repostería',
  valores_referencia: 'Desde $500 hasta $5.000 CLP',
  campus_ids: ['camp_2'],
  redes_y_contacto: { telefono: null, correo: null, instagram: '@kombucha' },
  likes: 12,
  promedio_valoracion: 3,
  total_valoraciones: 1,
  valoraciones: [valoracion(3)],
  ...parcial,
})

const grupo = (parcial: Partial<GrupoIntermedio>): GrupoIntermedio => ({
  id: 'grp_01',
  nombre: 'Agrupación Música y Bandas U #1',
  tematica: 'Música y Bandas U',
  campus_id: 'camp_3',
  descripcion: 'Espacio de ensayo colaborativo y tocatas universitarias.',
  cantidad_miembros: 92,
  lugar_reunion: 'Auditorio B-12',
  contacto_directiva: {
    representante: 'Tomás Silva',
    email: 'grupo.1@fe.universidad.cl',
    telefono: '+56916927215',
    instagram: '@grupo_musica_1',
  },
  horario_reunion: 'Miércoles de 18:00 a 20:00 hrs',
  cupos_disponibles: 8,
  requisitos: 'Interés musical.',
  ...parcial,
})

describe('normalizar y valoresUnicos', () => {
  it('ignora mayúsculas y tildes', () => {
    expect(normalizar('Música y Tecnología')).toBe('musica y tecnologia')
  })

  it('entrega opciones únicas y ordenadas', () => {
    expect(valoresUnicos(['Tejidos', 'Alimentación', 'Tejidos'])).toEqual([
      'Alimentación',
      'Tejidos',
    ])
  })
})

describe('filtrarEmprendimientos', () => {
  const lista = [
    emprendimiento({ id: 'emp_001' }),
    emprendimiento({
      id: 'emp_006',
      nombre: 'Crochet & Mate #6',
      descripcion: 'Amigurumis personalizados.',
      clasificacion: 'Artesanía y Tejidos',
      campus_ids: ['camp_2', 'camp_7'],
    }),
  ]
  const sinFiltros = {
    texto: '',
    clasificacion: '',
    campus: '',
    soloFavoritos: false,
  }
  const ids = (r: Emprendimiento[]) => r.map((e) => e.id)

  it('sin filtros devuelve todo', () => {
    expect(ids(filtrarEmprendimientos(lista, sinFiltros, []))).toEqual([
      'emp_001',
      'emp_006',
    ])
  })

  it('busca en nombre y descripción sin importar tildes', () => {
    expect(
      ids(
        filtrarEmprendimientos(lista, { ...sinFiltros, texto: 'BEBIDAS' }, []),
      ),
    ).toEqual(['emp_001'])
    expect(
      ids(
        filtrarEmprendimientos(
          lista,
          { ...sinFiltros, texto: 'artesania' },
          [],
        ),
      ),
    ).toEqual([])
    expect(
      ids(
        filtrarEmprendimientos(
          lista,
          { ...sinFiltros, texto: 'amigurumis' },
          [],
        ),
      ),
    ).toEqual(['emp_006'])
  })

  it('el campus coincide con cualquiera de los campus del emprendimiento', () => {
    expect(
      ids(
        filtrarEmprendimientos(lista, { ...sinFiltros, campus: 'camp_7' }, []),
      ),
    ).toEqual(['emp_006'])
  })

  it('combina filtros con Y, incluido "Mis favoritos"', () => {
    const filtros = { ...sinFiltros, campus: 'camp_2', soloFavoritos: true }
    expect(ids(filtrarEmprendimientos(lista, filtros, ['emp_006']))).toEqual([
      'emp_006',
    ])
  })
})

describe('contarLikes', () => {
  const e = emprendimiento({ likes: 12 })

  it('quitar un like inicial resta uno', () => {
    expect(contarLikes(e, true, false)).toBe(11)
  })

  it('dar un like nuevo suma uno', () => {
    expect(contarLikes(e, false, true)).toBe(13)
  })

  it('sin cambios mantiene el valor del JSON', () => {
    expect(contarLikes(e, true, true)).toBe(12)
    expect(contarLikes(e, false, false)).toBe(12)
  })
})

describe('valoraciones', () => {
  it('sin reseñas el promedio es null (no 0)', () => {
    expect(resumenValoraciones([])).toEqual({ total: 0, promedio: null })
  })

  it('recalcula promedio y total al sumar una reseña de la sesión', () => {
    const e = emprendimiento({ valoraciones: [valoracion(3, '2026-10-06')] })
    const todas = valoracionesDe(e, { emp_001: [valoracion(5, '2026-10-20')] })
    expect(todas.map((v) => v.fecha)).toEqual(['2026-10-20', '2026-10-06'])
    expect(resumenValoraciones(todas)).toEqual({ total: 2, promedio: 4 })
  })
})

describe('grupos', () => {
  it('ser miembro tiene prioridad sobre "sin cupos" (caso grp_09)', () => {
    const g = grupo({ id: 'grp_09', cupos_disponibles: 0 })
    expect(estadoGrupo(g, true, true)).toEqual({
      esMiembro: true,
      cupos: 0,
      miembros: 92,
      puedeInscribirse: false,
    })
  })

  it('una inscripción de la sesión descuenta un cupo y suma un miembro', () => {
    expect(estadoGrupo(grupo({}), false, true)).toEqual({
      esMiembro: true,
      cupos: 7,
      miembros: 93,
      puedeInscribirse: false,
    })
  })

  it('no permite inscribirse sin cupos', () => {
    expect(
      estadoGrupo(grupo({ cupos_disponibles: 0 }), false, false)
        .puedeInscribirse,
    ).toBe(false)
    expect(estadoGrupo(grupo({}), false, false).puedeInscribirse).toBe(true)
  })

  it('filtra por temática, campus y "Mis grupos"', () => {
    const lista = [
      grupo({}),
      grupo({
        id: 'grp_09',
        nombre: 'Agrupación Danza y K-Pop #9',
        descripcion: 'Práctica de coreografías urbanas.',
        tematica: 'Danza y K-Pop',
        campus_id: 'camp_7',
      }),
    ]
    const base = { texto: '', tematica: '', campus: '', soloMios: false }
    expect(
      filtrarGrupos(lista, { ...base, tematica: 'Danza y K-Pop' }, []).map(
        (g) => g.id,
      ),
    ).toEqual(['grp_09'])
    expect(
      filtrarGrupos(lista, { ...base, campus: 'camp_3' }, []).map((g) => g.id),
    ).toEqual(['grp_01'])
    expect(
      filtrarGrupos(lista, { ...base, soloMios: true }, ['grp_09']).map(
        (g) => g.id,
      ),
    ).toEqual(['grp_09'])
    expect(
      filtrarGrupos(lista, { ...base, texto: 'musica' }, []).map((g) => g.id),
    ).toEqual(['grp_01'])
  })
})
