import type { VercelRequest, VercelResponse } from '@vercel/node';
import fs from 'fs';
import path from 'path';

interface WhatsAppPayload {
  recipientPhone: string;
  recipientName: string;
  studentId?: string;
  templateType: string;
  messageBody: string;
  mode?: 'automated_api' | 'wa_web';
  webhookUrl?: string;
  callmebotApiKey?: string;
  greenApiInstanceId?: string;
  greenApiToken?: string;
}

const SERVER_LOGS_FILE = path.join(
  process.platform === 'win32' ? process.env.TEMP || 'C:\\Windows\\Temp' : '/tmp',
  'simply_whatsapp_dispatches.json'
);

function getPersistedLogs(): any[] {
  try {
    if (fs.existsSync(SERVER_LOGS_FILE)) {
      const data = JSON.parse(fs.readFileSync(SERVER_LOGS_FILE, 'utf-8'));
      if (Array.isArray(data)) return data;
    }
  } catch {}
  return [];
}

function savePersistedLogs(logs: any[]) {
  try {
    fs.writeFileSync(SERVER_LOGS_FILE, JSON.stringify(logs.slice(0, 500), null, 2), 'utf-8');
  } catch {}
}

export default async function handler(req: any, res?: any) {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  };

  if (req.method === 'OPTIONS') {
    if (res?.status) return res.status(200).end();
    return new Response(null, { status: 200, headers });
  }

  if (req.method === 'GET') {
    const logs = getPersistedLogs();
    const payload = { success: true, totalLogs: logs.length, logs };
    if (res?.status) return res.status(200).json(payload);
    return new Response(JSON.stringify(payload), { status: 200, headers });
  }

  if (req.method !== 'POST') {
    const payload = { error: 'Method not allowed' };
    if (res?.status) return res.status(405).json(payload);
    return new Response(JSON.stringify(payload), { status: 405, headers });
  }

  try {
    let body: WhatsAppPayload = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch {
        body = {} as WhatsAppPayload;
      }
    }

    const {
      recipientPhone,
      recipientName,
      studentId,
      templateType = 'weekly_report',
      messageBody,
      mode = 'automated_api',
      webhookUrl,
      callmebotApiKey,
      greenApiInstanceId,
      greenApiToken
    } = body || {};

    if (!recipientPhone || !recipientPhone.trim()) {
      const payload = { error: 'Recipient phone number is required' };
      if (res?.status) return res.status(400).json(payload);
      return new Response(JSON.stringify(payload), { status: 400, headers });
    }

    let cleanPhone = recipientPhone.replace(/[^\d]/g, '');
    // Auto-normalize Egyptian local numbers (010, 011, 012, 015) to international 201...
    if (cleanPhone.length === 11 && cleanPhone.startsWith('01')) {
      cleanPhone = '20' + cleanPhone.slice(1);
    } else if (cleanPhone.length === 10 && (cleanPhone.startsWith('10') || cleanPhone.startsWith('11') || cleanPhone.startsWith('12') || cleanPhone.startsWith('15'))) {
      cleanPhone = '20' + cleanPhone;
    }

    const dispatchId = `WA-SRV-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const timestamp = new Date().toISOString();

    let outboundResult: any = null;
    let gatewayType = 'internal_simulation';

    // 1. Check for CallMeBot direct integration
    const cmbKey = callmebotApiKey || process.env.CALLMEBOT_API_KEY;
    if (cmbKey && cmbKey.trim()) {
      gatewayType = 'callmebot';
      try {
        const cmbUrl = `https://api.callmebot.com/whatsapp.php?phone=+${cleanPhone}&text=${encodeURIComponent(messageBody)}&apikey=${encodeURIComponent(cmbKey.trim())}`;
        const cmbRes = await fetch(cmbUrl);
        const cmbText = await cmbRes.text();
        outboundResult = {
          gateway: 'callmebot',
          status: cmbRes.status,
          response: cmbText.slice(0, 200)
        };
      } catch (e: any) {
        console.warn('CallMeBot dispatch warning:', e);
        outboundResult = { gateway: 'callmebot', error: e.message };
      }
    }
    // 2. Check for Green API integration
    else if (greenApiInstanceId && greenApiToken) {
      gatewayType = 'green_api';
      try {
        const greenUrl = `https://api.green-api.com/waInstance${greenApiInstanceId.trim()}/sendMessage/${greenApiToken.trim()}`;
        const greenRes = await fetch(greenUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chatId: `${cleanPhone}@c.us`,
            message: messageBody
          })
        });
        const greenData = await greenRes.json();
        outboundResult = {
          gateway: 'green_api',
          status: greenRes.status,
          response: greenData
        };
      } catch (e: any) {
        console.warn('Green API dispatch warning:', e);
        outboundResult = { gateway: 'green_api', error: e.message };
      }
    }
    // 3. Generic Custom Webhook (UltraMsg, Twilio, Make, Zapier)
    else if (webhookUrl || process.env.WHATSAPP_WEBHOOK_URL) {
      const activeWebhook = (webhookUrl || process.env.WHATSAPP_WEBHOOK_URL)!.trim();
      gatewayType = 'custom_webhook';
      try {
        const fetchRes = await fetch(activeWebhook, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            dispatchId,
            to: cleanPhone,
            phone: cleanPhone,
            recipientName,
            studentId,
            templateType,
            message: messageBody,
            timestamp
          })
        });
        outboundResult = {
          gateway: 'custom_webhook',
          status: fetchRes.status,
          statusText: fetchRes.statusText
        };
      } catch (webhookErr: any) {
        console.warn('Outbound WhatsApp webhook dispatch warning:', webhookErr);
        outboundResult = { gateway: 'custom_webhook', error: webhookErr?.message };
      }
    }

    const logEntry = {
      dispatchId,
      timestamp,
      recipientPhone: cleanPhone,
      recipientName: recipientName || 'Student Parent',
      studentId,
      templateType,
      status: outboundResult?.error ? 'failed' : 'delivered',
      mode,
      gatewayType,
      outboundResult,
      preview: messageBody ? messageBody.slice(0, 140) + '...' : ''
    };

    const currentLogs = getPersistedLogs();
    savePersistedLogs([logEntry, ...currentLogs]);

    const payload = {
      success: !outboundResult?.error,
      dispatchId,
      status: outboundResult?.error ? 'failed' : 'delivered',
      recipientPhone: cleanPhone,
      recipientName,
      templateType,
      gatewayType,
      directWaUrl: `https://wa.me/${cleanPhone}?text=${encodeURIComponent(messageBody || '')}`,
      outboundResult
    };

    if (res?.status) return res.status(200).json(payload);
    return new Response(JSON.stringify(payload), { status: 200, headers });
  } catch (err: any) {
    const errorPayload = { error: err?.message || 'Server WhatsApp dispatch error' };
    if (res?.status) return res.status(500).json(errorPayload);
    return new Response(JSON.stringify(errorPayload), { status: 500, headers });
  }
}
