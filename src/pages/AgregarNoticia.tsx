import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const URL_BACKEND = import.meta.env.VITE_BACKEND_URL;


interface AgregarNoticiaProps {
  onClose: () => void;
}

const AgregarNoticia: React.FC<AgregarNoticiaProps> = ({ }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    titulo: '',
    texto: '',
    imagen: '',
    activo: true
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [imagenFile, setImagenFile] = useState<File | null>(null);
  const [subiendo, setSubiendo] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox'
        ? (e.target as HTMLInputElement).checked
        : value
    }));
  };

  const handleImagenFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImagenFile(e.target.files[0]);
    }
  };

  const handleUploadImagen = async () => {
    setError('');
    setSuccess('');
    if (!imagenFile) {
      setError('Selecciona una imagen primero');
      return;
    }
    setSubiendo(true);
    try {
      const data = new FormData();
      data.append('image', imagenFile);

      // Envía la imagen al backend
      const res = await axios.post(`${URL_BACKEND}api/upload-image`, data);
      setFormData(prev => ({
        ...prev,
        imagen: res.data.imageUrl
      }));
      setSuccess('Imagen subida correctamente');
    } catch (err: any) {
      setError('Error al subir la imagen: ' + (err.response?.data?.message || err.message));
    } finally {
      setSubiendo(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const res = await fetch(`${URL_BACKEND}api/noticias`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Error al agregar noticia');
      }
      setSuccess('Noticia agregada correctamente');
      setTimeout(() => navigate('/adminnoticias'), 1000);
    } catch (err: any) {
      setError(err.message || 'No se pudo agregar la noticia');
    }
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <h3>Agregar Noticia</h3>
        {success && <div className="success">{success}</div>}
        {error && <div className="error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div>
            <label>Título *</label>
            <input
              name="titulo"
              type="text"
              required
              value={formData.titulo}
              onChange={handleChange}
            />
          </div>
          <div>
            <label>Contenido *</label>
            <textarea
              name="texto"
              required
              value={formData.texto}
              onChange={handleChange}
              className="descripcion-input"
              placeholder="Contenido de la noticia"
            />
          </div>
          <div>
            <label>Imagen *</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImagenFileChange}
            />
            <button
              type="button"
              onClick={handleUploadImagen}
              disabled={subiendo || !imagenFile}
              style={{ marginLeft: 8 }}
            >
              {subiendo ? 'Subiendo...' : 'Confirmar Imagen'}
            </button>
            {formData.imagen && (
              <div>
                <img src={formData.imagen} alt="Previsualización" style={{ width: 100, marginTop: 8 }} />
              </div>
            )}
          </div>
          <div>
            <label>
              <input
                type="checkbox"
                name="activo"
                checked={formData.activo}
                onChange={handleChange}
              />
              Activo
            </label>
          </div>
          <div className="modal-buttons">
            <button type="button" onClick={() => navigate('/adminnoticias')}>
              Cancelar
            </button>
            <button type="submit" disabled={!formData.imagen}>
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AgregarNoticia;