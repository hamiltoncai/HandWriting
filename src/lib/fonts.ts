import maShanZhengWoff from '@fontsource/ma-shan-zheng/files/ma-shan-zheng-chinese-simplified-400-normal.woff?url';
import liuJianMaoCaoWoff from '@fontsource/liu-jian-mao-cao/files/liu-jian-mao-cao-chinese-simplified-400-normal.woff?url';
import longCangWoff from '@fontsource/long-cang/files/long-cang-chinese-simplified-400-normal.woff?url';
import zcoolXiaoWeiWoff from '@fontsource/zcool-xiaowei/files/zcool-xiaowei-chinese-simplified-400-normal.woff?url';
import zcoolKuaiLeWoff from '@fontsource/zcool-kuaile/files/zcool-kuaile-chinese-simplified-400-normal.woff?url';
import kleeOneWoff from '@fontsource/klee-one/files/klee-one-japanese-400-normal.woff?url';
import zenKurenaidoWoff from '@fontsource/zen-kurenaido/files/zen-kurenaido-japanese-400-normal.woff?url';
import type { CopybookFontKey } from '../types/copybook';

interface CopybookFont {
  label: string;
  cssFamily: string;
  pdfFontUrl?: string;
  isEmbedded: boolean;
  usesHanziWriterStrokes?: boolean;
}

export const COPYBOOK_FONTS: Record<CopybookFontKey, CopybookFont> = {
  'hanzi-writer': {
    label: 'Hanzi Writer 笔画体',
    cssFamily: '"Kaiti SC", "STKaiti", "KaiTi", serif',
    isEmbedded: false,
    usesHanziWriterStrokes: true,
  },
  'ma-shan-zheng': {
    label: '马善政毛笔楷',
    cssFamily: '"Ma Shan Zheng", "Kaiti SC", "STKaiti", serif',
    pdfFontUrl: maShanZhengWoff,
    isEmbedded: true,
  },
  'liu-jian-mao-cao': {
    label: '刘建毛草',
    cssFamily: '"Liu Jian Mao Cao", "STXingkai", "Kaiti SC", cursive',
    pdfFontUrl: liuJianMaoCaoWoff,
    isEmbedded: true,
  },
  'long-cang': {
    label: '龙藏体',
    cssFamily: '"Long Cang", "STXingkai", "Kaiti SC", cursive',
    pdfFontUrl: longCangWoff,
    isEmbedded: true,
  },
  'zcool-xiaowei': {
    label: '站酷小薇楷',
    cssFamily: '"ZCOOL XiaoWei", "Kaiti SC", "STKaiti", serif',
    pdfFontUrl: zcoolXiaoWeiWoff,
    isEmbedded: true,
  },
  'zcool-kuaile': {
    label: '站酷快乐体',
    cssFamily: '"ZCOOL KuaiLe", "Kaiti SC", "STKaiti", serif',
    pdfFontUrl: zcoolKuaiLeWoff,
    isEmbedded: true,
  },
  'klee-one-pencil': {
    label: '铅笔练习 Klee One',
    cssFamily: '"Klee One", "LXGW WenKai", "Kaiti SC", serif',
    pdfFontUrl: kleeOneWoff,
    isEmbedded: true,
  },
  'zen-kurenaido-pencil': {
    label: '铅笔手写 Zen',
    cssFamily: '"Zen Kurenaido", "LXGW WenKai", "Kaiti SC", serif',
    pdfFontUrl: zenKurenaidoWoff,
    isEmbedded: true,
  },
  'lxgw-wenkai-pencil': {
    label: '铅笔楷体 霞鹜文楷',
    cssFamily: '"LXGW WenKai", "Kaiti SC", "STKaiti", serif',
    isEmbedded: false,
  },
  'lxgw-wenkai-screen-pencil': {
    label: '铅笔楷体 霞鹜屏幕',
    cssFamily: '"LXGW WenKai Screen", "Kaiti SC", "STKaiti", serif',
    isEmbedded: false,
  },
  'system-kaiti': {
    label: '系统楷体',
    cssFamily: '"Kaiti SC", "STKaiti", "KaiTi", serif',
    isEmbedded: false,
  },
  'system-hard-pen': {
    label: '系统硬笔楷书',
    cssFamily: '"KaiTi_GB2312", "KaiTi", "Kaiti SC", "STKaiti", serif',
    isEmbedded: false,
  },
  'system-yuanti': {
    label: '系统圆体铅笔',
    cssFamily: '"Yuanti SC", "YouYuan", "PingFang SC", "Kaiti SC", sans-serif',
    isEmbedded: false,
  },
  'system-xingkai': {
    label: '系统行楷',
    cssFamily: '"STXingkai", "Xingkai SC", "Kaiti SC", cursive',
    isEmbedded: false,
  },
  'system-lishu': {
    label: '系统隶书',
    cssFamily: '"LiSu", "STLiti", "Kaiti SC", serif',
    isEmbedded: false,
  },
  'system-fangsong': {
    label: '系统仿宋',
    cssFamily: '"FangSong", "STFangsong", "FangSong_GB2312", serif',
    isEmbedded: false,
  },
};

export const DEFAULT_PDF_FONT_KEY: CopybookFontKey = 'ma-shan-zheng';

export const FONT_LABELS = Object.fromEntries(
  Object.entries(COPYBOOK_FONTS).map(([key, font]) => [key, font.label]),
) as Record<CopybookFontKey, string>;

export function getCopybookFont(key: CopybookFontKey) {
  return COPYBOOK_FONTS[key] ?? COPYBOOK_FONTS['ma-shan-zheng'];
}

const imageFontCssCache = new Map<string, string>();

export async function getImageFontEmbedCss(key: CopybookFontKey) {
  const font = getCopybookFont(key);
  if (!font.pdfFontUrl) return '';

  const cacheKey = `${getFontFaceName(font.cssFamily)}:${font.pdfFontUrl}`;
  const cached = imageFontCssCache.get(cacheKey);
  if (cached) return cached;

  const response = await fetch(font.pdfFontUrl);
  if (!response.ok) return '';

  const fontData = await response.arrayBuffer();
  const css = `@font-face {
    font-family: "${getFontFaceName(font.cssFamily)}";
    src: url("${arrayBufferToDataUrl(fontData, 'font/woff')}") format("woff");
    font-weight: 400;
    font-style: normal;
    font-display: swap;
  }`;
  imageFontCssCache.set(cacheKey, css);
  return css;
}

function getFontFaceName(cssFamily: string) {
  const quotedName = cssFamily.match(/^"([^"]+)"/);
  if (quotedName) return quotedName[1];
  return cssFamily.split(',')[0].trim();
}

function arrayBufferToDataUrl(buffer: ArrayBuffer, mimeType: string) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  const chunkSize = 0x8000;

  for (let index = 0; index < bytes.length; index += chunkSize) {
    const chunk = bytes.subarray(index, index + chunkSize);
    binary += String.fromCharCode(...chunk);
  }

  return `data:${mimeType};base64,${btoa(binary)}`;
}
