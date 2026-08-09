import React, { useState } from 'react';
import { Mail, ExternalLink, Send, CheckSquare, Square, Building, MapPin, Eye, ShieldCheck, Sparkles } from 'lucide-react';

export default function ResultsTable({ results = [], onSendSingle, onSendBatch, isSending, searched = false }) {
  const [selectedIds, setSelectedIds] = useState([]);
  const [previewSnippet, setPreviewSnippet] = useState(null);

  if (!results || results.length === 0) {
    return (
      <div className="glass-panel p-12 text-center my-8">
        <div className="w-16 h-16 rounded-full bg-slate-900 mx-auto flex items-center justify-center mb-4 border border-slate-800 text-slate-500">
          <Mail className="w-8 h-8" />
        </div>
        {searched ? (
          <>
            <h3 className="text-lg font-bold text-white mb-2">No se encontraron avisos con email en el cuerpo</h3>
            <p className="text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
              El scraper recorrió los portales de empleo argentinos y no encontró ningún aviso que incluya un correo electrónico visible en el cuerpo del aviso.
              <br /><br />
              <span className="text-cyan-400 font-medium">Sugerencias:</span> Probá con otra palabra clave, variá el término (ej: "contador" en vez de "contabilidad") o intentá de nuevo en unos minutos.
            </p>
          </>
        ) : (
          <>
            <h3 className="text-lg font-bold text-white mb-2">Realizá tu primera búsqueda</h3>
            <p className="text-sm text-slate-400 max-w-md mx-auto">
              Ingresá una palabra clave arriba para que el scraper recorra los portales de empleo argentinos, entre a cada aviso y extraiga el email del cuerpo del aviso.
            </p>
          </>
        )}
      </div>
    );
  }


  const toggleSelectAll = () => {
    if (selectedIds.length === results.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(results.map((r) => r.id));
    }
  };

  const toggleSelectOne = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleBatchSend = () => {
    const selectedItems = results.filter((r) => selectedIds.includes(r.id));
    onSendBatch(selectedItems);
  };

  return (
    <div className="glass-panel p-6 mb-8">
      {/* Header & Bulk Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-800">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            Resultados de Avisos & Correos Extraídos ({results.length})
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Se ha escaneado el contenido de cada aviso y capturado la dirección de correo y la URL de publicación.
          </p>
        </div>

        {selectedIds.length > 0 && (
          <button
            onClick={handleBatchSend}
            disabled={isSending}
            className="btn-primary py-2 text-xs"
          >
            <Send className="w-4 h-4" />
            Enviar CV a Selección ({selectedIds.length})
          </button>
        )}
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="bg-slate-900/90 text-xs font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-800">
            <tr>
              <th className="p-4 w-10">
                <button onClick={toggleSelectAll} className="text-slate-400 hover:text-white">
                  {selectedIds.length === results.length ? (
                    <CheckSquare className="w-5 h-5 text-cyan-400" />
                  ) : (
                    <Square className="w-5 h-5" />
                  )}
                </button>
              </th>
              <th className="p-4">Empresa / Vacante</th>
              <th className="p-4">Correo Detectado</th>
              <th className="p-4">Origen / Enlace Web</th>
              <th className="p-4 text-right">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {results.map((item) => {
              const isSelected = selectedIds.includes(item.id);
              return (
                <tr
                  key={item.id}
                  className={`hover:bg-slate-900/60 transition-colors ${
                    isSelected ? 'bg-cyan-950/20' : ''
                  }`}
                >
                  {/* Select Checkbox */}
                  <td className="p-4">
                    <button
                      onClick={() => toggleSelectOne(item.id)}
                      className="text-slate-400 hover:text-white"
                    >
                      {isSelected ? (
                        <CheckSquare className="w-5 h-5 text-cyan-400" />
                      ) : (
                        <Square className="w-5 h-5" />
                      )}
                    </button>
                  </td>

                  {/* Company & Job Title */}
                  <td className="p-4">
                    <div className="font-bold text-white text-base">{item.jobTitle}</div>
                    <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                      <span className="flex items-center gap-1">
                        <Building className="w-3.5 h-3.5 text-slate-500" />
                        {item.company}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-500" />
                        {item.location}
                      </span>
                    </div>
                  </td>

                  {/* Extracted Email */}
                  <td className="p-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cyan-950/40 border border-cyan-800/50">
                      <Mail className="w-4 h-4 text-cyan-400" />
                      <span className="font-mono font-semibold text-cyan-200 text-sm">{item.email}</span>
                    </div>
                    <div className="mt-1 flex items-center gap-1.5 text-[11px] text-emerald-400">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>{item.confidence || 'Confianza Alta'}</span>
                    </div>
                  </td>

                  {/* SOURCE URL BUTTON (REQUERIMIENTO DEL USUARIO) */}
                  <td className="p-4">
                    <div className="flex flex-col gap-1.5 items-start">
                      <span className="text-xs text-slate-400 font-medium">{item.sourceName}</span>
                      <a
                        href={item.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Ver la publicación original en el portal de empleos"
                        className="btn-external"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Ver Aviso Original
                      </a>
                    </div>
                  </td>

                  {/* Send Action */}
                  <td className="p-4 text-right">
                    <button
                      onClick={() => onSendSingle(item)}
                      disabled={isSending}
                      className="btn-primary text-xs py-2 px-3"
                    >
                      <Send className="w-3.5 h-3.5" />
                      Enviar CV
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

    </div>
  );
}
