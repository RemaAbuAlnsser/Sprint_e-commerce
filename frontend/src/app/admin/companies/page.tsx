'use client';
import { API_URL } from '@/lib/api';

import { useState, useEffect } from 'react';
import {
  Plus,
  Edit,
  Trash2,
  X,
  Upload,
  Building2,
} from 'lucide-react';

interface Company {
  id: number;
  name: string;
  logo_url?: string;
  created_at: string;
}

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    logo_url: '',
  });

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const response = await fetch(`${API_URL}/companies`);
      const data = await response.json();
      setCompanies(Array.isArray(data) ? data : []);
    } catch (error) {
      setCompanies([]);
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
        const response = await fetch(`${API_URL}/upload/company-logo`, {
          method: 'POST',
          body: formDataUpload,
        });

        const result = await response.json();
        if (result.success) {
          setFormData({ ...formData, logo_url: result.imageUrl });
        }
      } catch (error) {
      }
    }
  };

  const handleEdit = (company: Company) => {
    setEditingCompany(company);
    setFormData({
      name: company.name,
      logo_url: company.logo_url || '',
    });
    if (company.logo_url) {
      setImagePreview(`${API_URL}${company.logo_url}`);
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const url = editingCompany
        ? `${API_URL}/companies/${editingCompany.id}`
        : `${API_URL}/companies`;
      
      const method = editingCompany ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        alert(editingCompany ? 'تم تحديث الشركة بنجاح!' : 'تم إضافة الشركة بنجاح!');
        setIsModalOpen(false);
        setFormData({ name: '', logo_url: '' });
        setImagePreview('');
        setEditingCompany(null);
        fetchCompanies();
      } else {
        alert(editingCompany ? 'فشل في تحديث الشركة' : 'فشل في إضافة الشركة');
      }
    } catch (error) {
      alert('حدث خطأ أثناء حفظ الشركة');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('هل أنت متأكد من حذف هذه الشركة؟')) return;

    try {
      const response = await fetch(`${API_URL}/companies/${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        alert('تم حذف الشركة بنجاح!');
        fetchCompanies();
      }
    } catch (error) {
      alert('فشل في حذف الشركة');
    }
  };

  return (
    <div className="p-8" dir="rtl">
      <div className="flex items-center justify-between mb-8">
        <div className="text-right">
          <h1 className="text-3xl font-bold text-[#2c2c2c]">إدارة الشركات</h1>
          <p className="text-[#5E4A45] mt-2">إضافة وتعديل الشركات</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#2c2c2c] to-[#5E4A45] text-white rounded-xl hover:shadow-lg transition-all duration-300"
        >
          <Plus size={20} />
          <span>إضافة شركة</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {companies.map((company) => (
          <div
            key={company.id}
            className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-[#e8e8c8] group"
          >
            {/* Logo Container with White Background */}
            <div className="h-56 bg-white flex items-center justify-center p-8 border-b border-[#f5f5dc]">
              {company.logo_url ? (
                <div className="w-full h-full flex items-center justify-center">
                  <img
                    src={`${API_URL}${company.logo_url}`}
                    alt={company.name}
                    className="max-w-full max-h-full object-contain filter group-hover:scale-105 transition-transform duration-300"
                    style={{ maxHeight: '160px' }}
                  />
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#f5f5dc] to-[#e8e8c8] rounded-lg">
                  <Building2 size={64} className="text-[#5E4A45] opacity-30" />
                </div>
              )}
            </div>
            
            {/* Company Info */}
            <div className="p-5 bg-gradient-to-br from-white to-[#f5f5dc]/20">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-[#2c2c2c] truncate flex-1">
                  {company.name}
                </h3>
                <span className="text-xs text-white bg-[#5E4A45] px-3 py-1 rounded-full font-medium mr-2">
                  #{company.id}
                </span>
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(company)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors font-medium"
                >
                  <Edit size={16} />
                  <span className="text-sm">تعديل</span>
                </button>
                <button
                  onClick={() => handleDelete(company.id)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors font-medium"
                >
                  <Trash2 size={16} />
                  <span className="text-sm">حذف</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {companies.length === 0 && (
        <div className="text-center py-20">
          <Building2 size={64} className="mx-auto text-[#5E4A45] opacity-30 mb-4" />
          <p className="text-[#5E4A45] text-lg">لا توجد شركات حالياً</p>
          <p className="text-[#5E4A45] text-sm mt-2">
            اضغط على "إضافة شركة" لإنشاء شركة جديدة
          </p>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-[#f5f5dc] p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-[#2c2c2c]">
                {editingCompany ? 'تعديل الشركة' : 'إضافة شركة جديدة'}
              </h2>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setFormData({ name: '', logo_url: '' });
                  setImagePreview('');
                  setEditingCompany(null);
                }}
                className="text-[#5E4A45] hover:text-[#2c2c2c] transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-[#2c2c2c] mb-2">
                  شعار الشركة
                </label>
                <div className="border-2 border-dashed border-[#e8e8c8] rounded-xl p-6 text-center hover:border-[#5E4A45] transition-colors">
                  {imagePreview ? (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-48 object-contain rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setImagePreview('');
                          setFormData({ ...formData, logo_url: '' });
                        }}
                        className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <div>
                      <Upload className="mx-auto text-[#5E4A45] mb-2" size={48} />
                      <p className="text-[#5E4A45] mb-2">اضغط لرفع شعار الشركة</p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                        id="logo-upload"
                      />
                      <label
                        htmlFor="logo-upload"
                        className="inline-block px-4 py-2 bg-[#f5f5dc] text-[#2c2c2c] rounded-lg cursor-pointer hover:bg-[#e8e8c8] transition-colors"
                      >
                        اختر صورة
                      </label>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#2c2c2c] mb-2">
                  اسم الشركة *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-4 py-3 border-2 border-[#e8e8c8] rounded-xl focus:outline-none focus:border-[#5E4A45] transition-colors"
                  placeholder="مثال: شركة التقنية المتقدمة"
                />
              </div>


              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setFormData({ name: '', logo_url: '' });
                    setImagePreview('');
                    setEditingCompany(null);
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
                  {isLoading ? 'جاري الحفظ...' : (editingCompany ? 'تحديث الشركة' : 'حفظ الشركة')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
