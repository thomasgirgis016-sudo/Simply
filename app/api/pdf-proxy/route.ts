// Edge / Next.js Route Handler: /app/api/pdf-proxy/route.ts
// Validates Content-Type: application/pdf, inspects redirects,
// falls back across PapaCambridge, BestExamHelp, and GCE Guide mirrors,
// and streams valid PDF binary directly to embedded iframes.

const SUBJECT_SLUG_MAP: Record<string, string> = {
  '0580': 'mathematics-0580',
  '0625': 'physics-0625',
  '0620': 'chemistry-0620',
  '0610': 'biology-0610',
  '0510': 'english-second-language-0510',
  '0478': 'computer-science-0478',
};

const GCE_FOLDER_MAP: Record<string, string> = {
  '0580': 'Mathematics (0580)',
  '0625': 'Physics (0625)',
  '0620': 'Chemistry (0620)',
  '0610': 'Biology (0610)',
  '0510': 'English - Second Language (oral endorsement) (0510)',
  '0478': 'Computer Science (0478)',
};

function buildCandidateUrls(targetUrl: string, fallbackUrl?: string | null): string[] {
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

      // Mirror 2: PapaCambridge direct
      const pcUrl = `https://pastpapers.papacambridge.com/directories/CAIE/CAIE-pastpapers/upload/${filename}`;
      if (!candidates.includes(pcUrl)) candidates.push(pcUrl);

      // Mirror 3: GCE Guide mirror
      if (gceFolder) {
        const gceUrl = `https://papers.gceguide.cc/Cambridge%20IGCSE/${encodeURIComponent(gceFolder)}/${fullYear}/${filename}`;
        if (!candidates.includes(gceUrl)) candidates.push(gceUrl);
      }
    }
  } catch {
    // Return base candidates if URL parsing throws
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
  const checkOnly = searchParams.get('checkOnly') === 'true';

  if (!targetUrl) {
    return new Response(JSON.stringify({ error: 'Missing required "url" parameter.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const candidates = buildCandidateUrls(targetUrl, fallbackUrl);
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
        error: 'PDF not found on primary or secondary mirror archives',
        attemptedUrls: candidates,
        requestedUrl: targetUrl
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
        originalUrl: targetUrl
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      }
    );
  }

  const filename = resolvedUrl.split('/').pop()?.split('?')[0] || 'document.pdf';

  return new Response(validResponse.body, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${filename}"`,
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

  if (!targetUrl) {
    return new Response(null, { status: 400 });
  }

  const candidates = buildCandidateUrls(targetUrl, fallbackUrl);
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
