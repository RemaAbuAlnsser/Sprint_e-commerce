# 🚀 دليل البدء السريع - Magnetix Store

## خطوات الإعداد الكاملة

---

## 📥 الخطوة 1: تحميل PostgreSQL

1. **افتح الرابط التالي في المتصفح:**
   ```
   https://www.enterprisedb.com/downloads/postgres-postgresql-downloads
   ```

2. **اختر النسخة المناسبة:**
   - PostgreSQL Version: **16.x**
   - Operating System: **Windows x86-64**

3. **حمل الملف** (حجمه حوالي 300 MB)

---

## 💿 الخطوة 2: تثبيت PostgreSQL

1. **شغل ملف التثبيت** الذي حملته

2. **اتبع معالج التثبيت:**

   | الخطوة | الإعداد |
   |--------|---------|
   | Installation Directory | `C:\Program Files\PostgreSQL\16` |
   | Select Components | اختر **الكل** |
   | Data Directory | `C:\Program Files\PostgreSQL\16\data` |
   | **Password** | **`Magnetix2026`** ⚠️ مهم جداً |
   | Port | `5432` |
   | Locale | Default locale |

3. **انقر Next → Install → انتظر 5-10 دقائق → Finish**

---

## ⚙️ الخطوة 3: إعداد قاعدة البيانات (تلقائي)

بعد تثبيت PostgreSQL:

1. **افتح PowerShell كمسؤول** (Right-click → Run as Administrator)

2. **انتقل لمجلد المشروع:**
   ```powershell
   cd "d:\Website\project\Magnetix"
   ```

3. **شغل السكريبت التلقائي:**
   ```powershell
   .\setup-database.ps1
   ```

   السكريبت سيقوم بـ:
   - ✅ إنشاء قاعدة البيانات `magnetix_store`
   - ✅ تحديث ملف `.env` تلقائياً
   - ✅ استيراد البيانات من ملف SQL

---

## 🔧 الخطوة 4: تشغيل المشروع

### تشغيل Backend:
```powershell
cd "d:\Website\project\Magnetix\backend"
npm install
npm run dev
```

**يجب أن ترى:**
```
✅ Database tables initialized
🚀 Backend server running on http://localhost:9000
```

### تشغيل Frontend (في نافذة PowerShell جديدة):
```powershell
cd "d:\Website\project\Magnetix\frontend"
npm install
npm run dev
```

**يجب أن ترى:**
```
✓ Ready in 3.2s
○ Local: http://localhost:3005
```

---

## 🌐 الوصول للموقع

| الخدمة | الرابط |
|--------|--------|
| **الموقع الرئيسي** | http://localhost:3005 |
| **لوحة التحكم** | http://localhost:3005/admin |
| **Backend API** | http://localhost:9000 |

---

## 🔐 معلومات تسجيل الدخول

### قاعدة البيانات PostgreSQL:
- **المستخدم:** `postgres`
- **كلمة المرور:** `Magnetix2026`
- **المنفذ:** `5432`
- **اسم القاعدة:** `magnetix_store`

### لوحة التحكم (Admin):
سيتم إنشاء حساب Admin عند أول تشغيل للـ Backend

---

## ❓ حل المشاكل

### مشكلة: "psql: command not found"
**الحل:**
```powershell
$env:Path += ";C:\Program Files\PostgreSQL\16\bin"
```

### مشكلة: "password authentication failed"
**الحل:** تأكد من كلمة المرور: `Magnetix2026`

### مشكلة: "port 9000 already in use"
**الحل:** أغلق أي تطبيق يستخدم المنفذ 9000

### مشكلة: "Cannot connect to database"
**الحل:** تأكد من تشغيل PostgreSQL:
```powershell
# تحقق من حالة الخدمة
Get-Service postgresql*
```

---

## 📚 ملفات مساعدة إضافية

- `SETUP_POSTGRESQL.md` - دليل تفصيلي لتثبيت PostgreSQL
- `UPDATE_ENV.md` - كيفية تحديث ملف .env يدوياً
- `setup-database.ps1` - سكريبت إعداد قاعدة البيانات التلقائي

---

## ✅ قائمة التحقق

- [ ] تحميل PostgreSQL من الموقع الرسمي
- [ ] تثبيت PostgreSQL بكلمة المرور `Magnetix2026`
- [ ] تشغيل سكريبت `setup-database.ps1`
- [ ] تثبيت dependencies للـ Backend (`npm install`)
- [ ] تشغيل Backend (`npm run dev`)
- [ ] تثبيت dependencies للـ Frontend (`npm install`)
- [ ] تشغيل Frontend (`npm run dev`)
- [ ] فتح الموقع على http://localhost:3005

---

## 🎉 بعد الإعداد الناجح

الآن يمكنك:
1. ✅ تصفح المتجر على http://localhost:3005
2. ✅ الدخول للوحة التحكم على http://localhost:3005/admin
3. ✅ إضافة منتجات جديدة
4. ✅ إدارة الطلبات
5. ✅ تخصيص المتجر حسب احتياجاتك

---

**💡 نصيحة:** احفظ كلمة المرور `Magnetix2026` في مكان آمن!
