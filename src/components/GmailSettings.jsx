import React, { useState } from 'react';
import { Key, ShieldCheck, Mail, CheckCircle2, HelpCircle, ExternalLink } from 'lucide-react';

export default function GmailSettings({ gmailUser, setGmailUser, gmailAppPassword, setGmailAppPassword, onTestConnection, isTesting }) {
  const [testResult, setTestResult] = useState(null);

  const handleTest = async (e) => {
    e.preventDefault();
    setTestResult(null);
    const result = await onTestConnection(gmailUser, gmailAppPassword);
    setTestResult(result);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 my-8">
      
      {/* Gmail Config Form Card */}
      <div className="glass-panel p-8">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-800">
          <div className="p-3 rounded-xl bg-gradient-to-br from-red-500/20 to-amber-500/20 border border-red-500/30 text-red-400">
            <Mail className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Configuración de Cuenta de Gmail</h2>
            <p className="text-xs text-slate-400">
              Conecta tu casilla de Gmail para realizar envíos de correos reales con tu firma y CV adjunto.
            </p>
          </div>
        </div>

        <form onSubmit={handleTest} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Gmail User */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                Tu Correo Electrónico de Gmail
              </label>
              <input
                type="email"
                value={gmailUser}
                onChange={(e) => setGmailUser(e.target.value)}
                placeholder="ejemplo@gmail.com"
                className="glass-input"
              />
            </div>

            {/* Gmail App Password */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                Contraseña de Aplicación de Gmail (16 caracteres)
              </label>
              <div className="relative">
                <Key className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  value={gmailAppPassword}
                  onChange={(e) => setGmailAppPassword(e.target.value)}
                  placeholder="xxxx xxxx xxxx xxxx"
                  className="glass-input pl-10 font-mono"
                />
              </div>
            </div>

          </div>

          {/* Test Status Banner */}
          {testResult && (
            <div
              className={`p-4 rounded-xl text-sm flex items-start gap-3 border ${
                testResult.success
                  ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-200'
                  : 'bg-red-950/60 border-red-500/40 text-red-200'
              }`}
            >
              {testResult.success ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <ShieldCheck className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              )}
              <div>
                <div className="font-bold">{testResult.success ? '¡Conexión Exitosa!' : 'Error de Conexión'}</div>
                <div className="text-xs mt-1">{testResult.message || testResult.error}</div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            <span className="text-xs text-slate-400">
              * Las credenciales no se comparten ni se almacenan en servidores externos.
            </span>
            <button type="submit" disabled={isTesting} className="btn-primary">
              {isTesting ? 'Probando Conexión...' : 'Probar Conexión SMTP'}
            </button>
          </div>
        </form>
      </div>

      {/* Beginner Step-by-Step Tutorial Card */}
      <div className="glass-panel p-8 bg-slate-900/40">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-cyan-400" />
          ¿Cómo obtener tu Contraseña de Aplicación en 3 sencillos pasos?
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <div className="w-7 h-7 rounded-full bg-cyan-950 text-cyan-400 font-bold flex items-center justify-center border border-cyan-800">
              1
            </div>
            <h4 className="font-bold text-white">Activar Verificación en 2 Pasos</h4>
            <p className="text-slate-400">
              Ingresa a la seguridad de tu cuenta de Google y asegúrate de tener activada la verificación en dos pasos.
            </p>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <div className="w-7 h-7 rounded-full bg-cyan-950 text-cyan-400 font-bold flex items-center justify-center border border-cyan-800">
              2
            </div>
            <h4 className="font-bold text-white">Crear "Contraseña de Aplicación"</h4>
            <p className="text-slate-400">
              Busca en Google *"Contraseñas de Aplicación"*, selecciona **Correo** y escribe el nombre de la app (ej: *JobHunter*).
            </p>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <div className="w-7 h-7 rounded-full bg-cyan-950 text-cyan-400 font-bold flex items-center justify-center border border-cyan-800">
              3
            </div>
            <h4 className="font-bold text-white">Copiar los 16 caracteres</h4>
            <p className="text-slate-400">
              Google te mostrará un código amarillo de 16 letras. Cópialo y pégalo en la casilla superior de esta app.
            </p>
          </div>

        </div>

        <div className="mt-6 text-center">
          <a
            href="https://myaccount.google.com/apppasswords"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary text-xs inline-flex items-center gap-2"
          >
            Abrir Configuración de Seguridad de Google
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

    </div>
  );
}
