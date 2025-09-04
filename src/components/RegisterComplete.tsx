import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase.ts';
import { useNavigate, Link } from 'react-router-dom';
import './Register.css';

const RegisterComplete: React.FC = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    dni: '',
    fechaNacimiento: '',
    telefono: '',
    cobertura: '',
    numeroAfiliado: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const coberturas = [
    'OSDE',
    'Swiss Medical',
    'Galeno',
    'Medicus',
    'IOMA',
    'PAMI',
    'Obra Social de Empleados de Comercio',
    'OSECAC',
    'OSPLAD',
    'OSPRERA',
    'Particular'
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.nombre || !formData.apellido || !formData.dni || !formData.fechaNacimiento || 
        !formData.telefono || !formData.cobertura || !formData.email || !formData.password) {
      setError('Todos los campos son obligatorios');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return false;
    }

    if (formData.password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres, una mayúscula, un número y un símbolo');
      return false;
    }

    // Validar formato de contraseña
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
    if (!passwordRegex.test(formData.password)) {
      setError('La contraseña debe tener al menos 8 caracteres, una mayúscula, un número y un símbolo');
      return false;
    }

    if (formData.dni.length < 7 || formData.dni.length > 8) {
      setError('El DNI debe tener 7 u 8 dígitos');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Crear usuario en Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      
      // Guardar datos adicionales en Firestore
      await setDoc(doc(db, 'usuarios', userCredential.user.uid), {
        nombre: formData.nombre,
        apellido: formData.apellido,
        dni: formData.dni,
        fechaNacimiento: formData.fechaNacimiento,
        telefono: formData.telefono,
        cobertura: formData.cobertura,
        numeroAfiliado: formData.numeroAfiliado,
        email: formData.email,
        fechaRegistro: new Date().toISOString(),
        activo: true
      });

      console.log('Usuario registrado:', userCredential.user.email);
      navigate('/solicitud-receta');
    } catch (error: any) {
      console.error('Error de registro:', error);
      let errorMessage = 'Error al crear la cuenta';
      
      switch (error.code) {
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
          errorMessage = error.message || 'Error desconocido';
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-box">
        <div className="register-header">
          <div className="medical-icon">👩‍⚕️</div>
          <h1>CMF Salud</h1>
          <h2>Únete a nuestra comunidad médica</h2>
          <p>Complete todos los campos para crear su cuenta</p>
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Nombre</label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleInputChange}
                required
                disabled={isLoading}
                placeholder="Ingrese su nombre"
              />
            </div>
            
            <div className="form-group">
              <label>Apellido</label>
              <input
                type="text"
                name="apellido"
                value={formData.apellido}
                onChange={handleInputChange}
                required
                disabled={isLoading}
                placeholder="Ingrese su apellido"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>DNI</label>
              <input
                type="text"
                name="dni"
                value={formData.dni}
                onChange={handleInputChange}
                required
                disabled={isLoading}
                placeholder="12345678"
                pattern="[0-9]{7,8}"
              />
            </div>
            
            <div className="form-group">
              <label>Fecha de Nacimiento</label>
              <input
                type="date"
                name="fechaNacimiento"
                value={formData.fechaNacimiento}
                onChange={handleInputChange}
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Número telefónico de contacto</label>
            <input
              type="tel"
              name="telefono"
              value={formData.telefono}
              onChange={handleInputChange}
              required
              disabled={isLoading}
              placeholder="+54 9 11 1234-5678"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Selecciona tu cobertura</label>
              <select
                name="cobertura"
                value={formData.cobertura}
                onChange={handleInputChange}
                required
                disabled={isLoading}
              >
                <option value="">Selecciona tu cobertura</option>
                {coberturas.map((cobertura) => (
                  <option key={cobertura} value={cobertura}>
                    {cobertura}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label>N° de afiliado</label>
              <input
                type="text"
                name="numeroAfiliado"
                value={formData.numeroAfiliado}
                onChange={handleInputChange}
                disabled={isLoading}
                placeholder="Número de afiliado (opcional)"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              disabled={isLoading}
              placeholder="ejemplo@email.com"
            />
          </div>

          <div className="form-group">
            <label>Contraseña</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              disabled={isLoading}
              placeholder="••••••••"
            />
          </div>

          <div className="form-group">
            <label>Confirmar Contraseña</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              required
              disabled={isLoading}
              placeholder="••••••••"
            />
          </div>

          <div className="password-requirements">
            <p>La contraseña debe tener al menos 8 caracteres, una mayúscula, un número y un símbolo.</p>
          </div>

          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Registrando...' : 'Crear Cuenta'}
          </button>
        </form>
        
        <div className="login-link">
          <p>
            ¿Ya tienes cuenta? <Link to="/login">Inicia sesión aquí</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterComplete;
