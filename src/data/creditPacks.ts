/** Credit packs. Users see USD (1 credit = 1 USD) but pay in rand on Yoco at the fixed amounts below.
 *  Keep in sync with the credit_packs table (supabase/credit_payment_claims.sql). */
export interface CreditPack {
  credits: number;
  usd: number;
  zar: number;
  url: string;
}

export const CREDIT_PACKS: CreditPack[] = [
  { credits: 20, usd: 20, zar: 336, url: 'https://pay.yoco.com/mergemega?amount=336' },
  { credits: 50, usd: 50, zar: 840, url: 'https://pay.yoco.com/mergemega?amount=840' },
  { credits: 100, usd: 100, zar: 1680, url: 'https://pay.yoco.com/mergemega?amount=1680' },
  { credits: 250, usd: 250, zar: 4200, url: 'https://pay.yoco.com/mergemega?amount=4200' },
];

export const SUPPORT_EMAIL = 'peter@signalmerge.co.za';
export const formatZar = (n: number) => `R${n.toLocaleString('en-ZA')}`;
