# 🛒 ShopKart — Full-Stack E-Commerce Platform

A modern, full-stack MERN e-commerce application built for the **ShopKart Engineering Labs (01 — 06)**. The platform features end-to-end customer authentication, a browsable product catalog with filtering/sorting, a reactive wishlist, a global cart engine, and a complete checkout workflow integrated with Razorpay.

---

## 🚀 Lab Modules Overview

| Lab Module | Scope & Implementation |
| :--- | :--- |
| **Lab 01: Customer Authentication Service** | REST APIs for Registration, Login, Profile retrieval, Logout, and Password update using JWT stored in secure `httpOnly` cookies and `bcrypt` password hashing. |
| **Lab 02: Frontend Authentication & Navigation** | Client-side Login, Register, and Profile screens with session-aware headers and protected routes. |
| **Lab 03: Product Catalog Engine** | MongoDB product schema, automated database seeder (`seedProducts.js`), category filtering, price sorting, search, and responsive product cards. |
| **Lab 04: Wishlist Management** | Wishlist state management allowing customers to save, inspect, and toggle favorite items. |
| **Lab 05: Cart Engine & State Management** | Global Cart Context (`CartContext.jsx`) with live quantity management, dynamic subtotal calculations, and stock availability safeguards. |
| **Lab 06: Checkout & Razorpay Integration** | Server-side Razorpay order creation, client-side Razorpay modal with seamless test payment flow, signature verification, and order history tracking. |

---

## 🛠️ Tech Stack

- **Frontend:** React 19, Vite, React Router v7, Axios, Modern Responsive CSS
- **Backend:** Node.js, Express.js (ES Modules), MongoDB Atlas, Mongoose
- **Authentication & Security:** JSON Web Tokens (JWT), `cookie-parser`, `bcrypt`
- **Payment Gateway:** Razorpay Node.js SDK & Razorpay Standard Checkout SDK

---

## 📁 Project Structure

```text
ShopKart_Lab/
├── backend/
│   ├── config/
│   │   └── db.js                 # Mongoose connection logic
│   ├── controllers/
│   │   ├── auth.controller.js    # Register, login, profile, logout, change-password
│   │   ├── cart.controller.js    # Persistent cart endpoints
│   │   ├── order.controller.js   # Razorpay order generation & capture
│   │   └── product.controller.js # Product catalog queries & filters
│   ├── middleware/
│   │   └── auth.middleware.js    # JWT cookie verification middleware
│   ├── models/
│   │   ├── customer.model.js     # Customer user schema
│   │   ├── order.model.js        # Checkout order schema
│   │   └── product.model.js      # E-commerce product schema
│   ├── routes/
│   │   ├── auth.routes.js        # /customers endpoints
│   │   ├── cart.routes.js        # /cart endpoints
│   │   ├── order.routes.js       # /orders endpoints
│   │   └── product.routes.js     # /products endpoints
│   ├── .env.example              # Sample environment template (NO secrets)
│   ├── index.js                  # Express server entry point & CORS configuration
│   ├── seedProducts.js           # Database seeder script
│   └── package.json
│
├── front-end/
│   └── vite-project/
│       ├── src/
│       │   ├── context/
│       │   │   └── CartContext.jsx   # Global cart state (add, remove, quantity, totals)
│       │   ├── pages/
│       │   │   ├── Cart.jsx          # Shopping cart with quantity & checkout triggers
│       │   │   ├── Checkout.jsx      # Shipping address form & Razorpay payment handler
│       │   │   ├── Home.jsx          # Landing page with hero banner & highlights
│       │   │   ├── Login.jsx         # Customer login form
│       │   │   ├── Orders.jsx        # Customer order history
│       │   │   ├── Products.jsx      # Catalog with search, filter, and sort
│       │   │   ├── Profile.jsx       # Customer profile view
│       │   │   ├── Register.jsx      # Customer registration form
│       │   │   └── Wishlist.jsx      # Saved items view
│       │   ├── App.jsx               # Routes and layout composition
│       │   ├── main.jsx              # Application bootstrap with CartProvider
│       │   └── index.css             # Global UI styles
│       └── package.json
│
├── .gitignore                    # Root ignore file (protects .env and node_modules)
└── README.md
```

---

## ⚙️ Getting Started

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account or local MongoDB instance
- [Razorpay Account](https://dashboard.razorpay.com/) (Test mode API keys)

---

### 2. Backend Setup

1. Open your terminal and navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install backend dependencies:
   ```bash
   npm install
   ```

3. Create your `.env` configuration file from the template:
   ```bash
   cp .env.example .env
   ```

4. Populate the `.env` variables:
   ```env
   MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/shopkart?appName=ShopKart
   JWT_SECRET=your_jwt_secret_key
   RAZORPAY_KEY_ID=rzp_test_your_key_id
   RAZORPAY_KEY_SECRET=your_razorpay_secret
   ```

5. Seed the database with sample products across various categories:
   ```bash
   npm run seed
   ```

6. Start the backend development server:
   ```bash
   npm run dev
   ```
   *The server runs by default on `http://localhost:5000`.*

---

### 3. Frontend Setup

1. In a new terminal window, navigate to the frontend directory:
   ```bash
   cd front-end/vite-project
   ```

2. Install frontend dependencies:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *The frontend application will be live at `http://localhost:5173`.*

---

## 📡 API Reference Summary

### Authentication (`/customers`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/customers/register` | Register a new customer | No |
| `POST` | `/customers/login` | Authenticate customer and set HTTP-only cookie | No |
| `GET` | `/customers/profile` | Retrieve authenticated customer profile | Yes (Cookie) |
| `POST` | `/customers/logout` | Clear session cookie | Yes (Cookie) |
| `PATCH` | `/customers/change-password` | Update account password | Yes (Cookie) |

### Products (`/products`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/products` | List products with optional search, category, sort | No |
| `GET` | `/products/:id` | Fetch specific product details | No |
| `POST` | `/products` | Create product (admin / seed) | No |

### Orders & Payments (`/orders`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/orders/create-razorpay-order` | Generates a valid Razorpay order ID | Yes (Cookie) |
| `POST` | `/orders/verify-payment` | Validates HMAC signature & records the order | Yes (Cookie) |
| `GET` | `/orders/my-orders` | Fetches purchase history for customer | Yes (Cookie) |

---

## 🔒 Security & Best Practices

- **Zero Secret Leaks:** `.env` and sensitive files are excluded from Git via root and submodule `.gitignore`.
- **Credential Storage:** All passwords hashed with salt using `bcrypt`.
- **Session Security:** Token stored in `httpOnly`, `SameSite=lax` cookies to protect against XSS token harvesting.
- **Payment Verification:** Webhook/callback signatures verified using crypto HMAC SHA256 before finalizing orders.

---

## 👨‍💻 Author
- **DevRitik19**
- GitHub: [https://github.com/DevRitik19/ShopKart](https://github.com/DevRitik19/ShopKart)
