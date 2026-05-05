import { forwardRef, type ReactNode } from 'react';
import { cellPosition } from '../lib/layout';
import type { CopybookCell, CopybookSettings, PageLayout } from '../types/copybook';
import { CopybookCellView } from './CopybookCellView';

interface CopybookPageProps {
  pageCells: CopybookCell[];
  settings: CopybookSettings;
  layout: PageLayout;
  fontFamily: string;
  useHanziWriterGlyph: boolean;
  className?: string;
  children?: ReactNode;
}

export const CopybookPage = forwardRef<HTMLDivElement, CopybookPageProps>(function CopybookPage({
  pageCells,
  settings,
  layout,
  fontFamily,
  useHanziWriterGlyph,
  className = '',
  children,
}, ref) {
  return (
    <div
      ref={ref}
      className={`paper-preview relative bg-white ${className}`}
      style={{
        padding: `${(layout.marginMm / layout.pageWidthMm) * 100}%`,
      }}
    >
      {Array.from({ length: layout.cellsPerPage }, (_, index) => {
        const cell = pageCells[index] ?? emptyCell(index);
        const pos = cellPosition(index, layout);

        return (
          <div
            key={`${cell.id}-${index}`}
            className="absolute"
            style={{
              left: `${(pos.x / layout.pageWidthMm) * 100}%`,
              top: `${(pos.y / layout.pageHeightMm) * 100}%`,
              width: `${(layout.cellSizeMm / layout.pageWidthMm) * 100}%`,
              height: `${(layout.cellSizeMm / layout.pageHeightMm) * 100}%`,
            }}
          >
            <CopybookCellView
              cell={cell}
              gridStyle={settings.gridStyle}
              size={120}
              fontFamily={fontFamily}
              useHanziWriterGlyph={useHanziWriterGlyph}
              traceRedText={settings.traceRedText}
              fontBold={settings.fontBold}
              fontItalic={settings.fontItalic}
            />
          </div>
        );
      })}
      {children}
    </div>
  );
});

function emptyCell(index: number): CopybookCell {
  return {
    id: `preview-empty-${index}`,
    strokes: [],
    visibleStrokeCount: 0,
    mode: 'blank',
    role: 'blank',
  };
}
