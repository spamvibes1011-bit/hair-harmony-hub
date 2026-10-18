import { describe, expect, it } from 'vitest';
import { addOwnedProduct, productNumber, resolveProductNumber } from '@/components/bodywise/product-numbers';
describe('Product entry', () => {
  it('matches entered demo product numbers and scanned values identically', () => {
    expect(resolveProductNumber(' 1003 ')).toBe('biotin-gummies');
    expect(productNumber('biotin-gummies')).toBe('1003');
  });
  it('does not guess unknown barcode identities', () => {
    expect(resolveProductNumber('8901234567890')).toBeUndefined();
  });
  it('adds recognised products without duplicates', () => {
    const ids = addOwnedProduct(['hair-growth-roll-on'], 'biotin-gummies');
    expect(ids).toEqual(['hair-growth-roll-on', 'biotin-gummies']);
    expect(addOwnedProduct(ids, 'biotin-gummies')).toEqual(ids);
  });
  it('rejects unknown products', () => {
    expect(addOwnedProduct([], 'unknown')).toEqual([]);
  });
});