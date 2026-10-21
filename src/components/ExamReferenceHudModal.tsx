import React, { useState, useMemo } from 'react';
import {
  X,
  Search,
  Sparkles,
  Printer,
  ChevronRight,
  FlaskConical,
  Calculator,
  Compass,
  Atom,
  Info,
  Check
} from 'lucide-react';
import {
  IGCSE_PERIODIC_TABLE,
  CAMBRIDGE_EXAM_FORMULAS,
  ElementData
} from '../data/periodicTableData';
import { Subject } from '../types';
import { MathRenderer } from './MathRenderer';

interface ExamReferenceHudModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSubject?: string;
  activeSubject?: Subject;
}

export const ExamReferenceHudModal: React.FC<ExamReferenceHudModalProps> = ({
  isOpen,
  onClose,
  initialSubject = '0620',
  activeSubject
}) => {
  const [activeTab, setActiveTab] = useState<'periodic' | 'formulas-math' | 'formulas-phys' | 'formulas-chem'>(() => {
    const code = activeSubject?.code || initialSubject;
    if (code === '0580') return 'formulas-math';
    if (code === '0625') return 'formulas-phys';
    if (code === '0620') return 'periodic';
    return 'periodic';
  });
  const [elementSearch, setElementSearch] = useState('');
  const [selectedElement, setSelectedElement] = useState<ElementData | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Close on Escape
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Elements filtered by search & category
  const filteredElements = useMemo(() => {
    return IGCSE_PERIODIC_TABLE.filter((el) => {
      const q = elementSearch.toLowerCase().trim();
      const matchSearch =
        !q ||
        el.name.toLowerCase().includes(q) ||
        el.symbol.toLowerCase() === q ||
        el.number.toString() === q;

      const matchCategory =
        categoryFilter === 'all' || el.category === categoryFilter;

      return matchSearch && matchCategory;
    });
  }, [elementSearch, categoryFilter]);

  if (!isOpen) return null;

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'alkali-metal': return 'bg-rose-500/15 border-rose-500/40 text-rose-300';
      case 'alkaline-earth': return 'bg-amber-500/15 border-amber-500/40 text-amber-300';
      case 'transition-metal': return 'bg-sky-500/15 border-sky-500/40 text-sky-300';
      case 'post-transition': return 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300';
      case 'metalloid': return 'bg-teal-500/15 border-teal-500/40 text-teal-300';
      case 'reactive-nonmetal': return 'bg-indigo-500/15 border-indigo-500/40 text-indigo-300';
      case 'noble-gas': return 'bg-purple-500/15 border-purple-500/40 text-purple-300';
      case 'actinide':
      case 'lanthanide': return 'bg-violet-500/15 border-violet-500/40 text-violet-300';
      default: return 'bg-slate-800 border-slate-700 text-slate-300';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative flex flex-col w-full max-w-5xl h-[92vh] rounded-3xl border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden">
        {/* Top Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Atom className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
                Cambridge Exam Reference HUD
                <span className="hidden sm:inline-block rounded-md bg-indigo-500/20 px-2 py-0.5 text-[10px] font-mono text-indigo-300">
                  Official CAIE / Edexcel Standard
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">
                Periodic Table of Elements & Verified Exam Formulas
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="hidden sm:flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white transition cursor-pointer"
              title="Print Reference Sheet"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print A4</span>
            </button>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-slate-400 hover:text-white transition cursor-pointer"
              aria-label="Close Reference HUD"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 px-4 sm:px-6 py-2.5 border-b border-slate-800/80 bg-slate-950/40 overflow-x-auto no-scrollbar text-xs">
          <button
            onClick={() => setActiveTab('periodic')}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 font-bold shrink-0 transition cursor-pointer ${
              activeTab === 'periodic'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Atom className="h-3.5 w-3.5" />
            <span>Periodic Table (0620)</span>
          </button>

          <button
            onClick={() => setActiveTab('formulas-math')}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 font-bold shrink-0 transition cursor-pointer ${
              activeTab === 'formulas-math'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Calculator className="h-3.5 w-3.5" />
            <span>Maths Formulas (0580)</span>
          </button>

          <button
            onClick={() => setActiveTab('formulas-phys')}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 font-bold shrink-0 transition cursor-pointer ${
              activeTab === 'formulas-phys'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Compass className="h-3.5 w-3.5" />
            <span>Physics Equations (0625)</span>
          </button>

          <button
            onClick={() => setActiveTab('formulas-chem')}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 font-bold shrink-0 transition cursor-pointer ${
              activeTab === 'formulas-chem'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <FlaskConical className="h-3.5 w-3.5" />
            <span>Chemistry Quantitative (0620)</span>
          </button>
        </div>

        {/* Tab 1: Periodic Table View */}
        {activeTab === 'periodic' && (
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            {/* Elements Grid & Search Area */}
            <div className="flex-1 flex flex-col overflow-y-auto p-4 sm:p-5 no-scrollbar">
              {/* Search Bar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={elementSearch}
                    onChange={(e) => setElementSearch(e.target.value)}
                    placeholder="Search element by name, symbol (e.g. Fe), or atomic number..."
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 py-2 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-1 text-[11px] overflow-x-auto no-scrollbar">
                  {[
                    { id: 'all', label: 'All' },
                    { id: 'alkali-metal', label: 'Group I' },
                    { id: 'alkaline-earth', label: 'Group II' },
                    { id: 'transition-metal', label: 'Transition' },
                    { id: 'reactive-nonmetal', label: 'Nonmetals' },
                    { id: 'noble-gas', label: 'Group VIII' },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setCategoryFilter(cat.id)}
                      className={`px-2 py-1 rounded-lg font-semibold shrink-0 cursor-pointer ${
                        categoryFilter === cat.id
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Grid of Element Tiles */}
              <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-1.5 sm:gap-2">
                {filteredElements.map((el) => {
                  const isSelected = selectedElement?.number === el.number;
                  return (
                    <button
                      key={el.number}
                      onClick={() => setSelectedElement(el)}
                      className={`flex flex-col justify-between p-2 rounded-xl border transition cursor-pointer text-left ${getCategoryColor(
                        el.category
                      )} ${
                        isSelected
                          ? 'ring-2 ring-indigo-400 scale-105 shadow-lg'
                          : 'hover:brightness-125'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[9px] font-mono opacity-80">
                        <span>{el.number}</span>
                        <span>{el.mass}</span>
                      </div>
                      <div className="text-sm sm:text-base font-black my-0.5 tracking-tight">
                        {el.symbol}
                      </div>
                      <div className="text-[9px] truncate font-medium">
                        {el.name}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Element Detail Drawer */}
            <div className="w-full md:w-80 shrink-0 border-t md:border-t-0 md:border-l border-slate-800 bg-slate-950/70 p-4 sm:p-5 flex flex-col justify-between overflow-y-auto">
              {selectedElement ? (
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-400">
                        Atomic No. {selectedElement.number} • Group {selectedElement.group} • Period {selectedElement.period}
                      </span>
                      <h3 className="text-2xl font-black text-white mt-0.5 flex items-center gap-2">
                        {selectedElement.name}
                        <span className="text-indigo-400 font-mono">({selectedElement.symbol})</span>
                      </h3>
                    </div>
                    <span className="rounded-lg bg-indigo-500/20 px-2 py-1 text-xs font-mono font-black text-indigo-300 border border-indigo-500/30">
                      Ar = {selectedElement.mass}
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1.5 border-b border-slate-800">
                      <span className="text-slate-400">State at RTP (25°C):</span>
                      <span className="font-bold text-white capitalize">{selectedElement.stateAtRtp}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-800">
                      <span className="text-slate-400">Electronic Configuration:</span>
                      <span className="font-mono font-bold text-indigo-300">{selectedElement.electrons}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-800">
                      <span className="text-slate-400">Valency / Oxidation:</span>
                      <span className="font-mono font-bold text-emerald-300">{selectedElement.valency}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-800">
                      <span className="text-slate-400">Chemical Family:</span>
                      <span className="font-semibold text-slate-200 capitalize">{selectedElement.category.replace('-', ' ')}</span>
                    </div>
                  </div>

                  {selectedElement.igcseExamNotes && (
                    <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-3 space-y-1">
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-300">
                        <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                        <span>Cambridge Chief Examiner Notes</span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed font-sans">
                        {selectedElement.igcseExamNotes}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500 space-y-2">
                  <Atom className="h-10 w-10 text-slate-600 animate-pulse" />
                  <p className="text-xs font-semibold">
                    Tap any element in the Periodic Table to view its atomic structure, electron configuration, and official Cambridge exam notes.
                  </p>
                </div>
              )}

              <div className="pt-3 border-t border-slate-800/80 text-[10px] text-slate-500 flex items-center justify-between">
                <span>Standard RTP: 25°C, 1 atm</span>
                <span>CAIE 0620 Syllabus</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2, 3, 4: Formula Views */}
        {activeTab !== 'periodic' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 no-scrollbar">
            {CAMBRIDGE_EXAM_FORMULAS.filter((cat) => {
              if (activeTab === 'formulas-math') return cat.subject === '0580';
              if (activeTab === 'formulas-phys') return cat.subject === '0625';
              if (activeTab === 'formulas-chem') return cat.subject === '0620';
              return true;
            }).map((cat, idx) => (
              <div key={idx} className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <h3 className="text-base font-bold text-white tracking-tight">
                    {cat.title}
                  </h3>
                  <span className="text-xs font-mono font-bold text-indigo-400">
                    Syllabus {cat.subject}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  {cat.items.map((item, itemIdx) => (
                    <div
                      key={itemIdx}
                      className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 space-y-2.5 shadow-md hover:border-indigo-500/40 transition"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">
                          {item.name}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500">
                          Formula
                        </span>
                      </div>

                      <div className="rounded-xl border border-indigo-500/20 bg-indigo-950/30 p-2.5 text-center text-sm font-serif text-indigo-200">
                        <MathRenderer content={`$${item.formula}$`} />
                      </div>

                      <div className="text-[11px] text-slate-400 font-sans">
                        <span className="font-semibold text-slate-300">Variables: </span>
                        {item.variables}
                      </div>

                      <div className="pt-2 border-t border-slate-800/80 text-[11px] text-amber-300/90 flex items-start gap-1.5">
                        <Sparkles className="h-3 w-3 text-amber-400 shrink-0 mt-0.5" />
                        <span>{item.examTip}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
