'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Plus,
  Edit,
  Trash2,
  X,
  Upload,
  Image as ImageIcon,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface Category {
  id: number;
  name: string;
  description: string;
  image_url?: string;
  created_at: string;
}

interface Subcategory {
  id: number;
  category_id: number;
  name: string;
  description: string;
  image_url?: string;
  created_at: string;
}

export default function CategoriesPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<{[key: number]: Subcategory[]}>({});
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingSubcategory, setEditingSubcategory] = useState<Subcategory | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image_url: '',
  });

  const [subFormData, setSubFormData] = useState({
    category_id: 0,
    name: '',
    description: '',
    image_url: '',
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('http://localhost:3000/categories');
      const data = await response.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
    }
  };

  const fetchSubcategories = async (categoryId: number) => {
    try {
      const response = await fetch(`http://localhost:3000/subcategories/category/${categoryId}`);
      const data = await response.json();
      setSubcategories(prev => ({
        ...prev,
        [categoryId]: Array.isArray(data) ? data : []
      }));
    } catch (error) {
      console.error('Error fetching subcategories:', error);
    }
  };

  const toggleCategory = async (categoryId: number) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
      if (!subcategories[categoryId]) {
        await fetchSubcategories(categoryId);
      }
    }
    setExpandedCategories(newExpanded);
  };

  const handleAddSubcategory = (categoryId: number) => {
    setSelectedCategoryId(categoryId);
    setSubFormData({
      category_id: categoryId,
      name: '',
      description: '',
      image_url: '',
    });
    setImagePreview('');
    setIsSubModalOpen(true);
  };

  const handleEditSubcategory = (subcategory: Subcategory) => {
    setEditingSubcategory(subcategory);
    setSubFormData({
      category_id: subcategory.category_id,
      name: subcategory.name,
      description: subcategory.description || '',
      image_url: subcategory.image_url || '',
    });
    if (subcategory.image_url) {
      setImagePreview(`http://localhost:3000${subcategory.image_url}`);
    }
    setIsSubModalOpen(true);
  };

  const handleSubImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
        const response = await fetch('http://localhost:3000/upload/subcategory-image', {
          method: 'POST',
          body: formDataUpload,
        });

        const result = await response.json();
        if (result.success) {
          setSubFormData({ ...subFormData, image_url: result.imageUrl });
        }
      } catch (error) {
        console.error('Error uploading image:', error);
      }
    }
  };

  const handleSubSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const url = editingSubcategory
        ? `http://localhost:3000/subcategories/${editingSubcategory.id}`
        : 'http://localhost:3000/subcategories';
      
      const method = editingSubcategory ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subFormData),
      });

      const result = await response.json();

      if (result.success) {
        alert(editingSubcategory ? 'تم تحديث الفئة الفرعية بنجاح!' : 'تم إضافة الفئة الفرعية بنجاح!');
        setIsSubModalOpen(false);
        setSubFormData({ category_id: 0, name: '', description: '', image_url: '' });
        setImagePreview('');
        setEditingSubcategory(null);
        if (subFormData.category_id) {
          await fetchSubcategories(subFormData.category_id);
        }
      } else {
        alert(editingSubcategory ? 'فشل في تحديث الفئة الفرعية' : 'فشل في إضافة الفئة الفرعية');
      }
    } catch (error) {
      console.error('Error saving subcategory:', error);
      alert('حدث خطأ أثناء حفظ الفئة الفرعية');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSubcategory = async (id: number, categoryId: number) => {
    if (!confirm('هل أنت متأكد من حذف هذه الفئة الفرعية؟')) return;

    try {
      const response = await fetch(`http://localhost:3000/subcategories/${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        alert('تم حذف الفئة الفرعية بنجاح!');
        await fetchSubcategories(categoryId);
      }
    } catch (error) {
      console.error('Error deleting subcategory:', error);
      alert('فشل في حذف الفئة الفرعية');
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Show preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Upload to backend
      const formDataUpload = new FormData();
      formDataUpload.append('image', file);

      try {
        const response = await fetch('http://localhost:3000/upload/category-image', {
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

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      image_url: category.image_url || '',
    });
    if (category.image_url) {
      setImagePreview(`http://localhost:3000${category.image_url}`);
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const url = editingCategory
        ? `http://localhost:3000/categories/${editingCategory.id}`
        : 'http://localhost:3000/categories';
      
      const method = editingCategory ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        alert(editingCategory ? 'تم تحديث الفئة بنجاح!' : 'تم إضافة الفئة بنجاح!');
        setIsModalOpen(false);
        setFormData({ name: '', description: '', image_url: '' });
        setImagePreview('');
        setEditingCategory(null);
        fetchCategories();
      } else {
        alert(editingCategory ? 'فشل في تحديث الفئة' : 'فشل في إضافة الفئة');
      }
    } catch (error) {
      console.error('Error saving category:', error);
      alert('حدث خطأ أثناء حفظ الفئة');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('هل أنت متأكد من حذف هذه الفئة؟')) return;

    try {
      const response = await fetch(`http://localhost:3000/categories/${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        alert('تم حذف الفئة بنجاح!');
        fetchCategories();
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('فشل في حذف الفئة');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 md:mb-8 gap-4">
        <div className="text-right">
          <h1 className="text-2xl md:text-3xl font-bold text-[#2c2c2c]">إدارة الفئات</h1>
          <p className="text-sm md:text-base text-[#5E4A45] mt-1 md:mt-2">إضافة وتعديل الفئات والفئات الفرعية</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 md:px-6 py-2.5 md:py-3 bg-gradient-to-r from-[#2c2c2c] to-[#5E4A45] text-white rounded-xl hover:shadow-lg transition-all duration-300 text-sm md:text-base"
        >
          <Plus size={18} className="md:w-5 md:h-5" />
          <span>إضافة فئة</span>
        </button>
      </div>

      {/* Categories List with Subcategories */}
      <div className="space-y-4">
        {categories.map((category) => (
          <div key={category.id} className="bg-white rounded-xl shadow-md border-2 border-[#f5f5dc] overflow-hidden">
            {/* Main Category */}
            <div className="p-4 md:p-6">
              <div className="flex items-center gap-3 md:gap-4">
                {/* Category Image */}
                <div className="w-16 h-16 md:w-24 md:h-24 rounded-lg bg-gradient-to-br from-[#f5f5dc] to-[#e8e8c8] flex items-center justify-center flex-shrink-0">
                  {category.image_url ? (
                    <img
                      src={`http://localhost:3000${category.image_url}`}
                      alt={category.name}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <ImageIcon size={32} className="text-[#5E4A45] opacity-30" />
                  )}
                </div>

                {/* Category Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 md:gap-3 mb-2">
                    <h3 className="text-base md:text-xl font-bold text-[#2c2c2c] truncate">{category.name}</h3>
                    <span className="text-[10px] md:text-xs text-[#5E4A45] bg-[#f5f5dc] px-2 md:px-3 py-1 rounded-full whitespace-nowrap">
                      #{category.id}
                    </span>
                  </div>
                  <p className="text-xs md:text-sm text-[#5E4A45] mb-3 line-clamp-2">{category.description || 'لا يوجد وصف'}</p>
                  
                  {/* Category Actions */}
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => toggleCategory(category.id)}
                      className="flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-1.5 md:py-2 bg-[#f5f5dc] text-[#2c2c2c] rounded-lg hover:bg-[#e8e8c8] transition-colors text-xs md:text-sm"
                    >
                      {expandedCategories.has(category.id) ? (
                        <ChevronUp size={14} className="md:w-4 md:h-4" />
                      ) : (
                        <ChevronDown size={14} className="md:w-4 md:h-4" />
                      )}
                      <span className="hidden sm:inline">
                        {expandedCategories.has(category.id) ? 'إخفاء' : 'عرض'} الفئات الفرعية
                        {subcategories[category.id] && ` (${subcategories[category.id].length})`}
                      </span>
                      <span className="sm:hidden">
                        {expandedCategories.has(category.id) ? 'إخفاء' : 'عرض'}
                      </span>
                    </button>
                    <button
                      onClick={() => handleAddSubcategory(category.id)}
                      className="flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-1.5 md:py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors text-xs md:text-sm"
                    >
                      <Plus size={14} className="md:w-4 md:h-4" />
                      <span className="hidden sm:inline">إضافة فئة فرعية</span>
                      <span className="sm:hidden">إضافة</span>
                    </button>
                    <button
                      onClick={() => handleEdit(category)}
                      className="flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-1.5 md:py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-xs md:text-sm"
                    >
                      <Edit size={14} className="md:w-4 md:h-4" />
                      <span className="hidden sm:inline">تعديل</span>
                    </button>
                    <button
                      onClick={() => handleDelete(category.id)}
                      className="flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-1.5 md:py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-xs md:text-sm"
                    >
                      <Trash2 size={14} className="md:w-4 md:h-4" />
                      <span className="hidden sm:inline">حذف</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Subcategories */}
            {expandedCategories.has(category.id) && (
              <div className="bg-gradient-to-br from-[#f5f5dc]/30 to-[#e8e8c8]/30 p-6 border-t-2 border-[#f5f5dc]">
                {subcategories[category.id] && subcategories[category.id].length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {subcategories[category.id].map((sub) => (
                      <div
                        key={sub.id}
                        className="bg-white rounded-lg shadow-sm border border-[#e8e8c8] p-4 hover:shadow-md transition-all"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-[#f5f5dc] to-[#e8e8c8] flex items-center justify-center flex-shrink-0">
                            {sub.image_url ? (
                              <img
                                src={`http://localhost:3000${sub.image_url}`}
                                alt={sub.name}
                                className="w-full h-full object-cover rounded-lg"
                              />
                            ) : (
                              <ImageIcon size={24} className="text-[#5E4A45] opacity-30" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-[#2c2c2c] mb-1 truncate">{sub.name}</h4>
                            <p className="text-xs text-[#5E4A45] mb-2 line-clamp-2">
                              {sub.description || 'لا يوجد وصف'}
                            </p>
                            <div className="flex gap-1">
                              <button
                                onClick={() => handleEditSubcategory(sub)}
                                className="flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-600 rounded text-xs hover:bg-blue-100 transition-colors"
                              >
                                <Edit size={12} />
                                <span>تعديل</span>
                              </button>
                              <button
                                onClick={() => handleDeleteSubcategory(sub.id, category.id)}
                                className="flex items-center gap-1 px-2 py-1 bg-red-50 text-red-600 rounded text-xs hover:bg-red-100 transition-colors"
                              >
                                <Trash2 size={12} />
                                <span>حذف</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-[#5E4A45]">لا توجد فئات فرعية</p>
                    <button
                      onClick={() => handleAddSubcategory(category.id)}
                      className="mt-3 text-sm text-[#2c2c2c] hover:text-[#5E4A45] underline"
                    >
                      إضافة فئة فرعية الآن
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {categories.length === 0 && (
        <div className="text-center py-20">
          <ImageIcon size={64} className="mx-auto text-[#5E4A45] opacity-30 mb-4" />
          <p className="text-[#5E4A45] text-lg">لا توجد فئات حالياً</p>
          <p className="text-[#5E4A45] text-sm mt-2">
            اضغط على "إضافة فئة" لإنشاء فئة جديدة
          </p>
        </div>
      )}

      {/* Add Category Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-[#f5f5dc] p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-[#2c2c2c]">إضافة فئة جديدة</h2>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setFormData({ name: '', description: '', image_url: '' });
                  setImagePreview('');
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
                  صورة الفئة
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

              {/* Category Name */}
              <div>
                <label className="block text-sm font-medium text-[#2c2c2c] mb-2">
                  اسم الفئة *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-4 py-3 border-2 border-[#e8e8c8] rounded-xl focus:outline-none focus:border-[#5E4A45] transition-colors"
                  placeholder="مثال: الإلكترونيات"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-[#2c2c2c] mb-2">
                  الوصف
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-[#e8e8c8] rounded-xl focus:outline-none focus:border-[#5E4A45] transition-colors resize-none"
                  placeholder="وصف الفئة..."
                />
              </div>

              {/* Submit Button */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setFormData({ name: '', description: '', image_url: '' });
                    setImagePreview('');
                    setEditingCategory(null);
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
                  {isLoading ? 'جاري الحفظ...' : (editingCategory ? 'تحديث الفئة' : 'حفظ الفئة')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add/Edit Subcategory Modal */}
      {isSubModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-[#f5f5dc] p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-[#2c2c2c]">
                {editingSubcategory ? 'تعديل الفئة الفرعية' : 'إضافة فئة فرعية'}
              </h2>
              <button
                onClick={() => {
                  setIsSubModalOpen(false);
                  setSubFormData({ category_id: 0, name: '', description: '', image_url: '' });
                  setImagePreview('');
                  setEditingSubcategory(null);
                }}
                className="text-[#5E4A45] hover:text-[#2c2c2c] transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-[#2c2c2c] mb-2">
                  صورة الفئة الفرعية
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
                          setSubFormData({ ...subFormData, image_url: '' });
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
                        onChange={handleSubImageChange}
                        className="hidden"
                        id="sub-image-upload"
                      />
                      <label
                        htmlFor="sub-image-upload"
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
                  اسم الفئة الفرعية *
                </label>
                <input
                  type="text"
                  required
                  value={subFormData.name}
                  onChange={(e) =>
                    setSubFormData({ ...subFormData, name: e.target.value })
                  }
                  className="w-full px-4 py-3 border-2 border-[#e8e8c8] rounded-xl focus:outline-none focus:border-[#5E4A45] transition-colors"
                  placeholder="مثال: شنط صغيرة"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#2c2c2c] mb-2">
                  الوصف
                </label>
                <textarea
                  value={subFormData.description}
                  onChange={(e) =>
                    setSubFormData({ ...subFormData, description: e.target.value })
                  }
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-[#e8e8c8] rounded-xl focus:outline-none focus:border-[#5E4A45] transition-colors resize-none"
                  placeholder="وصف الفئة الفرعية..."
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsSubModalOpen(false);
                    setSubFormData({ category_id: 0, name: '', description: '', image_url: '' });
                    setImagePreview('');
                    setEditingSubcategory(null);
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
                  {isLoading ? 'جاري الحفظ...' : (editingSubcategory ? 'تحديث الفئة الفرعية' : 'حفظ الفئة الفرعية')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
