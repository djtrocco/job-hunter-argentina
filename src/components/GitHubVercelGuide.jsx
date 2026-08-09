import React, { useState } from 'react';
import { Globe, Github, Rocket, CheckCircle2, Copy, ExternalLink, ArrowRight, Sparkles, Server } from 'lucide-react';

export default function GitHubVercelGuide() {
  const [copiedIndex, setCopiedIndex] = useState(null);

  const copyToClipboard = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 my-8">
      
      {/* Title Hero Banner */}
      <div className="glass-panel p-8 bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/40 border-emerald-500/30">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 text-xs font-bold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              Guía Paso a Paso Sin Código
            </div>
            <h2 className="text-3xl font-extrabold text-white">
              Cómo publicar esta App en la Web usando <span className="text-emerald-400">GitHub & Vercel</span>
            </h2>
            <p className="text-sm text-slate-300 mt-2 max-w-2xl leading-relaxed">
              Sigue estos 4 pasos súper sencillos para subir el código a tu cuenta de GitHub y desplegarlo en Vercel gratis. Tendrás una URL pública accesible desde cualquier celular o computadora.
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-800 text-emerald-400 shrink-0">
            <Rocket className="w-12 h-12 animate-bounce" />
          </div>
        </div>
      </div>

      {/* Step 1: Subir código a GitHub */}
      <div className="glass-panel p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-slate-800 text-white font-extrabold flex items-center justify-center border border-slate-700">
            1
          </div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Github className="w-5 h-5 text-white" />
            Crear un Repositorio en GitHub
          </h3>
        </div>

        <ol className="list-decimal list-inside text-sm text-slate-300 space-y-3 ml-2">
          <li>
            Entra a tu cuenta en <a href="https://github.com/new" target="_blank" rel="noreferrer" className="text-cyan-400 underline font-semibold">GitHub.com/new</a> (si no tienes cuenta, regístrate gratis en 1 minuto).
          </li>
          <li>
            En **Repository Name**, escribe: <code className="bg-slate-900 text-cyan-300 px-2 py-1 rounded font-mono">job-hunter-argentina</code>.
          </li>
          <li>
            Marca el repositorio como **Public** y haz clic en el botón verde **Create Repository**.
          </li>
        </ol>

        <div className="mt-4 p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
          <div className="text-xs text-slate-400 font-semibold uppercase">Comandos para subir la carpeta del proyecto (copia y pega en tu terminal):</div>
          <div className="flex items-center justify-between bg-slate-900 p-3 rounded-lg border border-slate-800 font-mono text-xs text-cyan-300">
            <span>
              git init && git add . && git commit -m "Initial release" && git branch -M main && git remote add origin https://github.com/TU_USUARIO/job-hunter-argentina.git && git push -u origin main
            </span>
            <button
              onClick={() =>
                copyToClipboard(
                  'git init && git add . && git commit -m "Initial release" && git branch -M main && git remote add origin https://github.com/TU_USUARIO/job-hunter-argentina.git && git push -u origin main',
                  1
                )
              }
              className="btn-secondary text-xs p-1.5 ml-2"
            >
              {copiedIndex === 1 ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Step 2: Conectar con Vercel */}
      <div className="glass-panel p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-emerald-950 text-emerald-400 font-extrabold flex items-center justify-center border border-emerald-800">
            2
          </div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Globe className="w-5 h-5 text-emerald-400" />
            Conectar tu GitHub a Vercel (Gratis)
          </h3>
        </div>

        <ol className="list-decimal list-inside text-sm text-slate-300 space-y-3 ml-2">
          <li>
            Abre <a href="https://vercel.com/signup" target="_blank" rel="noreferrer" className="text-emerald-400 underline font-semibold">Vercel.com</a> e inicia sesión seleccionando **Continue with GitHub**.
          </li>
          <li>
            En tu panel de control de Vercel, haz clic en el botón azul **Add New...** → **Project**.
          </li>
          <li>
            Verás la lista de tus repositorios de GitHub. Busca <strong className="text-white">job-hunter-argentina</strong> y presiona el botón **Import**.
          </li>
        </ol>
      </div>

      {/* Step 3: Despliegue en 1 Clic */}
      <div className="glass-panel p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-cyan-950 text-cyan-400 font-extrabold flex items-center justify-center border border-cyan-800">
            3
          </div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Rocket className="w-5 h-5 text-cyan-400" />
            Presionar "Deploy" y Obtener tu Enlace Web
          </h3>
        </div>

        <div className="text-sm text-slate-300 space-y-3">
          <p>
            Vercel detectará automáticamente que el proyecto utiliza el archivo de configuración <code className="bg-slate-900 text-cyan-300 px-2 py-0.5 rounded font-mono">vercel.json</code> que ya hemos dejado listo.
          </p>
          <p className="font-semibold text-white">
            Solo debes hacer clic en el botón azul <span className="bg-blue-600 text-white px-3 py-1 rounded font-bold">Deploy</span>.
          </p>
          <p>
            ¡En menos de 60 segundos, Vercel compilará la aplicación y te entregará una URL pública como: <span className="text-emerald-300 font-mono underline">https://job-hunter-argentina.vercel.app</span>!
          </p>
        </div>
      </div>

      {/* Step 4: Probar la App en Producción */}
      <div className="glass-panel p-6 sm:p-8 bg-slate-900/40">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-blue-950 text-blue-400 font-extrabold flex items-center justify-center border border-blue-800">
            4
          </div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-blue-400" />
            ¡Listo! Tu App estará en línea las 24 hs
          </h3>
        </div>

        <p className="text-sm text-slate-300 leading-relaxed">
          Cualquier cambio que realices en el código o nueva versión que subas a GitHub se actualizará automáticamente en tu enlace de Vercel en segundos. Podrás buscar avisos laborales y enviar postulaciones directamente desde la nube.
        </p>

        <div className="mt-6 flex flex-wrap gap-4">
          <a
            href="https://vercel.com/new"
            target="_blank"
            rel="noreferrer"
            className="btn-primary text-xs"
          >
            Abrir Vercel para Importar Repositorio
            <ExternalLink className="w-4 h-4" />
          </a>
          <a
            href="https://github.com/new"
            target="_blank"
            rel="noreferrer"
            className="btn-secondary text-xs"
          >
            Ir a GitHub para Crear Repositorio
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>

    </div>
  );
}
