import React, { useMemo, useState } from 'react';
import { createUserWithEmailAndPassword, sendEmailVerification, updateProfile } from 'firebase/auth';
import { auth, db } from '../firebase.ts';
import { useNavigate, Link } from 'react-router-dom';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import './Register.css';
import './SolicitudReceta.css';

type FormState = {
  firstName: string;
  lastName: string;
  dni: string;
  birthDate: string; // yyyy-mm-dd
  phone: string;
  cobertura: string;
  afiliado: string;
  email: string;
  password: string;
};

const OBRAS = [
  'OSDE',
  'Swiss Medical',
  'SanCor Salud',
  'IOMA',
  'PAMI',
  'Medifé',
  'OSPJN',
  'COMEI',
  'Caja de la Abogacía (PBA)',
  'SADAIC',
  'OPDEA',
  'DASUTeN',
  'Conferencia Episcopal Argentina',
  'Caja Notarial',
  'DASMI',
  'Jerárquicos Salud',
  'OSAPM',
  'Salud para Todos',
  'La Mutual',
  'Techint',
  'APSOT',
  'AMFFA Salud',
  'OSPEBA',
  'OSA (Actores)',
  'OSETYA',
  'MOA',
  'Caja de Seguridad Social',
  'Particular',
];

const Register: React.FC = () => {
  const [form, setForm] = useState<FormState>({
    firstName: '',
    lastName: '',
    dni: '',
    birthDate: '',
    phone: '',
    cobertura: '',
    afiliado: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const passwordStrong = useMemo(() => {
    const { password } = form;
    return (
      password.length >= 8 &&
      /[A-ZÁÉÍÓÚÑ]/.test(password) &&
      /\d/.test(password) &&
      /[^A-Za-z0-9]/.test(password)
    );
  }, [form.password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setInfo('');

    if (!passwordStrong) {
      setError('La contraseña debe tener al menos 8 caracteres, una mayúscula, un número y un símbolo.');
      return;
    }

    if (!form.firstName || !form.lastName || !form.dni || !form.birthDate || !form.phone || !form.cobertura || !form.email) {
      setError('Completá todos los campos requeridos');
      return;
    }

    if (form.cobertura !== 'Particular' && !form.afiliado) {
      setError('Ingresá tu N° de afiliado');
      return;
    }

    setIsLoading(true);

    try {
      const { user } = await createUserWithEmailAndPassword(auth, form.email, form.password);
      await updateProfile(user, { displayName: `${form.firstName} ${form.lastName}`.trim() });

      await setDoc(doc(db, 'users', user.uid), {
        firstName: form.firstName,
        lastName: form.lastName,
        dni: form.dni,
        birthDate: form.birthDate,
        phone: form.phone,
        cobertura: form.cobertura,
        afiliado: form.afiliado || null,
        email: form.email,
        createdAt: serverTimestamp(),
      });

      try { await sendEmailVerification(user); } catch {}

      setInfo('Cuenta creada. Te enviamos un email para verificar tu cuenta.');
      navigate('/login');
    } catch (error: any) {
      console.error('Error de registro:', error);
      let errorMessage = 'Error al crear la cuenta';
      switch (error?.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'Ya existe una cuenta con este email';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Email inválido';
          break;
        case 'auth/operation-not-allowed':
          errorMessage = 'Operación no permitida';
          break;
        case 'auth/weak-password':
          errorMessage = 'La contraseña es muy débil';
          break;
        default:
          errorMessage = error?.message || 'Error desconocido';
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-box">
        <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: 8 }}>
          <button
            type="button"
            className="solicitud-btn ghost"
            onClick={() => { if (window.history.length > 1) navigate(-1); else navigate('/login'); }}
          >
            ← Volver
          </button>
        </div>
        <h2 className="register-title">REGISTRO</h2>

        {error && <div className="error-message">{error}</div>}
        {info && <div className="info-message">{info}</div>}

        <form onSubmit={handleSubmit} className="register-form">
          <label className="field-label">Nombre
            <input name="firstName" value={form.firstName} onChange={onChange} placeholder="" disabled={isLoading} autoComplete="given-name" enterKeyHint="next" />
          </label>

          <label className="field-label">Apellido
            <input name="lastName" value={form.lastName} onChange={onChange} placeholder="" disabled={isLoading} autoComplete="family-name" enterKeyHint="next" />
          </label>

          <label className="field-label">DNI
            <input name="dni" value={form.dni} onChange={onChange} placeholder="" inputMode="numeric" autoComplete="off" disabled={isLoading} enterKeyHint="next" />
          </label>

          <label className="field-label">Fecha de nacimiento
            <input name="birthDate" type="date" value={form.birthDate} onChange={onChange} placeholder="dd/mm/aaaa" autoComplete="bday" disabled={isLoading} enterKeyHint="next" />
          </label>

          <label className="field-label">Número telefónico de contacto
            <input name="phone" value={form.phone} onChange={onChange} placeholder="" inputMode="tel" autoComplete="tel" disabled={isLoading} enterKeyHint="next" />
          </label>

          <label className="field-label">Cobertura
            <select name="cobertura" value={form.cobertura} onChange={onChange} disabled={isLoading} aria-label="Cobertura" >
              <option value="" disabled>Selecciona tu cobertura</option>
              {OBRAS.map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
          </label>

          <label className="field-label">N° de afiliado
            <input name="afiliado" value={form.afiliado} onChange={onChange} placeholder="" disabled={isLoading || form.cobertura === ''} autoComplete="off" enterKeyHint="next" />
          </label>

          <label className="field-label">Email
            <input name="email" type="email" value={form.email} onChange={onChange} placeholder="" disabled={isLoading} autoComplete="email" inputMode="email" enterKeyHint="next" />
          </label>

          <label className="field-label">Contraseña
            <input name="password" type="password" value={form.password} onChange={onChange} placeholder="" disabled={isLoading} autoComplete="new-password" enterKeyHint="done" />
          </label>

          <div className="password-hint">La contraseña debe tener al menos 8 caracteres, una mayúscula, un número y un símbolo.</div>

          <button type="submit" disabled={isLoading || !passwordStrong}>
            {isLoading ? 'Registrando…' : 'Registrarse'}
          </button>
        </form>

  <p className="login-link">¿Ya tienes cuenta? <Link to="/login" className="brand-cta">Iniciar sesión</Link></p>
      </div>
    </div>
  );
};

export default Register;
