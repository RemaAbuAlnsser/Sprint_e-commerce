'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '../components/AdminLayout';
import ConfirmModal from '../components/ConfirmModal';
import { API_URL } from '@/lib/api';

interface ParentCategory {
  id: string;
  name: string;
  handle: string;
  description: string;
  image_url: string | null;
  display_order: number;
  is_active: boolean;
  subcategories_count?: number;
  products_count?: number;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<ParentCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ParentCategory | null>(null);
  const [formData, setFormData] = useState({ name: '', handle: '', description: '', image_url: '', display_order: 0 });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => { fetchCategories(); }, []);


  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_URL}/store/parent-categories`);
      const data = await res.json();
      setCategories(data.parent_categories || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);

      const res = await fetch(`${API_URL}/admin/upload`, {
        method: 'POST',
        body: formDataUpload,
      });

      const data = await res.json();
      if (res.ok) {
        const imageUrl = data.url.startsWith('http') ? data.url : `${API_URL}/uploads/${data.url}`;
        setFormData({ ...formData, image_url: imageUrl });
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      setError('فشل رفع الصورة: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const openCreateModal = () => {
    setEditingCategory(null);
    setFormData({ name: '', handle: '', description: '', image_url: '', display_order: 0 });
    setError('');
    setShowModal(true);
  };

  const openEditModal = (e: React.MouseEvent, category: ParentCategory) => {
    e.stopPropagation();
    setEditingCategory(category);
    setFormData({
      name: category.name,
      handle: category.handle,
      description: category.description || '',
      image_url: category.image_url || '',
      display_order: category.display_order || 0,
    });
    setError('');
    setShowModal(true);
  };

  const generateHandle = (name: string) => {
    return name.toLowerCase().replace(/[أإآا]/g, 'a').replace(/[ب]/g, 'b').replace(/[ت]/g, 't')
      .replace(/[س]/g, 's').replace(/[ك]/g, 'k').replace(/[ل]/g, 'l').replace(/[م]/g, 'm')
      .replace(/[ن]/g, 'n').replace(/[و]/g, 'w').replace(/[ي]/g, 'y').replace(/\s+/g, '-')
      .replace(/[^\w-]/g, '').replace(/--+/g, '-');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const url = editingCategory
        ? `${API_URL}/admin/parent-categories/${editingCategory.id}`
        : `${API_URL}/admin/parent-categories`;

      const res = await fetch(url, {
        method: editingCategory ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'فشل حفظ الفئة');
      }

      setShowModal(false);
      fetchCategories();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const [confirmDelete, setConfirmDelete] = useState<{ show: boolean; id: string; name: string }>({ show: false, id: '', name: '' });

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`${API_URL}/admin/parent-categories/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'فشل الحذف');
      }

      fetchCategories();
    } catch (err: any) {
      setError('فشل الحذف: ' + err.message);
    } finally {
      setConfirmDelete({ show: false, id: '', name: '' });
    }
  };

  const toggleActive = async (e: React.MouseEvent, category: ParentCategory) => {
    e.stopPropagation();
    try {
      await fetch(`${API_URL}/admin/parent-categories/${category.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !category.is_active }),
      });
      fetchCategories();
    } catch (error) {
      console.error('Error toggling active:', error);
    }
  };

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">الفئات الرئيسية</h1>
          <p className="text-gray-400 mt-1">إدارة الفئات الرئيسية للمتجر - اضغط على فئة لإدارة فئاتها الثانوية</p>
        </div>
        <button onClick={openCreateModal} className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2">
          <span>+</span> إضافة فئة رئيسية
        </button>
      </div>

      {loading ? (
        <div className="text-center text-gray-400 py-12">جاري التحميل...</div>
      ) : categories.length === 0 ? (
        <div className="bg-gray-800 rounded-xl p-12 text-center">
          <div className="text-6xl mb-4">📁</div>
          <p className="text-gray-400 mb-4">لا توجد فئات رئيسية بعد</p>
          <button onClick={openCreateModal} className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg">
            أنشئ فئتك الرئيسية الأولى
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <div
              key={category.id}
              onClick={() => router.push(`/admin/categories/${category.id}`)}
              className="bg-gray-800 rounded-xl overflow-hidden group cursor-pointer hover:ring-2 hover:ring-purple-500 transition-all"
            >
              <div className="h-48 bg-gray-700 relative overflow-hidden">
                {category.image_url ? (
                  <img src={category.image_url} alt={category.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-500">
                    <span className="text-6xl">📁</span>
                  </div>
                )}
                {/* Status badge */}
                <div className={`absolute top-2 right-2 text-white text-xs px-2 py-1 rounded ${category.is_active ? 'bg-green-600' : 'bg-gray-600'}`}>
                  {category.is_active ? 'نشط' : 'غير نشط'}
                </div>
                {/* Subcategories count */}
                <div className="absolute top-2 left-2 bg-purple-600 text-white text-xs px-2 py-1 rounded">
                  {category.subcategories_count || 0} فئة ثانوية
                </div>
                {/* Products count */}
                <div className="absolute bottom-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                  {category.products_count || 0} منتج
                </div>
              </div>
              <div className="p-5">
                <h3 className="text-white font-bold text-xl mb-1">{category.name}</h3>
                <p className="text-gray-500 text-sm mb-2 font-mono">/{category.handle}</p>
                <p className="text-gray-400 text-sm line-clamp-2 mb-4">{category.description || 'بدون وصف'}</p>

                <div className="flex gap-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); router.push(`/admin/categories/${category.id}`); }}
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg text-sm"
                  >
                    📂 الفئات الثانوية
                  </button>
                  <button onClick={(e) => openEditModal(e, category)} className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded-lg text-sm">
                    تعديل
                  </button>
                  <button onClick={(e) => toggleActive(e, category)} className={`py-2 px-3 rounded-lg text-sm ${category.is_active ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-green-600 hover:bg-green-700'} text-white`}>
                    {category.is_active ? 'إخفاء' : 'تفعيل'}
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); setConfirmDelete({ show: true, id: category.id, name: category.name }); }} className="bg-red-600 hover:bg-red-700 text-white py-2 px-3 rounded-lg text-sm">
                    حذف
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl w-full max-w-lg" dir="rtl">
            <div className="p-6 border-b border-gray-700 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">{editingCategory ? 'تعديل الفئة الرئيسية' : 'فئة رئيسية جديدة'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white text-2xl">&times;</button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {error && <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg">{error}</div>}

              {/* Image Upload */}
              <div>
                <label className="block text-gray-300 mb-2 font-medium">صورة الفئة</label>
                <div className="border-2 border-dashed border-gray-600 rounded-xl p-4 text-center hover:border-purple-500 transition-colors cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                  {formData.image_url ? (
                    <div className="relative">
                      <img src={formData.image_url} alt="Preview" className="w-full h-40 object-cover rounded-lg" />
                      <button type="button" onClick={(e) => { e.stopPropagation(); setFormData({ ...formData, image_url: '' }); }} className="absolute top-2 left-2 bg-red-600 text-white w-8 h-8 rounded-full">&times;</button>
                    </div>
                  ) : (
                    <div className="py-8">
                      <div className="text-4xl mb-2">📷</div>
                      <p className="text-gray-400">{uploading ? 'جاري الرفع...' : 'اضغط لرفع صورة'}</p>
                      <p className="text-gray-500 text-sm mt-1">PNG, JPG, GIF حتى 5MB</p>
                    </div>
                  )}
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </div>

              <div>
                <label className="block text-gray-300 mb-2 font-medium">اسم الفئة الرئيسية *</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value, handle: editingCategory ? formData.handle : generateHandle(e.target.value) })} className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" placeholder="مثال: إلكترونيات" required />
              </div>

              <div>
                <label className="block text-gray-300 mb-2 font-medium">المعرف (Handle)</label>
                <input type="text" value={formData.handle} onChange={(e) => setFormData({ ...formData, handle: e.target.value })} className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none font-mono" dir="ltr" placeholder="electronics" required />
              </div>

              <div>
                <label className="block text-gray-300 mb-2 font-medium">الوصف</label>
                <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none resize-none" rows={3} placeholder="وصف مختصر للفئة..." />
              </div>

              <div>
                <label className="block text-gray-300 mb-2 font-medium">ترتيب العرض</label>
                <input type="number" value={formData.display_order} onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })} className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" placeholder="0" />
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg font-medium">إلغاء</button>
                <button type="submit" disabled={saving || uploading} className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-medium disabled:opacity-50">
                  {saving ? 'جاري الحفظ...' : 'حفظ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <ConfirmModal
        isOpen={confirmDelete.show}
        title="حذف الفئة الرئيسية"
        message={`هل أنت متأكد من حذف "${confirmDelete.name}"؟ سيتم حذف جميع الفئات الثانوية المرتبطة بها.`}
        confirmText="حذف"
        cancelText="إلغاء"
        type="danger"
        onConfirm={() => handleDelete(confirmDelete.id)}
        onCancel={() => setConfirmDelete({ show: false, id: '', name: '' })}
      />
    </AdminLayout>
  );
}
