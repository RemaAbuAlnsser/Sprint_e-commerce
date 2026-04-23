'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, ChevronDown, ChevronRight } from 'lucide-react'
import ConfirmModal from '../components/ConfirmModal'

interface ParentCategory {
  id: string
  name: string
  handle: string
  description: string
  display_order: number
  is_active: boolean
  subcategories?: Category[]
}

interface Category {
  id: string
  name: string
  handle: string
  description: string
  parent_category_id: string
  display_order: number
  is_active: boolean
}

export default function CategoriesManagementPage() {
  const [parentCategories, setParentCategories] = useState<ParentCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  const [formError, setFormError] = useState('')
  const [confirmDelete, setConfirmDelete] = useState<{ show: boolean; id: string; name: string; type: 'parent' | 'sub' }>({ show: false, id: '', name: '', type: 'parent' })
  
  // Parent Category Form
  const [showParentForm, setShowParentForm] = useState(false)
  const [editingParentId, setEditingParentId] = useState<string | null>(null)
  const [parentFormData, setParentFormData] = useState({
    name: '',
    handle: '',
    description: '',
    display_order: 0
  })

  // Subcategory Form
  const [showSubForm, setShowSubForm] = useState(false)
  const [selectedParentId, setSelectedParentId] = useState<string>('')
  const [editingSubId, setEditingSubId] = useState<string | null>(null)
  const [subFormData, setSubFormData] = useState({
    name: '',
    handle: '',
    description: '',
    parent_category_id: '',
    display_order: 0
  })

  useEffect(() => {
    fetchAllCategories()
  }, [])

  const fetchAllCategories = async () => {
    try {
      const [parentRes, subRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/admin/parent-categories`),
        fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/admin/categories`)
      ])
      
      const parentData = await parentRes.json()
      const subData = await subRes.json()
      
      const parents = parentData.parent_categories || []
      const subs = subData.categories || []
      
      const categoriesWithSubs = parents.map((parent: ParentCategory) => ({
        ...parent,
        subcategories: subs.filter((sub: Category) => sub.parent_category_id === parent.id)
      }))
      
      setParentCategories(categoriesWithSubs)
    } catch (error) {
      console.error('Error fetching categories:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedCategories(newExpanded)
  }

  // Parent Category Functions
  const handleParentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const url = editingParentId
        ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/admin/parent-categories/${editingParentId}`
        : `${process.env.NEXT_PUBLIC_BACKEND_URL}/admin/parent-categories`
      
      const response = await fetch(url, {
        method: editingParentId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parentFormData)
      })

      if (response.ok) {
        await fetchAllCategories()
        resetParentForm()
      } else {
        const error = await response.json()
        setFormError(error.error || 'حدث خطأ')
      }
    } catch (error) {
      console.error('Error saving parent category:', error)
      setFormError('حدث خطأ أثناء الحفظ')
    }
  }

  const handleEditParent = (parent: ParentCategory) => {
    setEditingParentId(parent.id)
    setParentFormData({
      name: parent.name,
      handle: parent.handle,
      description: parent.description || '',
      display_order: parent.display_order
    })
    setShowParentForm(true)
  }

  const handleDeleteParent = async (id: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/admin/parent-categories/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await fetchAllCategories()
      }
    } catch (error) {
      console.error('Error deleting parent category:', error)
    } finally {
      setConfirmDelete({ show: false, id: '', name: '', type: 'parent' })
    }
  }

  const resetParentForm = () => {
    setParentFormData({ name: '', handle: '', description: '', display_order: 0 })
    setEditingParentId(null)
    setShowParentForm(false)
  }

  // Subcategory Functions
  const handleSubSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!subFormData.parent_category_id) {
      setFormError('يرجى اختيار الفئة الرئيسية')
      return
    }
    
    try {
      const url = editingSubId
        ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/admin/categories/${editingSubId}`
        : `${process.env.NEXT_PUBLIC_BACKEND_URL}/admin/categories`
      
      const response = await fetch(url, {
        method: editingSubId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subFormData)
      })

      if (response.ok) {
        await fetchAllCategories()
        resetSubForm()
      } else {
        const error = await response.json()
        setFormError(error.error || 'حدث خطأ')
      }
    } catch (error) {
      console.error('Error saving subcategory:', error)
      setFormError('حدث خطأ أثناء الحفظ')
    }
  }

  const handleAddSubcategory = (parentId: string) => {
    setSelectedParentId(parentId)
    setSubFormData({
      name: '',
      handle: '',
      description: '',
      parent_category_id: parentId,
      display_order: 0
    })
    setShowSubForm(true)
  }

  const handleEditSub = (sub: Category) => {
    setEditingSubId(sub.id)
    setSubFormData({
      name: sub.name,
      handle: sub.handle,
      description: sub.description || '',
      parent_category_id: sub.parent_category_id,
      display_order: sub.display_order
    })
    setShowSubForm(true)
  }

  const handleDeleteSub = async (id: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/admin/categories/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await fetchAllCategories()
      }
    } catch (error) {
      console.error('Error deleting subcategory:', error)
    } finally {
      setConfirmDelete({ show: false, id: '', name: '', type: 'parent' })
    }
  }

  const resetSubForm = () => {
    setSubFormData({ name: '', handle: '', description: '', parent_category_id: '', display_order: 0 })
    setEditingSubId(null)
    setShowSubForm(false)
    setSelectedParentId('')
  }

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
            <h1 className="text-3xl font-bold text-foreground">إدارة الفئات</h1>
            <p className="text-muted-foreground mt-2">إدارة الفئات الرئيسية والفرعية للمتجر</p>
          </div>
          <button
            onClick={() => setShowParentForm(!showParentForm)}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>إضافة فئة رئيسية</span>
          </button>
        </div>

        {/* Parent Category Form */}
        {showParentForm && (
          <div className="bg-card p-6 rounded-lg border border-border mb-8">
            <h2 className="text-xl font-bold mb-4">
              {editingParentId ? 'تعديل الفئة الرئيسية' : 'إضافة فئة رئيسية جديدة'}
            </h2>
            <form onSubmit={handleParentSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">اسم الفئة *</label>
                  <input
                    type="text"
                    value={parentFormData.name}
                    onChange={(e) => setParentFormData({ ...parentFormData, name: e.target.value })}
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">المعرف (Handle) *</label>
                  <input
                    type="text"
                    value={parentFormData.handle}
                    onChange={(e) => setParentFormData({ ...parentFormData, handle: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">الوصف</label>
                <textarea
                  value={parentFormData.description}
                  onChange={(e) => setParentFormData({ ...parentFormData, description: e.target.value })}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  rows={3}
                />
              </div>
              <div className="flex gap-4">
                <button type="submit" className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90">
                  {editingParentId ? 'تحديث' : 'إضافة'}
                </button>
                <button type="button" onClick={resetParentForm} className="px-6 py-2 bg-secondary text-secondary-foreground rounded-lg">
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Subcategory Form */}
        {showSubForm && (
          <div className="bg-card p-6 rounded-lg border border-border mb-8">
            <h2 className="text-xl font-bold mb-4">
              {editingSubId ? 'تعديل الفئة الفرعية' : 'إضافة فئة فرعية جديدة'}
            </h2>
            <form onSubmit={handleSubSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">الفئة الرئيسية *</label>
                <select
                  value={subFormData.parent_category_id}
                  onChange={(e) => setSubFormData({ ...subFormData, parent_category_id: e.target.value })}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                >
                  <option value="">اختر الفئة الرئيسية</option>
                  {parentCategories.map((parent) => (
                    <option key={parent.id} value={parent.id}>{parent.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">اسم الفئة الفرعية *</label>
                  <input
                    type="text"
                    value={subFormData.name}
                    onChange={(e) => setSubFormData({ ...subFormData, name: e.target.value })}
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">المعرف (Handle) *</label>
                  <input
                    type="text"
                    value={subFormData.handle}
                    onChange={(e) => setSubFormData({ ...subFormData, handle: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">الوصف</label>
                <textarea
                  value={subFormData.description}
                  onChange={(e) => setSubFormData({ ...subFormData, description: e.target.value })}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  rows={3}
                />
              </div>
              <div className="flex gap-4">
                <button type="submit" className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90">
                  {editingSubId ? 'تحديث' : 'إضافة'}
                </button>
                <button type="button" onClick={resetSubForm} className="px-6 py-2 bg-secondary text-secondary-foreground rounded-lg">
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Categories Tree */}
        <div className="space-y-4">
          {parentCategories.map((parent) => (
            <div key={parent.id} className="bg-card rounded-lg border border-border overflow-hidden">
              {/* Parent Category Header */}
              <div className="flex items-center justify-between p-4 bg-muted/50">
                <div className="flex items-center gap-3 flex-1">
                  <button
                    onClick={() => toggleExpand(parent.id)}
                    className="p-1 hover:bg-background rounded"
                  >
                    {expandedCategories.has(parent.id) ? (
                      <ChevronDown className="w-5 h-5" />
                    ) : (
                      <ChevronRight className="w-5 h-5" />
                    )}
                  </button>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg">{parent.name}</h3>
                    {parent.description && (
                      <p className="text-sm text-muted-foreground">{parent.description}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      {parent.subcategories?.length || 0} فئة فرعية
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAddSubcategory(parent.id)}
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 text-sm"
                  >
                    + إضافة فئة فرعية
                  </button>
                  <button
                    onClick={() => handleEditParent(parent)}
                    className="p-2 hover:bg-background rounded-lg"
                    title="تعديل"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setConfirmDelete({ show: true, id: parent.id, name: parent.name, type: 'parent' })}
                    className="p-2 hover:bg-red-100 text-red-600 rounded-lg"
                    title="حذف"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Subcategories */}
              {expandedCategories.has(parent.id) && (
                <div className="p-4 space-y-2">
                  {parent.subcategories && parent.subcategories.length > 0 ? (
                    parent.subcategories.map((sub) => (
                      <div
                        key={sub.id}
                        className="flex items-center justify-between p-3 bg-background rounded-lg border border-border hover:border-primary/50 transition-colors"
                      >
                        <div className="flex-1">
                          <h4 className="font-medium">{sub.name}</h4>
                          {sub.description && (
                            <p className="text-sm text-muted-foreground">{sub.description}</p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditSub(sub)}
                            className="p-2 hover:bg-muted rounded-lg"
                            title="تعديل"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setConfirmDelete({ show: true, id: sub.id, name: sub.name, type: 'sub' })}
                            className="p-2 hover:bg-red-100 text-red-600 rounded-lg"
                            title="حذف"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-muted-foreground py-4">
                      لا توجد فئات فرعية. انقر "إضافة فئة فرعية" للبدء.
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}

          {parentCategories.length === 0 && (
            <div className="text-center py-12 text-muted-foreground bg-card rounded-lg border border-border">
              لا توجد فئات رئيسية. قم بإضافة فئة جديدة للبدء.
            </div>
          )}
        </div>
      </div>
      <ConfirmModal
        isOpen={confirmDelete.show}
        title={confirmDelete.type === 'parent' ? 'حذف الفئة الرئيسية' : 'حذف الفئة الفرعية'}
        message={confirmDelete.type === 'parent' ? `هل أنت متأكد من حذف "${confirmDelete.name}"؟ سيتم حذف جميع الفئات الفرعية المرتبطة بها.` : `هل أنت متأكد من حذف "${confirmDelete.name}"؟`}
        confirmText="حذف"
        cancelText="إلغاء"
        type="danger"
        onConfirm={() => confirmDelete.type === 'parent' ? handleDeleteParent(confirmDelete.id) : handleDeleteSub(confirmDelete.id)}
        onCancel={() => setConfirmDelete({ show: false, id: '', name: '', type: 'parent' })}
      />
    </div>
  )
}
