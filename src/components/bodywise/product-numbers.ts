// These are demo product numbers, not verified manufacturer barcodes.
export const PRODUCT_IDS = ['hair-growth-roll-on', 'hair-fall-shampoo', 'biotin-gummies', 'onion-hair-oil', 'anti-dandruff-shampoo', 'hair-conditioner', 'salicylic-face-wash', 'vitamin-c-serum', 'niacinamide-serum', 'spf-sunscreen', 'body-lotion', 'body-wash', 'underarm-roll-on', 'pcos-gummies'] as const;
export function productNumber(id: string) {
  const index = PRODUCT_IDS.indexOf(id as typeof PRODUCT_IDS[number]);
  return index < 0 ? '' : String(1001 + index);
}
export function resolveProductNumber(number: string) {
  const clean = number.trim();
  return PRODUCT_IDS.find(id => productNumber(id) === clean);
}
export function addOwnedProduct(ids: string[], id: string) {
  return PRODUCT_IDS.some(value => value === id) && !ids.includes(id) ? [...ids, id] : ids;
}