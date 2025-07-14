import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../estilos/Detalle.css';
import ModalResena from './ModalResena';

const URL_BACKEND = import.meta.env.VITE_BACKEND_URL;

interface ImagenJuego {
  id: number;
  juegoId: number;
  url: string;
  descripcion?: string;
}

interface Juego {
  id: number;
  nombre: string;
  descripcion: string;
  videoUrl: string;
  precio: number | string;  // Para aceptar tanto número como string (si es recibido como texto)
  categoria: string;
  imagenes: ImagenJuego[];
}
interface Reseña {
  id: number;
  juegoId: number;
  nombre: string;
  comentario: string;
  estrellas: number;
  fecha: string;
}

const Detalle: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [juego, setJuego] = useState<Juego | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reseñas, setReseñas] = useState<Reseña[]>([]);
  const [modalAbierto, setModalAbierto] = useState(false);

  // Función para convertir enlaces de YouTube a formato embed
  const getEmbedUrl = (url: string): string => {
    try {
      const parsed = new URL(url);
      if (parsed.hostname === 'youtu.be') {
        return `https://www.youtube.com/embed/${parsed.pathname.slice(1)}`;
      }
      if (parsed.hostname.includes('youtube.com')) {
        const v = parsed.searchParams.get('v');
        return v ? `https://www.youtube.com/embed/${v}` : url;
      }
      return url;
    } catch {
      return '';
    }
  };


  // Cargar el juego desde el backend usando el ID
  useEffect(() => {
    const fetchTodo = async () => {
      try {
        const [juegoRes, resenasRes] = await Promise.all([
          axios.get(`${URL_BACKEND}api/juegos/${id}`),
          axios.get(`${URL_BACKEND}api/juegos/${id}/resenas`)
        ]);
        setJuego(juegoRes.data);
        setReseñas(resenasRes.data);
      } catch (err) {
        setError('❌ Error al cargar datos del juego.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTodo();
  }, [id]);


  // Mostrar "Cargando..." mientras los datos se cargan
  if (loading) return <p className="cargando">⏳ Cargando juego...</p>;

  // Mostrar el mensaje de error si hay un problema al cargar el juego
  if (error) return <p className="error">{error}</p>;

  // Si no se encuentra el juego, mostrar mensaje
  if (!juego) return <p className="error">❗ Juego no encontrado</p>;

  return (
    <div className="detalle-page">
      <button className="volver-btn" onClick={() => navigate(-1)}>⬅ Volver</button>

      <header className="detalle-header">
        <h2>{juego.nombre}</h2>
        <p className="categoria"><strong>Categoría:</strong> {juego.categoria}</p>
        <p><strong>Precio:</strong> ${(Number(juego.precio) || 0).toFixed(2)}</p>
      </header>

      <section className="detalle-descripcion">
        <h3>Descripción</h3>
        <p>{juego.descripcion}</p>
      </section>

      {/* Botón para añadir reseña */}  
      <button className="añadir-resena-btn" onClick={() => setModalAbierto(true)}>
        Añadir reseña
      </button>
      {/* Modal para añadir reseña con overlay y blur */}
      {modalAbierto && (
        <div className="modal-overlay">
          <div className="modal-content">
            <ModalResena
              juegoNombre={juego.nombre}
              videoUrl={getEmbedUrl(juego.videoUrl)}
              imagenes={juego.imagenes}
              juegoId={juego.id}
              onClose={() => setModalAbierto(false)}
              onResenaEnviada={() => {
                // Recargar reseñas después de enviar
                axios.get(`${URL_BACKEND}api/juegos/${juego.id}/resenas`).then(res => setReseñas(res.data));
              }}
            />
          </div>
        </div>
      )}

      {/* Video */}
      <section className="detalle-video">
        <h3>Trailer</h3>
        {juego.videoUrl ? (
          <div className="video-container">
            <iframe
              src={getEmbedUrl(juego.videoUrl)}
              title={`Video de ${juego.nombre}`}
              width="560"
              height="315"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : (
          <p>No se encontró video del juego.</p>
        )}
      </section>
        
      {/* Reseñas */}
      <section className="detalle-reseñas">
        <h3>🗣 Reseñas</h3>
        {reseñas.length > 0 ? (
          <ul className="lista-reseñas">
            {reseñas.map((r) => (
              <li key={r.id} className="reseña-card">
                <div className="reseña-header">
                  <strong>{r.nombre}</strong> - {r.fecha}
                  <span className="reseña-estrellas">{'⭐'.repeat(r.estrellas)}</span>
                </div>
                <p>{r.comentario}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p>No hay reseñas disponibles para este juego.</p>
        )}
      </section>

      {/* Galería de imágenes */}
      <section className="detalle-galeria">
        <h3>Galería</h3>
        {juego.imagenes.length > 0 ? (
          <div className="galeria">
            {juego.imagenes.map((img) => (
              <img
                key={img.id}
                src={img.url}
                alt={img.descripcion || `${juego.nombre} imagen`}
                className="galeria-img"
              />
            ))}
          </div>
        ) : (
          <p>No hay imágenes disponibles.</p>
        )}
      </section>
    </div>
  );
};


export default Detalle;
