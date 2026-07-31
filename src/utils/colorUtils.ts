import { Ball, BallColor, BallSize } from '../types';

export function getBallInfo(num: number): Ball {
  const sanitizedNum = Math.max(0, Math.min(9, Math.floor(num)));
  const size: BallSize = sanitizedNum >= 5 ? 'big' : 'small';

  let color: BallColor;
  let colorName: string;

  if (sanitizedNum === 0) {
    color = 'red-violet';
    colorName = 'Red + Violet';
  } else if (sanitizedNum === 5) {
    color = 'green-violet';
    colorName = 'Green + Violet';
  } else if ([1, 3, 7, 9].includes(sanitizedNum)) {
    color = 'green';
    colorName = 'Green';
  } else {
    color = 'red';
    colorName = 'Red';
  }

  return {
    number: sanitizedNum,
    color,
    size,
    colorName,
  };
}

export function getColorCssGradient(color: BallColor): string {
  switch (color) {
    case 'green':
      return 'bg-gradient-to-br from-emerald-400 via-emerald-600 to-emerald-900 shadow-emerald-500/30 text-white';
    case 'red':
      return 'bg-gradient-to-br from-rose-400 via-rose-600 to-rose-900 shadow-rose-500/30 text-white';
    case 'red-violet':
      // Split red and violet gradient
      return 'bg-gradient-to-r from-rose-600 via-purple-600 to-violet-700 shadow-purple-500/30 text-white';
    case 'green-violet':
      // Split green and violet gradient
      return 'bg-gradient-to-r from-emerald-500 via-teal-600 to-violet-700 shadow-teal-500/30 text-white';
    default:
      return 'bg-zinc-700 text-white';
  }
}

export function getColorBadgeBg(color: BallColor): string {
  switch (color) {
    case 'green':
      return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
    case 'red':
      return 'bg-rose-500/20 text-rose-400 border-rose-500/40';
    case 'red-violet':
      return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
    case 'green-violet':
      return 'bg-teal-500/20 text-teal-300 border-teal-500/40';
  }
}

export function getSizeBadgeBg(size: BallSize): string {
  return size === 'big'
    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
    : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
}
