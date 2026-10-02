import { useState, useEffect, useMemo, useCallback } from 'react';
import * as math from 'mathjs';
import confetti from 'canvas-confetti';
import {
  Volume2,
  VolumeX,
  History,
  Keyboard,
  Compass,
  Activity,
  Calculator as CalcIcon,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { CalculatorDisplay } from './components/CalculatorDisplay';
import { Keypad } from './components/Keypad';
import { HistoryDrawer } from './components/HistoryDrawer';
import { UnitConverterSection } from './components/UnitConverterSection';
import { PlotterSection } from './components/PlotterSection';
import { KeyboardModal } from './components/KeyboardModal';
import { playKeySound } from './utils/audio';
import { THEMES } from './constants/themes';

function formatNumber(val) {
  if (val === null || val === undefined) return '0';
  if (typeof val === 'object' && val.toString) {
    try {
      val = val.toNumber ? val.toNumber() : Number(val);
    } catch {
      /* keep */
    }
  }
  if (typeof val !== 'number') {
    try {
      val = Number(val);
    } catch {
      return String(val);
    }
  }
  if (Number.isNaN(val)) throw new Error('NaN');
  if (!Number.isFinite(val)) throw new Error('INF');
  if (Math.abs(val) > 1e15 || (Math.abs(val) < 1e-10 && val !== 0)) {
    return val.toExponential(6).replace(/\.?0+e/, 'e');
  }
  let s = math.format(val, { precision: 12 });
  if (s.includes('.')) {
    s = s.replace(/0+$/, '').replace(/\.$/, '');
  }
  return s;
}

export function CalcVerseContent() {
  const theme = THEMES.obsidian;

  // Primary Tool Workspace: 'calc' | 'plotter' | 'converter'
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState('calc');

  // Calculator Sub-Mode: 'scientific' | 'standard' | 'programmer'
  const [calcMode, setCalcMode] = useState('scientific');
  const [angleMode, setAngleMode] = useState('DEG'); // DEG | RAD
  const [inv, setInv] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const [expression, setExpression] = useState('');
  const [prevLine, setPrevLine] = useState('');
  const [error, setError] = useState(null);
  const [memory, setMemory] = useState(null);
  const [history, setHistory] = useState([]);
  const [showHistoryDrawer, setShowHistoryDrawer] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [justEvaluated, setJustEvaluated] = useState(false);

  const mathInstance = useMemo(() => math.create(math.all), []);

  // Update trigonometric angle modes in mathjs
  useEffect(() => {
    const toRad = (x) => (angleMode === 'DEG' ? (x * Math.PI) / 180 : x);
    const toDeg = (x) => (angleMode === 'DEG' ? (x * 180) / Math.PI : x);
    mathInstance.import(
      {
        sin: (x) => Math.sin(toRad(x)),
        cos: (x) => Math.cos(toRad(x)),
        tan: (x) => Math.tan(toRad(x)),
        asin: (x) => toDeg(Math.asin(x)),
        acos: (x) => toDeg(Math.acos(x)),
        atan: (x) => toDeg(Math.atan(x)),
      },
      { override: true }
    );
  }, [angleMode, mathInstance]);

  // Live evaluation preview
  const livePreview = useMemo(() => {
    if (!expression.trim()) return null;
    try {
      const val = mathInstance.evaluate(expression);
      if (typeof val === 'function') return null;
      return formatNumber(val);
    } catch {
      return null;
    }
  }, [expression, mathInstance]);

  const getCurrentValue = useCallback(() => {
    try {
      const source = expression.trim() ? expression : prevLine.split('=').pop();
      const val = mathInstance.evaluate(source || '0');
      return typeof val === 'number' ? val : Number(val);
    } catch {
      return null;
    }
  }, [expression, prevLine, mathInstance]);

  const insertText = (txt) => {
    setError(null);
    setJustEvaluated(false);
    setExpression((prev) => prev + txt);
  };

  const clearAll = () => {
    setExpression('');
    setPrevLine('');
    setError(null);
    setJustEvaluated(false);
    playKeySound('clear', isMuted);
  };

  const backspace = () => {
    setError(null);
    setExpression((prev) => prev.slice(0, -1));
  };

  const evaluate = useCallback(() => {
    if (!expression.trim()) return;
    try {
      const val = mathInstance.evaluate(expression);
      if (typeof val === 'function') throw new Error('Syntax Error');
      const formatted = formatNumber(val);

      // Easter egg celebration for milestone math results
      if (['42', '3.14159265', '1337'].includes(formatted)) {
        confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
      }

      setHistory((h) => [
        { id: Date.now() + Math.random(), expr: expression, result: formatted, timestamp: Date.now() },
        ...h,
      ].slice(0, 100));

      setPrevLine(`${expression} =`);
      setExpression(formatted);
      setError(null);
      setJustEvaluated(true);
      playKeySound('equals', isMuted);
    } catch (e) {
      const msg = e.message || '';
      if (msg.includes('INF') || /divide/i.test(msg)) setError('Cannot divide by zero');
      else if (msg.includes('NaN')) setError('Domain Error');
      else if (/unexpected|parenthes|undefined symbol|unexpected end/i.test(msg)) setError('Syntax Error');
      else setError('Invalid Expression');
    }
  }, [expression, mathInstance, isMuted]);

  const applyUnaryNow = (fn) => {
    const val = getCurrentValue();
    if (val === null) {
      setError('Invalid Expression');
      return;
    }
    try {
      const res = fn(val);
      setExpression(formatNumber(res));
      setPrevLine('');
      setError(null);
      playKeySound('func', isMuted);
    } catch {
      setError('Domain Error');
    }
  };

  const appendPostfix = (op) => {
    if (!expression.trim()) return;
    setExpression((prev) => prev + op);
  };

  // Base conversions for Programmer mode
  const convertBase = (targetBase) => {
    const val = getCurrentValue();
    if (val === null) return;
    const intVal = Math.floor(val);
    if (targetBase === 'hex') setExpression(`0x${intVal.toString(16).toUpperCase()}`);
    if (targetBase === 'bin') setExpression(`0b${intVal.toString(2)}`);
    if (targetBase === 'oct') setExpression(`0o${intVal.toString(8)}`);
    setPrevLine(`DEC: ${intVal} →`);
    setJustEvaluated(true);
  };

  // Memory Registers
  const memMS = () => {
    const v = getCurrentValue();
    if (v !== null) setMemory(v);
  };
  const memMC = () => setMemory(null);
  const memMR = () => {
    if (memory !== null) insertText(formatNumber(memory));
  };
  const memMPlus = () => {
    const v = getCurrentValue();
    if (v !== null) setMemory((m) => (m || 0) + v);
  };
  const memMMinus = () => {
    const v = getCurrentValue();
    if (v !== null) setMemory((m) => (m || 0) - v);
  };

  const handleAction = (action) => {
    switch (action.type) {
      case 'digit':
      case 'op':
        if (justEvaluated && /^[0-9.]/.test(action.value)) {
          setExpression(action.value);
          setPrevLine('');
          setJustEvaluated(false);
        } else if (justEvaluated) {
          insertText(action.value);
          setPrevLine('');
        } else {
          insertText(action.value);
        }
        break;
      case 'func':
        if (justEvaluated) {
          setExpression(action.value);
          setPrevLine('');
          setJustEvaluated(false);
        } else {
          insertText(action.value);
        }
        break;
      case 'postfix':
        setJustEvaluated(false);
        appendPostfix(action.value);
        break;
      case 'const':
        if (justEvaluated) {
          setExpression(action.value);
          setPrevLine('');
          setJustEvaluated(false);
        } else {
          insertText(action.value);
        }
        break;
      case 'base':
        convertBase(action.value);
        break;
      case 'clear':
        clearAll();
        break;
      case 'back':
        backspace();
        break;
      case 'equals':
        evaluate();
        break;
      case 'toggleSign':
        applyUnaryNow((v) => -v);
        break;
      case 'reciprocal':
        applyUnaryNow((v) => 1 / v);
        break;
      case 'percent':
        applyUnaryNow((v) => v / 100);
        break;
      case 'mc':
        memMC();
        break;
      case 'mr':
        memMR();
        break;
      case 'ms':
        memMS();
        break;
      case 'm+':
        memMPlus();
        break;
      case 'm-':
        memMMinus();
        break;
      default:
        break;
    }
  };

  // Global hardware keyboard listener
  useEffect(() => {
    const onKey = (e) => {
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes(e.target.tagName)) return;

      const k = e.key;
      if (/^[0-9]$/.test(k)) {
        handleAction({ type: 'digit', value: k });
        return;
      }
      if (['+', '-', '*', '/', '(', ')', '.', '%', '^', '!'].includes(k)) {
        const map = {
          '*': '*',
          '/': '/',
          '+': '+',
          '-': '-',
          '(': '(',
          ')': ')',
          '.': '.',
          '^': '^',
          '%': '%',
          '!': '!',
        };
        if (k === '!') handleAction({ type: 'postfix', value: '!' });
        else handleAction({ type: 'op', value: map[k] });
        return;
      }
      if (k === 'Enter' || k === '=') {
        e.preventDefault();
        handleAction({ type: 'equals' });
        return;
      }
      if (k === 'Backspace') {
        handleAction({ type: 'back' });
        return;
      }
      if (k === 'Escape') {
        handleAction({ type: 'clear' });
        return;
      }
      if (k.toLowerCase() === 's') handleAction({ type: 'func', value: 'sin(' });
      if (k.toLowerCase() === 'c') handleAction({ type: 'func', value: 'cos(' });
      if (k.toLowerCase() === 't') handleAction({ type: 'func', value: 'tan(' });
      if (k.toLowerCase() === 'l') handleAction({ type: 'func', value: 'log10(' });
      if (k.toLowerCase() === 'n') handleAction({ type: 'func', value: 'log(' });
      if (k.toLowerCase() === 'p') handleAction({ type: 'const', value: 'pi' });
      if (k.toLowerCase() === 'e' && !e.ctrlKey && !e.metaKey) handleAction({ type: 'const', value: 'e' });
      if (k.toLowerCase() === 'h') setShowHistoryDrawer((s) => !s);
      if (k.toLowerCase() === 'm' && !e.ctrlKey) setIsMuted((m) => !m);
      if (k === '?') setShowShortcuts((s) => !s);
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expression, justEvaluated, memory, isMuted]);

  const handleSelectHistory = (entry) => {
    setExpression(entry.result);
    setPrevLine(`${entry.expr} =`);
    setJustEvaluated(true);
    setShowHistoryDrawer(false);
    setActiveWorkspaceTab('calc');
  };

  return (
    <div className="w-full min-h-screen bg-[#090a0d] text-zinc-100 flex flex-col justify-between selection:bg-emerald-500/25 relative overflow-x-hidden">
      {/* Precision Instrument Subtle Grid Background */}
      <div className="fixed inset-0 bg-instrument-grid pointer-events-none z-0 opacity-40" />

      {/* Top Application Header */}
      <header className="relative z-20 w-full border-b border-white/[0.08] bg-[#0c0e12]/95 backdrop-blur-md px-2.5 sm:px-4 md:px-6 py-2">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-1 sm:gap-2">
          {/* Brand Identity with Authentic Logo */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <img
              src="/calcverse-logo.png"
              alt="CalcVerse Logo"
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg object-contain shadow-xs border border-white/[0.1] bg-black shrink-0"
            />
            <span className="font-sans-ui font-bold tracking-tight text-sm sm:text-base md:text-lg leading-none text-zinc-100">
              Calc<span className="text-emerald-400">Verse</span>
            </span>
          </div>

          {/* Center Workspace Tool Switcher */}
          <nav aria-label="Studio tools" className="flex items-center p-0.5 sm:p-1 rounded-xl border border-white/[0.08] bg-black/40 shrink-0">
            <button
              type="button"
              onClick={() => setActiveWorkspaceTab('calc')}
              className={`relative flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 rounded-lg text-xs font-mono font-medium transition-colors ${
                activeWorkspaceTab === 'calc' ? 'text-zinc-950 font-semibold' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {activeWorkspaceTab === 'calc' && (
                <motion.div
                  layoutId="activeWorkspaceTab"
                  transition={{ type: 'spring', damping: 24, stiffness: 350 }}
                  className="absolute inset-0 bg-emerald-400 rounded-lg shadow-xs"
                />
              )}
              <CalcIcon className="relative z-10 w-3.5 h-3.5" />
              <span className="relative z-10 hidden sm:inline">Calculator</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveWorkspaceTab('plotter')}
              className={`relative flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 rounded-lg text-xs font-mono font-medium transition-colors ${
                activeWorkspaceTab === 'plotter' ? 'text-zinc-950 font-semibold' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {activeWorkspaceTab === 'plotter' && (
                <motion.div
                  layoutId="activeWorkspaceTab"
                  transition={{ type: 'spring', damping: 24, stiffness: 350 }}
                  className="absolute inset-0 bg-emerald-400 rounded-lg shadow-xs"
                />
              )}
              <Activity className="relative z-10 w-3.5 h-3.5" />
              <span className="relative z-10 hidden sm:inline">Plotter</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveWorkspaceTab('converter')}
              className={`relative flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 rounded-lg text-xs font-mono font-medium transition-colors ${
                activeWorkspaceTab === 'converter' ? 'text-zinc-950 font-semibold' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {activeWorkspaceTab === 'converter' && (
                <motion.div
                  layoutId="activeWorkspaceTab"
                  transition={{ type: 'spring', damping: 24, stiffness: 350 }}
                  className="absolute inset-0 bg-emerald-400 rounded-lg shadow-xs"
                />
              )}
              <Compass className="relative z-10 w-3.5 h-3.5" />
              <span className="relative z-10 hidden sm:inline">Converter</span>
            </button>
          </nav>

          {/* Right Header Utilities */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            {/* History Toggle */}
            <button
              type="button"
              onClick={() => setShowHistoryDrawer((s) => !s)}
              aria-label="Toggle history ledger"
              className="flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-xl border border-white/[0.08] bg-white/[0.04] text-xs font-mono text-zinc-300 hover:text-zinc-100 hover:bg-white/[0.08] transition-colors"
              title="Calculation Ledger (H)"
            >
              <History className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[11px] font-medium hidden md:inline">Ledger</span>
              <span className="text-[10px] opacity-80 font-mono">({history.length})</span>
            </button>

            {/* Sound Toggle */}
            <button
              type="button"
              onClick={() => setIsMuted((m) => !m)}
              aria-label={isMuted ? 'Unmute sounds' : 'Mute sounds'}
              className="p-1 sm:p-1.5 rounded-xl border border-white/[0.08] bg-white/[0.04] text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.08] transition-colors"
              title={isMuted ? 'Unmute sounds (M)' : 'Mute sounds (M)'}
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
            </button>

            {/* Shortcuts Modal Trigger (Hardware keyboard reference for desktop/tablet) */}
            <button
              type="button"
              onClick={() => setShowShortcuts(true)}
              aria-label="Keyboard shortcuts"
              className="hidden sm:flex p-1 sm:p-1.5 rounded-xl border border-white/[0.08] bg-white/[0.04] text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.08] transition-colors"
              title="Keyboard shortcuts (?)"
            >
              <Keyboard className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace Stage */}
      <main className="relative z-10 flex-1 w-full max-w-6xl mx-auto px-3 sm:px-4 py-3 sm:py-5 flex flex-col justify-center">
        <AnimatePresence mode="wait">
          {activeWorkspaceTab === 'calc' && (
            <motion.div
              key="workspace-calc"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.16 }}
              className="w-full flex flex-col justify-center"
            >
              {/* Dual-Column Grid on Desktop / Single-Column on Mobile & Tablet */}
              <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch justify-center">
                {/* Primary Calculator Column */}
                <div className="lg:col-span-8 flex flex-col gap-2.5 max-w-[480px] w-full mx-auto lg:max-w-none">
                  {/* Mode Pill Switcher Bar */}
                  <div className="w-full flex items-center justify-between pb-0.5">
                    <div className="flex items-center p-0.5 rounded-xl border border-white/[0.08] bg-[#111319]">
                      <button
                        type="button"
                        onClick={() => setCalcMode('scientific')}
                        className={`relative px-3 py-1 rounded-lg text-xs font-calc-btn font-medium transition-colors ${
                          calcMode === 'scientific' ? 'text-zinc-950 font-semibold' : 'text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        {calcMode === 'scientific' && (
                          <motion.div
                            layoutId="calcModePill"
                            transition={{ type: 'spring', damping: 24, stiffness: 350 }}
                            className="absolute inset-0 bg-emerald-400 rounded-lg shadow-xs"
                          />
                        )}
                        <span className="relative z-10">Scientific</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setCalcMode('standard')}
                        className={`relative px-3 py-1 rounded-lg text-xs font-calc-btn font-medium transition-colors ${
                          calcMode === 'standard' ? 'text-zinc-950 font-semibold' : 'text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        {calcMode === 'standard' && (
                          <motion.div
                            layoutId="calcModePill"
                            transition={{ type: 'spring', damping: 24, stiffness: 350 }}
                            className="absolute inset-0 bg-emerald-400 rounded-lg shadow-xs"
                          />
                        )}
                        <span className="relative z-10">Standard</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setCalcMode('programmer')}
                        className={`relative px-3 py-1 rounded-lg text-xs font-calc-btn font-medium transition-colors ${
                          calcMode === 'programmer' ? 'text-zinc-950 font-semibold' : 'text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        {calcMode === 'programmer' && (
                          <motion.div
                            layoutId="calcModePill"
                            transition={{ type: 'spring', damping: 24, stiffness: 350 }}
                            className="absolute inset-0 bg-emerald-400 rounded-lg shadow-xs"
                          />
                        )}
                        <span className="relative z-10">Programmer</span>
                      </button>
                    </div>

                    <span className="text-[10px] font-mono text-zinc-500 hidden sm:inline">
                      {calcMode === 'scientific' ? 'Trig & Transcendental' : calcMode === 'programmer' ? 'Bitwise & Radix' : 'Four-Function'}
                    </span>
                  </div>

                  {/* Calculator Display */}
                  <CalculatorDisplay
                    expression={expression}
                    prevLine={prevLine}
                    error={error}
                    livePreview={livePreview}
                    angleMode={angleMode}
                    memory={memory}
                    inv={inv}
                    theme={theme}
                  />

                  {/* Calculator Keypad Housing */}
                  <div className={`p-2.5 sm:p-3.5 rounded-2xl border ${theme.panelBorder} ${theme.panel} shadow-xl`}>
                    <Keypad
                      mode={calcMode}
                      inv={inv}
                      angleMode={angleMode}
                      isMuted={isMuted}
                      memory={memory}
                      theme={theme}
                      onAction={handleAction}
                      onToggleAngle={() => setAngleMode((m) => (m === 'DEG' ? 'RAD' : 'DEG'))}
                      onToggleInv={() => setInv((v) => !v)}
                    />
                  </div>
                </div>

                {/* Desktop Embedded History Ledger Notebook */}
                <div className="hidden lg:block lg:col-span-4 h-full min-h-[460px] max-h-[580px]">
                  <HistoryDrawer
                    isOpen={true}
                    isEmbedded={true}
                    history={history}
                    onSelectEntry={handleSelectHistory}
                    onDeleteEntry={(id) => setHistory((h) => h.filter((x) => x.id !== id))}
                    onClearHistory={() => setHistory([])}
                    theme={theme}
                  />
                </div>
              </div>
            </motion.div>
          )}

          {activeWorkspaceTab === 'plotter' && (
            <motion.div
              key="workspace-plotter"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.16 }}
              className="w-full"
            >
              <PlotterSection
                theme={theme}
                onInsertFunction={(fn) => {
                  insertText(fn);
                  setActiveWorkspaceTab('calc');
                }}
              />
            </motion.div>
          )}

          {activeWorkspaceTab === 'converter' && (
            <motion.div
              key="workspace-converter"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.16 }}
              className="w-full"
            >
              <UnitConverterSection
                theme={theme}
                onSendToCalculator={(val) => {
                  setExpression(val);
                  setPrevLine('');
                  setJustEvaluated(true);
                  setActiveWorkspaceTab('calc');
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer Colophon */}
      <footer className="relative z-10 w-full py-2.5 px-4 text-center border-t border-white/[0.04]">
        <p className="text-[11px] font-mono text-zinc-500">
          CalcVerse • Precision Obsidian Mathematical Studio
        </p>
      </footer>

      {/* Slide-over History Drawer for Mobile / Tablet / Quick Trigger */}
      <HistoryDrawer
        isOpen={showHistoryDrawer}
        isEmbedded={false}
        onClose={() => setShowHistoryDrawer(false)}
        history={history}
        onSelectEntry={handleSelectHistory}
        onDeleteEntry={(id) => setHistory((h) => h.filter((x) => x.id !== id))}
        onClearHistory={() => setHistory([])}
        theme={theme}
      />

      {/* Keyboard Shortcuts Modal */}
      <KeyboardModal
        isOpen={showShortcuts}
        onClose={() => setShowShortcuts(false)}
        theme={theme}
      />
    </div>
  );
}

export default function CalcVerse() {
  return <CalcVerseContent />;
}
