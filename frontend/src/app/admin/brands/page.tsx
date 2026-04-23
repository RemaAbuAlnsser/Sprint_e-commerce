'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import ConfirmModal from '../components/ConfirmModal';
import { API_URL } from '@/lib/api';

interface Brand {
  id: string;
  name: string;
  logo_url: string | null;
  created_at: string;
}

export default function BrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [formData, setFormData] = useState({ name: '', logo_url: '' });
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<{ show: boolean; id: string; name: string }>({ show: false, id: '', name: '' });

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    try {
      const res = await fetch(`${API_URL}/store/brands`);
      const data = await res.json();
      setBrands(data.brands || []);
    } catch (err) {
      // Error handled silently
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const url = editingBrand
        ? `${API_URL}/admin/brands/${editingBrand.id}`
        : `${API_URL}/admin/brands`;
      
      const res = await fetch(url, {
        method: editingBrand ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'فشل حفظ الشركة');
      }

      await fetchBrands();
      closeModal();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`${API_URL}/admin/brands/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('فشل حذف الشركة');
      await fetchBrands();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setConfirmDelete({ show: false, id: '', name: '' });
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch(`${API_URL}/admin/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('فشل رفع الصورة');

      const data = await res.json();
      const imageUrl = data.url.startsWith('http') ? data.url : `${API_URL}/uploads/${data.url}`;
      setFormData(prev => ({ ...prev, logo_url: imageUrl }));
    } catch (err: any) {
      setError('فشل رفع الصورة: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const openModal = (brand?: Brand) => {
    if (brand) {
      setEditingBrand(brand);
      setFormData({ name: brand.name, logo_url: brand.logo_url || '' });
    } else {
      setEditingBrand(null);
      setFormData({ name: '', logo_url: '' });
    }
    setError('');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingBrand(null);
    setFormData({ name: '', logo_url: '' });
    setError('');
  };

  return (
    <AdminLayout>
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">إدارة الشركات</h1>
          <p className="text-gray-400 mt-1">إضافة وتعديل الشركات والعلامات التجارية</p>
        </div>
        <button
          onClick={() => openModal()}
          className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg shadow-purple-600/30"
        >
          + إضافة شركة جديدة
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">جاري التحميل...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {brands.map((brand) => (
            <div
              key={brand.id}
              className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-purple-500 transition-all"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-24 h-24 bg-gray-700 rounded-xl flex items-center justify-center mb-4 overflow-hidden">
                  {brand.logo_url ? (
                    <img
                      src={brand.logo_url}
                      alt={brand.name}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <span className="text-4xl text-gray-500">🏢</span>
                  )}
                </div>
                <h3 className="text-white font-bold text-lg mb-4">{brand.name}</h3>
                <div className="flex gap-2 w-full">
                  <button
                    onClick={() => openModal(brand)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
                  >
                    تعديل
                  </button>
                  <button
                    onClick={() => setConfirmDelete({ show: true, id: brand.id, name: brand.name })}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
                  >
                    حذف
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {brands.length === 0 && !loading && (
        <div className="text-center py-12 bg-gray-800 rounded-xl border border-gray-700">
          <span className="text-6xl mb-4 block">🏢</span>
          <p className="text-gray-400 text-lg">لا توجد شركات حالياً</p>
          <button
            onClick={() => openModal()}
            className="mt-4 text-purple-400 hover:text-purple-300 transition-colors"
          >
            إضافة شركة جديدة
          </button>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl p-8 max-w-md w-full border border-gray-700 shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-6">
              {editingBrand ? 'تعديل الشركة' : 'إضافة شركة جديدة'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-xl text-center">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-gray-300 mb-2 font-medium">اسم الشركة</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-gray-700/50 text-white px-4 py-3 rounded-xl border border-gray-600 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all"
                  placeholder="مثال: Apple"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-2 font-medium">شعار الشركة</label>
                <div className="space-y-3">
                  {formData.logo_url && (
                    <div className="w-full h-32 bg-gray-700 rounded-xl flex items-center justify-center overflow-hidden border-2 border-purple-500/30">
                      <img
                        src={formData.logo_url}
                        alt="Logo preview"
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploading}
                    className="hidden"
                    id="logo-upload"
                  />
                  <label
                    htmlFor="logo-upload"
                    className={`block w-full bg-gradient-to-r from-purple-600/20 to-blue-600/20 text-white px-6 py-4 rounded-xl border-2 border-dashed border-purple-500/50 hover:border-purple-500 transition-all text-center cursor-pointer ${
                      uploading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-purple-600/30'
                    }`}
                  >
                    {uploading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>جاري رفع الصورة...</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <span className="font-semibold">انقر لاختيار صورة الشعار</span>
                        <span className="text-sm text-gray-400">PNG, JPG, GIF, WebP (حد أقصى 5MB)</span>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={uploading}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-600/30"
                >
                  {editingBrand ? 'حفظ التعديلات' : 'إضافة الشركة'}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-xl font-semibold transition-all"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <ConfirmModal
        isOpen={confirmDelete.show}
        title="حذف الشركة"
        message={`هل أنت متأكد من حذف "${confirmDelete.name}"؟ لا يمكن التراجع عن هذا الإجراء.`}
        confirmText="حذف"
        cancelText="إلغاء"
        type="danger"
        onConfirm={() => handleDelete(confirmDelete.id)}
        onCancel={() => setConfirmDelete({ show: false, id: '', name: '' })}
      />
    </AdminLayout>
  );
}
