/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Usuario } from './types';
import LandingPage from './components/LandingPage';
import DocenteDashboard from './components/DocenteDashboard';
import CoordinadorDashboard from './components/CoordinadorDashboard';
import AcudienteDashboard from './components/AcudienteDashboard';
import { Users, ShieldAlert, LogOut, ArrowRightLeft } from 'lucide-react';
import { db } from './data';

export default function App() {
  const [currentUser, setCurrentUser] = useState<Usuario | null>(null);

  // Intentar cargar la sesión del usuario si existía en esta pestaña
  useEffect(() => {
    const savedSession = sessionStorage.getItem('ib_sesion_usuario');
    if (savedSession) {
      try {
        const user = JSON.parse(savedSession) as Usuario;
        // Refrescar datos actuales del usuario por si hubo cambios
        const dbUser = db.getUsuarios().find(u => u.id_usuario === user.id_usuario);
        if (dbUser) {
          setCurrentUser(dbUser);
        }
      } catch (e) {
        console.error('Error recuperando sesión', e);
      }
    }
  }, []);

  const handleLogin = (data: { tipo: 'personal'; credencial: string } | { tipo: 'acudiente'; documento: string; pin: string }) => {
    let user: Usuario | null = null;
    
    if (data.tipo === 'personal') {
      user = db.getUsuarios().find(u => u.id_usuario === data.credencial) || null;
    } else {
      user = db.loginAcudiente(data.documento, data.pin);
    }
    
    if (user) {
      user.ultimo_acceso = new Date().toISOString();
      db.addAuditLog(
        user.id_usuario,
        `${user.nombres} ${user.apellidos}`,
        user.rol_id,
        'Iniciar Sesión',
        'Usuarios',
        `Inicio de sesión exitoso en la plataforma utilizando el login ${data.tipo}.`,
        `190.248.0.1`,
        'Navegador Web'
      );

      setCurrentUser(user);
      sessionStorage.setItem('ib_sesion_usuario', JSON.stringify(user));
    } else {
      alert("Credenciales inválidas o no se encontró un usuario asociado.");
    }
  };

  const handleLogout = () => {
    if (currentUser) {
      db.addAuditLog(
        currentUser.id_usuario,
        `${currentUser.nombres} ${currentUser.apellidos}`,
        currentUser.rol_id,
        'Cerrar Sesión',
        'Usuarios',
        `El usuario cerró su sesión voluntariamente de la plataforma.`,
        '181.134.50.32',
        'Plataforma Escritorio'
      );
    }
    setCurrentUser(null);
    sessionStorage.removeItem('ib_sesion_usuario');
  };

  return (
    <div className="relative min-h-screen bg-slate-50 selection:bg-brand-100 selection:text-brand-905">
      
      {/* Dynamic Role routing */}
      {!currentUser ? (
        <LandingPage onLogin={handleLogin} />
      ) : (
        <>
          {currentUser.rol_id === 'coordinador' && (
            <CoordinadorDashboard usuario={currentUser} onLogout={handleLogout} />
          )}
          {currentUser.rol_id === 'docente' && (
            <DocenteDashboard usuario={currentUser} onLogout={handleLogout} />
          )}
          {currentUser.rol_id === 'acudiente' && (
            <AcudienteDashboard usuario={currentUser} onLogout={handleLogout} />
          )}
          {currentUser.rol_id === 'admin' && (
            <CoordinadorDashboard usuario={currentUser} onLogout={handleLogout} />
          )}

          {/* DYNAMIC BACKPORT SWITCHER FLOATER FOR ASSESSORS/DEVELOPERS */}
          <div className="fixed bottom-4 left-4 z-40 bg-slate-900 text-white p-3 rounded-xl shadow-xl border border-slate-750 flex items-center gap-3 text-xs max-w-sm hover:translate-y-[-2px] transition-all duration-200">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0 animate-ping"></div>
            <div>
              <p className="font-bold">Vista de Demostración</p>
              <p className="text-[10px] text-slate-400">Rol Activo: <span className="font-bold text-emerald-400 uppercase">{currentUser.rol_id}</span></p>
            </div>
            
            <button
              onClick={() => {
                // Alternar rápidamente entre acudiente y docente para ver notificaciones y firmas al instante
                const users = db.getUsuarios();
                const currentIdx = users.findIndex(u => u.id_usuario === currentUser.id_usuario);
                const nextIdx = (currentIdx + 1) % users.length;
                const nextUser = users[nextIdx];
                handleLogin({ tipo: 'personal', credencial: nextUser.id_usuario });
              }}
              className="bg-brand-800 hover:bg-brand-700 p-1.5 px-2 rounded-lg text-[9px] font-bold text-white transition-colors cursor-pointer flex items-center gap-1.5"
              title="Cambiar rápidamente a otra cuenta mock para probar el flujo de acuse de firma"
            >
              <ArrowRightLeft className="w-3 h-3" />
              Rotar Cuenta
            </button>
          </div>
        </>
      )}

    </div>
  );
}
