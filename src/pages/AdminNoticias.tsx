import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import EliminarNoticia from './EliminarNoticia';
import '../estilos/AdminJuegos.css';

const URL_BACKEND = import.meta.env.VITE_BACKEND_URL;

interface Imagen {
  url: string;
  descripcion: string;
}

interface Noticia {
  id: number;
  titulo: string;
  contenido: string;
  imagenes: Imagen[];
}

const AdminNoticias = () => {
  const [noticias, setNoticias] = useState<Noticia[]>([]);
  const [mostrarEliminar, setMostrarEliminar] = useState(false);
  const [noticiaAEliminar, setNoticiaAEliminar] = useState<Noticia | null>(null);
  const navigate = useNavigate();

  const fetchNoticias = async () => {
    try {
      const response = await fetch(`${URL_BACKEND}noticias`);
      if (!response.ok) throw new Error('Error al obtener noticias');
      const data = await response.json();
      setNoticias(data);
    } catch (error) {
      setNoticias([]);
    }
  };

  useEffect(() => {
    fetchNoticias();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    alert('Sesión cerrada.');
    window.location.href = '/';
  };

  return (
    <>
      <aside className="sidebar">
        <p>Admin Panel</p>
        <nav>
            <button>Users</button>  
            <button onClick={() => navigate('/adminjuegos')}>Games</button>
            <button className="active" onClick={() => navigate('/adminnoticias')}>News</button>
            <button>Statistics</button>
            <button onClick={handleLogout}>Log out</button>
        </nav>
      </aside>

      <main className="admin-panel">
        <h2>Gestión de Noticias</h2>
        <div className="actions">
          <button onClick={() => navigate('/adminnoticias/agregar')}>+ Agregar Noticia</button>
        </div>

        {noticias.length === 0 ? (
          <p className="info">No hay noticias registradas.</p>
        ) : (
          <table className="game-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Título</th>
                <th>Contenido</th>
                <th>Imagen</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {noticias.map((noticia) => (
                <tr key={noticia.id}>
                  <td>{noticia.id}</td>
                  <td>{noticia.titulo}</td>
                  <td>
                    {noticia.contenido.length > 60
                      ? noticia.contenido.slice(0, 60) + '...'
                      : noticia.contenido}
                  </td>
                  <td>
                    {noticia.imagenes.length > 0 ? (
                      <img
                        src={noticia.imagenes[0].url}
                        alt={noticia.imagenes[0].descripcion}
                        style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 8 }}
                      />
                    ) : (
                      '❌'
                    )}
                  </td>
                  <td>
                    <button onClick={() => navigate(`/adminnoticias/editar/${noticia.id}`)}>
                      Editar
                    </button>
                    <button onClick={() => {
                      setNoticiaAEliminar(noticia);
                      setMostrarEliminar(true);
                    }}>
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </main>

      {/* MODAL DE CONFIRMACIÓN */}
      {mostrarEliminar && noticiaAEliminar && (
        <EliminarNoticia
          id={noticiaAEliminar.id}
          titulo={noticiaAEliminar.titulo}
          onClose={() => setMostrarEliminar(false)}
          onDeleted={() => {
            setMostrarEliminar(false);
            setNoticiaAEliminar(null);
            fetchNoticias();
          }}
        />
      )}
    </>
  );
};

export default AdminNoticias;
