# سكريبت إعداد قاعدة البيانات PostgreSQL لمشروع Magnetix
# يجب تشغيل هذا السكريبت بعد تثبيت PostgreSQL

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "  إعداد قاعدة بيانات Magnetix Store  " -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# إضافة PostgreSQL إلى PATH
Write-Host "⚙️  إضافة PostgreSQL إلى PATH..." -ForegroundColor Yellow
$env:Path += ";C:\Program Files\PostgreSQL\16\bin"
$env:Path += ";C:\Program Files\PostgreSQL\15\bin"
$env:Path += ";C:\Program Files\PostgreSQL\14\bin"

# التحقق من تثبيت PostgreSQL
Write-Host "🔍 التحقق من تثبيت PostgreSQL..." -ForegroundColor Yellow
try {
    $version = psql --version
    Write-Host "✅ PostgreSQL مثبت: $version" -ForegroundColor Green
} catch {
    Write-Host "❌ خطأ: PostgreSQL غير مثبت!" -ForegroundColor Red
    Write-Host "⚠️  يرجى تثبيت PostgreSQL أولاً من:" -ForegroundColor Yellow
    Write-Host "   https://www.enterprisedb.com/downloads/postgres-postgresql-downloads" -ForegroundColor Cyan
    exit 1
}

Write-Host ""
Write-Host "📝 معلومات الاتصال:" -ForegroundColor Cyan
Write-Host "   - المستخدم: postgres" -ForegroundColor White
Write-Host "   - كلمة المرور: Magnetix2026" -ForegroundColor White
Write-Host "   - المنفذ: 5432" -ForegroundColor White
Write-Host "   - قاعدة البيانات: magnetix_store" -ForegroundColor White
Write-Host ""

# تحديث ملف .env
Write-Host "📄 تحديث ملف .env..." -ForegroundColor Yellow
$envPath = "d:\Website\project\Magnetix\backend\.env"
$envContent = @"
DATABASE_URL=postgres://postgres:Magnetix2026@localhost:5432/magnetix_store
JWT_SECRET=magnetix-super-secret-jwt-key-2024
PORT=9000
"@

Set-Content -Path $envPath -Value $envContent -Encoding UTF8
Write-Host "✅ تم تحديث ملف .env بنجاح" -ForegroundColor Green
Write-Host ""

# إنشاء قاعدة البيانات
Write-Host "🗄️  إنشاء قاعدة البيانات..." -ForegroundColor Yellow
Write-Host "⚠️  سيُطلب منك إدخال كلمة المرور: Magnetix2026" -ForegroundColor Yellow
Write-Host ""

# إنشاء ملف SQL مؤقت لإنشاء قاعدة البيانات
$createDbSql = @"
-- التحقق من وجود قاعدة البيانات وحذفها إذا كانت موجودة
DROP DATABASE IF EXISTS magnetix_store;

-- إنشاء قاعدة البيانات الجديدة
CREATE DATABASE magnetix_store
    WITH 
    OWNER = postgres
    ENCODING = 'UTF8'
    LC_COLLATE = 'en_US.UTF-8'
    LC_CTYPE = 'en_US.UTF-8'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1;
"@

$tempSqlPath = "$env:TEMP\create_magnetix_db.sql"
Set-Content -Path $tempSqlPath -Value $createDbSql -Encoding UTF8

# تنفيذ إنشاء قاعدة البيانات
$env:PGPASSWORD = "Magnetix2026"
psql -U postgres -f $tempSqlPath

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ تم إنشاء قاعدة البيانات magnetix_store بنجاح" -ForegroundColor Green
} else {
    Write-Host "❌ فشل إنشاء قاعدة البيانات" -ForegroundColor Red
    exit 1
}

# حذف الملف المؤقت
Remove-Item $tempSqlPath -Force

Write-Host ""

# استيراد البيانات من ملف SQL إذا كان موجوداً
$sqlFilePath = "d:\Website\project\Magnetix\backend\magnetix_store.sql"
if (Test-Path $sqlFilePath) {
    Write-Host "📊 استيراد البيانات من ملف SQL..." -ForegroundColor Yellow
    psql -U postgres -d magnetix_store -f $sqlFilePath
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ تم استيراد البيانات بنجاح" -ForegroundColor Green
    } else {
        Write-Host "⚠️  حدث خطأ أثناء استيراد البيانات" -ForegroundColor Yellow
    }
} else {
    Write-Host "⚠️  ملف SQL غير موجود، سيتم إنشاء الجداول تلقائياً عند تشغيل Backend" -ForegroundColor Yellow
}

# مسح كلمة المرور من المتغيرات
Remove-Item Env:\PGPASSWORD

Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "  ✅ تم إعداد قاعدة البيانات بنجاح!  " -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "🚀 الخطوات التالية:" -ForegroundColor Cyan
Write-Host "   1. افتح PowerShell في مجلد backend" -ForegroundColor White
Write-Host "   2. نفذ: npm install" -ForegroundColor White
Write-Host "   3. نفذ: npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "📱 الوصول للتطبيق:" -ForegroundColor Cyan
Write-Host "   - Backend API: http://localhost:9000" -ForegroundColor White
Write-Host "   - Frontend: http://localhost:3005" -ForegroundColor White
Write-Host ""
