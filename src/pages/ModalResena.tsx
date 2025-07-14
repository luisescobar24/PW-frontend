import React, { useState } from 'react';
import axios from 'axios';
import '../estilos/Resena.css';


interface ImagenJuego {
  id: number;
  url: string;
  descripcion?: string;
}

interface Props {
  juegoNombre: string;
  videoUrl: string;
  imagenes: ImagenJuego[];
  onClose: () => void;
  juegoId: number;
  onResenaEnviada?: () => void;
}

const ModalResena: React.FC<Props> = ({ juegoNombre, videoUrl, imagenes, onClose, juegoId, onResenaEnviada }) => {
  const [comentario, setComentario] = useState('');
  const [estrellas, setEstrellas] = useState(5);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');
  const [nombre, setNombre] = useState('');


  const enviarResena = async () => {
    if (!comentario || !nombre) {
      setError('Debes ingresar tu nombre y comentario.');
      return;
    }
    setEnviando(true);
    setError('');
    try {
      await axios.post(`${import.meta.env.VITE_BACKEND_URL}api/juegos/${juegoId}/resenas`, {
        nombre,
        comentario,
        estrellas
      });
      setComentario('');
      setEstrellas(5);
      setNombre('');
      if (onResenaEnviada) onResenaEnviada();
      onClose();
    } catch (e) {
      setError('Error al enviar la reseña.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="modalresena">
      <span className="close" onClick={onClose}>×</span>
      <h1>{juegoNombre}</h1>

      <div className="video-section">
        <iframe
          src={videoUrl}
          title="Trailer del juego"
          allowFullScreen
        />
      </div>

      <div className="gallery">
        {imagenes.map(img => (
          <img key={img.id} src={img.url} alt={img.descripcion || 'Imagen del juego'} />
        ))}
      </div>

      <div className="review-container">
        <h2>Tu reseña</h2>
        <div className="user-section">
          <img src="https://i.pravatar.cc/50" alt="Avatar usuario" />
          <label style={{fontWeight:'bold', marginRight: 8}}>Nombre:</label>
          <input
            type="text"
            placeholder="Tu nombre"
            value={nombre}
            onChange={e => setNombre(e.target.value)}
            disabled={enviando}
            style={{ borderRadius: 6, padding: 4, border: '1px solid #ccc' }}
          />
          <select value={estrellas} onChange={(e) => setEstrellas(parseInt(e.target.value))} disabled={enviando}>
            {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} estrellas</option>)}
          </select>
        </div>
        <textarea
          placeholder="Escribe tu opinión..."
          value={comentario}
          onChange={(e) => setComentario(e.target.value)}
          disabled={enviando}
        />
        {error && <p style={{color:'red'}}>{error}</p>}
        <button onClick={enviarResena} disabled={enviando}>{enviando ? 'Enviando...' : 'Enviar reseña'}</button>
      </div>

      <button className="play-btn">Jugar ahora</button>
    </div>
  );
};

export default ModalResena;
