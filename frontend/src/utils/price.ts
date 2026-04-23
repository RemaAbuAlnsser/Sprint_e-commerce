/**
 * Format price from cents to display format
 * All prices in database are stored in cents (e.g., 4646 = 46.46₪)
 * This utility ensures consistent price formatting across the entire application
 */

export const formatPrice = (priceInCents: number): string => {
  const price = priceInCents / 100;
  return `${price.toFixed(2)} ₪`;
};

export const convertCentsToPrice = (priceInCents: number): number => {
  return priceInCents / 100;
};

export const convertPriceToCents = (price: number): number => {
  return Math.round(price * 100);
};
