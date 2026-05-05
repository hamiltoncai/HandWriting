export const A4_WIDTH_MM = 210;
export const A4_HEIGHT_MM = 297;
export const DEFAULT_SETTINGS = {
  text: '永书山水',
  removeDuplicates: true,
  mode: 'stroke',
  gridStyle: 'mi',
  fontKey: 'lxgw-wenkai-pencil',
  fontBold: false,
  fontItalic: false,
  traceRedText: false,
  strokeExtraTraceRow: false,
  extraBlankPracticeRow: false,
  cellSizeCm: 1.5,
  columns: 10,
  repeatCount: 1,
} as const;

export const GRID_LABELS = {
  tian: '田字格',
  mi: '米字格',
  hui: '回宫格',
  cross: '十字格',
  blank: '空白方格',
} as const;

export const MODE_LABELS = {
  stroke: '笔顺模式',
  tracing: '描红模式',
  blank: '空白练习',
} as const;
