import { Bold, Download, FileText, Italic, RefreshCw } from 'lucide-react';
import { GRID_LABELS, MODE_LABELS } from '../lib/constants';
import { FONT_LABELS, getCopybookFont } from '../lib/fonts';
import type { CopybookSettings, CopybookMode, GridStyle, CopybookFontKey } from '../types/copybook';

interface ControlPanelProps {
  settings: CopybookSettings;
  loading: boolean;
  onChange: (settings: CopybookSettings) => void;
  onGeneratePdf: () => void;
}

export function ControlPanel({ settings, loading, onChange, onGeneratePdf }: ControlPanelProps) {
  const update = <K extends keyof CopybookSettings>(key: K, value: CopybookSettings[K]) => {
    onChange({ ...settings, [key]: value });
  };

  return (
    <aside className="w-full shrink-0 border-r border-stone-200 bg-white/88 p-5 shadow-sm lg:w-[360px]">
      <div className="space-y-5">
        <label className="block">
          <span className="text-sm font-semibold text-slate-700">汉字内容</span>
          <textarea
            value={settings.text}
            onChange={(event) => update('text', event.target.value)}
            className="mt-2 min-h-32 w-full resize-y rounded-md border border-stone-300 bg-white px-3 py-2 text-lg leading-8 outline-none transition focus:border-red-400 focus:ring-2 focus:ring-red-100 font-kai"
            placeholder="请输入要练习的汉字"
          />
        </label>

        <label className="flex items-center justify-between gap-3 rounded-md border border-stone-200 px-3 py-2">
          <span className="text-sm font-medium text-slate-700">自动去除重复字</span>
          <input
            type="checkbox"
            checked={settings.removeDuplicates}
            onChange={(event) => update('removeDuplicates', event.target.checked)}
            className="h-5 w-5 accent-red-500"
          />
        </label>

        <SelectRow
          label="字帖模式"
          value={settings.mode}
          options={MODE_LABELS}
          onChange={(value) => update('mode', value as CopybookMode)}
        />

        <SelectRow
          label="田字格样式"
          value={settings.gridStyle}
          options={GRID_LABELS}
          onChange={(value) => update('gridStyle', value as GridStyle)}
        />

        <SelectRow
          label="字体选择"
          value={settings.fontKey}
          options={FONT_LABELS}
          onChange={(value) => update('fontKey', value as CopybookFontKey)}
        />

        <div
          className="rounded-md border border-stone-200 bg-stone-50 px-3 py-3 text-center text-3xl leading-tight text-slate-900"
          style={{
            fontFamily: getCopybookFont(settings.fontKey).cssFamily,
            fontWeight: settings.fontBold ? 700 : 400,
            fontStyle: settings.fontItalic ? 'italic' : 'normal',
          }}
        >
          永和九年
        </div>

        <div className="rounded-md border border-stone-200 px-3 py-3">
          <span className="text-sm font-semibold text-slate-700">功能选择框</span>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <ToggleButton
              active={settings.fontBold}
              label="加粗"
              onClick={() => update('fontBold', !settings.fontBold)}
            >
              <Bold className="h-4 w-4" />
              加粗
            </ToggleButton>
            <ToggleButton
              active={settings.fontItalic}
              label="斜体"
              onClick={() => update('fontItalic', !settings.fontItalic)}
            >
              <Italic className="h-4 w-4" />
              斜体
            </ToggleButton>
          </div>
        </div>

        {(settings.mode === 'stroke' || settings.mode === 'tracing') && (
          <label className="flex items-center justify-between gap-3 rounded-md border border-stone-200 px-3 py-2">
            <span className="text-sm font-medium text-slate-700">描红使用红色字体</span>
            <input
              type="checkbox"
              checked={settings.traceRedText}
              onChange={(event) => update('traceRedText', event.target.checked)}
              className="h-5 w-5 accent-red-500"
            />
          </label>
        )}

        <SelectRow
          label="字格大小"
          value={String(settings.cellSizeCm)}
          options={{ '1.3': '1.3cm', '1.5': '1.5cm', '2': '2.0cm' }}
          onChange={(value) => update('cellSizeCm', Number(value))}
        />

        <NumberInput
          label="每行字数"
          value={settings.columns}
          min={4}
          max={12}
          onChange={(value) => update('columns', value)}
        />

        <NumberInput
          label="每字重复次数"
          value={settings.repeatCount}
          min={1}
          max={8}
          onChange={(value) => update('repeatCount', value)}
        />

        {settings.mode === 'stroke' && (
          <label className="flex items-center justify-between gap-3 rounded-md border border-stone-200 px-3 py-2">
            <span className="text-sm font-medium text-slate-700">笔顺后追加一行描红</span>
            <input
              type="checkbox"
              checked={settings.strokeExtraTraceRow}
              onChange={(event) => update('strokeExtraTraceRow', event.target.checked)}
              className="h-5 w-5 accent-red-500"
            />
          </label>
        )}

        {(settings.mode === 'stroke' || settings.mode === 'tracing') && (
          <label className="flex items-center justify-between gap-3 rounded-md border border-stone-200 px-3 py-2">
            <span className="text-sm font-medium text-slate-700">每字后追加一行空白练习</span>
            <input
              type="checkbox"
              checked={settings.extraBlankPracticeRow}
              onChange={(event) => update('extraBlankPracticeRow', event.target.checked)}
              className="h-5 w-5 accent-red-500"
            />
          </label>
        )}

        <button
          type="button"
          onClick={onGeneratePdf}
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-md bg-red-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-300"
        >
          {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          生成 PDF
        </button>

        <div className="flex items-start gap-2 rounded-md bg-stone-100 px-3 py-3 text-xs leading-5 text-slate-600">
          <FileText className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
          <span>笔顺模式使用 Hanzi Writer 真实笔画路径；描红模式会优先在 PDF 中嵌入所选内置字体。</span>
        </div>
      </div>
    </aside>
  );
}

interface ToggleButtonProps {
  active: boolean;
  label: string;
  children: React.ReactNode;
  onClick: () => void;
}

function ToggleButton({ active, label, children, onClick }: ToggleButtonProps) {
  return (
    <button
      type="button"
      aria-pressed={active}
      title={label}
      onClick={onClick}
      className={`flex h-10 items-center justify-center gap-2 rounded-md border px-3 text-sm font-semibold transition ${
        active
          ? 'border-red-500 bg-red-50 text-red-700 shadow-sm'
          : 'border-stone-300 bg-white text-slate-700 hover:border-red-300 hover:bg-red-50/50'
      }`}
    >
      {children}
    </button>
  );
}

interface SelectRowProps {
  label: string;
  value: string;
  options: Record<string, string>;
  onChange: (value: string) => void;
}

function SelectRow({ label, value, options, onChange }: SelectRowProps) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-red-400 focus:ring-2 focus:ring-red-100"
      >
        {Object.entries(options).map(([optionValue, labelText]) => (
          <option key={optionValue} value={optionValue}>
            {labelText}
          </option>
        ))}
      </select>
    </label>
  );
}

interface NumberInputProps {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}

function NumberInput({ label, value, min, max, onChange }: NumberInputProps) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        onChange={(event) => onChange(clamp(Number(event.target.value), min, max))}
        className="mt-2 w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-red-400 focus:ring-2 focus:ring-red-100"
      />
    </label>
  );
}

function clamp(value: number, min: number, max: number) {
  if (Number.isNaN(value)) return min;
  return Math.min(max, Math.max(min, value));
}
