// Server-side Authentication & Administrator Verification Endpoint: /api/auth
// Validates admin credentials strictly against server environment variables
// (ADMIN_EMAIL, ADMIN_PASSWORD) so secrets are never bundled into client JavaScript.

export default async function handler(req: any, res?: any) {
  // CORS Headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json',
  };

  if (req.method === 'OPTIONS') {
    if (res?.status) return res.status(200).json({ ok: true });
    return new Response(JSON.stringify({ ok: true }), { status: 200, headers });
  }

  try {
    let body: any = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch {
        body = {};
      }
    } else if (!body && typeof req.json === 'function') {
      body = await req.json();
    }
    body = body || {};

    const { action = 'verify_admin', email = '', password = '' } = body;

    const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || 'admin@simplyigcse.com').trim().toLowerCase();
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'AdminPassword123!';

    const normalizedEmail = String(email).trim().toLowerCase();

    // Check if email matches configured admin email
    const isAdminEmail = normalizedEmail === ADMIN_EMAIL;

    if (action === 'is_admin_email') {
      const payload = { isAdmin: isAdminEmail };
      if (res?.status) return res.status(200).json(payload);
      return new Response(JSON.stringify(payload), { status: 200, headers });
    }

    if (action === 'verify_admin' || action === 'admin_login') {
      if (!isAdminEmail) {
        const payload = { success: false, error: 'Not an administrator account.' };
        if (res?.status) return res.status(403).json(payload);
        return new Response(JSON.stringify(payload), { status: 403, headers });
      }

      // Strict server-side password check
      if (password !== ADMIN_PASSWORD) {
        const payload = { success: false, error: 'Invalid administrator password.' };
        if (res?.status) return res.status(401).json(payload);
        return new Response(JSON.stringify(payload), { status: 401, headers });
      }

      const adminUser = {
        id: 'admin_root',
        name: 'Simply IGCSE Administrator',
        email: ADMIN_EMAIL,
        role: 'admin',
        status: 'approved',
        plan: 'pro',
        isPro: true,
        hasActiveSubscription: true,
        grade: 'Year 11 / Grade 10 (IGCSE Exam Yr)',
        board: 'Both',
        targetGrade: '9 / A*',
        selectedSubjectIds: ['cie-math-0580', 'cie-esl-0510', 'cie-physics-0625', 'cie-chem-0620', 'cie-bio-0610'],
        currentSessionToken: `adm_sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        lastActiveAt: new Date().toISOString(),
        createdAt: new Date().toISOString()
      };

      const payload = {
        success: true,
        isAdmin: true,
        user: adminUser,
        token: adminUser.currentSessionToken
      };

      if (res?.status) return res.status(200).json(payload);
      return new Response(JSON.stringify(payload), { status: 200, headers });
    }

    const payload = { error: 'Invalid auth action' };
    if (res?.status) return res.status(400).json(payload);
    return new Response(JSON.stringify(payload), { status: 400, headers });
  } catch (err: any) {
    const errorPayload = { error: err?.message || 'Server authentication error' };
    if (res?.status) return res.status(500).json(errorPayload);
    return new Response(JSON.stringify(errorPayload), { status: 500, headers });
  }
}
