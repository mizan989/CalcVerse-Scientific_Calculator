import { useState } from 'react';
import { ArrowRightLeft, Send, Copy, Check, Scale, Ruler, Thermometer, HardDrive, Gauge, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const UNITS_DATA = {
  length: {
    name: 'Length',
    icon: Ruler,
    base: 'm',
    rates: {
      m: 1,
      km: 1000,
      cm: 0.01,
      mm: 0.001,
      mi: 1609.344,
      yd: 0.9144,
      ft: 0.3048,
      in: 0.0254,
    },
    labels: {
      m: 'Meters (m)',
      km: 'Kilometers (km)',
      cm: 'Centimeters (cm)',
      mm: 'Millimeters (mm)',
      mi: 'Miles (mi)',
      yd: 'Yards (yd)',
      ft: 'Feet (ft)',
      in: 'Inches (in)',
    },
  },
  mass: {
    name: 'Mass & Weight',
    icon: Scale,
    base: 'kg',
    rates: {
      kg: 1,
      g: 0.001,
      mg: 0.000001,
      lb: 0.45359237,
      oz: 0.028349523125,
      t: 1000,
    },
    labels: {
      kg: 'Kilograms (kg)',
      g: 'Grams (g)',
      mg: 'Milligrams (mg)',
      lb: 'Pounds (lb)',
      oz: 'Ounces (oz)',
      t: 'Metric Tonnes (t)',
    },
  },
  temperature: {
    name: 'Temperature',
    icon: Thermometer,
    isSpecial: true,
    units: ['C', 'F', 'K'],
    labels: {
      C: 'Celsius (°C)',
      F: 'Fahrenheit (°F)',
      K: 'Kelvin (K)',
    },
  },
  data: {
    name: 'Digital Data',
    icon: HardDrive,
    base: 'B',
    rates: {
      B: 1,
      KB: 1024,
      MB: 1024 ** 2,
      GB: 1024 ** 3,
      TB: 1024 ** 4,
      PB: 1024 ** 5,
    },
    labels: {
      B: 'Bytes (B)',
      KB: 'Kilobytes (KB)',
      MB: 'Megabytes (MB)',
      GB: 'Gigabytes (GB)',
      TB: 'Terabytes (TB)',
      PB: 'Petabytes (PB)',
    },
  },
  speed: {
    name: 'Speed',
    icon: Gauge,
    base: 'mps',
    rates: {
      mps: 1,
      kmh: 0.277778,
      mph: 0.44704,
      knot: 0.514444,
      mach: 340.29,
    },
    labels: {
      mps: 'Meters/sec (m/s)',
      kmh: 'Kilometers/hr (km/h)',
      mph: 'Miles/hr (mph)',
      knot: 'Knots (kn)',
      mach: 'Mach (at sea lvl)',
    },
  },
  time: {
    name: 'Time',
    icon: Clock,
    base: 's',
    rates: {
      ms: 0.001,
      s: 1,
      min: 60,
      hr: 3600,
      day: 86400,
      wk: 604800,
      yr: 31536000,
    },
    labels: {
      ms: 'Milliseconds (ms)',
      s: 'Seconds (s)',
      min: 'Minutes (min)',
      hr: 'Hours (hr)',
      day: 'Days (d)',
      wk: 'Weeks (wk)',
      yr: 'Years (yr)',
    },
  },
};

export function UnitConverterSection({ theme, onSendToCalculator }) {
  const [category, setCategory] = useState('length');
  const [fromUnit, setFromUnit] = useState('m');
  const [toUnit, setToUnit] = useState('ft');
  const [inputValue, setInputValue] = useState('10');
  const [copied, setCopied] = useState(false);

  const catData = UNITS_DATA[category];

  const handleCategoryChange = (catKey) => {
    setCategory(catKey);
    const data = UNITS_DATA[catKey];
    if (data.isSpecial) {
      setFromUnit('C');
      setToUnit('F');
    } else {
      const keys = Object.keys(data.rates);
      setFromUnit(keys[0]);
      setToUnit(keys[1] || keys[0]);
    }
  };

  const swapUnits = () => {
    setFromUnit(toUnit);
    setToUnit(fromUnit);
  };

  // Convert calculation
  const calculateResult = () => {
    const val = parseFloat(inputValue);
    if (isNaN(val)) return '—';

    if (category === 'temperature') {
      let celsius = val;
      if (fromUnit === 'F') celsius = ((val - 32) * 5) / 9;
      if (fromUnit === 'K') celsius = val - 273.15;

      let target = celsius;
      if (toUnit === 'F') target = (celsius * 9) / 5 + 32;
      if (toUnit === 'K') target = celsius + 273.15;

      return Number(target.toFixed(6)).toString();
    }

    const rates = catData.rates;
    if (!rates[fromUnit] || !rates[toUnit]) return '0';
    const baseValue = val * rates[fromUnit];
    const targetValue = baseValue / rates[toUnit];

    if (Math.abs(targetValue) < 1e-6 && targetValue !== 0) {
      return targetValue.toExponential(4);
    }
    return Number(targetValue.toFixed(8)).toString();
  };

  const convertedResult = calculateResult();

  const handleCopy = () => {
    if (convertedResult && convertedResult !== '—') {
      navigator.clipboard.writeText(convertedResult);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    }
  };

  const handleSend = () => {
    if (convertedResult && convertedResult !== '—' && onSendToCalculator) {
      onSendToCalculator(convertedResult);
    }
  };

  return (
    <div
      id="unit-converter"
      className="w-full max-w-4xl mx-auto px-3 sm:px-4 py-3 flex flex-col gap-3"
    >
      {/* Converter Panel */}
      <div className={`w-full rounded-2xl border ${theme.panelBorder} ${theme.panel} p-4 sm:p-5 shadow-lg flex flex-col gap-4`}>
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 pb-2.5 border-b border-white/[0.06]">
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-xl ${theme.badgeBg} ${theme.accent} border ${theme.panelBorderSubtle}`}>
              <ArrowRightLeft className="w-4 h-4" />
            </div>
            <div>
              <h2 className={`text-sm sm:text-base font-semibold tracking-tight ${theme.text}`}>
                Dimensional Unit Converter
              </h2>
              <p className={`text-[11px] font-mono text-zinc-400 mt-0.5`}>
                Precision bi-directional engineering and scientific conversions
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 self-end sm:self-center">
            <button
              type="button"
              onClick={handleCopy}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono border ${theme.panelBorder} text-zinc-300 hover:text-zinc-100 hover:bg-white/[0.06] transition-colors`}
              title="Copy converted value"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
            {onSendToCalculator && (
              <button
                type="button"
                onClick={handleSend}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono font-medium bg-emerald-500 text-zinc-950 hover:bg-emerald-400 transition-colors"
                title="Send converted result to calculator"
              >
                <Send className="w-3.5 h-3.5" />
                <span>To Calc</span>
              </button>
            )}
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1">
          {Object.entries(UNITS_DATA).map(([key, item]) => {
            const Icon = item.icon;
            const isActive = category === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => handleCategoryChange(key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono transition-all duration-150 whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/35 font-medium shadow-xs'
                    : 'bg-[#12141a]/60 border-white/[0.06] text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span>{item.name}</span>
              </button>
            );
          })}
        </div>

        {/* Input & Output Conversion Grid */}
        <div className="grid grid-cols-1 md:grid-cols-9 gap-3 items-center pt-1">
          {/* Source Input */}
          <div className="md:col-span-4 flex flex-col gap-1.5">
            <label className="text-[11px] font-mono text-zinc-400">
              Source Value
            </label>
            <input
              type="number"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              aria-label="Value to convert"
              className={`w-full px-3.5 py-2 rounded-xl border ${theme.panelBorder} font-mono-math text-base outline-none bg-black/40 text-zinc-100 focus:border-emerald-500/60 transition-colors`}
            />
            <select
              value={fromUnit}
              onChange={(e) => setFromUnit(e.target.value)}
              aria-label="Source unit"
              className={`w-full px-3 py-1.5 rounded-xl border ${theme.panelBorder} font-mono text-xs outline-none bg-[#14161f] text-zinc-200 focus:border-emerald-500/60`}
            >
              {Object.entries(catData.labels).map(([uKey, uLabel]) => (
                <option key={`from-${uKey}`} value={uKey} className="bg-zinc-900 text-zinc-100">
                  {uLabel}
                </option>
              ))}
            </select>
          </div>

          {/* Swap Trigger */}
          <div className="md:col-span-1 flex justify-center py-0.5 md:py-0">
            <button
              type="button"
              onClick={swapUnits}
              aria-label="Swap units"
              className="p-2 rounded-xl border border-white/[0.08] bg-[#14161f] text-zinc-300 hover:text-emerald-400 hover:border-emerald-500/30 hover:scale-105 active:scale-95 transition-all shadow-sm"
              title="Swap source and target units"
            >
              <ArrowRightLeft className="w-4 h-4" />
            </button>
          </div>

          {/* Converted Output */}
          <div className="md:col-span-4 flex flex-col gap-1.5">
            <label className="text-[11px] font-mono text-zinc-400">
              Target Value (Converted)
            </label>
            <div
              className={`w-full px-3.5 py-2 rounded-xl border ${theme.panelBorder} font-mono-math text-base font-semibold truncate bg-black/50 text-emerald-400 flex items-center min-h-[42px] shadow-inner`}
            >
              <AnimatePresence mode="wait">
                <motion.span
                  key={`${convertedResult}-${toUnit}`}
                  initial={{ opacity: 0, y: -2 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 2 }}
                  transition={{ duration: 0.12 }}
                  className="truncate"
                >
                  {convertedResult}
                </motion.span>
              </AnimatePresence>
            </div>
            <select
              value={toUnit}
              onChange={(e) => setToUnit(e.target.value)}
              aria-label="Target unit"
              className={`w-full px-3 py-1.5 rounded-xl border ${theme.panelBorder} font-mono text-xs outline-none bg-[#14161f] text-zinc-200 focus:border-emerald-500/60`}
            >
              {Object.entries(catData.labels).map(([uKey, uLabel]) => (
                <option key={`to-${uKey}`} value={uKey} className="bg-zinc-900 text-zinc-100">
                  {uLabel}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
