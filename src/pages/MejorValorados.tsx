import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const URL_BACKEND = import.meta.env.VITE_BACKEND_URL;

interface Juego {
  id: number;
  nombre: string;
  descripcion: string;
  imagenes: { id: number; juegoId: number; url: string; descripcion?: string }[];
  videoUrl: string;
  precio: number;
  categoriaId: number;
  plataformas: number[];
}

const MejorValorados = () => {
  const [juegos, setJuegos] = useState<Juego[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = '⭐ Juegos Mejor Valorados';

    const fetchJuegos = async () => {
      try {
        const response = await axios.get(`${URL_BACKEND}api/juegos-mejor-valorados`);
        setJuegos(response.data);
      } catch (error) {
        console.error('Error al obtener los juegos mejor valorados', error);
      }
    };
    fetchJuegos();
  }, []);

  return (
    <div className="pagina-principal">
      <header>
        <h1>⭐ Juegos Mejor Valorados</h1>
        <nav className="navbar" style={{ marginTop: '10px' }}>
          <button onClick={() => navigate('/paginaprincipal')} className="active">
           Inicio
          </button>
        </nav>
      </header>

      <div className="games-grid">
        {juegos.map((juego) => (
          <div key={juego.id} className="game-card">
            <div className="card-image">
              <img src={juego.imagenes[0]?.url} alt={juego.nombre} />
            </div>
            <div className="card-content">
              <h3>{juego.nombre}</h3>
              <p className="precio">${juego.precio}</p>
              <button
                onClick={() => navigate(`/detalle/${juego.id}`)}
                className="boton-detalle"
              >
                🔍 Ver Detalles
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MejorValorados;