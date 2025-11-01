/**
 * Phone number utility functions
 */

/**
 * Format phone number for display
 * Example: +12025551234 -> +1 (202) 555-1234
 */
export function formatPhoneNumber(phone: string): string {
  // Remove all non-digit characters except +
  const cleaned = phone.replace(/[^\d+]/g, '');
  
  // Check if it's a US/Canada number (+1)
  if (cleaned.startsWith('+1') && cleaned.length === 12) {
    const firstThree = cleaned.slice(2, 5);
    const nextThree = cleaned.slice(5, 8);
    const lastFour = cleaned.slice(8, 12);
    return `+1 (${firstThree}) ${nextThree}-${lastFour}`;
  }
  
  // For other countries, format as (XXX) XXX-XXXX
  if (cleaned.startsWith('+')) {
    const countryCode = cleaned.slice(0, cleaned.length - 10);
    const remaining = cleaned.slice(-10);
    if (remaining.length === 10) {
      const firstThree = remaining.slice(0, 3);
      const nextThree = remaining.slice(3, 6);
      const lastFour = remaining.slice(6, 10);
      return `${countryCode} (${firstThree}) ${nextThree}-${lastFour}`;
    }
    return cleaned.slice(0, 3) + ' ' + cleaned.slice(3);
  }
  
  return cleaned;
}

/**
 * Validate phone number format
 * Must start with + and have at least 10 digits
 */
export function isValidPhoneNumber(phone: string): boolean {
  // Remove all non-digit characters except +
  const cleaned = phone.replace(/[^\d+]/g, '');
  
  // Must start with + and have at least 10 digits after country code
  if (!cleaned.startsWith('+')) {
    return false;
  }
  
  // Remove the + and check if we have at least 10 digits
  const digits = cleaned.slice(1);
  return digits.length >= 10 && digits.length <= 15;
}

/**
 * Normalize phone number to E.164 format
 * Example: (202) 555-1234 -> +12025551234
 */
export function normalizePhoneNumber(phone: string, defaultCountryCode: string = '+1'): string {
  // Remove all non-digit characters except +
  let cleaned = phone.replace(/[^\d+]/g, '');
  
  // If no country code, add default
  if (!cleaned.startsWith('+')) {
    cleaned = defaultCountryCode + cleaned;
  }
  
  return cleaned;
}

/**
 * Get phone number validation error message
 */
export function getPhoneValidationError(phone: string): string | null {
  if (!phone || phone.trim().length === 0) {
    return 'Phone number is required';
  }
  
  const cleaned = phone.replace(/[^\d+]/g, '');
  
  if (!cleaned.startsWith('+')) {
    return 'Phone number must include country code (e.g., +1 for US/Canada)';
  }
  
  const digits = cleaned.slice(1);
  
  if (digits.length < 10) {
    return 'Phone number is too short';
  }
  
  if (digits.length > 15) {
    return 'Phone number is too long';
  }
  
  if (!/^\d+$/.test(digits)) {
    return 'Phone number contains invalid characters';
  }
  
  return null;
}

/**
 * Mask phone number for display (show last 4 digits)
 * Example: +12025551234 -> +1 (***) ***-1234
 */
export function maskPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/[^\d+]/g, '');
  
  if (cleaned.startsWith('+1') && cleaned.length === 12) {
    const lastFour = cleaned.slice(-4);
    return `+1 (***) ***-${lastFour}`;
  }
  
  // For other formats, just show last 4 digits
  const lastFour = cleaned.slice(-4);
  return '***' + lastFour;
}
