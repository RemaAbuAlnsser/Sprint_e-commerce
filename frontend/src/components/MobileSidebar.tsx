'use client';

import { useEffect, useState } from 'react';
import { X, ChevronDown, ChevronUp } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

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

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileSidebar({ isOpen, onClose }: MobileSidebarProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedCategory, setExpandedCategory] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('http://localhost:3000/categories/with-subcategories');
        if (response.ok) {
          const data = await response.json();
          setCategories(data);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const toggleCategory = (categoryId: number) => {
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
  };

  const handleCategoryClick = (categoryId: number) => {
    router.push(`/category/${categoryId}`);
    onClose();
  };

  const handleSubcategoryClick = (subcategoryId: number) => {
    router.push(`/subcategory/${subcategoryId}`);
    onClose();
  };

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

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/50 z-[60] transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-[85%] max-w-sm bg-white z-[70] shadow-2xl transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-[#2c2c2c]">
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
            aria-label="إغلاق القائمة"
          >
            <X className="w-6 h-6 text-white" />
          </button>
          <h2 className="text-lg font-bold text-white">التصنيفات</h2>
        </div>

        {/* Content */}
        <div className="overflow-y-auto h-[calc(100%-64px)]">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-gray-500">جاري التحميل...</div>
            </div>
          ) : categories.length === 0 ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-gray-500">لا توجد تصنيفات</div>
            </div>
          ) : (
            <div className="py-2">
              {categories.map((category) => (
                <div key={category.id} className="border-b border-gray-100">
                  {/* Category Header */}
                  <div className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3 flex-1">
                      {category.image_url && (
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                          <Image
                            src={`http://localhost:3000${category.image_url}`}
                            alt={category.name}
                            width={48}
                            height={48}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div
                        className="flex-1 cursor-pointer"
                        onClick={() => handleCategoryClick(category.id)}
                      >
                        <h3 className="font-bold text-[#2c2c2c] text-base">
                          {category.name}
                        </h3>
                        {category.description && (
                          <p className="text-xs text-gray-500 line-clamp-1">
                            {category.description}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {category.subcategories && category.subcategories.length > 0 && (
                      <button
                        onClick={() => toggleCategory(category.id)}
                        className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                        aria-label={expandedCategory === category.id ? 'إخفاء' : 'عرض'}
                      >
                        {expandedCategory === category.id ? (
                          <ChevronUp className="w-5 h-5 text-gray-600" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-600" />
                        )}
                      </button>
                    )}
                  </div>

                  {/* Subcategories */}
                  {category.subcategories && category.subcategories.length > 0 && (
                    <div
                      className={`overflow-hidden transition-all duration-300 ${
                        expandedCategory === category.id
                          ? 'max-h-[1000px] opacity-100'
                          : 'max-h-0 opacity-0'
                      }`}
                    >
                      <div className="bg-gray-50 px-4 py-2">
                        {category.subcategories.map((subcategory) => (
                          <div
                            key={subcategory.id}
                            onClick={() => handleSubcategoryClick(subcategory.id)}
                            className="flex items-center gap-3 py-3 px-2 hover:bg-white rounded-lg cursor-pointer transition-colors"
                          >
                            {subcategory.image_url ? (
                              <div className="w-10 h-10 rounded-full overflow-hidden bg-white border-2 border-gray-200 flex-shrink-0">
                                <Image
                                  src={`http://localhost:3000${subcategory.image_url}`}
                                  alt={subcategory.name}
                                  width={40}
                                  height={40}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#d4af37] to-[#b8962e] flex items-center justify-center flex-shrink-0">
                                <span className="text-white text-sm font-bold">
                                  {subcategory.name.charAt(0)}
                                </span>
                              </div>
                            )}
                            <span className="text-sm text-gray-700 font-medium">
                              {subcategory.name}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
