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
