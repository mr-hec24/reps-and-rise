import { Linking } from 'react-native';

const STRIPE_DONATION_URL = process.env.EXPO_PUBLIC_STRIPE_DONATION_URL;

export type OpenDonationResult =
  | { ok: true }
  | { ok: false; reason: 'not-configured' | 'invalid-url' | 'open-failed' };

export async function openDonationCheckout(tierId: string): Promise<OpenDonationResult> {
  if (!STRIPE_DONATION_URL) {
    return { ok: false, reason: 'not-configured' };
  }

  const separator = STRIPE_DONATION_URL.includes('?') ? '&' : '?';
  const targetUrl = `${STRIPE_DONATION_URL}${separator}tier=${encodeURIComponent(tierId)}`;

  const canOpen = await Linking.canOpenURL(targetUrl);
  if (!canOpen) {
    return { ok: false, reason: 'invalid-url' };
  }

  try {
    await Linking.openURL(targetUrl);
    return { ok: true };
  } catch {
    return { ok: false, reason: 'open-failed' };
  }
}
