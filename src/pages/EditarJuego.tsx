import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../estilos/EditarJuego.css';

const URL_BACKEND = import.meta.env.VITE_BACKEND_URL;

interface Imagen {
  url: string;
  descripcion: string;
}

interface Plataforma {
  id: number;
  nombre: string;
}

interface Categoria {
  id: number;
  nombre: string;
}

interface Game {
  id?: number;
  nombre: string;
  descripcion: string;
  precio: number;
  estaOferta: boolean;
  estado: boolean;
  categoriaId: number;
  imagenes: Imagen[];
  videoUrl: string;
  plataformas: Plataforma[];
  fechaLanzamiento?: string;
}

export interface EditarJuegoProps {
  juego: Game;
  onSave: (juegoEditado: Game) => void;
}

const EditarJuego = ({ juego, onSave }: EditarJuegoProps) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<Game>({
    ...juego,
    descripcion: juego.descripcion || "",
  });
  const [todasPlataformas, setTodasPlataformas] = useState<Plataforma[]>([]);
  const [todasCategorias, setTodasCategorias] = useState<Categoria[]>([]);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [imagenesFiles, setImagenesFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [imagenesAConservar, setImagenesAConservar] = useState<number[]>([]);

  useEffect(() => {
    if (id) {
      setLoading(true);
      fetch(`${URL_BACKEND}api/juegos/${id}`)
        .then(res => res.json())
        .then(data => {
          const plataformas = Array.isArray(data.plataformas)
            ? data.plataformas.map((p: any) => ({
                id: p.id ?? p,
                nombre: p.nombre ?? ''
              }))
            : [];
          const imagenes = Array.isArray(data.imagenes) && data.imagenes.length > 0
            ? data.imagenes
            : [{ url: '', descripcion: '' }];
          setFormData({ ...data, plataformas, imagenes });
        })
        .catch(() => setError('No se pudo cargar el juego'))
        .finally(() => setLoading(false));
    }
  }, [id]);

  useEffect(() => {
    fetch(`${URL_BACKEND}api/plataformas`)
      .then(res => res.json())
      .then(data => setTodasPlataformas(data))
      .catch(() => setTodasPlataformas([]));
  }, []);

  useEffect(() => {
    fetch(`${URL_BACKEND}api/categorias`)
      .then(res => res.json())
      .then(data => setTodasCategorias(data))
      .catch(() => setTodasCategorias([]));
  }, []);

  // Cuando se carga el juego, inicializa imagenesAConservar con los IDs actuales
  useEffect(() => {
    if (formData && Array.isArray(formData.imagenes)) {
      // Si las imágenes tienen ID, guárdalos
      setImagenesAConservar(
        formData.imagenes
          .map((img: any) => img.id)
          .filter((id: any) => typeof id === 'number')
      );
    }
  }, [formData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    if (!formData) return;
    const { name, value, type } = e.target;
    setFormData(prev => prev && ({
      ...prev,
      [name]:
        type === 'checkbox'
          ? (e.target as HTMLInputElement).checked
          : name === 'precio' || name === 'categoriaId'
          ? Number(value)
          : value,
    }));
  };

  const handlePlataformaCheckbox = (plataforma: Plataforma) => {
    if (!formData) return;
    const yaSeleccionada = formData.plataformas.some(p => p.id === plataforma.id);
    let nuevasPlataformas;
    if (yaSeleccionada) {
      nuevasPlataformas = formData.plataformas.filter(p => p.id !== plataforma.id);
    } else {
      nuevasPlataformas = [...formData.plataformas, plataforma];
    }
    setFormData(prev => prev && ({
      ...prev,
      plataformas: nuevasPlataformas,
    }));
  };

  // Manejar selección de archivos (acumula, no reemplaza)
  const handleImagenesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      // Acumula los archivos seleccionados, pero solo los nuevos hasta confirmar
      setImagenesFiles(prev => [...prev, ...Array.from(e.target.files as FileList)]);
    }
  };

  // Confirmar imágenes seleccionadas y mostrar previews (acumula)
  const handleConfirmarImagenes = () => {
    // Solo agregar previews de los archivos que aún no se han mostrado
    const newFiles = imagenesFiles.slice(previewUrls.length);
    const newUrls = newFiles.map(file => URL.createObjectURL(file));
    setPreviewUrls(prev => [...prev, ...newUrls]);
    // Limpia el input de archivos para permitir volver a seleccionar los mismos si se desea
    (document.querySelector('input[name="imagenes"]') as HTMLInputElement).value = '';
  };

  // Eliminar imagen existente (antes de guardar)
  const handleEliminarImagenExistente = (id: number) => {
    setImagenesAConservar(prev => prev.filter(imgId => imgId !== id));
    setFormData(prev => ({
      ...prev,
      imagenes: prev.imagenes.filter((img: any) => img.id !== id),
    }));
  };

  // Eliminar imagen nueva seleccionada (antes de guardar)
  const handleEliminarImagenNueva = (idx: number) => {
    setPreviewUrls(prev => prev.filter((_, i) => i !== idx));
    setImagenesFiles(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      // Asegúrate de enviar solo los IDs de plataformas seleccionadas
      const plataformasIds = formData.plataformas.map(p => p.id);

      const form = new FormData();
      form.append('nombre', formData.nombre);
      form.append('descripcion', formData.descripcion); // Nuevo campo
      form.append('precio', String(formData.precio));
      form.append('estaOferta', String(formData.estaOferta));
      form.append('estado', String(formData.estado));
      form.append('categoriaId', String(formData.categoriaId));
      form.append('videoUrl', formData.videoUrl || '');
      form.append('plataformas', JSON.stringify(plataformasIds)); // <-- solo IDs
      form.append('fechaLanzamiento', formData.fechaLanzamiento || '');
      imagenesFiles.forEach(file => form.append('imagenes', file));
      form.append('imagenesAConservar', JSON.stringify(imagenesAConservar));
      await fetch(`${URL_BACKEND}api/juegos/${formData.id}`, {
        method: 'PUT',
        body: form,
      });

      setSuccess('Juego actualizado correctamente');
      onSave(formData);
      setTimeout(() => {
        setSuccess('');
        navigate('/adminjuegos');
      }, 1000);
    } catch (err) {
      setError('No se pudo actualizar el juego');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    navigate('/adminjuegos');
  };

  if (loading || !formData) {
    return (
      <div className="modal">
        <div className="modal-content">
          Cargando...
        </div>
      </div>
    );
  }

  return (
    <div className="modal">
      <div className="modal-content">
        <h3>✏️ Editar Juego: {formData.nombre}</h3>
        {success && <div className="success">{success}</div>}
        {error && <div className="error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div>
            <label>Nombre *</label>
            <input
              name="nombre"
              type="text"
              required
              value={formData.nombre || ''}
              onChange={handleChange}
            />
          </div>
          <div>
            <label>Descripción *</label>
            <textarea
              name="descripcion"
              value={formData.descripcion || ''}
              onChange={handleChange}
              placeholder="Describe el juego"
              required
              className="descripcion-input"
            />
          </div>
          <div>
            <label>Precio *</label>
            <input
              name="precio"
              type="number"
              min="0"
              step="0.01"
              required
              value={formData.precio ?? ''}
              onChange={handleChange}
            />
          </div>
          <div>
            <label>Fecha de lanzamiento *</label>
            <input
              name="fechaLanzamiento"
              type="date"
              value={formData.fechaLanzamiento || ""}
              onChange={handleChange}
            />
          </div>
          <div>
            <label>¿Está en oferta?</label>
            <input
              name="estaOferta"
              type="checkbox"
              checked={!!formData.estaOferta}
              onChange={handleChange}
            />
          </div>
          <div>
            <label>Estado</label>
            <select
              name="estado"
              value={formData.estado ? 'activo' : 'inactivo'}
              onChange={e =>
                setFormData(prev => prev && ({
                  ...prev,
                  estado: e.target.value === 'activo',
                }))
              }
            >
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo</option>
            </select>
          </div>
          <div>
            <label>Categoría *</label>
            <select
              name="categoriaId"
              value={formData.categoriaId}
              onChange={handleChange}
              required
            >
              <option value="">Selecciona una categoría</option>
              {todasCategorias.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.nombre}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label>Imágenes</label>
            <input
              type="file"
              name="imagenes"
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
              {/* Imágenes existentes (con opción de eliminar y editar descripción) */}
              {formData.imagenes.map((img: any, idx: number) =>
                imagenesAConservar.includes(img.id) ? (
                  <div key={img.id} className="imagen-item">
                    <img src={img.url} alt={img.descripcion} className="imagen-preview" />
                    <input
                      type="text"
                      value={img.descripcion}
                      onChange={e => {
                        const nuevaDescripcion = e.target.value;
                        setFormData(prev => ({
                          ...prev,
                          imagenes: prev.imagenes.map((im, i) =>
                            i === idx ? { ...im, descripcion: nuevaDescripcion } : im
                          ),
                        }));
                      }}
                      placeholder="Descripción"
                      className="imagen-descripcion-input"
                    />
                    <button
                      type="button"
                      onClick={() => handleEliminarImagenExistente(img.id)}
                      className="btn-quitar-imagen"
                    >
                      Quitar
                    </button>
                  </div>
                ) : null
              )}
              {/* Nuevas imágenes seleccionadas (con opción de eliminar) */}
              {previewUrls.map((url, idx) => (
                <div key={url} className="imagen-item">
                  <img src={url} alt={`preview-${idx}`} className="imagen-preview" />
                  <button
                    type="button"
                    onClick={() => handleEliminarImagenNueva(idx)}
                    className="btn-quitar-imagen"
                  >
                    Quitar
                  </button>
                </div>
              ))}
            </div>
          </div>
          <div>
            <label>Video URL</label>
            <input
              name="videoUrl"
              type="url"
              value={formData.videoUrl || ''}
              onChange={handleChange}
            />
          </div>
          <div>
            <label>Plataformas</label>
            <div className="plataformas-list">
              {todasPlataformas.map(plataforma => (
                <label key={plataforma.id}>
                  <input
                    type="checkbox"
                    checked={formData.plataformas.some(p => p.id === plataforma.id)}
                    onChange={() => handlePlataformaCheckbox(plataforma)}
                  />
                  {plataforma.nombre}
                </label>
              ))}
            </div>
          </div>
          <div className="modal-buttons">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
            >
              ❌ Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
            >
              {loading ? 'Guardando...' : '💾 Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditarJuego;