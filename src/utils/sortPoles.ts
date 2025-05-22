import type { Pole } from '../db/db';

export function sortPoles(poles: Pole[], sortBy: 'brand' | 'length' | 'weight', dir: 'asc' | 'desc') {
  return [...poles].sort((a, b) => {
    // Get primary sort key
    const primaryA = getValue(a, sortBy);
    const primaryB = getValue(b, sortBy);

    const primaryCompare = compare(primaryA, primaryB, dir);
    if (primaryCompare !== 0) return primaryCompare;

    // Fallback: always tie-break with length then weight ascending
    const lengthCompare = a.length - b.length;
    if (lengthCompare !== 0) return dir === 'asc' ? lengthCompare : -lengthCompare;

    const weightCompare = (a.weightRating ?? 0) - (b.weightRating ?? 0);
    return dir === 'asc' ? weightCompare : -weightCompare;
  });
}

function compare(a: any, b: any, dir: 'asc' | 'desc') {
  const cmp = typeof a === 'string' ? a.localeCompare(b) : a - b;
  return dir === 'asc' ? cmp : -cmp;
}

function getValue(pole: Pole, key: 'brand' | 'length' | 'weight') {
  if (key === 'weight') return pole.weightRating ?? 0;
  return pole[key];
}
