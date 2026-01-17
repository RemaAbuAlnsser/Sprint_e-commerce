'use client';

import { useState, useEffect } from 'react';
import {
  Plus,
  Edit,
  Trash2,
  X,
  Upload,
  Package,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';

interface Product {
  id: number;
  name: string;
  sku?: string;
  description: string;
  price: number;
  stock: number;
  category_id: number;
  subcategory_id?: number;
  company_id?: number;
  image_url?: string;
  hover_image_url?: string;
  status: 'draft' | 'published';
  is_featured: boolean;
  is_exclusive: boolean;
  created_at: string;
}

interface Category {
  id: number;
  name: string;
  description: string;
  image_url?: string;
}

interface Company {
  id: number;
  name: string;
  logo_url?: string;
}

interface Subcategory {
  id: number;
  name: string;
  category_id: number;
}

interface ProductColor {
  id?: number;
  product_id?: number;
  color_name: string;
  stock: number;
  image_url?: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [productColors, setProductColors] = useState<ProductColor[]>([]);
  const [tempColors, setTempColors] = useState<Array<{color_name: string; stock: number; image_url?: string}>>([]);
  const [availableColors, setAvailableColors] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isColorModalOpen, setIsColorModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [hoverImagePreview, setHoverImagePreview] = useState<string>('');
  const [colorImagePreview, setColorImagePreview] = useState<string>('');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedProductForColors, setSelectedProductForColors] = useState<Product | null>(null);
  const [colorFormData, setColorFormData] = useState({
    color_name: '',
    stock: '',
    image_url: '',
  });

  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    description: '',
    price: '',
    stock: '',
    category_id: '',
    subcategory_id: '',
    company_id: '',
    image_url: '',
    hover_image_url: '',
    status: 'published',
    is_featured: false,
    is_exclusive: false,
  });

  useEffect(() => {
    fetchCategories();
    fetchCompanies();
    fetchProducts();
    fetchAllSubcategories();
    fetchAvailableColors();
  }, []);

  const fetchAvailableColors = async () => {
    try {
      const response = await fetch('http://localhost:3000/product-colors/available-colors');
      const data = await response.json();
      const colorNames = data.map((item: any) => item.color_name);
      setAvailableColors(colorNames);
    } catch (error) {
      console.error('Error fetching available colors:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('http://localhost:3000/categories');
      const data = await response.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchCompanies = async () => {
    try {
      const response = await fetch('http://localhost:3000/companies');
      const data = await response.json();
      setCompanies(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching companies:', error);
    }
  };

  const fetchAllSubcategories = async () => {
    try {
      const response = await fetch('http://localhost:3000/subcategories');
      const data = await response.json();
      setSubcategories(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching all subcategories:', error);
      setSubcategories([]);
    }
  };

  const fetchSubcategories = async (categoryId: string) => {
    if (!categoryId) {
      setSubcategories([]);
      return;
    }
    
    try {
      const response = await fetch(`http://localhost:3000/subcategories/category/${categoryId}`);
      const data = await response.json();
      setSubcategories(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching subcategories:', error);
      setSubcategories([]);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch('http://localhost:3000/products');
      const data = await response.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      const formDataUpload = new FormData();
      formDataUpload.append('image', file);

      try {
        const response = await fetch('http://localhost:3000/upload/product-image', {
          method: 'POST',
          body: formDataUpload,
        });

        const result = await response.json();
        if (result.success) {
          setFormData({ ...formData, image_url: result.imageUrl });
        }
      } catch (error) {
        console.error('Error uploading image:', error);
      }
    }
  };

  const handleHoverImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setHoverImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      const formDataUpload = new FormData();
      formDataUpload.append('image', file);

      try {
        const response = await fetch('http://localhost:3000/upload/product-hover-image', {
          method: 'POST',
          body: formDataUpload,
        });

        const result = await response.json();
        if (result.success) {
          setFormData({ ...formData, hover_image_url: result.imageUrl });
        }
      } catch (error) {
        console.error('Error uploading hover image:', error);
      }
    }
  };

  const handleEdit = async (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      sku: product.sku || '',
      description: product.description || '',
      price: product.price.toString(),
      stock: product.stock.toString(),
      category_id: product.category_id.toString(),
      subcategory_id: product.subcategory_id?.toString() || '',
      company_id: product.company_id?.toString() || '',
      image_url: product.image_url || '',
      hover_image_url: product.hover_image_url || '',
      status: product.status || 'published',
      is_featured: product.is_featured || false,
      is_exclusive: product.is_exclusive || false,
    });
    if (product.category_id) {
      fetchSubcategories(product.category_id.toString());
    }
    if (product.image_url) {
      setImagePreview(`http://localhost:3000${product.image_url}`);
    }
    if (product.hover_image_url) {
      setHoverImagePreview(`http://localhost:3000${product.hover_image_url}`);
    }
    // Fetch product colors
    await fetchProductColors(product.id);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const url = editingProduct
        ? `http://localhost:3000/products/${editingProduct.id}`
        : 'http://localhost:3000/products';
      
      const method = editingProduct ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          stock: parseInt(formData.stock),
          category_id: parseInt(formData.category_id),
          company_id: formData.company_id ? parseInt(formData.company_id) : null,
          is_featured: formData.is_featured,
          is_exclusive: formData.is_exclusive,
        }),
      });

      const result = await response.json();

      if (result.success) {
        // If it's a new product and has temp colors, save them
        if (!editingProduct && tempColors.length > 0 && result.id) {
          for (const color of tempColors) {
            if (color.color_name && color.stock > 0) {
              await fetch('http://localhost:3000/product-colors', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  product_id: result.id,
                  color_name: color.color_name,
                  stock: color.stock,
                  image_url: color.image_url || null,
                }),
              });
            }
          }
        }
        
        alert(editingProduct ? 'تم تحديث المنتج بنجاح!' : 'تم إضافة المنتج بنجاح!');
        setIsModalOpen(false);
        setFormData({ name: '', sku: '', description: '', price: '', stock: '', category_id: '', subcategory_id: '', company_id: '', image_url: '', hover_image_url: '', status: 'published', is_featured: false, is_exclusive: false });
        setImagePreview('');
        setHoverImagePreview('');
        setEditingProduct(null);
        setTempColors([]);
        fetchProducts();
      } else {
        alert(editingProduct ? 'فشل في تحديث المنتج' : 'فشل في إضافة المنتج');
      }
    } catch (error) {
      console.error('Error saving product:', error);
      alert('حدث خطأ أثناء حفظ المنتج');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('هل أنت متأكد من حذف هذا المنتج؟')) return;

    try {
      const response = await fetch(`http://localhost:3000/products/${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        alert('تم حذف المنتج بنجاح!');
        fetchProducts();
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('فشل في حذف المنتج');
    }
  };

  const fetchProductColors = async (productId: number) => {
    try {
      const response = await fetch(`http://localhost:3000/product-colors/product/${productId}`);
      const data = await response.json();
      setProductColors(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching product colors:', error);
      setProductColors([]);
    }
  };

  const handleOpenColorModal = async (product: Product) => {
    setSelectedProductForColors(product);
    await fetchProductColors(product.id);
    setIsColorModalOpen(true);
  };

  const handleColorImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setColorImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      const formDataUpload = new FormData();
      formDataUpload.append('image', file);

      try {
        const response = await fetch('http://localhost:3000/upload/product-color-image', {
          method: 'POST',
          body: formDataUpload,
        });

        const result = await response.json();
        if (result.success) {
          setColorFormData({ ...colorFormData, image_url: result.imageUrl });
        }
      } catch (error) {
        console.error('Error uploading color image:', error);
      }
    }
  };

  const handleSaveColor = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    const productId = editingProduct?.id || selectedProductForColors?.id;
    if (!productId || !colorFormData.color_name || !colorFormData.stock) return;

    try {
      const response = await fetch('http://localhost:3000/product-colors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: productId,
          color_name: colorFormData.color_name,
          stock: parseInt(colorFormData.stock),
          image_url: colorFormData.image_url,
        }),
      });

      const result = await response.json();

      if (result.success) {
        alert('تم إضافة اللون بنجاح!');
        setColorFormData({ color_name: '', stock: '', image_url: '' });
        setColorImagePreview('');
        await fetchProductColors(productId);
        await fetchProducts();
      }
    } catch (error) {
      console.error('Error saving color:', error);
      alert('حدث خطأ أثناء حفظ اللون');
    }
  };

  const handleDeleteColor = async (colorId: number) => {
    if (!confirm('هل أنت متأكد من حذف هذا اللون؟')) return;

    try {
      const response = await fetch(`http://localhost:3000/product-colors/${colorId}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        alert('تم حذف اللون بنجاح!');
        if (selectedProductForColors) {
          await fetchProductColors(selectedProductForColors.id);
          await fetchProducts();
        }
      }
    } catch (error) {
      console.error('Error deleting color:', error);
      alert('فشل في حذف اللون');
    }
  };

  const getProductsByCategory = (categoryId: number) => {
    return products.filter(p => p.category_id === categoryId);
  };

  const getProductsBySubcategory = (categoryId: number, subcategoryId: number) => {
    return products.filter(p => p.category_id === categoryId && p.subcategory_id === subcategoryId);
  };

  const getProductsWithoutSubcategory = (categoryId: number) => {
    return products.filter(p => p.category_id === categoryId && !p.subcategory_id);
  };

  const getCategorySubcategories = (categoryId: number) => {
    return subcategories.filter(s => s.category_id === categoryId);
  };

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { text: 'نفذ', color: 'text-red-600 bg-red-50' };
    if (stock < 10) return { text: 'منخفض', color: 'text-orange-600 bg-orange-50' };
    return { text: 'متوفر', color: 'text-green-600 bg-green-50' };
  };

  return (
    <div className="p-8" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="text-right">
          <h1 className="text-3xl font-bold text-[#2c2c2c]">إدارة المنتجات</h1>
          <p className="text-[#5E4A45] mt-2">إضافة وتعديل المنتجات حسب الفئات</p>
        </div>
        <button
          onClick={() => {
            setEditingProduct(null);
            setFormData({ name: '', sku: '', description: '', price: '', stock: '', category_id: '', subcategory_id: '', company_id: '', image_url: '', hover_image_url: '', status: 'published', is_featured: false, is_exclusive: false });
            setImagePreview('');
            setHoverImagePreview('');
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#2c2c2c] to-[#5E4A45] text-white rounded-xl hover:shadow-lg transition-all duration-300"
        >
          <Plus size={20} />
          <span>إضافة منتج</span>
        </button>
      </div>

      {/* Products by Category and Subcategory */}
      <div className="space-y-8">
        {categories.map((category) => {
          const categoryProducts = getProductsByCategory(category.id);
          const categorySubcategories = getCategorySubcategories(category.id);
          const productsWithoutSubcategory = getProductsWithoutSubcategory(category.id);
          
          if (categoryProducts.length === 0) return null;

          return (
            <div key={category.id} className="bg-white rounded-2xl shadow-lg border border-[#e8e8c8] overflow-hidden">
              {/* Category Header */}
              <div className="bg-gradient-to-r from-[#f5f5dc] to-[#e8e8c8] p-6 border-b-2 border-[#5E4A45]/20">
                <div className="flex items-center gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-[#2c2c2c]">{category.name}</h2>
                    <p className="text-[#5E4A45] text-sm mt-1">
                      {categoryProducts.length} منتج
                      {categorySubcategories.length > 0 && ` • ${categorySubcategories.length} فئة فرعية`}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Products without subcategory */}
                {productsWithoutSubcategory.length > 0 && (
                  <div>
                    <div className="mb-4">
                      <h3 className="text-lg font-bold text-[#2c2c2c] mb-1">منتجات عامة</h3>
                      <p className="text-sm text-[#5E4A45]">{productsWithoutSubcategory.length} منتج</p>
                    </div>
                    <div className="overflow-x-auto rounded-xl border border-[#e8e8c8]">
                      <table className="w-full border-collapse" dir="rtl">
                        <thead>
                          <tr className="bg-gradient-to-r from-[#f5f5dc]/50 to-[#e8e8c8]/50">
                            <th className="px-6 py-4 text-right text-sm font-bold text-[#2c2c2c] uppercase tracking-wider border-b border-[#e8e8c8] w-[35%]">
                              المنتج
                            </th>
                            <th className="px-6 py-4 text-right text-sm font-bold text-[#2c2c2c] uppercase tracking-wider border-b border-[#e8e8c8] w-[15%]">
                              السعر
                            </th>
                            <th className="px-6 py-4 text-right text-sm font-bold text-[#2c2c2c] uppercase tracking-wider border-b border-[#e8e8c8] w-[15%]">
                              المخزون
                            </th>
                            <th className="px-6 py-4 text-right text-sm font-bold text-[#2c2c2c] uppercase tracking-wider border-b border-[#e8e8c8] w-[15%]">
                              الحالة
                            </th>
                            <th className="px-6 py-4 text-center text-sm font-bold text-[#2c2c2c] uppercase tracking-wider border-b border-[#e8e8c8] w-[20%]">
                              إجراءات
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white">
                          {productsWithoutSubcategory.map((product, index) => {
                            const stockStatus = getStockStatus(product.stock);
                            return (
                              <tr 
                                key={product.id} 
                                className={`hover:bg-gradient-to-r hover:from-[#f5f5dc]/20 hover:to-transparent transition-all duration-200 border-b border-[#e8e8c8] ${
                                  index % 2 === 0 ? 'bg-white' : 'bg-[#f5f5dc]/10'
                                }`}
                              >
                                {/* Product Info */}
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-lg bg-white shadow-md border-2 border-[#e8e8c8] flex items-center justify-center flex-shrink-0 overflow-hidden group">
                                      {product.image_url ? (
                                        <img
                                          src={`http://localhost:3000${product.image_url}`}
                                          alt={product.name}
                                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                        />
                                      ) : (
                                        <Package size={24} className="text-[#5E4A45] opacity-30" />
                                      )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="font-bold text-[#2c2c2c] text-sm mb-1 truncate">
                                        {product.name}
                                      </p>
                                      <p className="text-xs text-[#5E4A45] line-clamp-1">
                                        {product.description || 'لا يوجد وصف'}
                                      </p>
                                    </div>
                                  </div>
                                </td>

                                {/* Price */}
                                <td className="px-6 py-4">
                                  <span className="text-lg font-bold text-[#2c2c2c]">
                                    ₪{Number(product.price).toFixed(2)}
                                  </span>
                                </td>

                                {/* Stock */}
                                <td className="px-6 py-4">
                                  <span className={`px-3 py-1 rounded-full text-sm font-bold ${stockStatus.color}`}>
                                    {product.stock} {stockStatus.text}
                                  </span>
                                </td>

                                {/* Status */}
                                <td className="px-6 py-4">
                                  <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                                    product.status === 'published' 
                                      ? 'bg-green-100 text-green-800' 
                                      : 'bg-gray-100 text-gray-800'
                                  }`}>
                                    {product.status === 'published' ? 'منشور' : 'مسودة'}
                                  </span>
                                </td>

                                {/* Actions */}
                                <td className="px-6 py-4">
                                  <div className="flex gap-2 justify-center">
                                    <button
                                      onClick={() => handleEdit(product)}
                                      className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                                      title="تعديل"
                                    >
                                      <Edit size={16} />
                                    </button>
                                    <button
                                      onClick={() => handleOpenColorModal(product)}
                                      className="p-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                                      title="إدارة الألوان"
                                    >
                                      <Package size={16} />
                                    </button>
                                    <button
                                      onClick={() => handleDelete(product.id)}
                                      className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                                      title="حذف"
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Products grouped by subcategory */}
                {categorySubcategories.map((subcategory) => {
                  const subcategoryProducts = getProductsBySubcategory(category.id, subcategory.id);
                  
                  if (subcategoryProducts.length === 0) return null;

                  return (
                    <div key={subcategory.id}>
                      <div className="mb-4 flex items-center gap-3">
                        <div className="w-1 h-8 bg-gradient-to-b from-[#5E4A45] to-[#2c2c2c] rounded-full"></div>
                        <div>
                          <h3 className="text-lg font-bold text-[#2c2c2c] mb-1">{subcategory.name}</h3>
                          <p className="text-sm text-[#5E4A45]">{subcategoryProducts.length} منتج</p>
                        </div>
                      </div>
                      <div className="overflow-x-auto rounded-xl border-2 border-[#5E4A45]/20 shadow-md">
                        <table className="w-full border-collapse" dir="rtl">
                          <thead>
                            <tr className="bg-gradient-to-r from-[#5E4A45]/10 to-[#2c2c2c]/10">
                              <th className="px-6 py-4 text-right text-sm font-bold text-[#2c2c2c] uppercase tracking-wider border-b-2 border-[#5E4A45]/20 w-[35%]">
                                المنتج
                              </th>
                              <th className="px-6 py-4 text-right text-sm font-bold text-[#2c2c2c] uppercase tracking-wider border-b-2 border-[#5E4A45]/20 w-[15%]">
                                السعر
                              </th>
                              <th className="px-6 py-4 text-right text-sm font-bold text-[#2c2c2c] uppercase tracking-wider border-b-2 border-[#5E4A45]/20 w-[15%]">
                                المخزون
                              </th>
                              <th className="px-6 py-4 text-right text-sm font-bold text-[#2c2c2c] uppercase tracking-wider border-b-2 border-[#5E4A45]/20 w-[15%]">
                                الحالة
                              </th>
                              <th className="px-6 py-4 text-center text-sm font-bold text-[#2c2c2c] uppercase tracking-wider border-b-2 border-[#5E4A45]/20 w-[20%]">
                                إجراءات
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white">
                            {subcategoryProducts.map((product, index) => {
                              const stockStatus = getStockStatus(product.stock);
                              return (
                                <tr 
                                  key={product.id} 
                                  className={`hover:bg-gradient-to-r hover:from-[#f5f5dc]/20 hover:to-transparent transition-all duration-200 border-b border-[#e8e8c8] ${
                                    index % 2 === 0 ? 'bg-white' : 'bg-[#f5f5dc]/10'
                                  }`}
                                >
                                  {/* Product Info */}
                                  <td className="px-6 py-4">
                                    <div className="flex items-center gap-4">
                                      <div className="w-16 h-16 rounded-lg bg-white shadow-md border-2 border-[#5E4A45]/30 flex items-center justify-center flex-shrink-0 overflow-hidden group">
                                        {product.image_url ? (
                                          <img
                                            src={`http://localhost:3000${product.image_url}`}
                                            alt={product.name}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                          />
                                        ) : (
                                          <Package size={24} className="text-[#5E4A45] opacity-30" />
                                        )}
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <p className="font-bold text-[#2c2c2c] text-sm mb-1 truncate">
                                          {product.name}
                                        </p>
                                        <p className="text-xs text-[#5E4A45] line-clamp-1">
                                          {product.description || 'لا يوجد وصف'}
                                        </p>
                                      </div>
                                    </div>
                                  </td>

                                  {/* Price */}
                                  <td className="px-6 py-4">
                                    <span className="text-lg font-bold text-[#2c2c2c]">
                                      ₪{Number(product.price).toFixed(2)}
                                    </span>
                                  </td>

                                  {/* Stock */}
                                  <td className="px-6 py-4">
                                    <span className={`px-3 py-1 rounded-full text-sm font-bold ${stockStatus.color}`}>
                                      {product.stock} {stockStatus.text}
                                    </span>
                                  </td>

                                  {/* Status */}
                                  <td className="px-6 py-4">
                                    <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                                      product.status === 'published' 
                                        ? 'bg-green-100 text-green-800' 
                                        : 'bg-gray-100 text-gray-800'
                                    }`}>
                                      {product.status === 'published' ? 'منشور' : 'مسودة'}
                                    </span>
                                  </td>

                                  {/* Actions */}
                                  <td className="px-6 py-4">
                                    <div className="flex gap-2 justify-center">
                                      <button
                                        onClick={() => handleEdit(product)}
                                        className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                                        title="تعديل"
                                      >
                                        <Edit size={16} />
                                      </button>
                                      <button
                                        onClick={() => handleOpenColorModal(product)}
                                        className="p-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                                        title="إدارة الألوان"
                                      >
                                        <Package size={16} />
                                      </button>
                                      <button
                                        onClick={() => handleDelete(product.id)}
                                        className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                                        title="حذف"
                                      >
                                        <Trash2 size={16} />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {products.length === 0 && (
        <div className="text-center py-20">
          <Package size={64} className="mx-auto text-[#5E4A45] opacity-30 mb-4" />
          <p className="text-[#5E4A45] text-lg">لا توجد منتجات حالياً</p>
          <p className="text-[#5E4A45] text-sm mt-2">
            اضغط على "إضافة منتج" لإنشاء منتج جديد
          </p>
        </div>
      )}

      {/* Add/Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-[#f5f5dc] p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-[#2c2c2c]">
                {editingProduct ? 'تعديل المنتج' : 'إضافة منتج جديد'}
              </h2>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setFormData({ name: '', sku: '', description: '', price: '', stock: '', category_id: '', subcategory_id: '', company_id: '', image_url: '', hover_image_url: '', status: 'published', is_featured: false, is_exclusive: false });
                  setImagePreview('');
                  setHoverImagePreview('');
                  setEditingProduct(null);
                }}
                className="text-[#5E4A45] hover:text-[#2c2c2c] transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-[#2c2c2c] mb-2">
                  صورة المنتج
                </label>
                <div className="border-2 border-dashed border-[#e8e8c8] rounded-xl p-6 text-center hover:border-[#5E4A45] transition-colors">
                  {imagePreview ? (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setImagePreview('');
                          setFormData({ ...formData, image_url: '' });
                        }}
                        className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <div>
                      <Upload className="mx-auto text-[#5E4A45] mb-2" size={48} />
                      <p className="text-[#5E4A45] mb-2">اضغط لرفع صورة</p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                        id="image-upload"
                      />
                      <label
                        htmlFor="image-upload"
                        className="inline-block px-4 py-2 bg-[#f5f5dc] text-[#2c2c2c] rounded-lg cursor-pointer hover:bg-[#e8e8c8] transition-colors"
                      >
                        اختر صورة
                      </label>
                    </div>
                  )}
                </div>
              </div>

              {/* Hover Image Upload */}
              <div>
                <label className="block text-sm font-medium text-[#2c2c2c] mb-2">
                  صورة الهوفر (اختياري)
                  <span className="text-xs text-[#5E4A45] mr-2">صورة تظهر عند تمرير المؤشر على المنتج</span>
                </label>
                <div className="border-2 border-dashed border-[#e8e8c8] rounded-xl p-6 text-center hover:border-[#5E4A45] transition-colors">
                  {hoverImagePreview ? (
                    <div className="relative">
                      <img
                        src={hoverImagePreview}
                        alt="Hover Preview"
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setHoverImagePreview('');
                          setFormData({ ...formData, hover_image_url: '' });
                        }}
                        className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <div>
                      <Upload className="mx-auto text-[#5E4A45] mb-2" size={48} />
                      <p className="text-[#5E4A45] mb-2">اضغط لرفع صورة الهوفر</p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleHoverImageChange}
                        className="hidden"
                        id="hover-image-upload"
                      />
                      <label
                        htmlFor="hover-image-upload"
                        className="inline-block px-4 py-2 bg-[#f5f5dc] text-[#2c2c2c] rounded-lg cursor-pointer hover:bg-[#e8e8c8] transition-colors"
                      >
                        اختر صورة
                      </label>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Product Name */}
                <div>
                  <label className="block text-sm font-medium text-[#2c2c2c] mb-2">
                    اسم المنتج *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-[#e8e8c8] rounded-xl focus:outline-none focus:border-[#5E4A45] transition-colors"
                    placeholder="مثال: هاتف آيفون 15"
                  />
                </div>

                {/* SKU */}
                <div>
                  <label className="block text-sm font-medium text-[#2c2c2c] mb-2">
                    المعرف (SKU)
                    <span className="text-xs text-[#5E4A45] mr-2">لمنع تكرار المنتج</span>
                  </label>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-[#e8e8c8] rounded-xl focus:outline-none focus:border-[#5E4A45] transition-colors"
                    placeholder="مثال: PROD-001"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-[#2c2c2c] mb-2">
                    الفئة *
                  </label>
                  <select
                    required
                    value={formData.category_id}
                    onChange={(e) => {
                      const categoryId = e.target.value;
                      setFormData({ ...formData, category_id: categoryId, subcategory_id: '' });
                      fetchSubcategories(categoryId);
                    }}
                    className="w-full px-4 py-3 border-2 border-[#e8e8c8] rounded-xl focus:outline-none focus:border-[#5E4A45] transition-colors"
                  >
                    <option value="">اختر الفئة</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Subcategory - Show only if category has subcategories */}
                {subcategories.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-[#2c2c2c] mb-2">
                      الفئة الفرعية
                    </label>
                    <select
                      value={formData.subcategory_id}
                      onChange={(e) => setFormData({ ...formData, subcategory_id: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-[#e8e8c8] rounded-xl focus:outline-none focus:border-[#5E4A45] transition-colors"
                    >
                      <option value="">اختر الفئة الفرعية (اختياري)</option>
                      {subcategories.map((sub) => (
                        <option key={sub.id} value={sub.id}>
                          {sub.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Price */}
                <div>
                  <label className="block text-sm font-medium text-[#2c2c2c] mb-2">
                    السعر ($) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-[#e8e8c8] rounded-xl focus:outline-none focus:border-[#5E4A45] transition-colors"
                    placeholder="0.00"
                  />
                </div>

                {/* Stock */}
                <div>
                  <label className="block text-sm font-medium text-[#2c2c2c] mb-2">
                    المخزون *
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-[#e8e8c8] rounded-xl focus:outline-none focus:border-[#5E4A45] transition-colors"
                    placeholder="0"
                  />
                </div>

                {/* Company */}
                <div>
                  <label className="block text-sm font-medium text-[#2c2c2c] mb-2">
                    الشركة المصنعة
                  </label>
                  <select
                    value={formData.company_id}
                    onChange={(e) => setFormData({ ...formData, company_id: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-[#e8e8c8] rounded-xl focus:outline-none focus:border-[#5E4A45] transition-colors"
                  >
                    <option value="">اختر الشركة</option>
                    {companies.map((company) => (
                      <option key={company.id} value={company.id}>
                        {company.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-[#2c2c2c] mb-2">
                    الحالة *
                  </label>
                  <select
                    required
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-[#e8e8c8] rounded-xl focus:outline-none focus:border-[#5E4A45] transition-colors"
                  >
                    <option value="published">منشور</option>
                    <option value="draft">مسودة</option>
                  </select>
                </div>
              </div>

              {/* Feature Checkboxes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Featured Product */}
                <div className="flex items-center gap-3 p-4 border-2 border-[#e8e8c8] rounded-xl hover:border-[#5E4A45] transition-colors">
                  <input
                    type="checkbox"
                    id="is_featured"
                    checked={formData.is_featured}
                    onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                    className="w-5 h-5 text-[#5E4A45] border-[#e8e8c8] rounded focus:ring-[#5E4A45]"
                  />
                  <label htmlFor="is_featured" className="flex-1 cursor-pointer">
                    <p className="font-medium text-[#2c2c2c]">عرض في أحدث المنتجات</p>
                    <p className="text-xs text-[#5E4A45]">سيظهر في الصفحة الرئيسية</p>
                  </label>
                </div>

                {/* Exclusive Product */}
                <div className="flex items-center gap-3 p-4 border-2 border-[#e8e8c8] rounded-xl hover:border-[#5E4A45] transition-colors">
                  <input
                    type="checkbox"
                    id="is_exclusive"
                    checked={formData.is_exclusive}
                    onChange={(e) => setFormData({ ...formData, is_exclusive: e.target.checked })}
                    className="w-5 h-5 text-[#5E4A45] border-[#e8e8c8] rounded focus:ring-[#5E4A45]"
                  />
                  <label htmlFor="is_exclusive" className="flex-1 cursor-pointer">
                    <p className="font-medium text-[#2c2c2c]">منتج حصري</p>
                    <p className="text-xs text-[#5E4A45]">سيظهر شارة "حصري" على المنتج</p>
                  </label>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-[#2c2c2c] mb-2">
                  الوصف
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-[#e8e8c8] rounded-xl focus:outline-none focus:border-[#5E4A45] transition-colors resize-none"
                  placeholder="وصف المنتج..."
                />
              </div>

              {/* الألوان المتاحة */}
              <div>
                <label className="block text-sm font-medium text-[#2c2c2c] mb-2">
                  الألوان المتاحة
                </label>
                <div className="space-y-3">
                  {/* Color input rows */}
                  {(editingProduct ? productColors : tempColors).map((color, index) => (
                    <div key={index} className="space-y-2">
                      <div className="grid grid-cols-12 gap-3 items-center">
                        <div className="col-span-4">
                          {editingProduct ? (
                            <input
                              type="text"
                              value={color.color_name}
                              readOnly
                              className="w-full px-4 py-3 bg-white border-2 border-[#e8e8c8] rounded-xl focus:outline-none text-center text-[#2c2c2c]"
                            />
                          ) : (
                            <select
                              value={color.color_name}
                              onChange={(e) => {
                                const newColors = [...tempColors];
                                if (e.target.value === '__custom__') {
                                  newColors[index].color_name = '';
                                } else {
                                  newColors[index].color_name = e.target.value;
                                }
                                setTempColors(newColors);
                              }}
                              className="w-full px-4 py-3 bg-white border-2 border-[#e8e8c8] rounded-xl focus:outline-none focus:border-[#5E4A45] text-center text-[#2c2c2c]"
                            >
                              <option value="">اختر لون...</option>
                              {availableColors.map((colorName, i) => (
                                <option key={i} value={colorName}>{colorName}</option>
                              ))}
                              <option value="__custom__">+ لون جديد (اكتب بنفسك)</option>
                            </select>
                          )}
                          {!editingProduct && color.color_name === '' && (
                            <input
                              type="text"
                              value={color.color_name}
                              onChange={(e) => {
                                const newColors = [...tempColors];
                                newColors[index].color_name = e.target.value;
                                setTempColors(newColors);
                              }}
                              className="w-full px-4 py-3 bg-white border-2 border-[#e8e8c8] rounded-xl focus:outline-none focus:border-[#5E4A45] text-center text-[#2c2c2c] mt-2"
                              placeholder="اكتب اسم اللون الجديد"
                              autoFocus
                            />
                          )}
                        </div>
                        <div className="col-span-3">
                          <input
                            type="number"
                            value={color.stock}
                            readOnly={editingProduct ? true : false}
                            onChange={(e) => {
                              if (!editingProduct) {
                                const newColors = [...tempColors];
                                newColors[index].stock = parseInt(e.target.value) || 0;
                                setTempColors(newColors);
                              }
                            }}
                            className="w-full px-4 py-3 bg-white border-2 border-[#e8e8c8] rounded-xl focus:outline-none focus:border-[#5E4A45] text-center text-[#2c2c2c]"
                            placeholder="0"
                          />
                        </div>
                        <div className="col-span-3 flex justify-center">
                          <label className="cursor-pointer">
                            <div className="px-4 py-3 bg-white border-2 border-[#e8e8c8] rounded-xl hover:bg-[#f5f5dc] transition-colors flex items-center gap-2 text-[#5E4A45]">
                              <Upload size={16} />
                              <span className="text-sm font-medium">صورة</span>
                            </div>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (file && !editingProduct) {
                                  const formDataUpload = new FormData();
                                  formDataUpload.append('image', file);
                                  
                                  try {
                                    const response = await fetch('http://localhost:3000/upload/product-color-image', {
                                      method: 'POST',
                                      body: formDataUpload,
                                    });
                                    
                                    const result = await response.json();
                                    if (result.success) {
                                      const newColors = [...tempColors];
                                      newColors[index].image_url = result.imageUrl;
                                      setTempColors(newColors);
                                    }
                                  } catch (error) {
                                    console.error('Error uploading color image:', error);
                                  }
                                }
                              }}
                              className="hidden"
                            />
                          </label>
                        </div>
                        <div className="col-span-2 flex justify-center">
                          <button
                            type="button"
                            onClick={() => {
                              if (editingProduct && 'id' in color && typeof color.id === 'number') {
                                handleDeleteColor(color.id);
                              } else {
                                setTempColors(tempColors.filter((_, i) => i !== index));
                              }
                            }}
                            className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                      
                      {/* Color Image Preview */}
                      {color.image_url && (
                        <div className="mr-3 flex items-center gap-2">
                          <img
                            src={editingProduct ? `http://localhost:3000${color.image_url}` : color.image_url}
                            alt={color.color_name}
                            className="h-12 w-12 object-cover rounded-lg border-2 border-[#5E4A45]"
                          />
                          <span className="text-sm text-[#5E4A45]">صورة {color.color_name}</span>
                          {!editingProduct && (
                            <button
                              type="button"
                              onClick={() => {
                                const newColors = [...tempColors];
                                newColors[index].image_url = '';
                                setTempColors(newColors);
                              }}
                              className="text-red-500 hover:text-red-700"
                            >
                              <X size={16} />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {/* Add new color button */}
                  <button
                    type="button"
                    onClick={() => {
                      if (editingProduct) {
                        // For existing products, show a simple prompt
                        const colorName = prompt('اسم اللون:');
                        const stock = prompt('الكمية:');
                        if (colorName && stock) {
                          setColorFormData({ color_name: colorName, stock: stock, image_url: '' });
                          handleSaveColor();
                        }
                      } else {
                        // For new products, add to temp array
                        setTempColors([...tempColors, { color_name: '', stock: 0 }]);
                      }
                    }}
                    className="w-full px-4 py-3 bg-gradient-to-r from-[#3a4a5c] to-[#2c3e50] text-white rounded-xl hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 font-medium"
                  >
                    <Plus size={18} />
                    <span>+ إضافة لون</span>
                  </button>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setFormData({ name: '', sku: '', description: '', price: '', stock: '', category_id: '', subcategory_id: '', company_id: '', image_url: '', hover_image_url: '', status: 'published', is_featured: false, is_exclusive: false });
                    setImagePreview('');
                    setHoverImagePreview('');
                    setEditingProduct(null);
                    setTempColors([]);
                  }}
                  className="flex-1 px-6 py-3 border-2 border-[#e8e8c8] text-[#2c2c2c] rounded-xl hover:bg-[#f5f5dc] transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-[#2c2c2c] to-[#5E4A45] text-white rounded-xl hover:shadow-lg transition-all duration-300 disabled:opacity-50"
                >
                  {isLoading ? 'جاري الحفظ...' : (editingProduct ? 'تحديث المنتج' : 'حفظ المنتج')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Color Management Modal */}
      {isColorModalOpen && selectedProductForColors && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" dir="rtl">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-[#f5f5dc] p-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-[#2c2c2c]">إدارة ألوان المنتج</h2>
                <p className="text-[#5E4A45] text-sm mt-1">{selectedProductForColors.name}</p>
              </div>
              <button
                onClick={() => {
                  setIsColorModalOpen(false);
                  setSelectedProductForColors(null);
                  setColorFormData({ color_name: '', stock: '', image_url: '' });
                  setColorImagePreview('');
                }}
                className="text-[#5E4A45] hover:text-[#2c2c2c] transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Add New Color Form */}
              <div className="bg-gradient-to-br from-[#f5f5dc] to-[#e8e8c8] rounded-xl p-6 border-2 border-[#5E4A45]/20">
                <h3 className="text-lg font-bold text-[#2c2c2c] mb-4">إضافة لون جديد</h3>
                <form onSubmit={handleSaveColor} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Color Name */}
                    <div>
                      <label className="block text-sm font-medium text-[#2c2c2c] mb-2">
                        اسم اللون *
                      </label>
                      <input
                        type="text"
                        required
                        value={colorFormData.color_name}
                        onChange={(e) => setColorFormData({ ...colorFormData, color_name: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-[#e8e8c8] rounded-xl focus:outline-none focus:border-[#5E4A45] transition-colors"
                        placeholder="مثال: أحمر، أزرق، أسود"
                      />
                    </div>

                    {/* Stock */}
                    <div>
                      <label className="block text-sm font-medium text-[#2c2c2c] mb-2">
                        الكمية المتوفرة *
                      </label>
                      <input
                        type="number"
                        required
                        value={colorFormData.stock}
                        onChange={(e) => setColorFormData({ ...colorFormData, stock: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-[#e8e8c8] rounded-xl focus:outline-none focus:border-[#5E4A45] transition-colors"
                        placeholder="0"
                      />
                    </div>
                  </div>

                  {/* Color Image Upload */}
                  <div>
                    <label className="block text-sm font-medium text-[#2c2c2c] mb-2">
                      صورة المنتج باللون
                    </label>
                    <div className="border-2 border-dashed border-[#e8e8c8] rounded-xl p-4 text-center hover:border-[#5E4A45] transition-colors">
                      {colorImagePreview ? (
                        <div className="relative">
                          <img
                            src={colorImagePreview}
                            alt="Preview"
                            className="w-full h-32 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setColorImagePreview('');
                              setColorFormData({ ...colorFormData, image_url: '' });
                            }}
                            className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ) : (
                        <label className="cursor-pointer block">
                          <Upload className="mx-auto text-[#5E4A45] mb-2" size={32} />
                          <p className="text-[#5E4A45] text-sm">اضغط لرفع صورة اللون</p>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleColorImageChange}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full px-6 py-3 bg-gradient-to-r from-[#5E4A45] to-[#2c2c2c] text-white rounded-xl hover:shadow-lg transition-all duration-300"
                  >
                    إضافة اللون
                  </button>
                </form>
              </div>

              {/* Existing Colors List */}
              <div>
                <h3 className="text-lg font-bold text-[#2c2c2c] mb-4">الألوان المتوفرة</h3>
                {productColors.length === 0 ? (
                  <div className="text-center py-8 bg-[#f5f5dc]/30 rounded-xl">
                    <Package size={48} className="mx-auto text-[#5E4A45] opacity-30 mb-2" />
                    <p className="text-[#5E4A45]">لا توجد ألوان مضافة حتى الآن</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {productColors.map((color) => (
                      <div key={color.id} className="bg-white border-2 border-[#e8e8c8] rounded-xl p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start gap-4">
                          {color.image_url ? (
                            <img
                              src={`http://localhost:3000${color.image_url}`}
                              alt={color.color_name}
                              className="w-20 h-20 object-cover rounded-lg border-2 border-[#5E4A45]/20"
                            />
                          ) : (
                            <div className="w-20 h-20 bg-gradient-to-br from-[#f5f5dc] to-[#e8e8c8] rounded-lg flex items-center justify-center">
                              <Package size={32} className="text-[#5E4A45] opacity-30" />
                            </div>
                          )}
                          <div className="flex-1">
                            <h4 className="font-bold text-[#2c2c2c] text-lg mb-1">{color.color_name}</h4>
                            <p className="text-sm text-[#5E4A45] mb-2">
                              الكمية: <span className="font-bold text-[#2c2c2c]">{color.stock}</span> قطعة
                            </p>
                            <button
                              onClick={() => handleDeleteColor(color.id!)}
                              className="text-red-500 hover:text-red-700 text-sm font-medium flex items-center gap-1"
                            >
                              <Trash2 size={14} />
                              حذف
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Total Stock Summary */}
              <div className="bg-gradient-to-r from-[#5E4A45]/10 to-[#2c2c2c]/10 rounded-xl p-4 border-2 border-[#5E4A45]/20">
                <div className="flex items-center justify-between">
                  <span className="text-[#2c2c2c] font-medium">إجمالي المخزون من جميع الألوان:</span>
                  <span className="text-2xl font-bold text-[#5E4A45]">
                    {productColors.reduce((sum, color) => sum + color.stock, 0)} قطعة
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
