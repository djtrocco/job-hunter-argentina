import React, { useState } from 'react';
import { Search, MapPin, Sparkles, Filter, CheckCircle2, Globe, Building2 } from 'lucide-react';

export default function SearchSection({ onSearch, isLoading }) {
  const [keyword, setKeyword] = useState('Desarrollador Full Stack');
  const [location, setLocation] = useState('Buenos Aires');
  const [selectedPortals, setSelectedPortals] = useState({
    zonajobs: true,
    computrabajo: true,
    linkedin: true,
    google: true,
  });

  const presets = [
    'Desarrollador Full Stack',
    'Desarrollador React / Node',
    'Contador / Impositivo',
    'Vendedor / Comercial',
    'Analista de Marketing',
    'Administrativo / RRHH',
    'Diseñador UX/UI',
    'Soporte Técnico',
  ];

  const togglePortal = (key) => {
    setSelectedPortals((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!keyword.trim()) return;
    onSearch({
      keyword,
      location,
      portals: Object.keys(selectedPortals).filter((k) => selectedPortals[k]),
    });
  };

  return (
    <div className="glass-panel p-6 sm:p-8 mb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Search className="w-6 h-6 text-cyan-400" />
            Buscador de Avisos Laborales en Argentina
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Escanea los motores y portales de empleo de Argentina para rastrear vacantes y extraer sus correos de contacto.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800 text-xs text-slate-300">
          <Globe className="w-4 h-4 text-emerald-400" />
          Filtro Activo: <span className="font-semibold text-white">Dominio .com.ar & Portales AR</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          
          {/* Keyword Input */}
          <div className="md:col-span-6">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
              Palabra Clave o Puesto de Empleo
            </label>
            <div className="relative">
              <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Ej: Desarrollador React, Contador, Vendedor..."
                className="glass-input pl-11"
              />
            </div>
          </div>

          {/* Location Input */}
          <div className="md:col-span-3">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
              Ubicación / Provincia
            </label>
            <div className="relative">
              <MapPin className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="glass-input pl-11 appearance-none bg-slate-900 cursor-pointer"
              >
                <option value="Buenos Aires">Buenos Aires (CABA & GBA)</option>
                <option value="Córdoba">Córdoba</option>
                <option value="Rosario">Rosario (Santa Fe)</option>
                <option value="Mendoza">Mendoza</option>
                <option value="Remoto">Remoto (Toda Argentina)</option>
              </select>
            </div>
          </div>

          {/* Search Button */}
          <div className="md:col-span-3 flex items-end">
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full justify-center py-3 text-base"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Escaneando Portales...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Buscar & Extraer Emails
                </>
              )}
            </button>
          </div>

        </div>

        {/* Quick Presets */}
        <div>
          <span className="text-xs text-slate-400 font-medium mr-2">Búsquedas Frecuentes:</span>
          <div className="flex flex-wrap gap-2 mt-2">
            {presets.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setKeyword(preset)}
                className={`text-xs px-3 py-1.5 rounded-full transition-all border ${
                  keyword === preset
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 font-semibold'
                    : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-white'
                }`}
              >
                {preset}
              </button>
            ))}
          </div>
        </div>

        {/* Target Portals Selection */}
        <div className="pt-4 border-t border-slate-800/80">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
            Motores & Fuentes Incluidas en el Escaneo:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { id: 'zonajobs', label: 'ZonaJobs (.com.ar)', badge: 'AR' },
              { id: 'computrabajo', label: 'CompuTrabajo (AR)', badge: 'AR' },
              { id: 'linkedin', label: 'LinkedIn Argentina', badge: 'RED' },
              { id: 'google', label: 'Google Búsqueda Web', badge: 'WEB' },
            ].map((portal) => (
              <div
                key={portal.id}
                onClick={() => togglePortal(portal.id)}
                className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                  selectedPortals[portal.id]
                    ? 'bg-slate-900/90 border-cyan-500/40 text-white'
                    : 'bg-slate-950/40 border-slate-800/60 text-slate-500'
                }`}
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2
                    className={`w-4 h-4 ${
                      selectedPortals[portal.id] ? 'text-cyan-400' : 'text-slate-600'
                    }`}
                  />
                  <span className="text-xs font-medium">{portal.label}</span>
                </div>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                  {portal.badge}
                </span>
              </div>
            ))}
          </div>
        </div>

      </form>
    </div>
  );
}
