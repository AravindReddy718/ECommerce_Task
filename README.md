# Everyday & Co. — Modern Full-Stack E-Commerce Platform

**Everyday & Co.** is a production-ready, full-stack multi-vendor e-commerce platform built on the MERN stack. Designed with a warm terracotta aesthetic, it features a curated lifestyle landing page, end-to-end customer purchasing flows with Razorpay payment processing, dedicated seller management dashboards, administrative approvals, and a secure authentication suite (Firebase Google OAuth, JWT, and Nodemailer password recovery).

---

## Table of Contents

- [Live Highlights & Features](#live-highlights--features)
  - [🛍️ Customer Experience](#️-customer-experience)
  - [🏪 Seller Dashboard & Operations](#-seller-dashboard--operations)
  - [🛡️ Admin Console & Governance](#️-admin-console--governance)
  - [🔐 Authentication & Security](#-authentication--security)
- [Architecture & Tech Stack](#architecture--tech-stack)
- [Project Directory Structure](#project-directory-structure)
- [Environment Configuration](#environment-configuration)
  - [Backend (`server/.env`)](#backend-serverenv)
  - [Frontend (`client/.env`)](#frontend-clientenv)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [1. Backend Setup](#1-backend-setup)
  - [2. Frontend Setup](#2-frontend-setup)
- [API Reference](#api-reference)
  - [Authentication (`/api/auth`)](#authentication-apiauth)
  - [Products (`/api/products`)](#products-apiproducts)
  - [Orders & Checkout (`/api/orders`)](#orders--checkout-apiorders)
  - [Administration (`/api/admin`)](#administration-apiadmin)



---

## Live Highlights & Features

### 🛍️ Customer Experience
- **Curated Landing Page**: Editorial lifestyle hero showcase, featured collections, curated essentials, and community benefits.
- **Dynamic Product Catalog**: Search by title or description, filter by category and price range, toggle in-stock items, and sort by price.
- **Product Quick View**: Interactive modal for inspecting high-resolution photos, inventory availability, and product details without navigating away.
- **Cart & Local Persistence**: Real-time cart state with quantity increments/decrements, item removal, price breakdowns, and user-scoped `localStorage` persistence.
- **Checkout & Payments**: Integrated Razorpay gateway supporting Cards, UPI, NetBanking, and Cash on Delivery (COD).
- **Order Tracking & History**: Visual order timeline tracking stages from `Placed` &rarr; `Processing` &rarr; `Shipped` &rarr; `Delivered`.

### 🏪 Seller Dashboard & Operations
- **Business Performance Analytics**: Live overview cards tracking total store revenue, order volume, and published products.
- **Inventory Management**: Create, update, toggle stock, and delete product listings with image URLs and category assignments.
- **Order Fulfillment**: Track customer purchases containing seller items, view shipping destinations, and update fulfillment progress.
- **Seller Approval System**: Newly registered sellers are placed in pending state until reviewed and approved by administrators.

### 🛡️ Admin Console & Governance
- **Platform Analytics**: High-level platform metrics covering total system revenue, orders, active customers, and sellers.
- **Seller Verification**: Review pending seller applications with store details, approve accounts, or reject applications.
- **Account Management**: View system accounts, manage roles, and review platform permissions.

### 🔐 Authentication & Security
- **Role-Based Access Control (RBAC)**: Distinct permissions for `customer`, `seller`, and `admin` users enforced via JWT middleware.
- **Google OAuth Integration**: One-click Google sign-in using Firebase Authentication with backend token verification and automatic profile creation.
- **Password Recovery via Nodemailer**: Secure, time-limited SHA-256 tokens (1-hour validity) dispatched via branded HTML emails, with terminal fallback logging for local development.
- **Password Management**: In-app password update dialog with current password verification and bcrypt hashing.

---

## Architecture & Tech Stack

```
   ┌────────────────────────────────────────────────────────┐
   │                  Everyday & Co. Client                 │
   │           React 19 • Vite • Modular CSS Modules        │
   └───────────────┬────────────────────────▲───────────────┘
                   │ HTTP / REST            │
                   ▼                        │
   ┌────────────────────────────────────────┴───────────────┐
   │                  Node.js / Express 5 API               │
   │       JWT Auth • Mongoose 9 • Nodemailer • Razorpay    │
   └───────────────┬────────────────────────▲───────────────┘
                   │                        │
       ┌───────────┴───────────┐    ┌───────┴───────────────┐
       │   MongoDB Database    │    │   Third-Party APIs    │
       │   Atlas / Local DB    │    │  • Razorpay Payments  │
       │  (Users, Products,    │    │  • Firebase Google    │
       │        Orders)        │    │  • Gmail SMTP Service │
       └───────────────────────┘    └───────────────────────┘
```

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, Vite 8, Native Modular CSS (`landing.css`, `auth.css`, `customer.css`, `seller.css`, `admin.css`), SVG Icons system, Context API (Toast system) |
| **Backend** | Node.js, Express 5, Mongoose 9, JWT (`jsonwebtoken`), Bcrypt.js, CORS, Dotenv, Nodemon |
| **Database** | MongoDB Atlas (or local MongoDB community instance) |
| **Payments** | Razorpay Node SDK & Razorpay Checkout.js modal |
| **Authentication** | Firebase Client SDK (Google Provider), Firebase Admin, Custom JWT RBAC |
| **Email Delivery** | Nodemailer (Gmail SMTP with development terminal fallback) |

---

## Project Directory Structure

```text
ECommerce_Task/
├── client/                     # Vite + React Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── admin/          # Admin Dashboard & Seller Approvals
│   │   │   ├── common/         # Navbar, Modals, Toast system, SVG Icons
│   │   │   ├── customer/       # Catalog, Cart, Order History, QuickView
│   │   │   ├── landing/        # Everyday & Co. Editorial Landing Page
│   │   │   ├── seller/         # Seller Inventory & Order Management
│   │   │   ├── AuthForm.jsx    # Unified Sign In / Register / Password Reset
│   │   │   ├── ChangePasswordForm.jsx
│   │   │   └── CheckoutForm.jsx
│   │   ├── config/             # Firebase client configuration
│   │   ├── styles/             # Modular CSS stylesheets per view
│   │   ├── App.jsx             # Top-level view routing & auth state
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── server/                     # Express.js REST API
│   ├── config/                 # Firebase Admin & DB configuration
│   ├── controllers/            # Request handlers
│   ├── middleware/             # JWT auth & role-checking middleware
│   ├── models/                 # Mongoose schemas (User, Product, Order)
│   ├── routes/                 # Express API route modules
│   │   ├── adminRoutes.js
│   │   ├── authRoutes.js
│   │   ├── orderRoutes.js
│   │   └── productRoutes.js
│   ├── utils/                  # Nodemailer utility & branded HTML email templates
│   ├── nodemon.json            # Auto-restarts on .env & source changes
│   ├── package.json
│   └── server.js               # Server entry point & MongoDB connection
│
└── README.md
```

---

## Environment Configuration

### Backend (`server/.env`)

Create a `.env` file in the `server/` directory:

```env
# Database & Authentication
PORT=5001
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/e-commerce
JWT_SECRET=your_super_secret_jwt_key_here

# Payment Gateway (Razorpay Test or Live Keys)
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxxxxx

# Firebase Authentication (Google Sign-In)
FIREBASE_PROJECT_ID=everyday-and-co

# Email Delivery (Nodemailer via Gmail SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_16_digit_google_app_password
EMAIL_FROM="Everyday & Co. <your_email@gmail.com>"
CLIENT_URL=http://localhost:5173
```

> [!TIP]
> **Gmail App Password**: If using Gmail SMTP, generate a 16-character Google App Password from **Google Account &rarr; Security &rarr; 2-Step Verification &rarr; App passwords**.

### Frontend (`client/.env`)

Create a `.env` file in the `client/` directory:

```env
# Firebase Client Credentials for Google OAuth
VITE_FIREBASE_API_KEY=AIzaSyxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
VITE_FIREBASE_AUTH_DOMAIN=everyday-and-co.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=everyday-and-co
VITE_FIREBASE_STORAGE_BUCKET=everyday-and-co.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=xxxxxxxxxxxx
VITE_FIREBASE_APP_ID=1:xxxxxxxxxxxx:web:xxxxxxxxxxxxxxxx
```

---

## Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **MongoDB**: A running MongoDB Atlas URI or local MongoDB instance

---

### 1. Backend Setup

1. Open a terminal and navigate to the `server` folder:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Ensure `server/.env` is configured with your MongoDB URI and secrets.
4. Launch the development server (runs on `http://localhost:5001`):
   ```bash
   npm run dev
   ```

---

### 2. Frontend Setup

1. Open a separate terminal and navigate to the `client` folder:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server (runs on `http://localhost:5173`):
   ```bash
   npm run dev
   ```
4. Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## API Reference

### Authentication (`/api/auth`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register customer or seller account | Public |
| `POST` | `/api/auth/login` | Email/password sign-in | Public |
| `POST` | `/api/auth/google` | Google OAuth token verification & sign-in | Public |
| `POST` | `/api/auth/forgot-password` | Generate reset token & send email | Public |
| `POST` | `/api/auth/reset-password` | Validate token and set new password | Public |
| `POST` | `/api/auth/change-password` | Update password while authenticated | Authenticated |

### Products (`/api/products`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/products` | Retrieve catalog with search & category filters | Public |
| `GET` | `/api/products/seller` | Retrieve products owned by authenticated seller | Seller / Admin |
| `POST` | `/api/products` | Add a new product listing | Approved Seller |
| `PUT` | `/api/products/:id` | Update an existing product | Owner / Admin |
| `DELETE` | `/api/products/:id` | Remove a product listing | Owner / Admin |

### Orders & Checkout (`/api/orders`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/orders` | Create order & initialize Razorpay payment | Customer |
| `POST` | `/api/orders/verify` | Verify Razorpay HMAC signature | Customer |
| `GET` | `/api/orders/my-orders` | Fetch logged-in customer's order history | Customer |
| `GET` | `/api/orders/seller-orders` | Fetch orders containing seller's goods | Seller |
| `PATCH`| `/api/orders/:id/status` | Update fulfillment status (`processing`, `shipped`, etc.) | Seller / Admin |

### Administration (`/api/admin`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/admin/stats` | System metrics (revenue, counts) | Admin |
| `GET` | `/api/admin/pending-sellers` | List sellers awaiting store approval | Admin |
| `POST` | `/api/admin/approve-seller/:id` | Approve seller account | Admin |
| `POST` | `/api/admin/reject-seller/:id` | Reject seller account | Admin |

---

## Database Models

### User Model (`server/models/User.js`)
- `name`: Full name string
- `email`: Normalized unique email address
- `password`: Bcrypt hashed password (optional if Google OAuth is used)
- `role`: Enum `['customer', 'seller', 'admin']` (defaults to `'customer'`)
- `sellerApproved`: Boolean flag for seller store authorization
- `passwordResetTokenHash`: SHA-256 hashed password reset token
- `passwordResetExpires`: Timestamp indicating token expiration (1 hour)

### Product Model (`server/models/Product.js`)
- `title`: Name of the item
- `description`: Detailed description
- `price`: Numeric price in INR (₹)
- `category`: Category string (e.g., Home, Lifestyle, Apparel)
- `imageUrl`: Image resource URL
- `stock`: Current quantity in stock
- `seller`: Reference ObjectId (`User`)

### Order Model (`server/models/Order.js`)
- `user`: Reference ObjectId (`User`)
- `items`: Array of ordered products, quantities, and price snapshots
- `totalAmount`: Final calculated order cost
- `shippingAddress`: Customer delivery address object
- `paymentMethod`: `razorpay` or `cod`
- `paymentStatus`: `pending`, `completed`, or `failed`
- `orderStatus`: `placed`, `processing`, `shipped`, `delivered`, `cancelled`


