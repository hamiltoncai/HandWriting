import { A4_HEIGHT_MM, A4_WIDTH_MM } from './constants';
import type { CopybookCell, CopybookSettings, HanziStrokeData, PageLayout } from '../types/copybook';

export function createLayout(settings: CopybookSettings): PageLayout {
  const cellSizeMm = settings.cellSizeCm * 10;
  const marginMm = 14;
  const gapMm = 2;
  const maxColumns = Math.max(
    1,
    Math.floor((A4_WIDTH_MM - marginMm * 2 + gapMm) / (cellSizeMm + gapMm)),
  );
  const columns = Math.max(1, Math.min(settings.columns, maxColumns));
  const rows = Math.max(
    1,
    Math.floor((A4_HEIGHT_MM - marginMm * 2 + gapMm) / (cellSizeMm + gapMm)),
  );

  return {
    pageWidthMm: A4_WIDTH_MM,
    pageHeightMm: A4_HEIGHT_MM,
    marginMm,
    cellSizeMm,
    columns,
    rows,
    gapMm,
    cellsPerPage: columns * rows,
  };
}

export function buildCopybookCells(
  settings: CopybookSettings,
  strokeData: Map<string, HanziStrokeData>,
  chars?: string[],
): CopybookCell[] {
  const characterData = chars && chars.length > 0
    ? chars.map((character) => strokeData.get(character) ?? {
      character,
      strokes: [],
      source: 'fallback-font' as const,
    })
    : Array.from(strokeData.values());
  const cells: CopybookCell[] = [];

  if (settings.mode === 'blank') {
    const count = Math.max(characterData.length * settings.repeatCount, settings.columns * 8);
    return Array.from({ length: count }, (_, index) => ({
      id: `blank-${index}`,
      strokes: [],
      visibleStrokeCount: 0,
      mode: 'blank',
      role: 'blank',
    }));
  }

  characterData.forEach((data) => {
    if (settings.mode === 'stroke') {
      for (let repeat = 0; repeat < settings.repeatCount; repeat += 1) {
        if (data.strokes.length === 0) {
          cells.push({
            id: `${data.character}-stroke-fallback-${repeat}`,
            char: data.character,
            strokes: [],
            visibleStrokeCount: 0,
            mode: 'stroke',
            role: 'stroke-step',
          });
          padStrokeRowWithTracing(cells, data, settings.columns, repeat, 1);
          if (settings.strokeExtraTraceRow) {
            addStrokeTraceRow(cells, data, settings.columns, repeat);
          }
          if (settings.extraBlankPracticeRow) {
            addBlankPracticeRow(cells, settings.columns, `${data.character}-stroke-${repeat}`);
          }
          continue;
        }

        data.strokes.forEach((_, strokeIndex) => {
          cells.push({
            id: `${data.character}-stroke-${repeat}-${strokeIndex}`,
            char: data.character,
            strokes: data.strokes,
            visibleStrokeCount: strokeIndex + 1,
            mode: 'stroke',
            role: 'stroke-step',
          });
        });

        padStrokeRowWithTracing(cells, data, settings.columns, repeat, data.strokes.length);
        if (settings.strokeExtraTraceRow) {
          addStrokeTraceRow(cells, data, settings.columns, repeat);
        }
        if (settings.extraBlankPracticeRow) {
          addBlankPracticeRow(cells, settings.columns, `${data.character}-stroke-${repeat}`);
        }
      }
      return;
    }

    for (let repeat = 0; repeat < settings.repeatCount; repeat += 1) {
      cells.push({
        id: `${data.character}-sample-${repeat}`,
        char: data.character,
        strokes: data.strokes,
        visibleStrokeCount: data.strokes.length,
        mode: 'tracing',
        role: 'sample',
      });

      const traceCells = Math.max(1, settings.columns - 1);
      for (let trace = 0; trace < traceCells; trace += 1) {
        cells.push({
          id: `${data.character}-trace-${repeat}-${trace}`,
          char: data.character,
          strokes: data.strokes,
          visibleStrokeCount: data.strokes.length,
          mode: 'tracing',
          role: 'trace',
        });
      }

      if (settings.extraBlankPracticeRow) {
        addBlankPracticeRow(cells, settings.columns, `${data.character}-tracing-${repeat}`);
      }
    }
  });

  return cells;
}

function addBlankPracticeRow(cells: CopybookCell[], columns: number, idPrefix: string) {
  for (let index = 0; index < columns; index += 1) {
    cells.push({
      id: `${idPrefix}-blank-practice-${index}`,
      strokes: [],
      visibleStrokeCount: 0,
      mode: 'blank',
      role: 'blank',
    });
  }
}

function addStrokeTraceRow(
  cells: CopybookCell[],
  data: HanziStrokeData,
  columns: number,
  repeat: number,
) {
  for (let trace = 0; trace < columns; trace += 1) {
    cells.push({
      id: `${data.character}-stroke-extra-trace-${repeat}-${trace}`,
      char: data.character,
      strokes: data.strokes,
      visibleStrokeCount: data.strokes.length,
      mode: 'stroke',
      role: 'trace',
    });
  }
}

function padStrokeRowWithTracing(
  cells: CopybookCell[],
  data: HanziStrokeData,
  columns: number,
  repeat: number,
  usedCells: number,
) {
  const remainingInRow = usedCells % columns === 0 ? 0 : columns - (usedCells % columns);

  for (let trace = 0; trace < remainingInRow; trace += 1) {
    cells.push({
      id: `${data.character}-stroke-trace-${repeat}-${trace}`,
      char: data.character,
      strokes: data.strokes,
      visibleStrokeCount: data.strokes.length,
      mode: 'stroke',
      role: 'trace',
    });
  }
}

export function paginateCells<T>(items: T[], pageSize: number): T[][] {
  if (items.length === 0) return [[]];
  const pages: T[][] = [];
  for (let index = 0; index < items.length; index += pageSize) {
    pages.push(items.slice(index, index + pageSize));
  }
  return pages;
}

export function cellPosition(index: number, layout: PageLayout) {
  const col = index % layout.columns;
  const row = Math.floor(index / layout.columns);
  return {
    x: layout.marginMm + col * (layout.cellSizeMm + layout.gapMm),
    y: layout.marginMm + row * (layout.cellSizeMm + layout.gapMm),
  };
}
