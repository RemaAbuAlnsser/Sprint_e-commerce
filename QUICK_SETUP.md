# 🚀 إعداد قاعدة البيانات - خطوات سريعة

## ⚠️ مهم: كلمة المرور

يبدو أن كلمة المرور التي أدخلتها أثناء تثبيت PostgreSQL مختلفة عن `Magnetix2026`.

---

## 📋 الخطوات (اختر إحدى الطريقتين):

### **الطريقة 1: استخدام pgAdmin (الأسهل)** ⭐

1. **افتح pgAdmin 4** من قائمة Start

2. **أدخل كلمة المرور** التي استخدمتها أثناء تثبيت PostgreSQL

3. **في الشريط الجانبي:**
   - انقر بزر الماوس الأيمن على **Databases**
   - اختر **Create → Database**

4. **في نافذة إنشاء قاعدة البيانات:**
   - **Database name:** `magnetix_store`
   - **Owner:** `postgres`
   - انقر **Save**

5. **استيراد البيانات (اختياري):**
   - انقر بزر الماوس الأيمن على قاعدة البيانات `magnetix_store`
   - اختر **Restore**
   - اختر ملف: `d:\Website\project\Magnetix\backend\magnetix_store.sql`
   - انقر **Restore**

---

### **الطريقة 2: استخدام SQL Shell (psql)**

1. **افتح SQL Shell (psql)** من قائمة Start

2. **اضغط Enter** لكل سؤال حتى تصل لـ Password

3. **أدخل كلمة المرور** التي استخدمتها أثناء التثبيت

4. **نفذ الأوامر التالية:**

```sql
-- إنشاء قاعدة البيانات
CREATE DATABASE magnetix_store;

-- للخروج
\q
```

5. **لاستيراد البيانات (اختياري):**
   - افتح SQL Shell مرة أخرى
   - عند السؤال عن Database، اكتب: `magnetix_store`
   - أدخل كلمة المرور
   - نفذ: `\i d:/Website/project/Magnetix/backend/magnetix_store.sql`

---

## ⚙️ تحديث ملف .env

**افتح الملف:** `d:\Website\project\Magnetix\backend\.env`

**استبدل محتواه بالتالي** (استبدل `YOUR_PASSWORD` بكلمة المرور الحقيقية):

```env
DATABASE_URL=postgres://postgres:YOUR_PASSWORD@localhost:5432/magnetix_store
JWT_SECRET=magnetix-super-secret-jwt-key-2024
PORT=9000
```

**مثال:** إذا كانت كلمة المرور `admin123`:
```env
DATABASE_URL=postgres://postgres:admin123@localhost:5432/magnetix_store
JWT_SECRET=magnetix-super-secret-jwt-key-2024
PORT=9000
```

---

## 🧪 اختبار الاتصال

بعد إنشاء قاعدة البيانات وتحديث `.env`:

```powershell
cd d:\Website\project\Magnetix\backend
npm install
npm run dev
```

**إذا رأيت:**
```
✅ Database tables initialized
🚀 Backend server running on http://localhost:9000
```

**معناها كل شيء يعمل بنجاح!** 🎉

---

## ❓ إذا نسيت كلمة المرور

يمكنك إعادة تعيين كلمة مرور PostgreSQL:

1. ابحث عن ملف `pg_hba.conf` في:
   ```
   C:\Program Files\PostgreSQL\18\data\pg_hba.conf
   ```

2. افتحه كمسؤول وغير السطر:
   ```
   host    all             all             127.0.0.1/32            scram-sha-256
   ```
   إلى:
   ```
   host    all             all             127.0.0.1/32            trust
   ```

3. أعد تشغيل خدمة PostgreSQL من Services

4. افتح SQL Shell وغير كلمة المرور:
   ```sql
   ALTER USER postgres PASSWORD 'Magnetix2026';
   ```

5. أعد السطر في `pg_hba.conf` كما كان وأعد تشغيل الخدمة

---

## 📞 بعد الإعداد

أخبرني عندما تنتهي من إنشاء قاعدة البيانات وتحديث ملف `.env`، 
وسأساعدك في تشغيل المشروع! 🚀
