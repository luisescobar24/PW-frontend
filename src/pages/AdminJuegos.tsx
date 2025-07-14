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
  fechaLanzamiento?: string;
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
  
  // Nuevos estados para filtros
  const [fechaDesde, setFechaDesde] = useState<string>('');
  const [fechaHasta, setFechaHasta] = useState<string>('');
  const [precioMin, setPrecioMin] = useState<string>('');
  const [precioMax, setPrecioMax] = useState<string>('');
  const [ordenPor, setOrdenPor] = useState<string>('nombre');
  
  const navigate = useNavigate();

  // Cargar juegos desde el backend
  const fetchJuegos = async () => {
    const res = await fetch(`${URL_BACKEND}api/juegos`);
    const data = await res.json();
    const juegosNormalizados = data.map((juego: Game) => ({
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

  // Filtrar juegos por categoría, fecha y precio
  const juegosFiltrados = juegos.filter(juego => {
    // Filtro por categoría
    if (categoriaSeleccionada && juego.categoriaId !== categoriaSeleccionada) {
      return false;
    }
    
    // Filtro por precio mínimo
    if (precioMin && juego.precio < parseFloat(precioMin)) {
      return false;
    }
    
    // Filtro por precio máximo
    if (precioMax && juego.precio > parseFloat(precioMax)) {
      return false;
    }
    
    // Filtro por fecha desde
    if (fechaDesde && juego.fechaLanzamiento) {
      const fechaJuego = new Date(juego.fechaLanzamiento);
      const fechaMinima = new Date(fechaDesde);
      if (fechaJuego < fechaMinima) {
        return false;
      }
    }
    
    // Filtro por fecha hasta
    if (fechaHasta && juego.fechaLanzamiento) {
      const fechaJuego = new Date(juego.fechaLanzamiento);
      const fechaMaxima = new Date(fechaHasta);
      if (fechaJuego > fechaMaxima) {
        return false;
      }
    }
    
    return true;
  }).sort((a, b) => {
    // Ordenamiento
    switch (ordenPor) {
      case 'precio-asc':
        return a.precio - b.precio;
      case 'precio-desc':
        return b.precio - a.precio;
      case 'fecha-asc':
        if (!a.fechaLanzamiento || !b.fechaLanzamiento) return 0;
        return new Date(a.fechaLanzamiento).getTime() - new Date(b.fechaLanzamiento).getTime();
      case 'fecha-desc':
        if (!a.fechaLanzamiento || !b.fechaLanzamiento) return 0;
        return new Date(b.fechaLanzamiento).getTime() - new Date(a.fechaLanzamiento).getTime();
      case 'nombre':
      default:
        return a.nombre.localeCompare(b.nombre);
    }
  });

  // Función para limpiar todos los filtros
  const limpiarFiltros = () => {
    setCategoriaSeleccionada(null);
    setFechaDesde('');
    setFechaHasta('');
    setPrecioMin('');
    setPrecioMax('');
    setOrdenPor('nombre');
  };

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

        {/* Filtros avanzados */}
        <div className="filtros-avanzados" style={{ 
          padding: '20px', 
          borderRadius: '8px', 
          marginBottom: '24px'
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', alignItems: 'end' }}>
            {/* Filtro por precio */}
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Precio Mínimo:</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={precioMin}
                onChange={(e) => setPrecioMin(e.target.value)}
                placeholder="Ej: 10.00"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Precio Máximo:</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={precioMax}
                onChange={(e) => setPrecioMax(e.target.value)}
                placeholder="Ej: 100.00"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              />
            </div>

            {/* Filtro por fecha */}
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Fecha Desde:</label>
              <input
                type="date"
                value={fechaDesde}
                onChange={(e) => setFechaDesde(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Fecha Hasta:</label>
              <input
                type="date"
                value={fechaHasta}
                onChange={(e) => setFechaHasta(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              />
            </div>

            {/* Ordenamiento */}
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Ordenar por:</label>
              <select
                value={ordenPor}
                onChange={(e) => setOrdenPor(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px',
                  background: 'white'
                }}
              >
                <option value="nombre">Nombre (A-Z)</option>
                <option value="precio-asc">Precio (Menor a Mayor)</option>
                <option value="precio-desc">Precio (Mayor a Menor)</option>
                <option value="fecha-asc">Fecha (Más Antiguo)</option>
                <option value="fecha-desc">Fecha (Más Reciente)</option>
              </select>
            </div>

            {/* Botón limpiar filtros */}
            <div>
              <button
                onClick={limpiarFiltros}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  background: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '14px',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
                onMouseOver={(e) => e.currentTarget.style.background = '#5a6268'}
                onMouseOut={(e) => e.currentTarget.style.background = '#6c757d'}
              >
                Limpiar Filtros
              </button>
            </div>
          </div>
        </div>

        <h2>Gestión de Juegos</h2>
        
        {/* Indicador de resultados */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '16px',
          padding: '12px 16px'
        }}>
          <span style={{ color: '#333', fontWeight: '500' }}>
            Mostrando {juegosFiltrados.length} de {juegos.length} juegos
            {(categoriaSeleccionada || precioMin || precioMax || fechaDesde || fechaHasta) && 
              <span style={{ fontWeight: 'normal' }}> (filtrado)</span>
            }
          </span>
        </div>
        
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
                <th>Fecha Lanzamiento</th>
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
                  <td>
                    {juego.fechaLanzamiento 
                      ? new Date(juego.fechaLanzamiento).toLocaleDateString('es-ES')
                      : 'No definida'
                    }
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
