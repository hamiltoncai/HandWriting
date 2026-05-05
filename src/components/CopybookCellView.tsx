import { GridGuides } from './GridGuides';
import { HanziGlyph } from './HanziGlyph';
import type { CopybookCell, GridStyle } from '../types/copybook';

interface CopybookCellViewProps {
  cell: CopybookCell;
  gridStyle: GridStyle;
  size: number;
  fontFamily: string;
  useHanziWriterGlyph: boolean;
  traceRedText: boolean;
  fontBold: boolean;
  fontItalic: boolean;
}

export function CopybookCellView({
  cell,
  gridStyle,
  size,
  fontFamily,
  useHanziWriterGlyph,
  traceRedText,
  fontBold,
  fontItalic,
}: CopybookCellViewProps) {
  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="h-full w-full bg-white" aria-label={cell.char ?? '空白练习格'}>
      <GridGuides size={size} style={gridStyle} />
      <HanziGlyph
        cell={cell}
        size={size}
        fontFamily={fontFamily}
        useHanziWriterGlyph={useHanziWriterGlyph}
        traceRedText={traceRedText}
        fontBold={fontBold}
        fontItalic={fontItalic}
      />
    </svg>
  );
}
