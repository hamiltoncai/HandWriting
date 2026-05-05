import { useEffect, useMemo, useState } from 'react';
import { PenTool } from 'lucide-react';
import { ControlPanel } from './components/ControlPanel';
import { A4Preview } from './components/A4Preview';
import { DEFAULT_SETTINGS } from './lib/constants';
import { loadStrokeData } from './lib/hanziData';
import { buildCopybookCells, createLayout } from './lib/layout';
import { generateCopybookPdfFromImages } from './lib/imagePdf';
import { normalizeHanzi } from './lib/text';
import type { CopybookSettings, HanziStrokeData } from './types/copybook';

export default function App() {
  const [settings, setSettings] = useState<CopybookSettings>(DEFAULT_SETTINGS);
  const [strokeData, setStrokeData] = useState<Map<string, HanziStrokeData>>(new Map());
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const chars = useMemo(
    () => normalizeHanzi(settings.text, settings.removeDuplicates),
    [settings.text, settings.removeDuplicates],
  );

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    loadStrokeData(chars)
      .then((data) => {
        if (!cancelled) setStrokeData(data);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [chars.join('')]);

  const layout = useMemo(() => createLayout(settings), [settings]);
  const cells = useMemo(() => buildCopybookCells(settings, strokeData, chars), [settings, strokeData, chars]);
  const unsupportedChars = useMemo(
    () => Array.from(strokeData.values()).filter((item) => item.strokes.length === 0).map((item) => item.character),
    [strokeData],
  );

  const handleGeneratePdf = async () => {
    if (loading) return;

    setGenerating(true);
    setErrorMessage('');
    try {
      const blob = await generateCopybookPdfFromImages(settings, layout, cells);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `汉字字帖-${new Date().toISOString().slice(0, 10)}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
      setErrorMessage(error instanceof Error ? error.message : 'PDF 生成失败，请稍后重试。');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-100 text-slate-900">
      <header className="sticky top-0 z-10 border-b border-stone-200 bg-white/95 px-5 py-4 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-md bg-red-600 text-white">
            <PenTool className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-normal text-slate-900">汉字字帖生成器</h1>
            <p className="text-sm text-slate-500">笔顺、描红与空白练习 PDF 自动生成</p>
          </div>
        </div>
      </header>

      <div className="flex min-h-[calc(100vh-73px)] flex-col lg:flex-row">
        <ControlPanel
          settings={settings}
          loading={loading || generating}
          onChange={setSettings}
          onGeneratePdf={handleGeneratePdf}
        />
        <A4Preview
          settings={settings}
          layout={layout}
          cells={cells}
          loading={loading}
          unsupportedChars={unsupportedChars}
          errorMessage={errorMessage}
        />
      </div>
    </div>
  );
}
