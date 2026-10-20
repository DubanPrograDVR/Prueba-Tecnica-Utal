// Modelos del data.json. Conservan los nombres del archivo porque representan
// el contrato con el "servidor"; si la API cambia, se adapta en services/.

export interface Campus {
  id: string
  nombre: string
  ciudad: string
}

export interface EstudianteActual {
  id: string
  nombre: string
  carrera: string
  campus_id: string
  correo: string
  favoritosEmprendimientosIds: string[]
  likesEmprendimientosIds: string[]
  gruposInscritosIds: string[]
}

export interface Valoracion {
  id: string
  autor: string
  estrellas: number // 1 a 5
  comentario: string
  fecha: string // AAAA-MM-DD
}

export interface Emprendimiento {
  id: string
  nombre: string
  descripcion: string
  clasificacion: string
  valores_referencia: string
  campus_ids: string[]
  redes_y_contacto: {
    telefono: string | null
    correo: string | null
    instagram: string | null
  }
  likes: number
  // Redundantes con `valoraciones`: la UI no los usa, los deriva (ver lib/selectores.ts).
  promedio_valoracion: number
  total_valoraciones: number
  valoraciones: Valoracion[]
}

export interface GrupoIntermedio {
  id: string
  nombre: string
  tematica: string
  campus_id: string
  descripcion: string
  cantidad_miembros: number
  lugar_reunion: string | null
  contacto_directiva: {
    representante: string
    email: string
    telefono: string
    instagram: string
  }
  horario_reunion: string
  cupos_disponibles: number
  requisitos: string
}

export interface DatosIniciales {
  metadata: {
    universidad: string
    total_campus: number
    total_emprendimientos: number
    total_grupos_intermedios: number
  }
  estudianteActual: EstudianteActual
  campus: Campus[]
  emprendimientos: Emprendimiento[]
  grupos_intermedios: GrupoIntermedio[]
}
