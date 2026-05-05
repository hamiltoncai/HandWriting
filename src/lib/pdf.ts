import fontkit from '@pdf-lib/fontkit';
import { PDFDocument, PDFPage, PDFFont, rgb } from 'pdf-lib';
import type { CopybookCell, CopybookSettings, GridStyle, PageLayout } from '../types/copybook';
import { COPYBOOK_FONTS, DEFAULT_PDF_FONT_KEY, getCopybookFont } from './fonts';
import { cellPosition, paginateCells } from './layout';

const MM_TO_PT = 72 / 25.4;
const fontCharacterSetCache = new WeakMap<PDFFont, Set<number>>();

interface EmbeddedFonts {
  primary?: PDFFont;
  fallback?: PDFFont;
}

export async function generateCopybookPdf(
  settings: CopybookSettings,
  layout: PageLayout,
  cells: CopybookCell[],
) {
  const pdfDoc = await PDFDocument.create();
  pdfDoc.registerFontkit(fontkit);
  const embeddedFonts = await loadPdfFonts(pdfDoc, settings);
  const useHanziWriterGlyph = Boolean(getCopybookFont(settings.fontKey).usesHanziWriterStrokes);
  const pages = paginateCells(cells, layout.cellsPerPage);

  pages.forEach((pageCells) => {
    const page = pdfDoc.addPage([mm(layout.pageWidthMm), mm(layout.pageHeightMm)]);
    page.drawRectangle({
      x: 0,
      y: 0,
      width: mm(layout.pageWidthMm),
      height: mm(layout.pageHeightMm),
      color: rgb(1, 1, 1),
    });

    for (let index = 0; index < layout.cellsPerPage; index += 1) {
      const cell = pageCells[index];
      const pos = cellPosition(index, layout);
      const x = mm(pos.x);
      const y = mm(layout.pageHeightMm - pos.y - layout.cellSizeMm);
      const size = mm(layout.cellSizeMm);
      drawGrid(page, x, y, size, settings.gridStyle);
      if (cell) drawHanzi(page, cell, x, y, size, embeddedFonts, useHanziWriterGlyph, settings.traceRedText);
    }
  });

  const bytes = await pdfDoc.save();
  const arrayBuffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
  return new Blob([arrayBuffer], { type: 'application/pdf' });
}

function drawGrid(
  page: PDFPage,
  x: number,
  y: number,
  size: number,
  style: GridStyle,
) {
  const red = rgb(0.851, 0.259, 0.208);
  const thin = Math.max(0.45, size * 0.012);
  const half = size / 2;
  const quarter = size / 4;
  const dash = [size * 0.045, size * 0.035];

  page.drawRectangle({
    x,
    y,
    width: size,
    height: size,
    borderColor: red,
    borderWidth: thin,
  });

  if (style === 'blank') return;

  if (style === 'tian' || style === 'mi' || style === 'cross' || style === 'hui') {
    line(page, x + half, y, x + half, y + size, thin * 0.72, dash);
    line(page, x, y + half, x + size, y + half, thin * 0.72, dash);
  }

  if (style === 'mi') {
    line(page, x, y, x + size, y + size, thin * 0.72, dash);
    line(page, x + size, y, x, y + size, thin * 0.72, dash);
  }

  if (style === 'hui') {
    page.drawRectangle({
      x: x + quarter,
      y: y + quarter,
      width: half,
      height: half,
      borderColor: red,
      borderWidth: thin * 0.72,
      borderDashArray: dash,
    });
  }

  if (style === 'tian') {
    line(page, x + quarter, y, x + quarter, y + size, thin * 0.35, dash, 0.35);
    line(page, x + quarter * 3, y, x + quarter * 3, y + size, thin * 0.35, dash, 0.35);
  }
}

function drawHanzi(
  page: PDFPage,
  cell: CopybookCell,
  x: number,
  y: number,
  size: number,
  embeddedFonts: EmbeddedFonts,
  useHanziWriterGlyph: boolean,
  traceRedText: boolean,
) {
  if (cell.role === 'blank') return;

  const font = cell.char ? chooseFontForChar(cell.char, embeddedFonts) : undefined;

  if ((cell.mode === 'tracing' || cell.role === 'trace') && cell.char && font && !useHanziWriterGlyph) {
    drawFontGlyph(page, cell, x, y, size, font, traceRedText);
    return;
  }

  if (cell.strokes.length === 0 && cell.char && font) {
    drawFontGlyph(page, cell, x, y, size, font, traceRedText);
    return;
  }

  if (cell.strokes.length === 0) return;

  const visible = cell.strokes.slice(0, cell.visibleStrokeCount);
  const progress = cell.strokes.length > 0 ? cell.visibleStrokeCount / cell.strokes.length : 1;
  const grey = 0.745 * (1 - progress);
  const traceColor = traceRedText ? rgb(0.851, 0.259, 0.208) : rgb(0.78, 0.78, 0.78);
  const baseColor = cell.role === 'trace'
    ? traceColor
    : cell.role === 'sample'
      ? rgb(0.06, 0.08, 0.12)
      : rgb(grey, grey, grey);
  const scale = (size * 0.84) / 1024;
  const originX = x + size * 0.08;
  const originY = y + size * 0.08;

  visible.forEach((path, index) => {
    page.drawSvgPath(path, {
      x: originX,
      y: originY,
      scale,
      color: index === visible.length - 1 && cell.role === 'stroke-step' ? rgb(0.06, 0.08, 0.12) : baseColor,
      opacity: cell.role === 'trace' ? 0.45 : 1,
    });
  });
}

async function loadPdfFonts(pdfDoc: PDFDocument, settings: CopybookSettings): Promise<EmbeddedFonts> {
  const selectedFont = getCopybookFont(settings.fontKey);
  const primary = selectedFont.pdfFontUrl
    ? await embedFontFromUrl(pdfDoc, selectedFont.pdfFontUrl)
    : undefined;
  const fallbackUrl = COPYBOOK_FONTS[DEFAULT_PDF_FONT_KEY].pdfFontUrl;
  const fallback = fallbackUrl && selectedFont.pdfFontUrl !== fallbackUrl
    ? await embedFontFromUrl(pdfDoc, fallbackUrl)
    : primary;

  return { primary, fallback };
}

async function embedFontFromUrl(pdfDoc: PDFDocument, fontUrl: string) {
  const response = await fetch(fontUrl);
  if (!response.ok) return undefined;

  const fontBytes = await response.arrayBuffer();
  return pdfDoc.embedFont(fontBytes, { subset: true });
}

function chooseFontForChar(char: string, fonts: EmbeddedFonts) {
  const candidates = [fonts.primary, fonts.fallback].filter(Boolean) as PDFFont[];
  return candidates.find((font) => supportsText(font, char));
}

function supportsText(font: PDFFont, text: string) {
  let characterSet = fontCharacterSetCache.get(font);
  if (!characterSet) {
    characterSet = new Set(font.getCharacterSet());
    fontCharacterSetCache.set(font, characterSet);
  }
  return Array.from(text).every((char) => characterSet.has(char.codePointAt(0) ?? 0));
}

function drawFontGlyph(
  page: PDFPage,
  cell: CopybookCell,
  x: number,
  y: number,
  size: number,
  font: PDFFont,
  traceRedText: boolean,
) {
  if (!cell.char) return;

  const fontSize = size * 0.76;
  const traceColor = traceRedText ? rgb(0.851, 0.259, 0.208) : rgb(0.78, 0.78, 0.78);
  const color = cell.role === 'trace' ? traceColor : rgb(0.06, 0.08, 0.12);
  const textWidth = font.widthOfTextAtSize(cell.char, fontSize);
  const textHeight = font.heightAtSize(fontSize, { descender: false });

  page.drawText(cell.char, {
    x: x + (size - textWidth) / 2,
    y: y + (size - textHeight) / 2 + size * 0.02,
    size: fontSize,
    font,
    color,
    opacity: cell.role === 'trace' ? 0.58 : 1,
  });
}

function line(
  page: PDFPage,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  thickness: number,
  dashArray?: number[],
  opacity = 1,
) {
  page.drawLine({
    start: { x: x1, y: y1 },
    end: { x: x2, y: y2 },
    color: rgb(0.851, 0.259, 0.208),
    thickness,
    dashArray,
    opacity,
  });
}

function mm(value: number) {
  return value * MM_TO_PT;
}
