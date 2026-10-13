import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combines conditional class names and merges Tailwind CSS classes safely
 * @param  {...any} inputs - Class values, objects, or arrays
 * @returns {string} Merged class string
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export default cn;
