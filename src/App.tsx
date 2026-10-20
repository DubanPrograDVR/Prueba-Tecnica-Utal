import type { ReactNode } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router'
import { Toaster } from 'sonner'
import {
  EstadoError,
  NoEncontrado,
  SkeletonLista,
} from './components/Estados/Estados'
import { Layout } from './components/Layout/Layout'
import { EmprendimientoDetallePage } from './features/emprendimientos/EmprendimientoDetallePage'
import { EmprendimientosPage } from './features/emprendimientos/EmprendimientosPage'
import { GruposPage } from './features/grupos/GruposPage'
import { DatosProvider, useDatos } from './state/DatosContext'
import { SesionProvider } from './state/SesionContext'

/*
 * ═══ PARA EXPLICAR ═══════════════════════════════════════════════════════
 * Qué es: la raíz de la app. Define las rutas y el ORDEN de los providers.
 *
 * El orden importa y es una decisión de arquitectura:
 *   BrowserRouter → DatosProvider → Layout → ConDatos → SesionProvider → rutas
 *   1. DatosProvider carga el JSON (con latencia simulada).
 *   2. ConDatos decide qué mostrar según el estado de la carga:
 *        cargando → skeleton   |   error → mensaje + "Reintentar"   |   listo → app
 *   3. SesionProvider se monta SOLO con datos listos, así su estado inicial
 *      (likes, favoritos, grupos de Camila) ya está disponible sin efectos.
 *
 * Rutas: /emprendimientos, /emprendimientos/:id y /grupos. Cualquier otra
 *   muestra una página 404 (también un id que no existe).
 *   Uso rutas (y no pestañas con useState) porque así funciona el botón
 *   "atrás" y se pueden compartir enlaces directos.
 * ═════════════════════════════════════════════════════════════════════════
 */
export function App() {
  return (
    <BrowserRouter>
      <DatosProvider>
        <Layout>
          <ConDatos>
            <Routes>
              <Route
                path="/"
                element={<Navigate to="/emprendimientos" replace />}
              />
              <Route
                path="/emprendimientos"
                element={<EmprendimientosPage />}
              />
              <Route
                path="/emprendimientos/:id"
                element={<EmprendimientoDetallePage />}
              />
              <Route path="/grupos" element={<GruposPage />} />
              <Route
                path="*"
                element={
                  <NoEncontrado mensaje="La dirección que abriste no existe." />
                }
              />
            </Routes>
          </ConDatos>
        </Layout>
      </DatosProvider>
      {/* Confirmaciones (Sonner): sobre la barra de navegación inferior del teléfono. */}
      <Toaster
        position="bottom-center"
        offset={24}
        mobileOffset={{ bottom: 88 }}
      />
    </BrowserRouter>
  )
}

/** Muestra la carga o el error; la sesión solo existe cuando ya hay datos. */
function ConDatos({ children }: { children: ReactNode }) {
  const carga = useDatos()

  if (carga.estado === 'cargando') return <SkeletonLista />
  if (carga.estado === 'error') {
    return (
      <EstadoError mensaje={carga.mensaje} onReintentar={carga.reintentar} />
    )
  }

  return (
    <SesionProvider estudiante={carga.datos.estudianteActual}>
      {children}
    </SesionProvider>
  )
}
