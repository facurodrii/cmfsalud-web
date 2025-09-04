import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase.ts';
import './Settings.css';

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [textSize, setTextSize] = useState<string>('100');
  const [contrastHigh, setContrastHigh] = useState<boolean>(false);
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [voiceAssist, setVoiceAssist] = useState<boolean>(false);

  const user = auth.currentUser;

  // Cargar preferencias de accesibilidad
  useEffect(() => {
  setTextSize(localStorage.getItem('a11yTextSize') || '100');
    setContrastHigh(localStorage.getItem('a11yContrastHigh') === '1');
    setDarkMode(localStorage.getItem('themeDark') === '1');
    setVoiceAssist(localStorage.getItem('voiceAssist') === '1');
  }, []);

  // Aplicar clases al cuerpo
  useEffect(() => {
    const b = document.body;
    b.classList.remove('a11y-text-100','a11y-text-115','a11y-text-130','a11y-text-150');
    b.classList.add(`a11y-text-${textSize}`);
    b.classList.toggle('a11y-contrast-high', contrastHigh);
    b.classList.toggle('theme-dark', darkMode);
    localStorage.setItem('a11yTextSize', textSize);
    localStorage.setItem('a11yContrastHigh', contrastHigh ? '1' : '0');
    localStorage.setItem('themeDark', darkMode ? '1' : '0');
  }, [textSize, contrastHigh, darkMode]);

  // Mensajes autodescarta
  useEffect(() => {
    if (!message) return;
    const id = setTimeout(() => setMessage(null), 4000);
    return () => clearTimeout(id);
  }, [message]);


  // Voice Assistance
  const speak = () => {
    if (typeof window === 'undefined') return;
    // Asegura que el botón flotante se muestre y acompañe navegación
    if (!voiceAssist) {
      setVoiceAssist(true);
      localStorage.setItem('voiceAssist', '1');
      window.dispatchEvent(new Event('cmf-pref-change'));
    }
    const synth = (window as any).speechSynthesis;
    if (!synth) return;
    const el = document.querySelector('.solicitud-form');
    const text = el ? (el as HTMLElement).innerText : 'Configuración de usuario';
    const utter = new (window as any).SpeechSynthesisUtterance(text);
    utter.lang = 'es-AR';
    synth.cancel();
    synth.speak(utter);
  };
  const stopSpeak = () => {
    const synth = (window as any).speechSynthesis; if (synth) synth.cancel();
  };

  return (
    <div
      className="solicitud-bg"
      style={{
        backgroundImage: 'linear-gradient(180deg, rgba(3,19,35,.7), rgba(4,58,102,.7)), url(/configuracion.png)',
        backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed',
        minHeight: '100vh', padding: 'env(safe-area-inset-top) 16px env(safe-area-inset-bottom)',
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}
    >
      {message && (
        <div className="alert-custom" role="status" aria-live="polite">{message}</div>
      )}

      <div className="solicitud-form settings-form">
        <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: 8 }}>
          <button type="button" className="solicitud-btn ghost" onClick={() => { if (window.history.length > 1) navigate(-1); else navigate('/inicio'); }}>← Volver</button>
        </div>
        <div className="title-row">
          <img src="/Logo.png" alt="CMF Salud" className="title-logo" />
          <h2 className="solicitud-title">CONFIGURACIÓN</h2>
        </div>
        <h3 className="section-subtitle">ACCESIBILIDAD</h3>
        <div className="toggle-grid">
          <label className="toggle-item">
            Tamaño de texto
            <select
              value={textSize}
              onChange={e=>{ const v=e.target.value; setTextSize(v); localStorage.setItem('a11yTextSize', v); document.body.classList.remove('a11y-text-100','a11y-text-115','a11y-text-130','a11y-text-150'); document.body.classList.add(`a11y-text-${v}`); }}
              className="solicitud-input"
              style={{marginTop:8}}
            >
              <option value="100">Normal</option>
              <option value="115">Grande</option>
              <option value="130">Muy grande</option>
              <option value="150">Extra grande</option>
            </select>
          </label>
          <label className="toggle-item"><input type="checkbox" checked={contrastHigh} onChange={e=>{setContrastHigh(e.target.checked); localStorage.setItem('a11yContrastHigh', e.target.checked ? '1' : '0'); document.body.classList.toggle('a11y-contrast-high', e.target.checked); }} /> Alto contraste</label>
          <label className="toggle-item"><input type="checkbox" checked={darkMode} onChange={e=>{setDarkMode(e.target.checked); localStorage.setItem('themeDark', e.target.checked ? '1' : '0'); document.body.classList.toggle('theme-dark', e.target.checked); }} /> Modo oscuro</label>
          <label className="toggle-item"><input type="checkbox" checked={voiceAssist} onChange={e=>{setVoiceAssist(e.target.checked); localStorage.setItem('voiceAssist', e.target.checked ? '1' : '0'); window.dispatchEvent(new Event('cmf-pref-change')); if (!e.target.checked) stopSpeak();}} /> Asistencia de voz</label>
        </div>
        {voiceAssist && (
          <div className="row-end" style={{gap:8, marginBottom: 10}}>
            <button type="button" className="solicitud-btn secondary" onClick={speak}>Leer esta página</button>
            <button type="button" className="solicitud-btn ghost" onClick={stopSpeak}>Detener</button>
          </div>
        )}

      </div>
    </div>
  );
};

export default Settings;
