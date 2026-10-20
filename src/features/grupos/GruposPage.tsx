import {
  useCallback,
  useDeferredValue,
  useMemo,
  useState,
  type CSSProperties,
} from 'react'
import { BarraFiltros } from '../../components/BarraFiltros/BarraFiltros'
import { Chips } from '../../components/Chips/Chips'
import { EstadoVacio } from '../../components/Estados/Estados'
import lista from '../../components/PaginaLista/PaginaLista.module.css'
import { Tabs } from '../../components/Tabs/Tabs'
import { useFiltrosUrl } from '../../hooks/useFiltrosUrl'
import { plural } from '../../lib/formato'
import {
  contarPor,
  estadoGrupo,
  filtrarGrupos,
  valoresUnicos,
} from '../../lib/selectores'
import { useDatosListos } from '../../state/DatosContext'
import { useSesion } from '../../state/SesionContext'
import type { GrupoIntermedio } from '../../types'
import { GrupoFila, type TipoDialogo } from './GrupoFila'
import { InscripcionDialog } from './InscripcionDialog'
import { SolicitudInfoDialog } from './SolicitudInfoDialog'

type Vista = 'todos' | 'mios'

// mosaico · grupo · reunión · cupos · acciones
const COLUMNAS = '48px minmax(0, 2.6fr) minmax(0, 1.2fr) 150px 150px'

export function GruposPage() {
  const {
    grupos_intermedios: grupos,
    campus,
    estudianteActual,
  } = useDatosListos()
  const { gruposInscritosIds } = useSesion()

  const filtros = useFiltrosUrl()
  const tematica = filtros.valor('tematica')
  const campusId = filtros.valor('campus')
  const vista: Vista = filtros.valor('vista') === 'mios' ? 'mios' : 'todos'

  // Todos los filtros menos la temática: de ahí salen los conteos de los chips.
  const textoDiferido = useDeferredValue(filtros.texto)
  const sinTematica = useMemo(
    () =>
      filtrarGrupos(
        grupos,
        {
          texto: textoDiferido,
          tematica: '',
          campus: campusId,
          soloMios: vista === 'mios',
        },
        gruposInscritosIds,
      ),
    [grupos, textoDiferido, campusId, vista, gruposInscritosIds],
  )
  const resultado = useMemo(
    () =>
      tematica
        ? sinTematica.filter((g) => g.tematica === tematica)
        : sinTematica,
    [sinTematica, tematica],
  )
  const conteoTematicas = useMemo(
    () => contarPor(sinTematica.map((g) => g.tematica)),
    [sinTematica],
  )

  const tematicas = useMemo(
    () => valoresUnicos(grupos.map((g) => g.tematica)),
    [grupos],
  )
  const nombresCampus = useMemo(
    () => new Map(campus.map((c) => [c.id, c.nombre])),
    [campus],
  )
  const estadoDe = (g: GrupoIntermedio) =>
    estadoGrupo(
      g,
      estudianteActual.gruposInscritosIds.includes(g.id),
      gruposInscritosIds.includes(g.id),
    )
  const conCupos = grupos.filter((g) => estadoDe(g).cupos > 0).length

  // Un diálogo por tipo para toda la lista (no 54). Qué grupo y si está
  // abierto son estado efímero de esta página.
  const [seleccion, setSeleccion] = useState<{
    tipo: TipoDialogo
    grupo: GrupoIntermedio
  } | null>(null)
  const [abierto, setAbierto] = useState(false)
  // Estable: las filas memoizadas no se re-renderizan por recibirla.
  const abrir = useCallback((tipo: TipoDialogo, grupo: GrupoIntermedio) => {
    setSeleccion({ tipo, grupo })
    setAbierto(true)
  }, [])
  const cerrar = useCallback(() => setAbierto(false), [])

  const hayFiltros = Boolean(filtros.texto || tematica || campusId)

  return (
    <div
      className={lista.pagina}
      style={{ '--columnas': COLUMNAS } as CSSProperties}
    >
      <header className={lista.titulo}>
        <h1>Grupos intermedios</h1>
        <p>
          {plural(grupos.length, 'agrupación', 'agrupaciones')} · {conCupos} con
          cupos · participas en {gruposInscritosIds.length}
        </p>
      </header>

      <Tabs<Vista>
        etiqueta="Vista del directorio"
        controla="lista-grupos"
        valor={vista}
        onCambio={(v) => filtros.actualizar('vista', v === 'mios' ? v : '')}
        opciones={[
          { valor: 'todos', etiqueta: 'Todos', cuenta: grupos.length },
          {
            valor: 'mios',
            etiqueta: 'Mis grupos',
            cuenta: gruposInscritosIds.length,
          },
        ]}
      />

      <BarraFiltros
        texto={filtros.texto}
        onTexto={filtros.buscar}
        ayudaBusqueda="Buscar grupos"
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
        etiqueta="Área temática"
        todas="Todas"
        total={sinTematica.length}
        valor={tematica}
        onCambio={(v) => filtros.actualizar('tematica', v)}
        opciones={tematicas.map((t) => ({
          valor: t,
          cuenta: conteoTematicas.get(t) ?? 0,
        }))}
      />

      <section
        id="lista-grupos"
        role="tabpanel"
        aria-label="Grupos"
        className={lista.panel}
      >
        {resultado.length > 0 ? (
          <>
            <div className={lista.cabecera} aria-hidden="true">
              <span />
              <span>Grupo</span>
              <span>Reunión</span>
              <span>Cupos</span>
              <span />
            </div>
            <ul role="list">
              {resultado.map((g) => {
                const { esMiembro, cupos, miembros, puedeInscribirse } =
                  estadoDe(g)
                return (
                  <GrupoFila
                    key={g.id}
                    grupo={g}
                    campus={nombresCampus.get(g.campus_id) ?? ''}
                    esMiembro={esMiembro}
                    cupos={cupos}
                    miembros={miembros}
                    puedeInscribirse={puedeInscribirse}
                    onAbrir={abrir}
                  />
                )
              })}
            </ul>
          </>
        ) : (
          <div className={lista.vacio}>
            {vista === 'mios' && !hayFiltros ? (
              <EstadoVacio>
                Todavía no participas en ningún grupo. Inscríbete desde la
                pestaña Todos.
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
                Ningún grupo coincide con estos filtros.
              </EstadoVacio>
            )}
          </div>
        )}
      </section>

      {/* key: cada grupo tiene su propio borrador; reabrir el mismo grupo lo conserva. */}
      {seleccion?.tipo === 'info' && (
        <SolicitudInfoDialog
          key={seleccion.grupo.id}
          grupo={seleccion.grupo}
          abierto={abierto}
          onCerrar={cerrar}
        />
      )}
      {seleccion?.tipo === 'inscripcion' && (
        <InscripcionDialog
          key={seleccion.grupo.id}
          grupo={seleccion.grupo}
          abierto={abierto}
          onCerrar={cerrar}
        />
      )}
    </div>
  )
}
