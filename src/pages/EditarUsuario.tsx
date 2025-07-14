import React, { useState } from 'react';
import '../estilos/PaginaPrincipal.css';

const EditarUsuario: React.FC<{ onClose?: () => void }> = ({ onClose }) => {
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [mensaje, setMensaje] = useState('');

  const handleGuardar = () => {
    // Aquí iría la lógica para guardar los cambios del usuario
    setMensaje('¡Perfil actualizado correctamente!');
    setTimeout(() => {
      setMensaje('');
      if (onClose) onClose();
    }, 2000);
  };

  return (
    <div className="modal" style={{ zIndex: 2000 }}>
      <div className="modal-content" style={{ maxWidth: 400 }}>
        <button className="close-btn" onClick={onClose} style={{ float: 'right', fontSize: 24 }}>×</button>
        <h2>Editar Perfil</h2>
        <label>Nombre:</label>
        <input type="text" value={nombre} onChange={e => setNombre(e.target.value)} />
        <label>Correo:</label>
        <input type="email" value={correo} onChange={e => setCorreo(e.target.value)} />
        <button className="boton-confirmar" onClick={handleGuardar}>Guardar Cambios</button>
        {mensaje && <div className="mensaje-temporal success">{mensaje}</div>}
      </div>
    </div>
  );
};

export default EditarUsuario;
