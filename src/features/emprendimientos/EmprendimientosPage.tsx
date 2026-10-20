import { useDeferredValue, useMemo, type CSSProperties } from 'react'
import { BarraFiltros } from '../../components/BarraFiltros/BarraFiltros'
import { Chips } from '../../components/Chips/Chips'
import { EstadoVacio } from '../../components/Estados/Estados'
import lista from '../../components/PaginaLista/PaginaLista.module.css'
import { Tabs } from '../../components/Tabs/Tabs'
import { useFiltrosUrl } from '../../hooks/useFiltrosUrl'
import { plural } from '../../lib/formato'
import {
  contarLikes,
  contarPor,
  filtrarEmprendimientos,
  resumenValoraciones,
  valoracionesDe,
  valoresUnicos,
} from '../../lib/selectores'
import { useDatosListos } from '../../state/DatosContext'
import { useSesion } from '../../state/SesionContext'
import { EmprendimientoFila } from './EmprendimientoFila'

type Vista = 'todos' | 'favoritos'

// mosaico · emprendimiento · categoría y campus · valoración · me gusta · guardar
const COLUMNAS = '48px minmax(0, 2.4fr) minmax(0, 1.5fr) 150px 92px 44px'

/*
 * ═══ PARA EXPLICAR (ESTADO GLOBAL vs EFÍMERO, la tabla de la rúbrica) ════
 * Esta página es el mejor lugar para mostrar la separación de estados:
 *
 *   GLOBAL (contexto)  → useDatosListos(): emprendimientos y campus.
 *                        useSesion(): favoritos, likes y reseñas nuevas.
 *   EFÍMERO (de la vista) → useFiltrosUrl(): búsqueda, categoría, campus,
 *                        pestaña. Viven en la URL, NO en el contexto.
 *   DERIVADO (no se guarda) → la lista filtrada, los conteos de los chips,
 *                        los likes y el promedio de cada fila. Se calculan
 *                        con useMemo y los selectores.
 *
 * Optimización: useDeferredValue sobre el texto de búsqueda mantiene el input
 * fluido mientras se recalcula la lista; y los useMemo evitan refiltrar 164
 * elementos en renders que no cambian nada.
 * ═════════════════════════════════════════════════════════════════════════
 */
export function EmprendimientosPage() {
  const { emprendimientos, campus, estudianteActual } = useDatosListos()
  const {
    favoritosIds,
    likesIds,
    valoracionesNuevas,
    toggleLike,
    toggleFavorito,
  } = useSesion()

  // Estado efímero de la vista (en la URL, no en el contexto).
  const filtros = useFiltrosUrl()
  const clasificacion = filtros.valor('categoria')
  const campusId = filtros.valor('campus')
  const vista: Vista =
    filtros.valor('vista') === 'favoritos' ? 'favoritos' : 'todos'

  // La lista se recalcula con el texto "diferido": el input nunca se traba al escribir.
  // Primero todos los filtros menos la categoría: de ahí salen los conteos de
  // los chips (siguen a la vista) y luego se aplica la categoría elegida.
  const textoDiferido = useDeferredValue(filtros.texto)
  const sinCategoria = useMemo(
    () =>
      filtrarEmprendimientos(
        emprendimientos,
        {
          texto: textoDiferido,
          clasificacion: '',
          campus: campusId,
          soloFavoritos: vista === 'favoritos',
        },
        favoritosIds,
      ),
    [emprendimientos, textoDiferido, campusId, vista, favoritosIds],
  )
  const resultado = useMemo(
    () =>
      clasificacion
        ? sinCategoria.filter((e) => e.clasificacion === clasificacion)
        : sinCategoria,
    [sinCategoria, clasificacion],
  )
  const conteoCategorias = useMemo(
    () => contarPor(sinCategoria.map((e) => e.clasificacion)),
    [sinCategoria],
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

  const hayFiltros = Boolean(filtros.texto || clasificacion || campusId)

  return (
    <div
      className={lista.pagina}
      style={{ '--columnas': COLUMNAS } as CSSProperties}
    >
      <header className={lista.titulo}>
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
        onCambio={(v) =>
          filtros.actualizar('vista', v === 'favoritos' ? v : '')
        }
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
        texto={filtros.texto}
        onTexto={filtros.buscar}
        ayudaBusqueda="Buscar emprendimientos"
        resultados={plural(resultado.length, 'resultado', 'resultados')}
        filtros={[
          {
            id: 'campus',
            etiqueta: 'Campus',
            todas: 'Todos los campus',
            valor: campusId,
            opciones: campus.map((c) => ({
              valor: c.id,
              etiqueta:
                c.id === estudianteActual.campus_id
                  ? `${c.nombre} · tu campus`
                  : c.nombre,
            })),
            onCambio: (v) => filtros.actualizar('campus', v),
          },
        ]}
      />

      <Chips
        etiqueta="Categoría"
        todas="Todas"
        total={sinCategoria.length}
        valor={clasificacion}
        onCambio={(v) => filtros.actualizar('categoria', v)}
        opciones={categorias.map((c) => ({
          valor: c,
          cuenta: conteoCategorias.get(c) ?? 0,
        }))}
      />

      <section
        id="lista-emprendimientos"
        role="tabpanel"
        aria-label="Emprendimientos"
        className={lista.panel}
      >
        {resultado.length > 0 ? (
          <>
            <div className={lista.cabecera} aria-hidden="true">
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
          <div className={lista.vacio}>
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
                    onClick={() => filtros.limpiar(['vista'])}
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
