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
    <div className="fixed left-3 right-3 sm:left-auto sm:right-6 bottom-20 md:bottom-6 z-50 w-auto sm:w-[350px] max-w-full rounded-3xl border border-slate-700/80 bg-slate-900/95 shadow-2xl backdrop-blur-xl overflow-hidden animate-in fade-in zoom-in-95">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950/80 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <CalcIcon className="h-4 w-4 text-amber-400" />
          <span className="text-xs font-bold text-white tracking-wide">
            IGCSE Scientific Calculator
          </span>
          <button
            onClick={() => setIsDegree(!isDegree)}
            className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold border transition cursor-pointer ${
              isDegree
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
            }`}
          >
            {isDegree ? 'DEG' : 'RAD'}
          </button>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white cursor-pointer"
            title={isMinimized ? 'Expand' : 'Minimize'}
          >
            {isMinimized ? <Maximize2 className="h-3.5 w-3.5" /> : <Minimize2 className="h-3.5 w-3.5" />}
          </button>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-rose-500/20 hover:text-rose-300 cursor-pointer"
            title="Close"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <div className="p-3.5 space-y-3">
          {/* Display */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-3 text-right">
            <div className="min-h-[22px] overflow-x-auto text-xs font-mono text-slate-400 whitespace-nowrap scrollbar-none">
              {expression || '0'}
            </div>
            <div className="text-xl sm:text-2xl font-bold font-mono text-amber-300 truncate">
              {result ? `= ${result}` : '0'}
            </div>
          </div>

          {/* Keypad */}
          <div className="grid grid-cols-5 gap-1.5 text-xs font-semibold">
            {/* Row 1: Trig & Modes */}
            <button
              onClick={() => append('sin(')}
              className="rounded-xl bg-slate-800/80 p-2.5 sm:p-2 text-slate-300 hover:bg-slate-700 active:scale-95 cursor-pointer"
            >
              sin
            </button>
            <button
              onClick={() => append('cos(')}
              className="rounded-xl bg-slate-800/80 p-2 text-slate-300 hover:bg-slate-700 active:scale-95"
            >
              cos
            </button>
            <button
              onClick={() => append('tan(')}
              className="rounded-xl bg-slate-800/80 p-2 text-slate-300 hover:bg-slate-700 active:scale-95"
            >
              tan
            </button>
            <button
              onClick={clearAll}
              className="rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/30 p-2 hover:bg-rose-500/30 active:scale-95"
            >
              C
            </button>
            <button
              onClick={backspace}
              className="flex items-center justify-center rounded-xl bg-slate-800 p-2 text-slate-300 hover:bg-slate-700 active:scale-95"
            >
              <Delete className="h-3.5 w-3.5" />
            </button>

            {/* Row 2: Powers, Roots, Pi */}
            <button
              onClick={() => append('sqrt(')}
              className="rounded-xl bg-slate-800/80 p-2 text-slate-300 hover:bg-slate-700 active:scale-95"
            >
              √x
            </button>
            <button
              onClick={() => append('^2')}
              className="rounded-xl bg-slate-800/80 p-2 text-slate-300 hover:bg-slate-700 active:scale-95"
            >
              x²
            </button>
            <button
              onClick={() => append('^')}
              className="rounded-xl bg-slate-800/80 p-2 text-slate-300 hover:bg-slate-700 active:scale-95"
            >
              xʸ
            </button>
            <button
              onClick={() => append('(')}
              className="rounded-xl bg-slate-800/60 p-2 text-slate-400 hover:bg-slate-700 active:scale-95"
            >
              (
            </button>
            <button
              onClick={() => append(')')}
              className="rounded-xl bg-slate-800/60 p-2 text-slate-400 hover:bg-slate-700 active:scale-95"
            >
              )
            </button>

            {/* Row 3: Log, 7, 8, 9, Divide */}
            <button
              onClick={() => append('log(')}
              className="rounded-xl bg-slate-800/80 p-2 text-slate-300 hover:bg-slate-700 active:scale-95"
            >
              log
            </button>
            <button
              onClick={() => append('7')}
              className="rounded-xl bg-slate-800/40 p-2 text-white hover:bg-slate-800 active:scale-95"
            >
              7
            </button>
            <button
              onClick={() => append('8')}
              className="rounded-xl bg-slate-800/40 p-2 text-white hover:bg-slate-800 active:scale-95"
            >
              8
            </button>
            <button
              onClick={() => append('9')}
              className="rounded-xl bg-slate-800/40 p-2 text-white hover:bg-slate-800 active:scale-95"
            >
              9
            </button>
            <button
              onClick={() => append('÷')}
              className="rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 p-2 hover:bg-indigo-500/30 active:scale-95"
            >
              ÷
            </button>

            {/* Row 4: ln, 4, 5, 6, Multiply */}
            <button
              onClick={() => append('ln(')}
              className="rounded-xl bg-slate-800/80 p-2 text-slate-300 hover:bg-slate-700 active:scale-95"
            >
              ln
            </button>
            <button
              onClick={() => append('4')}
              className="rounded-xl bg-slate-800/40 p-2 text-white hover:bg-slate-800 active:scale-95"
            >
              4
            </button>
            <button
              onClick={() => append('5')}
              className="rounded-xl bg-slate-800/40 p-2 text-white hover:bg-slate-800 active:scale-95"
            >
              5
            </button>
            <button
              onClick={() => append('6')}
              className="rounded-xl bg-slate-800/40 p-2 text-white hover:bg-slate-800 active:scale-95"
            >
              6
            </button>
            <button
              onClick={() => append('×')}
              className="rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 p-2 hover:bg-indigo-500/30 active:scale-95"
            >
              ×
            </button>

            {/* Row 5: Pi, 1, 2, 3, Subtract */}
            <button
              onClick={() => append('π')}
              className="rounded-xl bg-slate-800/80 p-2 text-slate-300 hover:bg-slate-700 active:scale-95"
            >
              π
            </button>
            <button
              onClick={() => append('1')}
              className="rounded-xl bg-slate-800/40 p-2 text-white hover:bg-slate-800 active:scale-95"
            >
              1
            </button>
            <button
              onClick={() => append('2')}
              className="rounded-xl bg-slate-800/40 p-2 text-white hover:bg-slate-800 active:scale-95"
            >
              2
            </button>
            <button
              onClick={() => append('3')}
              className="rounded-xl bg-slate-800/40 p-2 text-white hover:bg-slate-800 active:scale-95"
            >
              3
            </button>
            <button
              onClick={() => append('-')}
              className="rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 p-2 hover:bg-indigo-500/30 active:scale-95"
            >
              -
            </button>

            {/* Row 6: e, 0, ., Ans/Clear, Add/Equal */}
            <button
              onClick={() => append('e')}
              className="rounded-xl bg-slate-800/80 p-2 text-slate-300 hover:bg-slate-700 active:scale-95"
            >
              e
            </button>
            <button
              onClick={() => append('0')}
              className="rounded-xl bg-slate-800/40 p-2 text-white hover:bg-slate-800 active:scale-95"
            >
              0
            </button>
            <button
              onClick={() => append('.')}
              className="rounded-xl bg-slate-800/40 p-2 text-white hover:bg-slate-800 active:scale-95"
            >
              .
            </button>
            <button
              onClick={() => append('+')}
              className="rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 p-2 hover:bg-indigo-500/30 active:scale-95"
            >
              +
            </button>
            <button
              onClick={calculate}
              className="rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold p-2 shadow-md shadow-amber-500/20 hover:from-amber-400 hover:to-amber-500 active:scale-95"
            >
              =
            </button>
          </div>

          <p className="text-[10px] text-slate-500 text-center">
            Permitted in CIE 0580 Paper 4, 0625/0620 Paper 4, and Edexcel 4MA1.
          </p>
        </div>
      )}
    </div>
  );
};
