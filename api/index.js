import express from 'express';
import cors from 'cors';
import multer from 'multer';
import nodemailer from 'nodemailer';
import axios from 'axios';
import * as cheerio from 'cheerio';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// In-Memory Storage for uploaded CV file buffer
let globalCV = {
  fileName: 'Curriculum_Vitae_Postulante.pdf',
  fileBuffer: null,
  fileType: 'application/pdf',
  uploadedAt: new Date().toISOString(),
};

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
  }
];

const EMAIL_REGEX = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/gi;

const isRealEmail = (email) => {
  if (!email) return false;
  const clean = email.toLowerCase().trim();
  const invalidExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.pdf', '.css', '.js', '.ts', '.ico'];
  if (invalidExtensions.some((ext) => clean.endsWith(ext))) return false;
  const invalidDomains = [
    'example.com', 'w3.org', 'sentry.io', 'schema.org', 'domain.com',
    'email.com', 'github.com', 'google.com', 'microsoft.com', 'apple.com',
    'jquery.com', 'webpack.js', 'react.dev', 'vercel.app', 'netlify.app',
  ];
  if (invalidDomains.some((dom) => clean.includes(dom))) return false;
  return clean.includes('@') && clean.includes('.');
};

// ─────────────────────────────────────────────────────────────────────────────
// DEEP SCRAPER ENGINE
// Strategy: search each Argentine job portal → enter every listing URL →
//           extract email FROM THE BODY of the post → discard if no email found
// ─────────────────────────────────────────────────────────────────────────────
const deepScrapeArgentinaJobs = async (rawKeyword, location = 'Buenos Aires') => {
  const keywordClean = rawKeyword.trim().replace(/\s+/g, ' ');
  const extractedResults = [];
  const foundEmailsSet = new Set();

  const userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:125.0) Gecko/20100101 Firefox/125.0',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  ];
  const getUA = () => userAgents[Math.floor(Math.random() * userAgents.length)];

  // ── Helper: fetch a page safely ──────────────────────────────────────────
  const safeFetch = async (url, timeoutMs = 8000) => {
    try {
      const res = await axios.get(url, {
        headers: {
          'User-Agent': getUA(),
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'es-AR,es;q=0.9,en;q=0.7',
          'Accept-Encoding': 'gzip, deflate, br',
          'Connection': 'keep-alive',
          'Cache-Control': 'no-cache',
        },
        timeout: timeoutMs,
        maxRedirects: 5,
      });
      return res.data || null;
    } catch (e) {
      console.log(`[fetch error] ${url} → ${e.message}`);
      return null;
    }
  };

  // ── Helper: extract emails STRICTLY from the body of a job post ──────────
  // Strips nav/header/footer/scripts to avoid false positives.
  // Only returns emails found IN the job description area.
  const extractEmailsFromBody = (html) => {
    if (!html) return [];
    const $ = cheerio.load(html);

    // Remove noise: nav, footer, header, scripts
    $('nav, header, footer, script, style, noscript, aside, .sidebar, .menu, .navbar, .footer, .header, .navigation, .nav-bar, .topbar').remove();

    // Try portal-specific job description containers first
    const contentSelectors = [
      // Generic
      '.job-description', '.job-body', '.job-detail', '.job-content',
      '.vacancy-description', '.vacancy-body', 'article.job', 'main',
      '[class*="description"]', '[class*="descripcion"]', '[class*="detalle"]',
      // CompuTrabajo
      '.box_offer_detail', '.texto-aviso', '.ficha-aviso',
      // ZonaJobs
      '.aviso-descripcion', '.descripcion-oferta', '.detalle-aviso',
      // Bumeran
      '.postulation-detail', '.job-detail__body',
      // Generic fallback
      'article', '#content', '.content', '.post-content',
    ];

    let bodyText = '';
    for (const sel of contentSelectors) {
      const el = $(sel).first();
      if (el.length > 0) {
        const txt = el.text().trim();
        if (txt.length > 80) {
          bodyText = txt;
          break;
        }
      }
    }

    // Last resort: full body text
    if (bodyText.length < 80) {
      bodyText = $('body').text();
    }

    const matched = bodyText.match(EMAIL_REGEX) || [];
    return matched.filter(isRealEmail).map(e => e.toLowerCase().trim());
  };

  // ── Helper: dedup push result ────────────────────────────────────────────
  const pushResult = (email, jobTitle, company, sourceUrl, sourceName, pageHtml) => {
    const clean = email.toLowerCase().trim();
    if (foundEmailsSet.has(clean)) return;
    foundEmailsSet.add(clean);
    console.log(`  ✓ EMAIL ENCONTRADO: ${clean}  |  URL: ${sourceUrl}`);
    extractedResults.push({
      id: `job_${Date.now()}_${extractedResults.length}`,
      jobTitle: (jobTitle || `${keywordClean} - ${location}`).slice(0, 70),
      company: (company || clean.split('@')[1]?.split('.')[0]?.toUpperCase() + ' Argentina' || 'Empresa Argentina').slice(0, 60),
      location,
      email: clean,
      confidence: 'Email extraído del cuerpo del aviso',
      snippet: `Email real verificado en el cuerpo del aviso. Correo: ${clean}`,
      sourceName: sourceName || 'Portal Laboral Argentina',
      sourceUrl,
      foundAt: new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
    });
  };

  // ╔══════════════════════════════════════════════════════════════╗
  // ║  PORTAL 1: CompuTrabajo Argentina                          ║
  // ╚══════════════════════════════════════════════════════════════╝
  const scrapeCompuTrabajo = async () => {
    const slug = keywordClean.toLowerCase().replace(/\s+/g, '-');
    const urls = [
      `https://ar.computrabajo.com/trabajo-de-${encodeURIComponent(slug)}`,
      `https://ar.computrabajo.com/trabajo-de-${encodeURIComponent(keywordClean)}`,
    ];

    for (const searchUrl of urls) {
      console.log(`\n[CompuTrabajo] Buscando en: ${searchUrl}`);
      const listHtml = await safeFetch(searchUrl);
      if (!listHtml) continue;

      const $ = cheerio.load(listHtml);
      const postLinks = new Map();

      // Collect individual job post URLs
      $('a').each((_, el) => {
        let href = $(el).attr('href') || '';
        if (href.startsWith('/')) href = 'https://ar.computrabajo.com' + href;
        const title = $(el).text().trim();
        if (
          href.includes('computrabajo.com') &&
          (href.includes('/trabajo/') || href.includes('/oferta/') || href.match(/\/[a-z]+-[a-z]+-\d+/)) &&
          !postLinks.has(href)
        ) {
          postLinks.set(href, title || keywordClean);
        }
      });

      console.log(`[CompuTrabajo] ${postLinks.size} avisos individuales encontrados`);

      for (const [url, title] of [...postLinks.entries()].slice(0, 10)) {
        console.log(`  → Entrando al aviso: ${url}`);
        const pageHtml = await safeFetch(url, 7000);
        const emails = extractEmailsFromBody(pageHtml);

        if (emails.length === 0) {
          console.log(`  ✗ Sin email en cuerpo → DESCARTADO`);
          continue;
        }

        const $p = cheerio.load(pageHtml);
        const pageTitle = $p('h1').first().text().trim() || $p('title').text().trim() || title;
        const company = $p('[class*="company"], [class*="empresa"], [class*="Company"]').first().text().trim();

        for (const email of emails) {
          pushResult(email, pageTitle, company, url, 'CompuTrabajo Argentina');
        }
      }
      break; // stop if first URL worked
    }
  };

  // ╔══════════════════════════════════════════════════════════════╗
  // ║  PORTAL 2: ZonaJobs Argentina                              ║
  // ╚══════════════════════════════════════════════════════════════╝
  const scrapeZonaJobs = async () => {
    const slug = keywordClean.toLowerCase().replace(/\s+/g, '-');
    const searchUrl = `https://www.zonajobs.com.ar/empleos-de-${encodeURIComponent(slug)}.html`;
    console.log(`\n[ZonaJobs] Buscando en: ${searchUrl}`);

    const listHtml = await safeFetch(searchUrl);
    if (!listHtml) return;

    const $ = cheerio.load(listHtml);
    const postLinks = new Map();

    $('a').each((_, el) => {
      let href = $(el).attr('href') || '';
      if (href.startsWith('/')) href = 'https://www.zonajobs.com.ar' + href;
      if (
        href.includes('zonajobs.com.ar') &&
        (href.includes('/empleo/') || href.includes('/trabajo/') || href.includes('/aviso/')) &&
        !postLinks.has(href)
      ) {
        postLinks.set(href, $(el).text().trim() || keywordClean);
      }
    });

    console.log(`[ZonaJobs] ${postLinks.size} avisos individuales encontrados`);

    for (const [url, title] of [...postLinks.entries()].slice(0, 10)) {
      console.log(`  → Entrando al aviso: ${url}`);
      const pageHtml = await safeFetch(url, 7000);
      const emails = extractEmailsFromBody(pageHtml);

      if (emails.length === 0) {
        console.log(`  ✗ Sin email en cuerpo → DESCARTADO`);
        continue;
      }

      const $p = cheerio.load(pageHtml);
      const pageTitle = $p('h1').first().text().trim() || $p('title').text().trim() || title;
      const company = $p('[class*="company"], [class*="empresa"], .company-name').first().text().trim();

      for (const email of emails) {
        pushResult(email, pageTitle, company, url, 'ZonaJobs Argentina');
      }
    }
  };

  // ╔══════════════════════════════════════════════════════════════╗
  // ║  PORTAL 3: Bumeran / Multitrabajos                         ║
  // ╚══════════════════════════════════════════════════════════════╝
  const scrapeBumeran = async () => {
    const slug = keywordClean.toLowerCase().replace(/\s+/g, '-');
    const searchUrl = `https://www.bumeran.com.ar/empleos-${encodeURIComponent(slug)}.html`;
    console.log(`\n[Bumeran] Buscando en: ${searchUrl}`);

    const listHtml = await safeFetch(searchUrl);
    if (!listHtml) return;

    const $ = cheerio.load(listHtml);
    const postLinks = new Map();

    $('a').each((_, el) => {
      let href = $(el).attr('href') || '';
      if (href.startsWith('/')) href = 'https://www.bumeran.com.ar' + href;
      if (
        href.includes('bumeran.com.ar') &&
        href.length > 45 &&
        !href.includes('#') &&
        !postLinks.has(href)
      ) {
        postLinks.set(href, $(el).text().trim() || keywordClean);
      }
    });

    console.log(`[Bumeran] ${postLinks.size} avisos individuales encontrados`);

    for (const [url, title] of [...postLinks.entries()].slice(0, 10)) {
      console.log(`  → Entrando al aviso: ${url}`);
      const pageHtml = await safeFetch(url, 7000);
      const emails = extractEmailsFromBody(pageHtml);

      if (emails.length === 0) {
        console.log(`  ✗ Sin email en cuerpo → DESCARTADO`);
        continue;
      }

      const $p = cheerio.load(pageHtml);
      const pageTitle = $p('h1').first().text().trim() || $p('title').text().trim() || title;
      const company = $p('[class*="company"], [class*="empresa"], h2.company').first().text().trim();

      for (const email of emails) {
        pushResult(email, pageTitle, company, url, 'Bumeran Argentina');
      }
    }
  };

  // ╔══════════════════════════════════════════════════════════════╗
  // ║  PORTAL 4: DuckDuckGo → filtra portales .com.ar con email  ║
  // ║  Busca avisos reales que mencionen emails en su contenido   ║
  // ╚══════════════════════════════════════════════════════════════╝
  const scrapeViaDDG = async () => {
    // Search for job pages on .com.ar portals that contain emails in the content
    const queries = [
      `"${keywordClean}" empleo "rrhh@" OR "empleos@" OR "busquedas@" OR "postulaciones@" site:.com.ar`,
      `"${keywordClean}" trabajo argentina "@gmail.com" OR "@hotmail.com" "enviar cv" site:.com.ar`,
    ];

    for (const query of queries) {
      const searchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}&kl=ar-es`;
      console.log(`\n[DDG] Buscando: ${query}`);

      const listHtml = await safeFetch(searchUrl, 10000);
      if (!listHtml) continue;

      const $ = cheerio.load(listHtml);
      const postLinks = new Map();

      $('.result').each((_, el) => {
        const title = $(el).find('.result__title').text().trim();
        const snippet = $(el).find('.result__snippet').text().trim();
        let href = $(el).find('a.result__url, .result__title a').attr('href') || '';

        // Decode DuckDuckGo redirect URL
        if (href.includes('uddg=')) {
          const m = href.match(/uddg=([^&]+)/);
          if (m) href = decodeURIComponent(m[1]);
        }
        if (!href.startsWith('http') || href.includes('duckduckgo.com')) return;

        // Only keep Argentine job portals
        const isArPortal =
          href.includes('.com.ar') ||
          href.includes('computrabajo.com') ||
          href.includes('zonajobs') ||
          href.includes('bumeran.com') ||
          href.includes('trabajando.com');

        if (isArPortal && !postLinks.has(href)) {
          postLinks.set(href, { title, snippet });
        }
      });

      console.log(`[DDG] ${postLinks.size} URLs de portales argentinos encontradas`);

      for (const [url, meta] of [...postLinks.entries()].slice(0, 10)) {
        console.log(`  → Entrando al aviso: ${url}`);
        const pageHtml = await safeFetch(url, 7000);

        // STRICT: only accept emails found in the BODY of the page
        // Never use snippet emails as proof — they could be from unrelated content
        const emails = extractEmailsFromBody(pageHtml);

        if (emails.length === 0) {
          console.log(`  ✗ Sin email en cuerpo → DESCARTADO`);
          continue;
        }

        const portalName = url.includes('computrabajo') ? 'CompuTrabajo AR'
          : url.includes('zonajobs') ? 'ZonaJobs AR'
          : url.includes('bumeran') ? 'Bumeran AR'
          : url.includes('trabajando') ? 'Trabajando.com AR'
          : 'Portal Laboral Argentina';

        const $p = pageHtml ? cheerio.load(pageHtml) : null;
        const pageTitle = $p ? ($p('h1').first().text().trim() || $p('title').text().trim() || meta.title) : meta.title;
        const company = $p ? $p('[class*="company"], [class*="empresa"]').first().text().trim() : '';

        for (const email of emails) {
          pushResult(email, pageTitle, company, url, portalName);
        }
      }

      if (extractedResults.length > 0) break; // stop if we got results
    }
  };

  // ─────────────────────────────────────────────────────────────
  // Run all scrapers in PARALLEL for maximum speed
  // ─────────────────────────────────────────────────────────────
  console.log(`\n====== INICIANDO BÚSQUEDA DEEP-SCRAPE ======`);
  console.log(`Palabra clave: "${keywordClean}" | Ubicación: ${location}`);
  console.log(`Portales: CompuTrabajo, ZonaJobs, Bumeran, DDG+.com.ar`);
  console.log(`Modo: Entrar a CADA aviso y buscar email en el cuerpo`);
  console.log(`Avisos sin email en el cuerpo: DESCARTADOS`);
  console.log(`===========================================\n`);

  await Promise.allSettled([
    scrapeCompuTrabajo(),
    scrapeZonaJobs(),
    scrapeBumeran(),
    scrapeViaDDG(),
  ]);

  console.log(`\n====== BÚSQUEDA FINALIZADA ======`);
  console.log(`Total de avisos con email verificado en cuerpo: ${extractedResults.length}`);
  console.log(`=================================\n`);

  // NO FAKE FALLBACK: if no real emails found, return empty array
  // The frontend will show a "no results" message
  return extractedResults;
};

// Search API Handler
const handleSearchRequest = async (req, res) => {
  try {
    const { keyword = 'Desarrollador', location = 'Buenos Aires' } = req.body || {};
    if (!keyword || !keyword.trim()) {
      return res.status(400).json({ error: 'Debes ingresar una palabra clave de búsqueda.' });
    }

    const results = await deepScrapeArgentinaJobs(keyword, location);

    return res.json({
      success: true,
      keyword: keyword.trim(),
      totalFound: results.length,
      results,
    });
  } catch (error) {
    console.error('Error en búsqueda:', error);
    return res.status(500).json({ error: 'Ocurrió un error al procesar las búsquedas.' });
  }
};

app.post(['/api/search', '/search'], handleSearchRequest);

// CV Upload Endpoint with Buffer Storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB max
});

app.post(['/api/upload-cv', '/upload-cv'], upload.single('cvFile'), (req, res) => {
  try {
    if (req.file) {
      globalCV = {
        fileName: req.file.originalname,
        fileBuffer: req.file.buffer,
        fileType: req.file.mimetype || 'application/pdf',
        size: `${(req.file.size / 1024).toFixed(1)} KB`,
        uploadedAt: new Date().toISOString(),
      };
    }
    return res.json({
      success: true,
      cv: {
        fileName: globalCV.fileName,
        size: globalCV.size,
        uploadedAt: globalCV.uploadedAt,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al cargar el archivo del CV.' });
  }
});

// Get Current CV Info
app.get(['/api/cv', '/cv'], (req, res) => {
  res.json({
    success: true,
    cv: {
      fileName: globalCV.fileName,
      size: globalCV.size || 'Cargado',
      uploadedAt: globalCV.uploadedAt,
    },
  });
});

// Test Gmail SMTP Credentials Endpoint
app.post(['/api/test-gmail', '/test-gmail'], async (req, res) => {
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
});

// Send Email Endpoint WITH GUARANTEED MIME ATTACHMENT (multipart/form-data)
app.post(['/api/send-email', '/send-email'], upload.single('cvFile'), async (req, res) => {
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
      isSimulationMode: isSimRaw = 'true',
      appHostUrl = 'https://job-hunter-argentina.vercel.app',
    } = req.body || {};

    // isSimulationMode arrives as a string from FormData
    const isSimulationMode = isSimRaw === 'true' || isSimRaw === true;

    if (!toEmail || !subject || !bodyText) {
      return res.status(400).json({ error: 'Faltan datos requeridos para el envío.' });
    }

    const trackingId = `tr_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const trackingPixelUrl = `${appHostUrl}/api/track/read/${trackingId}`;

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; font-size: 15px; color: #222; line-height: 1.6;">
        ${bodyText.replace(/\n/g, '<br/>')}
        <img src="${trackingPixelUrl}" width="1" height="1" style="display:none; width:1px; height:1px;" alt="" />
      </div>
    `;

    // Build attachments array from the uploaded file (multer parses it as req.file)
    const attachments = [];

    if (req.file && req.file.buffer && req.file.buffer.length > 0) {
      // File was uploaded via multipart - use the real binary buffer
      console.log(`CV adjunto recibido: ${req.file.originalname} (${req.file.size} bytes)`);
      attachments.push({
        filename: req.file.originalname,
        content: req.file.buffer,
        contentType: req.file.mimetype || 'application/pdf',
      });
    } else if (globalCV.fileBuffer && globalCV.fileName) {
      // Fallback: use the globally stored CV buffer from /upload-cv
      console.log(`Usando CV global: ${globalCV.fileName}`);
      attachments.push({
        filename: globalCV.fileName,
        content: globalCV.fileBuffer,
        contentType: globalCV.fileType || 'application/pdf',
      });
    } else {
      console.log('No se encontró CV adjunto - enviando sin adjunto');
    }

    if (!isSimulationMode) {
      if (!gmailUser || !gmailAppPassword) {
        return res.status(400).json({ error: 'Para el envío real debes configurar tu dirección de Gmail y Contraseña de Aplicación.' });
      }

      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user: gmailUser, pass: gmailAppPassword },
      });

      const mailOptions = {
        from: `"Postulante" <${gmailUser}>`,
        to: toEmail,
        subject: subject,
        html: htmlContent,
      };

      if (attachments.length > 0) {
        mailOptions.attachments = attachments;
      }

      const info = await transporter.sendMail(mailOptions);
      console.log('Email enviado:', info.messageId, '| Adjuntos:', attachments.length);
    }

    const attachedName = req.file ? req.file.originalname : (globalCV.fileName || null);

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
      cvAttached: attachedName || 'Ninguno',
      isSimulation: isSimulationMode,
    };

    globalHistory.unshift(historyItem);

    return res.json({
      success: true,
      message: isSimulationMode
        ? '¡Postulación simulada con éxito!'
        : `¡Correo enviado exitosamente vía Gmail${attachedName ? ' con tu CV adjunto!' : '!'}`,
      item: historyItem,
    });
  } catch (error) {
    console.error('Error al enviar correo:', error);
    return res.status(500).json({ error: `Falló el envío: ${error.message}` });
  }
});

// Read Receipt Tracking Pixel Endpoint
app.get(['/api/track/read/:id', '/track/read/:id'], (req, res) => {
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
});

// Get Application History
app.get(['/api/history', '/history'], (req, res) => {
  res.json({ success: true, history: globalHistory });
});

// Default Root API Status
app.get(['/api', '/'], (req, res) => {
  res.json({ status: 'ok', name: 'JobHunter ARG Deep Scraper — Email Verificado en Cuerpo' });
});

const PORT = process.env.PORT || 5001;
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🚀 Servidor activo en http://localhost:${PORT}`);
  });
}

export default app;
