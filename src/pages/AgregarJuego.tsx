import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; 
import axios from "axios";

const URL_BACKEND = import.meta.env.VITE_BACKEND_URL;

interface Imagen {
  url: string;
  descripcion: string;
}

interface Game {
  nombre: string;
  descripcion: string;
  precio: number;
  estaOferta: boolean;
  estado: boolean;
  categoriaId: number;
  imagenes: Imagen[];
  videoUrl: string;
  plataformas: number[];
  fechaLanzamiento?: string;
}

interface AgregarJuegoProps {
  onClose: () => void;
}

const AgregarJuego: React.FC<AgregarJuegoProps> = ({ onClose }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<Game>({
    nombre: "",
    descripcion: "",
    precio: 0,
    estaOferta: false,
    estado: true,
    categoriaId: 1,
    imagenes: [],
    videoUrl: "",
    plataformas: [],
  });

  const [imagenDescripcion, setImagenDescripcion] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [categorias, setCategorias] = useState<{ id: number; nombre: string }[]>([]);
  const [plataformasDisponibles, setPlataformasDisponibles] = useState<{
    id: number;
    nombre: string;
  }[]>([]);
  const [imagenFile, setImagenFile] = useState<File | null>(null);
  const [subiendoImagen, setSubiendoImagen] = useState(false);

  useEffect(() => {
    fetch(`${URL_BACKEND}api/categorias`)
      .then((res) => res.json())
      .then((data) => setCategorias(data));
    fetch(`${URL_BACKEND}api/plataformas`)
      .then((res) => res.json())
      .then((data) => setPlataformasDisponibles(data));
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? (e.target instanceof HTMLInputElement ? e.target.checked : false)
          : name === "precio" || name === "categoriaId"
          ? Number(value)
          : value,
    }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handlePlataformaChange = (id: number) => {
    setFormData((prev) => ({
      ...prev,
      plataformas: prev.plataformas.includes(id)
        ? prev.plataformas.filter((pid) => pid !== id)
        : [...prev.plataformas, id],
    }));
  };

  const handleRemoveImagen = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      imagenes: prev.imagenes.filter((_, idx) => idx !== index),
    }));
  };

  const handleEditImagen = (index: number) => {
    const imagen = formData.imagenes[index];
    setImagenDescripcion(imagen.descripcion);
    handleRemoveImagen(index);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.nombre.trim()) newErrors.nombre = "El nombre es requerido";
    if (!formData.descripcion.trim()) newErrors.descripcion = "La descripción es requerida";
    if (formData.precio <= 0) newErrors.precio = "El precio debe ser mayor a 0";
    if (!formData.categoriaId) newErrors.categoriaId = "La categoría es requerida";
    if (formData.imagenes.length === 0) newErrors.imagenes = "Agrega al menos una imagen";
    if (formData.plataformas.length === 0) newErrors.plataformas = "Selecciona al menos una plataforma";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        // Construir el objeto a enviar, asegurando que fechaLanzamiento esté presente
        const juegoData = {
          ...formData,
          fechaLanzamiento: formData.fechaLanzamiento || null,
        };
        const response = await fetch(`${URL_BACKEND}api/juegos`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(juegoData),
        });
        if (response.ok) {
          navigate("/adminjuegos");
        } else {
          const errorData = await response.json();
          alert("Error al agregar el juego: " + (errorData.message || "Error desconocido"));
        }
      } catch (error) {
        alert("Error de conexión con el servidor");
      }
    }
  };

  const handleImageUpload = async () => {
    if (!imagenFile) {
      setErrors((prev) => ({ ...prev, imagenUrl: "Selecciona una imagen" }));
      return;
    }
    setSubiendoImagen(true);
    try {
      const formData = new FormData();
      formData.append("image", imagenFile); // Añadir la imagen al FormData

      // Realizar la solicitud de subida de la imagen al servidor
      const res = await axios.post(`${URL_BACKEND}api/upload-image`, formData, {
        headers: { "Content-Type": "multipart/form-data" }, // Especifica que estamos enviando un archivo
      });

      if (res.status === 200) {
        const url = res.data.imageUrl; // Asumimos que el servidor responde con la URL de la imagen

        // Actualiza el estado con la nueva imagen
        setFormData((prev) => ({
          ...prev,
          imagenes: [...prev.imagenes, { url, descripcion: imagenDescripcion }],
        }));

        // Resetea los campos de la imagen
        setImagenDescripcion("");
        setImagenFile(null);
        setErrors((prev) => ({ ...prev, imagenUrl: "" }));
      } else {
        setErrors((prev) => ({ ...prev, imagenUrl: "Error al subir la imagen. Intenta nuevamente." }));
      }
    } catch (err) {
      // Manejamos el error si ocurre durante la solicitud
      console.error("Error al subir la imagen:", err);
      setErrors((prev) => ({ ...prev, imagenUrl: "Error al subir la imagen. Intenta nuevamente." }));
    } finally {
      // Independientemente de si hubo error o no, setSubiendoImagen a false
      setSubiendoImagen(false);
    }
  };

  const handleVolver = () => {
    onClose();
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <button className="close-btn" type="button" onClick={handleVolver}>
          ×
        </button>
        
        <h3>Agregar Nuevo Juego</h3>
        
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Nombre *</label>
              <input
                name="nombre"
                type="text"
                value={formData.nombre}
                onChange={handleChange}
                placeholder="Ingresa el nombre del juego"
              />
              {errors.nombre && <span className="error-message">{errors.nombre}</span>}
            </div>
            <div className="form-group">
              <label>Descripción *</label>
              <textarea
                name="descripcion"
                value={formData.descripcion}
                onChange={handleChange}
                placeholder="Describe el juego"
                required
                className="descripcion-input"
              />
              {errors.descripcion && <span className="error-message">{errors.descripcion}</span>}
            </div>
            <div className="form-group">
              <label>Precio ($) *</label>
              <input
                name="precio"
                type="number"
                min="0"
                step="0.01"
                value={formData.precio}
                onChange={handleChange}
                placeholder="0.00"
              />
              {errors.precio && <span className="error-message">{errors.precio}</span>}
            </div>
            <div className="form-group">
              <label>Fecha de lanzamiento *</label>
              <input
                name="fechaLanzamiento"
                type="date"
                value={formData.fechaLanzamiento || ""}
                onChange={handleChange}
              />
              {errors.fechaLanzamiento && <span className="error-message">{errors.fechaLanzamiento}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Categoría *</label>
              <select
                name="categoriaId"
                value={formData.categoriaId}
                onChange={handleChange}
              >
                {categorias.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.nombre}
                  </option>
                ))}
              </select>
              {errors.categoriaId && <span className="error-message">{errors.categoriaId}</span>}
            </div>

            <div className="form-group">
              <label>Estado</label>
              <select
                name="estado"
                value={formData.estado ? "true" : "false"}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    estado: e.target.value === "true",
                  }))
                }
              >
                <option value="true">Activo</option>
                <option value="false">Inactivo</option>
              </select>
            </div>
          </div>

          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                name="estaOferta"
                type="checkbox"
                checked={formData.estaOferta}
                onChange={handleChange}
              />
              <span className="checkmark"></span>
              ¿Está en oferta?
            </label>
          </div>

          <div className="form-group">
            <label>URL del Video (YouTube)</label>
            <input
              name="videoUrl"
              type="url"
              value={formData.videoUrl}
              onChange={handleChange}
              placeholder="https://youtube.com/watch?v=..."
            />
          </div>

          <div className="imagenes-section">
            <label>Imágenes *</label>
            
            <div className="image-input-container">
              <div className="image-input-group">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImagenFile(e.target.files?.[0] || null)}
                  className="file-input"
                />
                <input
                  type="text"
                  placeholder="Descripción de la imagen"
                  value={imagenDescripcion}
                  onChange={(e) => setImagenDescripcion(e.target.value)}
                  className="description-input"
                />
                <button
                  type="button"
                  onClick={handleImageUpload}
                  className="add-btn"
                  disabled={subiendoImagen}
                >
                  {subiendoImagen ? "Subiendo..." : "Agregar"}
                </button>
              </div>
              {errors.imagenUrl && <span className="error-message">{errors.imagenUrl}</span>}
            </div>

            {formData.imagenes.length > 0 && (
              <div className="imagenes-grid">
                {formData.imagenes.map((img, idx) => (
                  <div key={idx} className="imagen-item">
                    <img 
                      src={img.url} 
                      alt={img.descripcion || 'Imagen del juego'} 
                      className="imagen-preview"
                    />
                    <input
                      type="text"
                      value={img.descripcion}
                      onChange={(e) => {
                        const newImagenes = [...formData.imagenes];
                        newImagenes[idx].descripcion = e.target.value;
                        setFormData(prev => ({ ...prev, imagenes: newImagenes }));
                      }}
                      placeholder="Descripción"
                      className="imagen-descripcion-input"
                    />
                    <div className="imagen-actions">
                      <button
                        type="button"
                        onClick={() => handleRemoveImagen(idx)}
                        className="btn-quitar-imagen"
                      >
                        Quitar
                      </button>
                      <button
                        type="button"
                        onClick={() => handleEditImagen(idx)}
                        className="btn-editar-imagen"
                      >
                        Editar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {errors.imagenes && <span className="error-message">{errors.imagenes}</span>}
          </div>

          <div className="form-group">
            <label>Plataformas *</label>
            <div className="platforms-grid">
              {plataformasDisponibles.map((plat) => (
                <label key={plat.id} className="platform-checkbox">
                  <input
                    type="checkbox"
                    checked={formData.plataformas.includes(plat.id)}
                    onChange={() => handlePlataformaChange(plat.id)}
                  />
                  <span className="checkmark"></span>
                  {plat.nombre}
                </label>
              ))}
            </div>
            {errors.plataformas && <span className="error-message">{errors.plataformas}</span>}
          </div>

          <div className="modal-buttons">
            <button
              type="button"
              onClick={handleVolver}
            >
              Cancelar
            </button>
            <button type="submit">
              Agregar Juego
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AgregarJuego;
