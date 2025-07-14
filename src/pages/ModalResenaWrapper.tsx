import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
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
  precio: number | string;
  categoria: string;
  imagenes: ImagenJuego[];
}

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

const ModalResenaWrapper: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [juego, setJuego] = useState<Juego | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchJuego = async () => {
      try {
        const response = await axios.get(`${URL_BACKEND}api/juegos/${id}`);
        setJuego(response.data);
      } catch (err) {
        setError('❌ Error al cargar los datos del juego.');
      } finally {
        setLoading(false);
      }
    };
    fetchJuego();
  }, [id]);

  if (loading) return <p className="cargando">⏳ Cargando datos del juego...</p>;
  if (error || !juego) return <p className="error">{error || 'Juego no encontrado.'}</p>;

  return (
    <ModalResena
      juegoNombre={juego.nombre}
      videoUrl={getEmbedUrl(juego.videoUrl)}
      imagenes={juego.imagenes}
      onClose={() => navigate(-1)}
    />
  );
};

export default ModalResenaWrapper;

