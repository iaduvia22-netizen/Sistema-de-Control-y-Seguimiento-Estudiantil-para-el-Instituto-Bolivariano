import React, { useState, useEffect } from 'react';
import { 
  User, LogOut, CheckCircle, AlertCircle, Clock, 
  MapPin, PlusCircle, Save, Info, Sparkles,
  Users, ChevronLeft, ChevronRight, MoreVertical, FileText
} from 'lucide-react';
import { Usuario, Grado, Estudiante, Asistencia, EstadoAsistencia, TipoObservacion, NivelGravedad } from '../types';
import { db } from '../data';

interface DocenteDashboardProps {
  usuario: Usuario;
  onLogout: () => void;
}

export default function DocenteDashboard({ usuario, onLogout }: DocenteDashboardProps) {
  const [grados, setGrados] = useState<Grado[]>([]);
  const [selectedGradoId, setSelectedGradoId] = useState<string | null>(null);
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
  
  const [asistenciaTemp, setAsistenciaTemp] = useState<Record<string, { 
    estado: EstadoAsistencia; 
    observacion: string;
    yaIngreso?: boolean;
  }>>({});

  const [showObsForm, setShowObsForm] = useState(false);
  const [obsEstudianteId, setObsEstudianteId] = useState('');
  const [obsTipo, setObsTipo] = useState<TipoObservacion>('Convivencial');
  const [obsCategoria, setObsCategoria] = useState('');
  const [obsGravedad, setObsGravedad] = useState<NivelGravedad>('Bajo');
  const [obsDescripcion, setObsDescripcion] = useState('');
  
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const [successBanner, setSuccessBanner] = useState<string | null>(null);
  const [obsSuccess, setObsSuccess] = useState<string | null>(null);

  useEffect(() => {
    const todosGrados = db.getGrados();
    // Filtrar para que el docente solo vea los cursos que le han delegado
    const misGrados = todosGrados.filter(g => g.director_grupo_id === usuario.id_usuario);
    setGrados(misGrados);
  }, [usuario]);

  useEffect(() => {
    if (selectedGradoId) {
      const todosEst = db.getEstudiantes();
      const filtrados = todosEst.filter(e => e.grado_id === selectedGradoId);
      setEstudiantes(filtrados);

      const hoyStr = new Date().toISOString().substring(0, 10);
      const asistenciasHoy = db.getAsistencias().filter(a => a.fecha === hoyStr);

      const mapInicial: Record<string, { estado: EstadoAsistencia; observacion: string; yaIngreso?: boolean }> = {};
      filtrados.forEach(est => {
        const existente = asistenciasHoy.find(a => a.id_estudiante === est.id_estudiante);
        const yaIngreso = existente?.estado_asistencia === 'Presente';
        mapInicial[est.id_estudiante] = {
          estado: existente ? existente.estado_asistencia : 'Presente',
          observacion: existente ? existente.observacion : '',
          yaIngreso
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

  const handleAsistenciaMasiva = (estado: EstadoAsistencia) => {
    setAsistenciaTemp(prev => {
      const nuevo = { ...prev };
      Object.keys(nuevo).forEach(id => {
        nuevo[id] = { ...nuevo[id], estado };
      });
      return nuevo;
    });
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
    if (!selectedGradoId) return;

    const hoyStr = new Date().toISOString().substring(0, 10);
    const ahoraStr = new Date().toTimeString().split(' ')[0];

    const nuevasAsistencias: Asistencia[] = estudiantes
      .filter(est => {
        const temp = asistenciaTemp[est.id_estudiante];
        return !(temp?.yaIngreso); // no re-guardamos los que ya entraron por portería
      })
      .map(est => {
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
    setSuccessBanner('¡Planilla de asistencia guardada correctamente! Acudientes notificados.');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => setSuccessBanner(null), 6000);
  };

  const openObservacionModal = (estId: string) => {
    setObsEstudianteId(estId);
    setShowObsForm(true);
    setActiveMenuId(null);
  };

  const handleCrearObservacion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!obsEstudianteId || !obsCategoria || !obsDescripcion) {
      alert('Por favor complete los campos obligatorios.');
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

    setObsEstudianteId('');
    setObsCategoria('');
    setObsDescripcion('');
    setObsGravedad('Bajo');
    setShowObsForm(false);
    
    setObsSuccess('¡Observación registrada con éxito en el libro de vida!');
    setTimeout(() => setObsSuccess(null), 5000);
  };

  const getBadgeClass = (estado: EstadoAsistencia) => {
    switch (estado) {
      case 'Presente': return 'bg-emerald-500 text-white shadow-emerald-500/30 shadow-sm';
      case 'Ausente': return 'bg-rose-500 text-white shadow-rose-500/30 shadow-sm';
      case 'Tarde': return 'bg-amber-400 text-amber-950 shadow-amber-400/30 shadow-sm';
      case 'Excusado': return 'bg-sky-500 text-white shadow-sky-500/30 shadow-sm';
      case 'Retirado': return 'bg-slate-500 text-white shadow-slate-500/30 shadow-sm';
      default: return 'bg-slate-100 text-slate-500 hover:bg-slate-200';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-brand-500 selection:text-white">
      
      {/* TOPBAR */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-sm">IB</div>
            <div>
              <h1 className="text-sm font-black text-slate-900 tracking-tight">Portal Docente</h1>
              <p className="text-xs font-semibold text-slate-500">Prof. {usuario.nombres}</p>
            </div>
          </div>
          <button onClick={onLogout} className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors">
            <LogOut className="w-4 h-4" />
            Cerrar Sesión
          </button>
        </div>
      </nav>

      {/* ALERTS */}
      <div className="max-w-7xl mx-auto px-6 pt-6 w-full space-y-4">
        {successBanner && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 flex gap-3 shadow-sm animate-in fade-in slide-in-from-top-4">
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <p className="font-bold text-sm">Registro Guardado</p>
              <p className="mt-0.5 font-medium">{successBanner}</p>
            </div>
          </div>
        )}
        {obsSuccess && (
          <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-2xl text-xs text-indigo-800 flex gap-3 shadow-sm animate-in fade-in slide-in-from-top-4">
            <Sparkles className="w-5 h-5 text-indigo-600 shrink-0" />
            <div>
              <p className="font-bold text-sm">Observación Creada</p>
              <p className="mt-0.5 font-medium">{obsSuccess}</p>
            </div>
          </div>
        )}
      </div>

      <main className="max-w-7xl mx-auto px-6 py-6 flex-1 w-full flex flex-col">
        {!selectedGradoId ? (
          /* VISTA PRINCIPAL: GRID DE GRADOS */
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Salones Asignados</h2>
              <p className="text-sm font-medium text-slate-500">Seleccione un salón para registrar asistencia o anotar observaciones.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {grados.map(grado => {
                const totalEstudiantes = db.getEstudiantes().filter(e => e.grado_id === grado.id_grado).length;
                return (
                  <button 
                    key={grado.id_grado} 
                    onClick={() => setSelectedGradoId(grado.id_grado)}
                    className="group bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-brand-300 hover:ring-4 hover:ring-brand-500/10 transition-all duration-300 text-left relative overflow-hidden flex flex-col justify-between min-h-[200px]"
                  >
                    <div className="absolute -right-8 -top-8 opacity-5 group-hover:opacity-10 transition-opacity">
                      <Users className="w-48 h-48 text-brand-600" />
                    </div>
                    <div>
                      <div className="inline-flex px-3 py-1 bg-brand-50 text-brand-700 text-[10px] font-black uppercase tracking-widest rounded-lg mb-4">
                        Jornada {grado.jornada}
                      </div>
                      <h3 className="text-2xl font-black text-slate-900 group-hover:text-brand-600 transition-colors">
                        {grado.nombre_grado}
                      </h3>
                      <p className="text-sm font-bold text-slate-500 mt-1">Grupo {grado.grupo}</p>
                    </div>
                    <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-slate-600">
                      <span className="text-sm font-semibold flex items-center gap-2">
                        <Users className="w-4 h-4" /> {totalEstudiantes} Estudiantes
                      </span>
                      <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-brand-500 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          /* VISTA SECUNDARIA: LISTA DE ESTUDIANTES */
          <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-300">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 md:p-6 rounded-3xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setSelectedGradoId(null)}
                  className="w-10 h-10 flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div>
                  <h2 className="text-xl font-black text-slate-900">{grados.find(g => g.id_grado === selectedGradoId)?.nombre_grado}</h2>
                  <p className="text-xs font-semibold text-slate-500">Planilla de Asistencia • {new Date().toLocaleDateString('es-CO', { dateStyle: 'medium' })}</p>
                </div>
              </div>
              
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-slate-400 uppercase mr-2">Acción Rápida:</span>
                <button type="button" onClick={() => handleAsistenciaMasiva('Presente')} className="px-3 py-1.5 bg-emerald-100 text-emerald-800 hover:bg-emerald-200 font-bold text-xs rounded-lg transition-colors">
                  Todos Presentes
                </button>
                <button type="button" onClick={() => handleAsistenciaMasiva('Ausente')} className="px-3 py-1.5 bg-rose-100 text-rose-800 hover:bg-rose-200 font-bold text-xs rounded-lg transition-colors">
                  Todos Ausentes
                </button>
              </div>
            </div>

            <form onSubmit={handleGuardarAsistencia} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="divide-y divide-slate-100">
                {estudiantes.length === 0 ? (
                  <div className="p-12 text-center text-slate-400 font-semibold text-sm">
                    No hay estudiantes registrados en este curso.
                  </div>
                ) : (
                  estudiantes.map((est, index) => {
                    const temp = asistenciaTemp[est.id_estudiante] || { estado: 'Presente', observacion: '' };
                    const iniciales = (est.nombres[0] || '') + (est.apellidos[0] || '');
                    
                    return (
                      <div key={est.id_estudiante} className="p-4 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6 hover:bg-slate-50/50 transition-colors group">
                        
                        {/* ESTUDIANTE INFO */}
                        <div className="flex items-center gap-4 lg:w-[35%]">
                          <span className="text-xs text-slate-300 font-black w-6">{index + 1}.</span>
                          <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500 font-black text-sm">
                            {iniciales.toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 truncate flex items-center gap-2">
                              {est.nombres} {est.apellidos}
                              {temp.yaIngreso && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase tracking-wider rounded-md" title="Ingresó por Portería">
                                  <CheckCircle className="w-3 h-3" /> Kiosco
                                </span>
                              )}
                            </p>
                            <p className="text-[11px] font-semibold text-slate-400">
                              ID: {est.numero_documento}
                            </p>
                          </div>
                        </div>

                        {/* SELECTOR DE ESTADOS */}
                        <div className="flex-1 flex flex-wrap gap-2 lg:justify-center">
                          {temp.yaIngreso ? (
                            <div className="px-4 py-2 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 w-full lg:w-auto justify-center">
                              <CheckCircle className="w-4 h-4" /> Ya ingresó por Portería
                            </div>
                          ) : (
                            (['Presente', 'Ausente', 'Tarde', 'Excusado', 'Retirado'] as EstadoAsistencia[]).map(estOp => {
                              const esSeleccionado = temp.estado === estOp;
                              return (
                                <button
                                  key={estOp}
                                  type="button"
                                  onClick={() => handleEstadoChange(est.id_estudiante, estOp)}
                                  className={`px-4 py-2 text-[11px] font-bold rounded-xl uppercase tracking-wider transition-all duration-200 ${
                                    esSeleccionado ? getBadgeClass(estOp) : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                                  }`}
                                >
                                  {estOp}
                                </button>
                              );
                            })
                          )}
                        </div>

                        {/* INPUT NOTA & MENU */}
                        <div className="lg:w-[30%] flex items-center gap-3 relative">
                          <input
                            type="text"
                            placeholder="Anotar novedad (opcional)..."
                            value={temp.observacion}
                            onChange={(e) => handleObservacionChange(est.id_estudiante, e.target.value)}
                            className="flex-1 px-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all font-medium"
                          />
                          
                          <div className="relative">
                            <button
                              type="button"
                              onClick={() => setActiveMenuId(activeMenuId === est.id_estudiante ? null : est.id_estudiante)}
                              className="w-9 h-9 flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-colors"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>
                            
                            {activeMenuId === est.id_estudiante && (
                              <div className="absolute right-0 top-12 w-48 bg-white border border-slate-200 rounded-2xl shadow-xl z-20 py-2 animate-in fade-in zoom-in-95 duration-200">
                                <button
                                  type="button"
                                  onClick={() => openObservacionModal(est.id_estudiante)}
                                  className="w-full px-4 py-2 text-left text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-brand-600 flex items-center gap-2"
                                >
                                  <FileText className="w-4 h-4" />
                                  Añadir Observación
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                      </div>
                    );
                  })
                )}
              </div>
              
              {estudiantes.length > 0 && (
                <div className="p-6 bg-slate-50/80 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                  <p className="text-xs font-semibold text-slate-500 flex items-center gap-2">
                    <Info className="w-4 h-4 text-brand-500" />
                    Las ausencias y retardos notificarán al acudiente automáticamente.
                  </p>
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-8 py-3 bg-brand-600 hover:bg-brand-700 text-white font-black text-sm rounded-xl shadow-lg shadow-brand-600/30 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Guardar Planilla de Asistencia
                  </button>
                </div>
              )}
            </form>
          </div>
        )}
      </main>

      {/* MODAL DE OBSERVACIONES */}
      {showObsForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowObsForm(false)}></div>
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden relative z-10 animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h3 className="font-black text-lg text-slate-900">Nueva Observación</h3>
                <p className="text-xs font-semibold text-slate-500">Libro de Vida Digital</p>
              </div>
              <button onClick={() => setShowObsForm(false)} className="w-8 h-8 flex items-center justify-center bg-slate-200 hover:bg-slate-300 text-slate-600 rounded-full transition-colors font-bold">
                ✕
              </button>
            </div>
            
            <form onSubmit={handleCrearObservacion} className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Tipo Anotación</label>
                  <select
                    value={obsTipo}
                    onChange={e => setObsTipo(e.target.value as TipoObservacion)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    <option value="Convivencial">Convivencial</option>
                    <option value="Disciplinaria">Disciplinaria</option>
                    <option value="Académica">Académica</option>
                    <option value="Reconocimiento positivo">Reconocimiento</option>
                    <option value="Seguimiento general">General</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Gravedad</label>
                  <select
                    value={obsGravedad}
                    onChange={e => setObsGravedad(e.target.value as NivelGravedad)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    <option value="Bajo">Nivel Bajo</option>
                    <option value="Medio">Nivel Medio</option>
                    <option value="Alto">Nivel Alto</option>
                    <option value="Crítico">Crítico</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Incidente o Título</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Excelente participación / Falta de respeto..."
                  value={obsCategoria}
                  onChange={e => setObsCategoria(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Descripción de los hechos</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Describa objetivamente lo ocurrido..."
                  value={obsDescripcion}
                  onChange={e => setObsDescripcion(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button type="button" onClick={() => setShowObsForm(false)} className="flex-1 py-3 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">
                  Cancelar
                </button>
                <button type="submit" className="flex-1 py-3 text-sm font-black text-white bg-brand-600 hover:bg-brand-700 shadow-md shadow-brand-500/20 rounded-xl transition-all">
                  Guardar Observación
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
