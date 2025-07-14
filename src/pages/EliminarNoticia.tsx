import type { FC } from 'react';
const URL_BACKEND = import.meta.env.VITE_BACKEND_URL;

interface Props {
  id: number;
  titulo: string;
  onClose: () => void;
  onDeleted: () => void;
}

const EliminarNoticia: FC<Props> = ({ id, titulo, onClose, onDeleted }) => {
  const handleDelete = async () => {
    try {
      const res = await fetch(`${URL_BACKEND}api/noticias/${id}`, {
        method: 'DELETE'
      });
      if (!res.ok) {
        alert('Error al eliminar la noticia');
        return;
      }
      onDeleted();
    } catch {
      alert('Error de red al eliminar la noticia');
    }
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <h3>Eliminar Noticia</h3>
        <p>¿Seguro que deseas eliminar la noticia "{titulo}"?</p>
        <div className="modal-buttons">
          <button onClick={onClose}>Cancelar</button>
          <button onClick={handleDelete} className="danger">
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
};

export default EliminarNoticia;