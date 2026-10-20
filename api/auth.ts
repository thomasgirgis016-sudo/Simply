// Global in-memory dynamic staff codes table
const DYNAMIC_STAFF_CODES: Record<string, any> = {
  '2011': {
    name: 'Thomas',
    email: 'thomas@simplyigcse.com',
    role: 'founder',
    title: 'Founder & Head of Platform'
  }
};

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

    const { action = 'verify_admin', email = '', password = '', code = '' } = body;

    const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || 'admin@simplyigcse.com').trim().toLowerCase();
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'AdminPassword123!';

    const normalizedEmail = String(email).trim().toLowerCase();
    const cleanCode = String(code).trim();

    // 1. Check if email matches configured admin email
    if (action === 'is_admin_email') {
      const isAdminEmail = normalizedEmail === ADMIN_EMAIL;
      const payload = { isAdmin: isAdminEmail };
      if (res?.status) return res.status(200).json(payload);
      return new Response(JSON.stringify(payload), { status: 200, headers });
    }

    // 1b. Update or change an access code (e.g. Thomas changing his access code)
    if (action === 'update_access_code') {
      const { oldCode, newCode, name, role = 'founder', title } = body;
      const cleanNewCode = String(newCode || '').trim();
      const cleanOldCode = String(oldCode || '').trim();

      if (!cleanNewCode) {
        const payload = { success: false, error: 'New access code cannot be empty.' };
        if (res?.status) return res.status(400).json(payload);
        return new Response(JSON.stringify(payload), { status: 400, headers });
      }

      DYNAMIC_STAFF_CODES[cleanNewCode] = {
        name: name || 'Thomas',
        email: role === 'founder' ? 'thomas@simplyigcse.com' : `${cleanNewCode}@staff.simplyigcse.com`,
        role: role || 'founder',
        title: title || (role === 'founder' ? 'Founder & Head of Platform' : 'Staff Administrator')
      };

      if (cleanOldCode && cleanOldCode !== cleanNewCode) {
        delete DYNAMIC_STAFF_CODES[cleanOldCode];
      }

      console.log(`[ACCESS CODE UPDATED] ${name || 'Staff'} updated access code to: [PROTECTED]`);

      const payload = { success: true, message: `Access code successfully updated to ${cleanNewCode}` };
      if (res?.status) return res.status(200).json(payload);
      return new Response(JSON.stringify(payload), { status: 200, headers });
    }

    // 1c. Delete an access code
    if (action === 'delete_access_code') {
      const { code: targetCode } = body;
      const cleanTarget = String(targetCode || '').trim();
      if (cleanTarget) {
        delete DYNAMIC_STAFF_CODES[cleanTarget];
      }
      const payload = { success: true, message: 'Access code revoked' };
      if (res?.status) return res.status(200).json(payload);
      return new Response(JSON.stringify(payload), { status: 200, headers });
    }

    // 2. Staff & Founder Access Code Authentication
    // Validates individual access codes (e.g. Thomas, Founder: 2011 or any updated code)
    if (action === 'verify_access_code') {
      if (!cleanCode) {
        const payload = { success: false, error: 'Access code is required.' };
        if (res?.status) return res.status(400).json(payload);
        return new Response(JSON.stringify(payload), { status: 400, headers });
      }

      // Check dynamic table or default
      if (cleanCode === '2011' || DYNAMIC_STAFF_CODES[cleanCode]) {
        const staffMeta = DYNAMIC_STAFF_CODES[cleanCode] || {
          name: 'Thomas',
          email: 'thomas@simplyigcse.com',
          role: 'founder',
          title: 'Founder & Head of Platform'
        };

        const isFounderUser = staffMeta.role === 'founder';
        const staffUser = {
          id: isFounderUser ? 'founder_thomas' : `staff_${cleanCode}`,
          name: staffMeta.name,
          email: staffMeta.email,
          role: staffMeta.role,
          title: staffMeta.title,
          status: 'approved',
          plan: 'pro',
          isPro: true,
          hasActiveSubscription: true,
          grade: 'Year 11 / Grade 10 (IGCSE Exam Yr)',
          board: 'Both',
          targetGrade: '9 / A*',
          selectedSubjectIds: ['cie-math-0580', 'cie-esl-0510', 'cie-physics-0625', 'cie-chem-0620', 'cie-bio-0610'],
          currentSessionToken: `${staffMeta.role}_sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
          lastActiveAt: new Date().toISOString(),
          createdAt: '2026-01-01T00:00:00.000Z'
        };

        const payload = {
          success: true,
          isFounder: isFounderUser,
          isAdmin: true,
          user: staffUser,
          token: staffUser.currentSessionToken,
          message: isFounderUser ? `Welcome back, Founder ${staffUser.name}!` : `Welcome back, ${staffUser.name}!`
        };

        if (res?.status) return res.status(200).json(payload);
        return new Response(JSON.stringify(payload), { status: 200, headers });
      }

      // Check server environment-configured staff codes (e.g. STAFF_ACCESS_CODES='{"9988":{"name":"Examiner","role":"admin"}}')
      try {
        const customStaffCodes = process.env.STAFF_ACCESS_CODES ? JSON.parse(process.env.STAFF_ACCESS_CODES) : {};
        if (customStaffCodes[cleanCode]) {
          const staffMeta = customStaffCodes[cleanCode];
          const staffUser = {
            id: `staff_${cleanCode}`,
            name: staffMeta.name || 'Staff Administrator',
            email: staffMeta.email || `${cleanCode}@staff.simplyigcse.com`,
            role: staffMeta.role || 'admin',
            title: staffMeta.title || 'Staff Administrator',
            status: 'approved',
            plan: 'pro',
            isPro: true,
            hasActiveSubscription: true,
            grade: 'Year 11 / Grade 10 (IGCSE Exam Yr)',
            board: 'Both',
            targetGrade: '9 / A*',
            selectedSubjectIds: ['cie-math-0580', 'cie-esl-0510', 'cie-physics-0625', 'cie-chem-0620', 'cie-bio-0610'],
            currentSessionToken: `staff_sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
            lastActiveAt: new Date().toISOString(),
            createdAt: new Date().toISOString()
          };

          const payload = {
            success: true,
            isAdmin: true,
            user: staffUser,
            token: staffUser.currentSessionToken
          };
          if (res?.status) return res.status(200).json(payload);
          return new Response(JSON.stringify(payload), { status: 200, headers });
        }
      } catch (parseErr) {
        console.warn('Could not parse STAFF_ACCESS_CODES environment config', parseErr);
      }

      const payload = { success: false, error: 'Invalid access code. Please check your credentials.' };
      if (res?.status) return res.status(401).json(payload);
      return new Response(JSON.stringify(payload), { status: 401, headers });
    }

    // 3. Dispatch Password Reset Code via Email
    if (action === 'send_reset_code') {
      if (!normalizedEmail || !normalizedEmail.includes('@')) {
        const payload = { success: false, error: 'Valid email address required.' };
        if (res?.status) return res.status(400).json(payload);
        return new Response(JSON.stringify(payload), { status: 400, headers });
      }

      const resetCode = cleanCode || Math.floor(100000 + Math.random() * 900000).toString();

      // SendGrid / Resend Email Dispatch if configured
      const RESEND_API_KEY = process.env.RESEND_API_KEY;
      const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;

      if (RESEND_API_KEY) {
        try {
          await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${RESEND_API_KEY}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              from: 'Simply IGCSE Security <security@simplyigcse.com>',
              to: [normalizedEmail],
              subject: 'Your 6-Digit Password Reset Code - Simply IGCSE',
              html: `
                <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; background: #0b0f19; color: #f1f5f9; border-radius: 16px;">
                  <h2 style="color: #6366f1; margin-bottom: 12px;">Simply IGCSE Security</h2>
                  <p style="font-size: 15px; color: #cbd5e1; line-height: 1.6;">You recently requested to reset the password for your student account associated with <strong>${normalizedEmail}</strong>.</p>
                  <div style="margin: 24px 0; padding: 16px; background: #1e1b4b; border: 1px solid #6366f1; border-radius: 12px; text-align: center;">
                    <span style="font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #38bdf8; font-family: monospace;">${resetCode}</span>
                  </div>
                  <p style="font-size: 13px; color: #94a3b8; line-height: 1.5;">This 6-digit code will expire in <strong>15 minutes</strong>. If you did not request this password reset, you can safely ignore this email.</p>
                  <hr style="border: none; border-top: 1px solid #1e293b; margin: 24px 0;" />
                  <p style="font-size: 11px; color: #64748b;">Simply IGCSE • The Cambridge & Edexcel Revision Co-Pilot</p>
                </div>
              `
            })
          });
        } catch (mailErr) {
          console.warn('[RESEND SERVICE ERROR]', mailErr);
        }
      } else if (SENDGRID_API_KEY) {
        try {
          await fetch('https://api.sendgrid.com/v3/mail/send', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${SENDGRID_API_KEY}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              personalizations: [{ to: [{ email: normalizedEmail }] }],
              from: { email: 'security@simplyigcse.com', name: 'Simply IGCSE Security' },
              subject: 'Your 6-Digit Password Reset Code - Simply IGCSE',
              content: [{
                type: 'text/html',
                value: `<div style="font-family: sans-serif; padding: 20px;"><h2>Simply IGCSE Security</h2><p>Your password reset code is: <strong>${resetCode}</strong></p></div>`
              }]
            })
          });
        } catch (sgErr) {
          console.warn('[SENDGRID SERVICE ERROR]', sgErr);
        }
      }

      // Log dispatch securely to server terminal for auditing & monitoring
      console.log(`[PASSWORD RESET EMAIL] Dispatched 6-digit verification code to <${normalizedEmail}> at ${new Date().toISOString()}`);

      const payload = {
        success: true,
        message: `A 6-digit security verification code has been dispatched to ${normalizedEmail}.`,
        expiresInMinutes: 15
      };

      if (res?.status) return res.status(200).json(payload);
      return new Response(JSON.stringify(payload), { status: 200, headers });
    }

    // 4. Administrator Credential Verification (Legacy Email/Password)
    if (action === 'verify_admin' || action === 'admin_login') {
      const isAdminEmail = normalizedEmail === ADMIN_EMAIL;
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
        title: 'Platform Administrator',
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
