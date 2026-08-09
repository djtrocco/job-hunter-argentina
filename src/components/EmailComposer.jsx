import React, { useState } from 'react';
import { Mail, Paperclip, FileText, Send, Sparkles, CheckCircle2, ShieldAlert, Eye } from 'lucide-react';

export default function EmailComposer({ cv, onUploadCV, onSendEmail, isSending, isSimulationMode, setIsSimulationMode }) {
  const [subject, setSubject] = useState('Postulación al puesto de {PUESTO} - Adjunto mi CV');
  const [bodyText, setBodyText] = useState(
    `Estimado equipo de Selección de {EMPRESA},\n\n` +
    `Me contacto con ustedes con motivo del aviso publicado en {FUENTE} referente a la búsqueda para la posición de {PUESTO}.\n\n` +
    `Cuento con experiencia en el área y un sólido perfil orientado a resultados, trabajo en equipo y continua capacitación. Considero que mi perfil puede aportar gran valor a los proyectos de la compañía.\n\n` +
    `Adjunto mi Curriculum Vitae actualizado para su evaluación. Quedo a su entera disposición para mantener una entrevista laboral.\n\n` +
    `Atentamente,\nPostulante`
  );

  const [testTargetEmail, setTestTargetEmail] = useState('rrhh@empresa-ejemplo.com.ar');
  const [testCompany, setTestCompany] = useState('Tech Argentina S.A.');
  const [testPuesto, setTestPuesto] = useState('Desarrollador Full Stack');

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      onUploadCV(file);
    }
  };

  const handleSendManual = (e) => {
    e.preventDefault();
    onSendEmail({
      toEmail: testTargetEmail,
      company: testCompany,
      jobTitle: testPuesto,
      sourceUrl: 'https://www.zonajobs.com.ar',
      sourceName: 'ZonaJobs AR',
      subject: subject.replace('{PUESTO}', testPuesto).replace('{EMPRESA}', testCompany),
      bodyText: bodyText
        .replace(/{PUESTO}/g, testPuesto)
        .replace(/{EMPRESA}/g, testCompany)
        .replace(/{FUENTE}/g, 'ZonaJobs AR'),
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
      
      {/* Left Column: Form & Template Editor */}
      <div className="lg:col-span-7 space-y-6">
        
        {/* CV Uploader Card */}
        <div className="glass-panel p-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Paperclip className="w-5 h-5 text-cyan-400" />
            1. Carga de tu CV (Curriculum Vitae)
          </h3>

          <div className="border-2 border-dashed border-slate-700 hover:border-cyan-500/50 rounded-xl p-6 text-center transition-all bg-slate-900/40">
            {cv ? (
              <div className="flex items-center justify-between bg-slate-800/80 p-4 rounded-lg border border-emerald-500/30">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-800">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-white text-sm">{cv.fileName}</div>
                    <div className="text-xs text-slate-400">CV listo para adjuntar en postulaciones • {cv.size || 'Cargado'}</div>
                  </div>
                </div>
                <label className="text-xs text-cyan-400 hover:underline cursor-pointer font-semibold">
                  Cambiar
                  <input type="file" onChange={handleFileChange} accept=".pdf,.docx,.doc" className="hidden" />
                </label>
              </div>
            ) : (
              <div>
                <FileText className="w-10 h-10 text-slate-500 mx-auto mb-2" />
                <p className="text-sm font-semibold text-white">Haz clic o arrastra tu CV aquí</p>
                <p className="text-xs text-slate-400 mt-1">Formato soportado: PDF, DOCX (Máx. 10MB)</p>
                <label className="mt-4 btn-secondary text-xs inline-block cursor-pointer">
                  Seleccionar Archivo
                  <input type="file" onChange={handleFileChange} accept=".pdf,.docx,.doc" className="hidden" />
                </label>
              </div>
            )}
          </div>
        </div>

        {/* Email Template Card */}
        <div className="glass-panel p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Mail className="w-5 h-5 text-cyan-400" />
              2. Plantilla de Correo Electrónico
            </h3>
            <div className="flex items-center gap-2 bg-slate-900 px-3 py-1 rounded-full border border-slate-800 text-xs">
              <span className="text-slate-400">Modo Envío:</span>
              <button
                type="button"
                onClick={() => setIsSimulationMode(!isSimulationMode)}
                className={`font-semibold cursor-pointer ${
                  isSimulationMode ? 'text-amber-400' : 'text-emerald-400'
                }`}
              >
                {isSimulationMode ? '⚡ Simulación Pruebas' : '✉️ Real con Gmail'}
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                Asunto del Correo
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="glass-input"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Variables disponibles: <code className="text-cyan-400 font-mono">{'{PUESTO}'}</code>, <code className="text-cyan-400 font-mono">{'{EMPRESA}'}</code>
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                Cuerpo del Mensaje (Mensaje Principal)
              </label>
              <textarea
                rows={8}
                value={bodyText}
                onChange={(e) => setBodyText(e.target.value)}
                className="glass-input font-sans text-sm leading-relaxed"
              />
            </div>
          </div>
        </div>

      </div>

      {/* Right Column: Live Preview & Sending Controls */}
      <div className="lg:col-span-5 space-y-6">
        
        {/* Preview Box */}
        <div className="glass-panel p-6 border-cyan-500/20">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
            <h4 className="font-bold text-white flex items-center gap-2 text-base">
              <Eye className="w-5 h-5 text-cyan-400" />
              Vista Previa de la Empresa
            </h4>
            <span className="text-[11px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800 font-mono">
              HTML + Píxel 👁️
            </span>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-3 font-sans">
            <div className="border-b border-slate-800/80 pb-2">
              <span className="text-slate-500 font-medium">Para: </span>
              <span className="text-cyan-300 font-mono">{testTargetEmail}</span>
            </div>
            <div className="border-b border-slate-800/80 pb-2">
              <span className="text-slate-500 font-medium">Asunto: </span>
              <span className="text-white font-bold">
                {subject.replace('{PUESTO}', testPuesto).replace('{EMPRESA}', testCompany)}
              </span>
            </div>

            <div className="whitespace-pre-line text-slate-300 leading-relaxed pt-2">
              {bodyText
                .replace(/{PUESTO}/g, testPuesto)
                .replace(/{EMPRESA}/g, testCompany)
                .replace(/{FUENTE}/g, 'ZonaJobs AR')}
            </div>

            {/* Attached CV indicator */}
            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center gap-2 bg-slate-900/60 p-2.5 rounded-lg">
              <Paperclip className="w-4 h-4 text-emerald-400" />
              <span className="font-semibold text-emerald-300 text-xs">
                {cv ? cv.fileName : 'CV_Mi_Perfil.pdf'} (Adjunto)
              </span>
            </div>
          </div>

          {/* Manual Send Action */}
          <form onSubmit={handleSendManual} className="mt-6 pt-4 border-t border-slate-800 space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={testCompany}
                onChange={(e) => setTestCompany(e.target.value)}
                placeholder="Nombre Empresa"
                className="glass-input text-xs py-2"
              />
              <input
                type="text"
                value={testTargetEmail}
                onChange={(e) => setTestTargetEmail(e.target.value)}
                placeholder="Email Destinatario"
                className="glass-input text-xs py-2"
              />
            </div>

            <button
              type="submit"
              disabled={isSending}
              className="btn-primary w-full justify-center py-3"
            >
              {isSending ? (
                <>Enviando Correo...</>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Enviar Postulación de Prueba Ahora
                </>
              )}
            </button>
          </form>

        </div>

      </div>

    </div>
  );
}
