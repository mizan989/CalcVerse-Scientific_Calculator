import { useEffect } from 'react';
import { Keyboard, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SHORTCUT_GROUPS = [
  {
    title: 'Basic Arithmetic',
    items: [
      { key: '0 – 9', desc: 'Input digits' },
      { key: '+ − * /', desc: 'Operators' },
      { key: 'Enter or =', desc: 'Evaluate' },
      { key: 'Backspace', desc: 'Delete' },
      { key: 'Esc', desc: 'Clear all (AC)' },
      { key: '.', desc: 'Decimal point' },
      { key: '%', desc: 'Percentage' },
      { key: '( )', desc: 'Parentheses' },
    ],
  },
  {
    title: 'Functions & Math',
    items: [
      { key: 'S', desc: 'sin(x)' },
      { key: 'C', desc: 'cos(x)' },
      { key: 'T', desc: 'tan(x)' },
      { key: 'L', desc: 'log₁₀(x)' },
      { key: 'N', desc: 'ln(x) natural log' },
      { key: '^', desc: 'Power (xʸ)' },
      { key: '!', desc: 'Factorial (n!)' },
      { key: 'P', desc: 'Pi constant (π)' },
      { key: 'E', desc: "Euler's constant (e)" },
    ],
  },
  {
    title: 'Shortcuts & Controls',
    items: [
      { key: 'H', desc: 'Toggle history ledger' },
      { key: 'M', desc: 'Toggle sound effects' },
      { key: 'Esc', desc: 'Close dialog / drawer' },
      { key: 'Tab', desc: 'Focus next control' },
    ],
  },
];

export function KeyboardModal({ isOpen, onClose, theme }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isOpen && e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/75 backdrop-blur-xs"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
            className={`relative z-10 w-full max-w-2xl max-h-[85vh] rounded-2xl border ${theme.panelBorder} ${theme.panel} shadow-2xl p-4 sm:p-6 overflow-hidden flex flex-col bg-[#101217]`}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 sm:pb-4 mb-3 border-b border-white/[0.08] shrink-0">
              <div className="flex items-center gap-2.5">
                <div className={`p-2 rounded-xl bg-white/[0.05] text-emerald-400 border border-white/[0.06]`}>
                  <Keyboard className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div>
                  <h3 className={`text-sm sm:text-base font-semibold tracking-tight ${theme.text}`}>
                    Hardware Keyboard Shortcuts
                  </h3>
                  <p className={`text-[11px] sm:text-xs text-zinc-400 font-mono mt-0.5`}>
                    Direct hardware keybindings for rapid calculation
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="Close shortcuts modal"
                className={`p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.06] transition-colors`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Shortcut Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 overflow-y-auto pr-1 scrollbar-none flex-1">
              {SHORTCUT_GROUPS.map((group) => (
                <div key={group.title} className="space-y-2">
                  <h4 className="text-[11px] font-mono font-semibold uppercase tracking-wider text-emerald-400">
                    {group.title}
                  </h4>
                  <div className="space-y-1.5">
                    {group.items.map((item) => (
                      <div
                        key={item.key}
                        className={`flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg border border-white/[0.05] bg-black/40 text-xs`}
                      >
                        <span className="font-mono text-zinc-300 text-[11px] truncate">{item.desc}</span>
                        <kbd className="px-1.5 py-0.5 rounded font-mono font-semibold text-[10px] sm:text-[11px] border border-white/[0.1] bg-white/[0.06] text-zinc-200 shadow-xs shrink-0">
                          {item.key}
                        </kbd>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

