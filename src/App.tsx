import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login.tsx";
import Register from "./components/Register.tsx";
import SolicitudReceta from "./components/SolicitudReceta.tsx";
import Turnos from "./components/Turnos.tsx";
import Settings from "./components/Settings.tsx";
import Perfil from "./components/Perfil.tsx";
import FAQ from "./components/FAQ.tsx";
import ProtectedRoute from "./components/ProtectedRoute.tsx";
import Inicio from "./components/Inicio.tsx";

function App() {
  return (
    <Router>
      <div className="App">
        {/** Aplicar preferencias globales al montar la app */}
        {(() => {
          // inline component to run an effect at top-level without extra wrapper
          const ApplyPrefs: React.FC = () => {
            const [voice, setVoice] = useState(localStorage.getItem('voiceAssist') === '1');
            // Sincroniza cambios de localStorage (navegación entre rutas y toggles)
            useEffect(() => {
              const onStorage = () => setVoice(localStorage.getItem('voiceAssist') === '1');
              const onFocus = () => onStorage();
              const onPref = () => onStorage();
              window.addEventListener('storage', onStorage);
              window.addEventListener('focus', onFocus);
              window.addEventListener('cmf-pref-change', onPref as any);
              return () => {
                window.removeEventListener('storage', onStorage);
                window.removeEventListener('focus', onFocus);
                window.removeEventListener('cmf-pref-change', onPref as any);
              };
            }, []);

            const speak = () => {
              const synth = (window as any).speechSynthesis; if (!synth) return;
              const el = document.querySelector('.solicitud-form, .inicio-card') || document.body;
              const text = (el as HTMLElement).innerText || 'Contenido';
              const utter = new (window as any).SpeechSynthesisUtterance(text);
              utter.lang = 'es-AR';
              synth.cancel();
              synth.speak(utter);
            };
            useEffect(() => {
              const apply = () => {
                const b = document.body;
                const textSize = localStorage.getItem('a11yTextSize') || '100';
                const contrastHigh = localStorage.getItem('a11yContrastHigh') === '1';
                const darkMode = localStorage.getItem('themeDark') === '1';
                b.classList.remove('a11y-text-100','a11y-text-115','a11y-text-130','a11y-text-150');
                b.classList.add(`a11y-text-${textSize}`);
                b.classList.toggle('a11y-contrast-high', contrastHigh);
                b.classList.toggle('theme-dark', darkMode);
                setVoice(localStorage.getItem('voiceAssist') === '1');
              };
              apply();
              window.addEventListener('storage', apply);
              return () => window.removeEventListener('storage', apply);
            }, []);
            return (
              voice ? (
                <button
                  aria-label="Asistencia de voz"
                  title="Leer esta página"
                  onClick={speak}
                  style={{
                    position:'fixed', bottom: 20, right: 20, zIndex: 2000,
                    borderRadius: '50%', width: 52, height: 52,
                    border: '2px solid #13c9f2', background: 'linear-gradient(135deg,#29E7B9,#13c9f2)',
                    color: '#032133', fontWeight: 900, boxShadow: '0 10px 24px rgba(0,0,0,.25)',
                    display:'flex', alignItems:'center', justifyContent:'center', padding:0
                  }}
                >
                  <span style={{fontSize: 28, lineHeight: 1}}>♿</span>
                </button>
              ) : null
            );
          };
          return <ApplyPrefs />;
        })()}
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route 
            path="/inicio" 
            element={
              <ProtectedRoute>
                <Inicio />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/solicitud-receta" 
            element={
              <ProtectedRoute>
                <SolicitudReceta />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/turnos" 
            element={
              <ProtectedRoute>
                <Turnos />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/settings" 
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/perfil" 
            element={
              <ProtectedRoute>
                <Perfil />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/faq" 
            element={
              <ProtectedRoute>
                <FAQ />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
