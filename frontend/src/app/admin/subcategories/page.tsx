'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react'
import ConfirmModal from '../components/ConfirmModal'

interface ParentCategory {
  id: string
  name: string
  handle: string
}

interface Category {
  id: string
  name: string
  handle: string
  description: string
  image_url: string | null
  parent_category_id: string
  display_order: number
  is_active: boolean
  parent_category?: ParentCategory
}

export default function SubcategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [parentCategories, setParentCategories] = useState<ParentCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [selectedParent, setSelectedParent] = useState<string>('all')
  const [formError, setFormError] = useState('')
  const [confirmDelete, setConfirmDelete] = useState<{ show: boolean; id: string; name: string }>({ show: false, id: '', name: '' })
  const [formData, setFormData] = useState({
    name: '',
    handle: '',
    description: '',
    image_url: '',
    parent_category_id: '',
    display_order: 0,
    is_active: true
  })

  useEffect(() => {
    fetchParentCategories()
    fetchCategories()
  }, [])

  const fetchParentCategories = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/admin/parent-categories`)
      const data = await response.json()
      setParentCategories(data.parent_categories || [])
    } catch (error) {
      console.error('Error fetching parent categories:', error)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/admin/categories`)
      const data = await response.json()
      setCategories(data.categories || [])
    } catch (error) {
      console.error('Error fetching categories:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.parent_category_id) {
      setFormError('يرجى اختيار القسم الرئيسي')
      return
    }
    
    try {
      const url = editingId
        ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/admin/categories/${editingId}`
        : `${process.env.NEXT_PUBLIC_BACKEND_URL}/admin/categories`
      
      const response = await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        await fetchCategories()
        resetForm()
      } else {
        const error = await response.json()
        setFormError(error.error || 'حدث خطأ')
      }
    } catch (error) {
      console.error('Error saving category:', error)
      setFormError('حدث خطأ أثناء الحفظ')
    }
  }

  const handleEdit = (category: Category) => {
    setEditingId(category.id)
    setFormData({
      name: category.name,
      handle: category.handle,
      description: category.description || '',
      image_url: category.image_url || '',
      parent_category_id: category.parent_category_id,
      display_order: category.display_order,
      is_active: category.is_active
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/admin/categories/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await fetchCategories()
      }
    } catch (error) {
      console.error('Error deleting category:', error)
    } finally {
      setConfirmDelete({ show: false, id: '', name: '' })
    }
  }

  const toggleActive = async (category: Category) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/admin/categories/${category.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !category.is_active })
      })

      if (response.ok) {
        await fetchCategories()
      }
    } catch (error) {
      console.error('Error toggling active status:', error)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      handle: '',
      description: '',
      image_url: '',
      parent_category_id: '',
      display_order: 0,
      is_active: true
    })
    setEditingId(null)
    setShowForm(false)
  }

  const filteredCategories = selectedParent === 'all'
    ? categories
    : categories.filter(cat => cat.parent_category_id === selectedParent)

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="text-center">جاري التحميل...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">الأقسام الفرعية</h1>
            <p className="text-muted-foreground mt-2">إدارة الأقسام الفرعية تحت الأقسام الرئيسية</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>إضافة قسم فرعي</span>
          </button>
        </div>

        {/* Filter */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">تصفية حسب القسم الرئيسي</label>
          <select
            value={selectedParent}
            onChange={(e) => setSelectedParent(e.target.value)}
            className="px-4 py-2 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">جميع الأقسام</option>
            {parentCategories.map((parent) => (
              <option key={parent.id} value={parent.id}>{parent.name}</option>
            ))}
          </select>
        </div>

        {/* Form */}
        {showForm && (
          <div className="bg-card p-6 rounded-lg border border-border mb-8">
            <h2 className="text-xl font-bold mb-4">
              {editingId ? 'تعديل القسم الفرعي' : 'إضافة قسم فرعي جديد'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">القسم الرئيسي *</label>
                <select
                  value={formData.parent_category_id}
                  onChange={(e) => setFormData({ ...formData, parent_category_id: e.target.value })}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                >
                  <option value="">اختر القسم الرئيسي</option>
                  {parentCategories.map((parent) => (
                    <option key={parent.id} value={parent.id}>{parent.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">اسم القسم الفرعي *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">المعرف (Handle) *</label>
                  <input
                    type="text"
                    value={formData.handle}
                    onChange={(e) => setFormData({ ...formData, handle: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                    placeholder="lipstick"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">الوصف</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">رابط الصورة</label>
                  <input
                    type="text"
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">ترتيب العرض</label>
                  <input
                    type="number"
                    value={formData.display_order}
                    onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4"
                />
                <label htmlFor="is_active" className="text-sm font-medium">نشط</label>
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
                >
                  {editingId ? 'تحديث' : 'إضافة'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Categories List */}
        <div className="bg-card rounded-lg border border-border overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="px-6 py-4 text-right text-sm font-semibold">الترتيب</th>
                <th className="px-6 py-4 text-right text-sm font-semibold">القسم الرئيسي</th>
                <th className="px-6 py-4 text-right text-sm font-semibold">القسم الفرعي</th>
                <th className="px-6 py-4 text-right text-sm font-semibold">المعرف</th>
                <th className="px-6 py-4 text-right text-sm font-semibold">الحالة</th>
                <th className="px-6 py-4 text-right text-sm font-semibold">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredCategories.map((category) => {
                const parent = parentCategories.find(p => p.id === category.parent_category_id)
                return (
                  <tr key={category.id} className="hover:bg-muted/50">
                    <td className="px-6 py-4 text-sm">{category.display_order}</td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                        {parent?.name || 'غير محدد'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium">{category.name}</div>
                      {category.description && (
                        <div className="text-sm text-muted-foreground mt-1">{category.description}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{category.handle}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleActive(category)}
                        className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
                          category.is_active
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {category.is_active ? (
                          <>
                            <Eye className="w-4 h-4" />
                            <span>نشط</span>
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-4 h-4" />
                            <span>غير نشط</span>
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(category)}
                          className="p-2 hover:bg-muted rounded-lg transition-colors"
                          title="تعديل"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setConfirmDelete({ show: true, id: category.id, name: category.name })}
                          className="p-2 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                          title="حذف"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          {filteredCategories.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              لا توجد أقسام فرعية. قم بإضافة قسم جديد للبدء.
            </div>
          )}
        </div>
      </div>
      <ConfirmModal
        isOpen={confirmDelete.show}
        title="حذف القسم الفرعي"
        message={`هل أنت متأكد من حذف "${confirmDelete.name}"؟`}
        confirmText="حذف"
        cancelText="إلغاء"
        type="danger"
        onConfirm={() => handleDelete(confirmDelete.id)}
        onCancel={() => setConfirmDelete({ show: false, id: '', name: '' })}
      />
    </div>
  )
}
