import { useState } from 'react';

const URL = "https://pw-backend-8jnk.onrender.com/"

interface EliminarNoticiaProps {
  id: number;
  titulo: string;
  onClose: () => void;
  onDeleted: () => void;
}

const EliminarNoticia = ({ id, titulo, onClose, onDeleted }: EliminarNoticiaProps) => {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${URL}api/noticias/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) onDeleted();
      else alert('Error al eliminar la noticia');
    } catch {
      alert('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <h3>Eliminar Noticia</h3>
        <p>¿Estás seguro que deseas eliminar "{titulo}"?</p>
        <div className="modal-buttons">
          <button onClick={onClose} disabled={loading}>Cancelar</button>
          <button onClick={handleDelete} disabled={loading}>
            {loading ? 'Eliminando...' : 'Confirmar'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EliminarNoticia;
