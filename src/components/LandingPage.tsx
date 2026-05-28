import React, { useState } from 'react';
import { Shield, BookOpen, Clock, AlertTriangle, ChevronRight, UserCheck, Smartphone, Users, Key, Mail } from 'lucide-react';
import { db } from '../data';

interface LandingPageProps {
  onLogin: (data: { tipo: 'personal' | 'acudiente'; credencial: string }) => void;
}

export default function LandingPage({ onLogin }: LandingPageProps) {
  const [loginType, setLoginType] = useState<'personal' | 'acudiente'>('personal');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [acudienteCode, setAcudienteCode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const usuarios = db.getUsuarios();

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginType === 'personal') {
      const user = usuarios.find(u => u.correo === email && u.password_hash === password);
      if (user) {
        onLogin({ tipo: 'personal', credencial: user.id_usuario });
      } else {
        setErrorMsg('Credenciales inválidas. Por favor verifique.');
      }
    } else {
      if (!acudienteCode.trim()) {
        setErrorMsg('Por favor ingrese el código o nombre.');
        return;
      }
      onLogin({ tipo: 'acudiente', credencial: acudienteCode.trim() });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-brand-900 flex flex-col font-sans text-slate-100 selection:bg-brand-500 selection:text-white">
      {/* HEADER */}
      <header className="px-6 py-6 flex items-center justify-between border-b border-white/10 bg-black/20 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-tr from-brand-500 to-emerald-400 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-brand-500/20">
              <span className="font-black text-xl tracking-tighter">IB</span>
            </div>
            <div>
              <h1 className="text-lg font-black text-white leading-tight">Instituto Bolivariano</h1>
              <p className="text-xs text-brand-200 font-medium">Sistema de Seguimiento Estudiantil</p>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-12 lg:py-24 flex items-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          
          {/* LEFT SIDE: Hero text */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-sm font-semibold text-emerald-100">Plataforma Oficial Homologada</span>
            </div>
            <h2 className="text-5xl lg:text-7xl font-black text-white tracking-tight leading-[1.1]">
              El control escolar del <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-emerald-300">futuro.</span>
            </h2>
            <p className="text-lg text-slate-300 leading-relaxed max-w-xl">
              Conecta a docentes, coordinadores y familias en una plataforma centralizada. Asistencia en segundos, seguimiento convivencial y notificaciones en tiempo real.
            </p>
            <div className="grid grid-cols-2 gap-4 pt-4 max-w-md">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <Shield className="w-6 h-6 text-brand-400 mb-2" />
                <h4 className="font-bold text-white text-sm">Seguridad Legal</h4>
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <Clock className="w-6 h-6 text-emerald-400 mb-2" />
                <h4 className="font-bold text-white text-sm">Asistencia Ágil</h4>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE: Login form */}
          <div className="w-full max-w-md mx-auto lg:ml-auto">
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-black text-white mb-2">Iniciar Sesión</h3>
                <p className="text-slate-300 text-sm">Selecciona tu tipo de perfil para continuar</p>
              </div>

              {/* TABS */}
              <div className="flex p-1 bg-black/20 rounded-xl mb-8">
                <button
                  type="button"
                  onClick={() => { setLoginType('personal'); setErrorMsg(''); }}
                  className={`flex-1 py-2.5 px-4 text-sm font-bold rounded-lg transition-all duration-300 ${
                    loginType === 'personal' ? 'bg-brand-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Personal / Docente
                </button>
                <button
                  type="button"
                  onClick={() => { setLoginType('acudiente'); setErrorMsg(''); }}
                  className={`flex-1 py-2.5 px-4 text-sm font-bold rounded-lg transition-all duration-300 ${
                    loginType === 'acudiente' ? 'bg-brand-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Acudiente
                </button>
              </div>

              {/* FORM */}
              <form onSubmit={handleLoginSubmit} className="space-y-6">
                {loginType === 'personal' ? (
                  <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-200 block">Correo Electrónico</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <Mail className="w-5 h-5 text-slate-400" />
                        </div>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                          className="w-full pl-12 pr-4 py-3 bg-black/20 border border-white/10 rounded-xl focus:ring-2 focus:ring-brand-400 focus:border-transparent focus:bg-black/30 transition-all text-white placeholder-slate-500 font-medium"
                          placeholder="docente@ib.edu.co"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-200 block">Contraseña</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <Key className="w-5 h-5 text-slate-400" />
                        </div>
                        <input
                          type="password"
                          required
                          value={password}
                          onChange={e => setPassword(e.target.value)}
                          className="w-full pl-12 pr-4 py-3 bg-black/20 border border-white/10 rounded-xl focus:ring-2 focus:ring-brand-400 focus:border-transparent focus:bg-black/30 transition-all text-white placeholder-slate-500 font-medium"
                          placeholder="••••••••"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-200 block">Código o Nombre del Estudiante</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <UserCheck className="w-5 h-5 text-slate-400" />
                        </div>
                        <input
                          type="text"
                          required
                          value={acudienteCode}
                          onChange={e => setAcudienteCode(e.target.value)}
                          className="w-full pl-12 pr-4 py-3 bg-black/20 border border-white/10 rounded-xl focus:ring-2 focus:ring-brand-400 focus:border-transparent focus:bg-black/30 transition-all text-white placeholder-slate-500 font-medium"
                          placeholder="Ej. 1234 o Nombre Completo"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {errorMsg && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                    <p className="text-sm text-rose-200 font-medium">{errorMsg}</p>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3.5 bg-gradient-to-r from-brand-500 to-emerald-500 hover:from-brand-400 hover:to-emerald-400 text-white font-black text-sm rounded-xl shadow-xl shadow-brand-500/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2"
                >
                  Acceder a la Plataforma
                  <ChevronRight className="w-5 h-5" />
                </button>
              </form>

              {/* DEMO ACCOUNTS HELPER */}
              <div className="mt-8 pt-6 border-t border-white/10">
                <p className="text-xs text-center font-bold text-slate-400 uppercase tracking-widest mb-4">Cuentas de Prueba Rápida</p>
                <div className="flex flex-wrap justify-center gap-2">
                  <button onClick={() => { setLoginType('personal'); setEmail('andres.bustamante@ib.edu.co'); setPassword('admin123'); }} className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-semibold transition-colors border border-white/5">Coordinador</button>
                  <button onClick={() => { setLoginType('personal'); setEmail('martha.rodriguez@ib.edu.co'); setPassword('docente123'); }} className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-semibold transition-colors border border-white/5">Docente</button>
                  <button onClick={() => { setLoginType('acudiente'); setAcudienteCode('1234'); }} className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-semibold transition-colors border border-white/5">Acudiente</button>
                </div>
              </div>

            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
