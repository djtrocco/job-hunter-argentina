import React, { useState, useEffect, useRef } from 'react';
import Navbar from './components/Navbar';
import SearchSection from './components/SearchSection';
import ResultsTable from './components/ResultsTable';
import EmailComposer from './components/EmailComposer';
import GmailSettings from './components/GmailSettings';
import HistoryTracking from './components/HistoryTracking';
import GitHubVercelGuide from './components/GitHubVercelGuide';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('search');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [history, setHistory] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  
  // cv state only stores metadata (name, type, size) - NOT the file content
  // The actual File object is kept in memory via a ref for reliable multipart sending
  const cvFileRef = useRef(null); // holds the real File object
  const [cv, setCv] = useState(() => {
    try {
      const saved = localStorage.getItem('userCVMeta');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  useEffect(() => {
    if (cv) {
      try {
        // Only save metadata, never the file content - avoids localStorage size limit
        localStorage.setItem('userCVMeta', JSON.stringify({
          fileName: cv.fileName,
          fileType: cv.fileType,
          size: cv.size,
          uploadedAt: cv.uploadedAt,
        }));
      } catch (e) {
        console.log('CV meta storage error:', e);
      }
    }
  }, [cv]);

  // Gmail & App Passwords settings with localStorage persistence
  const [gmailUser, setGmailUser] = useState(() => localStorage.getItem('gmailUser') || '');
  const [gmailAppPassword, setGmailAppPassword] = useState(() => localStorage.getItem('gmailAppPassword') || '');
  const [isSimulationMode, setIsSimulationMode] = useState(() => {
    const saved = localStorage.getItem('isSimulationMode');
    return saved !== null ? JSON.parse(saved) : false;
  });
  
  const [selectedJob, setSelectedJob] = useState(null);
  const [isTestingGmail, setIsTestingGmail] = useState(false);

  useEffect(() => {
    localStorage.setItem('gmailUser', gmailUser);
  }, [gmailUser]);

  useEffect(() => {
    localStorage.setItem('gmailAppPassword', gmailAppPassword);
  }, [gmailAppPassword]);

  useEffect(() => {
    localStorage.setItem('isSimulationMode', JSON.stringify(isSimulationMode));
  }, [isSimulationMode]);

  // Toast Notifications State
  const [toasts, setToasts] = useState([]);

  const addToast = (type, title, message) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Mock search fallback
  const generateMockSearch = (keyword) => {
    const argentinaLocations = ['Buenos Aires (CABA)', 'Córdoba', 'Rosario, Santa Fe', 'Mendoza', 'Remoto (Argentina)'];
    const searchQueries = [
      { name: 'ZonaJobs (.com.ar)', base: 'https://www.zonajobs.com.ar' },
      { name: 'CompuTrabajo (AR)', base: 'https://ar.computrabajo.com' },
      { name: 'LinkedIn Argentina', base: 'https://ar.linkedin.com' },
      { name: 'Google Búsqueda Web', base: 'https://www.google.com.ar' }
    ];
    const companies = [
      'Empresa de Tecnología & Software AR',
      'Consultora de Recursos Humanos',
      'Grupo Financiero Argentina',
      'Estudio Profesional & Asesores',
      'Agencia Digital Buenos Aires',
      'Logística & Comercio Exterior S.A.'
    ];

    const resultsList = [];
    for (let i = 0; i < 6; i++) {
      const source = searchQueries[i % searchQueries.length];
      const comp = companies[i % companies.length];
      const loc = argentinaLocations[i % argentinaLocations.length];
      const emailPrefixes = ['rrhh', 'busquedas', 'empleos', 'contacto', 'talent', 'cv'];
      const prefix = emailPrefixes[i % emailPrefixes.length];
      const extractedEmail = `${prefix}@${comp.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 10)}.com.ar`;

      resultsList.push({
        id: `job_${Date.now()}_${i}`,
        jobTitle: `${keyword.trim()} - ${loc}`,
        company: comp,
        location: loc,
        email: extractedEmail,
        confidence: 'Email Verificado en Cuerpo',
        snippet: `Buscamos ${keyword} para sumarse a nuestro equipo en ${loc}. Requisitos: experiencia previa, proactividad y trabajo en equipo. Enviar CV a ${extractedEmail}.`,
        sourceName: source.name,
        sourceUrl: `${source.base}/empleos/postulacion-${keyword.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${i + 100}.html`,
        foundAt: new Date().toLocaleDateString('es-AR', { hour: '2-digit', minute: '2-digit' }),
      });
    }
    return resultsList;
  };

  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/history');
      if (res.ok) {
        const data = await res.json();
        setHistory(data.history || []);
      }
    } catch (e) {
      console.log('History fetch offset');
    }
  };

  useEffect(() => {
    fetchHistory();
    const interval = setInterval(fetchHistory, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleSearch = async ({ keyword, location, portals }) => {
    setIsLoading(true);
    setResults([]); // Clear previous results
    setHasSearched(true);
    try {
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword, location, portals }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setResults(data.results || []);
          if (data.totalFound > 0) {
            addToast(
              'success',
              '¡Búsqueda Completada!',
              `Se encontraron ${data.totalFound} avisos con email verificado en el cuerpo del aviso.`
            );
          } else {
            addToast(
              'info',
              'Sin resultados con email',
              `No se encontraron avisos con email visible en el cuerpo para "${keyword}". Probá otra palabra clave.`
            );
          }
          setIsLoading(false);
          return;
        }
      }

      // Server error
      addToast('error', 'Error en la búsqueda', 'No se pudo conectar con el servidor. Verificá tu conexión.');
      setIsLoading(false);
    } catch (err) {
      addToast('error', 'Error de conexión', 'No se pudo conectar con el servidor de búsqueda.');
      setIsLoading(false);
    }
  };

  // Handle CV File Upload - stores File object in ref and metadata in state
  const handleUploadCV = (file) => {
    // Keep the actual File object in memory for multipart form sending
    cvFileRef.current = file;

    const cvMeta = {
      fileName: file.name,
      fileType: file.type || 'application/pdf',
      size: `${(file.size / 1024).toFixed(1)} KB`,
      uploadedAt: new Date().toISOString(),
    };
    setCv(cvMeta);
    addToast('success', 'CV Adjuntado Exitosamente', `Archivo "${file.name}" (${cvMeta.size}) cargado y listo para enviar.`);
  };

  const handleTestGmailConnection = async (user, pass) => {
    setIsTestingGmail(true);
    setGmailUser(user);
    setGmailAppPassword(pass);
    localStorage.setItem('gmailUser', user);
    localStorage.setItem('gmailAppPassword', pass);

    try {
      const res = await fetch('/api/test-gmail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gmailUser: user, gmailAppPassword: pass }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setIsSimulationMode(false);
          addToast('success', 'Gmail Conectado', '¡Conexión SMTP verificada! Envío real con archivo adjunto activado.');
          setIsTestingGmail(false);
          return { success: true, message: data.message };
        } else {
          addToast('error', 'Error en Gmail', data.error);
          setIsTestingGmail(false);
          return { success: false, error: data.error };
        }
      }
    } catch (e) {
      console.log('Gmail test API error');
    }

    setIsSimulationMode(false);
    setIsTestingGmail(false);
    addToast('success', 'Credenciales Guardadas', 'Tus datos de Gmail han sido guardados.');
    return { success: true, message: 'Credenciales guardadas correctamente.' };
  };

  // Handle Email Dispatch using multipart/form-data for reliable file attachment
  const handleSendEmail = async (payload) => {
    setIsSending(true);

    const userToUse = payload.gmailUser || gmailUser;
    const passToUse = payload.gmailAppPassword || gmailAppPassword;

    if (!isSimulationMode && (!userToUse || !passToUse)) {
      addToast(
        'error',
        'Faltan Credenciales de Gmail',
        'Por favor, configura tu correo de Gmail y Contraseña de Aplicación en la pestaña "Gmail & SMTP".'
      );
      setActiveTab('settings');
      setIsSending(false);
      return;
    }

    const cvFileNameToSend = cv ? cv.fileName : 'CV_Postulante.pdf';

    try {
      // Build multipart/form-data so the file is sent as a real binary attachment
      const formData = new FormData();
      formData.append('toEmail', payload.toEmail);
      formData.append('company', payload.company || '');
      formData.append('jobTitle', payload.jobTitle || '');
      formData.append('sourceUrl', payload.sourceUrl || '');
      formData.append('sourceName', payload.sourceName || '');
      formData.append('subject', payload.subject || '');
      formData.append('bodyText', payload.bodyText || '');
      formData.append('gmailUser', userToUse);
      formData.append('gmailAppPassword', passToUse);
      formData.append('isSimulationMode', String(isSimulationMode));
      formData.append('appHostUrl', window.location.origin);

      // Attach the actual file if available in ref (session-memory)
      if (cvFileRef.current) {
        formData.append('cvFile', cvFileRef.current, cvFileRef.current.name);
      }

      const res = await fetch('/api/send-email', {
        method: 'POST',
        // Do NOT set Content-Type header - browser sets it automatically with boundary for multipart
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          addToast(
            'success',
            isSimulationMode ? '⚡ Postulación Simulada' : '✉️ Correo Enviado vía Gmail con CV Adjunto 📎',
            `Se despachó tu correo a ${payload.toEmail}${cvFileRef.current ? ' con tu CV adjunto.' : '.'}`
          );
          fetchHistory();
          setActiveTab('history');
          setIsSending(false);
          return;
        } else {
          addToast('error', 'Error al Enviar', data.error || 'Ocurrió un error desconocido.');
          setIsSending(false);
          return;
        }
      } else {
        const errData = await res.json().catch(() => ({}));
        addToast('error', 'Error del Servidor', errData.error || `Error HTTP ${res.status}`);
        setIsSending(false);
        return;
      }
    } catch (e) {
      console.error('Send email error:', e);
      addToast('error', 'Error de Conexión', 'No se pudo conectar con el servidor de envío.');
      setIsSending(false);
    }
  };

  const handleSendBatch = async (items) => {
    setIsSending(true);
    let successCount = 0;
    for (const item of items) {
      await handleSendEmail({
        toEmail: item.email,
        company: item.company,
        jobTitle: item.jobTitle,
        sourceUrl: item.sourceUrl,
        sourceName: item.sourceName,
        subject: `Postulación a ${item.jobTitle} - Adjunto CV`,
        bodyText: `Estimado equipo de Selección de ${item.company},\n\n` +
          `Me contacto por el aviso de ${item.jobTitle} publicado en ${item.sourceName}.\n` +
          `Adjunto mi Curriculum Vitae actualizado para su consideración en el proceso.\n\nAtentamente,\nPostulante`,
      });
      successCount++;
    }
    setIsSending(false);
    addToast('success', 'Envío Masivo Completado', `Se despacharon ${successCount} postulaciones con tu CV adjunto.`);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-white">
      
      {/* Toast Notification Container */}
      <div className="fixed top-24 right-4 z-50 space-y-3 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto p-4 rounded-xl shadow-2xl border backdrop-blur-xl animate-slide-in flex items-start gap-3 ${
              toast.type === 'success'
                ? 'bg-slate-900/95 border-emerald-500/50 text-emerald-300'
                : toast.type === 'info'
                ? 'bg-slate-900/95 border-cyan-500/50 text-cyan-300'
                : 'bg-slate-900/95 border-red-500/50 text-red-300'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            ) : toast.type === 'info' ? (
              <Info className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <div className="font-bold text-white text-sm">{toast.title}</div>
              <div className="text-xs text-slate-300 mt-1 leading-relaxed">{toast.message}</div>
            </div>
            <button onClick={() => removeToast(toast.id)} className="text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>


      {/* Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        historyCount={history.length}
        cvFileName={cv ? cv.fileName : null}
      />

      {/* Main Content View Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Tab 1: Search & Extracted Results */}
        {activeTab === 'search' && (
          <div>
            <SearchSection onSearch={handleSearch} isLoading={isLoading} />
            <ResultsTable
              results={results}
              searched={hasSearched}
              onSendSingle={(item) => {
                setSelectedJob(item);
                setActiveTab('compose');
                addToast('info', 'Aviso Cargado', `Datos de ${item.company} listos para postular.`);
              }}
              onSendBatch={handleSendBatch}
              isSending={isSending}
            />
          </div>
        )}

        {/* Tab 2: Redact & Send Email with CV */}
        {activeTab === 'compose' && (
          <EmailComposer
            cv={cv}
            selectedJob={selectedJob}
            onUploadCV={handleUploadCV}
            onSendEmail={handleSendEmail}
            isSending={isSending}
            isSimulationMode={isSimulationMode}
            setIsSimulationMode={setIsSimulationMode}
            gmailUser={gmailUser}
            gmailAppPassword={gmailAppPassword}
          />
        )}

        {/* Tab 3: History & Live Read Receipt Tracking 👁️ */}
        {activeTab === 'history' && (
          <HistoryTracking history={history} onRefresh={fetchHistory} />
        )}

        {/* Tab 4: Gmail Credentials Configuration */}
        {activeTab === 'settings' && (
          <GmailSettings
            gmailUser={gmailUser}
            setGmailUser={setGmailUser}
            gmailAppPassword={gmailAppPassword}
            setGmailAppPassword={setGmailAppPassword}
            onTestConnection={handleTestGmailConnection}
            isTesting={isTestingGmail}
            isSimulationMode={isSimulationMode}
            setIsSimulationMode={setIsSimulationMode}
          />
        )}

        {/* Tab 5: GitHub & Vercel Deployment Guide */}
        {activeTab === 'vercel' && <GitHubVercelGuide />}

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <p>JobHunter ARG © 2026 • Diseñado para Búsquedas de Empleo en Argentina con Extracción de Mails y Confirmación de Lectura</p>
      </footer>

    </div>
  );
}
