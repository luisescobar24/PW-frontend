import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../estilos/EditarJuego.css';

type Imagen = {
  id: number;
  url: string;
  descripcion?: string;
};

type Noticia = {
  id: number;
  titulo: string;
  contenido: string;
  imagenes: Imagen[];
};

interface EditarNoticiaProps {
  noticia: Noticia;
  onSave: () => void;
}

const EditarNoticia: React.FC<EditarNoticiaProps> = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<Noticia | null>(null);
  const [loading, setLoading] = useState(true);
  const [imagenesFiles, setImagenesFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [imagenesAConservar, setImagenesAConservar] = useState<number[]>([]);

  useEffect(() => {
    fetch(`http://localhost:3000/api/noticias/${id}`)
      .then(res => res.json())
      .then(data => {
        setFormData(data);
        setImagenesAConservar(data.imagenes?.map((img: any) => img.id) || []);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!formData) return;
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImagenesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImagenesFiles([...imagenesFiles, ...Array.from(e.target.files)]);
    }
  };

  const handleConfirmarImagenes = () => {
    const nuevas = imagenesFiles.slice(previewUrls.length);
    const urls = nuevas.map(file => URL.createObjectURL(file));
    setPreviewUrls([...previewUrls, ...urls]);
  };

  const handleEliminarImagenExistente = (id: number) => {
    setImagenesAConservar(prev => prev.filter(imgId => imgId !== id));
    setFormData(prev => ({
      ...prev!,
      imagenes: prev!.imagenes.filter(img => img.id !== id),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;

    const form = new FormData();
    form.append('titulo', formData.titulo);
    form.append('contenido', formData.contenido);
    form.append('imagenesAConservar', JSON.stringify(imagenesAConservar));
    imagenesFiles.forEach(file => form.append('imagenes', file));

    await fetch(`http://localhost:3000/api/noticias/${formData.id}`, {
      method: 'PUT',
      body: form,
    });

    navigate('/adminnoticias');
  };

  if (loading || !formData) return <div className="modal-content">Cargando...</div>;

  return (
    <div className="modal">
      <div className="modal-content">
        <h3>Editar Noticia</h3>
        <form onSubmit={handleSubmit}>
          <div>
            <label>Título</label>
            <input name="titulo" value={formData.titulo} onChange={handleChange} required />
          </div>
          <div>
            <label>Contenido</label>
            <textarea name="contenido" value={formData.contenido} onChange={handleChange} required />
          </div>
          <div>
            <label>Imágenes</label>
            <input type="file" multiple onChange={handleImagenesChange} />
            <button type="button" onClick={handleConfirmarImagenes}>Confirmar Imágenes</button>
            <div>
              {formData.imagenes.map(img =>
                imagenesAConservar.includes(img.id!) ? (
                  <div key={img.id}>
                    <img src={img.url} alt={img.descripcion} className="imagen-preview" />
                    <button onClick={() => handleEliminarImagenExistente(img.id!)}>Eliminar</button>
                  </div>
                ) : null
              )}
              {previewUrls.map((url, i) => (
                <img key={i} src={url} className="imagen-preview" />
              ))}
            </div>
          </div>
          <div className="modal-buttons">
            <button type="button" onClick={() => navigate('/adminnoticias')}>Cancelar</button>
            <button type="submit">Guardar</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditarNoticia;
