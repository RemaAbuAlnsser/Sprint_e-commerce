import { Router, Request, Response } from 'express';
import { query } from '../database';
export const dynamic = 'force-dynamic'
export const revalidate = 0

const router = Router();

router.get('/sitemap.xml', async (req: Request, res: Response) => {
  try {
    const baseUrl = process.env.SITE_URL || 'https://magnetixtech.com';
    
    // Fetch all published products
    const productsResult = await query(
      `SELECT handle, updated_at FROM products WHERE status = 'published' ORDER BY updated_at DESC`
    );
    const products = productsResult.rows;

    // Fetch all categories
    const categoriesResult = await query(
      `SELECT handle, created_at FROM categories ORDER BY created_at DESC`
    );
    const categories = categoriesResult.rows;

    // Build sitemap XML
    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/products</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${baseUrl}/search</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;

    // Add categories
    for (const category of categories) {
      const lastmod = category.created_at ? new Date(category.created_at).toISOString().split('T')[0] : '';
      sitemap += `
  <url>
    <loc>${baseUrl}/category/${category.handle}</loc>
    ${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
    }

    // Add products
    for (const product of products) {
      const lastmod = product.updated_at ? new Date(product.updated_at).toISOString().split('T')[0] : '';
      sitemap += `
  <url>
    <loc>${baseUrl}/product/${product.handle}</loc>
    ${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
    }

    sitemap += `
</urlset>`;

    res.set('Content-Type', 'application/xml');
    res.send(sitemap);
  } catch (error) {
    console.error('Error generating sitemap:', error);
    res.status(500).send('Error generating sitemap');
  }
});

export default router;
