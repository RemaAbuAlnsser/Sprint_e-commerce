# دليل نشر المشروع على VPS

## معلومات الـ VPS
- **IP**: `104.234.26.192`
- **Backend Port**: `3000`
- **Frontend Port**: `3001`

---

## 1. تجهيز الـ VPS

### تثبيت المتطلبات
```bash
# تحديث النظام
sudo apt update && sudo apt upgrade -y

# تثبيت Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# تثبيت PM2 لإدارة العمليات
sudo npm install -g pm2

# تثبيت MySQL
sudo apt install -y mysql-server
sudo mysql_secure_installation
```

### إعداد قاعدة البيانات
```bash
# الدخول لـ MySQL
sudo mysql -u root -p

# إنشاء قاعدة البيانات
CREATE DATABASE SprintDB;
CREATE USER 'sprint_user'@'localhost' IDENTIFIED BY 'YOUR_SECURE_PASSWORD';
GRANT ALL PRIVILEGES ON SprintDB.* TO 'sprint_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

---

## 2. رفع المشروع للـ VPS

### باستخدام Git
```bash
# على الـ VPS
cd /var/www
git clone YOUR_REPO_URL sprint_store
cd sprint_store
```

### أو باستخدام SCP
```bash
# من جهازك المحلي
scp -r /Users/user/Desktop/sprint_e_commercr root@104.234.26.192:/var/www/sprint_store
```

---

## 3. إعداد الـ Backend

```bash
cd /var/www/sprint_store/backend

# تثبيت الـ dependencies
npm install

# إنشاء ملف .env
cp .env.production .env

# تعديل ملف .env بالقيم الصحيحة
nano .env
```

### محتوى ملف `.env`:
```env
DB_HOST=localhost
DB_USER=sprint_user
DB_PASSWORD=YOUR_SECURE_PASSWORD
DB_NAME=SprintDB
DB_PORT=3306
PORT=3000
JWT_SECRET=your-super-secure-production-secret-key
JWT_EXPIRES_IN=7d
```

### تشغيل الـ Backend
```bash
# بناء المشروع
npm run build

# تشغيل بـ PM2
pm2 start dist/main.js --name "sprint-backend"
pm2 save
pm2 startup
```

---

## 4. إعداد الـ Frontend

```bash
cd /var/www/sprint_store/frontend

# تثبيت الـ dependencies
npm install

# بناء المشروع
npm run build

# تشغيل بـ PM2
pm2 start npm --name "sprint-frontend" -- start -- -p 3001
pm2 save
```

---

## 5. إعداد Nginx (اختياري - للـ Domain)

```bash
sudo apt install -y nginx

# إنشاء ملف الإعدادات
sudo nano /etc/nginx/sites-available/sprint
```

### محتوى ملف Nginx:
```nginx
server {
    listen 80;
    server_name 104.234.26.192;

    # Frontend
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api {
        rewrite ^/api(.*)$ $1 break;
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend uploads
    location /uploads {
        proxy_pass http://localhost:3000/uploads;
    }
}
```

```bash
# تفعيل الموقع
sudo ln -s /etc/nginx/sites-available/sprint /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## 6. فتح الـ Firewall

```bash
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw allow 3000
sudo ufw allow 3001
sudo ufw enable
```

---

## 7. الوصول للموقع

- **Frontend**: http://104.234.26.192:3001
- **Backend API**: http://104.234.26.192:3000
- **Admin Panel**: http://104.234.26.192:3001/admin

---

## أوامر مفيدة

```bash
# عرض حالة التطبيقات
pm2 status

# عرض الـ logs
pm2 logs sprint-backend
pm2 logs sprint-frontend

# إعادة تشغيل
pm2 restart sprint-backend
pm2 restart sprint-frontend

# إيقاف
pm2 stop all
```

---

## ملاحظات مهمة

1. **تغيير كلمات المرور**: تأكد من تغيير كلمات المرور الافتراضية
2. **SSL**: يُنصح بإضافة شهادة SSL باستخدام Let's Encrypt
3. **Backup**: قم بعمل نسخ احتياطية دورية لقاعدة البيانات
4. **Updates**: حافظ على تحديث النظام والـ packages
