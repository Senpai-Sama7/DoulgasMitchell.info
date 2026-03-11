// ASCII Art Generation and Pattern System
// Controlled editorial ASCII language, not terminal cosplay

export const asciiPatterns = {
  // Decorative borders and frames
  borders: {
    single: {
      topLeft: '┌', topRight: '┐', bottomLeft: '└', bottomRight: '┘',
      horizontal: '─', vertical: '│',
    },
    double: {
      topLeft: '╔', topRight: '╗', bottomLeft: '╚', bottomRight: '╝',
      horizontal: '═', vertical: '║',
    },
    rounded: {
      topLeft: '╭', topRight: '╮', bottomLeft: '╰', bottomRight: '╯',
      horizontal: '─', vertical: '│',
    },
    thick: {
      topLeft: '▛', topRight: '▜', bottomLeft: '▙', bottomRight: '▟',
      horizontal: '▀', vertical: '█',
    },
  },

  // Section dividers
  dividers: {
    wave: '∿∿∿∿∿∿∿∿∿∿',
    dots: '················',
    doubleLine: '════════════════',
    singleLine: '────────────────',
    arrows: '≫――――――――――≪',
    diamonds: '◇◆◇◆◇◆◇◆◇◆◇◆',
    stars: '★·.·´¯`·.·★·.·´¯`·.·★',
    cross: '═══✧═══════════✧═══',
    ornate: '─═─┳─═─┳─═─┳─═─',
  },

  // Corner ornaments
  corners: {
    topLeft: '╭──────────',
    topRight: '──────────╮',
    bottomLeft: '╰──────────',
    bottomRight: '──────────╯',
    cross: '╋',
    tee: '┳',
  },

  // Icon-like ASCII art
  icons: {
    terminal: `
    ┌─────────────────┐
    │ ▓▓▓ ▓▓▓ ▓▓▓    │
    │                 │
    │ $ _             │
    └─────────────────┘`,
    
    code: `
    ╔══════════════╗
    ║ { } [ ] < > ║
    ║  codeblock   ║
    ╚══════════════╝`,
    
    brain: `
        .---.
       /     \\
      | () () |
       \\  ^  /
        '---'`,
    
    rocket: `
        /\\
       /  \\
      /____\\
      |    |
      | ~~ |
      |____|`,
    
    sparkle: '✦·.·´¯`·.·✦',
    
    architecture: `
        ▲
       ╱ ╲
      ╱   ╲
     ╱_____╲
     │     │
     └─────┘`,
  },

  // Matrix-style characters (subtle)
  matrix: 'ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ',

  // Grid patterns
  grids: {
    small: '┌┬┐├┼┤└┴┘│─',
    dots: '∙∙∙∙∙∙∙∙∙∙',
    blocks: '▖▗▘▙▚▛▜▝▞▟',
  },
};

// Generate ASCII box with content
export function generateAsciiBox(
  content: string[],
  options: {
    style?: 'single' | 'double' | 'rounded';
    padding?: number;
    title?: string;
  } = {}
): string {
  const { style = 'rounded', padding = 1, title } = options;
  const border = asciiPatterns.borders[style];
  
  const lines = content.flatMap(line => 
    Array(padding).fill('').concat([line]).concat(Array(padding).fill(''))
  );
  
  const maxWidth = Math.max(...lines.map(l => l.length), title?.length || 0) + padding * 2;
  
  const topBorder = title
    ? `${border.topLeft}${border.horizontal}${title}${border.horizontal.repeat(maxWidth - title.length - 1)}${border.topRight}`
    : `${border.topLeft}${border.horizontal.repeat(maxWidth)}${border.topRight}`;
  
  const bottomBorder = `${border.bottomLeft}${border.horizontal.repeat(maxWidth)}${border.bottomRight}`;
  
  const middleLines = lines.map(line => 
    `${border.vertical}${' '.repeat(padding)}${line.padEnd(maxWidth - padding * 2)}${' '.repeat(padding)}${border.vertical}`
  );
  
  return [topBorder, ...middleLines, bottomBorder].join('\n');
}

// Generate ASCII progress bar
export function generateProgressBar(
  progress: number,
  width: number = 20,
  filled: string = '█',
  empty: string = '░'
): string {
  const filledCount = Math.round((progress / 100) * width);
  const emptyCount = width - filledCount;
  return `${filled.repeat(filledCount)}${empty.repeat(emptyCount)}`;
}

// Generate ASCII spinner frames
export const spinnerFrames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];

// Generate decorative ASCII header
export function generateAsciiHeader(text: string, width: number = 60): string {
  const padding = Math.floor((width - text.length - 2) / 2);
  const leftPad = '═'.repeat(Math.max(0, padding));
  const rightPad = '═'.repeat(Math.max(0, width - text.length - 2 - padding));
  return `╔${leftPad} ${text} ${rightPad}╗`;
}

// Generate ASCII section marker
export function generateSectionMarker(label: string): string {
  return `┌─[ ${label} ]${'─'.repeat(Math.max(0, 20 - label.length))}┐`;
}

// ASCII art for "The Architect"
export const architectAscii = `
                    ╭──────────────────────────────╮
                    │      ╔═══════════════╗       │
                    │      ║               ║       │
        ▲          │      ║   ARCHITECT   ║       │          ▲
       ╱ ╲         │      ║               ║       │         ╱ ╲
      ╱   ╲        │      ╚═══════════════╝       │        ╱   ╲
     ╱_____╲       ╰──────────────────────────────╯       ╱_____╲
     │     │              │              │              │     │
     └─────┘              └──────────────┘              └─────┘
`;

// Generate dynamic ASCII wave
export function generateAsciiWave(width: number = 40): string {
  const chars = ['░', '▒', '▓', '█', '▓', '▒', '░'];
  let wave = '';
  for (let i = 0; i < width; i++) {
    wave += chars[Math.floor((Math.sin(i * 0.3) + 1) * 1.5) % chars.length];
  }
  return wave;
}

// Generate ASCII bar chart
export function generateBarChart(
  data: { label: string; value: number }[],
  options: {
    width?: number;
    maxValue?: number;
    showValues?: boolean;
  } = {}
): string {
  const { width = 30, maxValue = Math.max(...data.map(d => d.value)), showValues = true } = options;
  
  return data.map(item => {
    const barWidth = Math.round((item.value / maxValue) * width);
    const bar = '█'.repeat(barWidth) + '░'.repeat(width - barWidth);
    const valueStr = showValues ? ` [${item.value}]` : '';
    return `${item.label.padEnd(12)} │ ${bar}${valueStr}`;
  }).join('\n');
}

// Generate ASCII sparkline (mini trend chart)
export function generateSparkline(values: number[], width: number = 10): string {
  const sparkChars = [' ', '▂', '▃', '▄', '▅', '▆', '▇', '█'];
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  
  return values.slice(-width).map(v => {
    const index = Math.floor(((v - min) / range) * (sparkChars.length - 1));
    return sparkChars[index];
  }).join('');
}

// Generate glitch text effect characters
export function glitchText(text: string): string {
  const glitchChars = '!@#$%^&*()_+-=[]{}|;:,.<>?/~`░▒▓█▀▄';
  return text.split('').map(char => 
    Math.random() > 0.9 ? glitchChars[Math.floor(Math.random() * glitchChars.length)] : char
  ).join('');
}
