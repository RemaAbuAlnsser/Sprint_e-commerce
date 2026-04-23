# تحديث ملف .env

## ⚠️ مهم جداً

بعد تثبيت PostgreSQL، يجب تحديث ملف `.env` في مجلد `backend`:

### الخطوات:

1. افتح الملف: `d:\Website\project\Magnetix\backend\.env`

2. استبدل محتوى الملف بالتالي:

```env
DATABASE_URL=postgres://postgres:Magnetix2026@localhost:5432/magnetix_store
JWT_SECRET=magnetix-super-secret-jwt-key-2024
PORT=9000
```

3. احفظ الملف

---

## ✅ التحقق من الإعدادات

تأكد من:
- اسم المستخدم: `postgres`
- كلمة المرور: `Magnetix2026`
- المنفذ: `5432`
- اسم قاعدة البيانات: `magnetix_store`

---

**ملاحظة**: ملف `.env` موجود بالفعل في المجلد، فقط قم بتحديث محتواه.
