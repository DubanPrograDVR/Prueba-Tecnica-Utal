import { faInstagram, faWhatsapp } from '@fortawesome/free-brands-svg-icons'
import {
  faBookmark as faBookmarkVacio,
  faEnvelope,
  faHeart as faHeartVacio,
} from '@fortawesome/free-regular-svg-icons'
import {
  faArrowLeft,
  faBookmark,
  faHeart,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useMemo, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router'
import { Estrellas } from '../../components/Calificacion'
import { NoEncontrado } from '../../components/Estados'
import { Avatar, Mosaico } from '../../components/Mosaico'
import { canalesDeContacto, type TipoCanal } from '../../lib/contacto'
import { formatoFecha, formatoPromedio, plural } from '../../lib/formato'
import {
  contarLikes,
  resumenValoraciones,
  valoracionesDe,
} from '../../lib/selectores'
import { useDatosListos } from '../../state/DatosContext'
import { useSesion } from '../../state/SesionContext'
import { ContactoDialog } from './ContactoDialog'
import s from './EmprendimientoDetallePage.module.css'
import { ValoracionForm } from './ValoracionForm'

const ICONOS: Record<TipoCanal, typeof faEnvelope> = {
  whatsapp: faWhatsapp,
  instagram: faInstagram,
  correo: faEnvelope,
}

export function EmprendimientoDetallePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { emprendimientos, campus, estudianteActual } = useDatosListos()
  const {
    likesIds,
    favoritosIds,
    valoracionesNuevas,
    toggleLike,
    toggleFavorito,
  } = useSesion()
  const [contactoAbierto, setContactoAbierto] = useState(false) // estado efímero

  const emprendimiento = emprendimientos.find((e) => e.id === id)
  const valoraciones = useMemo(
    () =>
      emprendimiento ? valoracionesDe(emprendimiento, valoracionesNuevas) : [],
    [emprendimiento, valoracionesNuevas],
  )

  if (!emprendimiento) {
    return (
      <NoEncontrado mensaje="Este emprendimiento no existe o ya no está publicado." />
    )
  }

  const { nombre, clasificacion, descripcion, valores_referencia } =
    emprendimiento
  const liked = likesIds.includes(emprendimiento.id)
  const likes = contarLikes(
    emprendimiento,
    estudianteActual.likesEmprendimientosIds.includes(emprendimiento.id),
    liked,
  )
  const favorito = favoritosIds.includes(emprendimiento.id)
  const { promedio, total } = resumenValoraciones(valoraciones)
  const canales = canalesDeContacto(emprendimiento)
  const nombresCampus = emprendimiento.campus_ids
    .map((cid) => campus.find((c) => c.id === cid)?.nombre)
    .join(' · ')
  const propias = new Set(
    (valoracionesNuevas[emprendimiento.id] ?? []).map((v) => v.id),
  )

  // Volver conserva los filtros de la lista; si se llegó por un enlace directo, va al catálogo.
  const volver = () =>
    location.key === 'default' ? navigate('/emprendimientos') : navigate(-1)

  return (
    <div className={s.pagina}>
      <button type="button" className={s.volver} onClick={volver}>
        <FontAwesomeIcon icon={faArrowLeft} />
        Emprendimientos
      </button>

      <header className={s.cabecera}>
        <Mosaico nombre={nombre} categoria={clasificacion} grande />
        <div className={s.titulo}>
          <h1>{nombre}</h1>
          <p className={s.meta}>
            {clasificacion} · {nombresCampus}
          </p>
          <p className={s.descripcion}>{descripcion}</p>
        </div>
        <div className={s.acciones}>
          <button
            type="button"
            className={`btn ${s.toggle}`}
            aria-pressed={liked}
            onClick={() => toggleLike(emprendimiento.id)}
          >
            <FontAwesomeIcon
              key={String(liked)}
              icon={liked ? faHeart : faHeartVacio}
            />
            <span className="num">{likes}</span>
            <span className="sr-only"> me gusta</span>
          </button>
          <button
            type="button"
            className={`btn ${s.toggle}`}
            aria-pressed={favorito}
            onClick={() => toggleFavorito(emprendimiento.id)}
          >
            <FontAwesomeIcon
              key={String(favorito)}
              icon={favorito ? faBookmark : faBookmarkVacio}
            />
            {favorito ? 'Guardado' : 'Guardar'}
          </button>
        </div>
      </header>

      <div className={s.cuerpo}>
        <aside className={s.lateral}>
          <section className={s.panel} aria-labelledby="titulo-contacto">
            <h2 id="titulo-contacto">Contacto</h2>
            <ul role="list" className={s.canales}>
              {canales.map((canal) => (
                <li key={canal.tipo}>
                  <a
                    href={canal.url}
                    className={s.canal}
                    target={canal.tipo === 'correo' ? undefined : '_blank'}
                    rel="noopener noreferrer"
                  >
                    <FontAwesomeIcon
                      icon={ICONOS[canal.tipo]}
                      className={s.iconoCanal}
                    />
                    <span>
                      <strong>{canal.etiqueta}</strong>
                      <small>{canal.detalle}</small>
                    </span>
                  </a>
                </li>
              ))}
            </ul>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setContactoAbierto(true)}
            >
              Enviar mensaje
            </button>
          </section>

          <section className={s.panel} aria-labelledby="titulo-precios">
            <h2 id="titulo-precios">Precios de referencia</h2>
            <p className={s.precio}>{valores_referencia}</p>
          </section>
        </aside>

        <section
          className={`${s.panel} ${s.resenas}`}
          aria-labelledby="titulo-resenas"
        >
          <div className={s.resumen}>
            <h2 id="titulo-resenas">Recomendaciones</h2>
            {promedio === null ? (
              <p className={s.sinResenas}>
                Aún no tiene reseñas. Sé la primera persona en recomendarlo.
              </p>
            ) : (
              <p className={s.promedio}>
                <span className={`${s.cifra} num`}>
                  {formatoPromedio(promedio)}
                </span>
                <Estrellas valor={promedio} grande />
                <span className={`${s.total} num`}>
                  {plural(total, 'reseña', 'reseñas')}
                </span>
              </p>
            )}
          </div>

          <ValoracionForm emprendimientoId={emprendimiento.id} />

          {valoraciones.length > 0 && (
            <ul role="list" className={s.listaResenas}>
              {valoraciones.map((v) => (
                <li
                  key={v.id}
                  className={`${s.resena} ${propias.has(v.id) ? s.nueva : ''}`}
                >
                  <Avatar nombre={v.autor} />
                  <div>
                    <p className={s.autor}>
                      <strong>{v.autor}</strong>
                      {propias.has(v.id) && (
                        <span className="pill">Tu reseña</span>
                      )}
                      <time dateTime={v.fecha}>{formatoFecha(v.fecha)}</time>
                    </p>
                    <Estrellas valor={v.estrellas} />
                    <p className={s.comentario}>{v.comentario}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <ContactoDialog
        emprendimiento={emprendimiento}
        abierto={contactoAbierto}
        onCerrar={() => setContactoAbierto(false)}
      />
    </div>
  )
}
