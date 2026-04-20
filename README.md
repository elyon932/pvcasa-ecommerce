# PV Casa Ecommerce

Production-oriented ecommerce for PV Casa, built for a real retail workflow with a polished storefront, customer account area, admin dashboard, and a codebase sized appropriately for the business.

## Highlights

- Next.js 16 App Router with Tailwind CSS 4
- PostgreSQL-ready relational model with Prisma
- Separate admin and customer authentication flows with Auth.js
- Search and filter flow with similarity matching over product names and descriptions
- Customer account with order history and profile details
- Admin dashboard for products, categories, homepage content, and orders
- Stripe-ready payment flow with demo fallback when keys are not configured
- Local brand assets and social icons, with remote photography for banners and category cards

## Routes

- `/` storefront homepage focused on products, pricing, promotions, and categories
- `/shop` searchable catalog with filters and sorting
- `/products/[slug]` product detail page
- `/cart` cart with client-side persistence
- `/checkout` checkout flow
- `/checkout/success` post-checkout confirmation page
- `/account/login` customer login
- `/account` customer account area
- `/admin/login` admin login
- `/admin/*` admin dashboard, products, categories, content, and orders

## Local development

1. Copy `.env.example` to `.env`
2. Set `DATABASE_URL`, `NEXTAUTH_SECRET`, and integration keys if available
3. Install dependencies
4. Generate the Prisma client
5. Sync the database schema
6. Run the development server

```bash
npm install
npm run prisma:generate
npx prisma db push
npm run dev
```

If you want to create a development migration instead of a direct schema push:

```bash
npm run prisma:migrate
```

## Demo credentials

Admin:
- Email: `admin@pvcasa.com.br`
- Password: `admin123`

Customer:
- Email: `ana@pvcasa.com`
- Password: `cliente123`

Replace the admin credentials in production through `ADMIN_EMAIL` and `ADMIN_PASSWORD_HASH`.

For the contact form to send emails automatically from the server, configure:
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`
- `SMTP_FROM`
- `CONTACT_EMAIL_TO`

With these values present, `/contact` submits directly to `/api/contact` and the message is delivered server-side through Nodemailer without opening external mail apps.

## Quality checks

```bash
npm run lint
npm run test
npm run build
```

## Notes

- Without `DATABASE_URL`, the project falls back to rich mock data for the storefront, account area, and admin dashboard.
- Without `STRIPE_SECRET_KEY`, checkout stays functional in demo mode and redirects to the local success page.
- Brand assets are served from `public/brand`, and the original import folder is no longer required.
- Social icons are served from `public/social`.
