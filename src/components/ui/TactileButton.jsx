import { motion } from 'framer-motion';
import { playKeySound } from '../../utils/audio';

export function TactileButton({
  label,
  sublabel,
  shortcut,
  onClick,
  tone = 'num', // 'num' | 'op' | 'func' | 'eq' | 'action' | 'danger'
  theme,
  wide = false,
  className = '',
  labelClassName = '',
  isMuted = false,
  soundType = 'digit',
  disabled = false,
  'aria-label': ariaLabel,
}) {
  const handleClick = (e) => {
    if (disabled) return;
    playKeySound(soundType || (tone === 'eq' ? 'equals' : tone === 'op' ? 'op' : 'digit'), isMuted);
    if (onClick) onClick(e);
  };

  // Tone styling based on theme
  let toneClass = `${theme.btnBg} ${theme.btnText} ${theme.btnBorder} ${theme.btnHover}`;
  if (tone === 'op') {
    toneClass = `${theme.opBg} ${theme.opText} ${theme.opBorder || theme.btnBorder} ${theme.opHover}`;
  } else if (tone === 'func') {
    toneClass = `${theme.funcBg} ${theme.funcText} ${theme.funcBorder || theme.btnBorder} ${theme.funcHover}`;
  } else if (tone === 'eq') {
    toneClass = `${theme.eqBg} ${theme.eqText} ${theme.eqHover} border-emerald-400/40 shadow-sm shadow-emerald-950/40`;
  } else if (tone === 'action') {
    toneClass = `${theme.actionBg} ${theme.actionText} ${theme.actionBorder || theme.btnBorder} ${theme.actionHover}`;
  } else if (tone === 'danger') {
    toneClass = `${theme.dangerBg} ${theme.dangerText} ${theme.dangerHover}`;
  }

  return (
    <motion.button
      type="button"
      whileHover={{ y: -1, transition: { duration: 0.14 } }}
      whileTap={{ scale: 0.96, y: 1, transition: { duration: 0.1 } }}
      onClick={handleClick}
      disabled={disabled}
      aria-label={ariaLabel || (typeof label === 'string' ? label : undefined)}
      className={`relative select-none flex flex-col items-center justify-center rounded-xl font-calc-btn transition-colors duration-120 border text-center focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-400/60 ${toneClass} ${
        wide ? 'col-span-2' : ''
      } ${disabled ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'} ${className}`}
    >
      {/* Top subtle highlight rim for physical key feel */}
      <span className="absolute inset-x-2 top-[1px] h-[1px] bg-white/[0.08] rounded-full pointer-events-none" />

      {/* Main label */}
      <span className={`leading-none select-none tracking-tight ${labelClassName || ''}`}>{label}</span>

      {/* Secondary sublabel (e.g. inverse or secondary function) */}
      {sublabel && (
        <span className="text-[8px] sm:text-[9px] opacity-60 font-calc-btn font-normal mt-0.5 leading-none tracking-tight">
          {sublabel}
        </span>
      )}

      {/* Optional tiny keyboard shortcut badge (desktop only) */}
      {shortcut && (
        <span className="absolute bottom-1 right-1 text-[8px] opacity-25 font-calc-btn font-medium pointer-events-none hidden md:inline">
          {shortcut}
        </span>
      )}
    </motion.button>
  );
}

