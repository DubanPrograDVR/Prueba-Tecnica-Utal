import type { ReactNode } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router'
import { EstadoError, SkeletonLista } from './components/Estados'
import { Layout } from './components/Layout'
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
              <Route path="*" element={<p>Página no encontrada</p>} />
            </Routes>
          </ConDatos>
        </Layout>
      </DatosProvider>
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
