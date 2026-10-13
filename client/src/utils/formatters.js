const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';

/**
 * Format rating to one decimal place (e.g. 7.8)
 * @param {number|string} rating 
 * @returns {string}
 */
export function formatRating(rating) {
  if (rating === null || rating === undefined || isNaN(rating)) return 'N/A';
  return Number(rating).toFixed(1);
}

/**
 * Format movie runtime in minutes to "Xh Ym"
 * @param {number|string} minutes 
 * @returns {string}
 */
export function formatRuntime(minutes) {
  if (!minutes || isNaN(minutes) || minutes <= 0) return 'N/A';
  const mins = Math.round(Number(minutes));
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

/**
 * Format date string to "Oct 13, 2026"
 * @param {string} dateString 
 * @returns {string}
 */
export function formatDate(dateString) {
  if (!dateString) return 'TBA';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
}

/**
 * Extract release year from date string (e.g. "2026")
 * @param {string} dateString 
 * @returns {string}
 */
export function formatYear(dateString) {
  if (!dateString) return 'TBA';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) {
      const match = String(dateString).match(/\b(19\d\d|20\d\d)\b/);
      return match ? match[0] : 'TBA';
    }
    return String(d.getFullYear());
  } catch {
    return 'TBA';
  }
}

/**
 * Format vote count (e.g. 1200 -> "1.2K", 3400000 -> "3.4M")
 * @param {number|string} count 
 * @returns {string}
 */
export function formatVoteCount(count) {
  if (count === null || count === undefined || isNaN(count)) return '0';
  const num = Number(count);
  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(1)}M`;
  }
  if (num >= 1_000) {
    return `${(num / 1_000).toFixed(1)}K`;
  }
  return num.toLocaleString();
}

/**
 * Get TMDB poster/image URL with fallback placeholder
 * @param {string} path 
 * @param {string} size - e.g. 'w500', 'w342', 'w780', 'original'
 * @returns {string}
 */
export function getImageUrl(path, size = 'w500') {
  if (!path) {
    return 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=500&q=80';
  }
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${TMDB_IMAGE_BASE}/${size}${cleanPath}`;
}

/**
 * Get TMDB backdrop URL with fallback placeholder
 * @param {string} path 
 * @param {string} size - e.g. 'w1280', 'w1920', 'original'
 * @returns {string}
 */
export function getBackdropUrl(path, size = 'w1280') {
  if (!path) {
    return 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=1280&q=80';
  }
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${TMDB_IMAGE_BASE}/${size}${cleanPath}`;
}

/**
 * Format currency in millions or billions (e.g. $165M)
 * @param {number} amount 
 * @returns {string}
 */
export function formatCurrency(amount) {
  if (!amount || isNaN(amount) || amount <= 0) return 'N/A';
  if (amount >= 1_000_000_000) {
    return `$${(amount / 1_000_000_000).toFixed(2)}B`;
  }
  if (amount >= 1_000_000) {
    return `$${(amount / 1_000_000).toFixed(1)}M`;
  }
  return `$${amount.toLocaleString()}`;
}
