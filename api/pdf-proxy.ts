import https from 'https';
import http from 'http';
import { URL } from 'url';

// Cambridge Subject slugs for BestExamHelp
const SUBJECT_SLUG_MAP: Record<string, string> = {
  '0580': 'mathematics-0580',
  '0606': 'additional-mathematics-0606',
  '0625': 'physics-0625',
  '0620': 'chemistry-0620',
  '0610': 'biology-0610',
  '0510': 'english-second-language-0510',
  '0478': 'computer-science-0478',
  '0455': 'economics-0455',
  '0452': 'accounting-0452',
  '0470': 'history-0470',
  '0450': 'business-studies-0450'
};

// Cambridge Subject folders for GCE Guide
const GCE_FOLDER_MAP: Record<string, string> = {
  '0580': 'Mathematics (0580)',
  '0606': 'Additional Mathematics (0606)',
  '0625': 'Physics (0625)',
  '0620': 'Chemistry (0620)',
  '0610': 'Biology (0610)',
  '0510': 'English - Second Language (oral endorsement) (0510)',
  '0478': 'Computer Science (0478)',
  '0455': 'Economics (0455)',
  '0452': 'Accounting (0452)',
  '0470': 'History (0470)',
  '0450': 'Business Studies (0450)'
};

/**
 * Generate candidate mirror URLs for a given PDF filename or target URL.
 */
function buildCandidateUrls(targetUrl: string, fallbackUrl?: string, examCode?: string): string[] {
  const candidates: string[] = [];

  let filename = '';
  if (examCode) {
    const clean = examCode.trim().replace(/\.pdf$/i, '');
    filename = `${clean}.pdf`;
    candidates.push(`https://pastpapers.papacambridge.com/directories/CAIE/CAIE-pastpapers/upload/${filename}`);
  }

  if (targetUrl) {
    if (!candidates.includes(targetUrl)) candidates.push(targetUrl);
    try {
      const parsed = new URL(targetUrl);
      const name = parsed.pathname.split('/').pop()?.split('?')[0] || '';
      if (name && !filename) filename = name;
    } catch {
      // url parse error
    }
  }

  if (fallbackUrl && !candidates.includes(fallbackUrl)) {
    candidates.push(fallbackUrl);
  }

  if (filename) {
    const match = filename.match(/^([0-9]{4})_([smw])([0-9]{2})_([a-z]{2})(?:_([0-9]{1,2}))?\.pdf$/i);

    if (match) {
      const [, syllabus, , yy] = match;
      const fullYear = `20${yy}`;
      const slug = SUBJECT_SLUG_MAP[syllabus];
      const gceFolder = GCE_FOLDER_MAP[syllabus];

      // Mirror 1: PapaCambridge direct
      const pcUrl = `https://pastpapers.papacambridge.com/directories/CAIE/CAIE-pastpapers/upload/${filename}`;
      if (!candidates.includes(pcUrl)) candidates.push(pcUrl);

      // Mirror 2: GCE Guide mirror
      if (gceFolder) {
        const gceUrl = `https://papers.gceguide.cc/Cambridge%20IGCSE/${encodeURIComponent(gceFolder)}/${fullYear}/${filename}`;
        if (!candidates.includes(gceUrl)) candidates.push(gceUrl);
      }

      // Mirror 3: Dynamic Papers
      const dpUrl = `https://dynamicpapers.com/wp-content/uploads/papers/${syllabus}/${filename}`;
      if (!candidates.includes(dpUrl)) candidates.push(dpUrl);

      // Mirror 4: BestExamHelp
      if (slug) {
        const behUrl = `https://bestexamhelp.com/exam/cambridge-igcse/${slug}/${fullYear}/${filename}`;
        if (!candidates.includes(behUrl)) candidates.push(behUrl);
      }
    }
  }

  return candidates;
}

/**
 * Probe a single URL to check if it returns HTTP 200 and Content-Type: application/pdf
 */
function probePdfUrl(urlStr: string): Promise<{ ok: boolean; status: number; contentType?: string; redirectUrl?: string }> {
  return new Promise((resolve) => {
    try {
      const parsed = new URL(urlStr);
      const client = parsed.protocol === 'https:' ? https : http;

      const req = client.request(
        parsed,
        {
          method: 'GET',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            Accept: 'application/pdf, */*'
          }
        },
        (res) => {
          const status = res.statusCode || 0;
          const contentType = res.headers['content-type'] || '';
          const location = res.headers.location;

          // Reject HTML redirect responses (e.g. PapaCambridge homepage redirect on missing files)
          if ([301, 302, 303, 307, 308].includes(status)) {
            res.resume();
            return resolve({ ok: false, status, contentType, redirectUrl: location });
          }

          if (status === 200 && contentType.toLowerCase().includes('application/pdf')) {
            res.resume();
            return resolve({ ok: true, status, contentType });
          }

          res.resume();
          return resolve({ ok: false, status, contentType });
        }
      );

      req.on('error', () => {
        resolve({ ok: false, status: 500 });
      });

      req.setTimeout(8000, () => {
        req.destroy();
        resolve({ ok: false, status: 504 });
      });

      req.end();
    } catch {
      resolve({ ok: false, status: 400 });
    }
  });
}

/**
 * Stream PDF binary directly from the verified source URL to response.
 */
function pipePdfStream(urlStr: string, res: any, filename: string, asAttachment: boolean = false): Promise<boolean> {
  return new Promise((resolve) => {
    try {
      const parsed = new URL(urlStr);
      const client = parsed.protocol === 'https:' ? https : http;

      const req = client.get(
        parsed,
        {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            Accept: 'application/pdf, */*'
          }
        },
        (remoteRes) => {
          const status = remoteRes.statusCode || 0;
          const contentType = remoteRes.headers['content-type'] || '';

          if (status === 200 && contentType.toLowerCase().includes('application/pdf')) {
            const disposition = asAttachment ? 'attachment' : 'inline';
            res.writeHead(200, {
              'Content-Type': 'application/pdf',
              'Content-Disposition': `${disposition}; filename="${filename}"`,
              'Cache-Control': 'public, max-age=86400, s-maxage=604800',
              'Access-Control-Allow-Origin': '*',
              'X-Proxied-By': 'Simply-IGCSE-PDF-Proxy',
              'X-Resolved-Source': urlStr
            });
            remoteRes.pipe(res);
            remoteRes.on('end', () => resolve(true));
            remoteRes.on('error', () => resolve(false));
          } else {
            remoteRes.resume();
            resolve(false);
          }
        }
      );

      req.on('error', () => resolve(false));
      req.setTimeout(15000, () => {
        req.destroy();
        resolve(false);
      });
    } catch {
      resolve(false);
    }
  });
}

function generateRescueHtml(title: string, safeQuery: string, originalUrl: string, _attemptedUrls?: string[]): string {
  const pcamSearch = `https://pastpapers.papacambridge.com/?s=${encodeURIComponent(safeQuery)}`;
  const pmtSearch = `https://www.google.com/search?q=${encodeURIComponent('physics and maths tutor ' + safeQuery)}`;
  const behSearch = `https://bestexamhelp.com/`;
  const googleSearch = `https://www.google.com/search?q=${encodeURIComponent(safeQuery + ' past paper pdf')}`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Past Paper Mirror • ${title}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: #090d16;
      color: #e2e8f0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
    }
    .card {
      background: #0f172a;
      border: 1px solid #1e293b;
      border-radius: 1rem;
      max-width: 640px;
      width: 100%;
      padding: 2rem;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5);
    }
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 0.375rem;
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      background: rgba(14, 165, 233, 0.15);
      color: #38bdf8;
      font-size: 0.75rem;
      font-weight: 700;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      margin-bottom: 1rem;
      border: 1px solid rgba(56, 189, 248, 0.25);
    }
    h1 {
      font-size: 1.25rem;
      font-weight: 800;
      color: #ffffff;
      margin-bottom: 0.5rem;
      word-break: break-word;
    }
    p {
      color: #94a3b8;
      font-size: 0.875rem;
      line-height: 1.5;
      margin-bottom: 1.5rem;
    }
    .btn-group {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }
    .btn {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.75rem;
      padding: 0.75rem 1rem;
      border-radius: 0.75rem;
      font-size: 0.875rem;
      font-weight: 600;
      text-decoration: none;
      transition: all 0.2s ease;
      cursor: pointer;
    }
    .btn-primary {
      background: #0284c7;
      color: #ffffff;
      border: 1px solid #0369a1;
    }
    .btn-primary:hover {
      background: #0369a1;
    }
    .btn-secondary {
      background: #1e293b;
      color: #f1f5f9;
      border: 1px solid #334155;
    }
    .btn-secondary:hover {
      background: #334155;
      color: #ffffff;
    }
    .footer {
      margin-top: 1.5rem;
      padding-top: 1rem;
      border-top: 1px solid #1e293b;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.75rem;
      color: #64748b;
    }
    .btn-subtle {
      color: #38bdf8;
      text-decoration: none;
      font-weight: 600;
    }
    .btn-subtle:hover {
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="badge">Simply Mirror Rescue</div>
    <h1>${title}</h1>
    <p>The primary PDF stream archive is momentarily experiencing rate-limiting or origin protections. You can access this paper instantly across verified mirror repositories below:</p>

    <div class="btn-group">
      ${originalUrl ? `<a href="${originalUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-primary">
        <span>🔗 Open Direct Archive Source</span>
        <span>↗</span>
      </a>` : ''}
      <a href="${pcamSearch}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary">
        <span>📑 Search on PapaCambridge Archive</span>
        <span>↗</span>
      </a>
      <a href="${pmtSearch}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary">
        <span>📚 Search on Physics & Maths Tutor</span>
        <span>↗</span>
      </a>
      <a href="${behSearch}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary">
        <span>🎯 Search on BestExamHelp</span>
        <span>↗</span>
      </a>
      <a href="${googleSearch}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary">
        <span>🔍 Search Google for "${safeQuery}" PDF</span>
        <span>↗</span>
      </a>
    </div>

    <div class="footer">
      <span>Simply IGCSE Platform</span>
      <a href="javascript:window.history.back()" class="btn-subtle">← Go Back</a>
    </div>
  </div>
</body>
</html>`;
}

export default async function handler(req: any, res: any) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Range, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const rawUrl = (req.query?.url as string) || '';
  const rawFallback = (req.query?.fallback as string) || '';
  const examCode = (req.query?.code as string) || '';
  const checkOnly = req.query?.checkOnly === 'true' || req.method === 'HEAD';
  const asAttachment = req.query?.download === 'true';

  if (!rawUrl && !examCode) {
    return res.status(400).json({
      error: 'Missing required "url" or "code" parameter. Example: /api/pdf-proxy?code=0580_s24_qp_42 or ?url=https://...'
    });
  }

  // 1. Direct Pearson Edexcel & OxfordAQA Portal Redirect:
  // If the URL is an official Pearson or OxfordAQA exam materials portal search, immediately 302 redirect.
  if (rawUrl && (rawUrl.includes('qualifications.pearson.com') || rawUrl.includes('oxfordaqa.com'))) {
    res.writeHead(302, {
      Location: rawUrl,
      'Access-Control-Allow-Origin': '*'
    });
    return res.end();
  }

  const candidates = buildCandidateUrls(rawUrl.trim(), rawFallback.trim(), examCode.trim());
  let resolvedUrl: string | null = null;
  let resolvedContentType: string | null = null;

  for (const candidate of candidates) {
    const probe = await probePdfUrl(candidate);
    if (probe.ok) {
      resolvedUrl = candidate;
      resolvedContentType = probe.contentType || 'application/pdf';
      break;
    }
  }

  if (!resolvedUrl) {
    const acceptsHtml = (req.headers['accept'] || '').includes('text/html');
    if (acceptsHtml && !checkOnly) {
      const title = examCode || (rawUrl.split('/').pop()?.split('?')[0]) || 'Examination Document';
      const safeQuery = title.replace(/[\._\-]/g, ' ');
      const html = generateRescueHtml(title, safeQuery, rawUrl, candidates);
      res.writeHead(200, {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Access-Control-Allow-Origin': '*'
      });
      return res.end(html);
    }

    return res.status(404).json({
      error: 'PDF not found on official mirror archives (blocked HTML redirects / 404s)',
      attemptedUrls: candidates,
      requestedUrl: rawUrl || examCode
    });
  }

  // If client only requested validation / HEAD metadata
  if (checkOnly) {
    return res.status(200).json({
      ok: true,
      status: 200,
      contentType: resolvedContentType,
      resolvedUrl,
      originalUrl: rawUrl || examCode
    });
  }

  // Stream binary PDF directly
  const filename = resolvedUrl.split('/').pop()?.split('?')[0] || `${examCode || 'document'}.pdf`;
  const streamed = await pipePdfStream(resolvedUrl, res, filename, asAttachment);

  if (!streamed && !res.headersSent) {
    const acceptsHtml = (req.headers['accept'] || '').includes('text/html');
    if (acceptsHtml) {
      const title = examCode || (rawUrl.split('/').pop()?.split('?')[0]) || 'Examination Document';
      const safeQuery = title.replace(/[\._\-]/g, ' ');
      const html = generateRescueHtml(title, safeQuery, rawUrl, [resolvedUrl]);
      res.writeHead(200, {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Access-Control-Allow-Origin': '*'
      });
      return res.end(html);
    }

    return res.status(502).json({
      error: 'Failed to stream PDF stream from resolved mirror',
      resolvedUrl
    });
  }
}
