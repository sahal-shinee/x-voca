// FingerprintJS setup for anti-spam voting
import FingerprintJS from '@fingerprintjs/fingerprintjs';

let fpPromise = null;

export async function getFingerprint() {
  if (!fpPromise) {
    fpPromise = FingerprintJS.load();
  }

  try {
    const fp = await fpPromise;
    const result = await fp.get();
    return result.visitorId;
  } catch (error) {
    console.error('Failed to get fingerprint:', error);
    // Fallback to a random ID if FingerprintJS fails
    return `fallback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Check if user has already voted
export function hasVoted(gameId, periodKey) {
  const key = `xvoca_voted_${gameId}_${periodKey}`;
  return localStorage.getItem(key) !== null;
}

// Mark user as voted
export function markVoted(gameId, periodKey) {
  const key = `xvoca_voted_${gameId}_${periodKey}`;
  localStorage.setItem(key, 'true');
}

// Get current period key (format: YYYY-MM)
export function getCurrentPeriodKey() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}
