'use client';
import { API_URL } from '@/lib/api';

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
import AdminToast from '@/components/AdminToast';

interface Product {
  id: number;
  name: string;
  sku?: string;
  description: string;
  price: number;
  old_price?: number;
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
  const [galleryImages, setGalleryImages] = useState<Array<{url: string; preview: string}>>([]);
  const [colorGalleryImages, setColorGalleryImages] = useState<Array<{url: string; preview: string}>>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedProductForColors, setSelectedProductForColors] = useState<Product | null>(null);
  const [toastMessage, setToastMessage] = useState<string>('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [showToast, setShowToast] = useState(false);
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
    old_price: '',
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
      const response = await fetch(`${API_URL}/product-colors/available-colors`);
      const data = await response.json();
      const colorNames = data.map((item: any) => item.color_name);
      setAvailableColors(colorNames);
    } catch (error) {
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_URL}/categories`);
      const data = await response.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch (error) {
    }
  };

  const fetchCompanies = async () => {
    try {
      const response = await fetch(`${API_URL}/companies`);
      const data = await response.json();
      setCompanies(Array.isArray(data) ? data : []);
    } catch (error) {
    }
  };

  const fetchAllSubcategories = async () => {
    try {
      const response = await fetch(`${API_URL}/subcategories`);
      const data = await response.json();
      setSubcategories(Array.isArray(data) ? data : []);
    } catch (error) {
      setSubcategories([]);
    }
  };

  const fetchSubcategories = async (categoryId: string) => {
    if (!categoryId) {
      setSubcategories([]);
      return;
    }
    
    try {
      const response = await fetch(`${API_URL}/subcategories/category/${categoryId}`);
      const data = await response.json();
      setSubcategories(Array.isArray(data) ? data : []);
    } catch (error) {
      setSubcategories([]);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${API_URL}/products`);
      const data = await response.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
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
        const response = await fetch(`${API_URL}/upload/product-image`, {
          method: 'POST',
          body: formDataUpload,
        });

        const result = await response.json();
        if (result.success) {
          setFormData({ ...formData, image_url: result.imageUrl });
        }
      } catch (error) {
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
        const response = await fetch(`${API_URL}/upload/product-hover-image`, {
          method: 'POST',
          body: formDataUpload,
        });

        const result = await response.json();
        if (result.success) {
          setFormData({ ...formData, hover_image_url: result.imageUrl });
        }
      } catch (error) {
      }
    }
  };

  const handleGalleryImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const reader = new FileReader();
        
        reader.onloadend = async () => {
          const preview = reader.result as string;
          
          const formDataUpload = new FormData();
          formDataUpload.append('image', file);

          try {
            const response = await fetch(`${API_URL}/upload/product-gallery-image`, {
              method: 'POST',
              body: formDataUpload,
            });

            const result = await response.json();
            if (result.success) {
              setGalleryImages(prev => [...prev, { url: result.imageUrl, preview }]);
            }
          } catch (error) {
          }
        };
        
        reader.readAsDataURL(file);
      }
    }
  };

  const removeGalleryImage = (index: number) => {
    setGalleryImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleEdit = async (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      sku: product.sku || '',
      description: product.description || '',
      price: product.price.toString(),
      old_price: product.old_price?.toString() || '',
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
      setImagePreview(`${API_URL}${product.image_url}`);
    }
    if (product.hover_image_url) {
      setHoverImagePreview(`${API_URL}${product.hover_image_url}`);
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
        ? `${API_URL}/products/${editingProduct.id}`
        : `${API_URL}/products`;
      
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
        const productId = editingProduct ? editingProduct.id : result.id;
        
        // If it's a new product and has temp colors, save them
        if (!editingProduct && tempColors.length > 0 && result.id) {
          for (const color of tempColors) {
            if (color.color_name && color.stock > 0) {
              await fetch(`${API_URL}/product-colors`, {
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

        // If it's an existing product and has new colors, save them
        if (editingProduct && productColors.length > 0) {
          for (const color of productColors) {
            // Only save colors that don't have an ID (new colors)
            if (!('id' in color) && color.color_name && color.stock > 0) {
              await fetch(`${API_URL}/product-colors`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  product_id: editingProduct.id,
                  color_name: color.color_name,
                  stock: color.stock,
                  image_url: color.image_url || null,
                }),
              });
            }
          }
        }

        // Save gallery images
        if (galleryImages.length > 0 && productId) {
          
          for (let i = 0; i < galleryImages.length; i++) {
            const imageData = {
              product_id: productId,
              image_url: galleryImages[i].url,
              display_order: i,
            };
            
            const imageResponse = await fetch(`${API_URL}/product-images`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(imageData),
            });
            
            const imageResult = await imageResponse.json();
            
            if (!imageResult.success) {
            }
          }
        } else {
        }
        
        setToastMessage(result.message || (editingProduct ? 'تم تحديث المنتج بنجاح!' : 'تم إضافة المنتج بنجاح!'));
        setToastType('success');
        setShowToast(true);
        setIsModalOpen(false);
        setFormData({ name: '', sku: '', description: '', price: '', old_price: '', stock: '', category_id: '', subcategory_id: '', company_id: '', image_url: '', hover_image_url: '', status: 'published', is_featured: false, is_exclusive: false });
        setImagePreview('');
        setHoverImagePreview('');
        setGalleryImages([]);
        setEditingProduct(null);
        setTempColors([]);
        setProductColors([]);
        fetchProducts();
      } else {
        setToastMessage(result.message || (editingProduct ? 'فشل في تحديث المنتج' : 'فشل في إضافة المنتج'));
        setToastType('error');
        setShowToast(true);
      }
    } catch (error) {
      setToastMessage('حدث خطأ أثناء حفظ المنتج');
      setToastType('error');
      setShowToast(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('هل أنت متأكد من حذف هذا المنتج؟')) return;

    try {
      const response = await fetch(`${API_URL}/products/${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        alert('تم حذف المنتج بنجاح!');
        fetchProducts();
      }
    } catch (error) {
      alert('فشل في حذف المنتج');
    }
  };

  const fetchProductColors = async (productId: number) => {
    try {
      const response = await fetch(`${API_URL}/product-colors/product/${productId}`);
      const data = await response.json();
      setProductColors(Array.isArray(data) ? data : []);
    } catch (error) {
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
        const response = await fetch(`${API_URL}/upload/product-color-image`, {
          method: 'POST',
          body: formDataUpload,
        });

        const result = await response.json();
        if (result.success) {
          setColorFormData({ ...colorFormData, image_url: result.imageUrl });
        }
      } catch (error) {
      }
    }
  };

  const handleSaveColor = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    const productId = editingProduct?.id || selectedProductForColors?.id;
    if (!productId || !colorFormData.color_name || !colorFormData.stock) return;

    try {
      const response = await fetch(`${API_URL}/product-colors`, {
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
        // Save color gallery images to product_color_images table
        const colorId = result.id;
        for (let i = 0; i < colorGalleryImages.length; i++) {
          try {
            await fetch(`${API_URL}/product-color-images`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                product_color_id: colorId,
                image_url: colorGalleryImages[i].url,
                display_order: i,
              }),
            });
          } catch (error) {
          }
        }

        setToastMessage('تم إضافة اللون بنجاح!');
        setToastType('success');
        setShowToast(true);
        setColorFormData({ color_name: '', stock: '', image_url: '' });
        setColorImagePreview('');
        setColorGalleryImages([]);
        setIsColorModalOpen(false);
        await fetchProductColors(productId);
        await fetchProducts();
      }
    } catch (error) {
      setToastMessage('حدث خطأ أثناء حفظ اللون');
      setToastType('error');
      setShowToast(true);
    }
  };

  const handleDeleteColor = async (colorId: number) => {
    if (!confirm('هل أنت متأكد من حذف هذا اللون؟')) return;

    try {
      const response = await fetch(`${API_URL}/product-colors/${colorId}`, {
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
    <div className="p-4 md:p-8" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 md:mb-8 gap-4">
        <div className="text-right">
          <h1 className="text-2xl md:text-3xl font-bold text-[#2c2c2c]">إدارة المنتجات</h1>
          <p className="text-sm md:text-base text-[#5E4A45] mt-1 md:mt-2">إضافة وتعديل المنتجات حسب الفئات</p>
        </div>
        <button
          onClick={() => {
            setEditingProduct(null);
            setFormData({ name: '', sku: '', description: '', price: '', old_price: '', stock: '', category_id: '', subcategory_id: '', company_id: '', image_url: '', hover_image_url: '', status: 'published', is_featured: false, is_exclusive: false });
            setImagePreview('');
            setHoverImagePreview('');
            setTempColors([]);
            setProductColors([]);
            setIsModalOpen(true);
          }}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 md:px-6 py-2.5 md:py-3 bg-gradient-to-r from-[#2c2c2c] to-[#5E4A45] text-white rounded-xl hover:shadow-lg transition-all duration-300 text-sm md:text-base"
        >
          <Plus size={18} className="md:w-5 md:h-5" />
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
              <div className="bg-gradient-to-r from-[#f5f5dc] to-[#e8e8c8] p-4 md:p-6 border-b-2 border-[#5E4A45]/20">
                <div className="flex items-center gap-3 md:gap-4">
                  <div>
                    <h2 className="text-lg md:text-2xl font-bold text-[#2c2c2c]">{category.name}</h2>
                    <p className="text-[#5E4A45] text-xs md:text-sm mt-1">
                      {categoryProducts.length} منتج
                      {categorySubcategories.length > 0 && ` • ${categorySubcategories.length} فئة فرعية`}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 md:p-6 space-y-4 md:space-y-6">
                {/* Products without subcategory */}
                {productsWithoutSubcategory.length > 0 && (
                  <div>
                    <div className="mb-3 md:mb-4">
                      <h3 className="text-base md:text-lg font-bold text-[#2c2c2c] mb-1">منتجات عامة</h3>
                      <p className="text-xs md:text-sm text-[#5E4A45]">{productsWithoutSubcategory.length} منتج</p>
                    </div>
                    {/* Desktop Table View */}
                    <div className="hidden lg:block overflow-x-auto rounded-xl border border-[#e8e8c8]">
                      <table className="w-full border-collapse" dir="rtl">
                        <thead>
                          <tr className="bg-gradient-to-r from-[#f5f5dc]/50 to-[#e8e8c8]/50">
                            <th className="px-3 md:px-6 py-3 md:py-4 text-right text-xs md:text-sm font-bold text-[#2c2c2c] uppercase tracking-wider border-b border-[#e8e8c8] w-[35%]">
                              المنتج
                            </th>
                            <th className="px-3 md:px-6 py-3 md:py-4 text-right text-xs md:text-sm font-bold text-[#2c2c2c] uppercase tracking-wider border-b border-[#e8e8c8] w-[15%]">
                              السعر
                            </th>
                            <th className="px-3 md:px-6 py-3 md:py-4 text-right text-xs md:text-sm font-bold text-[#2c2c2c] uppercase tracking-wider border-b border-[#e8e8c8] w-[15%]">
                              المخزون
                            </th>
                            <th className="px-3 md:px-6 py-3 md:py-4 text-right text-xs md:text-sm font-bold text-[#2c2c2c] uppercase tracking-wider border-b border-[#e8e8c8] w-[15%]">
                              الحالة
                            </th>
                            <th className="px-3 md:px-6 py-3 md:py-4 text-center text-xs md:text-sm font-bold text-[#2c2c2c] uppercase tracking-wider border-b border-[#e8e8c8] w-[20%]">
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
                                <td className="px-3 md:px-6 py-3 md:py-4">
                                  <div className="flex items-center gap-2 md:gap-4">
                                    <div className="w-12 h-12 md:w-16 md:h-16 rounded-lg bg-white shadow-md border-2 border-[#e8e8c8] flex items-center justify-center flex-shrink-0 overflow-hidden group">
                                      {product.image_url ? (
                                        <img
                                          src={`${API_URL}${product.image_url}`}
                                          alt={product.name}
                                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                        />
                                      ) : (
                                        <Package size={20} className="md:w-6 md:h-6 text-[#5E4A45] opacity-30" />
                                      )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="font-bold text-[#2c2c2c] text-xs md:text-sm mb-1 truncate">
                                        {product.name}
                                      </p>
                                      <p className="text-[10px] md:text-xs text-[#5E4A45] line-clamp-1">
                                        {product.description || 'لا يوجد وصف'}
                                      </p>
                                    </div>
                                  </div>
                                </td>

                                {/* Price */}
                                <td className="px-3 md:px-6 py-3 md:py-4">
                                  <span className="text-sm md:text-lg font-bold text-[#2c2c2c]">
                                    ₪{Number(product.price).toFixed(2)}
                                  </span>
                                </td>

                                {/* Stock */}
                                <td className="px-3 md:px-6 py-3 md:py-4">
                                  <span className={`px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-bold ${stockStatus.color}`}>
                                    {product.stock} {stockStatus.text}
                                  </span>
                                </td>

                                {/* Status */}
                                <td className="px-3 md:px-6 py-3 md:py-4">
                                  <span className={`px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-bold ${
                                    product.status === 'published' 
                                      ? 'bg-green-100 text-green-800' 
                                      : 'bg-gray-100 text-gray-800'
                                  }`}>
                                    {product.status === 'published' ? 'منشور' : 'مسودة'}
                                  </span>
                                </td>

                                {/* Actions */}
                                <td className="px-3 md:px-6 py-3 md:py-4">
                                  <div className="flex gap-1 md:gap-2 justify-center">
                                    <button
                                      onClick={() => handleEdit(product)}
                                      className="p-1.5 md:p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                                      title="تعديل"
                                    >
                                      <Edit size={14} className="md:w-4 md:h-4" />
                                    </button>
                                    <button
                                      onClick={() => handleOpenColorModal(product)}
                                      className="p-1.5 md:p-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                                      title="إدارة الألوان"
                                    >
                                      <Package size={14} className="md:w-4 md:h-4" />
                                    </button>
                                    <button
                                      onClick={() => handleDelete(product.id)}
                                      className="p-1.5 md:p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                                      title="حذف"
                                    >
                                      <Trash2 size={14} className="md:w-4 md:h-4" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile Card View */}
                    <div className="lg:hidden space-y-3">
                      {productsWithoutSubcategory.map((product, index) => {
                        const stockStatus = getStockStatus(product.stock);
                        return (
                          <div key={product.id} className="bg-white border border-[#e8e8c8] rounded-xl p-4 shadow-sm">
                            <div className="flex items-start gap-3 mb-3">
                              <div className="w-16 h-16 rounded-lg bg-white shadow-md border-2 border-[#e8e8c8] flex items-center justify-center flex-shrink-0 overflow-hidden">
                                {product.image_url ? (
                                  <img
                                    src={`${API_URL}${product.image_url}`}
                                    alt={product.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <Package size={20} className="text-[#5E4A45] opacity-30" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-[#2c2c2c] text-sm mb-1 line-clamp-2">
                                  {product.name}
                                </h4>
                                <p className="text-xs text-[#5E4A45] line-clamp-2">
                                  {product.description || 'لا يوجد وصف'}
                                </p>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-3 mb-3">
                              <div>
                                <span className="text-xs text-gray-500 block">السعر</span>
                                <span className="text-sm font-bold text-[#2c2c2c]">
                                  ₪{Number(product.price).toFixed(2)}
                                </span>
                              </div>
                              <div>
                                <span className="text-xs text-gray-500 block">المخزون</span>
                                <span className={`text-xs font-bold px-2 py-1 rounded-full ${stockStatus.color}`}>
                                  {product.stock} {stockStatus.text}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center justify-between">
                              <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                product.status === 'published' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {product.status === 'published' ? 'منشور' : 'مسودة'}
                              </span>
                              
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleEdit(product)}
                                  className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                                  title="تعديل"
                                >
                                  <Edit size={14} />
                                </button>
                                <button
                                  onClick={() => handleOpenColorModal(product)}
                                  className="p-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                                  title="إدارة الألوان"
                                >
                                  <Package size={14} />
                                </button>
                                <button
                                  onClick={() => handleDelete(product.id)}
                                  className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                                  title="حذف"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Products grouped by subcategory */}
                {categorySubcategories.map((subcategory) => {
                  const subcategoryProducts = getProductsBySubcategory(category.id, subcategory.id);
                  
                  if (subcategoryProducts.length === 0) return null;

                  return (
                    <div key={subcategory.id}>
                      <div className="mb-3 md:mb-4 flex items-center gap-2 md:gap-3">
                        <div className="w-1 h-6 md:h-8 bg-gradient-to-b from-[#5E4A45] to-[#2c2c2c] rounded-full"></div>
                        <div>
                          <h3 className="text-base md:text-lg font-bold text-[#2c2c2c] mb-1">{subcategory.name}</h3>
                          <p className="text-xs md:text-sm text-[#5E4A45]">{subcategoryProducts.length} منتج</p>
                        </div>
                      </div>
                      {/* Desktop Table View */}
                      <div className="hidden lg:block overflow-x-auto rounded-xl border-2 border-[#5E4A45]/20 shadow-md">
                        <table className="w-full border-collapse" dir="rtl">
                          <thead>
                            <tr className="bg-gradient-to-r from-[#5E4A45]/10 to-[#2c2c2c]/10">
                              <th className="px-3 md:px-6 py-3 md:py-4 text-right text-xs md:text-sm font-bold text-[#2c2c2c] uppercase tracking-wider border-b-2 border-[#5E4A45]/20 w-[35%]">
                                المنتج
                              </th>
                              <th className="px-3 md:px-6 py-3 md:py-4 text-right text-xs md:text-sm font-bold text-[#2c2c2c] uppercase tracking-wider border-b-2 border-[#5E4A45]/20 w-[15%]">
                                السعر
                              </th>
                              <th className="px-3 md:px-6 py-3 md:py-4 text-right text-xs md:text-sm font-bold text-[#2c2c2c] uppercase tracking-wider border-b-2 border-[#5E4A45]/20 w-[15%]">
                                المخزون
                              </th>
                              <th className="px-3 md:px-6 py-3 md:py-4 text-right text-xs md:text-sm font-bold text-[#2c2c2c] uppercase tracking-wider border-b-2 border-[#5E4A45]/20 w-[15%]">
                                الحالة
                              </th>
                              <th className="px-3 md:px-6 py-3 md:py-4 text-center text-xs md:text-sm font-bold text-[#2c2c2c] uppercase tracking-wider border-b-2 border-[#5E4A45]/20 w-[20%]">
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
                                  <td className="px-3 md:px-6 py-3 md:py-4">
                                    <div className="flex items-center gap-3 md:gap-4">
                                      <div className="w-14 h-14 md:w-20 md:h-20 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 shadow-lg border-2 border-[#5E4A45]/20 flex items-center justify-center flex-shrink-0 overflow-hidden group">
                                        {product.image_url ? (
                                          <img
                                            src={`${API_URL}${product.image_url}`}
                                            alt={product.name}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                          />
                                        ) : (
                                          <Package size={24} className="md:w-8 md:h-8 text-[#5E4A45] opacity-30" />
                                        )}
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <p className="font-bold text-[#2c2c2c] text-sm md:text-base mb-1.5 leading-tight">
                                          {product.name}
                                        </p>
                                        <p className="text-xs md:text-sm text-[#5E4A45]/80 line-clamp-2 leading-relaxed">
                                          {product.description || 'لا يوجد وصف'}
                                        </p>
                                      </div>
                                    </div>
                                  </td>

                                  {/* Price */}
                                  <td className="px-3 md:px-6 py-3 md:py-4">
                                    <span className="text-sm md:text-lg font-bold text-[#2c2c2c]">
                                      ₪{Number(product.price).toFixed(2)}
                                    </span>
                                  </td>

                                  {/* Stock */}
                                  <td className="px-3 md:px-6 py-3 md:py-4">
                                    <span className={`px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-bold ${stockStatus.color}`}>
                                      {product.stock} {stockStatus.text}
                                    </span>
                                  </td>

                                  {/* Status */}
                                  <td className="px-3 md:px-6 py-3 md:py-4">
                                    <span className={`px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-bold ${
                                      product.status === 'published' 
                                        ? 'bg-green-100 text-green-800' 
                                        : 'bg-gray-100 text-gray-800'
                                    }`}>
                                      {product.status === 'published' ? 'منشور' : 'مسودة'}
                                    </span>
                                  </td>

                                  {/* Actions */}
                                  <td className="px-3 md:px-6 py-3 md:py-4">
                                    <div className="flex gap-1 md:gap-2 justify-center">
                                      <button
                                        onClick={() => handleEdit(product)}
                                        className="p-1.5 md:p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                                        title="تعديل"
                                      >
                                        <Edit size={14} className="md:w-4 md:h-4" />
                                      </button>
                                      <button
                                        onClick={() => handleOpenColorModal(product)}
                                        className="p-1.5 md:p-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                                        title="إدارة الألوان"
                                      >
                                        <Package size={14} className="md:w-4 md:h-4" />
                                      </button>
                                      <button
                                        onClick={() => handleDelete(product.id)}
                                        className="p-1.5 md:p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                                        title="حذف"
                                      >
                                        <Trash2 size={14} className="md:w-4 md:h-4" />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>

                      {/* Mobile Card View */}
                      <div className="lg:hidden space-y-3">
                        {subcategoryProducts.map((product, index) => {
                          const stockStatus = getStockStatus(product.stock);
                          return (
                            <div key={product.id} className="bg-white border-2 border-[#5E4A45]/20 rounded-xl p-4 shadow-sm">
                              <div className="flex items-start gap-3 mb-3">
                                <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 shadow-md border-2 border-[#5E4A45]/20 flex items-center justify-center flex-shrink-0 overflow-hidden">
                                  {product.image_url ? (
                                    <img
                                      src={`${API_URL}${product.image_url}`}
                                      alt={product.name}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <Package size={20} className="text-[#5E4A45] opacity-30" />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-bold text-[#2c2c2c] text-sm mb-1 line-clamp-2">
                                    {product.name}
                                  </h4>
                                  <p className="text-xs text-[#5E4A45] line-clamp-2">
                                    {product.description || 'لا يوجد وصف'}
                                  </p>
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-3 mb-3">
                                <div>
                                  <span className="text-xs text-gray-500 block">السعر</span>
                                  <span className="text-sm font-bold text-[#2c2c2c]">
                                    ₪{Number(product.price).toFixed(2)}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-xs text-gray-500 block">المخزون</span>
                                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${stockStatus.color}`}>
                                    {product.stock} {stockStatus.text}
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center justify-between">
                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                  product.status === 'published' 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {product.status === 'published' ? 'منشور' : 'مسودة'}
                                </span>
                                
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleEdit(product)}
                                    className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                                    title="تعديل"
                                  >
                                    <Edit size={14} />
                                  </button>
                                  <button
                                    onClick={() => handleOpenColorModal(product)}
                                    className="p-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                                    title="إدارة الألوان"
                                  >
                                    <Package size={14} />
                                  </button>
                                  <button
                                    onClick={() => handleDelete(product.id)}
                                    className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                                    title="حذف"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
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
                  setFormData({ name: '', sku: '', description: '', price: '', old_price: '', stock: '', category_id: '', subcategory_id: '', company_id: '', image_url: '', hover_image_url: '', status: 'published', is_featured: false, is_exclusive: false });
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

              {/* Gallery Images Upload */}
              <div>
                <label className="block text-sm font-medium text-[#2c2c2c] mb-2">
                  الصور الفرعية للمنتج (اختياري)
                  <span className="text-xs text-[#5E4A45] mr-2">يمكنك رفع عدة صور للمنتج</span>
                </label>
                <div className="border-2 border-dashed border-[#e8e8c8] rounded-xl p-6 hover:border-[#5E4A45] transition-colors">
                  <div className="text-center mb-4">
                    <Upload className="mx-auto text-[#5E4A45] mb-2" size={48} />
                    <p className="text-[#5E4A45] mb-2">اضغط لرفع صور إضافية</p>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleGalleryImageChange}
                      className="hidden"
                      id="gallery-images-upload"
                    />
                    <label
                      htmlFor="gallery-images-upload"
                      className="inline-block px-4 py-2 bg-[#f5f5dc] text-[#2c2c2c] rounded-lg cursor-pointer hover:bg-[#e8e8c8] transition-colors"
                    >
                      اختر صور متعددة
                    </label>
                  </div>
                  
                  {galleryImages.length > 0 && (
                    <div className="grid grid-cols-3 gap-4 mt-4">
                      {galleryImages.map((image, index) => (
                        <div key={index} className="relative">
                          <img
                            src={image.preview}
                            alt={`Gallery ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => removeGalleryImage(index)}
                            className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                          >
                            <X size={14} />
                          </button>
                          <div className="absolute bottom-1 left-1 bg-black/60 text-white text-xs px-2 py-1 rounded">
                            {index + 1}
                          </div>
                        </div>
                      ))}
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
                    المعرف (SKU) *
                    <span className="text-xs text-[#5E4A45] mr-2">لمنع تكرار المنتج واستخدامه في الروابط</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-[#e8e8c8] rounded-xl focus:outline-none focus:border-[#5E4A45] transition-colors"
                    placeholder="مثال: bag-rolec"
                  />
                  <p className="text-xs text-gray-500 mt-1">سيتم استخدام SKU في رابط المنتج: /product/bag-rolec</p>
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

                {/* Old Price */}
                <div>
                  <label className="block text-sm font-medium text-[#2c2c2c] mb-2">
                    السعر قبل الخصم ($) <span className="text-gray-500 text-xs">(اختياري)</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.old_price}
                    onChange={(e) => setFormData({ ...formData, old_price: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-[#e8e8c8] rounded-xl focus:outline-none focus:border-[#5E4A45] transition-colors"
                    placeholder="0.00"
                  />
                  <p className="text-xs text-gray-500 mt-1">السعر القديم سيظهر مشطوب مع نسبة الخصم</p>
                </div>

                {/* Stock */}
                <div>
                  <label className="block text-sm font-medium text-[#2c2c2c] mb-2">
                    المخزون *
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    required
                    value={formData.stock}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9]/g, '');
                      setFormData({ ...formData, stock: value });
                    }}
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
                          {editingProduct && 'id' in color ? (
                            <input
                              type="text"
                              value={color.color_name}
                              readOnly
                              className="w-full px-4 py-3 bg-gray-100 border-2 border-[#e8e8c8] rounded-xl focus:outline-none text-center text-[#2c2c2c]"
                            />
                          ) : (
                            <select
                              value={color.color_name}
                              onChange={(e) => {
                                if (editingProduct) {
                                  const newColors = [...productColors];
                                  if (e.target.value === '__custom__') {
                                    newColors[index].color_name = '';
                                  } else {
                                    newColors[index].color_name = e.target.value;
                                  }
                                  setProductColors(newColors);
                                } else {
                                  const newColors = [...tempColors];
                                  if (e.target.value === '__custom__') {
                                    newColors[index].color_name = '';
                                  } else {
                                    newColors[index].color_name = e.target.value;
                                  }
                                  setTempColors(newColors);
                                }
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
                          {((editingProduct && !('id' in color)) || (!editingProduct)) && 
                           (color.color_name === '' || !availableColors.includes(color.color_name)) && (
                            <input
                              type="text"
                              value={color.color_name}
                              onChange={(e) => {
                                if (editingProduct) {
                                  const newColors = [...productColors];
                                  newColors[index].color_name = e.target.value;
                                  setProductColors(newColors);
                                } else {
                                  const newColors = [...tempColors];
                                  newColors[index].color_name = e.target.value;
                                  setTempColors(newColors);
                                }
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
                            readOnly={editingProduct && 'id' in color ? true : false}
                            onChange={(e) => {
                              if (editingProduct && !('id' in color)) {
                                const newColors = [...productColors];
                                newColors[index].stock = parseInt(e.target.value) || 0;
                                setProductColors(newColors);
                              } else if (!editingProduct) {
                                const newColors = [...tempColors];
                                newColors[index].stock = parseInt(e.target.value) || 0;
                                setTempColors(newColors);
                              }
                            }}
                            className={`w-full px-4 py-3 border-2 border-[#e8e8c8] rounded-xl focus:outline-none focus:border-[#5E4A45] text-center text-[#2c2c2c] ${
                              editingProduct && 'id' in color ? 'bg-gray-100' : 'bg-white'
                            }`}
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
                                if (file && (!editingProduct || !('id' in color))) {
                                  const formDataUpload = new FormData();
                                  formDataUpload.append('image', file);
                                  
                                  try {
                                    const response = await fetch(`${API_URL}/upload/product-color-image`, {
                                      method: 'POST',
                                      body: formDataUpload,
                                    });
                                    
                                    const result = await response.json();
                                    if (result.success) {
                                      if (editingProduct) {
                                        const newColors = [...productColors];
                                        newColors[index].image_url = result.imageUrl;
                                        setProductColors(newColors);
                                      } else {
                                        const newColors = [...tempColors];
                                        newColors[index].image_url = result.imageUrl;
                                        setTempColors(newColors);
                                      }
                                    }
                                  } catch (error) {
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
                              } else if (editingProduct) {
                                setProductColors(productColors.filter((_, i) => i !== index));
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
                            src={editingProduct ? `${API_URL}${color.image_url}` : color.image_url}
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
                      // For both new products and editing, add to temp/current array
                      if (editingProduct) {
                        // Add empty color to productColors for editing
                        setProductColors([...productColors, { color_name: '', stock: 0 }]);
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
                    setFormData({ name: '', sku: '', description: '', price: '', old_price: '', stock: '', category_id: '', subcategory_id: '', company_id: '', image_url: '', hover_image_url: '', status: 'published', is_featured: false, is_exclusive: false });
                    setImagePreview('');
                    setHoverImagePreview('');
                    setEditingProduct(null);
                    setTempColors([]);
                    setProductColors([]);
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
                      <select
                        value={colorFormData.color_name}
                        onChange={(e) => setColorFormData({ ...colorFormData, color_name: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-[#e8e8c8] rounded-xl focus:outline-none focus:border-[#5E4A45] transition-colors"
                      >
                        <option value="">اختر لون من القائمة</option>
                        {availableColors.map((color, index) => (
                          <option key={index} value={color}>
                            {color}
                          </option>
                        ))}
                        <option value="__new__">+ إضافة لون جديد</option>
                      </select>
                      
                      {(colorFormData.color_name === '__new__' || (colorFormData.color_name && !availableColors.includes(colorFormData.color_name))) && (
                        <input
                          type="text"
                          value={colorFormData.color_name === '__new__' ? '' : colorFormData.color_name}
                          placeholder="اكتب اسم اللون الجديد"
                          className="w-full px-4 py-3 border-2 border-[#e8e8c8] rounded-xl focus:outline-none focus:border-[#5E4A45] transition-colors mt-3"
                          onChange={(e) => {
                            setColorFormData({ ...colorFormData, color_name: e.target.value });
                          }}
                          autoFocus
                        />
                      )}
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
                      صورة المنتج باللون الرئيسية
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

                  {/* Color Gallery Images */}
                  <div>
                    <label className="block text-sm font-medium text-[#2c2c2c] mb-2">
                      الصور الفرعية للون (اختياري)
                    </label>
                    <div className="border-2 border-dashed border-[#e8e8c8] rounded-xl p-4 hover:border-[#5E4A45] transition-colors">
                      <label className="cursor-pointer block text-center">
                        <Upload className="mx-auto text-[#5E4A45] mb-2" size={32} />
                        <p className="text-[#5E4A45] text-sm mb-1">اضغط لرفع صور فرعية للون</p>
                        <p className="text-gray-500 text-xs">يمكنك رفع عدة صور</p>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={async (e) => {
                            const files = Array.from(e.target.files || []);
                            const newImages = [];
                            
                            for (const file of files) {
                              const formData = new FormData();
                              formData.append('file', file);
                              
                              try {
                                const response = await fetch(`${API_URL}/upload/product-gallery-image`, {
                                  method: 'POST',
                                  body: formData,
                                });
                                
                                const result = await response.json();
                                if (result.success) {
                                  newImages.push({
                                    url: result.imageUrl,
                                    preview: `${API_URL}${result.imageUrl}`
                                  });
                                }
                              } catch (error) {
                              }
                            }
                            
                            setColorGalleryImages([...colorGalleryImages, ...newImages]);
                          }}
                          className="hidden"
                        />
                      </label>
                      
                      {colorGalleryImages.length > 0 && (
                        <div className="grid grid-cols-3 gap-3 mt-4">
                          {colorGalleryImages.map((img, index) => (
                            <div key={index} className="relative group">
                              <img
                                src={img.preview}
                                alt={`Gallery ${index + 1}`}
                                className="w-full h-24 object-cover rounded-lg"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  setColorGalleryImages(colorGalleryImages.filter((_, i) => i !== index));
                                }}
                                className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          ))}
                        </div>
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
                              src={`${API_URL}${color.image_url}`}
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

      {/* Toast Notification */}
      {showToast && (
        <AdminToast
          message={toastMessage}
          type={toastType}
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  );
}
