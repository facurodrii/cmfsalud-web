import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Login";
import Register from "./components/Register";
import SolicitudReceta from "./components/SolicitudReceta";
import Turnos from "./components/Turnos";
import Settings from "./components/Settings";
import FAQ from "./components/FAQ";

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/solicitud-receta" element={<SolicitudReceta />} />
          <Route path="/turnos" element={<Turnos />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/faq" element={<FAQ />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
