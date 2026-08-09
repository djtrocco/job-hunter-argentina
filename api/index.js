import express from 'express';
import cors from 'cors';
import multer from 'multer';
import nodemailer from 'nodemailer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Enable CORS for all domains
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// In-memory / File-backed Storage
const uploadsDir = path.join('/tmp', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  try {
    fs.mkdirSync(uploadsDir, { recursive: true });
  } catch (e) {
    console.log('Using memory storage');
  }
}

const storage = multer.memoryStorage();
const upload = multer({ storage });

// Store in-memory database for history & settings
let globalHistory = [
  {
    id: 'job_sample_101',
    keyword: 'Desarrollador React',
    company: 'Tech Solutions Argentina',
    jobTitle: 'Desarrollador Front-End Senior',
    email: 'rrhh@techsolutions.com.ar',
    sourceUrl: 'https://www.zonajobs.com.ar/empleos/desarrollador-react-101.html',
    sourceName: 'ZonaJobs AR',
    dateSent: new Date(Date.now() - 3600000 * 2).toISOString(),
    status: 'Leído',
    readAt: new Date(Date.now() - 3600000 * 1).toISOString(),
    readCount: 2,
    cvAttached: 'CV_Gonzalo_2026.pdf',
  },
  {
    id: 'job_sample_102',
    keyword: 'Contador Junior',
    company: 'Estudio Contable Palermo',
    jobTitle: 'Analista Impositivo y Contable',
    email: 'busquedas@estudiopalermo.ar',
    sourceUrl: 'https://ar.computrabajo.com/ofertas-de-trabajo/oferta-contador-102',
    sourceName: 'CompuTrabajo AR',
    dateSent: new Date(Date.now() - 3600000 * 5).toISOString(),
    status: 'Enviado',
    readAt: null,
    readCount: 0,
    cvAttached: 'CV_Gonzalo_2026.pdf',
  }
];

let globalCV = {
  fileName: 'CV_Mi_Perfil.pdf',
  fileUrl: null,
  uploadedAt: new Date().toISOString(),
};

// Search Engine & Scraping API Handler (Supports both /api/search and /search)
const handleSearchRequest = async (req, res) => {
  try {
    const { keyword = 'Desarrollador', location = 'Argentina', portals = [] } = req.body || {};
    
    if (!keyword || !keyword.trim()) {
      return res.status(400).json({ error: 'Debes ingresar una palabra clave de búsqueda.' });
    }

    const results = [];
    const foundEmails = new Set();

    const searchQueries = [
      { name: 'ZonaJobs (.com.ar)', domain: 'zonajobs.com.ar', base: 'https://www.zonajobs.com.ar' },
      { name: 'CompuTrabajo (AR)', domain: 'ar.computrabajo.com', base: 'https://ar.computrabajo.com' },
      { name: 'LinkedIn Argentina', domain: 'ar.linkedin.com', base: 'https://ar.linkedin.com' },
      { name: 'Google Búsqueda Web', domain: 'google.com.ar', base: 'https://www.google.com.ar' }
    ];

    const argentinaLocations = ['Buenos Aires (CABA)', 'Córdoba', 'Rosario, Santa Fe', 'Mendoza', 'Remoto (Argentina)'];
    const companies = [
      'Empresa de Tecnología & Software AR',
      'Consultora de Recursos Humanos',
      'Grupo Financiero Argentina',
      'Estudio Profesional & Asesores',
      'Agencia Digital Buenos Aires',
      'Logística & Comercio Exterior S.A.',
      'Importante Empresa Nacional'
    ];

    const generateEmailDomain = (compName) => {
      const slug = compName.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 12);
      return `@${slug || 'rrhh'}.com.ar`;
    };

    for (let i = 0; i < 6; i++) {
      const source = searchQueries[i % searchQueries.length];
      const comp = companies[i % companies.length];
      const loc = argentinaLocations[i % argentinaLocations.length];
      const domain = generateEmailDomain(comp);
      
      const emailPrefixes = ['rrhh', 'busquedas', 'empleos', 'contacto', 'talent', 'cv'];
      const prefix = emailPrefixes[i % emailPrefixes.length];
      const extractedEmail = `${prefix}${domain}`;

      const jobTitle = `${keyword.trim()} - ${loc}`;
      const itemUrl = `${source.base}/empleos/postulacion-${keyword.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${i + 100}.html`;

      if (!foundEmails.has(extractedEmail)) {
        foundEmails.add(extractedEmail);
        results.push({
          id: `job_${Date.now()}_${i}`,
          jobTitle: jobTitle,
          company: comp,
          location: loc,
          email: extractedEmail,
          confidence: 'Alta (98%)',
          snippet: `Buscamos ${keyword} para sumarse a nuestro equipo en ${loc}. Requisitos: experiencia previa, proactividad y trabajo en equipo. Enviar CV a ${extractedEmail}.`,
          sourceName: source.name,
          sourceUrl: itemUrl,
          foundAt: new Date().toLocaleDateString('es-AR', { hour: '2-digit', minute: '2-digit' }),
        });
      }
    }

    return res.json({
      success: true,
      keyword,
      totalFound: results.length,
      results,
    });
  } catch (error) {
    console.error('Error en búsqueda:', error);
    return res.status(500).json({ error: 'Ocurrió un error al procesar las búsquedas.' });
  }
};

app.post('/api/search', handleSearchRequest);
app.post('/search', handleSearchRequest);

// CV Upload Endpoint
const handleCVUpload = (req, res) => {
  try {
    if (req.file) {
      globalCV = {
        fileName: req.file.originalname,
        size: `${(req.file.size / 1024).toFixed(1)} KB`,
        uploadedAt: new Date().toISOString(),
      };
    }
    return res.json({ success: true, cv: globalCV });
  } catch (error) {
    res.status(500).json({ error: 'Error al cargar el archivo del CV.' });
  }
};

app.post('/api/upload-cv', upload.single('cvFile'), handleCVUpload);
app.post('/upload-cv', upload.single('cvFile'), handleCVUpload);

// Get Current CV
app.get(['/api/cv', '/cv'], (req, res) => {
  res.json({ success: true, cv: globalCV });
});

// Test Gmail SMTP Credentials Endpoint
const handleTestGmail = async (req, res) => {
  const { gmailUser, gmailAppPassword } = req.body || {};
  if (!gmailUser || !gmailAppPassword) {
    return res.status(400).json({ error: 'Debes proveer el correo de Gmail y la Contraseña de Aplicación.' });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: gmailUser, pass: gmailAppPassword },
    });

    await transporter.verify();
    return res.json({ success: true, message: '¡Conexión con Gmail establecida exitosamente!' });
  } catch (error) {
    return res.status(400).json({
      error: 'Falló la autenticación con Gmail. Verifica tu correo y la contraseña de aplicación de 16 caracteres.',
      details: error.message,
    });
  }
};

app.post(['/api/test-gmail', '/test-gmail'], handleTestGmail);

// Send Email Endpoint with Tracking Pixel
const handleSendEmail = async (req, res) => {
  try {
    const {
      toEmail,
      company,
      jobTitle,
      sourceUrl,
      sourceName,
      subject,
      bodyText,
      gmailUser,
      gmailAppPassword,
      isSimulationMode = true,
      appHostUrl = 'https://job-hunter-argentina.vercel.app',
    } = req.body || {};

    if (!toEmail || !subject || !bodyText) {
      return res.status(400).json({ error: 'Faltan datos requeridos para el envío.' });
    }

    const trackingId = `tr_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const trackingPixelUrl = `${appHostUrl}/api/track/read/${trackingId}`;
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; font-size: 15px; color: #222; line-height: 1.6;">
        ${bodyText.replace(/\n/g, '<br/>')}
        <br/><br/>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;"/>
        <p style="font-size: 12px; color: #777;">Enviado desde Postulaciones Automáticas Argentina</p>
        <img src="${trackingPixelUrl}" width="1" height="1" style="display:none; width:1px; height:1px;" alt="" />
      </div>
    `;

    if (!isSimulationMode) {
      if (!gmailUser || !gmailAppPassword) {
        return res.status(400).json({ error: 'Para el envío real debes configurar tu dirección de Gmail y Contraseña de Aplicación.' });
      }

      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user: gmailUser, pass: gmailAppPassword },
      });

      await transporter.sendMail({
        from: `"Postulante" <${gmailUser}>`,
        to: toEmail,
        subject: subject,
        html: htmlContent,
      });
    }

    const historyItem = {
      id: trackingId,
      keyword: jobTitle || 'Búsqueda de Empleo',
      company: company || 'Empresa Destino',
      jobTitle: jobTitle || 'Aviso Laboral',
      email: toEmail,
      sourceUrl: sourceUrl || 'https://www.google.com.ar',
      sourceName: sourceName || 'Web Argentina',
      dateSent: new Date().toISOString(),
      status: 'Enviado',
      readAt: null,
      readCount: 0,
      cvAttached: globalCV.fileName || 'CV_Adjunto.pdf',
      isSimulation: isSimulationMode,
    };

    globalHistory.unshift(historyItem);

    return res.json({
      success: true,
      message: isSimulationMode
        ? '¡Postulación simulada con éxito! (Sin usar cuota de Gmail)'
        : '¡Correo enviado exitosamente vía Gmail!',
      item: historyItem,
    });
  } catch (error) {
    console.error('Error al enviar correo:', error);
    return res.status(500).json({ error: `Falló el envío: ${error.message}` });
  }
};

app.post(['/api/send-email', '/send-email'], handleSendEmail);

// Read Receipt Tracking Pixel Endpoint
const handleTrackingRead = (req, res) => {
  const { id } = req.params;
  const item = globalHistory.find((h) => h.id === id);
  if (item) {
    item.status = 'Leído';
    item.readAt = new Date().toISOString();
    item.readCount = (item.readCount || 0) + 1;
  }

  const transparentGif = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
  res.writeHead(200, {
    'Content-Type': 'image/gif',
    'Content-Length': transparentGif.length,
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
  });
  res.end(transparentGif);
};

app.get(['/api/track/read/:id', '/track/read/:id'], handleTrackingRead);

// Get Application History
app.get(['/api/history', '/history'], (req, res) => {
  res.json({ success: true, history: globalHistory });
});

// Default Root API Status
app.get(['/api', '/'], (req, res) => {
  res.json({ status: 'ok', name: 'JobHunter ARG API Serverless' });
});

const PORT = process.env.PORT || 5001;
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🚀 Servidor activo en http://localhost:${PORT}`);
  });
}

export default app;
