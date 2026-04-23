# E-Commerce Frontend

Next.js 14 frontend for the e-commerce platform.

## Features

- **Next.js 14** - App Router with Server Components
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - Beautiful UI components
- **Framer Motion** - Smooth animations
- **Custom Backend API** - Express.js backend with PostgreSQL
- **Stripe** - Payment processing

## Setup

1. Install dependencies:
```bash
pnpm install
```

2. Set up environment variables:
```bash
cp .env.example .env
```

3. Start the development server:
```bash
pnpm dev
```

The app will be available at `http://localhost:3000`

## Environment Variables

- `NEXT_PUBLIC_BACKEND_URL` - Backend API URL (default: http://localhost:9000)
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe publishable key

## Adding shadcn/ui Components

To add new shadcn/ui components:

```bash
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add dialog
```

## Project Structure

```
src/
├── app/              # Next.js 14 app directory
│   ├── (store)/      # Store pages
│   ├── (checkout)/   # Checkout flow
│   └── layout.tsx    # Root layout
├── components/       # React components
│   ├── ui/           # shadcn/ui components
│   ├── cart/         # Cart components
│   └── product/      # Product components
├── lib/              # Utilities
│   ├── api.ts        # API client configuration
│   └── utils.ts      # Utility functions
└── styles/           # Global styles
```

## Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
