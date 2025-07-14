import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const URL_BACKEND = import.meta.env.VITE_BACKEND_URL;


const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/<tu_cloud_name>/image/upload';
const CLOUDINARY_UPLOAD_PRESET = '<tu_upload_preset>';

interface AgregarNoticiaProps {
  onClose: () => void;
}

const AgregarNoticia: React.FC<AgregarNoticiaProps> = ({ onClose }) => {
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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === 'file') {
      const file = (e.target as HTMLInputElement).files?.[0] || null;
      setImagenFile(file);
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === 'checkbox'
          ? (e.target as HTMLInputElement).checked
          : value
      }));
    }
  };

  const uploadToCloudinary = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    const res = await fetch(CLOUDINARY_URL, {
      method: 'POST',
      body: formData
    });
    if (!res.ok) throw new Error('Error al subir imagen a Cloudinary');
    const data = await res.json();
    return data.secure_url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      let imageUrl = formData.imagen;
      if (imagenFile) {
        imageUrl = await uploadToCloudinary(imagenFile);
      }
      const res = await fetch(`${URL_BACKEND}api/noticias`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, imagen: imageUrl })
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
            <label>Imagen</label>
            <input
              name="imagen"
              type="file"
              accept="image/*"
              onChange={handleChange}
            />
            <small>Puedes subir una imagen o dejar vacío para usar la URL manual.</small>
            <input
              name="imagen"
              type="text"
              value={formData.imagen}
              onChange={handleChange}
              placeholder="https://...jpg (opcional)"
            />
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
            <button type="button" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit">
              Guardar
            </button>
          </div>
        </form>
        <button className="close-btn" type="button" onClick={onClose}>
          ×
        </button>
      </div>
    </div>
  );
};

export default AgregarNoticia;