/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Users, Calendar, CheckSquare, Clock, AlertTriangle, 
  Send, PenTool, CheckCircle, Info, ThumbsUp, MapPin,
  Mail, Bell, Sparkles, MessageSquare, Shield, ChevronRight, FileText
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
  
  // States of current child
  const [childAsistencias, setChildAsistencias] = useState<Asistencia[]>([]);
  const [childObservaciones, setChildObservaciones] = useState<Observacion[]>([]);
  const [parentNotificaciones, setParentNotificaciones] = useState<Notificacion[]>([]);
  const [confirmaciones, setConfirmaciones] = useState<Confirmacion[]>([]);

  // Input elements for sign confirmation
  const [signNotiId, setSignNotiId] = useState<string | null>(null);
  const [signComment, setSignComment] = useState<string>('');
  const [justSignedId, setJustSignedId] = useState<string | null>(null);

  // Sync state
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    // Buscar estudiantes vinculados a este acudiente usando la tabla intermedia
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
      // Filtrar asistencias del representado
      const allAsistencias = db.getAsistencias()
        .filter(a => a.id_estudiante === selectedChildId)
        .sort((a,b) => b.fecha.localeCompare(a.fecha)); // Más reciente primero

      setChildAsistencias(allAsistencias);

      // Filtrar observaciones
      const allObservaciones = db.getObservaciones()
        .filter(o => o.id_estudiante === selectedChildId)
        .sort((a,b) => b.fecha_observacion.localeCompare(a.fecha_observacion));

      setChildObservaciones(allObservaciones);

      // Filtrar notificaciones enviadas a este acudiente sobre este representado
      const allNotis = db.getNotificaciones()
        .filter(n => n.id_acudiente === usuario.id_usuario && n.id_estudiante === selectedChildId)
        .sort((a,b) => b.fecha_envio.localeCompare(a.fecha_envio));

      setParentNotificaciones(allNotis);

      // Confirmaciones hechas por el acudiente
      setConfirmaciones(db.getConfirmaciones().filter(c => c.id_acudiente === usuario.id_usuario));
    }
  }, [selectedChildId, refreshKey]);

  const formatFechaEs = (fechaStr: string) => {
    try {
      const [year, month, day] = fechaStr.split('-');
      const dateObj = new Date(Number(year), Number(month) - 1, Number(day));
      return dateObj.toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' });
    } catch (e) {
      return fechaStr;
    }
  };

  const handleScrollToNoti = (idNoti: string) => {
    const el = document.getElementById(`noti-${idNoti}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setSignNotiId(idNoti);
    }
  };

  const handleSignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!signNotiId) return;

    db.confirmarNotificacion(
      signNotiId,
      usuario.id_usuario,
      signComment || 'Leído y enterado de la situación escolar de mi acudido.',
      `${usuario.nombres} ${usuario.apellidos}`
    );

    setJustSignedId(signNotiId);
    setSignNotiId(null);
    setSignComment('');
    setRefreshKey(prev => prev + 1);

    setTimeout(() => {
      setJustSignedId(null);
    }, 4000);
  };

  // Calcular porcentaje asistencia individual
  const totalClasesChild = childAsistencias.length;
  const fallasYRetrasos = childAsistencias.filter(a => a.estado_asistencia === 'Ausente' || a.estado_asistencia === 'Tarde').length;
  const asisPorcentaje = totalClasesChild > 0 
    ? Math.round(((totalClasesChild - childAsistencias.filter(a => a.estado_asistencia === 'Ausente').length) / totalClasesChild) * 100)
    : 100;

  const currentChild = acudidos.find(e => e.id_estudiante === selectedChildId);

  // Armar un Timeline Combinado de Eventos (Asistencia, Observaciones)
  interface TimelineEvent {
    id: string;
    fecha: string;
    hora?: string;
    tipo: 'asistencia' | 'observacion';
    titulo: string;
    detalle: string;
    badge: string;
    color: string;
    author: string;
  }

  const timelineEvents: TimelineEvent[] = [];

  childAsistencias.forEach(a => {
    let color = '';
    let badge = '';
    if (a.estado_asistencia === 'Presente') {
      color = 'bg-emerald-50 text-emerald-800 border-emerald-200';
      badge = '✅ Presente';
    } else if (a.estado_asistencia === 'Ausente') {
      color = 'bg-rose-50 text-rose-800 border-rose-200';
      badge = '❌ Ausente';
    } else if (a.estado_asistencia === 'Tarde') {
      color = 'bg-amber-50 text-amber-900 border-amber-200';
      badge = '⏰ Llegada Tarde';
    } else {
      color = 'bg-sky-50 text-sky-800 border-sky-200';
      badge = `ℹ️ ${a.estado_asistencia}`;
    }

    timelineEvents.push({
      id: a.id_asistencia,
      fecha: a.fecha,
      hora: a.hora_registro,
      tipo: 'asistencia',
      titulo: `Registro de Asistencia Diaria: ${badge}`,
      detalle: a.observacion || 'Ingresó regular al colegio durante el llamado de lista.',
      badge,
      color,
      author: a.registrado_por
    });
  });

  childObservaciones.forEach(o => {
    let color = 'bg-indigo-50 text-indigo-805 border-indigo-200';
    let label = `📋 ${o.tipo_observacion}`;

    if (o.nivel_gravedad === 'Crítico' || o.nivel_gravedad === 'Alto') {
      color = 'bg-red-50 text-red-800 border-red-200 animate-pulse';
    } else if (o.tipo_observacion === 'Reconocimiento positivo') {
      color = 'bg-emerald-50 text-emerald-800 border-emerald-200';
    }

    timelineEvents.push({
      id: o.id_observacion,
      fecha: o.fecha_observacion,
      tipo: 'observacion',
      titulo: `${label} - Nivel ${o.nivel_gravedad}`,
      detalle: `Concepto: "${o.categoria}". Hechos descritos: ${o.descripcion}`,
      badge: o.tipo_observacion,
      color,
      author: o.registrado_por
    });
  });

  // Ordenar timeline por fecha descendente
  const timelineOrdenado = timelineEvents.sort((a,b) => b.fecha.localeCompare(a.fecha));

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      
      {/* TOPBAR ACUDIENTE */}
      <nav className="bg-brand-950 text-white px-6 py-4 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-brand-900/60 p-2.5 rounded-xl text-emerald-400 border border-brand-800/30">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[9px] text-brand-200 uppercase tracking-widest font-black">Portal del Padre de Familia</p>
              <h2 className="text-sm font-bold text-white">{usuario.nombres} {usuario.apellidos}</h2>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="p-1.5 px-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-[11px] font-bold text-slate-300 hover:text-white transition-all cursor-pointer border border-slate-700"
          >
            Salir Portal
          </button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-8 flex-1 w-full space-y-6">
        
        {/* WELCOME / ESTUDIANTE RECIPIENT CHOOSER */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1">
            <h1 className="text-lg font-black text-slate-900 flex items-center gap-2 tracking-tight">
              👋 Bienvenido, {usuario.nombres.split(' ')[0]}
            </h1>
            <p className="text-xs text-slate-500">
              Consulta en vivo el avance conductual, boletines de inasistencia y firma autorizaciones rápidas.
            </p>
          </div>

          {/* Selector de hijos */}
          {acudidos.length > 1 && (
            <div className="flex items-center gap-2 bg-slate-50 p-2 px-3 border border-slate-200 rounded-xl">
              <span className="text-xs font-bold text-slate-500">Ver hijo:</span>
              <select
                value={selectedChildId}
                onChange={(e) => setSelectedChildId(e.target.value)}
                className="text-xs text-brand-800 font-bold bg-transparent focus:outline-none cursor-pointer"
              >
                {acudidos.map(acu => (
                  <option key={acu.id_estudiante} value={acu.id_estudiante}>
                    {acu.nombres} {acu.apellidos.split(' ')[0]}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* METRICAS DE ASISTENCIA RAPIDA HIJO */}
        {currentChild && (
          <div className="space-y-6">
            
            {/* PERFIL BASICO BANNER */}
            <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden">
              <div className="absolute right-0 top-0 opacity-10 pointer-events-none transform translate-x-12 -translate-y-12">
                <Users className="w-64 h-64 text-white" />
              </div>
              <div className="space-y-1.5 relative z-10">
                <span className="px-2.5 py-0.5 bg-emerald-500/20 border border-emerald-500/40 rounded-full text-[9px] font-black text-emerald-300 uppercase tracking-widest block w-max">
                  Representado Vinculado • Oficial SENA
                </span>
                <h3 className="font-display font-black text-xl text-white tracking-tight">
                  {currentChild.nombres} {currentChild.apellidos}
                </h3>
                <p className="text-xs text-slate-300 flex items-center gap-1.5">
                  ID Estudiante: <span className="font-mono bg-slate-800 px-1.5 py-0.5 rounded text-white font-bold">{currentChild.id_estudiante}</span>
                  • Documento: <strong className="text-slate-100">{currentChild.tipo_documento} {currentChild.numero_documento}</strong>
                </p>
              </div>

              <div className="flex gap-4 border-t border-slate-800 md:border-t-0 pt-4 md:pt-0 w-full md:w-auto text-xs text-slate-300 relative z-10 shrink-0">
                <div className="bg-slate-800/60 p-2 px-3.5 rounded-xl border border-slate-700/50">
                  <p className="text-[9px] uppercase font-bold text-slate-400">Jornada</p>
                  <p className="font-semibold text-slate-100">{currentChild.jornada}</p>
                </div>
                <div className="bg-slate-800/60 p-2 px-3.5 rounded-xl border border-slate-700/50">
                  <p className="text-[9px] uppercase font-bold text-slate-400">Estado</p>
                  <p className="font-bold text-emerald-400">{currentChild.estado}</p>
                </div>
              </div>
            </div>

            {/* BENTO GRID DE RESUMEN DIARIO */}
            <div>
              <h3 className="font-display font-bold text-xs text-brand-800 uppercase tracking-widest mb-3">
                📊 Panel de Resumen General
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                
                {/* BENTO CELL 1: ASISTENCIA DEL DÍA */}
                {(() => {
                  const hoyStr = new Date().toISOString().split('T')[0];
                  const asistenciaDeHoy = childAsistencias.find(a => a.fecha === hoyStr);
                  const tieneHoy = !!asistenciaDeHoy;
                  const record = asistenciaDeHoy || childAsistencias[0]; // fallback al último registrado

                  return (
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between hover:border-brand-300 transition-all duration-300 relative group min-h-[220px]">
                      <div className="space-y-4">
                        <div className="flex justify-between items-start">
                          <span className="p-2.5 bg-brand-50 text-brand-800 rounded-xl border border-brand-100">
                            <Clock className="w-5 h-5" />
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                            tieneHoy ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-slate-100 text-slate-500 border border-slate-200'
                          }`}>
                            {tieneHoy ? 'Registrado' : 'Planilla Pendiente'}
                          </span>
                        </div>
                        
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Planilla de Hoy</p>
                          <h4 className="text-xs text-slate-500 mt-1">{formatFechaEs(hoyStr)}</h4>
                          
                          <div className="mt-3 flex items-center gap-2">
                            <span className={`w-3 h-3 rounded-full ${
                              !record ? 'bg-slate-300 animate-pulse' :
                              record.estado_asistencia === 'Presente' ? 'bg-emerald-500' :
                              record.estado_asistencia === 'Ausente' ? 'bg-rose-500 animate-ping' : 'bg-amber-500'
                            }`} />
                            <strong className="text-base text-slate-900">
                              {!record ? 'Sin reportes aún' :
                               tieneHoy ? `Hoy: Marcado como ${record.estado_asistencia.toUpperCase()}` : 
                               `Último: ${record.estado_asistencia} (${record.fecha})`
                              }
                            </strong>
                          </div>
                          
                          {record && (
                            <p className="text-[11px] text-slate-500 mt-1 italic line-clamp-2">
                              "{record.observacion || 'Ingreso regular registrado por sistema general de firmas.'}"
                            </p>
                          )}
                        </div>
                      </div>

                      <button 
                        onClick={() => {
                          const el = document.getElementById('historial-seccion');
                          if (el) el.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="mt-4 w-full p-2.5 bg-slate-50 hover:bg-slate-100 hover:text-indigo-650 transition-colors text-xs font-bold text-slate-600 rounded-xl border border-slate-200 flex items-center justify-center gap-1 cursor-pointer"
                      >
                        Ver Historial Completo ({totalClasesChild} d) <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })()}

                {/* BENTO CELL 2: ÚLTIMAS OBSERVACIONES */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between hover:border-amber-300 transition-all duration-300 min-h-[220px]">
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <span className="p-2.5 bg-amber-50 text-amber-700 rounded-xl border border-amber-100">
                        <FileText className="w-5 h-5 text-amber-600" />
                      </span>
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-800 border border-amber-250 rounded-full text-[9px] font-bold uppercase">
                        Hoja Convivencial
                      </span>
                    </div>

                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Últimas 1-2 Observaciones</p>
                      
                      {childObservaciones.length === 0 ? (
                        <div className="mt-3 p-3.5 bg-emerald-50/50 border border-emerald-150/65 rounded-xl text-[11px] text-emerald-800 font-semibold space-y-0.5">
                          <p>⭐ Conducta Ejemplar</p>
                          <p className="font-normal text-slate-500">Sin novedades en el observador escolar.</p>
                        </div>
                      ) : (
                        <div className="mt-2 space-y-2 max-h-[140px] overflow-y-auto">
                          {childObservaciones.slice(0, 2).map(obs => {
                            const esCritica = obs.nivel_gravedad === 'Crítico' || obs.nivel_gravedad === 'Alto';
                            return (
                              <div key={obs.id_observacion} className="p-2 bg-slate-50 rounded-xl border border-slate-150 text-[11px] space-y-1">
                                <div className="flex justify-between items-center">
                                  <span className="font-bold text-slate-800 truncate max-w-[120px]">{obs.tipo_observacion}</span>
                                  <span className={`px-1 rounded text-[8px] font-black uppercase ${
                                    esCritica ? 'bg-red-100 text-red-800' : 'bg-slate-200 text-slate-700'
                                  }`}>
                                    {obs.nivel_gravedad}
                                  </span>
                                </div>
                                <p className="text-[10.5px] text-slate-600 line-clamp-1 italic text-left">"{obs.categoria}: {obs.descripcion}"</p>
                                <p className="text-[9px] text-slate-400 font-medium text-left">{obs.fecha_observacion} • Por {obs.registrado_por.split(' ')[0]}</p>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>

                  <button 
                    onClick={() => {
                      const el = document.getElementById('historial-seccion');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="mt-4 w-full p-2.5 bg-slate-50 hover:bg-slate-100 hover:text-amber-700 transition-colors text-xs font-bold text-slate-600 rounded-xl border border-slate-200 flex items-center justify-center gap-1 cursor-pointer"
                  >
                    Auditar Libro Convivencial ({childObservaciones.length}) <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {/* BENTO CELL 3: ALERTAS PENDIENTES / BUZÓN LEGAL */}
                {(() => {
                  const pendientes = parentNotificaciones.filter(n => n.estado_envio !== 'Confirmada');
                  const count = pendientes.length;
                  const latestPendiente = pendientes[0];

                  return (
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between hover:border-rose-300 transition-all duration-300 min-h-[220px]">
                      <div className="space-y-3">
                        <div className="flex justify-between items-start">
                          <span className={`p-2.5 rounded-xl border ${
                            count > 0 ? 'bg-rose-50 text-rose-800 border-rose-100' : 'bg-slate-50 text-slate-400 border-slate-100'
                          }`}>
                            <AlertTriangle className={`w-5 h-5 ${count > 0 ? 'animate-bounce text-rose-600' : ''}`} />
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                            count > 0 ? 'bg-rose-500 text-white' : 'bg-slate-100 text-slate-500'
                          }`}>
                            {count > 0 ? `${count} Pendientes` : 'Al Día'}
                          </span>
                        </div>

                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Alertas Colectivas / Firmas</p>
                          
                          {count === 0 ? (
                            <div className="mt-3 p-3 bg-emerald-50 rounded-xl text-emerald-800 text-[11px] font-semibold flex items-center gap-1.5 justify-center">
                              <CheckCircle className="w-4 h-4 text-emerald-600" />
                              <span>Todas las copias firmadas.</span>
                            </div>
                          ) : (
                            <div className="mt-2 text-xs space-y-1 text-left">
                              <p className="font-black text-rose-900 truncate">{latestPendiente.asunto}</p>
                              <p className="text-[11px] text-slate-500 line-clamp-2">
                                Evento automático por: "{latestPendiente.mensaje}"
                              </p>
                              <p className="text-[9px] text-slate-400">Fecha envío: {formatFechaEs(latestPendiente.fecha_envio.split('T')[0])}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {count > 0 ? (
                        <button 
                          onClick={() => handleScrollToNoti(latestPendiente.id_notificacion)}
                          className="mt-4 w-full p-3 bg-brand-800 hover:bg-brand-950 hover:shadow-md transition-all text-xs font-black text-white hover:text-slate-100 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer uppercase tracking-wider shadow-inner animate-pulse"
                        >
                          <PenTool className="w-4 h-4" />
                          Firmar Alerta Pendiente
                        </button>
                      ) : (
                        <button 
                          onClick={() => {
                            const el = document.getElementById('historial-seccion');
                            if (el) el.scrollIntoView({ behavior: 'smooth' });
                          }}
                          className="mt-4 w-full p-2.5 bg-slate-50 hover:bg-slate-100 transition-colors text-xs font-bold text-slate-600 rounded-xl border border-slate-200 flex items-center justify-center gap-1 cursor-pointer"
                        >
                          Revisar Notificaciones Recibidas <ChevronRight className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  );
                })()}

              </div>

              {/* ASISTENCIA RATIO GENERAL WIDGET DETALLADO */}
              <div className="mt-6 bg-linear-to-r from-brand-950 to-brand-900 p-6 rounded-2xl border border-slate-800 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                  <Sparkles className="w-24 h-24 text-white" />
                </div>
                <div className="text-center sm:text-left space-y-1.5 relative z-10">
                  <p className="text-[9px] text-brand-300 font-bold uppercase tracking-widest">Cumplimiento Académico Directo</p>
                  <h4 className="text-3xl font-black text-brand-100 flex items-baseline gap-1.5">
                    {asisPorcentaje}% <span className="text-xs font-bold text-slate-350">Asistencia Acumulada</span>
                  </h4>
                  <p className="text-xs text-slate-300">
                    Total de faltas reportadas en planilla: <strong className="text-rose-400">{childAsistencias.filter(a => a.estado_asistencia === 'Ausente').length} asistencias ausentes</strong> de {totalClasesChild} sesiones registradas.
                  </p>
                  <p className="text-[10px] text-brand-200 flex items-center gap-1 leading-normal italic font-medium">
                    <Info className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
                    *Debe mantener asistencia superior al 80% para aprobación jurídica del curso.
                  </p>
                </div>

                {/* Progress visual bar */}
                <div className="w-24 h-24 rounded-full border-8 border-brand-800/40 flex items-center justify-center relative bg-brand-950/40 shrink-0 shadow-inner z-10">
                  <span className="text-xs font-black text-white">{asisPorcentaje}%</span>
                  <div 
                    className={`absolute inset-0 rounded-full border-8 border-transparent ${
                      asisPorcentaje >= 80 ? 'border-t-emerald-400 border-r-emerald-400' : 'border-t-rose-400'
                    }`}
                    style={{ transform: `rotate(${asisPorcentaje * 3.6}deg)`, pointerEvents: 'none' }}
                  ></div>
                </div>
              </div>

            </div>

            {/* SECCIÓN INTERACTIVA: MOCK CANAL PREDEFINIDO (CORREO AUTOMATICO INTEGRADO) */}
            <div className="bg-indigo-50/75 p-6 rounded-2xl border border-indigo-200/80 space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div className="space-y-1 text-left">
                  <h4 className="text-xs font-black text-indigo-950 uppercase tracking-widest flex items-center gap-1.5">
                    <Mail className="w-4 h-4 text-indigo-700 animate-pulse animate-duration-1000" />
                    Canal Predefinido • Demostrador de Correo Electrónico Sincrónico
                  </h4>
                  <p className="text-xs text-indigo-900/80">
                    El sistema despacha alertas instantáneas al correo registrado <strong className="text-indigo-950">carlos.paternina@gmail.com</strong> cada vez que se marca <span className="uppercase font-mono bg-rose-250 text-rose-800 px-1 py-0.2 rounded font-bold">Ausente</span>, <span className="uppercase font-mono bg-amber-250 text-amber-800 px-1 py-0.2 rounded font-bold">Tarde</span>, o se registra una observación <span className="font-bold">≥ Medio</span>.
                  </p>
                </div>
                <span className="px-2.5 py-0.5 bg-indigo-600 text-white rounded-lg text-[9px] font-bold uppercase shrink-0">
                  Canal Activo ✓
                </span>
              </div>

              {/* SIMULACIÓN DE BANDEJA DE CORREO */}
              <div className="bg-white rounded-xl border border-indigo-100 shadow-xs overflow-hidden max-h-[220px] overflow-y-auto">
                <div className="bg-indigo-950 text-white p-2.5 px-4 text-[10px] font-bold flex justify-between items-center font-sans">
                  <span>📥 ENTRADA CORREO: carlos.paternina@gmail.com</span>
                  <span className="text-indigo-300">Simulador de Despacho Automático Oficial</span>
                </div>
                
                {parentNotificaciones.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400">
                    Bandeja de entrada vacía. No se han disparado alertas al correo para este estudiante en este período.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 font-sans text-xs">
                    {parentNotificaciones.map(correo => {
                      const esUrgente = correo.tipo_notificacion === 'Alerta Crítica' || correo.tipo_notificacion === 'Disciplinaria';
                      return (
                        <div key={`mail-${correo.id_notificacion}`} className="p-3.5 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row justify-between gap-2 text-left">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900 font-sans text-xs">Rectoría Instituto Bolivariano</span>
                              <span className="text-[10px] text-slate-400 font-mono">&lt;notificaciones@ib.edu.co&gt;</span>
                            </div>
                            <p className="font-bold text-slate-800 flex items-center gap-1">
                              {esUrgente && <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping shrink-0" />}
                              Asunto: {correo.asunto}
                            </p>
                            <p className="text-slate-600 line-clamp-2 italic text-[11px] bg-slate-50/50 p-2 rounded-lg border border-slate-100 mt-1">
                              "{correo.mensaje}"
                            </p>
                            <div className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider pt-1 flex items-center gap-2 flex-wrap">
                              <span>Canal: Correo de Acudiente Registrado</span>
                              <span>•</span>
                              <span>Estado: Autorizado y Despachado por SMTP Interno</span>
                            </div>
                          </div>
                          
                          <div className="text-right text-[10px] text-slate-400 font-mono shrink-0 flex flex-row sm:flex-col justify-between sm:justify-start items-center sm:items-end">
                            <span className="bg-slate-100 px-1.5 py-0.5 rounded text-[9px] font-bold text-slate-500 uppercase">{correo.id_notificacion}</span>
                            <span className="sm:mt-2">{new Date(correo.fecha_envio).toLocaleString()}</span>
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

        {/* NOTIFICACIONES CON FIRMA RECIENTE (URGENTES) */}
        <div className="space-y-3">
          <h3 className="font-display font-bold text-xs text-brand-800 uppercase tracking-widest">Notificaciones y Circulares por Confirmar</h3>
          
          {parentNotificaciones.length === 0 ? (
            <div className="p-4 bg-slate-50 border border-slate-150 rounded text-center text-xs text-slate-400">
              No tienes circulares ni alertas pendientes sobre este acudido.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              
              {justSignedId && (
                <div className="p-3 bg-emerald-50 border border-emerald-250 text-emerald-800 text-xs rounded-xl flex items-center gap-2 animate-pulse">
                  <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                  <strong>¡Constancia de Recibo Radicada Correctamente!</strong> Guardada con marca IP de acuso.
                </div>
              )}

              {parentNotificaciones.map(noti => {
                const esConfirmada = noti.estado_envio === 'Confirmada';
                const miConf = confirmaciones.find(c => c.id_notificacion === noti.id_notificacion);
                const esSelectParaFirma = signNotiId === noti.id_notificacion;

                return (
                  <div 
                    key={noti.id_notificacion} 
                    id={`noti-${noti.id_notificacion}`}
                    className={`p-5 rounded-2xl border transition-all shadow-sm ${
                      esConfirmada 
                        ? 'bg-slate-50 border-slate-200' 
                        : 'bg-indigo-50/50 border-indigo-200 ring-1 ring-indigo-500/10'
                    }`}
                  >
                    
                    <div className="flex justify-between items-center pb-2 border-b border-white">
                      <span className="px-1.5 py-0.5 bg-slate-150/70 text-slate-600 rounded text-[9px] font-mono font-bold">
                        {noti.id_notificacion}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                        esConfirmada ? 'bg-emerald-100 text-emerald-800' : 'bg-indigo-100 text-indigo-800'
                      }`}>
                        {esConfirmada ? 'Firmado' : 'Pendiente firma'}
                      </span>
                    </div>

                    <div className="py-2.5 space-y-1.5 text-xs text-slate-700">
                      <p className="font-bold text-slate-900 text-xs sm:text-sm">{noti.asunto}</p>
                      <p className="leading-relaxed bg-white/70 p-3 rounded-lg border border-slate-150 text-slate-600 italic">
                        "{noti.mensaje}"
                      </p>
                    </div>

                    {/* CONFIRMACIÓN REALIZADA */}
                    {esConfirmada && miConf && (
                      <div className="mt-2.5 p-3 bg-emerald-50 border border-emerald-150 rounded-lg text-[11px] text-emerald-800 space-y-1">
                        <p className="font-bold flex items-center gap-1">
                          <CheckCircle className="w-4 h-4 text-emerald-600" />
                          Constancia Confirmada Digitalmente
                        </p>
                        <p className="text-slate-600 italic">Comentario enviado: "{miConf.comentario_acudiente}"</p>
                        <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                          <span>Firma Legal IP: {miConf.ip_confirmacion}</span>
                          <span>Timestamp: {new Date(miConf.fecha_confirmacion).toLocaleString()}</span>
                        </div>
                      </div>
                    )}

                    {/* INTERACTIVE COMPONENT FOR SIGNING (FIRMA) */}
                    {!esConfirmada && !esSelectParaFirma && (
                      <button
                        onClick={() => {
                          setSignNotiId(noti.id_notificacion);
                          setSignComment('');
                        }}
                        className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-800 hover:bg-brand-700 text-white rounded-lg text-[10px] font-bold transition-all cursor-pointer"
                      >
                        <PenTool className="w-3.5 h-3.5" />
                        Firmar Escrito / Confirmar Lectura
                      </button>
                    )}

                    {/* FORMULARIO DE FIRMA EXPANDIDO */}
                    {esSelectParaFirma && (
                      <form onSubmit={handleSignSubmit} className="mt-3 p-3 bg-white border border-indigo-200 rounded-lg space-y-3 animate-scale-up">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-500 block uppercase tracking-wider">Comprobaciones de Envío & Comentario</label>
                          <input
                            type="text"
                            required
                            placeholder="Ej: Enterado de la inasistencia, presentaré excusa formal mañana."
                            value={signComment}
                            onChange={(e) => setSignComment(e.target.value)}
                            className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded text-slate-800 focus:outline-none focus:bg-white"
                          />
                        </div>

                        <div className="flex justify-between items-center text-[10px] text-slate-400">
                          <span className="flex items-center gap-1">
                            <Info className="w-3.5 h-3.5 text-brand-600" />
                            Se guardará fecha, hora e IP actual por trazabilidad.
                          </span>
                          
                          <div className="flex gap-2 text-[10px]">
                            <button
                              type="button"
                              onClick={() => setSignNotiId(null)}
                              className="px-2 py-1 text-slate-400 hover:text-slate-600 font-bold"
                            >
                              Cancelar
                            </button>
                            <button
                              type="submit"
                              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold cursor-pointer"
                            >
                              FIRMADO DIGITALMENTE ✓
                            </button>
                          </div>
                        </div>
                      </form>
                    )}

                  </div>
                );
              })}

            </div>
          )}
        </div>

        {/* TIMELINE DE HISTORIA DE EVENTOS (TIMELINE ASISTENCIA / OBSERVACION) */}
        <div className="space-y-4">
          <div>
            <h3 className="font-display font-bold text-xs text-brand-800 uppercase tracking-widest">
              Línea de Vida Escolar y Registro Histórico
            </h3>
            <p className="text-xs text-slate-500">Cronología e historial de asistencia escolar diaria y observaciones de convivencia del período actual</p>
          </div>

          {timelineOrdenado.length === 0 ? (
            <div className="p-8 text-center bg-white border border-slate-200 rounded text-slate-400 text-xs">
              No hay incidentes anotados en la hoja de vida escolar de este representado.
            </div>
          ) : (
            <div className="relative border-l-2 border-slate-200 pl-6 ml-3 space-y-6">
              
              {timelineOrdenado.map(event => (
                <div key={event.id} className="relative">
                  
                  {/* Circle locator over vertical timeline line */}
                  <div className="absolute -left-[31px] top-1.5 w-4.5 h-4.5 rounded-full bg-slate-100 border-2 border-slate-350 flex items-center justify-center font-bold text-[8px] text-slate-600 shadow-sm">
                    ●
                  </div>

                  {/* Card Event body */}
                  <div className={`p-4 rounded-xl border shadow-xs space-y-2 ${event.color}`}>
                    
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1">
                      <span className="text-[10px] font-bold text-slate-405 font-mono">{event.fecha} {event.hora ? `- ${event.hora}` : ''}</span>
                      <span className="px-2 py-0.5 bg-white/60 text-[9px] uppercase font-bold rounded">
                        {event.badge}
                      </span>
                    </div>

                    <h4 className="font-bold text-slate-850 text-xs sm:text-sm">
                      {event.titulo}
                    </h4>
                    
                    <p className="text-xs leading-relaxed text-slate-600">
                      {event.detalle}
                    </p>

                    <div className="pt-1.5 border-t border-black/5 text-[9px] text-slate-400">
                      <span>Docente Autorizador: <strong>{event.author}</strong></span>
                    </div>

                  </div>

                </div>
              ))}

            </div>
          )}

        </div>

      </div>

      {/* FOOTER */}
      <footer className="bg-slate-900 text-slate-500 py-6 text-center text-xs border-t border-slate-800">
        <p>© 2026 Instituto Bolivariano - Panel de acudientes. Seguridad Escolar Consolidada.</p>
      </footer>

    </div>
  );
}
