import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import * as math from 'mathjs';
import { Activity, ZoomIn, ZoomOut, RotateCcw, Send } from 'lucide-react';

const PRESET_FUNCTIONS = [
  { label: 'sin(x)', expr: 'sin(x)' },
  { label: 'cos(x)', expr: 'cos(x)' },
  { label: 'x²', expr: 'x^2' },
  { label: 'x³ − 3x', expr: 'x^3 - 3*x' },
  { label: '1/x', expr: '1/x' },
  { label: 'e^(−x²)', expr: 'exp(-x^2)' },
  { label: 'tan(x)', expr: 'tan(x)' },
  { label: '|x|', expr: 'abs(x)' },
];

export function PlotterSection({ theme, onInsertFunction }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [exprInput, setExprInput] = useState('sin(x)');
  const [zoom, setZoom] = useState(10); // Domain from -zoom to +zoom
  const [hoverCoord, setHoverCoord] = useState(null);

  const { compiled, plotError } = useMemo(() => {
    try {
      const c = math.compile(exprInput);
      return { compiled: c, plotError: null };
    } catch {
      return { compiled: null, plotError: 'Invalid function syntax' };
    }
  }, [exprInput]);

  const drawPlot = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.clientWidth || 600;
    const height = canvas.clientHeight || 300;

    const dpr = window.devicePixelRatio || 1;
    if (canvas.width !== Math.floor(width * dpr) || canvas.height !== Math.floor(height * dpr)) {
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
    }

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);

    // Coordinate mapping
    const originX = width / 2;
    const originY = height / 2;
    const scaleX = width / (2 * zoom);
    const scaleY = height / (2 * zoom);

    // Draw Subtle Precision Grid Lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;

    const step = zoom <= 5 ? 1 : zoom <= 15 ? 2 : 5;
    for (let x = -zoom; x <= zoom; x += step) {
      const px = originX + x * scaleX;
      ctx.beginPath();
      ctx.moveTo(px, 0);
      ctx.lineTo(px, height);
      ctx.stroke();
    }
    for (let y = -zoom; y <= zoom; y += step) {
      const py = originY - y * scaleY;
      ctx.beginPath();
      ctx.moveTo(0, py);
      ctx.lineTo(width, py);
      ctx.stroke();
    }

    // Draw Main Cartesian Axes
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)';
    ctx.lineWidth = 1.25;

    // X-Axis
    ctx.beginPath();
    ctx.moveTo(0, originY);
    ctx.lineTo(width, originY);
    ctx.stroke();

    // Y-Axis
    ctx.beginPath();
    ctx.moveTo(originX, 0);
    ctx.lineTo(originX, height);
    ctx.stroke();

    // Axis coordinate boundary labels
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.font = '10px "Geist Mono", monospace';
    ctx.fillText(`−${zoom}`, 6, originY - 6);
    ctx.fillText(`+${zoom}`, width - 28, originY - 6);
    ctx.fillText(`+${zoom}`, originX + 6, 14);
    ctx.fillText(`−${zoom}`, originX + 6, height - 6);

    // Origin indicator
    ctx.fillText('0', originX - 10, originY + 12);

    if (compiled) {
      // Plot curve with subtle emerald glow
      ctx.shadowColor = 'rgba(16, 185, 129, 0.35)';
      ctx.shadowBlur = 4;
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 2.25;
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      ctx.beginPath();

      let isDrawing = false;
      const numSteps = Math.min(width * 2, 900);

      for (let i = 0; i <= numSteps; i++) {
        const px = (i / numSteps) * width;
        const x = (px - originX) / scaleX;

        try {
          const y = compiled.evaluate({ x });
          if (typeof y !== 'number' || isNaN(y) || !isFinite(y) || Math.abs(y) > zoom * 6) {
            isDrawing = false;
            continue;
          }

          const py = originY - y * scaleY;

          if (!isDrawing) {
            ctx.moveTo(px, py);
            isDrawing = true;
          } else {
            ctx.lineTo(px, py);
          }
        } catch {
          isDrawing = false;
        }
      }
      ctx.stroke();
    }

    ctx.restore();
  }, [compiled, zoom]);

  // Handle ResizeObserver and render
  useEffect(() => {
    drawPlot();

    const container = containerRef.current;
    if (!container) return;

    const ro = new ResizeObserver(() => {
      drawPlot();
    });
    ro.observe(container);

    return () => ro.disconnect();
  }, [drawPlot]);

  // Handle mouse move on canvas for live coordinate readout
  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas || !compiled) return;
    const rect = canvas.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const width = rect.width;
    const originX = width / 2;
    const scaleX = width / (2 * zoom);
    const x = (px - originX) / scaleX;

    try {
      const y = compiled.evaluate({ x });
      if (typeof y === 'number' && !isNaN(y) && isFinite(y)) {
        setHoverCoord({ x: x.toFixed(2), y: y.toFixed(2) });
      } else {
        setHoverCoord(null);
      }
    } catch {
      setHoverCoord(null);
    }
  };

  const handleMouseLeave = () => {
    setHoverCoord(null);
  };

  return (
    <div
      id="function-plotter"
      className="w-full max-w-4xl mx-auto px-3 sm:px-4 py-3 flex flex-col gap-3"
    >
      {/* Visualizer Panel Container */}
      <div className={`w-full rounded-2xl border ${theme.panelBorder} ${theme.panel} p-4 sm:p-5 shadow-lg flex flex-col gap-3.5`}>
        {/* Header & Controls Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 pb-2.5 border-b border-white/[0.06]">
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-xl ${theme.badgeBg} ${theme.accent} border ${theme.panelBorderSubtle}`}>
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <h2 className={`text-sm sm:text-base font-semibold tracking-tight ${theme.text}`}>
                Cartesian Function Plotter
              </h2>
              <p className={`text-[11px] font-mono text-zinc-400 mt-0.5`}>
                Real-time continuous 2D mathematical curve visualizer
              </p>
            </div>
          </div>

          {/* Zoom & View Controls */}
          <div className="flex items-center gap-1.5 self-end sm:self-center">
            {hoverCoord && (
              <span className="hidden sm:inline px-2 py-0.5 rounded-md text-[10px] font-mono text-emerald-400 border border-emerald-500/25 bg-emerald-500/10 mr-1">
                x: {hoverCoord.x}, y: {hoverCoord.y}
              </span>
            )}
            <button
              type="button"
              onClick={() => setZoom((z) => Math.max(2, z - 2))}
              aria-label="Zoom in"
              className={`p-1.5 rounded-lg border ${theme.panelBorder} text-zinc-300 hover:text-zinc-100 hover:bg-white/[0.06] transition-colors`}
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setZoom((z) => Math.min(30, z + 2))}
              aria-label="Zoom out"
              className={`p-1.5 rounded-lg border ${theme.panelBorder} text-zinc-300 hover:text-zinc-100 hover:bg-white/[0.06] transition-colors`}
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setZoom(10)}
              aria-label="Reset zoom"
              className={`p-1.5 rounded-lg border ${theme.panelBorder} text-zinc-300 hover:text-zinc-100 hover:bg-white/[0.06] transition-colors`}
              title="Reset Zoom ([-10, 10])"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Function Presets Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-0.5 text-xs">
          <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider shrink-0 mr-1">
            Presets:
          </span>
          {PRESET_FUNCTIONS.map((p) => (
            <button
              key={p.expr}
              type="button"
              onClick={() => setExprInput(p.expr)}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono border transition-all shrink-0 ${
                exprInput === p.expr
                  ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/35 font-medium'
                  : 'border-white/[0.06] text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Expression Input Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <div className="relative flex-1 flex items-center">
            <span className="absolute left-3 font-mono text-xs text-emerald-400 font-semibold select-none">
              f(x) =
            </span>
            <input
              type="text"
              value={exprInput}
              onChange={(e) => setExprInput(e.target.value)}
              placeholder="e.g. sin(x) + cos(2*x)"
              aria-label="Function expression to plot"
              className={`w-full pl-12 pr-3 py-1.5 rounded-xl border ${theme.panelBorder} font-mono-math text-xs sm:text-sm outline-none bg-black/40 text-zinc-100 focus:border-emerald-500/60 transition-colors`}
            />
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {plotError && (
              <span className="text-[11px] font-mono text-rose-400 whitespace-nowrap">
                {plotError}
              </span>
            )}
            {onInsertFunction && (
              <button
                type="button"
                onClick={() => onInsertFunction(exprInput)}
                className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-medium bg-emerald-500 text-zinc-950 hover:bg-emerald-400 transition-colors shrink-0"
                title="Send formula into main calculator expression"
              >
                <Send className="w-3.5 h-3.5" />
                <span>To Calc</span>
              </button>
            )}
          </div>
        </div>

        {/* Plot Canvas Stage */}
        <div
          ref={containerRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="relative w-full h-56 sm:h-72 md:h-80 lg:h-96 rounded-xl border border-white/[0.08] bg-[#090a0e] overflow-hidden flex items-center justify-center shadow-inner"
        >
          <canvas ref={canvasRef} className="w-full h-full block cursor-crosshair" />

          {/* Canvas Sub-Badges */}
          <div className="absolute bottom-2 left-2.5 font-mono text-[10px] text-zinc-500 pointer-events-none bg-black/50 px-1.5 py-0.5 rounded border border-white/5">
            Domain: [−{zoom}, +{zoom}]
          </div>

          {hoverCoord && (
            <div className="sm:hidden absolute top-2 right-2.5 font-mono text-[10px] text-emerald-400 bg-black/60 px-1.5 py-0.5 rounded border border-emerald-500/20 pointer-events-none">
              x: {hoverCoord.x}, y: {hoverCoord.y}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

