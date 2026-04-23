'use client';

import { useState, useEffect, useRef } from 'react';
import AdminLayout from '../components/AdminLayout';
import ConfirmModal from '../components/ConfirmModal';
import { API_URL } from '@/lib/api';

interface Variant {
  id?: string;
  title: string;
  sku: string;
  price: number;
  compare_at_price?: number;
  inventory_quantity: number;
}

interface ProductImage {
  id?: string;
  url: string;
  alt: string;
  position: number;
}

interface Product {
  id: string;
  title: string;
  title_en?: string;
  subtitle: string;
  description: string;
  handle: string;
  thumbnail: string;
  hover_image?: string;
  status: string;
  category_id: string;
  category_name: string;
  brand_id: string;
  brand_name: string;
  show_in_latest: boolean;
  is_exclusive?: boolean;
  colors: any[];
  variants: Variant[];
  images?: ProductImage[];
}

interface Brand {
  id: string;
  name: string;
}

interface Category {
  id: string;
  name: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    title: '', title_en: '', subtitle: '', description: '', handle: '', thumbnail: '', hover_image: '',
    status: 'draft', category_id: '', brand_id: '',
    show_in_latest: true,
    is_exclusive: false,
    variants: [{ title: 'افتراضي', sku: '', price: 0, inventory_quantity: 0 }] as Variant[],
    colors: [] as { color_name: string; image_url: string; inventory_quantity?: number }[],
    images: [] as { url: string; alt: string }[],
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadingHoverImage, setUploadingHoverImage] = useState(false);
  const [uploadingColorImage, setUploadingColorImage] = useState<number | null>(null);
  const [uploadingGalleryImage, setUploadingGalleryImage] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<{ show: boolean; id: string; title: string }>({ show: false, id: '', title: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const hoverImageInputRef = useRef<HTMLInputElement>(null);
  const galleryImageInputRef = useRef<HTMLInputElement>(null);
  const colorImageInputRefs = useRef<{ [key: number]: HTMLInputElement | null }>({});
  
  const availableColors = [
    'أسود', 'أبيض', 'أزرق', 'أحمر',
    'أسود مموج', 'سكني', 'أحمر مموج', 'أبيض مموج'
  ];

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [productsRes, categoriesRes, brandsRes] = await Promise.all([
        fetch(`${API_URL}/store/products?status=all&limit=1000`),
        fetch(`${API_URL}/store/collections`),
        fetch(`${API_URL}/store/brands`),
      ]);
      
      if (productsRes.ok) {
        const data = await productsRes.json();
        setProducts(data.products || []);
      }
      
      if (categoriesRes.ok) {
        const data = await categoriesRes.json();
        setCategories(data.categories || []);
      }
      
      if (brandsRes.ok) {
        const data = await brandsRes.json();
        setBrands(data.brands || []);
      }
    } catch (error) {
      // Error handled silently
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch(`${API_URL}/admin/upload`, {
        method: 'POST',
        body: fd,
      });
      const data = await res.json();
      if (res.ok) {
        // Backend returns filename only, we add /uploads/ prefix
        const imageUrl = data.url.startsWith('http') ? data.url : `${API_URL}/uploads/${data.url}`;
        setFormData({ ...formData, thumbnail: imageUrl });
      } else throw new Error(data.error);
    } catch (err: any) {
      setError('فشل رفع الصورة: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleHoverImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingHoverImage(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch(`${API_URL}/admin/upload`, {
        method: 'POST',
        body: fd,
      });
      const data = await res.json();
      if (res.ok) {
        // Backend returns filename only, we add /uploads/ prefix
        const imageUrl = data.url.startsWith('http') ? data.url : `${API_URL}/uploads/${data.url}`;
        setFormData({ ...formData, hover_image: imageUrl });
      } else throw new Error(data.error);
    } catch (err: any) {
      setError('فشل رفع صورة الهوفر: ' + err.message);
    } finally {
      setUploadingHoverImage(false);
    }
  };

  const handleColorImageUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingColorImage(index);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch(`${API_URL}/admin/upload`, {
        method: 'POST',
        body: fd,
      });
      const data = await res.json();
      if (res.ok) {
        const newColors = [...formData.colors];
        // Backend returns filename only, we add /uploads/ prefix
        const imageUrl = data.url.startsWith('http') ? data.url : `${API_URL}/uploads/${data.url}`;
        newColors[index].image_url = imageUrl;
        setFormData({ ...formData, colors: newColors });
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      setError('فشل رفع صورة اللون: ' + err.message);
    } finally {
      setUploadingColorImage(null);
    }
  };

  const handleGalleryImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploadingGalleryImage(true);
    try {
      const newImages = [...formData.images];
      for (let i = 0; i < files.length; i++) {
        const fd = new FormData();
        fd.append('file', files[i]);
        const res = await fetch(`${API_URL}/admin/upload`, {
          method: 'POST',
          body: fd,
        });
        const data = await res.json();
        if (res.ok) {
          const imageUrl = data.url.startsWith('http') ? data.url : `${API_URL}/uploads/${data.url}`;
          newImages.push({ url: imageUrl, alt: '' });
        } else {
          throw new Error(data.error || 'فشل رفع الصورة');
        }
      }
      setFormData({ ...formData, images: newImages });
    } catch (err: any) {
      setError('فشل رفع الصور: ' + err.message);
    } finally {
      setUploadingGalleryImage(false);
      if (galleryImageInputRef.current) galleryImageInputRef.current.value = '';
    }
  };

  const removeGalleryImage = (index: number) => {
    setFormData({ ...formData, images: formData.images.filter((_, i) => i !== index) });
  };

  const moveGalleryImage = (index: number, direction: 'up' | 'down') => {
    const newImages = [...formData.images];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newImages.length) return;
    [newImages[index], newImages[targetIndex]] = [newImages[targetIndex], newImages[index]];
    setFormData({ ...formData, images: newImages });
  };

  const openCreateModal = () => {
    setEditingProduct(null);
    setFormData({
      title: '', title_en: '', subtitle: '', description: '', handle: '', thumbnail: '', hover_image: '',
      status: 'draft', category_id: categories[0]?.id || '', brand_id: '',
      show_in_latest: true,
      is_exclusive: false,
      variants: [{ title: 'افتراضي', sku: '', price: 0, inventory_quantity: 0 }],
      colors: [],
      images: [],
    });
    setError('');
    setShowModal(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      title: product.title, title_en: product.title_en || '', subtitle: product.subtitle || '', description: product.description || '',
      handle: product.handle, thumbnail: product.thumbnail || '', hover_image: product.hover_image || '', status: product.status,
      category_id: product.category_id || '', brand_id: product.brand_id || '',
      show_in_latest: product.show_in_latest !== false,
      is_exclusive: product.is_exclusive || false,
      variants: product.variants?.length > 0 ? product.variants.map(v => ({
        id: v.id, title: v.title, sku: v.sku || '', price: v.price, compare_at_price: v.compare_at_price, inventory_quantity: v.inventory_quantity,
      })) : [{ title: 'افتراضي', sku: '', price: 0, inventory_quantity: 0 }],
      colors: product.colors || [],
      images: product.images?.map(img => ({ url: img.url, alt: img.alt || '' })) || [],
    });
    setError('');
    setShowModal(true);
  };

  const generateHandle = (name: string) => {
    return name.toLowerCase().replace(/[أإآا]/g, 'a').replace(/[ب]/g, 'b').replace(/[ت]/g, 't')
      .replace(/[س]/g, 's').replace(/[ك]/g, 'k').replace(/[ل]/g, 'l').replace(/[م]/g, 'm')
      .replace(/[ن]/g, 'n').replace(/\s+/g, '-').replace(/[^\w-]/g, '').replace(/--+/g, '-');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const url = editingProduct ? `${API_URL}/admin/products/${editingProduct.id}` : `${API_URL}/admin/products`;
      const res = await fetch(url, {
        method: editingProduct ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error((await res.json()).error || 'فشل حفظ المنتج');
      setShowModal(false);
      fetchData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`${API_URL}/admin/products/${id}`, { method: 'DELETE' });
      fetchData();
    } catch (err: any) {
      setError('فشل الحذف');
    } finally {
      setConfirmDelete({ show: false, id: '', title: '' });
    }
  };

  const addVariant = () => setFormData({ ...formData, variants: [...formData.variants, { title: '', sku: '', price: 0, inventory_quantity: 0 }] });
  const removeVariant = (i: number) => { if (formData.variants.length > 1) setFormData({ ...formData, variants: formData.variants.filter((_, idx) => idx !== i) }); };
  const updateVariant = (i: number, field: keyof Variant, value: any) => {
    const newV = [...formData.variants];
    newV[i] = { ...newV[i], [field]: value };
    setFormData({ ...formData, variants: newV });
  };

  const formatPrice = (p: number) => (p / 100).toFixed(2) + ' ₪';
  const totalStock = (p: Product) => p.variants?.reduce((s, v) => s + (v.inventory_quantity || 0), 0) || 0;

  // Group products by category
  const productsByCategory = products.reduce((acc, product) => {
    const categoryId = product.category_id || 'uncategorized';
    if (!acc[categoryId]) {
      acc[categoryId] = {
        name: product.category_name || 'بدون فئة',
        products: []
      };
    }
    acc[categoryId].products.push(product);
    return acc;
  }, {} as { [key: string]: { name: string; products: Product[] } });

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">المنتجات</h1>
          <p className="text-gray-400 mt-1 text-sm sm:text-base">إدارة منتجات المتجر - {products.length} منتج</p>
        </div>
        <button onClick={openCreateModal} className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium flex items-center justify-center gap-2">
          <span>+</span> إضافة منتج
        </button>
      </div>

      {loading ? (
        <div className="text-center text-gray-400 py-12">جاري التحميل...</div>
      ) : products.length === 0 ? (
        <div className="bg-gray-800 rounded-xl p-12 text-center">
          <div className="text-6xl mb-4">📦</div>
          <p className="text-gray-400 mb-4">لا توجد منتجات بعد</p>
          <button onClick={openCreateModal} className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg">أضف منتجك الأول</button>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(productsByCategory).map(([categoryId, { name, products: categoryProducts }]) => (
            <div key={categoryId} className="bg-gray-800 rounded-xl overflow-hidden">
              <div className="bg-gray-700 px-6 py-4 border-b border-gray-600">
                <h2 className="text-xl font-bold text-white flex items-center gap-3">
                  <span>{name}</span>
                  <span className="text-sm font-normal text-gray-400">({categoryProducts.length} منتج)</span>
                </h2>
              </div>
              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full" dir="rtl">
                  <thead className="bg-gray-750">
                    <tr>
                      <th className="text-right text-gray-300 px-6 py-4">المنتج</th>
                      <th className="text-right text-gray-300 px-6 py-4">السعر</th>
                      <th className="text-right text-gray-300 px-6 py-4">المخزون</th>
                      <th className="text-right text-gray-300 px-6 py-4">الحالة</th>
                      <th className="text-right text-gray-300 px-6 py-4">إجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categoryProducts.map((product) => (
                      <tr key={product.id} className="border-t border-gray-700 hover:bg-gray-750">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-14 h-14 bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
                              {product.thumbnail ? <img src={product.thumbnail} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>}
                            </div>
                            <div>
                              <p className="text-white font-medium">{product.title}</p>
                              <p className="text-gray-500 text-sm">{product.variants?.length || 0} متغير</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-green-400 font-medium">{product.variants?.[0]?.price ? formatPrice(product.variants[0].price) : '-'}</td>
                        <td className="px-6 py-4"><span className={`font-medium ${totalStock(product) > 10 ? 'text-green-400' : totalStock(product) > 0 ? 'text-yellow-400' : 'text-red-400'}`}>{totalStock(product)}</span></td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${product.status === 'published' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                            {product.status === 'published' ? 'منشور' : 'مسودة'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button onClick={() => openEditModal(product)} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-sm">تعديل</button>
                            <button onClick={() => setConfirmDelete({ show: true, id: product.id, title: product.title })} className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded text-sm">حذف</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Mobile/Tablet Card View */}
              <div className="lg:hidden space-y-4 p-4" dir="rtl">
                {categoryProducts.map((product) => (
                  <div key={product.id} className="bg-gray-750 rounded-lg p-4 space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
                        {product.thumbnail ? <img src={product.thumbnail} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-medium text-base sm:text-lg mb-1 truncate">{product.title}</h3>
                        <div className="flex flex-wrap items-center gap-2 text-sm">
                          <span className="text-green-400 font-bold">{product.variants?.[0]?.price ? formatPrice(product.variants[0].price) : '-'}</span>
                          <span className="text-gray-500">•</span>
                          <span className={`font-medium ${totalStock(product) > 10 ? 'text-green-400' : totalStock(product) > 0 ? 'text-yellow-400' : 'text-red-400'}`}>مخزون: {totalStock(product)}</span>
                          <span className="text-gray-500">•</span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${product.status === 'published' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                            {product.status === 'published' ? 'منشور' : 'مسودة'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => openEditModal(product)} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium">تعديل</button>
                      <button onClick={() => setConfirmDelete({ show: true, id: product.id, title: product.title })} className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium">حذف</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-gray-800 rounded-2xl w-full max-w-2xl my-8" dir="rtl">
            <div className="p-6 border-b border-gray-700 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">{editingProduct ? 'تعديل المنتج' : 'منتج جديد'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white text-2xl">×</button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
              {error && <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg">{error}</div>}

              {/* Image Upload */}
              <div>
                <label className="block text-gray-300 mb-2 font-medium">صورة المنتج</label>
                <div className="border-2 border-dashed border-gray-600 rounded-xl p-4 text-center hover:border-purple-500 transition-colors cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                  {formData.thumbnail ? (
                    <div className="relative inline-block">
                      <img src={formData.thumbnail} alt="Preview" className="h-40 object-contain rounded-lg mx-auto" />
                      <button type="button" onClick={(e) => { e.stopPropagation(); setFormData({ ...formData, thumbnail: '' }); }} className="absolute -top-2 -left-2 bg-red-600 text-white w-7 h-7 rounded-full text-lg">×</button>
                    </div>
                  ) : (
                    <div className="py-6">
                      <div className="text-4xl mb-2">📷</div>
                      <p className="text-gray-400">{uploading ? 'جاري الرفع...' : 'اضغط لرفع صورة'}</p>
                    </div>
                  )}
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </div>

              {/* Hover Image Upload */}
              <div>
                <label className="block text-gray-300 mb-2 font-medium">صورة الهوفر (اختياري)</label>
                <p className="text-gray-500 text-sm mb-2">صورة تظهر عند تمرير المؤشر على المنتج</p>
                <div className="border-2 border-dashed border-gray-600 rounded-xl p-4 text-center hover:border-purple-500 transition-colors cursor-pointer" onClick={() => hoverImageInputRef.current?.click()}>
                  {formData.hover_image ? (
                    <div className="relative inline-block">
                      <img src={formData.hover_image} alt="Hover Preview" className="h-40 object-contain rounded-lg mx-auto" />
                      <button type="button" onClick={(e) => { e.stopPropagation(); setFormData({ ...formData, hover_image: '' }); }} className="absolute -top-2 -left-2 bg-red-600 text-white w-7 h-7 rounded-full text-lg">×</button>
                    </div>
                  ) : (
                    <div className="py-6">
                      <div className="text-4xl mb-2">🖼️</div>
                      <p className="text-gray-400">{uploadingHoverImage ? 'جاري الرفع...' : 'اضغط لرفع صورة الهوفر'}</p>
                    </div>
                  )}
                </div>
                <input ref={hoverImageInputRef} type="file" accept="image/*" onChange={handleHoverImageUpload} className="hidden" />
              </div>

              {/* Gallery Images Upload */}
              <div>
                <label className="block text-gray-300 mb-2 font-medium">معرض صور المنتج (اختياري)</label>
                <p className="text-gray-500 text-sm mb-2">أضف صور إضافية للمنتج - ستظهر في صفحة المنتج كمعرض صور</p>
                
                {formData.images.length > 0 && (
                  <div className="grid grid-cols-4 sm:grid-cols-5 gap-3 mb-3">
                    {formData.images.map((image, index) => (
                      <div key={index} className="relative group bg-gray-700 rounded-lg overflow-hidden aspect-square">
                        <img src={image.url} alt={image.alt || `صورة ${index + 1}`} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                          {index > 0 && (
                            <button type="button" onClick={() => moveGalleryImage(index, 'up')} className="p-1 bg-white/20 rounded hover:bg-white/40 text-white text-xs" title="تقديم">▶</button>
                          )}
                          {index < formData.images.length - 1 && (
                            <button type="button" onClick={() => moveGalleryImage(index, 'down')} className="p-1 bg-white/20 rounded hover:bg-white/40 text-white text-xs" title="تأخير">◀</button>
                          )}
                          <button type="button" onClick={() => removeGalleryImage(index)} className="p-1 bg-red-500/80 rounded hover:bg-red-600 text-white text-xs" title="حذف">✕</button>
                        </div>
                        <div className="absolute top-1 right-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded">{index + 1}</div>
                      </div>
                    ))}
                  </div>
                )}
                
                <div
                  className="border-2 border-dashed border-gray-600 rounded-xl p-4 text-center hover:border-purple-500 transition-colors cursor-pointer"
                  onClick={() => galleryImageInputRef.current?.click()}
                >
                  <div className="py-4">
                    <div className="text-3xl mb-2">📸</div>
                    <p className="text-gray-400 text-sm">
                      {uploadingGalleryImage ? 'جاري الرفع...' : 'اضغط لإضافة صور للمعرض (يمكنك اختيار عدة صور)'}
                    </p>
                    {formData.images.length > 0 && (
                      <p className="text-purple-400 text-xs mt-1">{formData.images.length} صورة مضافة</p>
                    )}
                  </div>
                </div>
                <input ref={galleryImageInputRef} type="file" accept="image/*" multiple onChange={handleGalleryImageUpload} className="hidden" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 mb-2 font-medium">اسم المنتج *</label>
                  <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value, handle: editingProduct ? formData.handle : generateHandle(e.target.value) })} className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" required />
                </div>
                <div>
                  <label className="block text-gray-300 mb-2 font-medium">الاسم بالإنجليزية</label>
                  <input type="text" value={formData.title_en} onChange={(e) => setFormData({ ...formData, title_en: e.target.value })} className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" dir="ltr" placeholder="English product name" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 mb-2 font-medium">المعرف</label>
                  <input type="text" value={formData.handle} onChange={(e) => setFormData({ ...formData, handle: e.target.value })} className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none font-mono" dir="ltr" required />
                </div>
                <div>
                  <label className="block text-gray-300 mb-2 font-medium">العنوان الفرعي</label>
                  <input type="text" value={formData.subtitle} onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })} className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" />
                </div>
              </div>

              <div>
                <label className="block text-gray-300 mb-2 font-medium">الوصف</label>
                <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none resize-none" rows={3} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 mb-2 font-medium">الفئة</label>
                  <select value={formData.category_id} onChange={(e) => setFormData({ ...formData, category_id: e.target.value })} className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none">
                    <option value="">اختر فئة</option>
                    {categories.map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-300 mb-2 font-medium">الحالة</label>
                  <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none">
                    <option value="draft">مسودة</option>
                    <option value="published">منشور</option>
                  </select>
                </div>
              </div>

              {/* Show in Latest Products & Exclusive */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-700/30 rounded-xl p-4 border border-gray-600">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.show_in_latest}
                      onChange={(e) => setFormData({ ...formData, show_in_latest: e.target.checked })}
                      className="w-5 h-5 rounded bg-gray-700 border-gray-600 text-purple-600 focus:ring-2 focus:ring-purple-500"
                    />
                    <div>
                      <span className="text-white font-medium">عرض في أحدث المنتجات</span>
                      <p className="text-gray-400 text-sm mt-1">سيظهر في الصفحة الرئيسية</p>
                    </div>
                  </label>
                </div>

                <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 rounded-xl p-4 border border-yellow-500/30">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_exclusive}
                      onChange={(e) => setFormData({ ...formData, is_exclusive: e.target.checked })}
                      className="w-5 h-5 rounded bg-gray-700 border-yellow-500 text-yellow-500 focus:ring-2 focus:ring-yellow-500"
                    />
                    <div>
                      <span className="text-white font-medium flex items-center gap-2">
                        منتج حصري
                      </span>
                      <p className="text-gray-300 text-sm mt-1">سيظهر شارة &quot;حصري&quot; على المنتج</p>
                    </div>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 mb-2 font-medium">الشركة المصنعة</label>
                  <select value={formData.brand_id} onChange={(e) => setFormData({ ...formData, brand_id: e.target.value })} className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none">
                    <option value="">اختر شركة</option>
                    {brands.map((brand) => <option key={brand.id} value={brand.id}>{brand.name}</option>)}
                  </select>
                </div>
              </div>

              {/* Colors Section */}
              <div className="border-t border-gray-700 pt-5">
                <label className="block text-gray-300 mb-3 font-medium text-lg">الألوان المتاحة</label>
                <p className="text-gray-500 text-sm mb-3">أضف الألوان المتاحة للمنتج مع صورة لكل لون</p>
                {formData.colors.map((color, index) => (
                  <div key={index} className="bg-gray-700/50 rounded-xl p-4 mb-3">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-white font-medium">لون {index + 1}</span>
                      <button type="button" onClick={() => setFormData({ ...formData, colors: formData.colors.filter((_, i) => i !== index) })} className="text-red-400 hover:text-red-300 text-sm">حذف</button>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <select 
                          value={availableColors.includes(color.color_name) ? color.color_name : 'custom'} 
                          onChange={(e) => {
                            const newColors = [...formData.colors];
                            if (e.target.value === 'custom') {
                              newColors[index].color_name = '';
                            } else {
                              newColors[index].color_name = e.target.value;
                            }
                            setFormData({ ...formData, colors: newColors });
                          }} 
                          className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg text-sm"
                        >
                          <option value="">اختر لون</option>
                          {availableColors.map((c) => <option key={c} value={c}>{c}</option>)}
                          <option value="custom">➕ إضافة لون جديد</option>
                        </select>
                        
                        {(!availableColors.includes(color.color_name) || color.color_name === '') && (
                          <input
                            type="text"
                            value={color.color_name}
                            onChange={(e) => {
                              const newColors = [...formData.colors];
                              newColors[index].color_name = e.target.value;
                              setFormData({ ...formData, colors: newColors });
                            }}
                            placeholder="اكتب اسم اللون (مثال: أصفر، برتقالي، بنفسجي...)"
                            className="w-full bg-gray-600 text-white px-3 py-2 rounded-lg text-sm mt-2 placeholder:text-gray-400"
                          />
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-gray-400 text-xs mb-2">صورة اللون</label>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => colorImageInputRefs.current[index]?.click()}
                            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded-lg text-sm transition-colors"
                            disabled={uploadingColorImage === index}
                          >
                            {uploadingColorImage === index ? 'جاري الرفع...' : color.image_url ? 'تغيير الصورة' : 'رفع صورة'}
                          </button>
                          {color.image_url && (
                            <div className="w-12 h-12 rounded-lg overflow-hidden border border-gray-600">
                              <img src={color.image_url} alt={color.color_name} className="w-full h-full object-cover" />
                            </div>
                          )}
                        </div>
                        <input
                          ref={(el) => { colorImageInputRefs.current[index] = el; }}
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleColorImageUpload(index, e)}
                          className="hidden"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-gray-400 text-xs mb-2">📦 الكمية المتوفرة</label>
                        <input
                          type="number"
                          value={color.inventory_quantity || 0}
                          onChange={(e) => {
                            const newColors = [...formData.colors];
                            newColors[index].inventory_quantity = parseInt(e.target.value) || 0;
                            setFormData({ ...formData, colors: newColors });
                          }}
                          min="0"
                          placeholder="0"
                          className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg text-sm"
                        />
                        <p className="text-gray-500 text-xs mt-1">عدد القطع المتوفرة من هذا اللون</p>
                      </div>
                    </div>
                  </div>
                ))}
                <button type="button" onClick={() => setFormData({ ...formData, colors: [...formData.colors, { color_name: '', image_url: '' }] })} className="text-purple-400 hover:text-purple-300 text-sm bg-purple-500/10 px-4 py-2 rounded">+ إضافة لون</button>
              </div>

              {/* السعر والمخزون */}
              <div className="border-t border-gray-700 pt-5">
                <label className="block text-gray-300 mb-4 font-medium text-lg">السعر والمخزون</label>
                <div className="bg-gray-700/50 rounded-xl p-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-gray-300 text-sm mb-2 block font-medium">💰 السعر الحالي</label>
                      <div className="relative">
                        <input 
                          type="number" 
                          value={formData.variants[0]?.price || 0} 
                          onChange={(e) => updateVariant(0, 'price', parseInt(e.target.value) || 0)} 
                          className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg text-base border-2 border-gray-600 focus:border-purple-500 outline-none"
                          placeholder="مثال: 29999"
                        />
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">هللة</span>
                      </div>
                      <p className="text-gray-500 text-xs mt-1">السعر بالهللة (مثال: 29999 = 299.99 ريال)</p>
                    </div>

                    <div>
                      <label className="text-gray-300 text-sm mb-2 block font-medium">🏷️ السعر قبل الخصم (اختياري)</label>
                      <div className="relative">
                        <input 
                          type="number" 
                          value={formData.variants[0]?.compare_at_price || ''} 
                          onChange={(e) => updateVariant(0, 'compare_at_price', parseInt(e.target.value) || undefined)} 
                          className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg text-base border-2 border-gray-600 focus:border-purple-500 outline-none"
                          placeholder="مثال: 34999"
                        />
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">هللة</span>
                      </div>
                      <p className="text-gray-500 text-xs mt-1">السعر القديم سيظهر مشطوب مع نسبة الخصم</p>
                    </div>

                    <div className="md:col-span-2">
                      <label className="text-gray-300 text-sm mb-2 block font-medium">📦 الكمية المتوفرة</label>
                      <input 
                        type="number" 
                        value={formData.variants[0]?.inventory_quantity || 0} 
                        onChange={(e) => updateVariant(0, 'inventory_quantity', parseInt(e.target.value) || 0)} 
                        className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg text-base border-2 border-gray-600 focus:border-purple-500 outline-none"
                        placeholder="مثال: 50"
                      />
                      <p className="text-gray-500 text-xs mt-1">عدد القطع المتوفرة في المخزون</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-700">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg font-medium">إلغاء</button>
                <button type="submit" disabled={saving || uploading} className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-medium disabled:opacity-50">
                  {saving ? 'جاري الحفظ...' : 'حفظ المنتج'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <ConfirmModal
        isOpen={confirmDelete.show}
        title="حذف المنتج"
        message={`هل أنت متأكد من حذف "${confirmDelete.title}"؟ لا يمكن التراجع عن هذا الإجراء.`}
        confirmText="حذف"
        cancelText="إلغاء"
        type="danger"
        onConfirm={() => handleDelete(confirmDelete.id)}
        onCancel={() => setConfirmDelete({ show: false, id: '', title: '' })}
      />
    </AdminLayout>
  );
}
