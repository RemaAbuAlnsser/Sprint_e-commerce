# My Make Up - متجر مستحضرات التجميل

منصة تجارة إلكترونية متكاملة مبنية بأحدث التقنيات لبيع مستحضرات التجميل والعناية بالبشرة.

## 🚀 التقنيات المستخدمة

### Frontend
- **Next.js 14** - إطار عمل React
- **TypeScript** - لغة البرمجة
- **Tailwind CSS** - تنسيق الواجهات
- **Framer Motion** - الحركات والانتقالات
- **GSAP** - أنيميشن متقدم
- **Zustand** - إدارة الحالة

### Backend
- **Node.js** - بيئة التشغيل
- **Express.js** - إطار عمل الخادم
- **TypeScript** - لغة البرمجة
- **PostgreSQL** - قاعدة البيانات
- **JWT** - المصادقة والتفويض
- **Multer** - رفع الملفات

## 📁 هيكل المشروع

```
├── frontend/          # تطبيق Next.js
│   ├── src/
│   │   ├── app/      # صفحات التطبيق
│   │   ├── components/ # المكونات
│   │   └── store/    # إدارة الحالة
│   └── public/       # الملفات الثابتة
│
├── backend/          # خادم Express
│   ├── src/
│   │   ├── routes/   # نقاط النهاية API
│   │   ├── middleware/ # الوسيطات
│   │   └── database.ts # إعدادات قاعدة البيانات
│   └── uploads/      # الملفات المرفوعة
│
└── README.md
```

## 🎯 الميزات الرئيسية

### للمستخدمين
- ✅ تصفح المنتجات حسب الفئات والعلامات التجارية
- ✅ بحث متقدم مع فلاتر
- ✅ سلة تسوق ديناميكية
- ✅ نظام طلبات متكامل
- ✅ أنيميشن هوفر للمنتجات
- ✅ تصميم متجاوب لجميع الأجهزة

### للإدارة
- ✅ لوحة تحكم شاملة
- ✅ إدارة المنتجات والفئات
- ✅ إدارة الطلبات
- ✅ رفع الصور
- ✅ إحصائيات المبيعات

## 🛠️ التثبيت والتشغيل

### المتطلبات
- Node.js 18+
- PostgreSQL 14+
- npm أو yarn

### خطوات التثبيت

1. **استنساخ المشروع**
```bash
git clone <repository-url>
cd "Magnetix Tech"
```

2. **تثبيت اعتماديات Backend**
```bash
cd backend
npm install
```

3. **إعداد قاعدة البيانات**
- إنشاء قاعدة بيانات PostgreSQL باسم `magnetix_store`
- تحديث ملف `.env` بمعلومات الاتصال

4. **تشغيل Backend**
```bash
npm run dev
```

5. **تثبيت اعتماديات Frontend**
```bash
cd ../frontend
npm install
```

6. **تشغيل Frontend**
```bash
npm run dev
```

## 🔐 المتغيرات البيئية

### Backend (.env)
```env
DATABASE_URL=postgres://user:password@localhost:5432/magnetix_store
JWT_SECRET=your-secret-key
PORT=9000
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:9000
```

## 📱 الوصول للتطبيق

- **الموقع الرئيسي**: http://localhost:3005
- **لوحة التحكم**: http://localhost:3005/admin
- **API Backend**: http://localhost:9000

## 🎨 التصميم

المشروع يستخدم تصميم عصري مع:
- نظام ألوان أرجواني وأزرق
- تأثيرات حركية سلسة
- تصميم متجاوب كامل
- واجهة مستخدم بديهية

## 📄 الترخيص

هذا المشروع ملك خاص.
