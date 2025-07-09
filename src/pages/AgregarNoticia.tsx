import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../estilos/EditarJuego.css';



interface Noticia {
  id: number;
  titulo: string;
  contenido: string;
  imagenes: string[];
}

interface AgregarNoticiaProps {
  onClose: () => void; // Asegúrate de usar onClose si es necesario
}

const AgregarNoticia: React.FC<AgregarNoticiaProps> = ({ onClose }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<Noticia>({
    id: 0,
    titulo: '',
    contenido: '',
    imagenes: [],
  });

  const [imagenesFiles, setImagenesFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImagenesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImagenesFiles(prev => [...prev, ...Array.from(e.target.files as FileList)]);
    }
  };

  const handleConfirmarImagenes = () => {
    const nuevas = imagenesFiles.slice(previewUrls.length);
    const newUrls = nuevas.map(file => URL.createObjectURL(file));
    setPreviewUrls(prev => [...prev, ...newUrls]);
    (document.querySelector('input[name="imagenes"]') as HTMLInputElement).value = '';
  };

  const handleEliminarImagen = (idx: number) => {
    setPreviewUrls(prev => prev.filter((_, i) => i !== idx));
    setImagenesFiles(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const form = new FormData();
    form.append('titulo', formData.titulo);
    form.append('contenido', formData.contenido);
    imagenesFiles.forEach(file => form.append('imagenes', file));

    try {
      const res = await fetch('http://localhost:3000/api/noticias', {
        method: 'POST',
        body: form,
      });

      if (!res.ok) throw new Error('Error al guardar la noticia');
      setSuccess('Noticia guardada correctamente');
      setTimeout(() => navigate('/adminnoticias'), 1000);
    } catch (err) {
      setError('No se pudo guardar la noticia');
    } finally {
      setLoading(false);
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
              name="contenido"
              required
              value={formData.contenido}
              onChange={handleChange}
              className="descripcion-input"
              placeholder="Contenido de la noticia"
            />
          </div>
          <div>
            <label>Imágenes</label>
            <input
              name="imagenes"
              type="file"
              multiple
              accept="image/*"
              onChange={handleImagenesChange}
            />
            <button
              type="button"
              onClick={handleConfirmarImagenes}
              disabled={imagenesFiles.length === previewUrls.length}
            >
              Confirmar imágenes
            </button>
            <div>
              {previewUrls.map((url, idx) => (
                <div key={url} className="imagen-item">
                  <img src={url} alt={`preview-${idx}`} className="imagen-preview" />
                  <button
                    type="button"
                    className="btn-quitar-imagen"
                    onClick={() => handleEliminarImagen(idx)}
                  >
                    Quitar
                  </button>
                </div>
              ))}
            </div>
          </div>
          <div className="modal-buttons">
            <button type="button" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar Noticia'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AgregarNoticia;
