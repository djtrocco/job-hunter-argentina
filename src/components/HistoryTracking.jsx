import React, { useState } from 'react';
import { History, Eye, ExternalLink, Mail, CheckCircle2, Clock, FileText, Send, Sparkles, RefreshCw } from 'lucide-react';

export default function HistoryTracking({ history = [], onRefresh }) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredHistory = history.filter(
    (item) =>
      item.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.jobTitle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalSent = history.length;
  const totalRead = history.filter((item) => item.status === 'Leído').length;
  const readPercentage = totalSent > 0 ? Math.round((totalRead / totalSent) * 100) : 0;

  return (
    <div className="space-y-8 my-8">
      
      {/* Stats Header Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        <div className="glass-panel p-6 border-blue-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Postulaciones</p>
              <h3 className="text-3xl font-extrabold text-white mt-1">{totalSent}</h3>
            </div>
            <div className="p-3 rounded-xl bg-blue-950 text-blue-400 border border-blue-800">
              <Send className="w-6 h-6" />
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-2">Correos enviados o procesados</p>
        </div>

        {/* REQUERIMIENTO DEL USUARIO: AVISO DE LECTURA */}
        <div className="glass-panel p-6 border-emerald-500/40 bg-emerald-950/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-400">Confirmaciones de Lectura 👁️</p>
              <h3 className="text-3xl font-extrabold text-emerald-300 mt-1">{totalRead}</h3>
            </div>
            <div className="p-3 rounded-xl bg-emerald-950 text-emerald-400 border border-emerald-800 shadow-lg shadow-emerald-500/20">
              <Eye className="w-6 h-6" />
            </div>
          </div>
          <p className="text-xs text-emerald-400/80 mt-2 font-medium">
            ¡{readPercentage}% de tus mails fueron abiertos por reclutadores!
          </p>
        </div>

        <div className="glass-panel p-6 border-amber-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Tasa de Respuesta Estimada</p>
              <h3 className="text-3xl font-extrabold text-amber-300 mt-1">{readPercentage > 0 ? `${Math.round(readPercentage * 0.4)}%` : '0%'}</h3>
            </div>
            <div className="p-3 rounded-xl bg-amber-950 text-amber-400 border border-amber-800">
              <Sparkles className="w-6 h-6" />
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-2">Basado en aperturas de correos</p>
        </div>

      </div>

      {/* History Log Table */}
      <div className="glass-panel p-6">
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <History className="w-5 h-5 text-cyan-400" />
              Historial de Postulaciones & Confirmaciones de Lectura
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Seguimiento en tiempo real del estado de entrega y píxel de lectura de tus correos.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por empresa o mail..."
              className="glass-input text-xs py-2 w-full sm:w-64"
            />
            <button onClick={onRefresh} className="btn-secondary text-xs p-2.5" title="Actualizar estado">
              <RefreshCw className="w-4 h-4 text-cyan-400" />
            </button>
          </div>
        </div>

        {filteredHistory.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-sm">
            No se encontraron postulaciones registradas.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-900/90 text-xs font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-4">Empresa / Puesto</th>
                  <th className="p-4">Correo Destinatario</th>
                  <th className="p-4">Estado de Entrega & Lectura</th>
                  <th className="p-4">Origen / Enlace Aviso</th>
                  <th className="p-4 text-right">Fecha de Envío</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredHistory.map((item) => {
                  const isRead = item.status === 'Leído';
                  return (
                    <tr key={item.id} className="hover:bg-slate-900/50 transition-colors">
                      
                      {/* Company & Title */}
                      <td className="p-4">
                        <div className="font-bold text-white text-base">{item.company}</div>
                        <div className="text-xs text-slate-400 mt-0.5">{item.jobTitle}</div>
                        <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-slate-400">
                          <FileText className="w-3.5 h-3.5 text-cyan-400" />
                          <span>CV: {item.cvAttached}</span>
                        </div>
                      </td>

                      {/* Destination Email */}
                      <td className="p-4">
                        <div className="font-mono text-cyan-300 font-semibold text-sm">{item.email}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {item.isSimulation ? '⚡ Envío en Modo Simulación' : '✉️ Enviado con Gmail'}
                        </div>
                      </td>

                      {/* READ RECEIPT STATUS (REQUERIMIENTO DEL USUARIO) */}
                      <td className="p-4">
                        {isRead ? (
                          <div className="space-y-1">
                            <span className="badge badge-read">
                              <Eye className="w-3.5 h-3.5" />
                              Leído por la empresa 👁️
                            </span>
                            <div className="text-[11px] text-emerald-400/90 font-medium">
                              Abierto: {new Date(item.readAt).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })} hs
                              {item.readCount > 1 && ` (${item.readCount} lecturas)`}
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <span className="badge badge-sent">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Enviado (Pendiente Lectura)
                            </span>
                            <div className="text-[11px] text-slate-500">Esperando apertura...</div>
                          </div>
                        )}
                      </td>

                      {/* SOURCE URL LINK (REQUERIMIENTO DEL USUARIO) */}
                      <td className="p-4">
                        <a
                          href={item.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-external"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          Ver Aviso
                        </a>
                      </td>

                      {/* Date Sent */}
                      <td className="p-4 text-right">
                        <div className="text-xs font-semibold text-white">
                          {new Date(item.dateSent).toLocaleDateString('es-AR')}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {new Date(item.dateSent).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })} hs
                        </div>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

      </div>

    </div>
  );
}
