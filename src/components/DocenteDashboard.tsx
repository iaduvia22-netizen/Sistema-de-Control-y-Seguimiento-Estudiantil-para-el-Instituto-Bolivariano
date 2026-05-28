/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  User, LogOut, CheckCircle, AlertCircle, Clock, 
  MapPin, PlusCircle, HelpCircle, Save, Info, Sparkles 
} from 'lucide-react';
import { Usuario, Grado, Estudiante, Asistencia, EstadoAsistencia, TipoObservacion, NivelGravedad } from '../types';
import { db } from '../data';

interface DocenteDashboardProps {
  usuario: Usuario;
  onLogout: () => void;
}

export default function DocenteDashboard({ usuario, onLogout }: DocenteDashboardProps) {
  const [grados, setGrados] = useState<Grado[]>([]);
  const [selectedGradoId, setSelectedGradoId] = useState<string>('');
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
  
  // Registro de asistencia temporal actual
  const [asistenciaTemp, setAsistenciaTemp] = useState<Record<string, { 
    estado: EstadoAsistencia; 
    observacion: string;
  }>>({});

  // Formulario de nueva observación
  const [showObsForm, setShowObsForm] = useState(false);
  const [obsEstudianteId, setObsEstudianteId] = useState('');
  const [obsTipo, setObsTipo] = useState<TipoObservacion>('Convivencial');
  const [obsCategoria, setObsCategoria] = useState('');
  const [obsGravedad, setObsGravedad] = useState<NivelGravedad>('Bajo');
  const [obsDescripcion, setObsDescripcion] = useState('');

  // Mensajes de éxito
  const [successBanner, setSuccessBanner] = useState<string | null>(null);
  const [obsSuccess, setObsSuccess] = useState<string | null>(null);

  useEffect(() => {
    // Cargar grados asignados o todos para demo
    const todosGrados = db.getGrados();
    setGrados(todosGrados);
    
    // Seleccionar primero por defecto
    if (todosGrados.length > 0) {
      setSelectedGradoId(todosGrados[0].id_grado);
    }
  }, []);

  useEffect(() => {
    if (selectedGradoId) {
      const todosEst = db.getEstudiantes();
      const filtrados = todosEst.filter(e => e.grado_id === selectedGradoId);
      setEstudiantes(filtrados);

      // Cargar asistencias previas de HOY si existen para este grado
      const hoyStr = new Date().toISOString().substring(0, 10);
      const asistenciasHoy = db.getAsistencias().filter(a => a.fecha === hoyStr && a.id_grado === selectedGradoId);

      const mapInicial: Record<string, { estado: EstadoAsistencia; observacion: string }> = {};
      filtrados.forEach(est => {
        const existente = asistenciasHoy.find(a => a.id_estudiante === est.id_estudiante);
        mapInicial[est.id_estudiante] = {
          estado: existente ? existente.estado_asistencia : 'Presente', // Presente por defecto
          observacion: existente ? existente.observacion : ''
        };
      });

      setAsistenciaTemp(mapInicial);
      setSuccessBanner(null);
    }
  }, [selectedGradoId]);

  const handleEstadoChange = (estudianteId: string, estado: EstadoAsistencia) => {
    setAsistenciaTemp(prev => ({
      ...prev,
      [estudianteId]: {
        ...prev[estudianteId],
        estado
      }
    }));
  };

  const handleObservacionChange = (estudianteId: string, observacion: string) => {
    setAsistenciaTemp(prev => ({
      ...prev,
      [estudianteId]: {
        ...prev[estudianteId],
        observacion
      }
    }));
  };

  const handleGuardarAsistencia = (e: React.FormEvent) => {
    e.preventDefault();
    const hoyStr = new Date().toISOString().substring(0, 10);
    const ahoraStr = new Date().toTimeString().split(' ')[0];

    const nuevasAsistencias: Asistencia[] = estudiantes.map(est => {
      const temp = asistenciaTemp[est.id_estudiante] || { estado: 'Presente', observacion: '' };
      return {
        id_asistencia: `AST-${Math.floor(1000 + Math.random() * 9000)}`,
        id_estudiante: est.id_estudiante,
        id_docente: usuario.id_usuario,
        id_grado: selectedGradoId,
        fecha: hoyStr,
        hora_registro: ahoraStr,
        estado_asistencia: temp.estado,
        observacion: temp.observacion,
        registrado_por: `${usuario.nombres} ${usuario.apellidos}`,
        fecha_creacion: new Date().toISOString()
      };
    });

    db.saveAsistencias(nuevasAsistencias, usuario);
    
    // Banner de éxito
    setSuccessBanner('¡Planilla de asistencia guardada correctamente! Los acudientes correspondientes fueron notificados vía correo de manera automática.');
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Quitar banner después de 6 segundos
    setTimeout(() => {
      setSuccessBanner(null);
    }, 6000);
  };

  const handleCrearObservacion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!obsEstudianteId) {
      alert('Por favor elija un estudiante.');
      return;
    }
    if (!obsCategoria || !obsDescripcion) {
      alert('Por favor complete la categoría y descripción de la falta.');
      return;
    }

    db.addObservacion({
      id_estudiante: obsEstudianteId,
      id_docente: usuario.id_usuario,
      tipo_observacion: obsTipo,
      categoria: obsCategoria,
      descripcion: obsDescripcion,
      nivel_gravedad: obsGravedad,
      fecha_observacion: new Date().toISOString().substring(0, 10),
      estado: 'Vigente',
      registrado_por: `${usuario.nombres} ${usuario.apellidos}`
    }, usuario);

    // Limpiar formulario obs
    setObsEstudianteId('');
    setObsCategoria('');
    setObsDescripcion('');
    setObsGravedad('Bajo');
    setShowObsForm(false);
    
    setObsSuccess('¡Observación registrada con éxito! Guardada en el libro de vida digital y notificada si aplica.');
    setTimeout(() => {
      setObsSuccess(null);
    }, 5000);
  };

  const getBadgeClass = (estado: EstadoAsistencia) => {
    switch (estado) {
      case 'Presente': return 'bg-emerald-500 text-white font-semibold ring-2 ring-emerald-500/25';
      case 'Ausente': return 'bg-rose-500 text-white font-semibold ring-2 ring-rose-500/25';
      case 'Tarde': return 'bg-amber-500 text-slate-900 font-semibold ring-2 ring-amber-500/25';
      case 'Excusado': return 'bg-sky-500 text-white font-semibold ring-2 ring-sky-500/25';
      case 'Retirado': return 'bg-slate-500 text-white font-semibold ring-2 ring-slate-500/25';
      default: return 'bg-slate-200 text-slate-800';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      
      {/* TOPBAR DOCENTE */}
      <nav className="bg-brand-800 text-white px-6 py-4 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-brand-700/60 p-2.5 rounded-xl text-emerald-400 border border-brand-600/30">
              <User className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[9px] text-brand-200 uppercase tracking-widest font-black">Portal del Docente</p>
              <h2 className="text-xs sm:text-sm font-bold text-white">Prof. {usuario.nombres} {usuario.apellidos}</h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-block px-2.5 py-1 text-[9px] uppercase font-black tracking-wider bg-brand-700 text-brand-100 rounded-lg border border-brand-600">
              Director Convivencia
            </span>
            <button
              onClick={onLogout}
              className="p-2 hover:bg-brand-700 rounded-xl text-red-200 hover:text-red-100 transition-colors cursor-pointer"
              title="Cerrar Sesión"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>

      {/* CUERPO PRINCIPAL */}
      <div className="max-w-5xl mx-auto px-6 py-8 flex-1 w-full space-y-6">

        {/* Alertas sobre envíos */}
        {successBanner && (
          <div className="p-4 bg-emerald-50 border border-emerald-250 rounded-2xl text-xs text-emerald-800 flex gap-3 animate-fade-in">
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <p className="font-bold">Registro de Asistencia Almacenado</p>
              <p className="mt-1 leading-relaxed text-slate-500">{successBanner}</p>
            </div>
          </div>
        )}

        {obsSuccess && (
          <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-2xl text-xs text-indigo-800 flex gap-3 animate-fade-in">
            <Sparkles className="w-5 h-5 text-indigo-600 shrink-0" />
            <div>
              <p className="font-bold">Observación Procesada Correctamente</p>
              <p className="mt-1 leading-relaxed text-slate-500">{obsSuccess}</p>
            </div>
          </div>
        )}

        {/* HEADER DE MÓDULO */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <h1 className="text-lg font-black text-slate-800 tracking-tight flex items-center gap-2">
              📝 Tomar Asistencia Diaria
            </h1>
            <p className="text-xs text-slate-500">
              Selecciona el Grado, asigna el estado de asistencia a cada estudiante en segundos y presiona Guardar. El sistema procesa alertas instantáneas.
            </p>
          </div>

          {/* Selector de Grado */}
          <div className="flex items-center gap-2 bg-slate-50 p-2 px-3 rounded-xl border border-slate-200">
            <span className="text-xs font-bold text-slate-500">Curso:</span>
            <select
              value={selectedGradoId}
              onChange={(e) => setSelectedGradoId(e.target.value)}
              className="text-xs font-black text-brand-800 bg-transparent focus:outline-none cursor-pointer"
            >
              {grados.map(g => (
                <option key={g.id_grado} value={g.id_grado}>
                  {g.nombre_grado}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* PLANILLA DE ASISTENCIA */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          
          <div className="p-4.5 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs">
            <div>
              <span className="text-slate-400 font-medium">Fecha de Registro:</span>{' '}
              <strong className="text-slate-700 font-mono font-bold">{new Date().toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</strong>
            </div>
            
            <button
              onClick={() => {
                // Preseleccionar los estudiantes de este curso para la observación rápida
                if (estudiantes.length > 0) {
                  setObsEstudianteId(estudiantes[0].id_estudiante);
                }
                setShowObsForm(true);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-50 hover:bg-brand-100 text-brand-800 border border-brand-150 rounded-xl font-bold text-[11px] transition-all cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              Observación Rápida
            </button>
          </div>

          <form onSubmit={handleGuardarAsistencia} className="divide-y divide-slate-100">
            
            {estudiantes.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                No hay estudiantes registrados en este curso.
              </div>
            ) : (
              estudiantes.map((est, index) => {
                const temp = asistenciaTemp[est.id_estudiante] || { estado: 'Presente', observacion: '' };
                const iniciales = (est.nombres[0] || '') + (est.apellidos[0] || '');

                return (
                  <div key={est.id_estudiante} className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors">
                    
                    {/* INFO ESTUDIANTE */}
                    <div className="flex items-center gap-3 md:w-1/3">
                      <span className="text-xs text-slate-400 font-mono w-5">#{index + 1}</span>
                      <div className="w-9 h-9 bg-brand-50 border border-brand-100 rounded-lg flex items-center justify-center text-brand-800 font-bold text-xs shadow-xs">
                        {iniciales.toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-800 text-xs sm:text-sm truncate">
                          {est.nombres} {est.apellidos}
                        </p>
                        <p className="text-[10px] text-slate-500 font-mono">
                          {est.tipo_documento}: {est.numero_documento}
                        </p>
                      </div>
                    </div>

                    {/* BOTONES DIRECTOS (PRESENTE - AUSENTE - TARDE) */}
                    <div className="flex-1 flex flex-wrap gap-2 items-center">
                      {(['Presente', 'Ausente', 'Tarde', 'Excusado', 'Retirado'] as EstadoAsistencia[]).map(estOp => {
                        const esSeleccionado = temp.estado === estOp;
                        return (
                          <button
                            key={estOp}
                            type="button"
                            onClick={() => handleEstadoChange(est.id_estudiante, estOp)}
                            className={`px-3 py-2 text-[10px] sm:text-xs font-bold rounded-lg uppercase tracking-wide cursor-pointer transition-all ${
                              esSeleccionado 
                                ? getBadgeClass(estOp)
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-500 border border-transparent'
                            }`}
                          >
                            {estOp}
                          </button>
                        );
                      })}
                    </div>

                    {/* MENSAJE INDIVIDUAL */}
                    <div className="md:w-1/4">
                      <input
                        type="text"
                        placeholder="Novedad / Excusa"
                        value={temp.observacion}
                        onChange={(e) => handleObservacionChange(est.id_estudiante, e.target.value)}
                        className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded focus:outline-none focus:border-brand-600 focus:bg-white text-slate-800"
                      />
                    </div>

                  </div>
                );
              })
            )}

            {/* SECCIÓN GUARDAR */}
            {estudiantes.length > 0 && (
              <div className="p-5 bg-slate-50 flex flex-col sm:flex-row justify-between items-center gap-3">
                <div className="flex items-center gap-2 text-slate-500 text-[11px]">
                  <Info className="w-4 h-4 text-brand-600 shrink-0" />
                  <span>Al guardar, se enviarán automáticamente notificaciones de novedades a los guardianes legales.</span>
                </div>
                
                <button
                  type="submit"
                  className="w-full sm:w-auto px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Guardar Planilla de Asistencia
                </button>
              </div>
            )}

          </form>

        </div>

        {/* FORMULARIO FLOTANTE / EXPANDIDO DE REGISTRO DISCIPLINARIO (HOJA DE VIDA) */}
        {showObsForm && (
          <div className="bg-slate-900/30 backdrop-blur-xs fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden animate-scale-up">
              
              <div className="bg-brand-950 p-4 text-white flex justify-between items-center">
                <div>
                  <h3 className="font-display font-black text-sm">Crear Observación de Bitácora Estudiantil</h3>
                  <p className="text-[10px] text-brand-100">Registrado en la Hoja de Vida Legal del Alumno</p>
                </div>
                <button
                  onClick={() => setShowObsForm(false)}
                  className="text-slate-300 hover:text-white font-bold text-lg p-1 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCrearObservacion} className="p-5 sm:p-6 space-y-4">
                
                {/* Estudiante Selection */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700">Estudiante Correspondiente</label>
                  <select
                    value={obsEstudianteId}
                    onChange={(e) => setObsEstudianteId(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:bg-white text-slate-800"
                  >
                    <option value="">-- Elegir Alumno --</option>
                    {estudiantes.map(e => (
                      <option key={e.id_estudiante} value={e.id_estudiante}>
                        {e.nombres} {e.apellidos}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Tipo de Observación */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-700">Tipo Anotación</label>
                    <select
                      value={obsTipo}
                      onChange={(e) => setObsTipo(e.target.value as TipoObservacion)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:bg-white text-slate-800"
                    >
                      <option value="Convivencial">Convivencial</option>
                      <option value="Disciplinaria">Disciplinaria</option>
                      <option value="Académica">Académica</option>
                      <option value="Reconocimiento positivo">Reconocimiento positivo</option>
                      <option value="Seguimiento general">Seguimiento general</option>
                    </select>
                  </div>

                  {/* Nivel de Gravedad */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-700">Gravedad</label>
                    <select
                      value={obsGravedad}
                      onChange={(e) => setObsGravedad(e.target.value as NivelGravedad)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:bg-white text-slate-800"
                    >
                      <option value="Bajo">Nivel Bajo</option>
                      <option value="Medio">Nivel Medio</option>
                      <option value="Alto">Nivel Alto (Urgente)</option>
                      <option value="Crítico">Crítico (Expedición)</option>
                    </select>
                  </div>
                </div>

                {/* Categoría o Título Corto */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700">Categoría o Incidente</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Inasistencia verbal, Disrupción recurrente, Felicitación de foro"
                    value={obsCategoria}
                    onChange={(e) => setObsCategoria(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:bg-white text-slate-800"
                  />
                </div>

                {/* Descripción Detallada */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700">Hechos ocurridos y evidencias</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Escriba los pormenores y compromisos de manera neutral..."
                    value={obsDescripcion}
                    onChange={(e) => setObsDescripcion(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:bg-white text-slate-800"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setShowObsForm(false)}
                    className="px-4 py-2 border border-slate-200 text-slate-500 rounded-lg hover:bg-slate-100 cursor-pointer"
                  >
                    Salir
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-brand-800 text-white rounded-lg hover:bg-brand-700 font-bold shadow cursor-pointer"
                  >
                    Registrar Observación
                  </button>
                </div>

              </form>
            </div>
          </div>
        )}

      </div>

      {/* FOOTER */}
      <footer className="bg-slate-900 text-slate-400 py-6 mt-auto text-xs text-center border-t border-slate-800">
        <p>© 2026 Instituto Bolivariano - Planilla de Control Móvil. Versión 1.4.0</p>
      </footer>

    </div>
  );
}
