import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Inicio.css';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase.ts';

const Inicio: React.FC = () => {
  const navigate = useNavigate();

  const bgStyle: React.CSSProperties = {
    backgroundImage: `linear-gradient(180deg, rgba(7,52,91,0.88) 0%, rgba(39,222,187,0.88) 100%), url(/cmf-profesionales.png)`,
    backgroundPosition: 'center',
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
    backgroundAttachment: 'fixed',
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (e) {
      console.error('Error al cerrar sesión', e);
    }
  };

  return (
    <div className="inicio-container" style={bgStyle}>
      <div className="inicio-card">
        {/* Barra superior con acciones principales */}
        <div className="top-bar">
          <button className="top-btn" onClick={() => navigate('/perfil')}>Mi perfil</button>
          <button className="top-btn outline" onClick={handleLogout}>Cerrar sesión</button>
        </div>

        {/* Logo centrado grande */}
        <div className="hero-logo">
          <img src="/Logo.png" alt="CMF Salud" className="hero-logo-image" />
          <div className="hero-logo-text">
            <span className="cmf">CMF</span>
            <span className="salud">SALUD</span>
          </div>
        </div>

        {/* Título principal */}
        <div className="main-title">
          <h1>TU SALUD ES NUESTRA PRIORIDAD</h1>
        </div>

        {/* Botones principales */}
        <div className="buttons-grid">
          <button 
            className="service-btn"
            onClick={() => navigate('/solicitud-receta')}
          >
            RECETAS
          </button>
          
          <button 
            className="service-btn"
            onClick={() => navigate('/turnos')}
          >
            TURNOS
          </button>
          
          <button 
            className="service-btn"
            onClick={() => navigate('/faq')}
          >
            AYUDA
          </button>
          
          <button 
            className="service-btn"
            onClick={() => navigate('/settings')}
          >
            CONFIGURACIÓN
          </button>
          
        </div>

      </div>
    </div>
  );
};

export default Inicio;
