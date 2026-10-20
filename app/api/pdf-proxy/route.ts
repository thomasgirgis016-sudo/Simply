// Edge / Next.js Route Handler: /app/api/pdf-proxy/route.ts
// Validates Content-Type: application/pdf, inspects redirects,
// falls back across PapaCambridge, GCE Guide, Dynamic Papers, and BestExamHelp mirrors,
// and streams valid PDF binary directly to embedded iframes or download responses.

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

function buildCandidateUrls(targetUrl?: string | null, fallbackUrl?: string | null, examCode?: string | null): string[] {
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

async function probeCandidate(url: string): Promise<{ ok: boolean; response?: Response }> {
  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'application/pdf, */*'
      },
      redirect: 'manual'
    });

    const contentType = res.headers.get('content-type') || '';
    if (res.status === 200 && contentType.toLowerCase().includes('application/pdf')) {
      return { ok: true, response: res };
    }

    return { ok: false };
  } catch {
    return { ok: false };
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const targetUrl = searchParams.get('url');
  const fallbackUrl = searchParams.get('fallback');
  const examCode = searchParams.get('code');
  const checkOnly = searchParams.get('checkOnly') === 'true';
  const asAttachment = searchParams.get('download') === 'true';

  if (!targetUrl && !examCode) {
    return new Response(JSON.stringify({ error: 'Missing required "url" or "code" parameter.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const candidates = buildCandidateUrls(targetUrl, fallbackUrl, examCode);
  let resolvedUrl: string | null = null;
  let validResponse: Response | null = null;

  for (const candidate of candidates) {
    const probe = await probeCandidate(candidate);
    if (probe.ok && probe.response) {
      resolvedUrl = candidate;
      validResponse = probe.response;
      break;
    }
  }

  if (!resolvedUrl || !validResponse) {
    return new Response(
      JSON.stringify({
        error: 'PDF not found on official mirror archives (blocked HTML redirects / 404s)',
        attemptedUrls: candidates,
        requestedUrl: targetUrl || examCode
      }),
      {
        status: 404,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      }
    );
  }

  if (checkOnly) {
    return new Response(
      JSON.stringify({
        ok: true,
        status: 200,
        contentType: validResponse.headers.get('content-type'),
        resolvedUrl,
        originalUrl: targetUrl || examCode
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      }
    );
  }

  const filename = resolvedUrl.split('/').pop()?.split('?')[0] || `${examCode || 'document'}.pdf`;
  const disposition = asAttachment ? 'attachment' : 'inline';

  return new Response(validResponse.body, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `${disposition}; filename="${filename}"`,
      'Cache-Control': 'public, max-age=86400, s-maxage=604800',
      'Access-Control-Allow-Origin': '*',
      'X-Proxied-By': 'Simply-IGCSE-PDF-Proxy',
      'X-Resolved-Source': resolvedUrl
    }
  });
}

export async function HEAD(request: Request) {
  const { searchParams } = new URL(request.url);
  const targetUrl = searchParams.get('url');
  const fallbackUrl = searchParams.get('fallback');
  const examCode = searchParams.get('code');

  if (!targetUrl && !examCode) {
    return new Response(null, { status: 400 });
  }

  const candidates = buildCandidateUrls(targetUrl, fallbackUrl, examCode);
  for (const candidate of candidates) {
    const probe = await probeCandidate(candidate);
    if (probe.ok) {
      return new Response(null, {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
  }

  return new Response(null, { status: 404 });
}

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Range, Authorization'
    }
  });
}
