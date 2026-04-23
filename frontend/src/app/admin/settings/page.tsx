'use client'

import { useState, useEffect } from 'react'
import { Upload, Image as ImageIcon, Info, Check, X, Trash2, GripVertical } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import ConfirmModal from '../components/ConfirmModal'
import { API_URL } from '@/lib/api'

interface HeroImage {
  id: string
  image_url: string
  position: number
  is_active: boolean
  created_at: string
}

export default function SettingsPage() {
  const [heroImages, setHeroImages] = useState<HeroImage[]>([])
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [confirmDeleteImage, setConfirmDeleteImage] = useState<{ show: boolean; id: string }>({ show: false, id: '' })

  useEffect(() => {
    fetchHeroImages()
  }, [])

  const fetchHeroImages = async () => {
    try {
      setLoading(true)
      const res = await fetch(`${API_URL}/admin/hero-images/all`)
      const data = await res.json()
      
      if (data.images) {
        const imagesWithFullUrl = data.images.map((img: HeroImage) => ({
          ...img,
          image_url: img.image_url.startsWith('http') 
            ? img.image_url 
            : `${API_URL}${img.image_url}`
        }))
        setHeroImages(imagesWithFullUrl)
      }
    } catch (error) {
      console.error('Error fetching hero images:', error)
      setMessage({ type: 'error', text: 'فشل تحميل الصور' })
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'يرجى اختيار صورة صالحة' })
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'حجم الصورة يجب أن يكون أقل من 5 ميجابايت' })
      return
    }

    setUploading(true)
    setMessage(null)

    try {
      const formData = new FormData()
      formData.append('file', file)
      
      const uploadRes = await fetch(`${API_URL}/admin/upload`, {
        method: 'POST',
        body: formData
      })

      if (!uploadRes.ok) {
        throw new Error('فشل رفع الصورة')
      }

      const uploadData = await uploadRes.json()
      
      const imagePathToSave = uploadData.url.startsWith('/uploads/') 
        ? uploadData.url 
        : `/uploads/${uploadData.url}`
      
      const addImageRes = await fetch(`${API_URL}/admin/hero-images`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ image_url: imagePathToSave })
      })

      if (!addImageRes.ok) {
        throw new Error('فشل إضافة الصورة')
      }

      setMessage({ type: 'success', text: 'تم إضافة الصورة بنجاح!' })
      await fetchHeroImages()
      
      setTimeout(() => setMessage(null), 3000)
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'حدث خطأ أثناء رفع الصورة' })
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const handleDeleteImage = async (imageId: string) => {
    try {
      const res = await fetch(`${API_URL}/admin/hero-images/${imageId}`, {
        method: 'DELETE'
      })

      if (!res.ok) {
        throw new Error('فشل حذف الصورة')
      }

      setMessage({ type: 'success', text: 'تم حذف الصورة بنجاح!' })
      await fetchHeroImages()
      setTimeout(() => setMessage(null), 3000)
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'حدث خطأ أثناء حذف الصورة' })
    } finally {
      setConfirmDeleteImage({ show: false, id: '' })
    }
  }

  const handleToggleActive = async (imageId: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`${API_URL}/admin/hero-images/${imageId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ is_active: !currentStatus })
      })

      if (!res.ok) {
        throw new Error('فشل تحديث حالة الصورة')
      }

      await fetchHeroImages()
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'حدث خطأ أثناء تحديث الصورة' })
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6" dir="rtl">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">إعدادات الموقع</h1>
          <p className="text-gray-600">إدارة صور خلفية الصفحة الرئيسية - يتم التبديل بينها تلقائياً كل ثانيتين</p>
        </div>

        {/* Message */}
        <AnimatePresence>
          {message && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
                message.type === 'success' 
                  ? 'bg-green-50 border border-green-200 text-green-800' 
                  : 'bg-red-50 border border-red-200 text-red-800'
              }`}
            >
              {message.type === 'success' ? (
                <Check className="w-5 h-5 flex-shrink-0" />
              ) : (
                <X className="w-5 h-5 flex-shrink-0" />
              )}
              <span className="font-medium">{message.text}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="p-6">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Upload className="w-5 h-5" />
                إضافة صورة جديدة
              </h2>
              
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-purple-500 transition-colors">
                <input
                  type="file"
                  id="background-upload"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploading}
                  className="hidden"
                />
                
                <label
                  htmlFor="background-upload"
                  className={`cursor-pointer ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                      <Upload className="w-8 h-8 text-purple-600" />
                    </div>
                    
                    <div>
                      <p className="text-lg font-semibold text-gray-900 mb-1">
                        {uploading ? 'جاري الرفع...' : 'اضغط لاختيار صورة'}
                      </p>
                      <p className="text-sm text-gray-500">
                        الحد الأقصى: 5 ميجابايت
                      </p>
                    </div>
                    
                    <button
                      type="button"
                      disabled={uploading}
                      className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {uploading ? (
                        <span className="flex items-center gap-2">
                          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          جاري الرفع...
                        </span>
                      ) : (
                        'اختر صورة'
                      )}
                    </button>
                  </div>
                </label>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <ImageIcon className="w-5 h-5" />
                الصور الحالية ({heroImages.length})
              </h2>
              
              {loading ? (
                <div className="text-center py-12">
                  <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-500">جاري التحميل...</p>
                </div>
              ) : heroImages.length === 0 ? (
                <div className="aspect-video rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50">
                  <div className="text-center text-gray-500">
                    <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">لا توجد صور بعد</p>
                    <p className="text-xs mt-1">قم بإضافة صورة أولى للبدء</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {heroImages.map((image) => (
                    <div key={image.id} className="relative group rounded-xl overflow-hidden border-2 border-gray-200 hover:border-purple-500 transition-all">
                      <div className="aspect-video relative">
                        <img
                          src={image.image_url}
                          alt="Hero Image"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        
                        <div className="absolute top-2 right-2 flex gap-2">
                          <button
                            onClick={() => handleToggleActive(image.id, image.is_active)}
                            className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                              image.is_active
                                ? 'bg-green-500 text-white'
                                : 'bg-gray-500 text-white'
                            }`}
                          >
                            {image.is_active ? 'نشط' : 'معطل'}
                          </button>
                        </div>
                        
                        <div className="absolute bottom-2 left-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => setConfirmDeleteImage({ show: true, id: image.id })}
                            className="flex-1 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                            حذف
                          </button>
                        </div>
                      </div>
                      
                      <div className="p-3 bg-white">
                        <p className="text-xs text-gray-500">الترتيب: {image.position + 1}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <ConfirmModal
        isOpen={confirmDeleteImage.show}
        title="حذف الصورة"
        message="هل أنت متأكد من حذف هذه الصورة؟"
        confirmText="حذف"
        cancelText="إلغاء"
        type="danger"
        onConfirm={() => handleDeleteImage(confirmDeleteImage.id)}
        onCancel={() => setConfirmDeleteImage({ show: false, id: '' })}
      />
    </div>
  )
}
