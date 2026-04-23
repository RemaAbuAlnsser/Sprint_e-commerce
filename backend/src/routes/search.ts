import { Router, Request, Response } from 'express';
import { query } from '../database';

const router = Router();

// Fuzzy matching function - Levenshtein distance
function levenshteinDistance(str1: string, str2: string): number {
  const m = str1.length;
  const n = str2.length;
  const dp: number[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = Math.min(dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1]) + 1;
      }
    }
  }
  return dp[m][n];
}

// Calculate similarity score (0-1)
function similarityScore(str1: string, str2: string): number {
  const maxLen = Math.max(str1.length, str2.length);
  if (maxLen === 0) return 1;
  const distance = levenshteinDistance(str1.toLowerCase(), str2.toLowerCase());
  return 1 - distance / maxLen;
}

// Tokenize and normalize Arabic/English text
function tokenize(text: string): string[] {
  if (!text) return [];
  return text
    .toLowerCase()
    .replace(/[^\w\s\u0600-\u06FF]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 1);
}

// Calculate relevance score for a product
function calculateRelevance(product: any, searchTerms: string[], originalQuery: string): number {
  let score = 0;
  const title = (product.title || '').toLowerCase();
  const titleEn = (product.title_en || '').toLowerCase();
  const description = (product.description || '').toLowerCase();
  const subtitle = (product.subtitle || '').toLowerCase();
  const brandName = (product.brand_name || '').toLowerCase();
  const categoryName = (product.category_name || '').toLowerCase();
  const query = originalQuery.toLowerCase();

  // Exact match in title (highest priority)
  if (title.includes(query)) {
    score += 100;
  }

  // Exact match in English title
  if (titleEn.includes(query)) {
    score += 100;
  }

  // Exact match at start of title
  if (title.startsWith(query)) {
    score += 50;
  }

  // Exact match at start of English title
  if (titleEn.startsWith(query)) {
    score += 50;
  }

  // Word-by-word matching
  for (const term of searchTerms) {
    // Title matches (high priority)
    if (title.includes(term)) {
      score += 30;
      // Bonus for exact word match
      if (title.split(/\s+/).includes(term)) {
        score += 20;
      }
    }

    // English title matches (same priority as title)
    if (titleEn.includes(term)) {
      score += 30;
      if (titleEn.split(/\s+/).includes(term)) {
        score += 20;
      }
    }

    // Subtitle matches
    if (subtitle.includes(term)) {
      score += 15;
    }

    // Brand name matches (high priority for product searches)
    if (brandName.includes(term)) {
      score += 25;
    }

    // Category name matches
    if (categoryName.includes(term)) {
      score += 20;
    }

    // Description matches (lower priority)
    if (description.includes(term)) {
      score += 10;
    }

    // Fuzzy matching for typos
    const titleWords = tokenize(title);
    for (const word of titleWords) {
      const similarity = similarityScore(term, word);
      if (similarity > 0.7 && similarity < 1) {
        score += similarity * 15; // Partial credit for similar words
      }
    }

    const titleEnWords = tokenize(titleEn);
    for (const word of titleEnWords) {
      const similarity = similarityScore(term, word);
      if (similarity > 0.7 && similarity < 1) {
        score += similarity * 15;
      }
    }

    const brandWords = tokenize(brandName);
    for (const word of brandWords) {
      const similarity = similarityScore(term, word);
      if (similarity > 0.7 && similarity < 1) {
        score += similarity * 12;
      }
    }
  }

  // Boost for published products
  if (product.status === 'published') {
    score += 5;
  }

  // Boost for products with images
  if (product.thumbnail) {
    score += 3;
  }

  // Boost for products with variants in stock
  if (product.variants && product.variants.length > 0) {
    const inStock = product.variants.some((v: any) => v.inventory_quantity > 0);
    if (inStock) {
      score += 5;
    }
  }

  return score;
}

// Advanced search endpoint
router.get('/', async (req: Request, res: Response) => {
  try {
    const {
      q = '',           // Search query
      category,         // Filter by category
      brand,            // Filter by brand
      color,            // Filter by color
      min_price,        // Minimum price
      max_price,        // Maximum price
      sort = 'relevance', // Sort: relevance, price_asc, price_desc, newest
      limit = 20,       // Results limit
      offset = 0        // Pagination offset
    } = req.query;

    const searchQuery = (q as string).trim();
    const searchTerms = tokenize(searchQuery);

    // Build base query
    let sql = `
      SELECT p.*, 
        c.name as category_name, 
        c.handle as category_handle, 
        b.name as brand_name,
        (SELECT json_agg(v.*) FROM product_variants v WHERE v.product_id = p.id) as variants,
        (SELECT json_agg(i.*) FROM product_images i WHERE i.product_id = p.id) as images,
        (SELECT json_agg(pc.*) FROM product_colors pc WHERE pc.product_id = p.id) as colors,
        (SELECT MIN(v.price) FROM product_variants v WHERE v.product_id = p.id) as min_variant_price,
        (SELECT MAX(v.price) FROM product_variants v WHERE v.product_id = p.id) as max_variant_price
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN brands b ON p.brand_id = b.id
      WHERE p.status = 'published'
    `;

    const params: any[] = [];
    let paramIndex = 1;

    // Category filter
    if (category) {
      sql += ` AND (c.id::text = $${paramIndex} OR c.handle = $${paramIndex})`;
      params.push(category);
      paramIndex++;
    }

    // Brand filter
    if (brand) {
      sql += ` AND (b.id::text = $${paramIndex} OR LOWER(b.name) = LOWER($${paramIndex}))`;
      params.push(brand);
      paramIndex++;
    }

    // Color filter
    if (color) {
      sql += ` AND EXISTS (SELECT 1 FROM product_colors pc WHERE pc.product_id = p.id AND LOWER(pc.color_name) = LOWER($${paramIndex}))`;
      params.push(color);
      paramIndex++;
    }

    // Text search using PostgreSQL full-text search + LIKE for flexibility
    if (searchQuery) {
      sql += ` AND (
        LOWER(p.title) LIKE $${paramIndex}
        OR LOWER(p.title_en) LIKE $${paramIndex}
        OR LOWER(p.subtitle) LIKE $${paramIndex}
        OR LOWER(p.description) LIKE $${paramIndex}
        OR LOWER(b.name) LIKE $${paramIndex}
        OR LOWER(c.name) LIKE $${paramIndex}
      )`;
      params.push(`%${searchQuery.toLowerCase()}%`);
      paramIndex++;
    }

    // Execute query
    const result = await query(sql, params);
    let products = result.rows;

    // Apply price filter (after fetching to use variant prices)
    if (min_price) {
      const minP = parseInt(min_price as string);
      products = products.filter(p => p.min_variant_price >= minP);
    }
    if (max_price) {
      const maxP = parseInt(max_price as string);
      products = products.filter(p => p.min_variant_price <= maxP);
    }

    // Calculate relevance scores and apply fuzzy matching
    if (searchQuery && searchTerms.length > 0) {
      products = products.map(product => ({
        ...product,
        relevance_score: calculateRelevance(product, searchTerms, searchQuery)
      }));

      // Also search with fuzzy matching for products that might have been missed
      const allProductsResult = await query(`
        SELECT p.*, 
          c.name as category_name, 
          c.handle as category_handle, 
          b.name as brand_name,
          (SELECT json_agg(v.*) FROM product_variants v WHERE v.product_id = p.id) as variants,
          (SELECT json_agg(i.*) FROM product_images i WHERE i.product_id = p.id) as images,
          (SELECT json_agg(pc.*) FROM product_colors pc WHERE pc.product_id = p.id) as colors,
          (SELECT MIN(v.price) FROM product_variants v WHERE v.product_id = p.id) as min_variant_price
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        LEFT JOIN brands b ON p.brand_id = b.id
        WHERE p.status = 'published'
      `);

      const existingIds = new Set(products.map(p => p.id));
      
      for (const product of allProductsResult.rows) {
        if (!existingIds.has(product.id)) {
          const score = calculateRelevance(product, searchTerms, searchQuery);
          if (score > 20) { // Only include if fuzzy match is good enough
            products.push({ ...product, relevance_score: score });
          }
        }
      }
    }

    // Sort results
    switch (sort) {
      case 'price_asc':
        products.sort((a, b) => (a.min_variant_price || 0) - (b.min_variant_price || 0));
        break;
      case 'price_desc':
        products.sort((a, b) => (b.min_variant_price || 0) - (a.min_variant_price || 0));
        break;
      case 'newest':
        products.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case 'relevance':
      default:
        if (searchQuery) {
          products.sort((a, b) => (b.relevance_score || 0) - (a.relevance_score || 0));
        }
        break;
    }

    // Apply pagination
    const total = products.length;
    const limitNum = parseInt(limit as string);
    const offsetNum = parseInt(offset as string);
    products = products.slice(offsetNum, offsetNum + limitNum);

    res.json({
      products,
      total,
      limit: limitNum,
      offset: offsetNum,
      query: searchQuery,
      filters: { category, brand, color, min_price, max_price }
    });

  } catch (error: any) {
    console.error('Search error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Search suggestions endpoint
router.get('/suggestions', async (req: Request, res: Response) => {
  try {
    const { q = '' } = req.query;
    const searchQuery = (q as string).trim().toLowerCase();

    if (searchQuery.length < 2) {
      return res.json({ suggestions: [] });
    }

    // Get product title suggestions
    const productSuggestions = await query(`
      SELECT DISTINCT title, title_en 
      FROM products 
      WHERE (LOWER(title) LIKE $1 OR LOWER(title_en) LIKE $1) AND status = 'published'
      ORDER BY title
      LIMIT 5
    `, [`%${searchQuery}%`]);

    // Get brand suggestions
    const brandSuggestions = await query(`
      SELECT DISTINCT name 
      FROM brands 
      WHERE LOWER(name) LIKE $1
      ORDER BY name
      LIMIT 3
    `, [`%${searchQuery}%`]);

    // Get category suggestions
    const categorySuggestions = await query(`
      SELECT DISTINCT name 
      FROM categories 
      WHERE LOWER(name) LIKE $1
      ORDER BY name
      LIMIT 3
    `, [`%${searchQuery}%`]);

    const suggestions = [
      ...productSuggestions.rows.map(r => ({ type: 'product', text: r.title })),
      ...brandSuggestions.rows.map(r => ({ type: 'brand', text: r.name })),
      ...categorySuggestions.rows.map(r => ({ type: 'category', text: r.name })),
    ];

    res.json({ suggestions });

  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Popular searches endpoint
router.get('/popular', async (req: Request, res: Response) => {
  try {
    // Get popular categories
    const categories = await query(`
      SELECT c.name, c.handle, COUNT(p.id) as product_count
      FROM categories c
      LEFT JOIN products p ON p.category_id = c.id AND p.status = 'published'
      GROUP BY c.id, c.name, c.handle
      HAVING COUNT(p.id) > 0
      ORDER BY product_count DESC
      LIMIT 5
    `);

    // Get popular brands
    const brands = await query(`
      SELECT b.name, COUNT(p.id) as product_count
      FROM brands b
      LEFT JOIN products p ON p.brand_id = b.id AND p.status = 'published'
      GROUP BY b.id, b.name
      HAVING COUNT(p.id) > 0
      ORDER BY product_count DESC
      LIMIT 5
    `);

    res.json({
      popular_categories: categories.rows,
      popular_brands: brands.rows
    });

  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
