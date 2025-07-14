import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios, { AxiosError } from 'axios';  
import '../estilos/SignIn.css';

const URL_BACKEND = import.meta.env.VITE_BACKEND_URL;

const SignIn = () => {
  const navigate = useNavigate();

  // States for controlled inputs
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);  // Loading state for login

  // Function for login
  const handleSignIn = async () => {
    setLoading(true);  // Start loading when attempting to log in
    try {
      // Send POST request to backend
      const response = await axios.post(`${URL_BACKEND}api/auth/login`, { correo: username, password });

      if (response.data.success) {
        // Guardar datos de usuario en localStorage
        if (response.data.user) {
          localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        navigate('/paginaprincipal');  // Redirect to main page after login
      }
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        alert(error.response?.data.message || 'Incorrect username or password');
      } else {
        alert('An unexpected error occurred.');
      }
    } finally {
      setLoading(false);  // End loading
    }
  };

  const handleNavigateToSignUp = () => {
    navigate('/signup');
  };

  // Function to navigate to Reset Password page
  const handleNavigateToResetPassword = () => {
    navigate('/resetpass');
  };

  return (
    <div className="signin-wrapper">
      <div className="container-signin">
        <div className="logo">Nivel 100</div>

        <h2 className="signin-title">Sign in</h2>

        <div className="form-box">
          <label htmlFor="username">Usuario</label>
          <input
            id="username"
            type="text"
            className="signin-input"
            placeholder="Ingresar usuario"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <label htmlFor="password">Contraseña</label>
          <input
            id="password"
            type="password"
            className="signin-input"
            placeholder="Ingresar contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <div className="signin-link">
            <span
              style={{ color: '#007bff', cursor: 'pointer' }}
              onClick={handleNavigateToResetPassword}  // Navigate to ResetPass.tsx
            >
              Olvidaste tu contraseña?
            </span>
          </div>

          <button className="signin-btn" onClick={handleSignIn} disabled={loading}>
            {loading ? 'Cargando...' : 'Sign in'}
          </button>

          <div className="signin-bottom-text">
            No tienes cuenta?{' '}
            <span
              className="signup-link"
              onClick={handleNavigateToSignUp}
              style={{ cursor: 'pointer', color: '#007bff' }}
            >
              Crear cuenta
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
