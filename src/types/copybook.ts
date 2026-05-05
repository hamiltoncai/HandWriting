export type CopybookMode = 'stroke' | 'tracing' | 'blank';

export type GridStyle = 'tian' | 'mi' | 'hui' | 'cross' | 'blank';

export type CopybookFontKey =
  | 'hanzi-writer'
  | 'ma-shan-zheng'
  | 'liu-jian-mao-cao'
  | 'long-cang'
  | 'zcool-xiaowei'
  | 'zcool-kuaile'
  | 'klee-one-pencil'
  | 'zen-kurenaido-pencil'
  | 'lxgw-wenkai-pencil'
  | 'lxgw-wenkai-screen-pencil'
  | 'system-kaiti'
  | 'system-hard-pen'
  | 'system-yuanti'
  | 'system-xingkai'
  | 'system-lishu'
  | 'system-fangsong';

export interface CopybookSettings {
  text: string;
  removeDuplicates: boolean;
  mode: CopybookMode;
  gridStyle: GridStyle;
  fontKey: CopybookFontKey;
  fontBold: boolean;
  fontItalic: boolean;
  traceRedText: boolean;
  strokeExtraTraceRow: boolean;
  extraBlankPracticeRow: boolean;
  cellSizeCm: number;
  columns: number;
  repeatCount: number;
}

export interface HanziStrokeData {
  character: string;
  strokes: string[];
  source: 'hanzi-writer-data' | 'fallback-font';
}

export interface CopybookCell {
  id: string;
  char?: string;
  strokes: string[];
  visibleStrokeCount: number;
  mode: CopybookMode;
  role: 'stroke-step' | 'sample' | 'trace' | 'blank';
}

export interface PageLayout {
  pageWidthMm: number;
  pageHeightMm: number;
  marginMm: number;
  cellSizeMm: number;
  columns: number;
  rows: number;
  gapMm: number;
  cellsPerPage: number;
}
