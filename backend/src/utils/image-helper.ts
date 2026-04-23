/**
 * Image Helper Utilities
 * Handles image URL formatting for consistent paths
 */

const BASE_URL = process.env.BASE_URL || 'https://www.magnetixtech.com';

/**
 * Format image URL to include /uploads/ prefix
 * @param filename - Image filename or path
 * @returns Full URL with /uploads/ prefix
 */
export function formatImageUrl(filename: string | null | undefined): string | null {
  if (!filename) return null;
  
  // If already a full URL, return as is
  if (filename.startsWith('http://') || filename.startsWith('https://')) {
    return filename;
  }
  
  // If already has /uploads/, return with base URL
  if (filename.startsWith('/uploads/')) {
    return `${BASE_URL}${filename}`;
  }
  
  // Add /uploads/ prefix
  return `${BASE_URL}/uploads/${filename}`;
}

/**
 * Format product object with proper image URLs
 */
export function formatProductImages(product: any): any {
  if (!product) return product;
  
  return {
    ...product,
    thumbnail: formatImageUrl(product.thumbnail),
    hover_image: formatImageUrl(product.hover_image),
    images: product.images?.map((img: any) => ({
      ...img,
      url: formatImageUrl(img.url)
    })),
    colors: product.colors?.map((color: any) => ({
      ...color,
      image_url: formatImageUrl(color.image_url)
    }))
  };
}

/**
 * Format brand object with proper logo URL
 */
export function formatBrandLogo(brand: any): any {
  if (!brand) return brand;
  
  return {
    ...brand,
    logo_url: formatImageUrl(brand.logo_url),
    logo: formatImageUrl(brand.logo_url)
  };
}

/**
 * Format category object with proper image URL
 */
export function formatCategoryImage(category: any): any {
  if (!category) return category;
  
  return {
    ...category,
    image_url: formatImageUrl(category.image_url)
  };
}
