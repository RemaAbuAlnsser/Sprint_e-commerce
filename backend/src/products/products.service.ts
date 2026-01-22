import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class ProductsService {
  constructor(private databaseService: DatabaseService) {}

  async findAll() {
    const query = `
      SELECT p.*, c.name as category_name 
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id
      ORDER BY p.created_at DESC
    `;
    return this.databaseService.query(query);
  }

  async findByCategory(categoryId: number) {
    const query = `
      SELECT p.*, c.name as category_name 
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.category_id = ? AND p.status = 'published'
      ORDER BY p.created_at DESC
    `;
    return this.databaseService.query(query, [categoryId]);
  }

  async findBySubcategory(subcategoryId: number) {
    const query = `
      SELECT p.*, c.name as category_name, s.name as subcategory_name
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN subcategories s ON p.subcategory_id = s.id
      WHERE p.subcategory_id = ? AND p.status = 'published'
      ORDER BY p.created_at DESC
    `;
    return this.databaseService.query(query, [subcategoryId]);
  }

  async findDeals() {
    const query = `
      SELECT p.*, c.name as category_name 
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.old_price IS NOT NULL AND p.old_price > p.price AND p.status = 'published'
      ORDER BY ((p.old_price - p.price) / p.old_price) DESC
    `;
    return this.databaseService.query(query);
  }

  async findOne(id: number) {
    const query = `
      SELECT p.*, c.name as category_name 
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = ?
    `;
    const products: any = await this.databaseService.query(query, [id]);
    const product = products[0] || null;
    
    if (product) {
      const imagesQuery = `
        SELECT id, image_url, display_order 
        FROM product_images 
        WHERE product_id = ? 
        ORDER BY display_order ASC, id ASC
      `;
      const images: any = await this.databaseService.query(imagesQuery, [id]);
      console.log(`Product ID ${id}: Found ${images.length} images in product_images table`);
      console.log('Images data:', images);
      product.images = images || [];
    }
    
    return product;
  }

  async findBySku(sku: string) {
    const query = `
      SELECT p.*, c.name as category_name 
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.sku = ?
    `;
    const products: any = await this.databaseService.query(query, [sku]);
    const product = products[0] || null;
    
    if (product) {
      const imagesQuery = `
        SELECT id, image_url, display_order 
        FROM product_images 
        WHERE product_id = ? 
        ORDER BY display_order ASC, id ASC
      `;
      const images: any = await this.databaseService.query(imagesQuery, [product.id]);
      product.images = images || [];
    }
    
    return product;
  }

  async create(productData: any) {
    // فحص تكرار SKU إذا تم إدخاله
    if (productData.sku) {
      const checkSkuQuery = 'SELECT id, name FROM products WHERE sku = ?';
      const existingProducts: any = await this.databaseService.query(checkSkuQuery, [productData.sku]);
      
      if (existingProducts.length > 0) {
        return {
          success: false,
          message: `المعرف (SKU) "${productData.sku}" مستخدم مسبقاً في المنتج: ${existingProducts[0].name}`,
        };
      }
    }

    const query = `
      INSERT INTO products (name, sku, description, price, old_price, stock, category_id, subcategory_id, company_id, image_url, hover_image_url, status, is_featured, is_exclusive)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [
      productData.name,
      productData.sku || null,
      productData.description || null,
      productData.price,
      productData.old_price || null,
      productData.stock || 0,
      productData.category_id,
      productData.subcategory_id || null,
      productData.company_id || null,
      productData.image_url || null,
      productData.hover_image_url || null,
      productData.status || 'published',
      productData.is_featured || false,
      productData.is_exclusive || false,
    ];

    const result: any = await this.databaseService.query(query, values);
    return {
      success: true,
      id: result.insertId,
      message: 'تم إضافة المنتج بنجاح',
    };
  }

  async update(id: number, productData: any) {
    const query = `
      UPDATE products 
      SET name = ?, sku = ?, description = ?, price = ?, old_price = ?, stock = ?, category_id = ?, subcategory_id = ?, company_id = ?, image_url = ?, hover_image_url = ?, status = ?, is_featured = ?, is_exclusive = ?
      WHERE id = ?
    `;
    const values = [
      productData.name,
      productData.sku || null,
      productData.description || null,
      productData.price,
      productData.old_price || null,
      productData.stock || 0,
      productData.category_id,
      productData.subcategory_id || null,
      productData.company_id || null,
      productData.image_url || null,
      productData.hover_image_url || null,
      productData.status || 'published',
      productData.is_featured || false,
      productData.is_exclusive || false,
      id,
    ];

    await this.databaseService.query(query, values);
    return { success: true, message: 'Product updated successfully' };
  }

  async remove(id: number) {
    const query = 'DELETE FROM products WHERE id = ?';
    await this.databaseService.query(query, [id]);
    return { success: true, message: 'تم حذف المنتج بنجاح' };
  }

  async getProductImages(productId: number) {
    const query = `
      SELECT id, image_url, display_order 
      FROM product_images 
      WHERE product_id = ? 
      ORDER BY display_order ASC, id ASC
    `;
    return this.databaseService.query(query, [productId]);
  }

  async search(params: {
    query?: string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    sort?: string;
  }) {
    let sql = `
      SELECT p.*, c.name as category_name, s.name as subcategory_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN subcategories s ON p.subcategory_id = s.id
      WHERE p.status = 'published'
    `;
    const values: any[] = [];

    // Text search
    if (params.query) {
      sql += ` AND (p.name LIKE ? OR p.description LIKE ? OR p.sku LIKE ?)`;
      const searchTerm = `%${params.query}%`;
      values.push(searchTerm, searchTerm, searchTerm);
    }

    // Category filter
    if (params.category) {
      sql += ` AND c.id = ?`;
      values.push(params.category);
    }

    // Price range filter
    if (params.minPrice !== undefined) {
      sql += ` AND p.price >= ?`;
      values.push(params.minPrice);
    }
    if (params.maxPrice !== undefined) {
      sql += ` AND p.price <= ?`;
      values.push(params.maxPrice);
    }

    // Sorting
    switch (params.sort) {
      case 'newest':
        sql += ` ORDER BY p.created_at DESC`;
        break;
      case 'price_asc':
        sql += ` ORDER BY p.price ASC`;
        break;
      case 'price_desc':
        sql += ` ORDER BY p.price DESC`;
        break;
      case 'relevance':
      default:
        if (params.query) {
          sql += ` ORDER BY 
            CASE 
              WHEN p.name LIKE ? THEN 1
              WHEN p.name LIKE ? THEN 2
              WHEN p.description LIKE ? THEN 3
              ELSE 4
            END, p.created_at DESC`;
          values.push(`${params.query}%`, `%${params.query}%`, `%${params.query}%`);
        } else {
          sql += ` ORDER BY p.created_at DESC`;
        }
        break;
    }

    const products: any = await this.databaseService.query(sql, values);
    return {
      products,
      total: Array.isArray(products) ? products.length : 0,
    };
  }

  async getSearchSuggestions(query: string) {
    if (!query || query.length < 2) {
      return { suggestions: [] };
    }

    const searchTerm = `%${query}%`;
    const suggestions: any[] = [];

    // Product suggestions
    const productQuery = `
      SELECT DISTINCT name as text, 'product' as type
      FROM products
      WHERE name LIKE ? AND status = 'published'
      LIMIT 5
    `;
    const products: any = await this.databaseService.query(productQuery, [searchTerm]);
    if (Array.isArray(products)) {
      suggestions.push(...products);
    }

    // Category suggestions
    const categoryQuery = `
      SELECT DISTINCT name as text, 'category' as type
      FROM categories
      WHERE name LIKE ?
      LIMIT 3
    `;
    const categories: any = await this.databaseService.query(categoryQuery, [searchTerm]);
    if (Array.isArray(categories)) {
      suggestions.push(...categories);
    }

    return { suggestions };
  }

  async getPopularSearches() {
    // Get popular categories (categories with most products)
    const categoriesQuery = `
      SELECT c.id, c.name, COUNT(p.id) as product_count
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id AND p.status = 'published'
      GROUP BY c.id, c.name
      HAVING product_count > 0
      ORDER BY product_count DESC
      LIMIT 5
    `;
    const popularCategories: any = await this.databaseService.query(categoriesQuery);

    return {
      popular_categories: Array.isArray(popularCategories) 
        ? popularCategories.map((cat: any) => ({
            name: cat.name,
            handle: cat.id.toString(),
          }))
        : [],
    };
  }
}
