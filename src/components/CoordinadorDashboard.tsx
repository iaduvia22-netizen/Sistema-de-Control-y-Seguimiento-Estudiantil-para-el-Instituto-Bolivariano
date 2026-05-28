import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, BarChart2, Shield, AlertTriangle, Clock, 
  Plus, UploadCloud, RefreshCw, LogOut, CheckCircle, FileText
} from 'lucide-react';
import { Usuario, Estudiante, Grado, Asistencia, Observacion, Notificacion, Auditoria, Confirmacion } from '../types';
import { db } from '../data';

interface CoordinadorDashboardProps {
  usuario: Usuario;
  onLogout: () => void;
}

export default function CoordinadorDashboard({ usuario, onLogout }: CoordinadorDashboardProps) {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'estudiantes' | 'observaciones' | 'auditoria' | 'notificaciones'>('dashboard');
  
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [grados, setGrados] = useState<Grado[]>([]);
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
  const [asistencias, setAsistencias] = useState<Asistencia[]>([]);
  const [observaciones, setObservaciones] = useState<Observacion[]>([]);
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [confirmaciones, setConfirmaciones] = useState<Confirmacion[]>([]);
  const [auditorias, setAuditorias] = useState<Auditoria[]>([]);

  const [isDragging, setIsDragging] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [docEst, setDocEst] = useState('');
  const [nomEst, setNomEst] = useState('');
  const [apeEst, setApeEst] = useState('');
  const [gradoEst, setGradoEst] = useState('');
  const [jorEst, setJorEst] = useState('Mañana');
  
  const [singleStudentSuccess, setSingleStudentSuccess] = useState<{ estudiante: any, pin: string } | null>(null);

  const handleSingleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docEst || !nomEst || !apeEst || !gradoEst || !jorEst) return;

    const datos = {
      documento: docEst,
      nombres: nomEst,
      apellidos: apeEst,
      grado_id: gradoEst,
      jornada: jorEst
    };
    
    const result = db.crearEstudianteIndividual(datos, usuario.id_usuario);
    if (result) {
      setSingleStudentSuccess(result);
      setDocEst('');
      setNomEst('');
      setApeEst('');
      setGradoEst('');
      setJorEst('Mañana');
      handleRefresh();
    } else {
      alert('Error: Estudiante duplicado o datos inválidos.');
    }
  };

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

  const totalEst = estudiantes.length;
  
  const calculateAttendanceRate = (filtradas: Asistencia[]) => {
    if (filtradas.length === 0) return 100;
    const presentesOrExc = filtradas.filter(a => a.estado_asistencia === 'Presente' || a.estado_asistencia === 'Excusado' || a.estado_asistencia === 'Tarde').length;
    return Math.round((presentesOrExc / filtradas.length) * 100);
  };

  const globalAttendanceRate = calculateAttendanceRate(asistencias);
  const ausenciasTotales = asistencias.filter(a => a.estado_asistencia === 'Ausente').length;
  const observacionCriticaTotal = observaciones.filter(o => o.nivel_gravedad === 'Crítico' || o.nivel_gravedad === 'Alto').length;

  const courseRates = grados.map(g => {
    const cursoAsistencias = asistencias.filter(a => a.id_grado === g.id_grado);
    return {
      nombre: g.nombre_grado,
      rate: calculateAttendanceRate(cursoAsistencias),
      total: cursoAsistencias.length
    };
  });

  const obsDistrib = {
    disciplinaria: observaciones.filter(o => o.tipo_observacion === 'Disciplinaria').length,
    convivencial: observaciones.filter(o => o.tipo_observacion === 'Convivencial').length,
    academica: observaciones.filter(o => o.tipo_observacion === 'Académica').length,
    positivo: observaciones.filter(o => o.tipo_observacion === 'Reconocimiento positivo').length,
    general: observaciones.filter(o => o.tipo_observacion === 'Seguimiento general').length,
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const processFile = (file: File) => {
    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      alert('Por favor suba un archivo CSV.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (text) {
        const agregados = db.importarEstudiantesCSV(text, usuario.id_usuario);
        setUploadSuccess(`Se han importado ${agregados} estudiantes exitosamente.`);
        handleRefresh();
        setTimeout(() => setUploadSuccess(null), 5000);
      }
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const cleanDemoState = () => {
    if (window.confirm('¿Seguro quieres restaurar los datos mock iniciales?')) {
      db.resetState();
      handleRefresh();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800 selection:bg-brand-500 selection:text-white">
      {singleStudentSuccess && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl flex flex-col items-center text-center animate-in zoom-in-95">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2">Estudiante Creado Exitosamente</h3>
            <p className="text-sm text-slate-500 mb-6">
              Entregue el siguiente PIN al acudiente para su acceso al sistema.
            </p>
            <div className="bg-slate-100 p-4 rounded-2xl w-full mb-6 border border-slate-200">
              <p className="text-xs text-slate-500 font-bold uppercase mb-1">PIN de Acceso</p>
              <p className="text-4xl font-black text-brand-600 tracking-widest font-mono">
                {singleStudentSuccess.pin}
              </p>
            </div>
            <button 
              onClick={() => setSingleStudentSuccess(null)}
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition-colors"
            >
              Aceptar
            </button>
          </div>
        </div>
      )}

      {/* TOPBAR */}
      <nav className="bg-brand-900 text-white px-6 py-4 shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-white/10 p-2.5 rounded-xl text-emerald-400 backdrop-blur-sm shadow-inner">
              <Shield className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <p className="text-[10px] text-brand-200 uppercase tracking-widest font-black">Consola Directiva</p>
              <h2 className="text-sm font-bold">Coord. {usuario.nombres}</h2>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleRefresh} className="p-2 bg-brand-800 hover:bg-brand-700 rounded-xl transition-colors" title="Refrescar">
              <RefreshCw className="w-4 h-4 text-brand-200" />
            </button>
            <button onClick={cleanDemoState} className="p-2 bg-rose-500/20 hover:bg-rose-500/40 text-rose-300 rounded-xl transition-colors font-bold text-xs uppercase" title="Restaurar BD">
              Reset BD
            </button>
            <button onClick={onLogout} className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors font-bold text-xs">
              <LogOut className="w-4 h-4" /> Salir
            </button>
          </div>
        </div>
      </nav>

      {/* TABS (BENTO STYLE SUBNAV) */}
      <div className="bg-white border-b border-slate-200 sticky top-[72px] z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 flex gap-4 overflow-x-auto scrollbar-none">
          {[
            { id: 'dashboard', icon: '📊', label: 'Panel Global' },
            { id: 'estudiantes', icon: '👥', label: 'Matrículas' },
            { id: 'observaciones', icon: '📋', label: 'Libro Convivencial' },
            { id: 'notificaciones', icon: '✉️', label: 'Firmas' },
            { id: 'auditoria', icon: '⚖️', label: 'Auditoría' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-4 px-2 text-xs font-black uppercase tracking-wider shrink-0 transition-all border-b-2 ${
                activeTab === tab.id ? 'border-brand-600 text-brand-700' : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
      </div>

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8">
        
        {/* TAB 1: DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* WIDGETS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-lg transition-all">
                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-4">
                  <Users className="w-6 h-6" />
                </div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Estudiantes</p>
                <h3 className="text-3xl font-black text-slate-900">{totalEst}</h3>
              </div>
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-lg transition-all">
                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-4">
                  <BarChart2 className="w-6 h-6" />
                </div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Asistencia Global</p>
                <h3 className="text-3xl font-black text-emerald-600">{globalAttendanceRate}%</h3>
              </div>
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-lg transition-all">
                <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mb-4">
                  <Clock className="w-6 h-6" />
                </div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Fallas Totales</p>
                <h3 className="text-3xl font-black text-slate-900">{ausenciasTotales}</h3>
              </div>
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-lg transition-all">
                <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mb-4">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Anotaciones Críticas</p>
                <h3 className="text-3xl font-black text-rose-600">{observacionCriticaTotal}</h3>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                <h4 className="font-black text-lg text-slate-900 mb-6">Tasas de Asistencia por Curso</h4>
                <div className="space-y-4">
                  {courseRates.map(cr => (
                    <div key={cr.nombre}>
                      <div className="flex justify-between text-xs font-bold mb-1">
                        <span className="text-slate-700">{cr.nombre}</span>
                        <span className="text-brand-600">{cr.rate}%</span>
                      </div>
                      <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-brand-500 rounded-full transition-all duration-1000" style={{ width: `${cr.rate}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                <h4 className="font-black text-lg text-slate-900 mb-6">Tipología de Observaciones</h4>
                <div className="space-y-4">
                  <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <span className="text-sm font-bold text-slate-700">Convivencial</span>
                    <span className="text-sm font-black text-slate-900">{obsDistrib.convivencial}</span>
                  </div>
                  <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <span className="text-sm font-bold text-slate-700">Disciplinaria</span>
                    <span className="text-sm font-black text-slate-900">{obsDistrib.disciplinaria}</span>
                  </div>
                  <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <span className="text-sm font-bold text-slate-700">Reconocimientos</span>
                    <span className="text-sm font-black text-emerald-600">{obsDistrib.positivo}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: MATRÍCULAS / ESTUDIANTES CON DRAG AND DROP */}
        {activeTab === 'estudiantes' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            
            {uploadSuccess && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-800 shadow-sm">
                <CheckCircle className="w-6 h-6 shrink-0" />
                <p className="font-bold text-sm">{uploadSuccess}</p>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              <div className="lg:col-span-1 flex flex-col gap-6">
                <div 
                  className={`bg-white border-2 border-dashed rounded-3xl p-8 flex flex-col items-center justify-center text-center transition-all duration-300 min-h-[250px] ${
                    isDragging ? 'border-brand-500 bg-brand-50 scale-[1.02] shadow-lg' : 'border-slate-300 hover:border-brand-400 hover:bg-slate-50'
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-colors ${isDragging ? 'bg-brand-500 text-white' : 'bg-slate-100 text-brand-600'}`}>
                    <UploadCloud className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-black text-slate-900 mb-2">Carga Masiva (CSV)</h3>
                  <p className="text-xs text-slate-500 leading-relaxed mb-6">
                    Arrastre y suelte el archivo CSV con el formato: <code>documento, nombres, apellidos, grado_id, jornada</code>
                  </p>
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm rounded-xl shadow-md transition-colors w-full"
                  >
                    Examinar Archivo
                  </button>
                  <input type="file" accept=".csv" className="hidden" ref={fileInputRef} onChange={handleFileInput} />
                </div>

                <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                      <Plus className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-black text-slate-900">Registro Individual</h3>
                  </div>
                  <form onSubmit={handleSingleSubmit} className="flex flex-col gap-3 flex-1">
                    <input 
                      type="text" 
                      placeholder="Documento" 
                      className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                      value={docEst} onChange={e => setDocEst(e.target.value)} required 
                    />
                    <input 
                      type="text" 
                      placeholder="Nombres" 
                      className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                      value={nomEst} onChange={e => setNomEst(e.target.value)} required 
                    />
                    <input 
                      type="text" 
                      placeholder="Apellidos" 
                      className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                      value={apeEst} onChange={e => setApeEst(e.target.value)} required 
                    />
                    <select 
                      className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 outline-none text-slate-700"
                      value={gradoEst} onChange={e => setGradoEst(e.target.value)} required
                    >
                      <option value="" disabled>Seleccione Grado</option>
                      {grados.map(g => (
                        <option key={g.id_grado} value={g.id_grado}>{g.nombre_grado}</option>
                      ))}
                    </select>
                    <select 
                      className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 outline-none text-slate-700"
                      value={jorEst} onChange={e => setJorEst(e.target.value)} required
                    >
                      <option value="Mañana">Mañana</option>
                      <option value="Tarde">Tarde</option>
                      <option value="Noche">Noche</option>
                      <option value="Sábado">Sábado</option>
                    </select>
                    <button type="submit" className="mt-2 px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-xl shadow-md transition-colors w-full">
                      Crear Estudiante
                    </button>
                  </form>
                </div>
              </div>

              <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                  <h3 className="font-black text-lg text-slate-900">Listado Oficial</h3>
                  <span className="px-3 py-1 bg-white border border-slate-200 text-slate-600 text-xs font-bold rounded-lg">{estudiantes.length} Estudiantes</span>
                </div>
                <div className="overflow-x-auto flex-1 max-h-[500px]">
                  <table className="w-full text-left text-xs divide-y divide-slate-100">
                    <thead className="bg-white sticky top-0 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="p-4">Estudiante</th>
                        <th className="p-4">Documento</th>
                        <th className="p-4">Curso</th>
                        <th className="p-4">Estado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 font-medium">
                      {estudiantes.map(est => (
                        <tr key={est.id_estudiante} className="hover:bg-slate-50 transition-colors">
                          <td className="p-4">
                            <p className="font-bold text-slate-900 text-sm">{est.nombres} {est.apellidos}</p>
                            <p className="text-[10px] text-slate-400 font-mono mt-0.5">{est.id_estudiante}</p>
                          </td>
                          <td className="p-4 font-mono text-slate-500">{est.tipo_documento} {est.numero_documento}</td>
                          <td className="p-4">
                            <span className="px-2 py-1 bg-slate-100 text-slate-700 font-bold rounded text-[10px]">
                              {grados.find(g => g.id_grado === est.grado_id)?.nombre_grado || est.grado_id}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className={`px-2 py-1 rounded text-[10px] font-bold ${est.estado === 'Activo' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                              {est.estado}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: OBSERVACIONES */}
        {activeTab === 'observaciones' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-2xl font-black text-slate-900">Libro Convivencial</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {observaciones.map(obs => (
                <div key={obs.id_observacion} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-lg transition-all">
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg border ${
                        obs.nivel_gravedad === 'Crítico' ? 'bg-rose-100 text-rose-800 border-rose-200' : 
                        obs.nivel_gravedad === 'Alto' ? 'bg-amber-100 text-amber-800 border-amber-200' :
                        obs.nivel_gravedad === 'Medio' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                        'bg-slate-100 text-slate-600 border-slate-200'
                      }`}>
                        {obs.nivel_gravedad}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">{obs.fecha_observacion}</span>
                    </div>
                    <h4 className="font-bold text-slate-900 mb-2">{obs.categoria}</h4>
                    <p className="text-xs text-slate-600 line-clamp-3 italic mb-4">"{obs.descripcion}"</p>
                  </div>
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[10px] font-semibold text-slate-500">
                    <span className="flex items-center gap-1"><FileText className="w-3.5 h-3.5" /> {obs.tipo_observacion}</span>
                    <span>Docente: {obs.registrado_por.split(' ')[0]}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: NOTIFICACIONES Y FIRMAS */}
        {activeTab === 'notificaciones' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-2xl font-black text-slate-900">Firmas y Acusos de Recibo</h2>
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <table className="w-full text-left text-xs divide-y divide-slate-100">
                <thead className="bg-slate-50 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-4">Firma ID</th>
                    <th className="p-4">Documento</th>
                    <th className="p-4">Acudiente</th>
                    <th className="p-4">Fecha/IP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 font-medium text-slate-800">
                  {confirmaciones.map(c => {
                    const noti = notificaciones.find(n => n.id_notificacion === c.id_notificacion);
                    return (
                      <tr key={c.id_confirmacion} className="hover:bg-slate-50 transition-colors">
                        <td className="p-4 font-mono text-emerald-600 font-bold">{c.id_confirmacion}</td>
                        <td className="p-4 max-w-xs truncate">{noti?.asunto || 'Notificación'}</td>
                        <td className="p-4">{usuarios.find(u => u.id_usuario === c.id_acudiente)?.nombres || 'Acudiente'}</td>
                        <td className="p-4 font-mono text-slate-500 text-[10px]">
                          {new Date(c.fecha_confirmacion).toLocaleString()}<br/>{c.ip_confirmacion}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: AUDITORÍA */}
        {activeTab === 'auditoria' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-2xl font-black text-slate-900">Bitácora de Auditoría</h2>
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <table className="w-full text-left text-xs divide-y divide-slate-100">
                <thead className="bg-slate-50 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-4">Acción</th>
                    <th className="p-4">Usuario</th>
                    <th className="p-4">Detalle</th>
                    <th className="p-4">Fecha/IP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 font-medium text-slate-800">
                  {auditorias.map(log => (
                    <tr key={log.id_auditoria} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4">
                        <span className="px-2 py-1 bg-brand-50 text-brand-700 font-bold rounded text-[10px]">{log.accion}</span>
                      </td>
                      <td className="p-4">
                        <p className="font-bold text-slate-900">{log.usuario_nombre}</p>
                        <p className="text-[10px] text-slate-400 uppercase">{log.usuario_rol}</p>
                      </td>
                      <td className="p-4 max-w-sm text-xs text-slate-600">{log.descripcion}</td>
                      <td className="p-4 font-mono text-[10px] text-slate-500">
                        {new Date(log.fecha_accion).toLocaleString()}<br/>{log.ip_usuario}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
