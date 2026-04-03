import crypto from 'crypto';

export function generateInviteCode(): string {
  // Generate a 6-character alphanumeric code (uppercase)
  return crypto.randomBytes(4).toString('hex').slice(0, 6).toUpperCase();
}

export function generateSecureToken(): string {
  return crypto.randomBytes(32).toString('hex');
}
