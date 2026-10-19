import https from 'https';
import http from 'http';
import { URL } from 'url';

// Cambridge Subject slugs for BestExamHelp
const SUBJECT_SLUG_MAP: Record<string, string> = {
  '0580': 'mathematics-0580',
  '0625': 'physics-0625',
  '0620': 'chemistry-0620',
  '0610': 'biology-0610',
  '0510': 'english-second-language-0510',
  '0478': 'computer-science-0478',
};

// Cambridge Subject folders for GCE Guide
const GCE_FOLDER_MAP: Record<string, string> = {
  '0580': 'Mathematics (0580)',
  '0625': 'Physics (0625)',
  '0620': 'Chemistry (0620)',
  '0610': 'Biology (0610)',
  '0510': 'English - Second Language (oral endorsement) (0510)',
  '0478': 'Computer Science (0478)',
};

/**
 * Generate candidate mirror URLs for a given PDF filename or target URL.
 */
function buildCandidateUrls(targetUrl: string, fallbackUrl?: string): string[] {
  const candidates: string[] = [];
  if (targetUrl) candidates.push(targetUrl);
  if (fallbackUrl) candidates.push(fallbackUrl);

  try {
    const parsed = new URL(targetUrl);
    const filename = parsed.pathname.split('/').pop()?.split('?')[0] || '';
    const match = filename.match(/^([0-9]{4})_([smw])([0-9]{2})_([a-z]{2})(?:_([0-9]{1,2}))?\.pdf$/i);

    if (match) {
      const [, syllabus, , yy] = match;
      const fullYear = `20${yy}`;
      const slug = SUBJECT_SLUG_MAP[syllabus];
      const gceFolder = GCE_FOLDER_MAP[syllabus];

      // Mirror 1: BestExamHelp
      if (slug) {
        const behUrl = `https://bestexamhelp.com/exam/cambridge-igcse/${slug}/${fullYear}/${filename}`;
        if (!candidates.includes(behUrl)) candidates.push(behUrl);
      }

      // Mirror 2: PapaCambridge upload direct
      const pcUrl = `https://pastpapers.papacambridge.com/directories/CAIE/CAIE-pastpapers/upload/${filename}`;
      if (!candidates.includes(pcUrl)) candidates.push(pcUrl);

      // Mirror 3: GCE Guide mirror
      if (gceFolder) {
        const gceUrl = `https://papers.gceguide.cc/Cambridge%20IGCSE/${encodeURIComponent(gceFolder)}/${fullYear}/${filename}`;
        if (!candidates.includes(gceUrl)) candidates.push(gceUrl);
      }
    }
  } catch {
    // If URL parsing fails, stick with initial target and fallback
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
function pipePdfStream(urlStr: string, res: any, filename: string): Promise<boolean> {
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
            res.writeHead(200, {
              'Content-Type': 'application/pdf',
              'Content-Disposition': `inline; filename="${filename}"`,
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
  const checkOnly = req.query?.checkOnly === 'true' || req.method === 'HEAD';

  if (!rawUrl || rawUrl.trim() === '') {
    return res.status(400).json({
      error: 'Missing required "url" parameter. Example: /api/pdf-proxy?url=https://example.com/paper.pdf'
    });
  }

  const candidates = buildCandidateUrls(rawUrl.trim(), rawFallback.trim());
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
    return res.status(404).json({
      error: 'PDF not found on primary or secondary mirror archives',
      attemptedUrls: candidates,
      requestedUrl: rawUrl
    });
  }

  // If client only requested validation / HEAD metadata
  if (checkOnly) {
    return res.status(200).json({
      ok: true,
      status: 200,
      contentType: resolvedContentType,
      resolvedUrl,
      originalUrl: rawUrl
    });
  }

  // Stream binary PDF
  const filename = resolvedUrl.split('/').pop()?.split('?')[0] || 'document.pdf';
  const streamed = await pipePdfStream(resolvedUrl, res, filename);

  if (!streamed && !res.headersSent) {
    return res.status(502).json({
      error: 'Failed to stream PDF stream from resolved mirror',
      resolvedUrl
    });
  }
}
