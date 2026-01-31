<<<<<<< HEAD
# 🛍️ Sprint E-Commerce

متجر إلكتروني متكامل مع لوحة تحكم احترافية

## 📋 المتطلبات

- **Node.js** 20 أو أحدث
- **MySQL Server** 8.0
- **npm** (يأتي مع Node.js)
- **Windows PowerShell**

## 🚀 التثبيت السريع

### 1️⃣ تثبيت MySQL Server

1. حمّل MySQL من: https://dev.mysql.com/downloads/installer/
2. اختر: `mysql-installer-community-8.0.40.0.msi`
3. شغّل المثبت واتبع التعليمات
4. احفظ كلمة مرور root

### 2️⃣ إعداد المشروع

```powershell
# انتقل إلى مجلد المشروع
cd "c:\New folder\Sprint_e-commerce"

# شغّل سكريبت الإعداد التلقائي
.\setup.ps1
```

سيقوم السكريبت بـ:
- ✅ التحقق من Node.js و MySQL
- ✅ إنشاء ملف `.env`
- ✅ تثبيت جميع dependencies

### 3️⃣ إنشاء قاعدة البيانات

```powershell
# شغّل سكريبت قاعدة البيانات
.\setup-database.ps1
```

أو يدوياً:
```powershell
mysql -u root -p < ..\s.sql
```

### 4️⃣ تشغيل المشروع

```powershell
# شغّل Backend و Frontend معاً
.\start.ps1
```

## 🌐 الوصول للمشروع

| الخدمة | الرابط | الوصف |
|--------|--------|-------|
| **المتجر** | http://localhost:3001 | الواجهة الأمامية للمتجر |
| **لوحة التحكم** | http://localhost:3001/admin | لوحة إدارة المتجر |
| **Backend API** | http://localhost:3000 | REST API |

### 🔐 بيانات الدخول

**لوحة التحكم:**
- Email: `admin@sprint.com`
- Password: `admin123`

## 📁 هيكل المشروع

```
Sprint_e-commerce/
├── backend/              # NestJS Backend
│   ├── src/
│   │   ├── auth/        # المصادقة
│   │   ├── products/    # المنتجات
│   │   ├── categories/  # الفئات
│   │   ├── companies/   # الشركات
│   │   ├── orders/      # الطلبات
│   │   └── upload/      # رفع الصور
│   ├── uploads/         # الصور المرفوعة
│   └── .env            # إعدادات قاعدة البيانات
│
├── frontend/            # Next.js Frontend
│   ├── src/
│   │   ├── app/        # الصفحات
│   │   └── components/ # المكونات
│   └── public/         # الملفات الثابتة
│
├── setup.ps1           # سكريبت الإعداد
├── start.ps1           # سكريبت التشغيل
└── setup-database.ps1  # سكريبت قاعدة البيانات
```

## 🛠️ الأوامر المفيدة

### Backend

```powershell
cd backend

# تشغيل وضع التطوير
npm run start:dev

# بناء المشروع
npm run build

# تشغيل الإنتاج
npm run start:prod
```

### Frontend

```powershell
cd frontend

# تشغيل وضع التطوير
npm run dev

# بناء المشروع
npm run build

# تشغيل الإنتاج
npm start
```

## 🎨 المميزات

- ✅ **نظام المنتجات:** إدارة كاملة للمنتجات مع الصور والألوان
- ✅ **التصنيف الهرمي:** فئات وفئات فرعية
- ✅ **إدارة الشركات:** شركات فاخرة مع لوجوهات
- ✅ **نظام الطلبات:** تتبع وإدارة الطلبات
- ✅ **رفع الصور:** نظام متكامل لرفع الصور
- ✅ **لوحة تحكم تفاعلية:** إحصائيات وإدارة شاملة
- ✅ **تصميم عصري:** Tailwind CSS + GSAP Animations
- ✅ **واجهة عربية:** دعم كامل للغة العربية (RTL)

## 🔧 حل المشاكل

### MySQL لا يعمل
```powershell
# تشغيل خدمة MySQL
net start MySQL80

# أو عبر Services
services.msc
```

### Port مستخدم
```powershell
# إيقاف العملية على Port 3000
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### خطأ في الاتصال بقاعدة البيانات
1. تحقق من ملف `.env` في مجلد backend
2. تأكد من صحة كلمة المرور
3. تأكد من تشغيل MySQL Server
4. تحقق من إنشاء قاعدة البيانات `SprintDB`

## 📊 قاعدة البيانات

### الجداول الرئيسية:
- `users` - المستخدمين
- `categories` - الفئات
- `subcategories` - الفئات الفرعية
- `companies` - الشركات
- `products` - المنتجات
- `product_colors` - ألوان المنتجات
- `orders` - الطلبات
- `order_items` - عناصر الطلبات
- `settings` - إعدادات الموقع

## 🔄 التحديثات المستقبلية

- [ ] نظام الدفع الإلكتروني
- [ ] تتبع الشحنات
- [ ] نظام التقييمات والمراجعات
- [ ] تطبيق الموبايل
- [ ] نظام الإشعارات

## 📝 الترخيص

هذا المشروع للاستخدام التعليمي والتجريبي.

## 👨‍💻 المطور

تم تطوير هذا المشروع باستخدام:
- **Backend:** NestJS + MySQL
- **Frontend:** Next.js + React + TypeScript
- **Styling:** Tailwind CSS
- **Animations:** GSAP

---

**© 2026 Sprint Store. جميع الحقوق محفوظة**

<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
