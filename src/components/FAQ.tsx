import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './FAQ.css';

interface FAQItem {
  question: string;
  answer: string;
}

const FAQ: React.FC = () => {
  const navigate = useNavigate();
  const [openItems, setOpenItems] = useState<number[]>([]);
  const [msg, setMsg] = useState<string | null>(null);

  const faqData: FAQItem[] = [
    {
      question: "¿Cómo puedo solicitar una receta médica?",
      answer: "Para solicitar una receta, inicia sesión en tu cuenta, ve a 'Solicitar Receta', completa el formulario con tus datos de contacto y selecciona los medicamentos que necesitas. Nuestro equipo procesará tu solicitud y te contactará para coordinar la entrega."
    },
    {
      question: "¿Cuánto tiempo demora la entrega de medicamentos?",
      answer: "El tiempo de entrega depende de tu ubicación y disponibilidad de los medicamentos. Generalmente, las entregas se realizan dentro de las 24-48 horas hábiles después de procesar tu solicitud."
    },
    {
      question: "¿Qué métodos de pago aceptan?",
      answer: "Aceptamos efectivo, tarjetas de débito y crédito, y transferencias bancarias. El pago se realiza al momento de la entrega de los medicamentos."
    },
    {
      question: "¿Cómo solicito un turno médico?",
      answer: "Ve a la sección 'Solicitar Turno', selecciona la especialidad médica que necesitas, tu fecha y horario preferido, y completa el formulario. Nuestro equipo se contactará contigo para confirmar la disponibilidad."
    },
    {
      question: "¿Trabajan con obra social?",
      answer: "Sí, trabajamos con las principales obras sociales del país incluyendo OSDE, Swiss Medical, Galeno, Medicus, IOMA, PAMI y muchas otras. También atendemos pacientes particulares."
    },
    {
      question: "¿Puedo modificar o cancelar mi solicitud?",
      answer: "Sí, puedes modificar o cancelar tu solicitud contactándote con nuestro equipo de atención al cliente antes de que sea procesada. Una vez que los medicamentos estén en camino, la modificación puede no ser posible."
    },
    {
      question: "¿Qué hago si tengo problemas con mi cuenta?",
      answer: "Si tienes problemas para acceder a tu cuenta o necesitas cambiar tu contraseña, ve a la sección 'Configuración'. Si el problema persiste, contacta a nuestro soporte técnico."
    },
    {
      question: "¿Los medicamentos requieren receta médica?",
      answer: "Algunos medicamentos requieren receta médica válida. Nuestro equipo verificará la documentación necesaria antes de procesar tu solicitud. Si no tienes receta, podemos ayudarte a coordinar una consulta médica."
    },
    {
      question: "¿Realizan entregas los fines de semana?",
      answer: "Realizamos entregas de lunes a viernes en horario comercial. Para urgencias durante fines de semana, contamos con un servicio especial - contacta a nuestro número de emergencia."
    },
  // último item removido a pedido
  ];

  const toggleItem = (index: number) => {
    setOpenItems(prev => 
      prev.includes(index) 
        ? prev.filter(item => item !== index)
        : [...prev, index]
    );
  };

  // Autocierre de mensajes si se usan en el futuro
  useEffect(() => {
    if (!msg) return;
    const id = setTimeout(() => setMsg(null), 4000);
    return () => clearTimeout(id);
  }, [msg]);

  return (
    <div
      className="solicitud-bg"
      style={{
        backgroundImage: 'linear-gradient(180deg, rgba(3,19,35,.7), rgba(4,58,102,.7)), url(/faqs.png), url(/ayuda.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        minHeight: '100vh',
        padding: 'env(safe-area-inset-top) 16px env(safe-area-inset-bottom)',
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}
    >
      {msg && (
        <div className="alert-custom" role="status" aria-live="polite">{msg}</div>
      )}

      <div className="solicitud-form faq-form">
        <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: 8 }}>
          <button type="button" className="solicitud-btn ghost" onClick={() => { if (window.history.length > 1) navigate(-1); else navigate('/inicio'); }}>← Volver</button>
        </div>
        <div className="title-row">
          <img src="/Logo.png" alt="CMF Salud" className="title-logo" />
          <h2 className="solicitud-title">AYUDA Y PREGUNTAS FRECUENTES</h2>
        </div>

        <p className="faq-intro">Encuentra respuestas a las preguntas más comunes sobre nuestros servicios. Si no encuentras lo que buscas, contáctanos.</p>

        <h3 className="section-title">Conocé Nuestras Vías de Comunicación</h3>
        <div className="contact-cards">
          <div className="contact-card">
            <div className="contact-icon">📧</div>
            <div>
              <div className="contact-title">Escribinos</div>
              <div className="contact-text">consultas@cmfsalud.com</div>
            </div>
          </div>
          <div className="contact-card">
            <div className="contact-icon"></div>
            <div>
              <div className="contact-title">Visitanos</div>
              <div className="contact-text">Macedonio Fernández 879 · El Palomar</div>
            </div>
          </div>
        </div>

        <div className="map-embed">
          <iframe
            title="Ubicación CMF Salud"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            src="https://www.google.com/maps?q=Macedonio%20Fern%C3%A1ndez%20879,%20El%20Palomar&output=embed"
          ></iframe>
        </div>

  <div className="faq-list">
          {faqData.map((item, index) => (
            <div key={index} className="faq-item">
              <button
                type="button"
                className="faq-question"
                onClick={() => toggleItem(index)}
                aria-expanded={openItems.includes(index)}
              >
    <span className="faq-q-text">{item.question}</span>
                <span className={`faq-icon ${openItems.includes(index) ? 'open' : ''}`}>▼</span>
              </button>
              {openItems.includes(index) && (
                <div className="faq-answer">
                  <p>{item.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FAQ;
