import React, { useState } from 'react';
import { Search, MapPin, Sparkles, Filter, CheckCircle2, Globe, Building2, Info } from 'lucide-react';

export default function SearchSection({ onSearch, isLoading }) {
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('Buenos Aires');
  const [selectedPortals, setSelectedPortals] = useState({
    computrabajo: true,
    zonajobs: true,
    bumeran: true,
    duckduckgo: true,
  });

  const presets = [
    'Desarrollador Full Stack',
    'Desarrollador React',
    'Contador / Impositivo',
    'Vendedor / Comercial',
    'Analista de Marketing',
    'Administrativo / RRHH',
    'Diseñador UX/UI',
    'Soporte Técnico IT',
  ];

  const portals = [
    {
      id: 'computrabajo',
      label: 'CompuTrabajo',
      description: 'ar.computrabajo.com',
      badge: 'AR',
      color: 'text-orange-400',
    },
    {
      id: 'zonajobs',
      label: 'ZonaJobs',
      description: 'zonajobs.com.ar',
      badge: 'AR',
      color: 'text-blue-400',
    },
    {
      id: 'bumeran',
      label: 'Bumeran',
      description: 'bumeran.com.ar',
      badge: 'AR',
      color: 'text-purple-400',
    },
    {
      id: 'duckduckgo',
      label: 'Búsqueda Web',
      description: 'portales .com.ar con email',
      badge: 'WEB',
      color: 'text-emerald-400',
    },
  ];

  const togglePortal = (key) => {
    setSelectedPortals((prev) => {
      const activeCount = Object.values(prev).filter(Boolean).length;
      // Prevent deselecting all portals
      if (prev[key] && activeCount === 1) return prev;
      return { ...prev, [key]: !prev[key] };
    });
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

  const activeCount = Object.values(selectedPortals).filter(Boolean).length;

  return (
    <div className="glass-panel p-6 sm:p-8 mb-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Search className="w-6 h-6 text-cyan-400" />
            Buscador de Avisos Laborales en Argentina
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Entra a cada aviso individualmente y extrae el email del cuerpo. Si el aviso no tiene email, es descartado.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-emerald-950/40 px-3 py-2 rounded-lg border border-emerald-800/50 text-xs text-emerald-300">
          <Globe className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Solo resultados con email real en el cuerpo del aviso</span>
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
                required
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
                <option value="Tucumán">Tucumán</option>
                <option value="Remoto">Remoto (Toda Argentina)</option>
              </select>
            </div>
          </div>

          {/* Search Button */}
          <div className="md:col-span-3 flex items-end">
            <button
              type="submit"
              disabled={isLoading || !keyword.trim()}
              className="btn-primary w-full justify-center py-3 text-base disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Escaneando avisos...
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
          <span className="text-xs text-slate-400 font-medium mr-2">Búsquedas frecuentes:</span>
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

        {/* Portal Selection */}
        <div className="pt-4 border-t border-slate-800/80">
          <div className="flex items-center justify-between mb-3">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
              Portales incluidos en el escaneo ({activeCount} activos)
            </label>
            <div className="flex items-center gap-1.5 text-[11px] text-amber-400 bg-amber-950/30 border border-amber-800/30 px-2.5 py-1 rounded-lg">
              <Info className="w-3.5 h-3.5" />
              El scraper entra a cada aviso para buscar el email en el cuerpo
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {portals.map((portal) => (
              <div
                key={portal.id}
                onClick={() => togglePortal(portal.id)}
                className={`flex flex-col p-3 rounded-xl border cursor-pointer transition-all select-none ${
                  selectedPortals[portal.id]
                    ? 'bg-slate-900/90 border-cyan-500/40 text-white'
                    : 'bg-slate-950/40 border-slate-800/60 text-slate-500 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <CheckCircle2
                    className={`w-4 h-4 ${
                      selectedPortals[portal.id] ? 'text-cyan-400' : 'text-slate-600'
                    }`}
                  />
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                    {portal.badge}
                  </span>
                </div>
                <span className={`text-xs font-bold ${selectedPortals[portal.id] ? 'text-white' : 'text-slate-500'}`}>
                  {portal.label}
                </span>
                <span className={`text-[11px] mt-0.5 ${selectedPortals[portal.id] ? portal.color : 'text-slate-600'}`}>
                  {portal.description}
                </span>
              </div>
            ))}
          </div>

          {/* Info note */}
          <p className="text-[11px] text-slate-500 mt-3 leading-relaxed">
            ⏱️ La búsqueda puede tardar <span className="text-slate-400 font-medium">15-30 segundos</span> porque el scraper entra a cada aviso individualmente.
            Solo se muestran avisos donde se encontró un email real en el cuerpo de la publicación.
          </p>
        </div>

      </form>
    </div>
  );
}
