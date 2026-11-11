import React, { useState } from 'react';
import { Key, X, ExternalLink, CheckCircle2, AlertCircle, GraduationCap, ShieldCheck, Sun, Moon, Type } from 'lucide-react';
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
  const [model, setModel] = useState(profile.selectedModel?.includes('2.5') ? 'gemini-1.5-flash' : (profile.selectedModel || 'gemini-1.5-flash'));
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
          setSuccessMessage('Connected to server-side examination engine (Zero-Key student access active).');
          return;
        }
      }

      setTestStatus('error');
      setErrorMessage('No Gemini API key is configured. Please enter your free Google Gemini API key above (get one in 30 seconds at aistudio.google.com/app/apikey), or set GEMINI_API_KEY in Vercel environment variables.');
    } catch {
      setTestStatus('error');
      setErrorMessage('No Gemini API key configured. Enter your free Google Gemini API key above to enable live examiner responses.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg rounded-2xl border border-white/[0.08] bg-[#18181b] p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-zinc-400 hover:bg-white/[0.04] hover:text-white transition"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="rounded-lg bg-[#222225] border border-white/[0.08] p-2 text-[#FF5B37]">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-medium text-[#ededed]">Examiner Engine & API Settings</h2>
            <p className="text-xs text-[#a1a1a6]">Configure your syllabus evaluation and mark scheme engine</p>
          </div>
        </div>

        {/* Free API Key Info Banner */}
        <div className="mb-5 rounded-xl border border-white/[0.08] bg-[#141416] p-3.5 text-xs text-[#a1a1a6]">
          <div className="flex items-start gap-2.5">
            <ShieldCheck className="h-4 w-4 shrink-0 text-[#4cc38a] mt-0.5" />
            <div>
              <p className="font-medium text-[#ededed]">Free Tier Available</p>
              <p className="text-[#a1a1a6] mt-0.5">
                Google provides generous free-tier access for students. You can get an API key in under 1 minute from Google AI Studio.
              </p>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-flex items-center gap-1 font-medium text-[#FF5B37] hover:underline"
              >
                Get a free Gemini API key <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#a1a1a6] mb-1.5">
              Gemini API key
            </label>
            <div className="relative">
              <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full rounded-lg border border-white/[0.08] bg-[#141416] py-2 pl-9 pr-3 text-xs text-[#ededed] placeholder-zinc-500 focus:border-[#FF5B37] focus:outline-none transition"
              />
            </div>
            <p className="mt-1 text-[11px] text-[#85858b]">
              Keys are stored securely in your browser's local storage and are never uploaded to any intermediary servers.
            </p>
          </div>

          {/* Theme & Display Accessibility */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-2 border-b border-white/[0.06]">
            <div>
              <label className="block text-xs font-medium text-[#a1a1a6] mb-1.5">
                Theme mode
              </label>
              <div className="flex rounded-lg bg-[#141416] p-1 border border-white/[0.06]">
                <button
                  type="button"
                  onClick={() => onToggleTheme && theme !== 'dark' && onToggleTheme()}
                  className={`flex-1 flex items-center justify-center gap-1.5 rounded-md py-1.5 text-xs font-medium transition ${
                    theme === 'dark' ? 'bg-[#222225] border border-white/[0.08] text-white shadow-sm' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <Moon className="h-3.5 w-3.5 text-[#FF5B37]" />
                  <span>Dark</span>
                </button>
                <button
                  type="button"
                  onClick={() => onToggleTheme && theme !== 'light' && onToggleTheme()}
                  className={`flex-1 flex items-center justify-center gap-1.5 rounded-md py-1.5 text-xs font-medium transition ${
                    theme === 'light' ? 'bg-[#222225] border border-white/[0.08] text-white shadow-sm' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <Sun className="h-3.5 w-3.5 text-amber-400" />
                  <span>Light</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#a1a1a6] mb-1.5">
                Text size scaling
              </label>
              <div className="flex rounded-lg bg-[#141416] p-1 border border-white/[0.06]">
                {[
                  { id: 'default', label: 'Default' },
                  { id: 'medium', label: 'Medium' },
                  { id: 'large', label: 'Large' },
                ].map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => onChangeFontSize && onChangeFontSize(s.id as any)}
                    className={`flex-1 py-1.5 text-xs font-medium rounded-md transition ${
                      fontSize === s.id ? 'bg-[#222225] border border-white/[0.08] text-white shadow-sm' : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#a1a1a6] mb-1.5">
              Evaluation engine model
            </label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full rounded-lg border border-white/[0.08] bg-[#141416] py-2 px-3 text-xs text-[#ededed] focus:border-[#FF5B37] focus:outline-none transition cursor-pointer"
            >
              <option value="gemini-1.5-flash">Gemini 1.5 Flash (Ultra-fast, Multimodal vision, Best for IGCSE)</option>
              <option value="gemini-1.5-pro">Gemini 1.5 Pro (Deep complex mathematical reasoning)</option>
              <option value="gemini-2.0-flash">Gemini 2.0 Flash (Next-Gen Gemini)</option>
            </select>
          </div>

          {/* Test connection results */}
          {testStatus === 'testing' && (
            <div className="flex items-center gap-2 text-xs text-[#a1a1a6]">
              <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#FF5B37] border-t-transparent" />
              Verifying API key with Google Gemini...
            </div>
          )}
          {testStatus === 'success' && (
            <div className="flex items-center gap-2 rounded-lg bg-[#141416] border border-[#4cc38a]/40 p-2 text-xs text-[#4cc38a]">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-[#4cc38a]" />
              <span>{successMessage || 'API Key is valid and connected to Gemini successfully!'}</span>
            </div>
          )}
          {testStatus === 'error' && (
            <div className="flex items-start gap-2 rounded-lg bg-[#141416] border border-[#e5484d]/40 p-2 text-xs text-[#e5484d]">
              <AlertCircle className="h-4 w-4 shrink-0 text-[#e5484d] mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        <div className="mt-6 flex items-center justify-between border-t border-white/[0.06] pt-4">
          <button
            type="button"
            onClick={handleTestKey}
            disabled={testStatus === 'testing'}
            className="rounded-lg border border-white/[0.08] bg-[#222225] hover:bg-[#2a2a2e] px-3.5 py-1.5 text-xs font-medium text-[#ededed] transition disabled:opacity-50 cursor-pointer"
          >
            Test Connection
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-3 py-1.5 text-xs font-medium text-[#a1a1a6] hover:text-white transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="rounded-lg bg-[#FF5B37] hover:bg-[#F97316] px-4 py-1.5 text-xs font-medium text-white transition cursor-pointer"
            >
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
