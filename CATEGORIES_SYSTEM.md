# نظام الأقسام الهرمي - My Make Up Store

## 📋 نظرة عامة

تم تحديث المتجر ليدعم نظام أقسام هرمي من مستويين:
- **الأقسام الرئيسية (Parent Categories)**: الأقسام الأساسية للمتجر
- **الأقسام الفرعية (Subcategories)**: أقسام تندرج تحت الأقسام الرئيسية

---

## 🗄️ هيكل قاعدة البيانات

### جدول parent_categories

```sql
CREATE TABLE parent_categories (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  handle VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  image_url TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### جدول categories (محدث)

```sql
CREATE TABLE categories (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  handle VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  image_url TEXT,
  parent_category_id UUID REFERENCES parent_categories(id) ON DELETE CASCADE,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

---

## 🔌 API Endpoints

### الأقسام الرئيسية

#### GET /store/parent-categories
الحصول على جميع الأقسام الرئيسية مع عدد الأقسام الفرعية والمنتجات

**Response:**
```json
{
  "parent_categories": [
    {
      "id": "uuid",
      "name": "مكياج",
      "handle": "makeup",
      "description": "جميع منتجات المكياج والتجميل",
      "display_order": 1,
      "is_active": true,
      "subcategories_count": 5,
      "products_count": 25
    }
  ]
}
```

#### GET /store/parent-categories/:id
الحصول على قسم رئيسي مع أقسامه الفرعية

**Response:**
```json
{
  "parent_category": { ... },
  "subcategories": [ ... ]
}
```

#### POST /admin/parent-categories
إنشاء قسم رئيسي جديد

**Request Body:**
```json
{
  "name": "مكياج",
  "handle": "makeup",
  "description": "جميع منتجات المكياج",
  "image_url": "https://...",
  "display_order": 1
}
```

#### PUT /admin/parent-categories/:id
تحديث قسم رئيسي

#### DELETE /admin/parent-categories/:id
حذف قسم رئيسي (سيحذف جميع الأقسام الفرعية المرتبطة)

---

## 📊 الأقسام الافتراضية

### الأقسام الرئيسية:

1. **مكياج** (makeup)
   - أحمر شفاه
   - ماسكارا
   - كونسيلر
   - فاونديشن
   - آيلاينر

2. **عناية بالبشرة** (skincare)
   - مرطبات
   - سيروم
   - منظفات
   - ماسكات
   - واقي شمس

3. **عطور** (perfumes)
   - عطور نسائية
   - عطور رجالية
   - عطور يونيسكس

4. **عناية بالشعر** (haircare)
   - شامبو
   - بلسم
   - ماسك شعر
   - زيوت شعر

---

## 🎨 صفحات لوحة التحكم

### 1. صفحة الأقسام الرئيسية
**المسار:** `/admin/parent-categories`

**الميزات:**
- ✅ عرض جميع الأقسام الرئيسية
- ✅ إضافة قسم رئيسي جديد
- ✅ تعديل قسم رئيسي
- ✅ حذف قسم رئيسي
- ✅ تفعيل/إلغاء تفعيل قسم
- ✅ عرض عدد الأقسام الفرعية والمنتجات
- ✅ ترتيب الأقسام

### 2. صفحة الأقسام الفرعية
**المسار:** `/admin/subcategories`

**الميزات:**
- ✅ عرض جميع الأقسام الفرعية
- ✅ تصفية حسب القسم الرئيسي
- ✅ إضافة قسم فرعي جديد
- ✅ اختيار القسم الرئيسي
- ✅ تعديل قسم فرعي
- ✅ حذف قسم فرعي
- ✅ تفعيل/إلغاء تفعيل قسم
- ✅ ترتيب الأقسام

---

## 🔄 العلاقات والقيود

### CASCADE DELETE
عند حذف قسم رئيسي، يتم حذف جميع الأقسام الفرعية المرتبطة به تلقائياً.

### ترتيب العرض
- يتم ترتيب الأقسام حسب `display_order` ثم `name`
- يمكن تحديد ترتيب مخصص لكل قسم

### الحالة النشطة
- الأقسام غير النشطة لا تظهر في المتجر
- يمكن تفعيل/إلغاء تفعيل الأقسام بسهولة

---

## 🎯 استخدام النظام

### إضافة قسم رئيسي جديد:

1. اذهب إلى `/admin/parent-categories`
2. انقر على "إضافة قسم رئيسي"
3. املأ البيانات:
   - اسم القسم (مثل: "إكسسوارات")
   - المعرف (مثل: "accessories")
   - الوصف
   - رابط الصورة (اختياري)
   - ترتيب العرض
4. انقر "إضافة"

### إضافة قسم فرعي:

1. اذهب إلى `/admin/subcategories`
2. انقر على "إضافة قسم فرعي"
3. اختر القسم الرئيسي من القائمة
4. املأ بيانات القسم الفرعي
5. انقر "إضافة"

---

## 📝 ملاحظات مهمة

1. **المعرف (Handle)** يجب أن يكون فريداً ويستخدم في الروابط
2. **ترتيب العرض** يحدد ترتيب ظهور الأقسام (الأقل أولاً)
3. **الحذف** يحذف القسم نهائياً مع جميع علاقاته
4. **التفعيل/الإلغاء** يخفي القسم دون حذفه

---

## 🔧 التحديثات المطلوبة على Frontend

### المكونات التي تحتاج تحديث:

1. **CategoriesSection** - عرض الأقسام بشكل هرمي
2. **Navbar** - قائمة الأقسام المنسدلة
3. **صفحة المنتجات** - التصفية حسب الأقسام الهرمية

---

## 📊 إحصائيات

- **الأقسام الرئيسية:** 4 أقسام
- **الأقسام الفرعية:** 17 قسم
- **إجمالي الأقسام:** 21 قسم

---

## 🚀 الخطوات التالية

1. ✅ تحديث قاعدة البيانات
2. ✅ إنشاء API endpoints
3. ✅ إنشاء صفحات لوحة التحكم
4. ⏳ تحديث Frontend لعرض الأقسام الهرمية
5. ⏳ تحديث صفحة المنتجات للتصفية الهرمية
6. ⏳ تحديث Navbar بقائمة منسدلة للأقسام

---

**تاريخ التحديث:** 2 مارس 2026
