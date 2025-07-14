import { useState } from 'react';

const URL_BACKEND = import.meta.env.VITE_BACKEND_URL;

interface EliminarJuegoProps {
  id: number;            // Recibe el id del juego
  juego: string;         // Recibe el nombre del juego para mostrarlo
  onClose: () => void;   // Para cerrar el modal
  onDeleted: () => void; // Callback tras eliminar correctamente
}

const EliminarJuego = ({ id, juego, onClose, onDeleted }: EliminarJuegoProps) => {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${URL_BACKEND}api/juegos/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        onDeleted(); // Notifica al padre que se eliminó
      } else {
        alert('Error al eliminar el juego');
      }
    } catch (err) {
      alert('Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <h3>Eliminar Juego</h3>
        <p>¿Estás seguro que deseas eliminar "{juego}"?</p>
        <div className="modal-buttons">
          <button type="button" onClick={onClose} disabled={loading}>Cancelar</button>
          <button type="button" onClick={handleDelete} disabled={loading}>
            {loading ? 'Eliminando...' : 'Confirmar'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EliminarJuego;
