import { useRef, useState } from 'react';
import { getFontEmbedCSS, toPng } from 'html-to-image';
import { Download, Loader2 } from 'lucide-react';
import { getCopybookFont, getImageFontEmbedCss } from '../lib/fonts';
import { paginateCells } from '../lib/layout';
import { CopybookPage } from './CopybookPage';
import type { CopybookCell, CopybookSettings, PageLayout } from '../types/copybook';

interface A4PreviewProps {
  settings: CopybookSettings;
  layout: PageLayout;
  cells: CopybookCell[];
  loading: boolean;
  unsupportedChars: string[];
  errorMessage: string;
}

export function A4Preview({ settings, layout, cells, loading, unsupportedChars, errorMessage }: A4PreviewProps) {
  const pages = paginateCells(cells, layout.cellsPerPage);
  const previewPages = pages.slice(0, 3);
  const selectedFont = getCopybookFont(settings.fontKey);
  const fontFamily = selectedFont.cssFamily;
  const useHanziWriterGlyph = Boolean(selectedFont.usesHanziWriterStrokes);
  const pageRefs = useRef<Array<HTMLDivElement | null>>([]);
  const [savingImage, setSavingImage] = useState(false);

  const handleSaveImages = async () => {
    setSavingImage(true);
    try {
      await document.fonts.ready;
      const activePages = pageRefs.current.filter(Boolean) as HTMLDivElement[];
      const explicitFontCss = await getImageFontEmbedCss(settings.fontKey);
      for (const [index, pageElement] of activePages.entries()) {
        const discoveredFontCss = await getFontEmbedCSS(pageElement);
        const dataUrl = await toPng(pageElement, {
          pixelRatio: 2.5,
          cacheBust: true,
          backgroundColor: '#ffffff',
          fontEmbedCSS: `${discoveredFontCss}\n${explicitFontCss}`,
          style: {
            boxShadow: 'none',
            fontFamily,
          },
        });
        downloadDataUrl(dataUrl, `汉字字帖预览-${index + 1}.png`);
      }
    } finally {
      setSavingImage(false);
    }
  };

  return (
    <main className="flex-1 overflow-auto bg-stone-100 px-4 py-6 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-800">实时预览</h2>
            <p className="mt-1 text-sm text-slate-500">
              A4 页面，{layout.columns} 列 x {layout.rows} 行，字格 {settings.cellSizeCm}cm
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleSaveImages}
              disabled={loading || savingImage}
              className="flex items-center gap-2 rounded-md bg-slate-900 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {savingImage ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              保存预览图片
            </button>
            <div className="rounded-md bg-white px-3 py-2 text-sm text-slate-600 shadow-sm">
              共 {pages.length} 页 / {cells.length} 个字格
            </div>
          </div>
        </div>

        {unsupportedChars.length > 0 && (
          <div className="mb-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
            以下字符未找到笔顺数据，预览和 PDF 会使用所选字体显示：{unsupportedChars.join('、')}
          </div>
        )}

        {errorMessage && (
          <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            PDF 生成失败：{errorMessage}
          </div>
        )}

        <div className="space-y-8">
          {previewPages.map((pageCells, pageIndex) => (
            <section key={pageIndex} className="mx-auto w-full max-w-[760px]">
              <CopybookPage
                ref={(node) => {
                  pageRefs.current[pageIndex] = node;
                }}
                pageCells={pageCells}
                settings={settings}
                layout={layout}
                fontFamily={fontFamily}
                useHanziWriterGlyph={useHanziWriterGlyph}
                className="shadow-paper"
              >
                {loading && (
                  <div className="absolute inset-0 grid place-items-center bg-white/70">
                    <div className="flex items-center gap-2 rounded-md bg-white px-4 py-3 text-sm text-slate-700 shadow">
                      <Loader2 className="h-4 w-4 animate-spin text-red-500" />
                      正在加载笔顺数据
                    </div>
                  </div>
                )}
              </CopybookPage>
              <p className="mt-2 text-center text-xs text-slate-400">第 {pageIndex + 1} 页</p>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}

function downloadDataUrl(dataUrl: string, fileName: string) {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = fileName;
  link.click();
}
