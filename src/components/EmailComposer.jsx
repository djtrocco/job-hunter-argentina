import React, { useState, useEffect } from 'react';
import { Mail, Paperclip, FileText, Send, Sparkles, CheckCircle2, ShieldAlert, Eye, AlertCircle } from 'lucide-react';

export default function EmailComposer({
  cv,
  selectedJob,
  onUploadCV,
  onSendEmail,
  isSending,
  isSimulationMode,
  setIsSimulationMode,
  gmailUser,
  gmailAppPassword
}) {
  const [testTargetEmail, setTestTargetEmail] = useState('rrhh@empresa-ejemplo.com.ar');
  const [testCompany, setTestCompany] = useState('Tech Argentina S.A.');
  const [testPuesto, setTestPuesto] = useState('Desarrollador Full Stack');
  const [sourceUrl, setSourceUrl] = useState('https://www.zonajobs.com.ar');
  const [sourceName, setSourceName] = useState('ZonaJobs AR');

  const [subject, setSubject] = useState('Postulación al puesto de {PUESTO} - Adjunto mi CV');
  const [bodyText, setBodyText] = useState(
    `Estimado equipo de Selección de {EMPRESA},\n\n` +
    `Me contacto con ustedes referente al aviso de la búsqueda laboral de {PUESTO} publicado en {FUENTE}.\n\n` +
    `Cuento con experiencia relevante en el sector y motivación para incorporarme al equipo. Adjunto mi Curriculum Vitae actualizado para su evaluación.\n\n` +
    `Quedo a disposición para concertar una entrevista.\n\n` +
    `Atentamente,\nPostulante`
  );

  // Auto-populate when a job is selected from results table
  useEffect(() => {
    if (selectedJob) {
      if (selectedJob.email) setTestTargetEmail(selectedJob.email);
      if (selectedJob.company) setTestCompany(selectedJob.company);
      if (selectedJob.jobTitle) setTestPuesto(selectedJob.jobTitle);
      if (selectedJob.sourceUrl) setSourceUrl(selectedJob.sourceUrl);
      if (selectedJob.sourceName) setSourceName(selectedJob.sourceName);
    }
  }, [selectedJob]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Pass the raw File object directly - App.jsx stores it in a ref for multipart upload
      onUploadCV(file);
    }
  };

  const handleSendManual = (e) => {
    e.preventDefault();
    onSendEmail({
      toEmail: testTargetEmail,
      company: testCompany,
      jobTitle: testPuesto,
      sourceUrl: sourceUrl,
      sourceName: sourceName,
      subject: subject.replace('{PUESTO}', testPuesto).replace('{EMPRESA}', testCompany),
      bodyText: bodyText
        .replace(/{PUESTO}/g, testPuesto)
        .replace(/{EMPRESA}/g, testCompany)
        .replace(/{FUENTE}/g, sourceName),
      gmailUser,
      gmailAppPassword,
    });
  };

  const hasGmailConfig = gmailUser && gmailAppPassword;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
      
      {/* Left Column: Form & Template Editor */}
      <div className="lg:col-span-7 space-y-6">
        
        {/* Mode Selector Card */}
        <div className={`glass-panel p-5 border ${!isSimulationMode && hasGmailConfig ? 'border-emerald-500/40 bg-emerald-950/10' : 'border-amber-500/30'}`}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-base">Modo de Envío Activo:</span>
                <span className={`text-xs font-extrabold px-3 py-1 rounded-full border ${
                  !isSimulationMode && hasGmailConfig
                    ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                    : 'bg-amber-950 text-amber-400 border-amber-800'
                }`}>
                  {!isSimulationMode && hasGmailConfig ? '✉️ Envío Real con Gmail' : '⚡ Modo Simulación Pruebas'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {!isSimulationMode && hasGmailConfig
                  ? `Conectado como ${gmailUser}. Los correos se enviarán con tu CV adjunto.`
                  : 'Modo seguro para probar búsquedas sin consumir cuota de tu correo.'}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsSimulationMode(!isSimulationMode)}
              className="btn-secondary text-xs"
            >
              Cambiar a {!isSimulationMode ? 'Modo Simulación' : 'Envío Real con Gmail'}
            </button>
          </div>
        </div>

        {/* CV Uploader Card */}
        <div className="glass-panel p-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Paperclip className="w-5 h-5 text-cyan-400" />
            1. Curriculum Vitae (Archivo Adjunto a Enviar)
          </h3>

          <div className="border-2 border-dashed border-slate-700 hover:border-cyan-500/50 rounded-xl p-6 text-center transition-all bg-slate-900/40">
            {cv ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between bg-slate-800/80 p-4 rounded-lg border border-emerald-500/30">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-800">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-white text-sm">{cv.fileName}</div>
                      <div className="text-xs text-emerald-400 font-medium">
                        ✓ Listo para adjuntar • {cv.size || 'Cargado'}
                      </div>
                    </div>
                  </div>
                  <label className="text-xs text-cyan-400 hover:underline cursor-pointer font-semibold">
                    Cambiar Archivo
                    <input type="file" onChange={handleFileChange} accept=".pdf,.docx,.doc" className="hidden" />
                  </label>
                </div>
                {/* Warning: file may need to be re-uploaded after page refresh */}
                <div className="flex items-start gap-2 bg-amber-950/40 border border-amber-700/40 rounded-lg p-3 text-left">
                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-300">
                    <span className="font-bold">Importante:</span> Si recargaste la página, el archivo no está en memoria. Debes seleccionarlo nuevamente antes de enviar para que llegue como adjunto.
                  </p>
                </div>
              </div>
            ) : (
              <div>
                <FileText className="w-10 h-10 text-slate-500 mx-auto mb-2" />
                <p className="text-sm font-semibold text-white">Haz clic o arrastra tu CV aquí</p>
                <p className="text-xs text-slate-400 mt-1">Formatos recomendados: PDF, DOCX (Máx. 15MB)</p>
                <label className="mt-4 btn-secondary text-xs inline-block cursor-pointer">
                  Seleccionar Archivo CV
                  <input type="file" onChange={handleFileChange} accept=".pdf,.docx,.doc" className="hidden" />
                </label>
              </div>
            )}
          </div>
        </div>

        {/* Email Template Card */}
        <div className="glass-panel p-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Mail className="w-5 h-5 text-cyan-400" />
            2. Mensaje de Postulación
          </h3>

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
                Variables dinámicas: <code className="text-cyan-400 font-mono">{'{PUESTO}'}</code>, <code className="text-cyan-400 font-mono">{'{EMPRESA}'}</code>
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                Cuerpo del Correo
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
              Vista Previa del Email a Enviar
            </h4>
            <span className="text-[11px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800 font-mono">
              Píxel de Lectura Incluido 👁️
            </span>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-3 font-sans">
            <div className="border-b border-slate-800/80 pb-2">
              <span className="text-slate-500 font-medium">De: </span>
              <span className="text-emerald-400 font-mono font-semibold">
                {gmailUser || 'tu-correo@gmail.com'}
              </span>
            </div>
            <div className="border-b border-slate-800/80 pb-2">
              <span className="text-slate-500 font-medium">Para: </span>
              <span className="text-cyan-300 font-mono font-bold">{testTargetEmail}</span>
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
                .replace(/{FUENTE}/g, sourceName)}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center gap-2 bg-slate-900/60 p-2.5 rounded-lg border border-emerald-500/30">
              <Paperclip className="w-4 h-4 text-emerald-400" />
              <span className="font-semibold text-emerald-300 text-xs">
                📎 Adjunto: {cv ? cv.fileName : 'CV_Mi_Perfil.pdf'}
              </span>
            </div>
          </div>

          {/* Target Email Fields & Send Action */}
          <form onSubmit={handleSendManual} className="mt-6 pt-4 border-t border-slate-800 space-y-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1 uppercase">Empresa Destino</label>
              <input
                type="text"
                value={testCompany}
                onChange={(e) => setTestCompany(e.target.value)}
                placeholder="Nombre Empresa"
                className="glass-input text-xs py-2"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1 uppercase">Correo Destinatario</label>
              <input
                type="email"
                required
                value={testTargetEmail}
                onChange={(e) => setTestTargetEmail(e.target.value)}
                placeholder="rrhh@empresa.com.ar"
                className="glass-input text-xs py-2 font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={isSending}
              className="btn-primary w-full justify-center py-3.5 mt-2"
            >
              {isSending ? (
                <>Enviando Correo con CV Adjunto...</>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  {!isSimulationMode && hasGmailConfig ? 'Enviar Postulación Real vía Gmail con CV' : 'Enviar Postulación de Prueba (Simulación)'}
                </>
              )}
            </button>
          </form>

        </div>

      </div>

    </div>
  );
}
