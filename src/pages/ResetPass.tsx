import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../estilos/ResetPass.css';

const URL_BACKEND = import.meta.env.VITE_BACKEND_URL;

const ResetPass = () => {
  // Estados para los inputs
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmNewPass, setConfirmNewPass] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>(''); 
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [token, setToken] = useState<string | null>(null); // Guardar token de verificación
  const navigate = useNavigate();

  // Función para mostrar mensaje con tipo
  const showMessage = (text: string, type: 'success' | 'error' = 'success') => {
    setMessage(text);
    setMessageType(type);
  };

  // Función para manejar el submit del formulario
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (step === 1) {
      // Validar que el input sea un correo electrónico válido
      const isEmail = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/.test(email);
      if (!isEmail) {
        showMessage('Por favor, ingrese un correo electrónico válido.', 'error');
        return;
      }

      setLoading(true);
      setMessage('');
      setMessageType('');

      try {
        const response = await axios.post(`${URL_BACKEND}api/auth/forgot-password`, { 
          correo: email
        });

        showMessage(response.data.message, 'success');
        setStep(2);
      } catch (error: any) {
        console.error('Error al solicitar el código de verificación:', error);
        showMessage(error.response?.data.message || 'Error al solicitar el código de verificación', 'error');
      } finally {
        setLoading(false);
      }
    } else if (step === 2) {
      // Validar que se haya ingresado un código
      if (!verificationCode.trim()) {
        showMessage('Por favor, ingrese el código de verificación.', 'error');
        return;
      }

      setLoading(true);
      setMessage('');
      setMessageType('');

      try {
        console.log('Enviando datos al backend para validación del código:', { correo: email, verificationCode });

        const response = await axios.post(`${URL_BACKEND}api/auth/verify-code`, {
          correo: email,
          verificationCode,
        });

        if (response.data.success) {
          showMessage(response.data.message, 'success');
          setToken(response.data.token);  // Guardar el token en el estado
          setStep(3);
        } else {
          showMessage('El código de verificación no es válido o ha expirado.', 'error');
        }
      } catch (error: any) {
        console.error('Error al validar el código de verificación:', error);
        showMessage(error.response?.data.message || 'Error al validar el código', 'error');
      } finally {
        setLoading(false);
      }
    } else if (step === 3) {
      // Validar campos
      if (!newPass.trim()) {
        showMessage('Por favor, ingrese una nueva contraseña.', 'error');
        return;
      }
      if (!confirmNewPass.trim()) {
        showMessage('Por favor, confirme su nueva contraseña.', 'error');
        return;
      }

      if (newPass !== confirmNewPass) {
        showMessage('Las contraseñas no coinciden.', 'error');
        return;
      }

      if (newPass.length < 6) {
        showMessage('La contraseña debe tener al menos 6 caracteres.', 'error');
        return;
      }

      // Si el token no existe o ha expirado, evitar cambiar la contraseña
      if (!token) {
        showMessage('El token ha expirado. Solicita un nuevo código de verificación.', 'error');
        return;
      }

      setLoading(true);
      setMessage('');
      setMessageType('');

      try {
        const response = await axios.post(`${URL_BACKEND}api/auth/reset-password`, {
          correo: email,
          verificationCode,
          newPassword: newPass,
          confirmNewPassword: confirmNewPass,
        });

        showMessage(response.data.message, 'success');
        
        // Opcional: redirigir después de un tiempo
        setTimeout(() => {
          navigate('/');
        }, 3000);
      } catch (error: any) {
        console.error('Error al restablecer la contraseña:', error);
        showMessage(error.response?.data.message || 'Error al restablecer la contraseña', 'error');
      } finally {
        setLoading(false);
      }
    }
  };

  // Función para volver al paso anterior
  const goBackStep = () => {
    if (step > 1) {
      setStep(step - 1);
      setMessage('');
      setMessageType('');
    }
  };

  return (
    <div className="reset-pass-wrapper">
      <div className={`containerreset ${loading ? 'loading' : ''}`}>
        <button
          className="close-reset"
          onClick={() => navigate('/')}
          aria-label="Cerrar"
          type="button"
        >
          ×
        </button>

        <div className="logo">Nivel 100</div>
        <h2 className="reset-title">Restablece tu contraseña</h2>

        <div className="form-box">
          <form onSubmit={handleSubmit}>
            {step === 1 && (
              <div className="step-transition">
                <p>
                  Ingrese la dirección de correo electrónico de su cuenta de usuario 
                  y le enviaremos un código de verificación para restablecer su contraseña.
                </p>

                <label className="reset-label" htmlFor="email">
                  Correo electrónico
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="ejemplo@correo.com"
                  className="reset-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />

                <button 
                  type="submit" 
                  className="reset-btn" 
                  disabled={loading}
                >
                  {loading ? 'Enviando...' : 'Enviar código'}
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="step-transition">
                <p>
                  Hemos enviado un código de verificación a <strong>{email}</strong>. 
                  Revise su correo electrónico e ingrese el código a continuación.
                </p>

                <label className="reset-label" htmlFor="verificationCode">
                  Código de verificación
                </label>
                <input
                  id="verificationCode"
                  type="text"
                  placeholder="Ingrese el código de 6 dígitos"
                  className="reset-input"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  required
                  maxLength={6}
                  autoComplete="one-time-code"
                />

                <button 
                  type="submit" 
                  className="reset-btn" 
                  disabled={loading}
                >
                  {loading ? 'Validando...' : 'Validar código'}
                </button>

                <button 
                  type="button" 
                  className="reset-btn" 
                  onClick={goBackStep}
                  disabled={loading}
                  style={{ marginTop: '10px', background: 'rgba(255, 255, 255, 0.1)' }}
                >
                  Volver
                </button>
              </div>
            )}

            {step === 3 && (
              <div className="step-transition">
                <p>
                  Ingrese su nueva contraseña. Asegúrese de que sea segura y fácil de recordar.
                </p>

                <label className="reset-label" htmlFor="newPassword">
                  Nueva contraseña
                </label>
                <input
                  id="newPassword"
                  type="password"
                  placeholder="Nueva contraseña (mínimo 6 caracteres)"
                  className="reset-input"
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                  required
                  minLength={6}
                  autoComplete="new-password"
                  style={{ color: 'black' }}
                />

                <label className="reset-label" htmlFor="confirmPassword">
                  Confirmar contraseña
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirme su nueva contraseña"
                  className="reset-input"
                  value={confirmNewPass}
                  onChange={(e) => setConfirmNewPass(e.target.value)}
                  required
                  minLength={6}
                  autoComplete="new-password"
                  style={{ color: 'black' }}
                />

                <button 
                  type="submit" 
                  className="reset-btn" 
                  disabled={loading}
                >
                  {loading ? 'Cambiando...' : 'Cambiar contraseña'}
                </button>

                <button 
                  type="button" 
                  className="reset-btn" 
                  onClick={goBackStep}
                  disabled={loading}
                  style={{ marginTop: '10px', background: 'rgba(255, 255, 255, 0.1)' }}
                >
                  Volver
                </button>
              </div>
            )}
          </form>

          {message && (
            <div className={`reset-message ${messageType}`}>
              {message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPass;