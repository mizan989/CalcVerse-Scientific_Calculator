import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function CalculatorDisplay({
  expression,
  prevLine,
  error,
  livePreview,
  angleMode,
  memory,
  inv,
  theme,
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const textToCopy = error ? '' : (expression || '0');
    if (!textToCopy) return;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    }
  };

  const displayText = error ? error : (expression || '0');
  const textLength = displayText.length;

  // Responsive font size calculation to prevent clipping of long expressions
  let fontClasses = 'text-2xl sm:text-3xl md:text-4xl';
  if (textLength > 20) {
    fontClasses = 'text-base sm:text-lg md:text-xl';
  } else if (textLength > 12) {
    fontClasses = 'text-xl sm:text-2xl md:text-3xl';
  }

  return (
    <div className={`relative w-full rounded-2xl border ${theme.panelBorder} ${theme.displayBg} p-3 sm:p-4 shadow-inner flex flex-col justify-between transition-colors duration-150 group`}>
      {/* Top Status & Register Badges Bar */}
      <div className="flex items-center justify-between gap-2 min-h-[22px] mb-1">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span
            className={`px-1.5 py-0.5 rounded text-[10px] font-mono-math tracking-wider border transition-colors ${
              angleMode === 'DEG' ? theme.activeBadge : theme.idleBadge
            }`}
          >
            {angleMode}
          </span>
          {inv && (
            <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono-math tracking-wider border ${theme.activeBadge}`}>
              INV
            </span>
          )}
          {memory !== null && (
            <span
              className={`px-1.5 py-0.5 rounded text-[10px] font-mono-math tracking-wider border ${theme.activeBadge}`}
              title={`Memory Register: ${memory}`}
            >
              M: {typeof memory === 'number' ? Number(memory.toFixed(4)) : memory}
            </span>
          )}
        </div>

        {/* Copy Trigger */}
        <button
          type="button"
          onClick={handleCopy}
          aria-label="Copy current value"
          className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-calc-btn transition-all duration-150 border ${theme.panelBorderSubtle} ${
            copied
              ? 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30'
              : `${theme.subtext} hover:${theme.text} hover:bg-white/[0.06]`
          }`}
          title="Copy value to clipboard"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-emerald-400" />
              <span className="text-[10px] font-medium text-emerald-400">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3 opacity-60 group-hover:opacity-100 transition-opacity" />
              <span className="text-[10px] opacity-75 hidden xs:inline">Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Expression / Previous Calculation Trail */}
      <div className="min-h-[18px] flex items-center justify-end overflow-hidden mb-1">
        <AnimatePresence mode="wait">
          {prevLine && !error ? (
            <motion.div
              key={prevLine}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.65 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className={`text-right font-mono-math text-xs sm:text-[13px] ${theme.subtext} truncate max-w-full`}
            >
              {prevLine}
            </motion.div>
          ) : (
            <div className="h-[18px]" />
          )}
        </AnimatePresence>
      </div>

      {/* Primary Instrument Output Display */}
      <div className="relative flex items-baseline justify-end min-h-[38px] sm:min-h-[48px] overflow-x-auto overflow-y-hidden py-0.5 scrollbar-none">
        <div
          className={`font-mono-math font-light tracking-tight text-right leading-none whitespace-nowrap select-all transition-all duration-150 ${fontClasses} ${
            error ? 'text-rose-400 font-normal' : theme.text
          }`}
        >
          {displayText}
        </div>

        {/* Precision Caret */}
        {!error && (
          <span
            className={`inline-block w-[2px] h-5 sm:h-7 ml-1 rounded-full ${theme.caret} animate-pulse shrink-0 self-center`}
            aria-hidden="true"
          />
        )}
      </div>

      {/* Live Preview Instant Evaluation Footnote */}
      <div className="min-h-[16px] flex items-center justify-end mt-1">
        {!error && livePreview && livePreview !== expression && (
          <div className={`flex items-center gap-1 font-mono-math text-[11px] sm:text-xs font-normal ${theme.previewText}`}>
            <span className="opacity-40 text-[10px] font-mono">≈</span>
            <span>{livePreview}</span>
          </div>
        )}
      </div>
    </div>
  );
}

