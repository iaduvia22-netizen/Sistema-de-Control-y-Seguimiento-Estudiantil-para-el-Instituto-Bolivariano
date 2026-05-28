import React, { useState, useEffect } from 'react';
import { 
  LogOut, ShieldCheck, Clock, AlertTriangle, FileSignature, 
  CheckCircle2, AlertCircle, Info, ChevronRight, Activity, CalendarDays
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

        {currentChild && (
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

            {/* TIMELINE SEMANAL */}
            <div>
              <div className="flex items-center gap-2 mb-6">
                <Activity className="w-5 h-5 text-brand-600" />
                <h3 className="text-xl font-black text-slate-900">Timeline de Eventos</h3>
              </div>
              
              <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm relative">
                <div className="absolute left-8 md:left-12 top-8 bottom-8 w-px bg-slate-200"></div>
                
                <div className="space-y-8">
                  {[...childAsistencias, ...childObservaciones].sort((a: any, b: any) => {
                    const dateA = a.fecha || a.fecha_observacion;
                    const dateB = b.fecha || b.fecha_observacion;
                    return dateB.localeCompare(dateA);
                  }).map((ev: any) => {
                    const isAsistencia = !!ev.estado_asistencia;
                    const date = ev.fecha || ev.fecha_observacion;
                    
                    let icon = <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
                    let iconBg = 'bg-emerald-100 border-emerald-200';
                    let cardStyle = 'border-slate-100 hover:border-slate-200 bg-white';
                    
                    if (isAsistencia && ev.estado_asistencia === 'Ausente') {
                      icon = <AlertCircle className="w-5 h-5 text-rose-500" />;
                      iconBg = 'bg-rose-100 border-rose-200';
                      cardStyle = 'bg-rose-50 border-rose-200';
                    } else if (isAsistencia && ev.estado_asistencia === 'Tarde') {
                      icon = <Clock className="w-5 h-5 text-amber-500" />;
                      iconBg = 'bg-amber-100 border-amber-200';
                    } else if (!isAsistencia) {
                      if (ev.nivel_gravedad === 'Crítico' || ev.nivel_gravedad === 'Alto') {
                        icon = <AlertTriangle className="w-5 h-5 text-rose-500" />;
                        iconBg = 'bg-rose-100 border-rose-200';
                        cardStyle = 'bg-rose-50 border-rose-200';
                      } else {
                        icon = <Info className="w-5 h-5 text-indigo-500" />;
                        iconBg = 'bg-indigo-100 border-indigo-200';
                      }
                    }

                    return (
                      <div key={ev.id_asistencia || ev.id_observacion} className="relative flex items-start gap-4 md:gap-8 group">
                        <div className={`w-10 h-10 shrink-0 rounded-2xl border-2 flex items-center justify-center relative z-10 shadow-sm transition-transform group-hover:scale-110 ${iconBg}`}>
                          {icon}
                        </div>
                        
                        <div className={`flex-1 p-5 rounded-2xl border transition-all duration-300 shadow-sm hover:shadow-md ${cardStyle}`}>
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                            <h4 className="font-bold text-slate-800">
                              {isAsistencia ? `Registro de Asistencia: ${ev.estado_asistencia}` : `Observación: ${ev.tipo_observacion}`}
                            </h4>
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-white px-2 py-1 rounded-md border border-slate-100">
                              {date}
                            </span>
                          </div>
                          <p className="text-sm text-slate-600 leading-relaxed font-medium">
                            {isAsistencia ? (ev.observacion || 'Sin novedad en el registro.') : ev.descripcion}
                          </p>
                          <div className="mt-3 pt-3 border-t border-black/5 text-xs text-slate-400 font-semibold flex items-center gap-2">
                            <CalendarDays className="w-3.5 h-3.5" />
                            Registrado por: {ev.registrado_por}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  
                  {[...childAsistencias, ...childObservaciones].length === 0 && (
                    <div className="text-center py-12 text-slate-400 font-semibold text-sm">
                      No hay eventos registrados en la línea de tiempo.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
