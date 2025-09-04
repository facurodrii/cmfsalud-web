import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Inicio.css';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase.ts';

const Inicio: React.FC = () => {
  const navigate = useNavigate();

  const bgStyle: React.CSSProperties = {
    backgroundImage: `linear-gradient(180deg, rgba(3,52,91,0.88) 0%, rgba(19,203,176,0.88) 100%), url(/cmf-profesionales.png)`,
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
        <div className="top-actions">
          <button
            className="icon-btn profile-btn"
            title="Mi Perfil"
            onClick={() => navigate('/perfil')}
          >
            👤
          </button>
          <button
            className="icon-btn logout-btn"
            title="Cerrar sesión"
            onClick={handleLogout}
          >
            ⏻
          </button>
        </div>
        <div className="logo-section">
          <div className="logo">
            <img src="/Logo.png" alt="CMF Salud" className="logo-image" />
            <div className="logo-text">
              <span className="cmf">CMF</span>
              <span className="salud">SALUD</span>
            </div>
          </div>
        </div>
        
        <div className="main-title">
          <h1>TU SALUD ES NUESTRA</h1>
          <h1>PRIORIDAD</h1>
        </div>
        
        <div className="description">
          <p>En CMF SALUD brindamos atención médica integral a pacientes de todas las edades.</p>
          <p>Contamos con un equipo de profesionales altamente calificados y una amplia gama de estudios médicos para garantizar diagnósticos precisos y tratamientos personalizados.</p>
        </div>
        
        <div className="buttons-grid">
          <button 
            className="service-btn recetas-btn"
            onClick={() => navigate('/solicitud-receta')}
          >
            RECETAS
          </button>
          
          <button 
            className="service-btn turnos-btn"
            onClick={() => navigate('/turnos')}
          >
            TURNOS
          </button>
          
          <button 
            className="service-btn ayuda-btn"
            onClick={() => navigate('/faq')}
          >
            AYUDA
          </button>
          
          <button 
            className="service-btn config-btn"
            onClick={() => navigate('/settings')}
          >
            CONFIGURACIÓN
          </button>
          
          {/* Eliminados botones de Contacto y Cerrar Sesión para dejar solo 4 */}
        </div>

      </div>
    </div>
  );
};

export default Inicio;
