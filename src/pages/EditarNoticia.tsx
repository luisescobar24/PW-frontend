import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const URL_BACKEND = import.meta.env.VITE_BACKEND_URL;

type Noticia = {
  id: number;
  titulo: string;
  contenido: string;
  imagenes: string[];
  activo: boolean;
};

type EditarNoticiaProps = {
  noticia: Noticia;
  onSave: () => void;
};

const EditarNoticia: React.FC<EditarNoticiaProps> = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<Noticia | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  useEffect(() => {
    const fetchNoticia = async () => {
      try {
        const res = await fetch(`${URL_BACKEND}api/noticias/${id}`);
        if (!res.ok) throw new Error('No se pudo obtener la noticia');
        const data = await res.json();
        setFormData(data);
      } catch (err: any) {
        setError(err.message || 'Error al cargar la noticia');
      } finally {
        setLoading(false);
      }
    };
    fetchNoticia();
  }, [id]);

  const [imagenFile, setImagenFile] = useState<File | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    if (!formData) return;
    const target = e.target as HTMLInputElement;
    const { name, value, type, checked } = target;
    if (type === 'file') {
      const file = target.files?.[0] || null;
      setImagenFile(file);
    } else if (name === 'imagenes') {
      setFormData({
        ...formData,
        imagenes: value.split(',').map((img) => img.trim()),
      });
    } else {
      setFormData({
        ...formData,
        [name]: type === 'checkbox' ? checked : value,
      });
    }
  };

  const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/<tu_cloud_name>/image/upload';
  const CLOUDINARY_UPLOAD_PRESET = '<tu_upload_preset>';

  const uploadToCloudinary = async (file: File): Promise<string> => {
    const data = new FormData();
    data.append('file', file);
    data.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    const res = await fetch(CLOUDINARY_URL, {
      method: 'POST',
      body: data,
    });
    if (!res.ok) throw new Error('Error al subir imagen a Cloudinary');
    const result = await res.json();
    return result.secure_url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;
    setError('');
    setSuccess('');
    try {
      let imagenes = formData.imagenes;
      if (imagenFile) {
        const url = await uploadToCloudinary(imagenFile);
        imagenes = [url];
      }
      const res = await fetch(`${URL_BACKEND}api/noticias/${formData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...formData, imagenes }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Error al editar la noticia');
      }
      setSuccess('Noticia editada correctamente');
      setTimeout(() => navigate('/adminnoticias'), 1000);
    } catch (err: any) {
      setError(err.message || 'No se pudo editar la noticia');
    }
  };

  const handleDelete = async () => {
    if (!formData) return;
    setError('');
    setSuccess('');
    try {
      const res = await fetch(`${URL_BACKEND}api/noticias/${formData.id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Error al eliminar la noticia');
      }
      setSuccess('Noticia eliminada correctamente');
      setTimeout(() => navigate('/adminnoticias'), 1000);
    } catch (err: any) {
      setError(err.message || 'No se pudo eliminar la noticia');
    }
  };

  if (loading) return <div className="modal-content">Cargando...</div>;
  if (!formData) return <div className="modal-content">Noticia no encontrada</div>;

  return (
    <div className="modal">
      <div className="modal-content">
        <h3>Editar Noticia</h3>
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
              name="contenido"
              required
              value={formData.contenido}
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
            <small>Puedes subir una nueva imagen o editar la URL manualmente.</small>
            <input
              name="imagenes"
              type="text"
              value={formData.imagenes.join(', ') || ""}
              onChange={handleChange}
              placeholder="https://...jpg, https://...png"
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
            <button type="button" onClick={() => navigate('/adminnoticias')}>
              Cancelar
            </button>
            <button type="button" onClick={handleDelete} style={{ background: 'red', color: 'white' }}>
              Eliminar
            </button>
            <button type="submit">
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditarNoticia;