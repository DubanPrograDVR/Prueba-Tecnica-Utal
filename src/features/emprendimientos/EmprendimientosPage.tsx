import { useDeferredValue, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router'
import { BarraFiltros } from '../../components/BarraFiltros'
import { EstadoVacio } from '../../components/Estados'
import { Tabs } from '../../components/Tabs'
import { plural } from '../../lib/formato'
import {
  contarLikes,
  filtrarEmprendimientos,
  resumenValoraciones,
  valoracionesDe,
  valoresUnicos,
} from '../../lib/selectores'
import { useDatosListos } from '../../state/DatosContext'
import { useSesion } from '../../state/SesionContext'
import { EmprendimientoFila } from './EmprendimientoFila'
import s from './EmprendimientosPage.module.css'

type Vista = 'todos' | 'favoritos'

export function EmprendimientosPage() {
  const { emprendimientos, campus, estudianteActual } = useDatosListos()
  const {
    favoritosIds,
    likesIds,
    valoracionesNuevas,
    toggleLike,
    toggleFavorito,
  } = useSesion()

  // Estado efímero de la vista, guardado en la URL: sobrevive a ir al detalle y volver.
  const [params, setParams] = useSearchParams()
  // El texto vive en useState porque el router actualiza la URL de forma
  // asíncrona: un input leído directo de la URL perdería letras al escribir.
  // La URL guarda una copia para restaurarlo al volver.
  const [texto, setTexto] = useState(() => params.get('q') ?? '')
  const clasificacion = params.get('categoria') ?? ''
  const campusId = params.get('campus') ?? ''
  const vista: Vista =
    params.get('vista') === 'favoritos' ? 'favoritos' : 'todos'

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

  // La lista se recalcula con el texto "diferido": el input nunca se traba al escribir.
  const textoDiferido = useDeferredValue(texto)
  const resultado = useMemo(
    () =>
      filtrarEmprendimientos(
        emprendimientos,
        {
          texto: textoDiferido,
          clasificacion,
          campus: campusId,
          soloFavoritos: vista === 'favoritos',
        },
        favoritosIds,
      ),
    [
      emprendimientos,
      textoDiferido,
      clasificacion,
      campusId,
      vista,
      favoritosIds,
    ],
  )

  const categorias = useMemo(
    () => valoresUnicos(emprendimientos.map((e) => e.clasificacion)),
    [emprendimientos],
  )
  const nombresCampus = useMemo(
    () => new Map(campus.map((c) => [c.id, c.nombre.replace('Campus ', '')])),
    [campus],
  )
  const miCampus = campus.find((c) => c.id === estudianteActual.campus_id)
  const enMiCampus = useMemo(
    () =>
      emprendimientos.filter((e) =>
        e.campus_ids.includes(estudianteActual.campus_id),
      ).length,
    [emprendimientos, estudianteActual.campus_id],
  )

  const hayFiltros = Boolean(texto || clasificacion || campusId)

  return (
    <div className={s.pagina}>
      <header className={s.titulo}>
        <h1>Emprendimientos</h1>
        <p>
          {plural(
            emprendimientos.length,
            'iniciativa de estudiantes',
            'iniciativas de estudiantes',
          )}{' '}
          · {enMiCampus} en {miCampus?.nombre}, tu campus
        </p>
      </header>

      <Tabs<Vista>
        etiqueta="Vista del catálogo"
        controla="lista-emprendimientos"
        valor={vista}
        onCambio={(v) => actualizar('vista', v === 'favoritos' ? v : '')}
        opciones={[
          { valor: 'todos', etiqueta: 'Todos', cuenta: emprendimientos.length },
          {
            valor: 'favoritos',
            etiqueta: 'Mis favoritos',
            cuenta: favoritosIds.length,
          },
        ]}
      />

      <BarraFiltros
        texto={texto}
        onTexto={(v) => {
          setTexto(v)
          actualizar('q', v)
        }}
        ayudaBusqueda="Buscar emprendimientos"
        resultados={plural(resultado.length, 'resultado', 'resultados')}
        filtros={[
          {
            id: 'categoria',
            etiqueta: 'Categoría',
            todas: 'Categorías',
            valor: clasificacion,
            opciones: categorias.map((c) => ({ valor: c, etiqueta: c })),
            onCambio: (v) => actualizar('categoria', v),
          },
          {
            id: 'campus',
            etiqueta: 'Campus',
            todas: 'Campus',
            valor: campusId,
            opciones: campus.map((c) => ({ valor: c.id, etiqueta: c.nombre })),
            onCambio: (v) => actualizar('campus', v),
          },
        ]}
      />

      <section
        id="lista-emprendimientos"
        role="tabpanel"
        aria-label="Emprendimientos"
        className={s.panel}
      >
        {resultado.length > 0 ? (
          <>
            <div className={s.cabecera} aria-hidden="true">
              <span />
              <span>Emprendimiento</span>
              <span>Categoría y campus</span>
              <span>Valoración</span>
              <span>Me gusta</span>
              <span />
            </div>
            <ul role="list">
              {resultado.map((e) => {
                const liked = likesIds.includes(e.id)
                const likeInicial =
                  estudianteActual.likesEmprendimientosIds.includes(e.id)
                const { promedio, total } = resumenValoraciones(
                  valoracionesDe(e, valoracionesNuevas),
                )
                return (
                  <EmprendimientoFila
                    key={e.id}
                    emprendimiento={e}
                    campus={e.campus_ids
                      .map((id) => nombresCampus.get(id))
                      .join(' · ')}
                    likes={contarLikes(e, likeInicial, liked)}
                    liked={liked}
                    favorito={favoritosIds.includes(e.id)}
                    promedio={promedio}
                    totalResenas={total}
                    onLike={toggleLike}
                    onFavorito={toggleFavorito}
                  />
                )
              })}
            </ul>
          </>
        ) : (
          <div className={s.vacio}>
            {vista === 'favoritos' && !hayFiltros ? (
              <EstadoVacio>
                Aún no guardas emprendimientos. Toca el marcador de cualquier
                emprendimiento para tenerlo a mano aquí.
              </EstadoVacio>
            ) : (
              <EstadoVacio
                accion={
                  <button
                    type="button"
                    className="btn"
                    onClick={() => {
                      setTexto('')
                      setParams(vista === 'favoritos' ? { vista } : {}, {
                        replace: true,
                      })
                    }}
                  >
                    Limpiar filtros
                  </button>
                }
              >
                Ningún emprendimiento coincide con estos filtros.
              </EstadoVacio>
            )}
          </div>
        )}
      </section>
    </div>
  )
}
