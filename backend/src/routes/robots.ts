import { Router, Request, Response } from 'express';

const router = Router();

router.get('/robots.txt', (req: Request, res: Response) => {
  const baseUrl = process.env.SITE_URL || 'https://magnetixtech.com';
  
  const robotsTxt = `User-agent: *
Allow: /
Allow: /products
Allow: /category/
Allow: /product/
Allow: /search

Disallow: /admin
Disallow: /admin/
Disallow: /cart
Disallow: /checkout
Disallow: /order-success
Disallow: /api/

Sitemap: ${baseUrl}/sitemap.xml
`;

  res.set('Content-Type', 'text/plain');
  res.send(robotsTxt);
});

export default router;
