import type { HanziStrokeData } from '../types/copybook';

interface HanziWriterJson {
  strokes?: string[];
}

export async function loadStrokeData(chars: string[]): Promise<Map<string, HanziStrokeData>> {
  const uniqueChars = Array.from(new Set(chars));
  const entries = await Promise.all(uniqueChars.map(loadOneCharacter));
  return new Map(entries.map((entry) => [entry.character, entry]));
}

async function loadOneCharacter(character: string): Promise<HanziStrokeData> {
  try {
    const response = await fetch(
      `${import.meta.env.BASE_URL}hanzi-writer-data/${encodeURIComponent(character)}.json`,
    );

    if (!response.ok) {
      throw new Error(`No stroke data for ${character}`);
    }

    const data = await response.json() as HanziWriterJson;
    return {
      character,
      strokes: data.strokes ?? [],
      source: 'hanzi-writer-data',
    };
  } catch {
    return {
      character,
      strokes: [],
      source: 'fallback-font',
    };
  }
}
