import { motion, AnimatePresence } from 'framer-motion';
import { TactileButton } from './ui/TactileButton';

export function Keypad({
  mode = 'scientific', // 'scientific' | 'standard' | 'programmer'
  inv = false,
  angleMode = 'DEG',
  isMuted = false,
  memory = null,
  theme,
  onAction,
  onToggleAngle,
  onToggleInv,
}) {
  // Scientific Function Rows
  const scientificRows = [
    // Row 1: Trigonometric & Logarithmic
    inv
      ? [
          { label: 'sin⁻¹', action: { type: 'func', value: 'asin(' }, sublabel: 'asin', soundType: 'func' },
          { label: 'cos⁻¹', action: { type: 'func', value: 'acos(' }, sublabel: 'acos', soundType: 'func' },
          { label: 'tan⁻¹', action: { type: 'func', value: 'atan(' }, sublabel: 'atan', soundType: 'func' },
          { label: '10ˣ', action: { type: 'func', value: '10^(' }, sublabel: '10^x', soundType: 'func' },
          { label: 'eˣ', action: { type: 'func', value: 'exp(' }, sublabel: 'exp', soundType: 'func' },
        ]
      : [
          { label: 'sin', action: { type: 'func', value: 'sin(' }, shortcut: 'S', soundType: 'func' },
          { label: 'cos', action: { type: 'func', value: 'cos(' }, shortcut: 'C', soundType: 'func' },
          { label: 'tan', action: { type: 'func', value: 'tan(' }, shortcut: 'T', soundType: 'func' },
          { label: 'log', action: { type: 'func', value: 'log10(' }, shortcut: 'L', soundType: 'func' },
          { label: 'ln', action: { type: 'func', value: 'log(' }, shortcut: 'N', soundType: 'func' },
        ],
    // Row 2: Powers & Parentheses
    [
      { label: '(', action: { type: 'op', value: '(' }, shortcut: '(', tone: 'func' },
      { label: ')', action: { type: 'op', value: ')' }, shortcut: ')', tone: 'func' },
      { label: 'x²', action: { type: 'postfix', value: '^2' }, soundType: 'func' },
      { label: 'x³', action: { type: 'postfix', value: '^3' }, soundType: 'func' },
      { label: 'xʸ', action: { type: 'op', value: '^' }, shortcut: '^', soundType: 'func' },
    ],
    // Row 3: Roots & Constants
    [
      { label: '√x', action: { type: 'func', value: 'sqrt(' }, soundType: 'func' },
      { label: '∛x', action: { type: 'func', value: 'cbrt(' }, soundType: 'func' },
      { label: 'π', action: { type: 'const', value: 'pi' }, shortcut: 'P', soundType: 'func' },
      { label: 'e', action: { type: 'const', value: 'e' }, shortcut: 'E', soundType: 'func' },
      { label: 'n!', action: { type: 'postfix', value: '!' }, shortcut: '!', soundType: 'func' },
    ],
    // Row 4: Math Utilities
    [
      { label: '|x|', action: { type: 'func', value: 'abs(' }, soundType: 'func' },
      { label: '1/x', action: { type: 'reciprocal' }, soundType: 'func' },
      { label: 'floor', action: { type: 'func', value: 'floor(' }, soundType: 'func' },
      { label: 'ceil', action: { type: 'func', value: 'ceil(' }, soundType: 'func' },
      { label: 'mod', action: { type: 'op', value: ' mod ' }, soundType: 'op', tone: 'func' },
    ],
  ];

  // Programmer Function Rows (Bitwise & Bases)
  const programmerRows = [
    [
      { label: 'AND', action: { type: 'op', value: ' and ' }, tone: 'func' },
      { label: 'OR', action: { type: 'op', value: ' or ' }, tone: 'func' },
      { label: 'XOR', action: { type: 'op', value: ' xor ' }, tone: 'func' },
      { label: 'NOT', action: { type: 'func', value: 'not ' }, tone: 'func' },
      { label: 'mod', action: { type: 'op', value: ' mod ' }, tone: 'func' },
    ],
    [
      { label: '<<', action: { type: 'op', value: ' << ' }, tone: 'func' },
      { label: '>>', action: { type: 'op', value: ' >> ' }, tone: 'func' },
      { label: 'HEX', action: { type: 'base', value: 'hex' }, tone: 'action' },
      { label: 'BIN', action: { type: 'base', value: 'bin' }, tone: 'action' },
      { label: 'OCT', action: { type: 'base', value: 'oct' }, tone: 'action' },
    ],
  ];

  return (
    <div className="w-full flex flex-col gap-1.5 sm:gap-2">
      {/* Top Function Toolbar (Angle, Inverse, & Memory Registers) */}
      <div className="flex items-center justify-between gap-1 overflow-x-auto scrollbar-none pb-0.5 text-xs">
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={onToggleAngle}
            className={`px-2 py-0.5 rounded-md font-mono-math text-[10px] sm:text-[11px] font-medium tracking-wide transition-colors ${
              angleMode === 'DEG' ? theme.activeBadge : theme.idleBadge
            }`}
            title="Toggle Degrees / Radians"
          >
            {angleMode}
          </button>
          <button
            type="button"
            onClick={onToggleInv}
            className={`px-2 py-0.5 rounded-md font-mono-math text-[10px] sm:text-[11px] font-medium tracking-wide transition-colors ${
              inv ? theme.activeBadge : theme.idleBadge
            }`}
            title="Toggle Inverse Functions (2nd)"
          >
            INV
          </button>
        </div>

        {/* Memory Registers */}
        <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
          <button
            type="button"
            onClick={() => onAction({ type: 'mc' })}
            className={`px-1.5 py-0.5 rounded-md font-mono-math text-[10px] tracking-wider transition-colors ${theme.toolbarBtn}`}
            title="Memory Clear"
          >
            MC
          </button>
          <button
            type="button"
            onClick={() => onAction({ type: 'mr' })}
            className={`px-1.5 py-0.5 rounded-md font-mono-math text-[10px] tracking-wider transition-colors ${
              memory !== null ? theme.toolbarBtnActive : theme.toolbarBtn
            }`}
            title="Memory Recall"
          >
            MR
          </button>
          <button
            type="button"
            onClick={() => onAction({ type: 'ms' })}
            className={`px-1.5 py-0.5 rounded-md font-mono-math text-[10px] tracking-wider transition-colors ${theme.toolbarBtn}`}
            title="Memory Store"
          >
            MS
          </button>
          <button
            type="button"
            onClick={() => onAction({ type: 'm+' })}
            className={`px-1.5 py-0.5 rounded-md font-mono-math text-[10px] tracking-wider transition-colors ${theme.toolbarBtn}`}
            title="Memory Add"
          >
            M+
          </button>
          <button
            type="button"
            onClick={() => onAction({ type: 'm-' })}
            className={`px-1.5 py-0.5 rounded-md font-mono-math text-[10px] tracking-wider transition-colors ${theme.toolbarBtn}`}
            title="Memory Subtract"
          >
            M−
          </button>
        </div>
      </div>

      {/* Mode-Specific Function Grids */}
      <AnimatePresence mode="wait">
        {mode === 'scientific' && (
          <motion.div
            key="scientific-grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.14 }}
            className="grid grid-cols-5 gap-1 sm:gap-1.5 w-full min-w-0"
          >
            {scientificRows.map((row, rIdx) =>
              row.map((btn, cIdx) => (
                <TactileButton
                  key={`sci-${rIdx}-${cIdx}`}
                  label={btn.label}
                  sublabel={btn.sublabel}
                  shortcut={btn.shortcut}
                  onClick={() => onAction(btn.action)}
                  tone={btn.tone || 'func'}
                  theme={theme}
                  isMuted={isMuted}
                  soundType={btn.soundType || 'func'}
                  className="h-7 sm:h-7.5 md:h-8 text-[11px] sm:text-xs md:text-[13px] font-normal tracking-tight min-w-0 w-full"
                />
              ))
            )}
          </motion.div>
        )}

        {mode === 'programmer' && (
          <motion.div
            key="programmer-grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.14 }}
            className="grid grid-cols-5 gap-1 sm:gap-1.5 w-full min-w-0"
          >
            {programmerRows.map((row, rIdx) =>
              row.map((btn, cIdx) => (
                <TactileButton
                  key={`prog-${rIdx}-${cIdx}`}
                  label={btn.label}
                  onClick={() => onAction(btn.action)}
                  tone={btn.tone || 'func'}
                  theme={theme}
                  isMuted={isMuted}
                  soundType="func"
                  className="h-7 sm:h-7.5 md:h-8 text-[10px] sm:text-[11px] font-medium tracking-wide min-w-0 w-full"
                />
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Core Numeric & Standard Keypad Grid (4 Columns) */}
      <div className="grid grid-cols-4 gap-1 sm:gap-1.5 w-full min-w-0">
        {/* Row 1: Clear, Backspace, Modifiers, Division */}
        <TactileButton
          label="AC"
          shortcut="Esc"
          onClick={() => onAction({ type: 'clear' })}
          tone="danger"
          theme={theme}
          isMuted={isMuted}
          soundType="clear"
          className="h-8.5 sm:h-9 md:h-10 text-xs sm:text-sm font-medium tracking-wider min-w-0 w-full"
        />
        <TactileButton
          label="⌫"
          shortcut="⌫"
          onClick={() => onAction({ type: 'back' })}
          tone="action"
          theme={theme}
          isMuted={isMuted}
          soundType="op"
          aria-label="Backspace"
          className="h-8.5 sm:h-9 md:h-10 text-sm sm:text-base font-normal min-w-0 w-full"
        />
        <TactileButton
          label="%"
          shortcut="%"
          onClick={() => onAction({ type: 'percent' })}
          tone="op"
          theme={theme}
          isMuted={isMuted}
          soundType="op"
          className="h-8.5 sm:h-9 md:h-10 text-xs sm:text-sm font-normal min-w-0 w-full"
        />
        <TactileButton
          label="÷"
          shortcut="/"
          onClick={() => onAction({ type: 'op', value: '/' })}
          tone="op"
          theme={theme}
          isMuted={isMuted}
          soundType="op"
          className="h-8.5 sm:h-9 md:h-10 text-base sm:text-lg font-light min-w-0 w-full"
        />

        {/* Row 2: 7, 8, 9, Multiplication */}
        <TactileButton
          label="7"
          shortcut="7"
          onClick={() => onAction({ type: 'digit', value: '7' })}
          tone="num"
          theme={theme}
          isMuted={isMuted}
          className="h-8.5 sm:h-9 md:h-10 text-base sm:text-lg font-normal sm:font-medium min-w-0 w-full"
        />
        <TactileButton
          label="8"
          shortcut="8"
          onClick={() => onAction({ type: 'digit', value: '8' })}
          tone="num"
          theme={theme}
          isMuted={isMuted}
          className="h-8.5 sm:h-9 md:h-10 text-base sm:text-lg font-normal sm:font-medium min-w-0 w-full"
        />
        <TactileButton
          label="9"
          shortcut="9"
          onClick={() => onAction({ type: 'digit', value: '9' })}
          tone="num"
          theme={theme}
          isMuted={isMuted}
          className="h-8.5 sm:h-9 md:h-10 text-base sm:text-lg font-normal sm:font-medium min-w-0 w-full"
        />
        <TactileButton
          label="×"
          shortcut="*"
          onClick={() => onAction({ type: 'op', value: '*' })}
          tone="op"
          theme={theme}
          isMuted={isMuted}
          soundType="op"
          className="h-8.5 sm:h-9 md:h-10 text-base sm:text-lg font-light min-w-0 w-full"
        />

        {/* Row 3: 4, 5, 6, Subtraction */}
        <TactileButton
          label="4"
          shortcut="4"
          onClick={() => onAction({ type: 'digit', value: '4' })}
          tone="num"
          theme={theme}
          isMuted={isMuted}
          className="h-8.5 sm:h-9 md:h-10 text-base sm:text-lg font-normal sm:font-medium min-w-0 w-full"
        />
        <TactileButton
          label="5"
          shortcut="5"
          onClick={() => onAction({ type: 'digit', value: '5' })}
          tone="num"
          theme={theme}
          isMuted={isMuted}
          className="h-8.5 sm:h-9 md:h-10 text-base sm:text-lg font-normal sm:font-medium min-w-0 w-full"
        />
        <TactileButton
          label="6"
          shortcut="6"
          onClick={() => onAction({ type: 'digit', value: '6' })}
          tone="num"
          theme={theme}
          isMuted={isMuted}
          className="h-8.5 sm:h-9 md:h-10 text-base sm:text-lg font-normal sm:font-medium min-w-0 w-full"
        />
        <TactileButton
          label="−"
          shortcut="-"
          onClick={() => onAction({ type: 'op', value: '-' })}
          tone="op"
          theme={theme}
          isMuted={isMuted}
          soundType="op"
          className="h-8.5 sm:h-9 md:h-10 text-base sm:text-lg font-light min-w-0 w-full"
        />

        {/* Row 4: 1, 2, 3, Addition */}
        <TactileButton
          label="1"
          shortcut="1"
          onClick={() => onAction({ type: 'digit', value: '1' })}
          tone="num"
          theme={theme}
          isMuted={isMuted}
          className="h-8.5 sm:h-9 md:h-10 text-base sm:text-lg font-normal sm:font-medium min-w-0 w-full"
        />
        <TactileButton
          label="2"
          shortcut="2"
          onClick={() => onAction({ type: 'digit', value: '2' })}
          tone="num"
          theme={theme}
          isMuted={isMuted}
          className="h-8.5 sm:h-9 md:h-10 text-base sm:text-lg font-normal sm:font-medium min-w-0 w-full"
        />
        <TactileButton
          label="3"
          shortcut="3"
          onClick={() => onAction({ type: 'digit', value: '3' })}
          tone="num"
          theme={theme}
          isMuted={isMuted}
          className="h-8.5 sm:h-9 md:h-10 text-base sm:text-lg font-normal sm:font-medium min-w-0 w-full"
        />
        <TactileButton
          label="+"
          shortcut="+"
          onClick={() => onAction({ type: 'op', value: '+' })}
          tone="op"
          theme={theme}
          isMuted={isMuted}
          soundType="op"
          className="h-8.5 sm:h-9 md:h-10 text-base sm:text-lg font-light min-w-0 w-full"
        />

        {/* Row 5: Plus/Minus, 0, Decimal Point, Equals */}
        <TactileButton
          label="±"
          onClick={() => onAction({ type: 'toggleSign' })}
          tone="num"
          theme={theme}
          isMuted={isMuted}
          aria-label="Toggle sign"
          className="h-8.5 sm:h-9 md:h-10 text-xs sm:text-sm font-normal min-w-0 w-full"
        />
        <TactileButton
          label="0"
          shortcut="0"
          onClick={() => onAction({ type: 'digit', value: '0' })}
          tone="num"
          theme={theme}
          isMuted={isMuted}
          className="h-8.5 sm:h-9 md:h-10 text-base sm:text-lg font-normal sm:font-medium min-w-0 w-full"
        />
        <TactileButton
          label="."
          shortcut="."
          onClick={() => onAction({ type: 'op', value: '.' })}
          tone="num"
          theme={theme}
          isMuted={isMuted}
          className="h-8.5 sm:h-9 md:h-10 text-base sm:text-lg font-medium min-w-0 w-full"
        />
        <TactileButton
          label="="
          shortcut="↵"
          onClick={() => onAction({ type: 'equals' })}
          tone="eq"
          theme={theme}
          isMuted={isMuted}
          soundType="equals"
          aria-label="Equals"
          className="h-8.5 sm:h-9 md:h-10 text-base sm:text-lg font-semibold min-w-0 w-full"
        />
      </div>
    </div>
  );
}

