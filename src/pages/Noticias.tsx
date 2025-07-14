import React, { useEffect, useState } from 'react';
import '../estilos/PaginaPrincipal.css';

const URL_BACKEND = import.meta.env.VITE_BACKEND_URL;

interface ImagenNoticia {
  url: string;
  descripcion?: string;
}

interface Noticia {
  id: number;
  titulo: string;
  texto: string;
  imagenes: ImagenNoticia[];
}

interface Juego {
  id: number;
  nombre: string;
  precio: number;
  imagenes: { url: string }[];
}

const Noticias: React.FC = () => {
  const [noticias, setNoticias] = useState<Noticia[]>([]);
  const [juegos, setJuegos] = useState<Juego[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNoticias = async () => {
      try {
        const res = await fetch(`${URL_BACKEND}api/noticias`);
        const data = await res.json();
        setNoticias(data);
      } catch {
        setNoticias([]);
      }
    };
    const fetchJuegos = async () => {
      try {
        const res = await fetch(`${URL_BACKEND}api/juegos?limit=10&order=desc`);
        const data = await res.json();
        setJuegos(data.slice(0, 10));
      } catch {
        setJuegos([]);
      }
    };
    Promise.all([fetchNoticias(), fetchJuegos()]).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="cargando">Cargando...</div>;

  return (
    <div className="noticias-page">
      <h2>Noticias Principales</h2>
      {/* Carrusel de noticias principales */}
      <div className="noticias-carrusel">
        {noticias.length === 0 ? (
          <p>No hay noticias disponibles.</p>
        ) : (
          <div className="carrusel-container">
            {noticias.slice(0, 5).map(noticia => (
              <div key={noticia.id} className="noticia-carrusel-item">
                {noticia.imagenes[0] && (
                  <img src={noticia.imagenes[0].url} alt={noticia.titulo} className="noticia-carrusel-img" />
                )}
                <h3>{noticia.titulo}</h3>
                <p>{noticia.texto.slice(0, 120)}...</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <h2>Catálogo de Juegos (10 más recientes)</h2>
      <div className="juegos-preview-grid">
        {juegos.length === 0 ? (
          <p>No hay juegos disponibles.</p>
        ) : (
          juegos.map(juego => (
            <div key={juego.id} className="juego-preview-card">
              {juego.imagenes[0] && (
                <img src={juego.imagenes[0].url} alt={juego.nombre} className="juego-preview-img" />
              )}
              <h4>{juego.nombre}</h4>
              <p>${juego.precio.toFixed(2)}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Noticias;
