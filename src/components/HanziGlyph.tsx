import type { CopybookCell } from '../types/copybook';

interface HanziGlyphProps {
  cell: CopybookCell;
  size: number;
  fontFamily: string;
  useHanziWriterGlyph: boolean;
  traceRedText: boolean;
  fontBold: boolean;
  fontItalic: boolean;
}

export function HanziGlyph({
  cell,
  size,
  fontFamily,
  useHanziWriterGlyph,
  traceRedText,
  fontBold,
  fontItalic,
}: HanziGlyphProps) {
  if (cell.role === 'blank') return null;

  const traceColor = traceRedText ? '#d94235' : '#cfcfcf';

  if (
    (cell.role === 'trace' || cell.mode === 'tracing' || cell.strokes.length === 0)
    && cell.char
    && !(useHanziWriterGlyph && cell.strokes.length > 0)
  ) {
    return (
      <text
        x={size / 2}
        y={size * 0.68}
        textAnchor="middle"
        fontFamily={fontFamily}
        fontSize={size * 0.76}
        fontWeight={fontBold ? 700 : 400}
        fontStyle={fontItalic ? 'italic' : 'normal'}
        fill={cell.role === 'trace' ? traceColor : '#111827'}
        opacity={cell.role === 'trace' ? 0.58 : 1}
      >
        {cell.char}
      </text>
    );
  }

  const visible = cell.strokes.slice(0, cell.visibleStrokeCount);
  const progress = cell.strokes.length > 0 ? cell.visibleStrokeCount / cell.strokes.length : 1;
  const strokeColor = cell.role === 'trace'
    ? traceColor
    : cell.role === 'sample'
      ? '#111827'
      : blendGreyToBlack(progress);
  const glyphTransform = fontItalic ? 'skewX(-8)' : undefined;

  return (
    <g transform={`translate(${size * 0.08} ${size * 0.9}) scale(${(size * 0.84) / 1024} ${-(size * 0.84) / 1024})`}>
      <g transform={glyphTransform}>
        {visible.map((path, index) => {
          const fill = index === visible.length - 1 && cell.role === 'stroke-step' ? '#111827' : strokeColor;

          return (
            <path
              key={`${cell.id}-${index}`}
              d={path}
              fill={fill}
              stroke={fontBold ? fill : undefined}
              strokeWidth={fontBold ? 28 : undefined}
              strokeLinejoin="round"
              opacity={cell.role === 'trace' ? 0.45 : 1}
            />
          );
        })}
      </g>
    </g>
  );
}

function blendGreyToBlack(progress: number) {
  const start = 190;
  const value = Math.round(start * (1 - progress));
  return `rgb(${value}, ${value}, ${value})`;
}
