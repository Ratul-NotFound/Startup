/**
 * geo-currency.ts
 * 
 * Silently detects the visitor's country via IP geolocation API.
 * Falls back to browser timezone if IP API is unavailable.
 * Caches the result in sessionStorage so it only runs once per session.
 * 
 * This is completely invisible to the user — no controls, no UI.
 * All configuration is controlled by admins via Firestore.
 */

const CACHE_KEY = 'subnexus_detected_country';
const API_TIMEOUT_MS = 2000; // 2s — fast enough for geo, safe for slow networks

/**
 * Maps IANA timezone strings to ISO 3166-1 alpha-2 country codes.
 * Only includes relevant South/South-East Asian + common timezones as fallback.
 */
const TIMEZONE_COUNTRY_MAP: Record<string, string> = {
  'Asia/Dhaka': 'BD',
  'Asia/Chittagong': 'BD',
  'Asia/Kolkata': 'IN',
  'Asia/Calcutta': 'IN',
  'Asia/Colombo': 'LK',
  'Asia/Kathmandu': 'NP',
  'Asia/Karachi': 'PK',
  'Asia/Kabul': 'AF',
  'Asia/Rangoon': 'MM',
  'Asia/Yangon': 'MM',
  'Asia/Bangkok': 'TH',
  'Asia/Jakarta': 'ID',
  'Asia/Kuala_Lumpur': 'MY',
  'Asia/Singapore': 'SG',
  'Asia/Manila': 'PH',
  'Asia/Dubai': 'AE',
  'Asia/Riyadh': 'SA',
  'Asia/Tokyo': 'JP',
  'Asia/Shanghai': 'CN',
  'Asia/Seoul': 'KR',
  'Europe/London': 'GB',
  'Europe/Berlin': 'DE',
  'Europe/Paris': 'FR',
  'America/New_York': 'US',
  'America/Chicago': 'US',
  'America/Denver': 'US',
  'America/Los_Angeles': 'US',
  'America/Toronto': 'CA',
  'Australia/Sydney': 'AU',
};

/**
 * Attempts to detect country code via IP geolocation API.
 * Uses a 2-second timeout. Browser caching allowed (no cache: no-store).
 */
async function detectCountryViaIP(): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

    // No cache:'no-store' — allow browser to cache this response for performance
    const response = await fetch('https://ipapi.co/json/', {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) return null;
    const data = await response.json();
    if (data && typeof data.country_code === 'string' && data.country_code.length === 2) {
      return data.country_code.toUpperCase();
    }
    return null;
  } catch {
    // Network error, timeout, or blocked — silently return null
    return null;
  }
}

/**
 * Fallback: detect country from browser timezone string.
 * Less accurate but works offline and has no rate limit.
 */
function detectCountryViaTimezone(): string | null {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return TIMEZONE_COUNTRY_MAP[tz] || null;
  } catch {
    return null;
  }
}

/**
 * Main function: returns the visitor's ISO 3166-1 alpha-2 country code.
 * Order of precedence:
 *   1. sessionStorage cache (fastest — avoids repeated API calls during SPA navigation)
 *   2. IP geolocation API (ipapi.co)
 *   3. Browser timezone heuristic
 *   4. null (caller should default to USD)
 */
export async function detectVisitorCountry(): Promise<string | null> {
  if (typeof window === 'undefined') return null;

  // Check sessionStorage cache first
  try {
    const cached = sessionStorage.getItem(CACHE_KEY);
    if (cached) return cached;
  } catch {
    // sessionStorage may be blocked in some environments
  }

  // Try IP API, fall back to timezone
  const country = (await detectCountryViaIP()) || detectCountryViaTimezone();

  // Cache result for this session
  if (country) {
    try {
      sessionStorage.setItem(CACHE_KEY, country);
    } catch {
      // Ignore storage errors
    }
  }

  return country;
}
