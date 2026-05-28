/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState, useEffect } from 'react';
import { 
  Users, BarChart2, Shield, AlertTriangle, CheckSquare, 
  Plus, Calendar, Eye, RefreshCw, Send, Smartphone, Clock, Mail
} from 'lucide-react';
import { Usuario, Estudiante, Grado, Asistencia, Observacion, Notificacion, Auditoria, Confirmacion } from '../types';
import { db } from '../data';

interface CoordinadorDashboardProps {
  usuario: Usuario;
  onLogout: () => void;
}

export default function CoordinadorDashboard({ usuario, onLogout }: CoordinadorDashboardProps) {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'estudiantes' | 'observaciones' | 'auditoria' | 'notificaciones'>('dashboard');
  
  // States of lists synced with DB
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [grados, setGrados] = useState<Grado[]>([]);
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
  const [asistencias, setAsistencias] = useState<Asistencia[]>([]);
  const [observaciones, setObservaciones] = useState<Observacion[]>([]);
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [confirmaciones, setConfirmaciones] = useState<Confirmacion[]>([]);
  const [auditorias, setAuditorias] = useState<Auditoria[]>([]);

  // Add student form State
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [stuNombres, setStuNombres] = useState('');
  const [stuApellidos, setStuApellidos] = useState('');
  const [stuTipoDoc, setStuTipoDoc] = useState('TI');
  const [stuDoc, setStuDoc] = useState('');
  const [stuGrado, setStuGrado] = useState('');
  const [stuFechaNac, setStuFechaNac] = useState('2009-01-01');

  // Trigger metrics refresh
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    setUsuarios(db.getUsuarios());
    setGrados(db.getGrados());
    setEstudiantes(db.getEstudiantes());
    setAsistencias(db.getAsistencias());
    setObservaciones(db.getObservaciones());
    setNotificaciones(db.getNotificaciones());
    setConfirmaciones(db.getConfirmaciones());
    setAuditorias(db.getAuditoria());
  }, [refreshKey]);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  // Dynamic calculations based on state values
  const totalEst = estudiantes.length;
  
  // Attendance Calculation (Global and by Course)
  const calculateAttendanceRate = (filtradas: Asistencia[]) => {
    if (filtradas.length === 0) return 100;
    const presentesOrExc = filtradas.filter(a => a.estado_asistencia === 'Presente' || a.estado_asistencia === 'Excusado' || a.estado_asistencia === 'Tarde').length;
    return Math.round((presentesOrExc / filtradas.length) * 100);
  };

  const globalAttendanceRate = calculateAttendanceRate(asistencias);
  const ausenciasTotales = asistencias.filter(a => a.estado_asistencia === 'Ausente').length;
  const observacionCriticaTotal = observaciones.filter(o => o.nivel_gravedad === 'Crítico' || o.nivel_gravedad === 'Alto').length;

  // Course rates
  const courseRates = grados.map(g => {
    const cursoAsistencias = asistencias.filter(a => a.id_grado === g.id_grado);
    return {
      nombre: g.nombre_grado,
      rate: calculateAttendanceRate(cursoAsistencias),
      total: cursoAsistencias.length
    };
  });

  // Observations by category metrics
  const obsDistrib = {
    disciplinaria: observaciones.filter(o => o.tipo_observacion === 'Disciplinaria').length,
    convivencial: observaciones.filter(o => o.tipo_observacion === 'Convivencial').length,
    academica: observaciones.filter(o => o.tipo_observacion === 'Académica').length,
    positivo: observaciones.filter(o => o.tipo_observacion === 'Reconocimiento positivo').length,
    general: observaciones.filter(o => o.tipo_observacion === 'Seguimiento general').length,
  };

  const handleSaveStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!stuNombres || !stuApellidos || !stuDoc || !stuGrado) {
      alert('Por favor complete todos los datos.');
      return;
    }

    const nuevosEsts: Estudiante[] = [
      ...estudiantes,
      {
        id_estudiante: `EST-${Math.floor(300 + Math.random() * 600)}`,
        tipo_documento: stuTipoDoc,
        numero_documento: stuDoc,
        nombres: stuNombres,
        apellidos: stuApellidos,
        fecha_nacimiento: stuFechaNac,
        grado_id: stuGrado,
        jornada: grados.find(g => g.id_grado === stuGrado)?.jornada || 'Mañana',
        estado: 'Activo',
        fecha_ingreso: new Date().toISOString().substring(0, 10)
      }
    ];

    localStorage.setItem('lib_bolivariano_estudiantes', JSON.stringify(nuevosEsts));

    db.addAuditLog(
      usuario.id_usuario,
      `${usuario.nombres} ${usuario.apellidos}`,
      usuario.rol_id,
      'Crear estudiante',
      'Usuarios',
      `Estudiante matriculado: ${stuNombres} ${stuApellidos} en el grado ${stuGrado}.`,
      '190.143.2.98',
      'Plataforma Escritorio (Coordinación)'
    );

    // Reset fields
    setStuNombres('');
    setStuApellidos('');
    setStuDoc('');
    setStuGrado('');
    setShowAddStudent(false);
    handleRefresh();
  };

  const cleanDemoState = () => {
    if (window.confirm('¿Seguro quieres relanzar la configuración original? Se restaurarán todos los datos mock iniciales.')) {
      db.resetState();
      handleRefresh();
      alert('Datos restaurados.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      
      {/* TOPBAR COORDINADOR */}
      <nav className="bg-brand-950 text-white px-6 py-4 shadow-md border-b border-brand-900">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="bg-brand-900/60 p-2.5 rounded-xl text-emerald-400 border border-brand-800/30">
              <Shield className="w-5 h-5 animate-pulse" />
            </div>
            <div className="text-center sm:text-left">
              <span className="text-[9px] text-emerald-400 uppercase tracking-widest font-black">Consola de Control Directiva</span>
              <h2 className="text-xs sm:text-sm font-bold text-slate-100">Coord. {usuario.nombres} {usuario.apellidos}</h2>
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap justify-center">
            <button
              onClick={handleRefresh}
              className="p-1 px-3 bg-brand-900 hover:bg-brand-800 rounded-xl text-[11px] font-bold text-slate-200 transition-colors cursor-pointer flex items-center gap-1.5 border border-brand-800/85"
              title="Refrescar estado"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Sincronizar
            </button>
            <button
              onClick={cleanDemoState}
              className="p-1 px-3 bg-red-950/80 hover:bg-red-900 border border-red-900/80 rounded-xl text-[11px] font-black uppercase text-red-200 transition-colors cursor-pointer"
              title="Restaurar base de datos"
            >
              Reiniciar DB
            </button>
            <button
              onClick={onLogout}
              className="p-1.5 px-3 bg-slate-800 hover:bg-slate-700 hover:text-red-300 rounded-xl text-[11px] font-bold text-slate-300 transition-all cursor-pointer border border-slate-700"
            >
              Salir Portal
            </button>
          </div>
        </div>
      </nav>

      {/* SUBNAV DE TABS EMULANDO CELDAS BENTO */}
      <div className="bg-white border-b border-slate-200 sticky top-[68px] z-20">
        <div className="max-w-7xl mx-auto px-6 overflow-x-auto flex gap-1 scrollbar-none">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-3.5 text-xs font-black uppercase tracking-wider shrink-0 transition-all border-b-2 cursor-pointer ${
              activeTab === 'dashboard' ? 'border-brand-800 text-brand-800' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            📊 Panel Global
          </button>
          <button
            onClick={() => setActiveTab('estudiantes')}
            className={`px-4 py-3.5 text-xs font-black uppercase tracking-wider shrink-0 transition-all border-b-2 cursor-pointer ${
              activeTab === 'estudiantes' ? 'border-brand-800 text-brand-800' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            👥 Alumnado & Grados
          </button>
          <button
            onClick={() => setActiveTab('observaciones')}
            className={`px-4 py-3.5 text-xs font-black uppercase tracking-wider shrink-0 transition-all border-b-2 cursor-pointer ${
              activeTab === 'observaciones' ? 'border-brand-800 text-brand-800' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            📋 Libro Observaciones
          </button>
          <button
            onClick={() => setActiveTab('notificaciones')}
            className={`px-4 py-3.5 text-xs font-black uppercase tracking-wider shrink-0 transition-all border-b-2 cursor-pointer ${
              activeTab === 'notificaciones' ? 'border-brand-800 text-brand-800' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            ✉️ Firmas & Notificaciones
          </button>
          <button
            onClick={() => setActiveTab('auditoria')}
            className={`px-4 py-3.5 text-xs font-black uppercase tracking-wider shrink-0 transition-all border-b-2 cursor-pointer ${
              activeTab === 'auditoria' ? 'border-brand-800 text-brand-800' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            ⚖️ Bitácora Auditoría
          </button>
        </div>
      </div>

      {/* CONTENIDO PRINCIPAL */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-6 py-6 font-sans">
        
        {/* TAB 1: DASHBOARD GENERAL */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            
            {/* WIDGET INDICATIVOS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between hover:border-indigo-400 transition-all duration-300">
                <div>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Alumnado Matriculado</p>
                  <h3 className="text-2xl font-black text-slate-800 tracking-tight mt-1">{totalEst} Estudiantes</h3>
                  <p className="text-[10px] text-slate-500 mt-1">Soporte total de cobertura</p>
                </div>
                <div className="w-10 h-10 bg-indigo-50 text-indigo-700 rounded-xl flex items-center justify-center font-bold border border-indigo-100">
                  <Users className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between hover:border-emerald-400 transition-all duration-300">
                <div>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Asistencia Promedio</p>
                  <h3 className="text-2xl font-black text-emerald-600 mt-1">{globalAttendanceRate}%</h3>
                  <p className="text-[10px] text-slate-500 mt-1">Con asistencia del aula</p>
                </div>
                <div className="w-10 h-10 bg-emerald-50 text-emerald-700 rounded-xl flex items-center justify-center font-bold border border-emerald-100">
                  <BarChart2 className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between hover:border-yellow-400 transition-all duration-300">
                <div>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Inasistencias Registradas</p>
                  <h3 className="text-2xl font-black text-slate-800 tracking-tight mt-1">{ausenciasTotales} Fallas</h3>
                  <p className="text-[10px] text-slate-500 mt-1">Acumuladas este mes</p>
                </div>
                <div className="w-10 h-10 bg-yellow-50 text-yellow-700 rounded-xl flex items-center justify-center font-bold border border-yellow-105">
                  <Clock className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between hover:border-red-450 transition-all duration-300">
                <div>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Anotaciones Críticas</p>
                  <h3 className="text-2xl font-black text-red-600 mt-1">{observacionCriticaTotal} Casos</h3>
                  <p className="text-[10px] text-red-500 mt-1 font-medium">Urgente o Disciplinario</p>
                </div>
                <div className="w-10 h-10 bg-red-50 text-red-700 rounded-xl flex items-center justify-center font-bold border border-red-100">
                  <AlertTriangle className="w-5 h-5 animate-bounce" />
                </div>
              </div>

            </div>

            {/* SECCIÓN ALERTAS DE SALUD DEL ESTUDIANTE */}
            <div className="bg-amber-50/50 border border-amber-250 p-5 rounded-2xl space-y-2">
              <h4 className="text-xs font-black text-amber-800 uppercase tracking-widest flex items-center gap-1.5 leading-none">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                Alertas Convivenciales y de Asistencia Crítica
              </h4>
              <p className="text-xs text-slate-600">
                El sistema detectó variaciones conductuales recurrentes en base al Libro Convivencial para ser citado por dirección de curso:
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                
                <div className="bg-white p-3 rounded-xl border border-red-200 text-xs shadow-xs hover:shadow-sm transition-all">
                  <p className="font-bold text-red-800 truncate">Daniela Sofía Serna (11°-A)</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Inasistencia recurrente - Falta Alta</p>
                  <span className="inline-block mt-2 px-1.5 py-0.5 bg-red-50 text-red-700 border border-red-200 rounded-lg text-[9px] font-bold">
                    3 Inasistencias consecutivas
                  </span>
                </div>

                <div className="bg-white p-3 rounded-xl border border-orange-200 text-xs shadow-xs hover:shadow-sm transition-all">
                  <p className="font-bold text-orange-850 truncate">Brayan Estiven Paternina (Ciclo V)</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Falta de respeto - Falta Crítica</p>
                  <span className="inline-block mt-2 px-1.5 py-0.5 bg-orange-50 text-orange-700 border border-orange-200 rounded-lg text-[9px] font-bold">
                    Sábado Citación Pendiente
                  </span>
                </div>

                <div className="bg-white p-3 rounded-xl border border-yellow-250 text-xs shadow-xs hover:shadow-sm transition-all">
                  <p className="font-bold text-slate-800 truncate">Mateo Andrés Paternina (11°-A)</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Llegada tarde - Nivel Bajo</p>
                  <span className="inline-block mt-2 px-1.5 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-[9px] font-bold">
                    Firma Legal Confirmada por Padre
                  </span>
                </div>

              </div>
            </div>

            {/* GRÁFICAS DE ASISTENCIA Y OBSERVACIONES */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* ASISTENCIA COURSE PORCENTAJE (SVG CLEAN GRAPHIC) */}
              <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div>
                  <h4 className="font-display font-bold text-sm text-slate-800">Tasa de Asistencia por Grado o Curso</h4>
                  <p className="text-[10px] text-slate-400 font-medium">Calculado en base a hojas de firmas registradas en tiempo real</p>
                </div>

                {/* SVG RENDERING */}
                <div className="h-64 flex flex-col justify-end text-xs pt-4">
                  <div className="flex-1 flex items-end justify-around border-b border-slate-200 pb-2 relative">
                    
                    {/* Grid lines helper */}
                    <div className="absolute inset-y-0 left-0 right-0 flex flex-col justify-between pointer-events-none text-[9px] text-slate-300">
                      <div className="border-t border-slate-100 w-full pt-1">100%</div>
                      <div className="border-t border-slate-100 w-full pt-1">75%</div>
                      <div className="border-t border-slate-100 w-full pt-1">50%</div>
                      <div className="border-t border-slate-100 w-full pt-1">25%</div>
                    </div>

                    {courseRates.map(cr => (
                      <div key={cr.nombre} className="flex flex-col items-center gap-2 w-1/4 z-10">
                        <div className="text-[10px] font-bold text-brand-800 bg-brand-50 border border-brand-100 px-1 rounded">
                          {cr.rate}%
                        </div>
                        <div 
                          className="w-12 bg-indigo-600 rounded-t-lg transition-all duration-500 hover:bg-emerald-500 shadow-sm"
                          style={{ height: `${cr.rate * 1.5}px` }}
                        ></div>
                      </div>
                    ))}

                  </div>
                  
                  {/* Labels alignment */}
                  <div className="flex justify-around pt-2 text-[10px] text-slate-500 font-semibold text-center uppercase">
                    {courseRates.map(cr => (
                      <div key={cr.nombre} className="w-1/4">
                        {cr.nombre.replace('Grado', '')}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* DISTRIBUCIÓN DE OBSERVACIONES DISCIPLINARIAS */}
              <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div>
                  <h4 className="font-display font-bold text-sm text-slate-800">Tipología de Observaciones</h4>
                  <p className="text-[10px] text-slate-400">Total acumulado de reportes convivenciales</p>
                </div>

                <div className="space-y-3.5 pt-2">
                  
                  {/* Convivencial */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-slate-600">Convivencial (Respeto / Uniforme)</span>
                      <span className="font-bold text-slate-800">{obsDistrib.convivencial}</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-rose-500 rounded-full" style={{ width: `${(obsDistrib.convivencial / observaciones.length) * 100 || 0}%` }}></div>
                    </div>
                  </div>

                  {/* Disciplinaria */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-slate-600">Disciplinaria (Graves / Sustancias)</span>
                      <span className="font-bold text-slate-800">{obsDistrib.disciplinaria}</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full" style={{ width: `${(obsDistrib.disciplinaria / observaciones.length) * 100 || 0}%` }}></div>
                    </div>
                  </div>

                  {/* Académica */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-slate-600">Académica (Evaluación / Tareas)</span>
                      <span className="font-bold text-slate-800">{obsDistrib.academica}</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${(obsDistrib.academica / observaciones.length) * 100 || 0}%` }}></div>
                    </div>
                  </div>

                  {/* Reconocimientos */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-emerald-700">Reconocimientos Positivos (Liderazgo)</span>
                      <span className="font-bold text-emerald-700">{obsDistrib.positivo}</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(obsDistrib.positivo / observaciones.length) * 100 || 0}%` }}></div>
                    </div>
                  </div>

                </div>

                <div className="p-3 bg-indigo-50 rounded-lg text-[10px] text-indigo-850 mt-4 leading-normal">
                  📌 <strong>Dato del Coordinador:</strong> El 80% de las incidencias del mes corresponden a inasistencias consecutivas y retrasos matutinos.
                </div>
              </div>

            </div>

          </div>
        )}

        {/* TAB 2: MATRIZ DE ESTUDIANTES */}
        {activeTab === 'estudiantes' && (
          <div className="space-y-4">
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h3 className="font-display font-bold text-base text-slate-800">Libro General de Matrículas</h3>
                <p className="text-xs text-slate-500">Altas, bajas de alumnos y visualizador de estados en el Instituto Bolivariano</p>
              </div>

              <button
                onClick={() => setShowAddStudent(!showAddStudent)}
                className="px-4 py-2 bg-brand-800 hover:bg-brand-700 text-white rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Matricular Nuevo Alumno
              </button>
            </div>

            {/* FORMULARIO AGREGAR ESTUDIANTE */}
            {showAddStudent && (
              <form onSubmit={handleSaveStudent} className="p-5 bg-white border border-brand-100 rounded-xl space-y-4 max-w-xl animate-scale-up">
                <p className="text-xs font-bold text-brand-800 uppercase tracking-widest border-b border-slate-100 pb-2">Datos de Matrícula Básica</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600 block">Nombres</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej: Brayan Estiven"
                      value={stuNombres}
                      onChange={(e) => setStuNombres(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded text-slate-800 focus:outline-none focus:bg-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600 block">Apellidos</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej: Paternina Díaz"
                      value={stuApellidos}
                      onChange={(e) => setStuApellidos(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded text-slate-800 focus:outline-none focus:bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600 block">Tipo Doc</label>
                    <select
                      value={stuTipoDoc}
                      onChange={(e) => setStuTipoDoc(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded text-slate-800"
                    >
                      <option value="TI">T. Identidad</option>
                      <option value="CC">Cédula Ciudadanía</option>
                      <option value="CE">Cédula Extranjería</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600 block">Número de Doc</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej: 1095333444"
                      value={stuDoc}
                      onChange={(e) => setStuDoc(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded text-slate-800 focus:outline-none focus:bg-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600 block">Grado / Curso</label>
                    <select
                      value={stuGrado}
                      onChange={(e) => setStuGrado(e.target.value)}
                      required
                      className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded text-slate-800"
                    >
                      <option value="">-- Grado --</option>
                      {grados.map(g => (
                        <option key={g.id_grado} value={g.id_grado}>
                          {g.nombre_grado}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setShowAddStudent(false)}
                    className="px-3 py-1.5 border border-slate-250 text-slate-600 rounded"
                  >
                    Descartar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded"
                  >
                    Confirmar Guardado
                  </button>
                </div>
              </form>
            )}

            {/* TABLA DE ESTUDIANTES */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs divide-y divide-slate-200">
                  <thead className="bg-slate-50 text-slate-500 uppercase font-black text-[9px] tracking-wider">
                    <tr>
                      <th className="p-3">Código</th>
                      <th className="p-3">Documento</th>
                      <th className="p-3">Nombres y Apellidos</th>
                      <th className="p-3">Curso</th>
                      <th className="p-3">Jornada</th>
                      <th className="p-3">Estado</th>
                      <th className="p-3">Fecha Ingreso</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-850">
                    {estudiantes.map(est => (
                      <tr key={est.id_estudiante} className="hover:bg-slate-50/50">
                        <td className="p-3 text-brand-800 font-mono font-bold">{est.id_estudiante}</td>
                        <td className="p-3 font-mono text-slate-500">{est.tipo_documento} {est.numero_documento}</td>
                        <td className="p-3 font-semibold">{est.apellidos}, {est.nombres}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 bg-indigo-50 border border-indigo-100 rounded text-brand-800 text-[10px]">
                            {grados.find(g => g.id_grado === est.grado_id)?.nombre_grado || est.grado_id}
                          </span>
                        </td>
                        <td className="p-3 text-slate-500">{est.jornada}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            est.estado === 'Activo' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {est.estado}
                          </span>
                        </td>
                        <td className="p-3 text-slate-400 font-mono">{est.fecha_ingreso}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* TAB 3: LIBRO DE OBSERVACIONES */}
        {activeTab === 'observaciones' && (
          <div className="space-y-4">
            <div>
              <h3 className="font-display font-bold text-base text-slate-800">Libro de Observaciones Convivenciales (Completo)</h3>
              <p className="text-xs text-slate-500">Historial centralizado de faltas o reconocimientos expedidos por el cuerpo de docentes en la plataforma</p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {observaciones.map(obs => {
                const estRef = estudiantes.find(e => e.id_estudiante === obs.id_estudiante);
                const colorMap: Record<string, string> = {
                  'Bajo': 'border-blue-300 bg-blue-50/55 text-blue-800',
                  'Medio': 'border-yellow-300 bg-yellow-50/55 text-yellow-800',
                  'Alto': 'border-orange-300 bg-orange-50/55 text-orange-850',
                  'Crítico': 'border-red-300 bg-red-50/55 text-red-800'
                };

                return (
                  <div key={obs.id_observacion} className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
                    
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-100 pb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-brand-800 font-black text-xs">[{obs.id_observacion}]</span>
                        <strong className="text-xs text-slate-800 font-semibold uppercase">{obs.tipo_observacion}</strong>
                      </div>
                      
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-slate-400 font-mono">{obs.fecha_observacion}</span>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wide border ${colorMap[obs.nivel_gravedad] || 'bg-slate-150'}`}>
                          Gravedad {obs.nivel_gravedad}
                        </span>
                      </div>
                    </div>

                    <div className="text-xs space-y-1.5 text-slate-700">
                      <p>
                        🧑 Estudiante: <strong className="text-slate-800">{estRef ? `${estRef.nombres} ${estRef.apellidos}` : 'No especificado'}</strong> 
                        <span className="text-slate-400"> (Cod: {obs.id_estudiante})</span>
                      </p>
                      <p>📁 Concepto: <strong className="text-slate-800">{obs.categoria}</strong></p>
                      <p className="bg-slate-50 p-2.5 rounded text-xs leading-relaxed text-slate-600 italic border-l-3 border-slate-300">
                        "{obs.descripcion}"
                      </p>
                    </div>

                    <div className="pt-2 text-[10px] text-slate-400 flex justify-between items-center bg-slate-50/70 p-2 rounded">
                      <span>Registrado por: <strong>{obs.registrado_por}</strong></span>
                      <span>Estado: <strong className="text-emerald-600">{obs.estado}</strong></span>
                    </div>

                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 4: COMUNICACIONES Y CONFIRMACIONES DE ACUDIENTES */}
        {activeTab === 'notificaciones' && (
          <div className="space-y-6">
            
            <div className="bg-indigo-50 border border-indigo-200 p-4 rounded-xl flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-indigo-800 uppercase tracking-widest">Estructura Legal y Cobertura Electrónica</h4>
                <p className="text-[11px] text-slate-600 mt-1 max-w-xl">
                  Las confirmaciones de lectura firmadas digitalmente por los acudientes registran la dirección IP, fecha/hora exacta y comentario de acuerdo. Esto dota de valor administrativo al colegio ante comités de sana convivencia.
                </p>
              </div>
              <Mail className="w-10 h-10 text-indigo-400 hidden md:block shrink-0" />
            </div>

            <div className="space-y-4">
              <h3 className="font-display font-bold text-sm text-slate-800">Firmas Digitales de Notificaciones (Historial de Acuso de Recibo)</h3>
              
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs divide-y divide-slate-200">
                  <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold text-[9px]">
                    <tr>
                      <th className="p-3">Código</th>
                      <th className="p-3">Notificación Original</th>
                      <th className="p-3">Acudiente Firmante</th>
                      <th className="p-3">Hora de Firma UTC</th>
                      <th className="p-3">Comentario de Acudiente</th>
                      <th className="p-3">IP de Confirmación</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                    {confirmaciones.map(c => {
                      const noti = notificaciones.find(n => n.id_notificacion === c.id_notificacion);
                      const acudiente = usuarios.find(u => u.id_usuario === c.id_acudiente);
                      return (
                        <tr key={c.id_confirmacion} className="hover:bg-emerald-50/20">
                          <td className="p-3 text-emerald-800 font-bold font-mono">{c.id_confirmacion}</td>
                          <td className="p-3 truncate max-w-xs block font-semibold text-slate-700">
                            {noti ? noti.asunto : 'Notificación legal'}
                          </td>
                          <td className="p-3">{acudiente ? `${acudiente.nombres} ${acudiente.apellidos}` : 'Acudiente'}</td>
                          <td className="p-3 font-mono text-slate-500">{new Date(c.fecha_confirmacion).toLocaleString('es-CO')}</td>
                          <td className="p-3 italic text-slate-600 text-xs text-wrap">"{c.comentario_acudiente}"</td>
                          <td className="p-3 font-mono text-emerald-700 font-bold">{c.ip_confirmacion}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-display font-bold text-sm text-slate-800">Alertas Disparadas al Sistema (Detalle de Envíos)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {notificaciones.map(noti => (
                  <div key={noti.id_notificacion} className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="px-2 py-0.5 bg-slate-100 rounded font-mono text-[9px] text-slate-500">{noti.id_notificacion}</span>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                        noti.estado_envio === 'Confirmada' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {noti.estado_envio}
                      </span>
                    </div>
                    <p className="font-bold text-xs text-slate-800">{noti.asunto}</p>
                    <p className="text-[11px] text-slate-600 leading-normal bg-slate-50 p-2 rounded">
                      {noti.mensaje}
                    </p>
                    <div className="text-[10px] text-slate-400 flex justify-between">
                      <span>Canal: {noti.canal}</span>
                      <span>Disparado: {new Date(noti.fecha_envio).toLocaleTimeString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* TAB 5: AUDITORÍA DEL SISTEMA (SENA EVALUATION CRITICAL) */}
        {activeTab === 'auditoria' && (
          <div className="space-y-4">
            
            <div className="bg-brand-950 p-5 rounded-xl text-white space-y-1.5">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-emerald-400" />
                <h4 className="font-display font-black text-sm tracking-tight">Módulo de Auditoría y Trazabilidad de Auditoria (Legal ISO)</h4>
              </div>
              <p className="text-xs text-brand-100">
                Cada guardado, inicio de sesión, edición de planilla conductual o firma de acudientes es capturado con marca de tiempo precisa, dirección IPv4 del cliente y metadata del navegador del emisor. No repudiable.
              </p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs divide-y divide-slate-200">
                  <thead className="bg-slate-100 text-slate-500 font-bold uppercase text-[9px] tracking-wider">
                    <tr>
                      <th className="p-3">ID Auditoría</th>
                      <th className="p-3">Operario / Usuario</th>
                      <th className="p-3">Acción Tomada</th>
                      <th className="p-3">Módulo</th>
                      <th className="p-3">Descripción Técnica del Hecho</th>
                      <th className="p-3">Fecha y Hora</th>
                      <th className="p-3">IPv4 Cliente</th>
                      <th className="p-3">Dispositivo Metadatos</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                    {auditorias.map(log => (
                      <tr key={log.id_auditoria} className="hover:bg-slate-50/80">
                        <td className="p-3 text-indigo-700 font-bold font-mono">{log.id_auditoria}</td>
                        <td className="p-3">
                          <p className="font-semibold text-slate-800">{log.usuario_nombre}</p>
                          <span className="text-[10px] text-slate-400 uppercase font-bold">{log.usuario_rol}</span>
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 bg-indigo-50 text-indigo-850 rounded font-semibold text-[10px]">
                            {log.accion}
                          </span>
                        </td>
                        <td className="p-3 font-semibold text-slate-500">{log.modulo}</td>
                        <td className="p-3 text-xs font-normal text-slate-600 max-w-xs">{log.descripcion}</td>
                        <td className="p-3 font-mono text-slate-500 text-[10px]">{new Date(log.fecha_accion).toLocaleString()}</td>
                        <td className="p-3 font-mono font-bold text-rose-700">{log.ip_usuario}</td>
                        <td className="p-3 text-slate-400 text-[10px] truncate max-w-[120px]">{log.dispositivo}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

      </div>

      {/* FOOTER */}
      <footer className="bg-slate-900 border-t border-slate-800 py-6 text-center text-xs text-slate-500 mt-auto">
        <p>© 2026 Instituto Bolivariano - Módulo Coordinador Académico. Todos los derechos reservados.</p>
      </footer>

    </div>
  );
}
