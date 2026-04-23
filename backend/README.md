# Magnetix Backend

Express.js + PostgreSQL backend for Magnetix Tech E-commerce Store.

## Features

- **Products API** - CRUD operations with variants support
- **Categories API** - Product categorization
- **Cart API** - Shopping cart management
- **Orders API** - Order processing and tracking
- **Authentication** - Admin login

## Tech Stack

- Express.js
- PostgreSQL
- TypeScript
- bcryptjs for password hashing

## Setup

1. **Install PostgreSQL** and create a database:
```bash
createdb magnetix_store
```

2. **Install dependencies:**
```bash
npm install
```

3. **Configure environment:**
```bash
cp .env.example .env
# Edit .env with your database credentials
```

4. **Seed the database:**
```bash
npm run seed
```

5. **Start the server:**
```bash
npm run dev
```

## Default Admin

- **Email:** zaid@magnetix.com
- **Password:** 12341234

## API Endpoints

### Authentication
- `POST /auth/login` - Admin login
- `POST /auth/register` - User registration

### Products (Public)
- `GET /store/products` - List products
- `GET /store/products/:id` - Get product

### Products (Admin)
- `POST /admin/products` - Create product
- `PUT /admin/products/:id` - Update product
- `DELETE /admin/products/:id` - Delete product

### Categories
- `GET /store/collections` - List categories
- `GET /store/collections/:id/products` - Products by category

### Cart
- `POST /store/carts` - Create cart
- `GET /store/carts/:id` - Get cart
- `POST /store/carts/:id/line-items` - Add item
- `DELETE /store/carts/:id/line-items/:itemId` - Remove item

### Orders
- `POST /store/orders` - Create order
- `GET /store/orders/:id` - Get order
- `GET /admin/orders` - List all orders (admin)
- `PUT /admin/orders/:id/status` - Update order status (admin)

## Scripts

- `npm run dev` - Development server
- `npm run build` - Build for production
- `npm run start` - Production server
- `npm run seed` - Seed database

Server runs on `http://localhost:9000` by default.
