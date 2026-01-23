'use client';
import { API_URL } from '@/lib/api';

import { useEffect, useState, useMemo, memo } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { X } from 'lucide-react';

interface Subcategory {
  id: number;
  name: string;
  image_url?: string;
  category_id: number;
}

interface Category {
  id: number;
  name: string;
  description?: string;
  image_url?: string;
  subcategories: Subcategory[];
}

interface MegaMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const MegaMenu = memo(function MegaMenu({ isOpen, onClose }: MegaMenuProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${API_URL}/categories/with-subcategories`);
        if (response.ok) {
          const data = await response.json();
          setCategories(data);
          if (data.length > 0) {
            setSelectedCategory(data[0].id);
          }
        }
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };
    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleCategoryClick = (categoryId: number) => {
    router.push(`/category/${categoryId}`);
    onClose();
  };

  const handleSubcategoryClick = (subcategoryId: number, categoryId: number) => {
    router.push(`/category/${categoryId}?subcategory=${subcategoryId}`);
    onClose();
  };

  const selectedCategoryData = useMemo(
    () => categories.find(cat => cat.id === selectedCategory),
    [categories, selectedCategory]
  );

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/50 z-[60] transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      <div
        className={`fixed top-0 right-0 h-full w-[90%] max-w-5xl bg-white z-[70] shadow-2xl transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="إغلاق القائمة"
          >
            <X className="w-6 h-6 text-gray-700" />
          </button>
          <h2 className="text-lg font-bold text-[#2c2c2c]">التصنيفات</h2>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-[calc(100%-64px)]">
            <div className="text-gray-500">جاري التحميل...</div>
          </div>
        ) : categories.length === 0 ? (
          <div className="flex items-center justify-center h-[calc(100%-64px)]">
            <div className="text-gray-500">لا توجد تصنيفات</div>
          </div>
        ) : (
          <div className="flex h-[calc(100%-64px)]">
            <div className="w-1/3 border-l border-gray-200 overflow-y-auto bg-gray-50">
              {categories.map((category) => (
                <div
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`p-4 cursor-pointer transition-all duration-200 border-b border-gray-200 ${
                    selectedCategory === category.id
                      ? 'bg-white border-r-4 border-r-[#2c2c2c] shadow-sm'
                      : 'hover:bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h3 className={`font-bold text-sm ${
                      selectedCategory === category.id ? 'text-[#2c2c2c]' : 'text-gray-700'
                    }`}>
                      {category.name}
                    </h3>
                    <svg
                      className={`w-4 h-4 transition-opacity ${
                        selectedCategory === category.id ? 'opacity-100' : 'opacity-0'
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </div>
                  {category.description && (
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                      {category.description}
                    </p>
                  )}
                </div>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto p-6 bg-white">
              {selectedCategoryData && (
                <>
                  <div className="mb-6">
                    <button
                      onClick={() => handleCategoryClick(selectedCategoryData.id)}
                      className="inline-flex items-center gap-2 text-lg font-bold text-[#2c2c2c] hover:text-gray-600 transition-colors"
                    >
                      {selectedCategoryData.name}
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                  </div>

                  {selectedCategoryData.subcategories && selectedCategoryData.subcategories.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {selectedCategoryData.subcategories.map((subcategory) => (
                        <div
                          key={subcategory.id}
                          onClick={() => handleSubcategoryClick(subcategory.id, subcategory.category_id)}
                          className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-all duration-200 group"
                        >
                          <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                            {subcategory.image_url ? (
                              <Image
                                src={`${API_URL}${subcategory.image_url}`}
                                alt={subcategory.name}
                                width={80}
                                height={80}
                                className="w-full h-full object-cover"
                                loading="lazy"
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-[#2c2c2c] to-[#4a4a4a] flex items-center justify-center">
                                <span className="text-white text-2xl font-bold">
                                  {subcategory.name.charAt(0)}
                                </span>
                              </div>
                            )}
                          </div>
                          <span className="text-xs text-center text-gray-700 font-medium line-clamp-2 group-hover:text-[#2c2c2c]">
                            {subcategory.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10 text-gray-500">
                      لا توجد أقسام فرعية
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
});

export default MegaMenu;
