'use client';

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
  
  // Site Image State
  const [currentSiteImage, setCurrentSiteImage] = useState<string>('');
  const [newSiteImage, setNewSiteImage] = useState<string>('');
  const [siteImagePreview, setSiteImagePreview] = useState<string>('');
  
  // Logo State
  const [currentLogo, setCurrentLogo] = useState<string>('');
  const [newLogo, setNewLogo] = useState<string>('');
  const [logoPreview, setLogoPreview] = useState<string>('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await fetch('http://localhost:3000/settings');
      const data = await response.json();
      
      setCurrentSiteImage(data.site_image || '');
      setCurrentLogo(data.site_logo || '');
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const handleSiteImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSiteImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Upload to server
      const formData = new FormData();
      formData.append('image', file);

      try {
        const response = await fetch('http://localhost:3000/upload/category-image', {
          method: 'POST',
          body: formData,
        });

        const result = await response.json();
        if (result.success) {
          setNewSiteImage(result.imageUrl);
        }
      } catch (error) {
        console.error('Error uploading site image:', error);
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
        const response = await fetch('http://localhost:3000/upload/company-logo', {
          method: 'POST',
          body: formData,
        });

        const result = await response.json();
        if (result.success) {
          setNewLogo(result.imageUrl);
        }
      } catch (error) {
        console.error('Error uploading logo:', error);
      }
    }
  };

  const handleSaveSettings = async () => {
    setIsLoading(true);

    try {
      const updateData: any = {};
      
      if (newSiteImage) {
        updateData.site_image = newSiteImage;
      }
      
      if (newLogo) {
        updateData.site_logo = newLogo;
      }

      const response = await fetch('http://localhost:3000/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      const result = await response.json();

      if (result.success) {
        // Update current images
        if (newSiteImage) {
          setCurrentSiteImage(newSiteImage);
          setNewSiteImage('');
          setSiteImagePreview('');
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
      console.error('Error saving settings:', error);
      alert('حدث خطأ أثناء حفظ الإعدادات');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetSiteImage = () => {
    setNewSiteImage('');
    setSiteImagePreview('');
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Current Site Image */}
              <div>
                <h3 className="text-lg font-bold text-[#2c2c2c] mb-4">الصورة الحالية</h3>
                <div className="border-2 border-[#e8e8c8] rounded-xl p-6 bg-gradient-to-br from-[#f5f5dc]/30 to-[#e8e8c8]/30">
                  {currentSiteImage ? (
                    <div className="relative">
                      <img
                        src={`http://localhost:3000${currentSiteImage}`}
                        alt="Current Site"
                        className="w-full h-64 object-cover rounded-lg"
                      />
                      <div className="absolute top-2 right-2 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                        نشطة
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-64 text-[#8b7355]">
                      <ImageIcon size={48} className="opacity-30 mb-2" />
                      <p className="text-sm">لا توجد صورة حالية</p>
                    </div>
                  )}
                </div>
              </div>

              {/* New Site Image Upload */}
              <div>
                <h3 className="text-lg font-bold text-[#2c2c2c] mb-4">رفع صورة جديدة</h3>
                <div className="border-2 border-dashed border-[#e8e8c8] rounded-xl p-6 hover:border-[#8b7355] transition-colors">
                  {siteImagePreview ? (
                    <div className="relative">
                      <img
                        src={siteImagePreview}
                        alt="New Site Preview"
                        className="w-full h-64 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={handleResetSiteImage}
                        className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                      >
                        <X size={16} />
                      </button>
                      <div className="absolute top-2 left-2 bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                        جديدة
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-64">
                      <Upload className="text-[#8b7355] mb-4" size={48} />
                      <p className="text-[#8b7355] mb-4 text-center">
                        اضغط لرفع صورة جديدة للموقع
                      </p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleSiteImageChange}
                        className="hidden"
                        id="site-image-upload"
                      />
                      <label
                        htmlFor="site-image-upload"
                        className="px-6 py-3 bg-gradient-to-r from-[#2c2c2c] to-[#8b7355] text-white rounded-xl cursor-pointer hover:shadow-lg transition-all duration-300 font-medium"
                      >
                        اختر صورة
                      </label>
                    </div>
                  )}
                </div>
              </div>
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
                          src={`http://localhost:3000${currentLogo}`}
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
        {(newSiteImage || newLogo) && (
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
