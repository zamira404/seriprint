export const BRAND = "UNAWATUNA";

export const CATEGORY_SLUGS = [
  "donna",
  "uomo",
  "bambino",
  "shopper",
  "casa",
  "canvas",
] as const;

export type CategorySlug = (typeof CATEGORY_SLUGS)[number];

export const PRODUCT_CATEGORY_ORDER = [
  "donna",
  "uomo",
  "bambino",
  "casa",
  "canvas",
] as const;

export const UI = {
  maxCloudFiles: 200,
} as const;
