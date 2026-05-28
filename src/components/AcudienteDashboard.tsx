import React, { useState, useEffect } from 'react';
import { 
  LogOut, ShieldCheck, Clock, AlertTriangle, FileSignature, 
  CheckCircle2, AlertCircle, Info, ChevronRight, Activity, CalendarDays, X
} from 'lucide-react';
import { Usuario, Estudiante, Asistencia, Observacion, Notificacion, Confirmacion } from '../types';
import { db } from '../data';

interface AcudienteDashboardProps {
  usuario: Usuario;
  onLogout: () => void;
}

export default function AcudienteDashboard({ usuario, onLogout }: AcudienteDashboardProps) {
  const [acudidos, setAcudidos] = useState<Estudiante[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string>('');
  
  const [childAsistencias, setChildAsistencias] = useState<Asistencia[]>([]);
  const [childObservaciones, setChildObservaciones] = useState<Observacion[]>([]);
  const [parentNotificaciones, setParentNotificaciones] = useState<Notificacion[]>([]);
  const [confirmaciones, setConfirmaciones] = useState<Confirmacion[]>([]);

  const [signNotiId, setSignNotiId] = useState<string | null>(null);
  const [signComment, setSignComment] = useState<string>('');
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'resumen' | 'libro'>('resumen');

  useEffect(() => {
    const relaciones = db.getRelaciones().filter(r => r.id_acudiente === usuario.id_usuario);
    const todosEst = db.getEstudiantes();
    const filtrados = todosEst.filter(e => relaciones.some(r => r.id_estudiante === e.id_estudiante));
    setAcudidos(filtrados);
    
    if (filtrados.length > 0 && !selectedChildId) {
      setSelectedChildId(filtrados[0].id_estudiante);
    }
  }, [usuario]);

  useEffect(() => {
    if (selectedChildId) {
      const allAsistencias = db.getAsistencias()
        .filter(a => a.id_estudiante === selectedChildId)
        .sort((a,b) => b.fecha.localeCompare(a.fecha));
      setChildAsistencias(allAsistencias);

      const allObservaciones = db.getObservaciones()
        .filter(o => o.id_estudiante === selectedChildId)
        .sort((a,b) => b.fecha_observacion.localeCompare(a.fecha_observacion));
      setChildObservaciones(allObservaciones);

      const allNotis = db.getNotificaciones()
        .filter(n => n.id_acudiente === usuario.id_usuario && n.id_estudiante === selectedChildId)
        .sort((a,b) => b.fecha_envio.localeCompare(a.fecha_envio));
      setParentNotificaciones(allNotis);

      setConfirmaciones(db.getConfirmaciones().filter(c => c.id_acudiente === usuario.id_usuario));
    }
  }, [selectedChildId, refreshKey]);

  const handleSignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!signNotiId) return;

    db.confirmarNotificacion(
      signNotiId,
      usuario.id_usuario,
      signComment || 'Leído y enterado.',
      `${usuario.nombres} ${usuario.apellidos}`
    );

    setSignNotiId(null);
    setSignComment('');
    setRefreshKey(prev => prev + 1);
  };

  const currentChild = acudidos.find(e => e.id_estudiante === selectedChildId);

  // Semáforo Logic
  let semaforo = 'verde';
  if (childObservaciones.some(o => o.nivel_gravedad === 'Crítico' || o.nivel_gravedad === 'Alto')) {
    semaforo = 'rojo';
  } else if (
    childObservaciones.some(o => o.nivel_gravedad === 'Medio') || 
    childAsistencias.some(a => a.estado_asistencia === 'Ausente' || a.estado_asistencia === 'Tarde')
  ) {
    semaforo = 'amarillo';
  }

  const semaforoColors = {
    verde: 'bg-emerald-500 shadow-emerald-500/40',
    amarillo: 'bg-amber-400 shadow-amber-400/40',
    rojo: 'bg-rose-500 shadow-rose-500/40'
  };

  const semaforoTexts = {
    verde: 'Sin problemas recientes',
    amarillo: 'Atención: Problemas menores / Llegadas tarde',
    rojo: 'Alerta: Faltas graves disciplinarias'
  };

  const notisPendientes = parentNotificaciones.filter(n => n.estado_envio !== 'Confirmada');

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 selection:bg-brand-500 selection:text-white">
      {/* HEADER */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-900 rounded-xl flex items-center justify-center text-white font-black text-lg">IB</div>
            <div>
              <h1 className="text-sm font-black text-slate-900">Instituto Bolivariano</h1>
              <p className="text-xs font-semibold text-slate-500">Acudiente de {usuario.nombres}</p>
            </div>
          </div>
          <button onClick={onLogout} className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors">
            <LogOut className="w-4 h-4" />
            Cerrar Sesión
          </button>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        
        {/* TABS PARA HIJOS */}
        {acudidos.length > 1 && (
          <div className="flex gap-2 p-1.5 bg-slate-200/50 rounded-2xl w-max border border-slate-200 backdrop-blur-md">
            {acudidos.map(acu => (
              <button
                key={acu.id_estudiante}
                onClick={() => setSelectedChildId(acu.id_estudiante)}
                className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
                  selectedChildId === acu.id_estudiante 
                    ? 'bg-white text-brand-900 shadow-sm ring-1 ring-slate-200' 
                    : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'
                }`}
              >
                {acu.nombres}
              </button>
            ))}
          </div>
        )}

        {/* TABS DE SECCIÓN (Resumen / Libro) */}
        {currentChild && (
          <div className="flex gap-4 border-b border-slate-200 mb-6 px-1">
            <button
              onClick={() => setActiveTab('resumen')}
              className={`py-2 px-4 font-bold text-sm border-b-2 transition-colors -mb-[1px] ${
                activeTab === 'resumen' ? 'border-brand-600 text-brand-900' : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              Resumen y Asistencia
            </button>
            <button
              onClick={() => setActiveTab('libro')}
              className={`py-2 px-4 font-bold text-sm border-b-2 transition-colors -mb-[1px] ${
                activeTab === 'libro' ? 'border-brand-600 text-brand-900' : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              Libro Convivencial y Firmas
            </button>
          </div>
        )}

        {currentChild && activeTab === 'resumen' && (
          <>
            {/* CABECERA Y SEMÁFORO */}
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                <ShieldCheck className="w-48 h-48" />
              </div>
              
              <div className="space-y-2 relative z-10 text-center md:text-left w-full">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-slate-100 text-slate-600 border border-slate-200">
                  Estudiante Activo
                </span>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">{currentChild.nombres} {currentChild.apellidos}</h2>
                <p className="text-sm font-medium text-slate-500">Grado: {currentChild.grado_id} • Jornada {currentChild.jornada}</p>
              </div>

              {/* SEMÁFORO */}
              <div className="relative z-10 flex flex-col items-center gap-3 bg-slate-50 p-6 rounded-2xl border border-slate-200 min-w-[280px]">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Estado de Comportamiento</p>
                <div className="flex gap-4">
                  <div className={`w-10 h-10 rounded-full border-4 border-white shadow-xl flex items-center justify-center transition-all duration-500 ${semaforo === 'verde' ? semaforoColors.verde + ' scale-110' : 'bg-slate-200 opacity-30 grayscale'}`} />
                  <div className={`w-10 h-10 rounded-full border-4 border-white shadow-xl flex items-center justify-center transition-all duration-500 ${semaforo === 'amarillo' ? semaforoColors.amarillo + ' scale-110' : 'bg-slate-200 opacity-30 grayscale'}`} />
                  <div className={`w-10 h-10 rounded-full border-4 border-white shadow-xl flex items-center justify-center transition-all duration-500 ${semaforo === 'rojo' ? semaforoColors.rojo + ' scale-110' : 'bg-slate-200 opacity-30 grayscale'}`} />
                </div>
                <p className={`text-xs font-bold ${
                  semaforo === 'verde' ? 'text-emerald-600' : semaforo === 'amarillo' ? 'text-amber-600' : 'text-rose-600'
                }`}>
                  {semaforoTexts[semaforo as keyof typeof semaforoTexts]}
                </p>
              </div>
            </div>

            {/* BANNER DE CONFIRMACIÓN LEGAL */}
            {notisPendientes.length > 0 && (
              <div className="bg-amber-400 p-6 sm:p-8 rounded-3xl shadow-lg border-2 border-amber-500 text-amber-950 flex flex-col md:flex-row items-center justify-between gap-6 animate-in fade-in slide-in-from-top-4">
                <div className="flex items-start gap-4">
                  <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm">
                    <FileSignature className="w-8 h-8" />
                  </div>
                  <div className="space-y-1 text-left">
                    <h3 className="text-xl font-black tracking-tight">Acción Legal Requerida</h3>
                    <p className="text-sm font-semibold opacity-90 max-w-xl">
                      Tienes {notisPendientes.length} circular(es) institucional(es) o notificación(es) disciplinaria(es) que requiere(n) firma digital inmediata.
                    </p>
                  </div>
                </div>
                <div className="w-full md:w-auto shrink-0 flex flex-col gap-3 bg-white/20 p-4 rounded-2xl backdrop-blur-sm">
                  {notisPendientes.map(noti => (
                    <div key={noti.id_notificacion} className="flex flex-col gap-2">
                      <div className="flex justify-between items-center text-xs font-bold border-b border-amber-500/20 pb-2">
                        <span>{noti.asunto}</span>
                      </div>
                      {signNotiId === noti.id_notificacion ? (
                        <form onSubmit={handleSignSubmit} className="flex gap-2">
                          <input 
                            type="text" 
                            required 
                            placeholder="Comentario de enterado..." 
                            value={signComment} 
                            onChange={e => setSignComment(e.target.value)}
                            className="w-full text-xs p-2 rounded-lg bg-white/50 border border-amber-500/30 placeholder-amber-900/40 focus:outline-none focus:bg-white"
                          />
                          <button type="submit" className="px-3 py-2 bg-amber-900 hover:bg-amber-950 text-white font-bold text-xs rounded-lg transition-colors">
                            Firmar
                          </button>
                        </form>
                      ) : (
                        <button 
                          onClick={() => setSignNotiId(noti.id_notificacion)} 
                          className="w-full py-2 bg-amber-900 hover:bg-amber-950 text-white font-bold text-xs rounded-lg transition-colors shadow-sm"
                        >
                          Firmar Documento
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CALENDARIO MENSUAL */}
            <div>
              <div className="flex items-center gap-2 mb-6">
                <CalendarDays className="w-5 h-5 text-brand-600" />
                <h3 className="text-xl font-black text-slate-900">Vista de Asistencia y Observaciones</h3>
              </div>
              
              <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h4 className="text-lg font-black text-slate-800 uppercase tracking-wide">Mayo 2026</h4>
                </div>
                <div className="grid grid-cols-7 gap-2 md:gap-4">
                  {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(day => (
                    <div key={day} className="text-center text-xs font-black text-slate-400 uppercase tracking-widest pb-2">{day}</div>
                  ))}
                  
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={`empty-${i}`} className="h-20 md:h-24 rounded-2xl bg-slate-50/50 border border-slate-100/50"></div>
                  ))}
                  
                  {Array.from({ length: 31 }).map((_, i) => {
                    const day = i + 1;
                    const dateStr = `2026-05-${day.toString().padStart(2, '0')}`;
                    const asis = childAsistencias.find(a => a.fecha === dateStr);
                    const hasObs = childObservaciones.some(o => o.fecha_observacion === dateStr);
                    
                    let bgClass = "bg-white border-slate-200 hover:border-brand-300 hover:shadow-md";
                    if (asis) {
                      if (asis.estado_asistencia === 'Presente') bgClass = "bg-emerald-50 border-emerald-200 hover:border-emerald-400 hover:shadow-emerald-100";
                      else if (asis.estado_asistencia === 'Tarde') bgClass = "bg-amber-50 border-amber-200 hover:border-amber-400 hover:shadow-amber-100";
                      else if (asis.estado_asistencia === 'Ausente') bgClass = "bg-rose-50 border-rose-200 hover:border-rose-400 hover:shadow-rose-100";
                    }

                    return (
                      <button 
                        key={day}
                        onClick={() => setSelectedDate(dateStr)}
                        className={`h-20 md:h-24 rounded-2xl border transition-all duration-300 relative flex flex-col p-3 items-end justify-between group shadow-sm ${bgClass}`}
                      >
                        <span className={`text-sm font-black ${asis ? 'text-slate-900' : 'text-slate-600'}`}>{day}</span>
                        <div className="flex w-full justify-start items-center gap-1.5 mt-auto">
                          {hasObs && (
                            <div className="w-2.5 h-2.5 rounded-full bg-slate-900 shadow-sm ring-2 ring-white/50" title="Observación disciplinaria" />
                          )}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          </>
        )}

        {currentChild && activeTab === 'libro' && (
          <div className="space-y-8 animate-in fade-in">
            {/* CABECERA Y SEMÁFORO DEL ESTUDIANTE */}
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                <ShieldCheck className="w-48 h-48" />
              </div>
              <div className="space-y-2 relative z-10 text-center md:text-left w-full">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-slate-100 text-slate-600 border border-slate-200">
                  Libro Convivencial
                </span>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">{currentChild.nombres} {currentChild.apellidos}</h2>
              </div>
            </div>

            {/* LISTA DE OBSERVACIONES */}
            <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-2 mb-6">
                <FileSignature className="w-5 h-5 text-brand-600" />
                <h3 className="text-xl font-black text-slate-900">Registro de Observaciones</h3>
              </div>
              <div className="space-y-4">
                {childObservaciones.length === 0 ? (
                  <p className="text-slate-500 font-semibold text-sm">No hay observaciones registradas.</p>
                ) : (
                  childObservaciones.map(obs => (
                    <div key={obs.id_observacion} className={`p-4 rounded-2xl border ${
                      obs.nivel_gravedad === 'Crítico' || obs.nivel_gravedad === 'Alto' ? 'bg-rose-50 border-rose-200 text-rose-900' : 'bg-indigo-50 border-indigo-200 text-indigo-900'
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {obs.nivel_gravedad === 'Crítico' || obs.nivel_gravedad === 'Alto' ? 
                            <AlertTriangle className="w-5 h-5 text-rose-500" /> : 
                            <Info className="w-5 h-5 text-indigo-500" />
                          }
                          <span className="font-bold">{obs.tipo_observacion} - {obs.nivel_gravedad}</span>
                        </div>
                        <span className="text-xs font-bold opacity-70">{obs.fecha_observacion}</span>
                      </div>
                      <p className="text-sm opacity-80 font-medium ml-7">{obs.descripcion}</p>
                      <div className="mt-3 pt-3 border-t border-black/5 text-xs opacity-60 font-semibold flex items-center justify-between ml-7">
                        <span>Registrado por: {obs.registrado_por}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* SECCIÓN DE FIRMAS */}
            <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-2 mb-6">
                <ShieldCheck className="w-5 h-5 text-brand-600" />
                <h3 className="text-xl font-black text-slate-900">Firmas Pendientes e Historial</h3>
              </div>
              
              <div className="space-y-6">
                {notisPendientes.length === 0 ? (
                  <p className="text-slate-500 font-semibold text-sm">No tienes firmas pendientes.</p>
                ) : (
                  <div className="space-y-4">
                    <h4 className="text-sm font-black text-rose-600 uppercase tracking-widest">Requiere Firma Inmediata</h4>
                    {notisPendientes.map(noti => (
                      <div key={noti.id_notificacion} className="bg-amber-50 p-4 rounded-2xl border border-amber-200">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h5 className="font-bold text-amber-900">{noti.asunto}</h5>
                            <p className="text-xs text-amber-700/80 mt-1">{noti.mensaje}</p>
                            <p className="text-xs font-semibold text-amber-600 mt-2">Fecha: {noti.fecha_envio}</p>
                          </div>
                        </div>
                        {signNotiId === noti.id_notificacion ? (
                          <form onSubmit={handleSignSubmit} className="flex gap-2 mt-4">
                            <input 
                              type="text" 
                              required 
                              placeholder="Comentario de enterado..." 
                              value={signComment} 
                              onChange={e => setSignComment(e.target.value)}
                              className="w-full text-xs p-2 rounded-lg bg-white border border-amber-300 placeholder-amber-400 focus:outline-none focus:border-amber-500"
                            />
                            <button type="submit" className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-lg transition-colors">
                              Firmar
                            </button>
                          </form>
                        ) : (
                          <button 
                            onClick={() => setSignNotiId(noti.id_notificacion)} 
                            className="mt-4 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-lg transition-colors shadow-sm"
                          >
                            Firmar Documento
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {confirmaciones.length > 0 && (
                  <div className="space-y-4 mt-8 pt-8 border-t border-slate-100">
                    <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest">Historial de Firmas</h4>
                    {confirmaciones.map(conf => {
                      const noti = parentNotificaciones.find(n => n.id_notificacion === conf.id_notificacion);
                      return (
                        <div key={conf.id_confirmacion} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-start gap-3">
                          <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5 shrink-0" />
                          <div>
                            <h5 className="font-bold text-slate-700">{noti?.asunto || 'Documento firmado'}</h5>
                            <p className="text-xs text-slate-500 mt-1">Comentario: "{conf.comentario_acudiente}"</p>
                            <p className="text-[10px] font-bold text-slate-400 mt-2">Firmado el: {conf.fecha_confirmacion}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* MODAL DE DETALLES DEL DÍA */}
      {selectedDate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-black text-slate-800 text-lg">Detalles del {selectedDate}</h3>
              <button onClick={() => setSelectedDate(null)} className="text-slate-400 hover:text-slate-600 transition-colors p-2 bg-white rounded-xl shadow-sm border border-slate-200">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              {(() => {
                const asis = childAsistencias.find(a => a.fecha === selectedDate);
                const obsList = childObservaciones.filter(o => o.fecha_observacion === selectedDate);
                
                if (!asis && obsList.length === 0) {
                  return (
                    <div className="text-center py-8 text-slate-400 font-semibold text-sm">
                      No hay registros para este día.
                    </div>
                  );
                }

                return (
                  <>
                    {asis && (
                      <div className="space-y-2">
                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Asistencia</h4>
                        <div className={`p-4 rounded-2xl border ${
                          asis.estado_asistencia === 'Presente' ? 'bg-emerald-50 border-emerald-200 text-emerald-900' :
                          asis.estado_asistencia === 'Tarde' ? 'bg-amber-50 border-amber-200 text-amber-900' :
                          'bg-rose-50 border-rose-200 text-rose-900'
                        }`}>
                          <div className="flex items-center gap-2 mb-1">
                            {asis.estado_asistencia === 'Presente' ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> :
                             asis.estado_asistencia === 'Tarde' ? <Clock className="w-5 h-5 text-amber-500" /> :
                             <AlertCircle className="w-5 h-5 text-rose-500" />}
                            <span className="font-bold">{asis.estado_asistencia}</span>
                          </div>
                          <p className="text-sm opacity-80 font-medium ml-7">{asis.observacion || 'Sin novedad en el registro.'}</p>
                          <div className="mt-3 pt-3 border-t border-black/5 text-xs opacity-60 font-semibold flex items-center gap-2 ml-7">
                            Registrado por: {asis.registrado_por}
                          </div>
                        </div>
                      </div>
                    )}

                    {obsList.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Observaciones Disciplinarias</h4>
                        <div className="space-y-3">
                          {obsList.map(obs => (
                            <div key={obs.id_observacion} className={`p-4 rounded-2xl border ${
                              obs.nivel_gravedad === 'Crítico' || obs.nivel_gravedad === 'Alto' ? 'bg-rose-50 border-rose-200 text-rose-900' : 'bg-indigo-50 border-indigo-200 text-indigo-900'
                            }`}>
                              <div className="flex items-center gap-2 mb-1">
                                {obs.nivel_gravedad === 'Crítico' || obs.nivel_gravedad === 'Alto' ? 
                                  <AlertTriangle className="w-5 h-5 text-rose-500" /> : 
                                  <Info className="w-5 h-5 text-indigo-500" />
                                }
                                <span className="font-bold">{obs.tipo_observacion} - {obs.nivel_gravedad}</span>
                              </div>
                              <p className="text-sm opacity-80 font-medium ml-7">{obs.descripcion}</p>
                              <div className="mt-3 pt-3 border-t border-black/5 text-xs opacity-60 font-semibold flex items-center gap-2 ml-7">
                                Registrado por: {obs.registrado_por}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
