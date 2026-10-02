import { useState } from 'react';
import { History, Copy, Trash2, X, Check, Download, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function HistoryDrawer({
  isOpen,
  onClose,
  history = [],
  onSelectEntry,
  onDeleteEntry,
  onClearHistory,
  theme,
  isEmbedded = false,
}) {
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  const filteredHistory = history.filter(
    (item) =>
      item.expr.toLowerCase().includes(search.toLowerCase()) ||
      item.result.toLowerCase().includes(search.toLowerCase())
  );

  const handleCopy = (e, item) => {
    e.stopPropagation();
    const txt = `${item.expr} = ${item.result}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(txt);
      setCopiedId(item.id);
      setTimeout(() => setCopiedId(null), 1400);
    }
  };

  const handleExport = () => {
    if (history.length === 0) return;
    const content = history
      .map(
        (h, i) =>
          `[${i + 1}] ${h.expr} = ${h.result} (${new Date(h.timestamp || Date.now()).toLocaleTimeString()})`
      )
      .join('\n');
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `calcverse-history-${new Date().toISOString().slice(0, 10)}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const content = (
    <div className="flex flex-col h-full min-h-0 bg-[#0e1015]">
      {/* Header */}
      <div className={`flex items-center justify-between px-3.5 py-3 border-b ${theme.panelBorder} shrink-0`}>
        <div className="flex items-center gap-2 min-w-0">
          <History className={`w-4 h-4 ${theme.accent} shrink-0`} />
          <span className={`font-mono text-xs sm:text-sm font-semibold tracking-tight ${theme.text} truncate`}>
            Calculation Ledger
          </span>
          <span
            className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${theme.badgeBg} ${theme.badgeText} shrink-0`}
          >
            {history.length}
          </span>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {history.length > 0 && (
            <button
              type="button"
              onClick={handleExport}
              title="Export history log"
              aria-label="Export history log"
              className={`p-1.5 rounded-lg text-xs font-mono ${theme.subtext} hover:${theme.text} hover:bg-white/[0.06] transition-colors`}
            >
              <Download className="w-3.5 h-3.5" />
            </button>
          )}
          {history.length > 0 && (
            <button
              type="button"
              onClick={onClearHistory}
              title="Clear all history"
              aria-label="Clear all history"
              className={`p-1.5 rounded-lg text-xs font-mono text-rose-400 hover:text-rose-300 hover:bg-rose-500/15 transition-colors`}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
          {!isEmbedded && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close history ledger"
              className={`p-1.5 rounded-lg ${theme.subtext} hover:${theme.text} hover:bg-white/[0.06] transition-colors`}
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Search Bar */}
      {history.length > 3 && (
        <div className={`px-3 py-2 border-b ${theme.panelBorder} shrink-0`}>
          <div className="relative flex items-center">
            <Search className={`absolute left-2.5 w-3.5 h-3.5 ${theme.subtext} pointer-events-none`} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search expressions & results..."
              aria-label="Search expressions"
              className={`w-full pl-8 pr-7 py-1 text-xs rounded-lg font-mono outline-none border ${theme.panelBorder} bg-black/40 ${theme.text} placeholder:opacity-40 focus:border-emerald-500/50`}
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-2 text-zinc-500 hover:text-zinc-200"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* History Items List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1.5 scrollbar-none">
        {history.length === 0 && (
          <div className="flex flex-col items-center justify-center h-48 text-center p-4">
            <History className={`w-7 h-7 ${theme.subtext} opacity-20 mb-2`} />
            <p className={`text-xs font-mono ${theme.text} font-medium`}>Ledger is empty</p>
            <p className={`text-[11px] ${theme.subtext} mt-1 max-w-[200px]`}>
              Evaluated expressions and calculations will record here.
            </p>
          </div>
        )}

        {history.length > 0 && filteredHistory.length === 0 && (
          <p className={`text-xs font-mono ${theme.subtext} text-center py-8`}>
            No entries match "{search}"
          </p>
        )}

        <AnimatePresence>
          {filteredHistory.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.14 }}
              onClick={() => onSelectEntry(item)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') onSelectEntry(item);
              }}
              title="Click to restore this calculation into the display"
              className={`group relative p-2.5 rounded-xl border border-white/[0.05] hover:border-emerald-500/30 bg-[#12141a]/60 hover:bg-[#161922] cursor-pointer transition-all duration-120 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-400/50`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 text-[10px] font-mono text-zinc-500 mb-0.5">
                    <span>{item.timestamp ? new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : ''}</span>
                  </div>
                  <p className={`text-xs font-mono-math ${theme.subtext} truncate`}>{item.expr}</p>
                  <p className={`text-sm font-mono-math font-medium text-emerald-400 truncate mt-0.5`}>
                    = {item.result}
                  </p>
                </div>

                {/* Mobile visible, desktop hover-revealed action buttons */}
                <div className="flex items-center gap-1 opacity-80 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity shrink-0 self-center">
                  <button
                    type="button"
                    onClick={(e) => handleCopy(e, item)}
                    title="Copy calculation"
                    aria-label="Copy calculation"
                    className={`p-1.5 rounded-md ${theme.subtext} hover:${theme.text} hover:bg-white/10 transition-colors`}
                  >
                    {copiedId === item.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteEntry(item.id);
                    }}
                    title="Delete entry"
                    aria-label="Delete entry"
                    className="p-1.5 rounded-md text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );

  if (isEmbedded) {
    return (
      <div className={`w-full h-full rounded-2xl border ${theme.panelBorder} overflow-hidden shadow-xs`}>
        {content}
      </div>
    );
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/70 backdrop-blur-xs"
          />

          {/* Drawer Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className={`relative z-10 w-full max-w-[340px] sm:max-w-sm h-full border-l ${theme.panelBorder} shadow-2xl flex flex-col`}
          >
            {content}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

