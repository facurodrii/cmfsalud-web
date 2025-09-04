import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase.ts';
import { doc, getDoc } from 'firebase/firestore';
import { API_BASE } from '../config.ts';
import './SolicitudReceta.css';

// Lista base de medicamentos (sin ordenar) y con 'Otro' al final
const MEDS_BASE = [
  'Aspirina','Ibuprofeno','Paracetamol','Amoxicilina','Omeprazol','Metformina',
  'Losartan','Atorvastatina','Levotiroxina','Enalapril','Simvastatina','Clonazepam',
  'Sertralina','Ranitidina','Azitromicina','Diclofenac','Prednisona','Salbutamol',
  'Furosemida','Insulina','Otro'
];
// Computar opciones ordenadas alfabéticamente dejando 'Otro' al final
const MEDS_OPTIONS = (() => {
  const items = MEDS_BASE.filter(n => n !== 'Otro').sort((a,b) => a.localeCompare(b));
  return [...items, 'Otro'];
})();

// Opciones de forma farmacéutica, con 'Otro' al final
const FORMA_OPTS = [
  'Comprimido', 'Tableta', 'Cápsula', 'Jarabe', 'Solución', 'Suspensión',
  'Crema', 'Ungüento', 'Gel', 'Gotas', 'Inyectable', 'Aerosol',
  'Supositorio', 'Parche', 'Otro'
];

interface Medicamento {
  nombreGenerico?: string;
  nombreComercial: string;
  nombreComercialOtro?: string;
  dosis: string;
  formaFarmaceutica: string;
  formaFarmaceuticaOtro?: string;
  requerimientoMensual: string;
}

interface UserData {
  nombre: string;
  apellido: string;
  dni: string;
  email: string;
  telefono?: string;
  cobertura?: string;
  numeroAfiliado?: string;
}

const SolicitudReceta: React.FC = () => {
  const navigate = useNavigate();
  const [meds, setMeds] = useState<Medicamento[]>([
  { nombreGenerico: '', nombreComercial: '', nombreComercialOtro: '', dosis: '', formaFarmaceutica: '', formaFarmaceuticaOtro: '', requerimientoMensual: '' }
  ]);
  const [observaciones, setObservaciones] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);

  useEffect(() => {
    const cargar = async () => {
      try {
        const u = auth.currentUser;
        if (!u) return;
        // Leer del perfil guardado por Register.tsx en la colección 'users'
        const snap = await getDoc(doc(db, 'users', u.uid));
        if (snap.exists()) {
          const d = snap.data() as any;
          // Normalizar claves: admitir tanto (nombre/apellido/telefono/numeroAfiliado) como (firstName/lastName/phone/afiliado)
          const normalizado: UserData = {
            nombre: d?.nombre ?? d?.firstName ?? u.displayName?.split(' ')[0] ?? '',
            apellido: d?.apellido ?? d?.lastName ?? u.displayName?.split(' ').slice(1).join(' ') ?? '',
            dni: d?.dni ?? '',
            email: d?.email ?? u.email ?? '',
            telefono: d?.telefono ?? d?.phone ?? '',
            cobertura: d?.cobertura ?? '',
            numeroAfiliado: d?.numeroAfiliado ?? d?.afiliado ?? '',
          };
          setUser(normalizado);
        }
      } catch (e) {
        console.error('Error cargando usuario', e);
      }
    };
    cargar();
  }, []);

  // Auto-cierre de alerta de éxito/error
  useEffect(() => {
    if (!msg) return;
    const id = setTimeout(() => setMsg(null), 4000);
    return () => clearTimeout(id);
  }, [msg]);

  const setMed = (i: number, field: keyof Medicamento, value: string) => {
    const next = [...meds];
    (next[i] as any)[field] = value;
    setMeds(next);
  };

  const addMed = () => setMeds([...meds, { nombreGenerico: '', nombreComercial: '', nombreComercialOtro: '', dosis: '', formaFarmaceutica: '', formaFarmaceuticaOtro: '', requerimientoMensual: '' }]);
  const removeMed = (i: number) => meds.length > 1 && setMeds(meds.filter((_, idx) => idx !== i));

  const ready = meds.every(m =>
    m.nombreComercial &&
    (m.nombreComercial !== 'Otro' || m.nombreComercialOtro) &&
    m.dosis &&
    m.formaFarmaceutica &&
    (m.formaFarmaceutica !== 'Otro' || (m.formaFarmaceuticaOtro && m.formaFarmaceuticaOtro.trim() !== '')) &&
    m.requerimientoMensual
  );

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ready) { setMsg('Por favor, completa todos los campos de cada medicamento.'); return; }
    setLoading(true);
    try {
      // Normalizar medicamentos: si "Otro", usar el texto ingresado
      const medicamentos = meds.map((m) => ({
        nombreGenerico: m.nombreGenerico || '',
        nombreComercial: m.nombreComercial === 'Otro' ? (m.nombreComercialOtro || '') : m.nombreComercial,
        dosis: m.dosis,
        formaFarmaceutica: m.formaFarmaceutica === 'Otro' ? (m.formaFarmaceuticaOtro || '') : m.formaFarmaceutica,
        requerimientoMensual: m.requerimientoMensual,
      }));

      const payload = {
        nombrePaciente: user?.nombre ?? '',
        apellidoPaciente: user?.apellido ?? '',
        dniPaciente: user?.dni ?? '',
        emailPaciente: user?.email ?? '',
        telefonoPaciente: user?.telefono ?? '',
        obraSocial: user?.cobertura ?? '',
  nroAfiliado: user?.numeroAfiliado || (user as any)?.afiliado || '', // coincide con backend
        medicamentos,
        observaciones,
      };

      const res = await fetch(`${API_BASE}/enviar-receta`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setMsg('Solicitud enviada correctamente. Pronto recibirás tu receta por correo.');
  setMeds([{ nombreGenerico: '', nombreComercial: '', nombreComercialOtro: '', dosis: '', formaFarmaceutica: '', formaFarmaceuticaOtro: '', requerimientoMensual: '' }]);
        setObservaciones('');
      } else {
        setMsg('Error al enviar la solicitud. Intenta nuevamente.');
      }
    } catch (err) {
      setMsg('Error de conexión. Intenta más tarde.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="solicitud-bg"
      style={{
        backgroundImage: 'linear-gradient(180deg, rgba(3,19,35,.7), rgba(4,58,102,.7)), url(/coberturas.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        minHeight: '100vh',
        padding: 'env(safe-area-inset-top) 16px env(safe-area-inset-bottom)',
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}
    >
      {msg && (
        <div className="alert-custom" role="status" aria-live="polite">
          {msg}
        </div>
      )}

      <form className="solicitud-form" onSubmit={onSubmit}>
        <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: 8 }}>
      <button
            type="button"
            className="solicitud-btn ghost"
            onClick={() => {
        if (window.history.length > 1) navigate(-1); else navigate('/inicio');
            }}
          >
            ← Volver
          </button>
        </div>
        <div className="title-row">
          <img src="/Logo.png" alt="CMF Salud" className="title-logo" />
          <h2 className="solicitud-title">SOLICITUD RECETA MEDICA</h2>
        </div>

        {user && (
          <div className="user-info-compact">
            <span>{user.nombre} {user.apellido} · DNI {user.dni}</span>
            <span>{user.cobertura || 'Particular'}{user.numeroAfiliado ? ` · Afiliado ${user.numeroAfiliado}` : ''}</span>
          </div>
        )}

        {meds.map((m, i) => (
          <div key={i} style={{ width: '100%' }}>
            <div className="solicitud-row">
              <select
                value={m.nombreComercial}
                onChange={(e) => setMed(i, 'nombreComercial', e.target.value)}
                required
                className="solicitud-input"
              >
                <option value="">Nombre comercial</option>
                {MEDS_OPTIONS.map(n => (
                  n === 'Otro'
                    ? <option key={n} value={n} className="option-other">— OTRO (especificar) —</option>
                    : <option key={n} value={n}>{n}</option>
                ))}
              </select>
              {m.nombreComercial === 'Otro' && (
                <input
                  type="text"
                  placeholder="Especifica el medicamento"
                  value={m.nombreComercialOtro}
                  onChange={(e) => setMed(i, 'nombreComercialOtro', e.target.value)}
                  required
                  className="solicitud-input"
                />
              )}
            </div>

            <div className="solicitud-row cols-4">
              <input
                type="text"
                placeholder="Nombre genérico (opcional)"
                value={m.nombreGenerico || ''}
                onChange={(e) => setMed(i, 'nombreGenerico', e.target.value)}
                className="solicitud-input"
              />
              <input
                type="text"
                placeholder="Dosis"
                value={m.dosis}
                onChange={(e) => setMed(i, 'dosis', e.target.value)}
                required
                className="solicitud-input"
              />
              <select
                value={m.formaFarmaceutica}
                onChange={(e) => setMed(i, 'formaFarmaceutica', e.target.value)}
                required
                className="solicitud-input"
              >
                <option value="">Forma farmacéutica</option>
                {FORMA_OPTS.filter(x => x !== 'Otro').map(x => (
                  <option key={x} value={x}>{x}</option>
                ))}
                <option value="Otro" className="option-other">— OTRO (especificar) —</option>
              </select>
              <input
                type="number"
                min={1}
                placeholder="Requerimiento mensual"
                value={m.requerimientoMensual}
                onChange={(e) => setMed(i, 'requerimientoMensual', e.target.value)}
                required
                className="solicitud-input"
              />
            </div>

            {m.formaFarmaceutica === 'Otro' && (
              <div className="solicitud-row">
                <input
                  type="text"
                  placeholder="Especifica la forma farmacéutica"
                  value={m.formaFarmaceuticaOtro || ''}
                  onChange={(e) => setMed(i, 'formaFarmaceuticaOtro', e.target.value)}
                  required
                  className="solicitud-input"
                />
              </div>
            )}

            {meds.length > 1 && (
              <div style={{ width: '100%', margin: '12px 0' }}>
                <hr className="solicitud-divider" />
              </div>
            )}

            {meds.length > 1 && (
              <div className="row-end">
                <button type="button" className="solicitud-btn ghost" onClick={() => removeMed(i)}>Quitar</button>
              </div>
            )}
          </div>
        ))}

  <button type="button" className="solicitud-btn secondary highlight" onClick={addMed}>+ Agregar medicamento</button>

        <div className="solicitud-row">
          <textarea
            placeholder="Observaciones (opcional)"
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
            className="solicitud-input"
            style={{ minHeight: 80, resize: 'vertical' }}
          />
        </div>

        <button type="submit" className="solicitud-btn" disabled={loading}>{loading ? 'Solicitando...' : 'Solicitar receta'}</button>
      </form>
    </div>
  );
};

export default SolicitudReceta;