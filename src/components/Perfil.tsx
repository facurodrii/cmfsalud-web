import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase.ts';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { updatePassword } from 'firebase/auth';
import './SolicitudReceta.css';

interface PerfilForm {
  nombre: string;
  apellido: string;
  dni: string;
  telefono: string;
  email: string;
  cobertura: string;
  numeroAfiliado: string;
  emergenciaNombre?: string;
  emergenciaTelefono?: string;
}

const Perfil: React.FC = () => {
  const navigate = useNavigate();
  const [perfil, setPerfil] = useState<PerfilForm>({
    nombre: '', apellido: '', dni: '', telefono: '', email: '',
    cobertura: '', numeroAfiliado: '', emergenciaNombre: '', emergenciaTelefono: ''
  });
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // Cargar perfil desde Firestore
  useEffect(() => {
    const cargar = async () => {
      try {
        const u = auth.currentUser;
        if (!u) return;
        const snap = await getDoc(doc(db, 'users', u.uid));
        if (snap.exists()) {
          const d = snap.data() as any;
          setPerfil({
            nombre: d?.nombre ?? d?.firstName ?? '',
            apellido: d?.apellido ?? d?.lastName ?? '',
            dni: d?.dni ?? '',
            email: d?.email ?? u.email ?? '',
            telefono: d?.telefono ?? d?.phone ?? '',
            cobertura: d?.cobertura ?? '',
            numeroAfiliado: d?.numeroAfiliado ?? d?.afiliado ?? '',
            emergenciaNombre: d?.emergenciaNombre ?? '',
            emergenciaTelefono: d?.emergenciaTelefono ?? '',
          });
        } else {
          setPerfil(p => ({ ...p, email: u.email ?? '' }));
        }
      } catch (e) {
        console.error('Error cargando perfil', e);
      }
    };
    cargar();
  }, []);

  // Mensajes autodescartables
  useEffect(() => {
    if (!message) return;
    const id = setTimeout(() => setMessage(null), 4000);
    return () => clearTimeout(id);
  }, [message]);

  const savePerfil = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const u = auth.currentUser;
      if (!u) { setMessage('Usuario no autenticado'); return; }
      await setDoc(doc(db, 'users', u.uid), {
        nombre: perfil.nombre,
        apellido: perfil.apellido,
        dni: perfil.dni,
        email: perfil.email,
        telefono: perfil.telefono,
        cobertura: perfil.cobertura,
        numeroAfiliado: perfil.numeroAfiliado,
        emergenciaNombre: perfil.emergenciaNombre || '',
        emergenciaTelefono: perfil.emergenciaTelefono || '',
        updatedAt: new Date().toISOString(),
      }, { merge: true });
      setMessage('Perfil guardado');
    } catch (e: any) {
      setMessage('Error al guardar: ' + (e?.message || e));
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    if (newPassword !== confirmPassword) {
      setMessage('Las contraseñas no coinciden');
      setIsLoading(false);
      return;
    }
    if (newPassword.length < 6) {
      setMessage('La contraseña debe tener al menos 6 caracteres');
      setIsLoading(false);
      return;
    }
    try {
      const u = auth.currentUser;
      if (u) {
        await updatePassword(u, newPassword);
        setMessage('Contraseña actualizada');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (error: any) {
      setMessage('Error al cambiar la contraseña: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="solicitud-bg"
      style={{
        backgroundImage: 'linear-gradient(180deg, rgba(3,19,35,.7), rgba(4,58,102,.7)), url(/cmf-profesionales.png)',
        backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed',
        minHeight: '100vh', padding: 'env(safe-area-inset-top) 16px env(safe-area-inset-bottom)',
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}
    >
      {message && (
        <div className="alert-custom" role="status" aria-live="polite">{message}</div>
      )}

      <div className="solicitud-form">
        <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: 8 }}>
          <button type="button" className="solicitud-btn ghost" onClick={() => { if (window.history.length > 1) navigate(-1); else navigate('/inicio'); }}>← Volver</button>
        </div>
        <div className="title-row">
          <img src="/Logo.png" alt="CMF Salud" className="title-logo" />
          <h2 className="solicitud-title">MI PERFIL</h2>
        </div>
        <h3 className="section-subtitle">DATOS PERSONALES</h3>

        <form onSubmit={savePerfil}>
          <div className="solicitud-row cols-3">
            <label style={{display:'flex',flexDirection:'column',gap:6}}>
              <span className="form-label" style={{fontWeight:700}}>Nombre</span>
              <input className="solicitud-input" placeholder="Nombre" value={perfil.nombre} onChange={e=>setPerfil({...perfil, nombre:e.target.value})} />
            </label>
            <label style={{display:'flex',flexDirection:'column',gap:6}}>
              <span className="form-label" style={{fontWeight:700}}>Apellido</span>
              <input className="solicitud-input" placeholder="Apellido" value={perfil.apellido} onChange={e=>setPerfil({...perfil, apellido:e.target.value})} />
            </label>
            <label style={{display:'flex',flexDirection:'column',gap:6}}>
              <span className="form-label" style={{fontWeight:700}}>DNI</span>
              <input className="solicitud-input" placeholder="DNI" value={perfil.dni} onChange={e=>setPerfil({...perfil, dni:e.target.value})} />
            </label>
          </div>
          <div className="solicitud-row cols-3">
            <label style={{display:'flex',flexDirection:'column',gap:6}}>
              <span className="form-label" style={{fontWeight:700}}>Teléfono</span>
              <input className="solicitud-input" placeholder="Teléfono" value={perfil.telefono} onChange={e=>setPerfil({...perfil, telefono:e.target.value})} />
            </label>
            <label style={{display:'flex',flexDirection:'column',gap:6}}>
              <span className="form-label" style={{fontWeight:700}}>Email de contacto</span>
              <input className="solicitud-input" placeholder="Email de contacto" value={perfil.email} onChange={e=>setPerfil({...perfil, email:e.target.value})} />
            </label>
            <label style={{display:'flex',flexDirection:'column',gap:6}}>
              <span className="form-label" style={{fontWeight:700}}>Obra Social</span>
              <input className="solicitud-input" placeholder="Obra Social" value={perfil.cobertura} onChange={e=>setPerfil({...perfil, cobertura:e.target.value})} />
            </label>
          </div>
          <div className="solicitud-row cols-3">
            <label style={{display:'flex',flexDirection:'column',gap:6}}>
              <span className="form-label" style={{fontWeight:700}}>N° de carnet/afiliado</span>
              <input className="solicitud-input" placeholder="N° de carnet/afiliado" value={perfil.numeroAfiliado} onChange={e=>setPerfil({...perfil, numeroAfiliado:e.target.value})} />
            </label>
            <label style={{display:'flex',flexDirection:'column',gap:6}}>
              <span className="form-label" style={{fontWeight:700}}>Contacto de emergencia (nombre)</span>
              <input className="solicitud-input" placeholder="Contacto de emergencia (nombre)" value={perfil.emergenciaNombre} onChange={e=>setPerfil({...perfil, emergenciaNombre:e.target.value})} />
            </label>
            <label style={{display:'flex',flexDirection:'column',gap:6}}>
              <span className="form-label" style={{fontWeight:700}}>Teléfono de emergencia</span>
              <input className="solicitud-input" placeholder="Teléfono de emergencia" value={perfil.emergenciaTelefono} onChange={e=>setPerfil({...perfil, emergenciaTelefono:e.target.value})} />
            </label>
          </div>
          <button type="submit" className="solicitud-btn">Guardar perfil</button>
        </form>

        <h3 className="section-subtitle">SEGURIDAD</h3>
        <form onSubmit={handlePasswordChange}>
          <div className="solicitud-row cols-3">
            <input className="solicitud-input" type="password" placeholder="Nueva contraseña" value={newPassword} onChange={e=>setNewPassword(e.target.value)} required />
            <input className="solicitud-input" type="password" placeholder="Confirmar contraseña" value={confirmPassword} onChange={e=>setConfirmPassword(e.target.value)} required />
            <button type="submit" className="solicitud-btn" disabled={isLoading}>Cambiar contraseña</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Perfil;
