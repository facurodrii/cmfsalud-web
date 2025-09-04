import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase.ts';
import { doc, getDoc } from 'firebase/firestore';
import './Turnos.css';
import { API_BASE } from '../config.ts';

interface UserData {
  nombre: string;
  apellido: string;
  dni: string;
  fechaNacimiento: string;
  telefono: string;
  cobertura: string;
  numeroAfiliado: string;
  email: string;
}

const Turnos: React.FC = () => {
  const navigate = useNavigate();
  const [especialidad, setEspecialidad] = useState('');
  const [fechaPreferida, setFechaPreferida] = useState('');
  const [horarioPreferido, setHorarioPreferido] = useState('');
  const [comentarios, setComentarios] = useState('');
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    cargarDatosUsuario();
  }, []);

  const cargarDatosUsuario = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const snap = await getDoc(doc(db, 'users', user.uid));
        if (snap.exists()) {
          const d = snap.data() as any;
          const normalizado: UserData = {
            nombre: d?.nombre ?? d?.firstName ?? user.displayName?.split(' ')[0] ?? '',
            apellido: d?.apellido ?? d?.lastName ?? user.displayName?.split(' ').slice(1).join(' ') ?? '',
            dni: d?.dni ?? '',
            email: d?.email ?? user.email ?? '',
            telefono: d?.telefono ?? d?.phone ?? '',
            cobertura: d?.cobertura ?? '',
            numeroAfiliado: d?.numeroAfiliado ?? d?.afiliado ?? '',
            fechaNacimiento: d?.birthDate ?? '',
          } as UserData;
          setUserData(normalizado);
        }
      }
    } catch (error) {
      console.error('Error al cargar datos del usuario:', error);
    }
  };

  const especialidades = [
    'Medicina General',
    'Cardiología',
    'Dermatología',
    'Ginecología',
    'Neurología',
    'Oftalmología',
    'Pediatría',
    'Psiquiatría',
    'Traumatología',
    'Urología'
  ];

  const horariosDisponibles = [
    '08:00 - 10:00',
    '10:00 - 12:00',
    '14:00 - 16:00',
    '16:00 - 18:00',
    '18:00 - 20:00'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      const user = auth.currentUser;
      if (!user) {
        setMessage('Error: Usuario no autenticado');
        return;
      }

      if (!especialidad || !fechaPreferida || !horarioPreferido || !userData) {
        setMessage('Por favor, completa todos los campos obligatorios');
        return;
      }

      const payload = {
        nombrePaciente: userData.nombre,
        apellidoPaciente: userData.apellido,
        dniPaciente: userData.dni,
        emailPaciente: userData.email,
        telefonoPaciente: userData.telefono,
        obraSocial: userData.cobertura,
        nroAfiliado: userData.numeroAfiliado || '',
        tipoConsulta: especialidad,
        fechaPreferida,
        horarioPreferido,
        comentarios
      };

      const response = await fetch(`${API_BASE}/enviar-turno`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setMessage('Solicitud de turno enviada exitosamente. Te contactaremos pronto.');
        // Limpiar formulario
        setEspecialidad('');
        setFechaPreferida('');
        setHorarioPreferido('');
        setComentarios('');
      } else {
        setMessage('Error al enviar la solicitud de turno');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('Error al enviar la solicitud de turno');
    } finally {
      setIsLoading(false);
    }
  };

  // Autocerrar mensaje como en SolicitudReceta
  useEffect(() => {
    if (!message) return;
    const id = setTimeout(() => setMessage(''), 4000);
    return () => clearTimeout(id);
  }, [message]);

  return (
    <div
      className="solicitud-bg"
      style={{
        backgroundImage: 'linear-gradient(180deg, rgba(3,19,35,.7), rgba(4,58,102,.7)), url(/turnos.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        minHeight: '100vh',
        padding: 'env(safe-area-inset-top) 16px env(safe-area-inset-bottom)',
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}
    >
      {message && (
        <div className="alert-custom" role="status" aria-live="polite">
          {message}
        </div>
      )}

      <form className="solicitud-form" onSubmit={handleSubmit}>
        <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: 8 }}>
          <button type="button" className="solicitud-btn ghost" onClick={() => { if (window.history.length > 1) navigate(-1); else navigate('/inicio'); }}>← Volver</button>
        </div>
        <div className="title-row">
          <img src="/Logo.png" alt="CMF Salud" className="title-logo" />
          <h2 className="solicitud-title">SOLICITUD DE TURNO MEDICO</h2>
        </div>

        {userData && (
          <div className="user-info-compact">
            <span>{userData.nombre} {userData.apellido} · DNI {userData.dni}</span>
            <span>{userData.cobertura || 'Particular'}{userData.numeroAfiliado ? ` · Afiliado ${userData.numeroAfiliado}` : ''}</span>
          </div>
        )}

        <div className="solicitud-row">
          <select
            value={especialidad}
            onChange={(e) => setEspecialidad(e.target.value)}
            required
            disabled={isLoading}
            className="solicitud-input"
          >
            <option value="">Especialidad médica *</option>
            {especialidades.map((esp) => (
              <option key={esp} value={esp}>{esp}</option>
            ))}
          </select>
        </div>

        <div className="solicitud-row cols-3">
          <input
            type="date"
            value={fechaPreferida}
            onChange={(e) => setFechaPreferida(e.target.value)}
            required
            disabled={isLoading}
            min={new Date().toISOString().split('T')[0]}
            className="solicitud-input"
          />
          <select
            value={horarioPreferido}
            onChange={(e) => setHorarioPreferido(e.target.value)}
            required
            disabled={isLoading}
            className="solicitud-input"
          >
            <option value="">Horario preferido *</option>
            {horariosDisponibles.map((horario) => (
              <option key={horario} value={horario}>{horario}</option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Comentarios (opcional)"
            value={comentarios}
            onChange={(e) => setComentarios(e.target.value)}
            disabled={isLoading}
            className="solicitud-input"
          />
        </div>

        <p style={{ color: '#0a2a45', opacity: .8, marginBottom: 12, textAlign: 'center', fontWeight: 600 }}>
          Una vez enviada tu solicitud, nuestro equipo te contactará para confirmar disponibilidad y coordinar el turno.
        </p>

        <button type="submit" className="solicitud-btn" disabled={isLoading}>
          {isLoading ? 'Enviando solicitud...' : 'Solicitar turno'}
        </button>
      </form>
    </div>
  );
};

export default Turnos;