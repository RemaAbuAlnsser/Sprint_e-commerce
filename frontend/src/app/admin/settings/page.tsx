'use client';
import { API_URL } from '@/lib/api';

import { useState, useEffect } from 'react';
import {
  Upload,
  Image as ImageIcon,
  X,
  Save,
  RefreshCw,
} from 'lucide-react';

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(false);
  
  // Site Images State (multiple images)
  const [currentSiteImages, setCurrentSiteImages] = useState<Array<{id?: number; url: string}>>([]);
  const [newSiteImages, setNewSiteImages] = useState<Array<{url: string; preview: string}>>([]);
  
  // Logo State
  const [currentLogo, setCurrentLogo] = useState<string>('');
  const [newLogo, setNewLogo] = useState<string>('');
  const [logoPreview, setLogoPreview] = useState<string>('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await fetch(`${API_URL}/settings`);
      const data = await response.json();
      
      // Load site images (assuming backend returns array)
      if (data.site_images && Array.isArray(data.site_images)) {
        setCurrentSiteImages(data.site_images);
      }
      setCurrentLogo(data.site_logo || '');
    } catch (error) {
    }
  };

  const handleSiteImagesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const reader = new FileReader();
        
        reader.onloadend = async () => {
          const preview = reader.result as string;
          
          // Upload to server
          const formData = new FormData();
          formData.append('image', file);

          try {
            const response = await fetch(`${API_URL}/upload/category-image`, {
              method: 'POST',
              body: formData,
            });

            const result = await response.json();
            if (result.success) {
              setNewSiteImages(prev => [...prev, { url: result.imageUrl, preview }]);
            }
          } catch (error) {
          }
        };
        
        reader.readAsDataURL(file);
      }
    }
  };

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Upload to server
      const formData = new FormData();
      formData.append('image', file);

      try {
        const response = await fetch(`${API_URL}/upload/company-logo`, {
          method: 'POST',
          body: formData,
        });

        const result = await response.json();
        if (result.success) {
          setNewLogo(result.imageUrl);
        }
      } catch (error) {
      }
    }
  };

  const handleSaveSettings = async () => {
    setIsLoading(true);

    try {
      const updateData: any = {};
      
      if (newSiteImages.length > 0) {
        updateData.site_images = newSiteImages.map(img => img.url);
      }
      
      if (newLogo) {
        updateData.site_logo = newLogo;
      }

      const response = await fetch(`${API_URL}/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      const result = await response.json();

      if (result.success) {
        // Update current images - replace all existing with new ones
        if (newSiteImages.length > 0) {
          setCurrentSiteImages(newSiteImages.map(img => ({ url: img.url })));
          setNewSiteImages([]);
        }
        
        if (newLogo) {
          setCurrentLogo(newLogo);
          setNewLogo('');
          setLogoPreview('');
        }

        alert('تم حفظ الإعدادات بنجاح!');
      } else {
        alert('حدث خطأ أثناء حفظ الإعدادات');
      }
    } catch (error) {
      alert('حدث خطأ أثناء حفظ الإعدادات');
    } finally {
      setIsLoading(false);
    }
  };

  const removeNewSiteImage = (index: number) => {
    setNewSiteImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeCurrentSiteImage = (index: number) => {
    setCurrentSiteImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleResetLogo = () => {
    setNewLogo('');
    setLogoPreview('');
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#2c2c2c]">الإعدادات</h1>
        <p className="text-[#8b7355] mt-2">إدارة صور الموقع واللوجو</p>
      </div>

      <div className="space-y-8">
        {/* Site Image Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-[#e8e8c8] overflow-hidden">
          <div className="bg-gradient-to-r from-[#f5f5dc] to-[#e8e8c8] p-6 border-b-2 border-[#8b7355]/20">
            <h2 className="text-2xl font-bold text-[#2c2c2c]">صورة الموقع</h2>
            <p className="text-[#8b7355] text-sm mt-1">
              الصورة الرئيسية التي تظهر في موقع العميل
            </p>
          </div>

          <div className="p-6">
            {/* Current Site Images */}
            <div className="mb-6">
              <h3 className="text-lg font-bold text-[#2c2c2c] mb-4">الصور الحالية ({currentSiteImages.length})</h3>
              {currentSiteImages.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {currentSiteImages.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={`${API_URL}${image.url}`}
                        alt={`Site Image ${index + 1}`}
                        className="w-full h-48 object-cover rounded-lg border-2 border-[#e8e8c8]"
                      />
                      <button
                        type="button"
                        onClick={() => removeCurrentSiteImage(index)}
                        className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <X size={16} />
                      </button>
                      <div className="absolute bottom-2 left-2 bg-green-500 text-white px-2 py-1 rounded text-xs font-bold">
                        #{index + 1}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="border-2 border-dashed border-[#e8e8c8] rounded-xl p-8 text-center">
                  <ImageIcon size={48} className="mx-auto text-[#8b7355] opacity-30 mb-2" />
                  <p className="text-[#8b7355]">لا توجد صور حالية</p>
                </div>
              )}
            </div>

            {/* New Site Images Upload */}
            <div>
              <h3 className="text-lg font-bold text-[#2c2c2c] mb-4">رفع صور جديدة</h3>
              
              {/* Warning Message */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 text-yellow-600 mt-0.5">
                    <svg fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-yellow-800 mb-1">تنبيه مهم</h4>
                    <p className="text-sm text-yellow-700">
                      عند رفع صور جديدة، سيتم <strong>حذف جميع الصور الحالية</strong> واستبدالها بالصور الجديدة فقط.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="border-2 border-dashed border-[#e8e8c8] rounded-xl p-6 hover:border-[#8b7355] transition-colors mb-4">
                <div className="flex flex-col items-center justify-center">
                  <Upload className="text-[#8b7355] mb-4" size={48} />
                  <p className="text-[#8b7355] mb-4 text-center">
                    اضغط لرفع صور متعددة للموقع
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleSiteImagesChange}
                    className="hidden"
                    id="site-images-upload"
                  />
                  <label
                    htmlFor="site-images-upload"
                    className="px-6 py-3 bg-gradient-to-r from-[#2c2c2c] to-[#8b7355] text-white rounded-xl cursor-pointer hover:shadow-lg transition-all duration-300 font-medium"
                  >
                    اختر صور متعددة
                  </label>
                </div>
              </div>

              {/* New Images Preview */}
              {newSiteImages.length > 0 && (
                <div>
                  <h4 className="text-md font-bold text-[#2c2c2c] mb-3">الصور الجديدة ({newSiteImages.length})</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {newSiteImages.map((image, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={image.preview}
                          alt={`New Image ${index + 1}`}
                          className="w-full h-48 object-cover rounded-lg border-2 border-blue-300"
                        />
                        <button
                          type="button"
                          onClick={() => removeNewSiteImage(index)}
                          className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                        >
                          <X size={16} />
                        </button>
                        <div className="absolute bottom-2 left-2 bg-blue-500 text-white px-2 py-1 rounded text-xs font-bold">
                          جديدة #{index + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Logo Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-[#e8e8c8] overflow-hidden">
          <div className="bg-gradient-to-r from-[#f5f5dc] to-[#e8e8c8] p-6 border-b-2 border-[#8b7355]/20">
            <h2 className="text-2xl font-bold text-[#2c2c2c]">لوجو الموقع</h2>
            <p className="text-[#8b7355] text-sm mt-1">
              الشعار الذي يظهر في رأس الموقع
            </p>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Current Logo */}
              <div>
                <h3 className="text-lg font-bold text-[#2c2c2c] mb-4">اللوجو الحالي</h3>
                <div className="border-2 border-[#e8e8c8] rounded-xl p-6 bg-gradient-to-br from-[#f5f5dc]/30 to-[#e8e8c8]/30">
                  {currentLogo ? (
                    <div className="relative">
                      <div className="bg-white p-4 rounded-lg flex items-center justify-center h-64">
                        <img
                          src={`${API_URL}${currentLogo}`}
                          alt="Current Logo"
                          className="max-w-full max-h-full object-contain"
                        />
                      </div>
                      <div className="absolute top-2 right-2 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                        نشط
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-64 text-[#8b7355]">
                      <ImageIcon size={48} className="opacity-30 mb-2" />
                      <p className="text-sm">لا يوجد لوجو حالي</p>
                    </div>
                  )}
                </div>
              </div>

              {/* New Logo Upload */}
              <div>
                <h3 className="text-lg font-bold text-[#2c2c2c] mb-4">رفع لوجو جديد</h3>
                <div className="border-2 border-dashed border-[#e8e8c8] rounded-xl p-6 hover:border-[#8b7355] transition-colors">
                  {logoPreview ? (
                    <div className="relative">
                      <div className="bg-white p-4 rounded-lg flex items-center justify-center h-64">
                        <img
                          src={logoPreview}
                          alt="New Logo Preview"
                          className="max-w-full max-h-full object-contain"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleResetLogo}
                        className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                      >
                        <X size={16} />
                      </button>
                      <div className="absolute top-2 left-2 bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                        جديد
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-64">
                      <Upload className="text-[#8b7355] mb-4" size={48} />
                      <p className="text-[#8b7355] mb-4 text-center">
                        اضغط لرفع لوجو جديد
                      </p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoChange}
                        className="hidden"
                        id="logo-upload"
                      />
                      <label
                        htmlFor="logo-upload"
                        className="px-6 py-3 bg-gradient-to-r from-[#2c2c2c] to-[#8b7355] text-white rounded-xl cursor-pointer hover:shadow-lg transition-all duration-300 font-medium"
                      >
                        اختر لوجو
                      </label>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        {(newSiteImages.length > 0 || newLogo) && (
          <div className="bg-white rounded-2xl shadow-lg border border-[#e8e8c8] p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-bold text-[#2c2c2c]">لديك تغييرات غير محفوظة</p>
                <p className="text-sm text-[#8b7355] mt-1">
                  اضغط على حفظ لتطبيق التغييرات على الموقع
                </p>
              </div>
              <button
                onClick={handleSaveSettings}
                disabled={isLoading}
                className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 shadow-lg hover:shadow-xl transition-all duration-300 font-bold text-lg disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <RefreshCw size={20} className="animate-spin" />
                    <span>جاري الحفظ...</span>
                  </>
                ) : (
                  <>
                    <Save size={20} />
                    <span>حفظ التغييرات</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
