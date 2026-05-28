/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Shield, BookOpen, Clock, AlertTriangle, ChevronRight, UserCheck, Smartphone, Users } from 'lucide-react';
import { Usuario } from '../types';
import { db } from '../data';

interface LandingPageProps {
  onLogin: (usuario: Usuario) => void;
}

export default function LandingPage({ onLogin }: LandingPageProps) {
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [showDemoLogins, setShowDemoLogins] = useState(true);

  const usuarios = db.getUsuarios();

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) {
      setErrorMsg('Por favor seleccione un usuario para ingresar.');
      return;
    }
    const user = usuarios.find(u => u.id_usuario === selectedUser);
    if (user) {
      // Actulizar ultimo acceso
      user.ultimo_acceso = new Date().toISOString();
      db.addAuditLog(
        user.id_usuario,
        `${user.nombres} ${user.apellidos}`,
        user.rol_id,
        'Iniciar Sesión',
        'Usuarios',
        `Inicio de sesión exitoso en la plataforma utilizando el login rápido.`,
        `190.248.${Math.floor(10 + Math.random() * 200)}.${Math.floor(1+Math.random()*254)}`,
        'Navegador Web (Chrome Desktop)'
      );
      onLogin(user);
    }
  };

  const handleQuickLogin = (userId: string) => {
    const user = usuarios.find(u => u.id_usuario === userId);
    if (user) {
      user.ultimo_acceso = new Date().toISOString();
      db.addAuditLog(
        user.id_usuario,
        `${user.nombres} ${user.apellidos}`,
        user.rol_id,
        'Iniciar Sesión',
        'Usuarios',
        `Inicio de sesión rápido como ${user.rol_id.toUpperCase()}.`,
        `181.134.${Math.floor(10 + Math.random() * 200)}.${Math.floor(1+Math.random()*254)}`,
        'Plataforma Escritorio (Autenticación Directa)'
      );
      onLogin(user);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans transition-colors duration-300">
      
      {/* HEADER SUPERIOR */}
      <header className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-slate-200 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-brand-800 rounded-xl flex items-center justify-center text-white shadow-md">
              <span className="font-style font-black text-lg tracking-tight">IB</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-bold text-slate-800 leading-none">Instituto Bolivariano</h1>
                <span className="text-[9px] bg-brand-50 text-brand-700 px-1.5 py-0.5 rounded border border-brand-200 font-bold tracking-wider">SISTEMA CONTROL</span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium">Plataforma Homologada • Tiempo Real</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => {
                const docSection = document.getElementById('seccion-ingreso');
                if (docSection) docSection.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-4 py-2 text-xs font-semibold text-brand-800 hover:text-brand-700 bg-brand-50 hover:bg-brand-100/80 rounded-xl border border-brand-100 transition-all duration-200 cursor-pointer"
            >
              Acceso Directo
            </button>
          </div>
        </div>
      </header>

      {/* HERO PRINCIPAL ALINEADO EN BENTO GRID */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          
          {/* Lado izquierdo - Mensaje fuerte en panel Bento Grande */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-8 flex flex-col justify-between shadow-sm hover:shadow-md transition-all duration-300">
            <div className="space-y-6">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/50">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                Homologada SENA • Vigilancia de Convivencia
              </span>
              
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                Control y seguimiento estudiantil en <span className="text-brand-800 underline decoration-emerald-400 decoration-3 decoration-skip-ink">tiempo real</span>
              </h2>
              
              <p className="text-slate-600 text-sm leading-relaxed max-w-xl">
                Optimiza el registro de asistencia diaria en el aula, fortalece los canales de comunicación certificada con los acudientes y centraliza el seguimiento convivencial con absoluta trazabilidad legal.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  onClick={() => {
                    const docSection = document.getElementById('seccion-ingreso');
                    if (docSection) docSection.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-5 py-3 bg-brand-800 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  Ingresar al sistema
                  <ChevronRight className="w-4 h-4" />
                </button>
                <a
                  href="#seccion-roles"
                  className="px-5 py-3 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center"
                >
                  Ver Roles de Demostración
                </a>
              </div>
            </div>

            {/* Trait indicators as nested Bento cells */}
            <div className="pt-8 mt-8 border-t border-slate-150 grid grid-cols-3 gap-3">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-150 text-center">
                <p className="text-xl font-bold text-brand-800">100%</p>
                <p className="text-[9px] text-slate-500 uppercase font-black tracking-wider">Trazabilidad</p>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-150 text-center">
                <p className="text-xl font-bold text-brand-800">30 seg</p>
                <p className="text-[9px] text-slate-500 uppercase font-black tracking-wider">Asistencia</p>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-150 text-center">
                <p className="text-xl font-bold text-brand-800">Fácil</p>
                <p className="text-[9px] text-slate-500 uppercase font-black tracking-wider">Mobile First</p>
              </div>
            </div>
          </div>

          {/* Lado derecho - Mockup y Login en Bento Panel */}
          <div className="lg:col-span-5 flex flex-col" id="seccion-ingreso">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col justify-between flex-1">
              
              <div className="bg-brand-800 p-6 text-white text-center flex-shrink-0">
                <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-2 text-emerald-400">
                  <Shield className="w-5 h-5" />
                </div>
                <h3 className="font-display font-bold text-base leading-snug">Ingreso Institucional Seguro</h3>
                <p className="text-xs text-brand-100 mt-1">Selecciona tu perfil institucional certificado</p>
              </div>

              <div className="p-6 sm:p-8 space-y-6">
                
                {/* Formulario */}
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-slate-700">Usuario / Cuenta de Demostración</label>
                    <select
                      value={selectedUser}
                      onChange={(e) => {
                        setSelectedUser(e.target.value);
                        setErrorMsg('');
                      }}
                      className="w-full px-4 py-2.5 text-xs bg-slate-50 hover:bg-slate-100 border border-slate-250 rounded-lg text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-brand-700 focus:bg-white"
                    >
                      <option value="">-- Seleccionar Persona --</option>
                      
                      <optgroup label="Coordinación">
                        {usuarios.filter(u => u.rol_id === 'coordinador').map(u => (
                          <option key={u.id_usuario} value={u.id_usuario}>
                            {u.nombres} {u.apellidos} (Coordinador Académico)
                          </option>
                        ))}
                      </optgroup>
                      
                      <optgroup label="Cuerpo Docente">
                        {usuarios.filter(u => u.rol_id === 'docente').map(u => (
                          <option key={u.id_usuario} value={u.id_usuario}>
                            {u.nombres} {u.apellidos} (Docente Director)
                          </option>
                        ))}
                      </optgroup>

                      <optgroup label="Acudientes / Padres">
                        {usuarios.filter(u => u.rol_id === 'acudiente').map(u => (
                          <option key={u.id_usuario} value={u.id_usuario}>
                            {u.nombres} {u.apellidos} (Acudiente Registrado)
                          </option>
                        ))}
                      </optgroup>
                    </select>
                  </div>

                  {errorMsg && (
                    <p className="text-xs text-red-600 font-medium bg-red-50 p-2 rounded border border-red-200">
                      ⚠ {errorMsg}
                    </p>
                  )}

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-brand-800 hover:bg-brand-700 text-white font-bold text-xs rounded-lg shadow-sm hover:shadow transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    Ingresar al Portal
                  </button>
                </form>

                {/* Acceso Rápido Alternativo con 1 Click */}
                {showDemoLogins && (
                  <div className="pt-4 border-t border-slate-200 space-y-2">
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider text-center">Acceso Directo Un Solo Click</p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <button
                        onClick={() => handleQuickLogin('USR-001')}
                        className="p-2 py-1.5 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded text-center text-[10px] font-semibold text-indigo-800 transition-all cursor-pointer"
                      >
                        💼 Coordinador
                      </button>
                      <button
                        onClick={() => handleQuickLogin('USR-002')}
                        className="p-2 py-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded text-center text-[10px] font-semibold text-amber-800 transition-all cursor-pointer"
                      >
                        👩‍🏫 Docente (Once)
                      </button>
                      <button
                        onClick={() => handleQuickLogin('USR-004')}
                        className="p-2 py-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded text-center text-[10px] font-semibold text-emerald-800 transition-all cursor-pointer"
                      >
                        👪 Acudiente
                      </button>
                    </div>
                  </div>
                )}

              </div>
            </div>
          </div>

        </div>
      </main>

      {/* SECCIÓN DE BENEFICIOS CON LAYOUT BENTO */}
      <section className="bg-white py-14 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-xl mx-auto mb-10 space-y-2">
            <h3 className="font-display font-black text-2xl text-slate-800 tracking-tight">Diseñado para la velocidad del aula</h3>
            <p className="text-xs text-slate-500">Un sistema modular optimizado para que cada funcionario e integrante familiar acceda cómodamente en segundos.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            
            {/* Bento Card 1 - Column Span 4 */}
            <div className="md:col-span-4 p-6 bg-slate-50 rounded-2xl border border-slate-200 hover:border-brand-600 hover:bg-slate-50/80 transition-all duration-300 space-y-4 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 bg-emerald-50 text-emerald-700 rounded-xl flex items-center justify-center border border-emerald-100 font-bold mb-3">
                  <Clock className="w-5 h-5" />
                </div>
                <h4 className="font-display font-bold text-sm text-slate-800">Asistencia en 30 segundos</h4>
                <p className="text-xs text-slate-500 leading-relaxed mt-1">
                  Planillas táctiles de un solo toque diseñadas para celulares y tabletas. Menos tiempo administrativo, más tiempo de calidad docente.
                </p>
              </div>
              <span className="text-[9px] font-mono font-bold text-emerald-600 bg-emerald-50/50 self-start px-2 py-0.5 rounded border border-emerald-100">ALTA EFICIENCIA</span>
            </div>

            {/* Bento Card 2 - Column Span 4 */}
            <div className="md:col-span-4 p-6 bg-slate-50 rounded-2xl border border-slate-200 hover:border-brand-600 hover:bg-slate-50/80 transition-all duration-300 space-y-4 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 bg-indigo-50 text-indigo-700 rounded-xl flex items-center justify-center border border-indigo-100 font-bold mb-3">
                  <Smartphone className="w-5 h-5" />
                </div>
                <h4 className="font-display font-bold text-sm text-slate-800">Alertas Inmediatas</h4>
                <p className="text-xs text-slate-500 leading-relaxed mt-1">
                  Notificación instantánea electrónica. Los acudientes son informados sobre inasistencias de manera automatizada al cerrar el docente el registro.
                </p>
              </div>
              <span className="text-[9px] font-mono font-bold text-indigo-600 bg-indigo-50/50 self-start px-2 py-0.5 rounded border border-indigo-100">SISTEMA INTEGRADO</span>
            </div>

            {/* Bento Card 3 - Column Span 4 */}
            <div className="md:col-span-4 p-6 bg-slate-50 rounded-2xl border border-slate-200 hover:border-brand-600 hover:bg-slate-50/80 transition-all duration-300 space-y-4 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 bg-rose-50 text-rose-700 rounded-xl flex items-center justify-center border border-rose-100 font-bold mb-3">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <h4 className="font-display font-bold text-sm text-slate-800">Seguimiento Disciplinario Seguro</h4>
                <p className="text-xs text-slate-500 leading-relaxed mt-1">
                  Historial centralizado y seguro bajo rigor legal y de trazabilidad con registros de auditoría de cada modificación.
                </p>
              </div>
              <span className="text-[9px] font-mono font-bold text-rose-600 bg-rose-50/50 self-start px-2 py-0.5 rounded border border-rose-100">TRAZABILIDAD ISO</span>
            </div>

          </div>
        </div>
      </section>

      {/* SECCIÓN DE ROLES EN DETALLE - BENTO LAYOUT COMPARTMENT */}
      <section id="seccion-roles" className="py-14 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-xl mx-auto mb-10 space-y-2">
            <h3 className="font-display font-black text-2xl text-slate-800 tracking-tight">Demostración Integrada por Roles</h3>
            <p className="text-xs text-slate-500">Haz clic para experimentar lo que cada perfil experimentará e interactúa en tiempo real con las cuentas preconfiguradas.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            
            {/* DOCENTE PREVIEW - Bento Card 1 */}
            <div className="md:col-span-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5 hover:translate-y-[-2px] transition-all duration-300 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <span className="text-xs font-bold text-brand-800 uppercase tracking-widest">Docente</span>
                  <span className="px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg text-[9px] font-bold">Planilla Rápida</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between bg-slate-50 p-2 rounded-xl border border-slate-150">
                    <span className="text-xs font-semibold text-slate-705">Mateo Paternina</span>
                    <div className="flex gap-1">
                      <span className="px-1.5 py-0.5 bg-emerald-500 text-white rounded text-[8px] font-bold">PRESENTE</span>
                      <span className="px-1.5 py-0.5 bg-slate-200 text-slate-500 rounded text-[8px]">Falta</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between bg-slate-50 p-2 rounded-xl border border-slate-150">
                    <span className="text-xs font-semibold text-slate-705">Daniela Serna</span>
                    <div className="flex gap-1">
                      <span className="px-1.5 py-0.5 bg-slate-200 text-slate-500 rounded text-[8px]">Pres</span>
                      <span className="px-1.5 py-0.5 bg-rose-500 text-white rounded text-[8px] font-bold">AUSENTE</span>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-150">
                  Panel ágil para tomar asistencia o registrar observaciones directas en pocos toques antes de iniciar su sesión académica.
                </p>
              </div>
              <button 
                onClick={() => handleQuickLogin('USR-002')}
                className="w-full mt-2 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all cursor-pointer text-center block"
              >
                Ingresar como Docente
              </button>
            </div>

            {/* COORDINADOR PREVIEW - Bento Card 2 */}
            <div className="md:col-span-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5 hover:translate-y-[-2px] transition-all duration-300 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <span className="text-xs font-bold text-brand-800 uppercase tracking-widest">Coordinador</span>
                  <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-lg text-[9px] font-bold">Análisis & Control</span>
                </div>
                
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-150 space-y-2">
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Estadísticas del Día</p>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-600 font-semibold">Asistencia Global</span>
                    <span className="font-black text-emerald-600">92.5%</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-600 font-semibold">Casos Críticos</span>
                    <span className="font-black text-red-600">3 Alertas</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden mt-1">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: '92%' }}></div>
                  </div>
                </div>

                <p className="text-xs text-slate-500 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-150">
                  Control ejecutivo con visualización de métricas consolidadas, auditoría de logs, gestión de matrículas y citaciones disciplinarias.
                </p>
              </div>
              <button 
                onClick={() => handleQuickLogin('USR-001')}
                className="w-full mt-2 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all cursor-pointer text-center block"
              >
                Ingresar como Coordinador
              </button>
            </div>

            {/* ACUDIENTE PREVIEW - Bento Card 3 */}
            <div className="md:col-span-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5 hover:translate-y-[-2px] transition-all duration-300 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <span className="text-xs font-bold text-brand-800 uppercase tracking-widest">Acudiente / Padre</span>
                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-[9px] font-bold">Familia / Firma</span>
                </div>
                
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2 font-bold text-slate-700">
                    <span className="w-2 h-2 rounded-full bg-rose-500 inline-block animate-ping"></span>
                    Llegada Tarde - Mateo P.
                  </div>
                  <p className="text-[10px] text-slate-500 pl-4 font-medium">Firma digital pendiente por Carlos P.</p>
                  <div className="pt-1.5 pl-4">
                    <div className="p-1 px-2 border border-emerald-200 bg-emerald-50 text-emerald-800 font-mono text-[9px] rounded-lg inline-block font-bold">
                      ✓ Confirmado Legalmente
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-500 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-150">
                  Seguimiento simplificado: línea de tiempo de su hijo, firma legal de notificaciones con comentarios y visualización conductual.
                </p>
              </div>
              <button 
                onClick={() => handleQuickLogin('USR-004')}
                className="w-full mt-2 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all cursor-pointer text-center block"
              >
                Ingresar como Acudiente
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-900 text-slate-100 py-12 mt-auto border-t border-slate-800 text-xs text-center">
        <div className="max-w-7xl mx-auto px-6 space-y-4">
          <p className="font-display font-semibold text-slate-400 uppercase tracking-wider">INSTITUTO BOLIVARIANO — Sistema de Control y Seguimiento Estudiantil</p>
          <p className="text-xs text-slate-500 max-w-xl mx-auto leading-relaxed">
            Desarrollado bajo principios de accesibilidad móvil (Mobile-First), trazabilidad administrativa legal y fácil usabilidad ágil para personal de docencia y dirección.
          </p>
          <div className="pt-6 border-t border-slate-800 text-slate-600 flex flex-col sm:flex-row justify-between items-center gap-4 text-[11px]">
            <span>© 2026 Instituto Bolivariano. Todos los derechos reservados.</span>
            <span className="font-mono text-slate-500">Versión 1.4.0 (Homologada SENA)</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
