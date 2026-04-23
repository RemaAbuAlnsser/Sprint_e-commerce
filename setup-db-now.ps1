# سكريبت إعداد قاعدة بيانات Magnetix - PostgreSQL 18
# تشغيل هذا السكريبت لإنشاء قاعدة البيانات تلقائياً

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "  إعداد قاعدة بيانات Magnetix Store  " -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# تعيين مسار PostgreSQL 18
$pgPath = "C:\Program Files\PostgreSQL\18\bin"
$env:Path = "$pgPath;" + $env:Path

# التحقق من PostgreSQL
Write-Host "🔍 التحقق من PostgreSQL..." -ForegroundColor Yellow
$psqlExe = "$pgPath\psql.exe"

if (Test-Path $psqlExe) {
    Write-Host "✅ PostgreSQL 18 موجود" -ForegroundColor Green
} else {
    Write-Host "❌ خطأ: PostgreSQL غير موجود في المسار المتوقع" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "📝 معلومات الاتصال:" -ForegroundColor Cyan
Write-Host "   - المستخدم: postgres" -ForegroundColor White
Write-Host "   - كلمة المرور: Magnetix2026" -ForegroundColor White
Write-Host "   - المنفذ: 5432" -ForegroundColor White
Write-Host "   - قاعدة البيانات: magnetix_store" -ForegroundColor White
Write-Host ""

# تعيين كلمة المرور
$env:PGPASSWORD = "Magnetix2026"

# إنشاء ملف SQL لإنشاء قاعدة البيانات
$createDbSql = @"
-- حذف قاعدة البيانات إذا كانت موجودة
DROP DATABASE IF EXISTS magnetix_store;

-- إنشاء قاعدة البيانات الجديدة
CREATE DATABASE magnetix_store
    WITH 
    OWNER = postgres
    ENCODING = 'UTF8'
    CONNECTION LIMIT = -1;
"@

$tempSqlPath = "$env:TEMP\create_magnetix_db.sql"
Set-Content -Path $tempSqlPath -Value $createDbSql -Encoding UTF8

Write-Host "🗄️  إنشاء قاعدة البيانات magnetix_store..." -ForegroundColor Yellow

# تنفيذ إنشاء قاعدة البيانات
& $psqlExe -U postgres -f $tempSqlPath 2>&1 | Out-Null

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ تم إنشاء قاعدة البيانات بنجاح" -ForegroundColor Green
} else {
    Write-Host "⚠️  قد تكون قاعدة البيانات موجودة بالفعل، سنتابع..." -ForegroundColor Yellow
}

# حذف الملف المؤقت
Remove-Item $tempSqlPath -Force -ErrorAction SilentlyContinue

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
Write-Host "✅ تم تحديث ملف .env" -ForegroundColor Green

Write-Host ""

# استيراد البيانات من ملف SQL إذا كان موجوداً
$sqlFilePath = "d:\Website\project\Magnetix\backend\magnetix_store.sql"
if (Test-Path $sqlFilePath) {
    Write-Host "📊 استيراد البيانات من ملف SQL..." -ForegroundColor Yellow
    & $psqlExe -U postgres -d magnetix_store -f $sqlFilePath 2>&1 | Out-Null
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ تم استيراد البيانات بنجاح" -ForegroundColor Green
    } else {
        Write-Host "⚠️  حدثت بعض الأخطاء، لكن سيتم إنشاء الجداول تلقائياً عند تشغيل Backend" -ForegroundColor Yellow
    }
} else {
    Write-Host "ℹ️  ملف SQL غير موجود، سيتم إنشاء الجداول تلقائياً عند تشغيل Backend" -ForegroundColor Cyan
}

# مسح كلمة المرور
Remove-Item Env:\PGPASSWORD -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "  ✅ تم إعداد قاعدة البيانات بنجاح!  " -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "🚀 الخطوات التالية:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1️⃣  تثبيت dependencies للـ Backend:" -ForegroundColor Yellow
Write-Host "   cd backend" -ForegroundColor White
Write-Host "   npm install" -ForegroundColor White
Write-Host ""
Write-Host "2️⃣  تشغيل Backend:" -ForegroundColor Yellow
Write-Host "   npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "3️⃣  في نافذة PowerShell جديدة، تثبيت dependencies للـ Frontend:" -ForegroundColor Yellow
Write-Host "   cd frontend" -ForegroundColor White
Write-Host "   npm install" -ForegroundColor White
Write-Host ""
Write-Host "4️⃣  تشغيل Frontend:" -ForegroundColor Yellow
Write-Host "   npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "📱 بعد التشغيل، افتح المتصفح على:" -ForegroundColor Cyan
Write-Host "   http://localhost:3005" -ForegroundColor Green
Write-Host ""
