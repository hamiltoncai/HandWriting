export function normalizeHanzi(input: string, removeDuplicates: boolean): string[] {
  const chars = Array.from(input).filter((char) => /\p{Script=Han}/u.test(char));

  if (!removeDuplicates) {
    return chars;
  }

  const seen = new Set<string>();
  return chars.filter((char) => {
    if (seen.has(char)) return false;
    seen.add(char);
    return true;
  });
}
