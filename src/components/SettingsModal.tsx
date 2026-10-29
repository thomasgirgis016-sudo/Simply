import React, { useState } from 'react';
import { Key, X, ExternalLink, CheckCircle2, AlertCircle, Sparkles, ShieldCheck, Sun, Moon, Type } from 'lucide-react';
import { UserProfile } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onUpdateProfile: (updated: Partial<UserProfile>) => void;
  theme?: 'dark' | 'light';
  onToggleTheme?: () => void;
  fontSize?: 'default' | 'medium' | 'large';
  onChangeFontSize?: (size: 'default' | 'medium' | 'large') => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  profile,
  onUpdateProfile,
  theme = 'dark',
  onToggleTheme,
  fontSize = 'default',
  onChangeFontSize,
}) => {
  const [apiKey, setApiKey] = useState(profile.geminiApiKey || '');
  const [model, setModel] = useState(profile.selectedModel || 'gemini-2.5-flash');
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  if (!isOpen) return null;

  const handleSave = () => {
    onUpdateProfile({ geminiApiKey: apiKey.trim(), selectedModel: model });
    onClose();
  };

  const handleTestKey = async () => {
    setTestStatus('testing');
    setErrorMessage('');
    setSuccessMessage('');

    if (apiKey.trim()) {
      // User entered a personal key: test directly with Google Gemini
      try {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey.trim()}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: 'Test connection: reply with "OK".' }] }]
          })
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err?.error?.message || `Google API error (HTTP ${res.status}). Please check that the key is valid and has Gemini API enabled.`);
        }

        setTestStatus('success');
        setSuccessMessage('Personal API Key is valid and connected to Google Gemini successfully!');
      } catch (err: any) {
        setTestStatus('error');
        setErrorMessage(err.message || 'Failed to authenticate key with Google AI Studio.');
      }
      return;
    }

    // No key entered in input: check server route
    try {
      const res = await fetch('/api/solve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ping: true, checkKey: true })
      });

      if (res.ok) {
        const data = await res.json().catch(() => ({}));
        if (data.hasServerKey) {
          setTestStatus('success');
          setSuccessMessage('Connected to server-side Gemini AI engine (Zero-Key student access active).');
          return;
        }
      }

      setTestStatus('error');
      setErrorMessage('No Gemini API key is configured. Please enter your free Google Gemini API key above (get one in 30 seconds at aistudio.google.com/app/apikey), or set GEMINI_API_KEY in Vercel environment variables.');
    } catch {
      setTestStatus('error');
      setErrorMessage('No Gemini API key configured. Enter your free Google Gemini API key above to enable live AI responses.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg rounded-2xl border border-slate-700/80 bg-slate-900/95 p-6 shadow-2xl shadow-indigo-500/10">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 p-2.5 text-white shadow-lg shadow-indigo-500/30">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">AI Engine & API Settings</h2>
            <p className="text-xs text-slate-400">Configure your Google Gemini AI integration</p>
          </div>
        </div>

        {/* Free API Key Info Banner */}
        <div className="mb-5 rounded-xl border border-emerald-500/30 bg-emerald-950/30 p-3.5 text-xs text-emerald-200">
          <div className="flex items-start gap-2.5">
            <ShieldCheck className="h-5 w-5 shrink-0 text-emerald-400 mt-0.5" />
            <div>
              <p className="font-semibold text-emerald-300">Free Tier Available</p>
              <p className="text-emerald-300/80 mt-0.5">
                Google provides generous free-tier access for students. You can get an API key in under 1 minute from Google AI Studio.
              </p>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-flex items-center gap-1 font-medium text-emerald-300 underline hover:text-emerald-200"
              >
                Get a free Gemini API key <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Gemini API Key
            </label>
            <div className="relative">
              <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full rounded-xl border border-slate-700 bg-slate-950/80 py-2.5 pl-10 pr-3 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <p className="mt-1 text-[11px] text-slate-400">
              Keys are stored securely in your browser's local storage and are never uploaded to any intermediary servers.
            </p>
          </div>

          {/* Theme & Display Accessibility */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-2 border-b border-slate-800">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Theme Mode
              </label>
              <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-700">
                <button
                  type="button"
                  onClick={() => onToggleTheme && theme !== 'dark' && onToggleTheme()}
                  className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-bold transition ${
                    theme === 'dark' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Moon className="h-3.5 w-3.5" />
                  <span>Dark</span>
                </button>
                <button
                  type="button"
                  onClick={() => onToggleTheme && theme !== 'light' && onToggleTheme()}
                  className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-bold transition ${
                    theme === 'light' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Sun className="h-3.5 w-3.5" />
                  <span>Light</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Text Size Scaling
              </label>
              <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-700">
                {[
                  { id: 'default', label: 'Default' },
                  { id: 'medium', label: 'Medium' },
                  { id: 'large', label: 'Large' },
                ].map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => onChangeFontSize && onChangeFontSize(s.id as any)}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition ${
                      fontSize === s.id ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              AI Model
            </label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950/80 py-2.5 px-3 text-sm text-white focus:border-indigo-500 focus:outline-none"
            >
              <option value="gemini-2.5-flash">Gemini 2.5 Flash (Ultra-fast, Multimodal vision, Best for IGCSE)</option>
              <option value="gemini-1.5-flash">Gemini 1.5 Flash (High speed, reliable)</option>
              <option value="gemini-1.5-pro">Gemini 1.5 Pro (Deep complex mathematical reasoning)</option>
            </select>
          </div>

          {/* Test connection results */}
          {testStatus === 'testing' && (
            <div className="flex items-center gap-2 text-xs text-indigo-300">
              <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-indigo-400 border-t-transparent" />
              Verifying API key with Google Gemini...
            </div>
          )}
          {testStatus === 'success' && (
            <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 p-2 text-xs text-emerald-300">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
              <span>{successMessage || 'API Key is valid and connected to Gemini successfully!'}</span>
            </div>
          )}
          {testStatus === 'error' && (
            <div className="flex items-start gap-2 rounded-lg bg-rose-500/10 border border-rose-500/30 p-2 text-xs text-rose-300">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        <div className="mt-6 flex items-center justify-between border-t border-slate-800 pt-4">
          <button
            type="button"
            onClick={handleTestKey}
            disabled={testStatus === 'testing'}
            className="rounded-xl border border-slate-700 bg-slate-800/80 px-3.5 py-2 text-xs font-medium text-slate-200 hover:bg-slate-700 hover:text-white transition disabled:opacity-50"
          >
            Test Connection
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-5 py-2 text-xs font-semibold text-white shadow-lg shadow-indigo-500/25 hover:from-indigo-400 hover:to-purple-500 transition"
            >
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
