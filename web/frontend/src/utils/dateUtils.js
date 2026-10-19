/**
 * Safe Date Formatting Utilities
 *
 * Provides date formatting functions that handle invalid/null dates gracefully
 * to prevent "Invalid time value" errors
 */

/**
 * Safely parse a date string to Date object
 * Returns null if date is invalid
 *
 * @param {string|Date} dateString - Date string or Date object
 * @returns {Date|null}
 */
export const safeParseDate = (dateString) => {
  if (!dateString) return null;
  try {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? null : date;
  } catch {
    return null;
  }
};

/**
 * Safely format date to localized string
 * Returns fallback if date is invalid
 *
 * @param {string|Date} dateString - Date string or Date object
 * @param {object} options - Intl.DateTimeFormat options
 * @param {string} fallback - Value to return if date is invalid
 * @returns {string}
 */
export const safeFormatDate = (dateString, options = {}, fallback = '-') => {
  const date = safeParseDate(dateString);
  if (!date) return fallback;
  try {
    return date.toLocaleDateString('id-ID', options);
  } catch {
    return fallback;
  }
};

/**
 * Safely format time to localized string
 * Returns fallback if date is invalid
 *
 * @param {string|Date} dateString - Date string or Date object
 * @param {object} options - Intl.DateTimeFormat options
 * @param {string} fallback - Value to return if date is invalid
 * @returns {string}
 */
export const safeFormatTime = (dateString, options = { hour: '2-digit', minute: '2-digit' }, fallback = '') => {
  const date = safeParseDate(dateString);
  if (!date) return fallback;
  try {
    return date.toLocaleTimeString('id-ID', options);
  } catch {
    return fallback;
  }
};

/**
 * Safely format relative time (e.g., "5 menit lalu")
 * Returns fallback if date is invalid
 *
 * @param {string|Date} dateString - Date string or Date object
 * @param {string} fallback - Value to return if date is invalid
 * @returns {string}
 */
export const safeFormatTimeAgo = (dateString, fallback = '-') => {
  const date = safeParseDate(dateString);
  if (!date) return fallback;

  try {
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 0) return 'Baru saja';
    if (diffInSeconds < 60) return 'Baru saja';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} menit lalu`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} jam lalu`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} hari lalu`;
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
  } catch {
    return fallback;
  }
};

/**
 * Safely get ISO string from date
 * Returns empty string if date is invalid
 *
 * @param {string|Date} dateString - Date string or Date object
 * @returns {string}
 */
export const safeToISOString = (dateString) => {
  const date = safeParseDate(dateString);
  return date ? date.toISOString() : '';
};
