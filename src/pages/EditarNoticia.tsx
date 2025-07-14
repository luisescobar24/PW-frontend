import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const URL_BACKEND = import.meta.env.VITE_BACKEND_URL;

type Noticia = {
  id: number;
  titulo: string;
  texto: string;
  imagen?: string | null;
  activo: boolean;
};

const EditarNoticia: React.FC = () => {
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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    if (!formData) return;
    const target = e.target;

    if (target instanceof HTMLInputElement) {
      const { name, value, type } = target;
      if (type === 'checkbox') {
        setFormData({ ...formData, [name]: target.checked });
      } else {
        setFormData({ ...formData, [name]: value });
      }
    } else if (target instanceof HTMLTextAreaElement) {
      setFormData({ ...formData, [target.name]: target.value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;
    setError('');
    setSuccess('');
    try {
      const res = await fetch(`${URL_BACKEND}api/noticias/${formData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
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
              name="texto"
              required
              value={formData.texto}
              onChange={handleChange}
              className="descripcion-input"
              placeholder="Contenido de la noticia"
            />
          </div>
          <div>
            <label>URL Imagen</label>
            <input
              name="imagen"
              type="text"
              value={formData.imagen || ''}
              onChange={handleChange}
              placeholder="https://...jpg"
            />
            {formData.imagen && (
              <div style={{ marginTop: '10px' }}>
                <img
                  src={formData.imagen}
                  alt="Vista previa"
                  style={{ maxWidth: '100%', maxHeight: '200px' }}
                />
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
