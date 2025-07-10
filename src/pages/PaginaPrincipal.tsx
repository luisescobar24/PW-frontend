import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../estilos/PaginaPrincipal.css';  // Importa el archivo de estilos

const URL_BACKEND = import.meta.env.VITE_BACKEND_URL;

interface Juego {
  id: number;
  nombre: string;
  descripcion: string;
  imagenes: { id: number; juegoId: number; url: string; descripcion?: string }[];
  videoUrl: string;
  precio: number;
  categoriaId: number;
  plataformas: number[];  // Lista de plataformas asociadas al juego
}

export interface ItemCarrito extends Juego {
  cantidad: number;
}

const PaginaPrincipal: React.FC = () => {
  const navigate = useNavigate();

  // Estados principales
  const [juegos, setJuegos] = useState<Juego[]>([]);
  const [carrito, setCarrito] = useState<ItemCarrito[]>(() => {
    const guardado = localStorage.getItem('carrito');
    return guardado ? JSON.parse(guardado) : [];
  });
  const [index, setIndex] = useState(0);
  const [menuCategoriasVisible, setMenuCategoriasVisible] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState<number>(0);  // 0 = todas
  const [plataformaFiltro, setPlataformaFiltro] = useState<number>(0); // 0 = todas
  const [ordenamiento, setOrdenamiento] = useState('nombre');
  const [mensaje, setMensaje] = useState('');
  const [categorias, setCategorias] = useState<{ id: number, nombre: string }[]>([]);
  const [plataformas, setPlataformas] = useState<{ id: number, nombre: string }[]>([]);
  // const [cargando, setCargando] = useState(false);

  // Estado para los valores del carrito
  const [cantidades, setCantidades] = useState<Record<number, number>>({});

  // Cargar juegos desde el backend
  useEffect(() => {
    const fetchJuegos = async () => {
      try {
        const response = await axios.get(`${URL_BACKEND}api/juegos`, {
          params: {
            plataformaId: plataformaFiltro,
            categoriaId: categoriaFiltro,
          }
        });
        console.log('Juegos obtenidos:', response.data); // <-- Agrega esto
        setJuegos(response.data);
      } catch (error) {
        console.error('Error al obtener juegos', error);
      }
    };
    fetchJuegos();
  }, [plataformaFiltro, categoriaFiltro]);

  // Cargar categorías desde el backend
  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const response = await axios.get(`${URL_BACKEND}api/categorias`);
        setCategorias([{ id: 0, nombre: 'todas' }, ...response.data]); // Agregar 'todas' como opción
      } catch (error) {
        console.error('Error al obtener categorías', error);
      }
    };
    fetchCategorias();
  }, []);

  // Cargar plataformas desde el backend
  useEffect(() => {
    const fetchPlataformas = async () => {
      try {
        const response = await axios.get(`${URL_BACKEND}api/plataformas`);
        setPlataformas([{ id: 0, nombre: 'todas' }, ...response.data]); // Agregar 'todas' como opción
      } catch (error) {
        console.error('Error al obtener plataformas', error);
      }
    };
    fetchPlataformas();
  }, []);

  // Funciones de carrusel
  const handlePrev = useCallback(() => {
    if (juegos.length === 0) return;
    setIndex(prevIndex => (prevIndex === 0 ? juegos.length - 1 : prevIndex - 1));
  }, [juegos.length]);

  const handleNext = useCallback(() => {
    if (juegos.length === 0) return;
    setIndex(prevIndex => (prevIndex === juegos.length - 1 ? 0 : prevIndex + 1));
  }, [juegos.length]);

  // Función para mostrar mensajes temporales
  const mostrarMensaje = (texto: string) => {
    setMensaje(texto);
    setTimeout(() => setMensaje(''), 3000);
  };

  // Función para agregar al carrito
  const agregarAlCarrito = useCallback((juego: Juego) => {
    const cantidad = cantidades[juego.id] || 1;

    if (cantidad <= 0) {
      mostrarMensaje('La cantidad debe ser al menos 1');
      return;
    }

    setCarrito(prevCarrito => {
      const itemExistente = prevCarrito.find(item => item.id === juego.id);
      if (itemExistente) {
        return prevCarrito.map(item => 
          item.id === juego.id ? { ...item, cantidad: item.cantidad + cantidad } : item
        );
      } else {
        return [...prevCarrito, { ...juego, cantidad }];
      }
    });
    setCantidades(prev => ({ ...prev, [juego.id]: 1 }));
    mostrarMensaje(`${juego.nombre} agregado al carrito`);
  }, [cantidades]);

  // Función para eliminar del carrito
  const eliminarDelCarrito = useCallback((id: number) => {
    setCarrito(prev => prev.filter(item => item.id !== id));
    mostrarMensaje('Producto eliminado del carrito');
  }, []);

  // Función para actualizar las cantidades en el carrito
  const actualizarCantidadCarrito = useCallback((id: number, nuevaCantidad: number) => {
    if (nuevaCantidad <= 0) {
      eliminarDelCarrito(id);
      return;
    }
    setCarrito(prev =>
      prev.map(item => 
        item.id === id ? { ...item, cantidad: nuevaCantidad } : item
      )
    );
  }, [eliminarDelCarrito]);

  // Filtros optimizados
  const juegosFiltrados = useMemo(() => {
    if (!Array.isArray(juegos) || juegos.length === 0) return [];

    let resultado = [...juegos];

    // Si hay búsqueda, filtra los juegos por nombre, descripción o categoría
    if (busqueda.trim()) {
      const busquedaLower = busqueda.toLowerCase();
      resultado = resultado.filter(juego => {
        const nombre = (juego.nombre ?? '').toLowerCase();
        const descripcion = (juego.descripcion ?? '').toLowerCase();
        const categoria = (categorias.find(cat => cat.id === juego.categoriaId)?.nombre ?? '').toLowerCase();

        return nombre.includes(busquedaLower) || descripcion.includes(busquedaLower) || categoria.includes(busquedaLower);
      });
    }

    // Filtrar por categoría seleccionada
    if (categoriaFiltro && categoriaFiltro !== 0) {
      resultado = resultado.filter(juego => juego.categoriaId === categoriaFiltro);
    }

    // Filtrar por plataforma seleccionada
    if (plataformaFiltro && plataformaFiltro !== 0) {
      resultado = resultado.filter(juego =>
        Array.isArray(juego.plataformas) &&
        juego.plataformas.some(
          plat =>
            typeof plat === 'number'
              ? plat === plataformaFiltro
              : typeof plat === 'object' && plat !== null && 'id' in plat && (plat as { id: number }).id === plataformaFiltro
        )
      );
    }

    // Ordenar los juegos
    if (resultado.length > 0) {
      resultado.sort((a, b) => {
        switch (ordenamiento) {
          case 'precio-asc':
            return a.precio - b.precio;
          case 'precio-desc':
            return b.precio - a.precio;
          case 'nombre':
          default:
            return (a.nombre ?? '').localeCompare(b.nombre ?? '');
        }
      });
    }

    return resultado;
  }, [busqueda, categoriaFiltro, plataformaFiltro, ordenamiento, juegos, categorias]);

  // Verifica si no hay juegos filtrados
  const mostrarMensajeNoJuegos = juegosFiltrados.length === 0 && categoriaFiltro !== 0;

  // Calcular totales del carrito
  const totalCarrito = useMemo(() => {
    return carrito.reduce((total, item) => total + (item.precio * item.cantidad), 0);
  }, [carrito]);

  const totalItems = useMemo(() => {
    return carrito.reduce((total, item) => total + item.cantidad, 0);
  }, [carrito]);

  function cancelarCarrito(): void {
    setCarrito([]);
    mostrarMensaje('Carrito vaciado');
  }

  return (
    <div className="pagina-principal">
      {mensaje && <div className={`mensaje-temporal ${mensaje.includes('error') ? 'error' : 'success'}`}>{mensaje}</div>}

      <header>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }} >
          <h1>🎮 Catálogo de Juegos</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }} >
            <span style={{ fontSize: '14px', color: '#fff' }} >
              📊 {juegos.length} juegos disponibles
            </span>
          </div>
        </div>

        <nav className="navbar">
          <button>Explorar</button>
          <div style={{ position: 'relative', display: 'inline-block' }} >
            <button onClick={() => setMenuCategoriasVisible((v) => !v)} className="dropdown-btn">
              Categorías
            </button>
            {menuCategoriasVisible && (
              <div style={{ position: 'absolute', top: '100%', left: 0, background: '#222', border: '1px solid #444', zIndex: 10, minWidth: '180px', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }} >
                {categorias.map(cat => (
                  <button
                    key={cat.id}
                    style={{ width: '100%', color: '#fff', background: 'none', border: 'none', padding: '10px 16px', textAlign: 'left', cursor: 'pointer' }}
                    onClick={() => {
                      setCategoriaFiltro(cat.id);  // Filtra por ID de categoría
                      setMenuCategoriasVisible(false);
                    }}
                  >
                    {cat.nombre === 'todas' ? 'Todas las Categorías' : cat.nombre}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button onClick={() => navigate('/paginaprincipal')} className="active">Inicio</button>
          <button>Plataformas</button>
          <button>Ofertas Especiales</button>

          <div className="nav-icons" onClick={() => navigate('/adminjuegos')} title="Panel de Administración" role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && navigate('/adminjuegos')} >
            <span role="img" aria-label="usuario">👤</span>
          </div>
        </nav>

        {/* Barra de búsqueda y filtros mejorada */}
        <div className="search-filters">
          <input type="text" placeholder="Buscar juegos por nombre, descripción o categoría..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} className="search-input" />
          <select value={categoriaFiltro ?? 0} onChange={e => setCategoriaFiltro(Number(e.target.value))} className="filter-select">
            {categorias.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.nombre === 'todas' ? 'Todas las Categorías' : cat.nombre}
              </option>
            ))}
          </select>
          <select
            value={plataformaFiltro ?? 0}
            onChange={e => setPlataformaFiltro(Number(e.target.value))}
            className="filter-select"
          >
            {plataformas.map(plat => (
              <option key={plat.id} value={plat.id}>
                {plat.nombre === 'todas' ? 'Todas las Plataformas' : plat.nombre}
              </option>
            ))}
          </select>
          <select value={ordenamiento} onChange={(e) => setOrdenamiento(e.target.value)} className="sort-select">
            <option value="nombre">Ordenar por Nombre</option>
            <option value="precio-asc">Precio: Menor a Mayor</option>
            <option value="precio-desc">Precio: Mayor a Menor</option>
          </select>
        </div>
      </header>

      {/* Carrusel de juegos */}
      {juegos.length > 0 && (
        <section className="carousel">
          <button
            className="carousel-btn prev"
            onClick={handlePrev}
            aria-label="Juego anterior"
          >
            ⬅
          </button>

          <div className="carousel-container">
            <div className="carousel-image">
              <img
                src={juegos[index]?.imagenes[0]?.url}
                alt={juegos[index]?.nombre}
                loading="lazy"
              />
            </div>
          </div>

          <button
            className="carousel-btn next"
            onClick={handleNext}
            aria-label="Siguiente juego"
          >
            ➡
          </button>
        </section>
      )}

      {/* Lista de juegos filtrados */}
      <div className="games-grid">
        {mostrarMensajeNoJuegos ? (
          <div className="no-results">
            <p>No hay juegos en esta categoría.</p>
          </div>
        ) : juegosFiltrados.length === 0 ? (
          <div className="no-results">
            <p>No se han encontrado juegos que coincidan con los filtros seleccionados.</p>
          </div>
        ) : (
          juegosFiltrados.map(juego => (
            <div key={juego.id} className="game-card">
              <div className="card-image">
                <img
                  src={juego.imagenes[0]?.url}
                  alt={juego.nombre}
                  loading="lazy"
                />
              </div>
              <div className="card-content">
                <h3>{juego.nombre}</h3>
                <p className="categoria">{categorias.find(cat => cat.id === juego.categoriaId)?.nombre}</p>
                <p className="precio">${juego.precio}</p>
                <button onClick={() => agregarAlCarrito(juego)} className="boton-agregar">
                  🛒 Agregar al carrito
                </button>
                <button onClick={() => navigate(`/detalle/${juego.id}`)} className="boton-detalle">
                  🔍 Ver Detalles
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Carrito de compras */}
      <section className="cart">
        <div className="cart-header">
          <h3>🛒 Carrito de Compras <span className="cart-count">({totalItems})</span></h3>
          <p className="cart-total">Total: ${totalCarrito.toFixed(2)}</p>
        </div>

        {carrito.length === 0 ? (
          <div className="cart-empty">
            <p>🛒 Tu carrito está vacío</p>
            <p>¡Explora nuestro catálogo y encuentra juegos increíbles!</p>
          </div>
        ) : (
          <div className="cart-items">
            {carrito.map((item) => (
              <div key={item.id} className="cart-item">
                <img src={item.imagenes[0]?.url} alt={item.nombre} />
                <div className="item-details">
                  <h4>{item.nombre}</h4>
                  <p className="item-precio">${item.precio}</p>
                </div>
                <div className="item-quantity">
                  <button onClick={() => actualizarCantidadCarrito(item.id, item.cantidad - 1)} disabled={item.cantidad <= 1}>-</button>
                  <span className="item-cantidad">{item.cantidad}</span>
                  <button onClick={() => actualizarCantidadCarrito(item.id, item.cantidad + 1)} disabled={item.cantidad >= 10}>+</button>
                </div>
                <div className="item-total">${(item.precio * item.cantidad).toFixed(2)}</div>
                <button onClick={() => eliminarDelCarrito(item.id)} className="boton-eliminar">🗑️</button>
              </div>
            ))}
          </div>
        )}

        {carrito.length > 0 && (
          <div className="cart-actions">
            <button
              className="boton-confirmar"
              onClick={() => navigate('/confirmarorden', { state: { carrito, total: totalCarrito } })}
            >
              ✔ Confirmar Orden
            </button>
            <button className="boton-cancelar" onClick={cancelarCarrito}>🗑️ Vaciar Carrito</button>
          </div>
        )}
      </section>
    </div>
  );
};
export default PaginaPrincipal;

