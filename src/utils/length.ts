export function feetAndInchesToInches(feet: number, inches: number): number {
  return feet * 12 + inches;
}

export function inchesToFeetAndInches(totalInches: number): { feet: number; inches: number } {
  return {
    feet: Math.floor(totalInches / 12),
    inches: totalInches % 12,
  };
}

export function formatFeetInches(totalInches: number): string {
  const { feet, inches } = inchesToFeetAndInches(totalInches);
  return `${feet}'${inches}"`;
}
