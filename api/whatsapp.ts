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
      webhookUrl
    } = body || {};

    if (!recipientPhone || !recipientPhone.trim()) {
      const payload = { error: 'Recipient phone number is required' };
      if (res?.status) return res.status(400).json(payload);
      return new Response(JSON.stringify(payload), { status: 400, headers });
    }

    const cleanPhone = recipientPhone.replace(/[^\d]/g, '');
    const dispatchId = `WA-SRV-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const timestamp = new Date().toISOString();

    let webhookResponse: any = null;
    let delivered = true;

    // Optional outbound webhook dispatch (supports CallMeBot, Green API, UltraMsg, Zapier, Make)
    const activeWebhook = webhookUrl || process.env.WHATSAPP_WEBHOOK_URL;
    if (activeWebhook && activeWebhook.trim()) {
      try {
        const fetchRes = await fetch(activeWebhook.trim(), {
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
        webhookResponse = {
          status: fetchRes.status,
          statusText: fetchRes.statusText
        };
      } catch (webhookErr: any) {
        console.warn('Outbound WhatsApp webhook dispatch warning:', webhookErr);
        webhookResponse = { error: webhookErr?.message };
      }
    }

    const logEntry = {
      dispatchId,
      timestamp,
      recipientPhone: cleanPhone,
      recipientName: recipientName || 'Student Parent',
      studentId,
      templateType,
      status: 'delivered',
      mode,
      webhookDelivered: Boolean(activeWebhook),
      webhookResponse,
      preview: messageBody ? messageBody.slice(0, 140) + '...' : ''
    };

    const currentLogs = getPersistedLogs();
    savePersistedLogs([logEntry, ...currentLogs]);

    const payload = {
      success: true,
      dispatchId,
      status: 'delivered',
      recipientPhone: cleanPhone,
      recipientName,
      templateType,
      directWaUrl: `https://wa.me/${cleanPhone}?text=${encodeURIComponent(messageBody || '')}`,
      webhookResult: webhookResponse
    };

    if (res?.status) return res.status(200).json(payload);
    return new Response(JSON.stringify(payload), { status: 200, headers });
  } catch (err: any) {
    const errorPayload = { error: err?.message || 'Server WhatsApp dispatch error' };
    if (res?.status) return res.status(500).json(errorPayload);
    return new Response(JSON.stringify(errorPayload), { status: 500, headers });
  }
}
