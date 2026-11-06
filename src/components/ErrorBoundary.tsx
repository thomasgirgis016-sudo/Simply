import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Trash2, ShieldCheck, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    try {
      localStorage.removeItem('simply_igcse_revision');
      localStorage.removeItem('simply_igcse_flashcards');
      localStorage.removeItem('simply_igcse_quizzes');
    } catch {}
    window.location.reload();
  };

  handleResetCache = () => {
    try {
      localStorage.removeItem('simply_igcse_profile');
      localStorage.removeItem('simply_igcse_flashcards');
      localStorage.removeItem('simply_igcse_quizzes');
      localStorage.removeItem('simply_igcse_revision');
      localStorage.removeItem('simply_igcse_custom_past_papers');
      sessionStorage.clear();
    } catch (e) {
      console.warn('Cache clear error:', e);
    }
    window.location.href = window.location.pathname;
  };

  handleFounderRecovery = () => {
    try {
      localStorage.removeItem('simply_igcse_revision');
      localStorage.removeItem('simply_igcse_flashcards');
      localStorage.removeItem('simply_igcse_quizzes');
      localStorage.setItem('simply_active_user_id', 'founder_thomas');
    } catch {}
    window.location.href = window.location.pathname + '?admin=portal';
  };

  secretClicks = 0;

  handleSecretIconClick = () => {
    this.secretClicks += 1;
    if (this.secretClicks >= 3) {
      this.handleFounderRecovery();
    }
    setTimeout(() => {
      this.secretClicks = 0;
    }, 1500);
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0a0e1a] text-slate-100 flex items-center justify-center p-4">
          <div className="max-w-md w-full rounded-2xl border border-rose-500/30 bg-slate-900/90 p-6 sm:p-8 text-center shadow-2xl backdrop-blur-xl">
            <div
              onClick={this.handleSecretIconClick}
              className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/15 text-rose-400 border border-rose-500/30 mb-4 select-none cursor-default active:scale-95 transition"
            >
              <AlertTriangle className="h-7 w-7" />
            </div>

            <h1 className="text-xl font-black text-white">
              Something went wrong
            </h1>

            <p className="mt-2 text-xs text-slate-300 leading-relaxed">
              Simply encountered an unexpected display issue. Your saved progress is safe.
            </p>

            {this.state.error && (
              <div className="mt-4 p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-left overflow-x-auto text-[11px] font-mono text-rose-300 max-h-32">
                {this.state.error.toString()}
              </div>
            )}

            <div className="mt-6 flex flex-col gap-2.5">
              <button
                onClick={this.handleReload}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-indigo-500 transition cursor-pointer shadow-md"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Reload Simply</span>
              </button>

              <button
                onClick={this.handleResetCache}
                className="w-full flex items-center justify-center gap-2 rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 transition cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Reset View Cache & Restart</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
