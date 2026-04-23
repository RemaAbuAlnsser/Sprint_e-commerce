# دليل تثبيت PostgreSQL وإعداد قاعدة البيانات

## 📥 الخطوة 1: تحميل وتثبيت PostgreSQL

### تحميل PostgreSQL:
1. افتح الرابط التالي: https://www.enterprisedb.com/downloads/postgres-postgresql-downloads
2. اختر **PostgreSQL 16.x** لنظام **Windows x86-64**
3. حمل الملف (حجمه تقريباً 300 MB)

### تثبيت PostgreSQL:
1. شغل ملف التثبيت الذي حملته
2. اتبع الخطوات التالية:
   - **Installation Directory**: اترك المسار الافتراضي `C:\Program Files\PostgreSQL\16`
   - **Select Components**: اختر كل المكونات (PostgreSQL Server, pgAdmin 4, Stack Builder, Command Line Tools)
   - **Data Directory**: اترك المسار الافتراضي `C:\Program Files\PostgreSQL\16\data`
   - **Password**: أدخل كلمة المرور: `Magnetix2026`
   - **Port**: اترك المنفذ الافتراضي `5432`
   - **Locale**: اختر `Default locale`
3. انقر على **Next** ثم **Install**
4. انتظر حتى ينتهي التثبيت (قد يستغرق 5-10 دقائق)
5. انقر على **Finish**

---

## 🗄️ الخطوة 2: إنشاء قاعدة البيانات

بعد التثبيت، افتح **PowerShell** كمسؤول وقم بتنفيذ الأوامر التالية:

### 1. إضافة PostgreSQL إلى PATH:
```powershell
$env:Path += ";C:\Program Files\PostgreSQL\16\bin"
```

### 2. التحقق من التثبيت:
```powershell
psql --version
```

### 3. إنشاء قاعدة البيانات:
```powershell
# الاتصال بـ PostgreSQL (سيطلب منك كلمة المرور: Magnetix2026)
psql -U postgres

# داخل PostgreSQL، قم بتنفيذ:
CREATE DATABASE magnetix_store;

# للخروج من PostgreSQL:
\q
```

---

## 📊 الخطوة 3: استيراد البيانات

### استيراد ملف SQL الموجود:
```powershell
# من مجلد المشروع
cd "d:\Website\project\Magnetix\backend"

# استيراد البيانات (سيطلب كلمة المرور: Magnetix2026)
psql -U postgres -d magnetix_store -f magnetix_store.sql
```

---

## ⚙️ الخطوة 4: تحديث إعدادات المشروع

ملف `.env` في مجلد `backend` تم تحديثه تلقائياً بالإعدادات التالية:
```env
DATABASE_URL=postgres://postgres:Magnetix2026@localhost:5432/magnetix_store
JWT_SECRET=magnetix-super-secret-jwt-key-2024
PORT=9000
```

---

## ✅ الخطوة 5: اختبار الاتصال

### تشغيل Backend:
```powershell
cd "d:\Website\project\Magnetix\backend"
npm install
npm run dev
```

إذا رأيت الرسالة:
```
✅ Database tables initialized
🚀 Backend server running on http://localhost:9000
```

معناها أن كل شيء يعمل بنجاح! 🎉

---

## 🔧 حل المشاكل الشائعة

### مشكلة: "psql: command not found"
**الحل**: أضف PostgreSQL إلى PATH بشكل دائم:
1. افتح **System Properties** → **Environment Variables**
2. في **System Variables**، اختر **Path** → **Edit**
3. أضف: `C:\Program Files\PostgreSQL\16\bin`
4. أعد تشغيل PowerShell

### مشكلة: "password authentication failed"
**الحل**: تأكد من أنك تستخدم كلمة المرور الصحيحة: `Magnetix2026`

### مشكلة: "database already exists"
**الحل**: القاعدة موجودة بالفعل، يمكنك حذفها وإعادة إنشائها:
```sql
DROP DATABASE magnetix_store;
CREATE DATABASE magnetix_store;
```

---

## 📱 الوصول إلى pgAdmin

بعد التثبيت، يمكنك استخدام **pgAdmin 4** لإدارة قاعدة البيانات بشكل مرئي:
1. افتح **pgAdmin 4** من قائمة Start
2. أدخل كلمة المرور: `Magnetix2026`
3. اتصل بالخادم المحلي
4. ستجد قاعدة البيانات `magnetix_store`

---

## 🎯 الخطوات التالية

بعد إعداد قاعدة البيانات:
1. ✅ شغل Backend: `npm run dev` في مجلد `backend`
2. ✅ شغل Frontend: `npm run dev` في مجلد `frontend`
3. ✅ افتح المتصفح على: http://localhost:3005

---

**ملاحظة مهمة**: احفظ كلمة المرور `Magnetix2026` في مكان آمن!
