import React, { useState } from 'react';
import { Calculator as CalcIcon, X, Delete, RotateCcw, Minimize2, Maximize2 } from 'lucide-react';

interface ScientificCalculatorProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ScientificCalculator: React.FC<ScientificCalculatorProps> = ({
  isOpen,
  onClose,
}) => {
  const [expression, setExpression] = useState('');
  const [result, setResult] = useState('');
  const [isDegree, setIsDegree] = useState(true); // Default DEG mode for IGCSE
  const [isMinimized, setIsMinimized] = useState(false);

  if (!isOpen) return null;

  const append = (val: string) => {
    setExpression((prev) => prev + val);
  };

  const clearAll = () => {
    setExpression('');
    setResult('');
  };

  const backspace = () => {
    setExpression((prev) => prev.slice(0, -1));
  };

  const calculate = () => {
    try {
      if (!expression.trim()) return;

      // Replace math tokens for safe evaluation
      let sanitized = expression
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/π/g, `${Math.PI}`)
        .replace(/e(?![a-zA-Z])/g, `${Math.E}`);

      // Handle trig in deg/rad
      const degFactor = isDegree ? ` * (Math.PI / 180)` : '';
      sanitized = sanitized
        .replace(/sin\(/g, `Math.sin(`)
        .replace(/cos\(/g, `Math.cos(`)
        .replace(/tan\(/g, `Math.tan(`)
        .replace(/asin\(/g, `Math.asin(`)
        .replace(/acos\(/g, `Math.acos(`)
        .replace(/atan\(/g, `Math.atan(`)
        .replace(/sqrt\(/g, `Math.sqrt(`)
        .replace(/log\(/g, `Math.log10(`)
        .replace(/ln\(/g, `Math.log(`)
        .replace(/\^/g, `**`);

      // Evaluate safely
      // Wrap trig arguments if DEG mode is active
      if (isDegree) {
        sanitized = sanitized
          .replace(/Math\.sin\(([^)]+)\)/g, 'Math.sin(($1) * Math.PI / 180)')
          .replace(/Math\.cos\(([^)]+)\)/g, 'Math.cos(($1) * Math.PI / 180)')
          .replace(/Math\.tan\(([^)]+)\)/g, 'Math.tan(($1) * Math.PI / 180)');
      }

      // Safe JS execution of mathematical string
      const evalResult = Function(`"use strict"; return (${sanitized})`)();
      
      if (typeof evalResult === 'number' && !isNaN(evalResult)) {
        // Round to 4 decimal places / standard IGCSE accuracy
        const formatted = Number.isInteger(evalResult)
          ? evalResult.toString()
          : parseFloat(evalResult.toFixed(6)).toString();
        setResult(formatted);
      } else {
        setResult('Error');
      }
    } catch {
      setResult('Error');
    }
  };

  return (
    <div className="fixed left-3 right-3 sm:left-auto sm:right-6 bottom-20 md:bottom-6 z-50 w-auto sm:w-[350px] max-w-full rounded-2xl border border-white/[0.08] bg-[#18181b] shadow-2xl backdrop-blur-xl overflow-hidden animate-in fade-in zoom-in-95">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/[0.08] bg-[#141416] px-3.5 py-2.5">
        <div className="flex items-center gap-2">
          <CalcIcon className="h-4 w-4 text-[#FF5B37]" />
          <span className="text-xs font-semibold text-zinc-100 tracking-tight">
            IGCSE Scientific Calculator
          </span>
          <button
            onClick={() => setIsDegree(!isDegree)}
            className="rounded border border-white/[0.08] bg-white/[0.04] px-1.5 py-0.5 text-[10px] font-mono font-medium text-zinc-300 transition-colors cursor-pointer"
          >
            {isDegree ? 'DEG' : 'RAD'}
          </button>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="rounded-md p-1 text-zinc-400 hover:bg-white/[0.06] hover:text-white transition-colors cursor-pointer"
            title={isMinimized ? 'Expand' : 'Minimize'}
          >
            {isMinimized ? <Maximize2 className="h-3.5 w-3.5" /> : <Minimize2 className="h-3.5 w-3.5" />}
          </button>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-zinc-400 hover:bg-[#e5484d]/20 hover:text-[#e5484d] transition-colors cursor-pointer"
            title="Close"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <div className="p-3.5 space-y-3">
          {/* Display */}
          <div className="rounded-xl border border-white/[0.08] bg-[#111113] p-3 text-right">
            <div className="min-h-[22px] overflow-x-auto text-xs font-mono text-zinc-500 whitespace-nowrap scrollbar-none">
              {expression || '0'}
            </div>
            <div className="text-xl sm:text-2xl font-mono font-semibold text-[#FF5B37] truncate">
              {result ? `= ${result}` : '0'}
            </div>
          </div>

          {/* Keypad */}
          <div className="grid grid-cols-5 gap-1.5 text-xs font-mono">
            {/* Row 1: Trig & Modes */}
            <button
              onClick={() => append('sin(')}
              className="rounded-lg bg-white/[0.03] p-2 text-zinc-300 border border-white/[0.06] hover:bg-white/[0.08] active:scale-95 cursor-pointer transition-colors"
            >
              sin
            </button>
            <button
              onClick={() => append('cos(')}
              className="rounded-lg bg-white/[0.03] p-2 text-zinc-300 border border-white/[0.06] hover:bg-white/[0.08] active:scale-95 cursor-pointer transition-colors"
            >
              cos
            </button>
            <button
              onClick={() => append('tan(')}
              className="rounded-lg bg-white/[0.03] p-2 text-zinc-300 border border-white/[0.06] hover:bg-white/[0.08] active:scale-95 cursor-pointer transition-colors"
            >
              tan
            </button>
            <button
              onClick={clearAll}
              className="rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 p-2 hover:bg-rose-500/20 active:scale-95 cursor-pointer transition-colors font-semibold"
            >
              C
            </button>
            <button
              onClick={backspace}
              className="flex items-center justify-center rounded-lg bg-white/[0.03] p-2 text-zinc-300 border border-white/[0.06] hover:bg-white/[0.08] active:scale-95 cursor-pointer transition-colors"
            >
              <Delete className="h-3.5 w-3.5" />
            </button>

            {/* Row 2: Powers, Roots, Pi */}
            <button
              onClick={() => append('sqrt(')}
              className="rounded-lg bg-white/[0.03] p-2 text-zinc-300 border border-white/[0.06] hover:bg-white/[0.08] active:scale-95 cursor-pointer transition-colors"
            >
              √x
            </button>
            <button
              onClick={() => append('^2')}
              className="rounded-lg bg-white/[0.03] p-2 text-zinc-300 border border-white/[0.06] hover:bg-white/[0.08] active:scale-95 cursor-pointer transition-colors"
            >
              x²
            </button>
            <button
              onClick={() => append('^')}
              className="rounded-lg bg-white/[0.03] p-2 text-zinc-300 border border-white/[0.06] hover:bg-white/[0.08] active:scale-95 cursor-pointer transition-colors"
            >
              xʸ
            </button>
            <button
              onClick={() => append('(')}
              className="rounded-lg bg-white/[0.03] p-2 text-zinc-400 border border-white/[0.06] hover:bg-white/[0.08] active:scale-95 cursor-pointer transition-colors"
            >
              (
            </button>
            <button
              onClick={() => append(')')}
              className="rounded-lg bg-white/[0.03] p-2 text-zinc-400 border border-white/[0.06] hover:bg-white/[0.08] active:scale-95 cursor-pointer transition-colors"
            >
              )
            </button>

            {/* Row 3: Log, 7, 8, 9, Divide */}
            <button
              onClick={() => append('log(')}
              className="rounded-lg bg-white/[0.03] p-2 text-zinc-300 border border-white/[0.06] hover:bg-white/[0.08] active:scale-95 cursor-pointer transition-colors"
            >
              log
            </button>
            <button
              onClick={() => append('7')}
              className="rounded-lg bg-white/[0.02] p-2 text-zinc-100 border border-white/[0.04] hover:bg-white/[0.06] active:scale-95 cursor-pointer transition-colors"
            >
              7
            </button>
            <button
              onClick={() => append('8')}
              className="rounded-lg bg-white/[0.02] p-2 text-zinc-100 border border-white/[0.04] hover:bg-white/[0.06] active:scale-95 cursor-pointer transition-colors"
            >
              8
            </button>
            <button
              onClick={() => append('9')}
              className="rounded-lg bg-white/[0.02] p-2 text-zinc-100 border border-white/[0.04] hover:bg-white/[0.06] active:scale-95 cursor-pointer transition-colors"
            >
              9
            </button>
            <button
              onClick={() => append('÷')}
              className="rounded-lg bg-white/[0.04] text-[#FF5B37] border border-white/[0.08] p-2 hover:bg-white/[0.08] active:scale-95 cursor-pointer transition-colors font-semibold"
            >
              ÷
            </button>

            {/* Row 4: ln, 4, 5, 6, Multiply */}
            <button
              onClick={() => append('ln(')}
              className="rounded-lg bg-white/[0.03] p-2 text-zinc-300 border border-white/[0.06] hover:bg-white/[0.08] active:scale-95 cursor-pointer transition-colors"
            >
              ln
            </button>
            <button
              onClick={() => append('4')}
              className="rounded-lg bg-white/[0.02] p-2 text-zinc-100 border border-white/[0.04] hover:bg-white/[0.06] active:scale-95 cursor-pointer transition-colors"
            >
              4
            </button>
            <button
              onClick={() => append('5')}
              className="rounded-lg bg-white/[0.02] p-2 text-zinc-100 border border-white/[0.04] hover:bg-white/[0.06] active:scale-95 cursor-pointer transition-colors"
            >
              5
            </button>
            <button
              onClick={() => append('6')}
              className="rounded-lg bg-white/[0.02] p-2 text-zinc-100 border border-white/[0.04] hover:bg-white/[0.06] active:scale-95 cursor-pointer transition-colors"
            >
              6
            </button>
            <button
              onClick={() => append('×')}
              className="rounded-lg bg-white/[0.04] text-[#FF5B37] border border-white/[0.08] p-2 hover:bg-white/[0.08] active:scale-95 cursor-pointer transition-colors font-semibold"
            >
              ×
            </button>

            {/* Row 5: Pi, 1, 2, 3, Subtract */}
            <button
              onClick={() => append('π')}
              className="rounded-lg bg-white/[0.03] p-2 text-zinc-300 border border-white/[0.06] hover:bg-white/[0.08] active:scale-95 cursor-pointer transition-colors"
            >
              π
            </button>
            <button
              onClick={() => append('1')}
              className="rounded-lg bg-white/[0.02] p-2 text-zinc-100 border border-white/[0.04] hover:bg-white/[0.06] active:scale-95 cursor-pointer transition-colors"
            >
              1
            </button>
            <button
              onClick={() => append('2')}
              className="rounded-lg bg-white/[0.02] p-2 text-zinc-100 border border-white/[0.04] hover:bg-white/[0.06] active:scale-95 cursor-pointer transition-colors"
            >
              2
            </button>
            <button
              onClick={() => append('3')}
              className="rounded-lg bg-white/[0.02] p-2 text-zinc-100 border border-white/[0.04] hover:bg-white/[0.06] active:scale-95 cursor-pointer transition-colors"
            >
              3
            </button>
            <button
              onClick={() => append('-')}
              className="rounded-lg bg-white/[0.04] text-[#FF5B37] border border-white/[0.08] p-2 hover:bg-white/[0.08] active:scale-95 cursor-pointer transition-colors font-semibold"
            >
              -
            </button>

            {/* Row 6: e, 0, ., Ans/Clear, Add/Equal */}
            <button
              onClick={() => append('e')}
              className="rounded-lg bg-white/[0.03] p-2 text-zinc-300 border border-white/[0.06] hover:bg-white/[0.08] active:scale-95 cursor-pointer transition-colors"
            >
              e
            </button>
            <button
              onClick={() => append('0')}
              className="rounded-lg bg-white/[0.02] p-2 text-zinc-100 border border-white/[0.04] hover:bg-white/[0.06] active:scale-95 cursor-pointer transition-colors"
            >
              0
            </button>
            <button
              onClick={() => append('.')}
              className="rounded-lg bg-white/[0.02] p-2 text-zinc-100 border border-white/[0.04] hover:bg-white/[0.06] active:scale-95 cursor-pointer transition-colors"
            >
              .
            </button>
            <button
              onClick={() => append('+')}
              className="rounded-lg bg-white/[0.04] text-[#FF5B37] border border-white/[0.08] p-2 hover:bg-white/[0.08] active:scale-95 cursor-pointer transition-colors font-semibold"
            >
              +
            </button>
            <button
              onClick={calculate}
              className="rounded-lg bg-[#FF5B37] hover:bg-[#ff704d] text-white font-semibold p-2 active:scale-95 cursor-pointer transition-colors"
            >
              =
            </button>
          </div>

          <p className="text-[10px] text-zinc-500 text-center font-mono">
            Permitted in CIE 0580 Paper 4, 0625/0620 Paper 4, and Edexcel 4MA1.
          </p>
        </div>
      )}
    </div>
  );
};
