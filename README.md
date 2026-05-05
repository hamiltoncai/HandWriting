# 汉字字帖生成器

Help children practice handwriting.

React + TypeScript + Tailwind CSS 实现的汉字字帖自动生成应用，支持笔顺、描红和空白练习模式，并使用 Hanzi Writer 开源笔顺数据绘制真实 SVG 笔画。

## 安装与运行

```bash
npm install
npm run dev
```

`npm install` 会自动把 Hanzi Writer 笔顺 JSON 复制到 `public/hanzi-writer-data`，开发和构建前也会自动检查复制。

开发服务器默认运行在：

```text
http://127.0.0.1:5173/
```

生产构建：

```bash
npm run build
npm run preview
```

## 功能

- 输入单个或多个汉字
- 自动去除重复字
- 设置每字重复次数、每行字数和字格大小
- 支持字体选择，内置毛笔、硬笔和铅笔练习风格字体
- 铅笔练习字体包含 Klee One、Zen Kurenaido、霞鹜文楷、霞鹜文楷屏幕版等
- 支持笔顺、描红、空白练习三种模式
- 支持田字格、米字格、回宫格、十字格、空白方格
- A4 页面实时预览
- 使用 pdf-lib 生成可打印 PDF
- PDF 中网格和汉字笔画均为矢量绘制，不依赖网页截图
- 描红 PDF 会嵌入所选内置字体；系统字体用于浏览器预览，导出时会回退为矢量笔画轮廓

## 主要目录

```text
src/App.tsx                  应用入口和状态管理
src/components/              设置面板、A4 预览、字格和字形组件
src/lib/hanziData.ts         Hanzi Writer 笔顺数据加载
src/lib/fonts.ts             字体选项与 PDF 字体资源
src/lib/layout.ts            A4 页面与字格排版计算
src/lib/pdf.ts               PDF 矢量生成逻辑
src/lib/text.ts              汉字输入清洗与去重
src/types/copybook.ts        类型定义
```
