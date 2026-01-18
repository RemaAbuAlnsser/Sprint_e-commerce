'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface Subcategory {
  id: number;
  name: string;
  description?: string;
  image_url?: string;
}

interface Category {
  id: number;
  name: string;
  description?: string;
  subcategories: Subcategory[];
}

export default function CategoriesList() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const listRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    if (!loading && categories.length > 0 && listRef.current) {
      gsap.fromTo(
        listRef.current.children,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.1,
          ease: 'power3.out',
        }
      );
    }
  }, [loading, categories]);

  const toggleCategory = (categoryId: number) => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  if (loading) {
    return (
      <div className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center text-[#2c2c2c]">جاري التحميل...</div>
        </div>
      </div>
    );
  }

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <h2 className="text-4xl md:text-5xl font-bold text-right text-[#2c2c2c] mb-16">
          التصنيفات
        </h2>

        <div ref={listRef} className="max-w-4xl mr-auto space-y-4">
          {categories.map((category) => (
            <div
              key={category.id}
              className="border-2 border-gray-200 rounded-lg overflow-hidden bg-white hover:shadow-lg transition-all duration-300"
            >
              <div
                className={`flex items-center justify-between p-6 cursor-pointer ${
                  category.subcategories.length > 0 ? 'hover:bg-gray-50' : ''
                }`}
                onClick={() => category.subcategories.length > 0 && toggleCategory(category.id)}
              >
                <div className="flex items-center gap-3">
                  {category.subcategories.length > 0 && (
                    <button
                      className="text-[#2c2c2c] hover:text-[#666] transition-colors"
                      aria-label={expandedCategories.has(category.id) ? 'طي' : 'توسيع'}
                    >
                      {expandedCategories.has(category.id) ? (
                        <ChevronUp className="w-5 h-5" />
                      ) : (
                        <ChevronDown className="w-5 h-5" />
                      )}
                    </button>
                  )}
                </div>

                <div className="text-right flex-1">
                  <h3 className="text-xl font-bold text-[#2c2c2c] mb-1">
                    {category.name}
                  </h3>
                  {category.description && (
                    <p className="text-sm text-[#666]">{category.description}</p>
                  )}
                  {category.subcategories.length > 0 && (
                    <p className="text-xs text-[#999] mt-1">
                      {category.subcategories.length} تصنيف فرعي
                    </p>
                  )}
                </div>
              </div>

              {category.subcategories.length > 0 && expandedCategories.has(category.id) && (
                <div className="border-t-2 border-gray-200 bg-gray-50">
                  {category.subcategories.map((subcategory) => (
                    <div
                      key={subcategory.id}
                      className="p-4 pr-16 hover:bg-white transition-colors cursor-pointer border-b border-gray-100 last:border-b-0"
                    >
                      <div className="text-right">
                        <h4 className="text-lg font-semibold text-[#2c2c2c] mb-1">
                          {subcategory.name}
                        </h4>
                        {subcategory.description && (
                          <p className="text-sm text-[#666]">{subcategory.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
