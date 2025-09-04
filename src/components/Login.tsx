import React, { useState } from 'react';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../firebase.ts';
import { useNavigate, Link } from 'react-router-dom';
import './Login.css';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setInfo('');

    try {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  console.log('Usuario logueado:', userCredential.user.email);
  navigate('/inicio');
    } catch (error: any) {
      console.error('Error de login:', error);
      let errorMessage = 'Error al iniciar sesión';
      
      // Manejo de errores específicos de Firebase
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'No existe una cuenta con este email';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Contraseña incorrecta';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Email inválido';
          break;
        case 'auth/user-disabled':
          errorMessage = 'Esta cuenta ha sido deshabilitada';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Demasiados intentos fallidos. Intenta más tarde';
          break;
        default:
          errorMessage = error.message || 'Error desconocido';
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.MouseEvent) => {
    e.preventDefault();
    setError('');
    setInfo('');
    try {
      if (!email) {
        setError('Ingresa tu email para recuperar la contraseña');
        return;
      }
      await sendPasswordResetEmail(auth, email);
      setInfo('Te enviamos un correo para restablecer tu contraseña');
    } catch (err: any) {
      const msg = err?.message || 'No se pudo enviar el correo de recuperación';
      setError(msg);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="logo">
          <img src="/Logo.png" alt="CMF Salud" className="logo-image" />
          <div className="logo-text">
            <span className="cmf">CMF</span>
            <span className="salud">SALUD</span>
          </div>
        </div>
        {error && <div className="error-message">{error}</div>}
        {info && <div className="info-message">{info}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
              placeholder="Ingresa tu usuario"
              autoComplete="username email"
              inputMode="email"
              enterKeyHint="next"
              aria-label="Email"
            />
          </div>
          
          <div className="form-group">
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
              placeholder="Ingresa tu contraseña"
              autoComplete="current-password"
              enterKeyHint="go"
              aria-label="Contraseña"
            />
          </div>
          
          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Iniciando…' : 'Iniciar sesión'}
          </button>
        </form>
        
        <div className="auth-links">
          <button type="button" onClick={handleForgotPassword} className="forgot-link" aria-label="Recuperar contraseña">
            ¿Olvidaste tu contraseña?
          </button>
          <Link to="/register" className="register-link brand-cta">Registrarse</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
