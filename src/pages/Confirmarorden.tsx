import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import "../estilos/ConfirmarOrden.css";

const URL_BACKEND = import.meta.env.VITE_BACKEND_URL;

interface ItemCarrito {
  id: number;
  nombre: string;
  precio: number;
  cantidad: number;
  imagenes?: { url: string }[];
}

const ConfirmarOrden: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { carrito, total } = location.state || {};

  const [purchaseCompleted, setPurchaseCompleted] = useState(false);

  // Estados para los campos del formulario
  const [fullName, setFullName] = useState('');
  const [address, setAddress] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cvc, setCvc] = useState('');
  const [expirationDate, setExpirationDate] = useState('');

  const handleProceed = async () => {
    if (!carrito || carrito.length === 0) {
      alert('Tu carrito está vacío');
      return;
    }

    // Validación simple para asegurar que los campos del formulario estén llenos
    if (!fullName || !address || !cardNumber || !cvc || !expirationDate) {
      alert('Por favor, completa todos los campos del formulario');
      return;
    }

// Prepara los datos para enviar al backend
const ventas = carrito.map((item: ItemCarrito) => ({
  usuarioid: 1,  // Suponiendo que el usuario está autenticado, puedes cambiarlo por el ID real
  juegoid: item.id,
  monto_pagado: item.precio * item.cantidad,
  fecha: new Date().toISOString(), // Esto asegura que la fecha esté en formato ISO 8601
  datos_cliente: {
    nombre: fullName,
    direccion: address,
    tarjeta: cardNumber,
    cvc,
    expiracion: expirationDate
  }
}));


    try {
      // Realizar el POST al backend para registrar las ventas
      const response = await fetch(`${URL_BACKEND}/api/ventas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ventas })  // Envío de los datos al backend
      });

      if (response.ok) {
        setPurchaseCompleted(true);
        localStorage.removeItem('carrito');  // Vaciar el carrito después de la compra exitosa
      } else {
        const errorData = await response.json();
        alert(`Error al registrar la venta: ${errorData.message}`);
      }
    } catch (error) {
      alert('Error de conexión con el servidor');
    }
  };

  const totalJuegos = carrito ? carrito.reduce((acc: number, item: ItemCarrito) => acc + item.cantidad, 0) : 0;

  return (
    <div id="order-modal" className="modal">
      <div className="modal-content">
        <span
          id="close-modal"
          className="close"
          onClick={() => {
            setPurchaseCompleted(false);
            if (carrito) {
              localStorage.setItem('carrito', JSON.stringify(carrito));
            }
            navigate('/paginaprincipal');
          }}
        >
          X
        </span>

        {!purchaseCompleted ? (
          <>
            <h2>Confirmar Orden</h2>
            <div className="order-summary">
              <h3>Resumen de Compra</h3>
              <ul>
                {carrito && carrito.length > 0 ? (
                  carrito.map((item: ItemCarrito) => (
                    <li key={item.id}>
                      <span>{item.nombre}</span>
                      <span> x{item.cantidad}</span>
                      <span> ${ (item.precio * item.cantidad).toFixed(2) }</span>
                    </li>
                  ))
                ) : (
                  <li>El carrito está vacío.</li>
                )}
              </ul>
              <p>
                <strong>Total: </strong>${total ? total.toFixed(2) : '0.00'}
              </p>
              <p>
                <strong>Cantidad de juegos: </strong>{totalJuegos}
              </p>
            </div>
            <div className="order-form">
              <label htmlFor="full-name">Nombre Completo:</label>
              <input
                type="text"
                id="full-name"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                required
              />
              <label htmlFor="address">Dirección:</label>
              <input
                type="text"
                id="address"
                value={address}
                onChange={e => setAddress(e.target.value)}
                required
              />
              <label htmlFor="card-number">Número de Tarjeta:</label>
              <input
                type="text"
                id="card-number"
                value={cardNumber}
                onChange={e => setCardNumber(e.target.value)}
                required
              />
              <label htmlFor="cvc">CVC:</label>
              <input
                type="text"
                id="cvc"
                value={cvc}
                onChange={e => setCvc(e.target.value)}
                required
              />
              <label htmlFor="expiration-date">Fecha de Expiración:</label>
              <input
                type="text"
                id="expiration-date"
                value={expirationDate}
                onChange={e => setExpirationDate(e.target.value)}
                required
              />
              <button id="proceed" onClick={handleProceed}>
                Proceder
              </button>
            </div>
          </>
        ) : (
          <div className="purchase-success">
            <div className="checkmark">✔</div>
            <h2>¡Compra completada con éxito!</h2>
            <p>Los códigos de los juegos comprados han sido enviados a tu correo.</p>
            <button onClick={() => navigate('/paginaprincipal')}>Volver al inicio</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConfirmarOrden;