import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import EliminarJuego from './EliminarJuego';
import '../estilos/AdminJuegos.css';

const URL_BACKEND = import.meta.env.VITE_BACKEND_URL;

interface Categoria {
  id: number;
  nombre: string;
}

interface Imagen {
  url: string;
  descripcion: string;
}

interface Game {
  id: number;
  nombre: string;
  precio: number;
  estaOferta: boolean;
  estado: string;
  categoriaId: number;
  imagenes: Imagen[];
  videoUrl: string;
  plataformas: number[];
  rating?: number;
  discount?: number;
}

const AdminJuegos = () => {
  const [juegos, setJuegos] = useState<Game[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<number | null>(null);
  const [mostrarEliminar, setMostrarEliminar] = useState(false);
  const [juegoAEliminar, setJuegoAEliminar] = useState<Game | null>(null);
  const navigate = useNavigate();

  // Cargar juegos desde el backend
  const fetchJuegos = async () => {
    const res = await fetch(`${URL_BACKEND}api/juegos`);
    const data = await res.json();
    const juegosNormalizados = data.map((juego: any) => ({
      ...juego,
      precio: Number(juego.precio),
      estado: juego.estado ? 'Activo' : 'Inactivo',
    }));
    setJuegos(juegosNormalizados);
  };

  // Cargar categorías desde el backend
  const fetchCategorias = async () => {
    const res = await fetch(`${URL_BACKEND}api/categorias`);
    const data = await res.json();
    setCategorias(data);
  };

  useEffect(() => {
    fetchJuegos();
    fetchCategorias();
  }, []);

  // Filtrar juegos por categoría seleccionada
  const juegosFiltrados = categoriaSeleccionada
    ? juegos.filter(j => j.categoriaId === categoriaSeleccionada)
    : juegos;

  // Eliminar juego
  const eliminarJuego = async () => {
    if (juegoAEliminar) {
      await fetch(`${URL_BACKEND}api/juegos/${juegoAEliminar.id}`, {
        method: 'DELETE',
      });
      setMostrarEliminar(false);
      setJuegoAEliminar(null);
      fetchJuegos();
    }
  };

  // Cerrar sesión
  const handleLogout = () => {
    localStorage.removeItem('token'); // Remover el token al hacer logout
    alert('Sesión cerrada.');
    window.location.href = '/'; // Redirigir al inicio
  };

  return (
    <>
      <aside className="sidebar">
        <p>Admin Panel</p>
        <nav>
          <button>Users</button>
          <button
          className={window.location.pathname.includes('juegos') ? 'active' : ''}
          onClick={() => navigate('/adminjuegos')}>
            Games</button>
          <button
          className={window.location.pathname.includes('noticias') ? 'active' : ''}
          onClick={() => navigate('/adminnoticias')}
          >News</button>

          <button>Statistics</button>
          <button onClick={handleLogout}>Log out</button>
        </nav>
      </aside>

      <main className="admin-panel">
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
          <button
            style={{ background: '#ff6600', color: '#fff', border: 'none', borderRadius: 4, padding: '8px 16px', cursor: 'pointer', fontWeight: 'bold' }}
            onClick={() => navigate('/paginaprincipal')}
          >
            Volver a Principal
          </button>
        </div>
        {/* Categorías filter */}
        <div className="categorias-filter" style={{ marginBottom: 24 }}>
          <button
            className={!categoriaSeleccionada ? "active" : ""}
            onClick={() => setCategoriaSeleccionada(null)}
          >
            Todas
          </button>
          {categorias.map(cat => (
            <button
              key={cat.id}
              className={categoriaSeleccionada === cat.id ? "active" : ""}
              onClick={() => setCategoriaSeleccionada(cat.id)}
            >
              {cat.nombre}
            </button>
          ))}
        </div>

        <h2>Gestión de Juegos</h2>
        <div className="actions">
          <button onClick={() => navigate('/agregarjuego')}>+ Agregar Juego</button>
        </div>
        {juegosFiltrados.length === 0 ? (
          <p className="info">No hay juegos registrados.</p>
        ) : (
          <table className="game-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Precio</th>
                <th>Oferta</th>
                <th>Estado</th>
                <th>Categoría</th>
                <th>Video</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {juegosFiltrados.map((juego) => (
                <tr key={juego.id}>
                  <td>{juego.id}</td>
                  <td>{juego.nombre}</td>
                  <td>${juego.precio.toFixed(2)}</td>
                  <td>{juego.estaOferta ? 'Sí' : 'No'}</td>
                  <td>{juego.estado}</td>
                  <td>
                    {categorias.find(cat => cat.id === juego.categoriaId)?.nombre || juego.categoriaId}
                  </td>
                  <td>{juego.videoUrl ? '✅' : '❌'}</td>
                  <td>
                    <button
                      onClick={() => navigate(`/editarjuego/${juego.id}`)}
                    >
                      Editar
                    </button>
                    <button onClick={() => { setJuegoAEliminar(juego); setMostrarEliminar(true); }}>Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </main>

      {/* MODALES */}
      {mostrarEliminar && juegoAEliminar && (
        <EliminarJuego
          id={juegoAEliminar.id}
          juego={juegoAEliminar.nombre}
          onClose={() => setMostrarEliminar(false)}
          onDeleted={eliminarJuego} // Usamos la función aquí
        />
      )}
    </>
  );
};

export default AdminJuegos;
