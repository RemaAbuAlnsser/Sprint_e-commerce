import { MetadataRoute } from 'next'
export const dynamic = 'force-dynamic'
export const revalidate = 3600
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://spirit-store.com'
const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://spirit-store.com/api'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // الصفحات الثابتة
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${BASE_URL}/products`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/cart`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.5 },
    { url: `${BASE_URL}/checkout`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.5 },
    { url: `${BASE_URL}/search`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.7 },
  ]

  // المنتجات الديناميكية
  let productPages: MetadataRoute.Sitemap = []
  try {
    const res = await fetch(`${API_URL}/store/products?limit=1000`, { next: { revalidate: 3600 } })
    if (res.ok) {
      const data = await res.json()
      const products = data.products || []
      productPages = products.map((p: any) => ({
        url: `${BASE_URL}/product/${p.handle}`,
        lastModified: new Date(p.updated_at || p.created_at),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      }))
    } else {
      console.warn('Products API returned non-JSON:', res.status)
    }
  } catch (e) {
    console.warn('Could not fetch products for sitemap:', e)
  }

  // الفئات الديناميكية
  let categoryPages: MetadataRoute.Sitemap = []
  try {
    const res = await fetch(`${API_URL}/store/categories`, { next: { revalidate: 3600 } })
    if (res.ok) {
      const data = await res.json()
      const categories = data.categories || []
      categoryPages = categories.map((c: any) => ({
        url: `${BASE_URL}/category/${c.handle}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      }))
    } else {
      console.warn('Categories API returned non-JSON:', res.status)
    }
  } catch (e) {
    console.warn('Could not fetch categories for sitemap:', e)
  }

  return [...staticPages, ...productPages, ...categoryPages]
}
