'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import AdminLayout from '../../components/AdminLayout';
import ConfirmModal from '../../components/ConfirmModal';
import { API_URL } from '@/lib/api';

interface ParentCategory {
  id: string;
  name: string;
  handle: string;
  description: string;
  image_url: string | null;
}

interface Subcategory {
  id: string;
  name: string;
  handle: string;
  description: string;
  image_url: string | null;
  display_order: number;
  is_active: boolean;
  parent_category_id: string;
  product_count?: number;
}

export default function SubcategoriesPage() {
  const params = useParams();
  const router = useRouter();
  const parentId = params.id as string;

  const [parentCategory, setParentCategory] = useState<ParentCategory | null>(null);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSubcategory, setEditingSubcategory] = useState<Subcategory | null>(null);
  const [formData, setFormData] = useState({ name: '', handle: '', description: '', image_url: '', display_order: 0 });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (parentId) {
      fetchData();
    }
  }, [parentId]);


  const fetchData = async () => {
    try {
      const res = await fetch(`${API_URL}/store/parent-categories/${parentId}`);
      const data = await res.json();

      if (!data.parent_category) {
        router.push('/admin/categories');
        return;
      }

      setParentCategory(data.parent_category);
      setSubcategories(data.subcategories || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      router.push('/admin/categories');
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
    setEditingSubcategory(null);
    setFormData({ name: '', handle: '', description: '', image_url: '', display_order: 0 });
    setError('');
    setShowModal(true);
  };

  const openEditModal = (subcategory: Subcategory) => {
    setEditingSubcategory(subcategory);
    setFormData({
      name: subcategory.name,
      handle: subcategory.handle,
      description: subcategory.description || '',
      image_url: subcategory.image_url || '',
      display_order: subcategory.display_order || 0,
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
      if (editingSubcategory) {
        // Update existing subcategory
        const res = await fetch(`${API_URL}/admin/categories/${editingSubcategory.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...formData,
            parent_category_id: parentId,
          }),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'فشل تحديث الفئة الثانوية');
        }
      } else {
        // Create new subcategory
        const res = await fetch(`${API_URL}/admin/categories`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...formData,
            parent_category_id: parentId,
          }),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'فشل إنشاء الفئة الثانوية');
        }
      }

      setShowModal(false);
      fetchData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const [confirmDelete, setConfirmDelete] = useState<{ show: boolean; id: string; name: string }>({ show: false, id: '', name: '' });

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`${API_URL}/admin/categories/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'فشل الحذف');
      }

      fetchData();
    } catch (err: any) {
      setError('فشل الحذف: ' + err.message);
    } finally {
      setConfirmDelete({ show: false, id: '', name: '' });
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="text-center text-gray-400 py-12">جاري التحميل...</div>
      </AdminLayout>
    );
  }

  if (!parentCategory) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <p className="text-gray-400 mb-4">الفئة الرئيسية غير موجودة</p>
          <Link href="/admin/categories" className="text-purple-400 hover:text-purple-300">
            العودة للفئات الرئيسية
          </Link>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      {/* Breadcrumb & Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
          <Link href="/admin/categories" className="hover:text-purple-400 transition-colors">
            الفئات الرئيسية
          </Link>
          <span>/</span>
          <span className="text-white">{parentCategory.name}</span>
        </div>

        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            {parentCategory.image_url && (
              <img src={parentCategory.image_url} alt={parentCategory.name} className="w-16 h-16 rounded-xl object-cover" />
            )}
            <div>
              <h1 className="text-3xl font-bold text-white">{parentCategory.name}</h1>
              <p className="text-gray-400 mt-1">إدارة الفئات الثانوية - {subcategories.length} فئة ثانوية</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Link
              href="/admin/categories"
              className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-3 rounded-lg font-medium flex items-center gap-2"
            >
              رجوع
            </Link>
            <button onClick={openCreateModal} className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2">
              <span>+</span> إضافة فئة ثانوية
            </button>
          </div>
        </div>
      </div>

      {/* Subcategories Grid */}
      {subcategories.length === 0 ? (
        <div className="bg-gray-800 rounded-xl p-12 text-center">
          <div className="text-6xl mb-4">📂</div>
          <p className="text-gray-400 mb-4">لا توجد فئات ثانوية في &quot;{parentCategory.name}&quot; بعد</p>
          <button onClick={openCreateModal} className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg">
            أنشئ فئة ثانوية
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {subcategories.map((sub) => (
            <div key={sub.id} className="bg-gray-800 rounded-xl overflow-hidden group">
              <div className="h-40 bg-gray-700 relative overflow-hidden">
                {sub.image_url ? (
                  <img src={sub.image_url} alt={sub.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-500">
                    <span className="text-5xl">📄</span>
                  </div>
                )}
                <div className={`absolute top-2 right-2 text-white text-xs px-2 py-1 rounded ${sub.is_active ? 'bg-green-600' : 'bg-gray-600'}`}>
                  {sub.is_active ? 'نشط' : 'غير نشط'}
                </div>
                <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                  ترتيب: {sub.display_order}
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-white font-bold text-lg mb-1">{sub.name}</h3>
                <p className="text-gray-500 text-xs mb-1 font-mono">/{sub.handle}</p>
                <p className="text-gray-400 text-sm line-clamp-2 mb-4">{sub.description || 'بدون وصف'}</p>
                <div className="flex gap-2">
                  <button onClick={() => openEditModal(sub)} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm">
                    تعديل
                  </button>
                  <button onClick={() => setConfirmDelete({ show: true, id: sub.id, name: sub.name })} className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg text-sm">
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
              <h2 className="text-xl font-bold text-white">
                {editingSubcategory ? 'تعديل الفئة الثانوية' : 'فئة ثانوية جديدة'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white text-2xl">&times;</button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {error && <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg">{error}</div>}

              {/* Parent info */}
              <div className="bg-gray-700/50 rounded-lg p-3 flex items-center gap-3">
                <span className="text-2xl">📁</span>
                <div>
                  <p className="text-gray-400 text-xs">الفئة الرئيسية</p>
                  <p className="text-white font-medium">{parentCategory.name}</p>
                </div>
              </div>

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
                <label className="block text-gray-300 mb-2 font-medium">اسم الفئة الثانوية *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value, handle: editingSubcategory ? formData.handle : generateHandle(e.target.value) })}
                  className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                  placeholder="مثال: أحمر شفاه"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-2 font-medium">المعرف (Handle)</label>
                <input
                  type="text"
                  value={formData.handle}
                  onChange={(e) => setFormData({ ...formData, handle: e.target.value })}
                  className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none font-mono"
                  dir="ltr"
                  placeholder="lipstick"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-2 font-medium">الوصف</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none resize-none"
                  rows={3}
                  placeholder="وصف مختصر للفئة الثانوية..."
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-2 font-medium">ترتيب العرض</label>
                <input
                  type="number"
                  value={formData.display_order}
                  onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                  className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                  placeholder="0"
                />
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
        title="حذف الفئة الثانوية"
        message={`هل أنت متأكد من حذف "${confirmDelete.name}"؟`}
        confirmText="حذف"
        cancelText="إلغاء"
        type="danger"
        onConfirm={() => handleDelete(confirmDelete.id)}
        onCancel={() => setConfirmDelete({ show: false, id: '', name: '' })}
      />
    </AdminLayout>
  );
}
