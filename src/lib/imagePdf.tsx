import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';
import { getFontEmbedCSS, toPng } from 'html-to-image';
import { PDFDocument } from 'pdf-lib';
import { CopybookPage } from '../components/CopybookPage';
import type { CopybookCell, CopybookSettings, PageLayout } from '../types/copybook';
import { getCopybookFont, getImageFontEmbedCss } from './fonts';
import { paginateCells } from './layout';

const MM_TO_PT = 72 / 25.4;
const EXPORT_PAGE_WIDTH_PX = 794;
const EXPORT_PIXEL_RATIO = 2.5;

export async function generateCopybookPdfFromImages(
  settings: CopybookSettings,
  layout: PageLayout,
  cells: CopybookCell[],
) {
  const pages = paginateCells(cells, layout.cellsPerPage);
  const selectedFont = getCopybookFont(settings.fontKey);
  const fontFamily = selectedFont.cssFamily;
  const useHanziWriterGlyph = Boolean(selectedFont.usesHanziWriterStrokes);
  const pdfDoc = await PDFDocument.create();
  const exportRoot = document.createElement('div');
  const date = new Date().toISOString().slice(0, 10);

  Object.assign(exportRoot.style, {
    position: 'fixed',
    left: '-10000px',
    top: '0',
    width: `${EXPORT_PAGE_WIDTH_PX}px`,
    background: '#ffffff',
    pointerEvents: 'none',
    zIndex: '-1',
  });

  document.body.appendChild(exportRoot);
  const root = createRoot(exportRoot);

  try {
    await document.fonts.ready;
    const explicitFontCss = await getImageFontEmbedCss(settings.fontKey);

    for (const [index, pageCells] of pages.entries()) {
      flushSync(() => {
        root.render(
          <CopybookPage
            pageCells={pageCells}
            settings={settings}
            layout={layout}
            fontFamily={fontFamily}
            useHanziWriterGlyph={useHanziWriterGlyph}
          />,
        );
      });

      await waitForPaint();
      const pageElement = exportRoot.firstElementChild as HTMLElement | null;
      if (!pageElement) {
        throw new Error('页面图片生成失败，请稍后重试。');
      }

      const discoveredFontCss = await getFontEmbedCSS(pageElement);
      const imageDataUrl = await toPng(pageElement, {
        pixelRatio: EXPORT_PIXEL_RATIO,
        cacheBust: true,
        backgroundColor: '#ffffff',
        fontEmbedCSS: `${discoveredFontCss}\n${explicitFontCss}`,
        style: {
          boxShadow: 'none',
          fontFamily,
        },
      });
      const imageName = `汉字字帖-${date}-第${index + 1}页.png`;

      downloadDataUrl(imageDataUrl, imageName);
      await addImagePage(pdfDoc, imageDataUrl, layout);
    }
  } finally {
    root.unmount();
    exportRoot.remove();
  }

  const bytes = await pdfDoc.save();
  const arrayBuffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
  return new Blob([arrayBuffer], { type: 'application/pdf' });
}

async function addImagePage(pdfDoc: PDFDocument, imageDataUrl: string, layout: PageLayout) {
  const image = await pdfDoc.embedPng(dataUrlToArrayBuffer(imageDataUrl));
  const pageWidth = mm(layout.pageWidthMm);
  const pageHeight = mm(layout.pageHeightMm);
  const page = pdfDoc.addPage([pageWidth, pageHeight]);

  page.drawImage(image, {
    x: 0,
    y: 0,
    width: pageWidth,
    height: pageHeight,
  });
}

function downloadDataUrl(dataUrl: string, fileName: string) {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = fileName;
  link.click();
}

function dataUrlToArrayBuffer(dataUrl: string) {
  const base64 = dataUrl.split(',')[1];
  const binary = window.atob(base64);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes.buffer;
}

function waitForPaint() {
  return new Promise<void>((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  });
}

function mm(value: number) {
  return value * MM_TO_PT;
}
