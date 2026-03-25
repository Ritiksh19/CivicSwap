# CivicSwap 🏘️

### Hyper-Local Resource Exchange Platform

> **A community-driven web platform enabling neighbors to lend, borrow, and gift everyday items and services — without ever leaving their neighborhood.**

![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8.0-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-CDN-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-Auth-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)
![Leaflet](https://img.shields.io/badge/Leaflet.js-Maps-199900?style=for-the-badge&logo=leaflet&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-Frontend-000000?style=for-the-badge&logo=vercel&logoColor=white)
![Railway](https://img.shields.io/badge/Railway-Backend-0B0D0E?style=for-the-badge&logo=railway&logoColor=white)
![Brevo](https://img.shields.io/badge/Brevo-Email-0B996E?style=for-the-badge&logo=sendinblue&logoColor=white)

---

## 📖 About

CivicSwap addresses a common urban coordination failure: households collectively own enormous quantities of items (tools, kitchenware, books, camping gear, appliances) that sit unused 95% of the time, while neighbors spend money buying or renting those very same items nearby.

CivicSwap transforms idle household resources into shared community capital by connecting neighbors through a structured, trustworthy platform anchored to real geographic locations.

---

## 🌐 Live Demo

| Service          | URL                                                 |
| ---------------- | --------------------------------------------------- |
| **Frontend**     | https://civicswap-frontend.vercel.app               |
| **Backend API**  | https://civicswap-backend.up.railway.app/api        |
| **Health Check** | https://civicswap-backend.up.railway.app/api/health |

---

## ✨ Features

- 🗺️ **Hyper-Local Discovery** — Interactive Leaflet.js map with adjustable radius (0.5–10 km) to find available items near your location
- 🔄 **Borrow Lifecycle Management** — Structured 6-state workflow: Request → Approval → ON_LOAN → Return → Rating → Closed
- ⭐ **Reputation & Rating System** — Transparent trust scores calculated as weighted averages from completed transactions
- 📧 **Automated Email Notifications** — Brevo REST API triggers emails at every stage of the borrow lifecycle
- 🔍 **Search & Category Filters** — Find items by keyword, category (Tools, Books, Kitchenware, Electronics, etc.), distance, or date
- 📱 **Responsive UI** — Premium Airbnb-inspired design with parallax, hover effects, and smooth transitions — works on desktop, tablet, and mobile
- 🔒 **JWT Authentication** — Secure stateless session management with bcrypt password hashing
- 📍 **Browser Geolocation** — Auto-detect user location during registration and item posting
- 🛡️ **Overlap Validation** — Prevents double-booking of items on conflicting dates

---

## 🧱 Tech Stack

| Layer                  | Technology                                         |
| ---------------------- | -------------------------------------------------- |
| **Frontend Framework** | React 18 + Vite                                    |
| **Styling**            | Tailwind CSS (CDN)                                 |
| **Maps**               | Leaflet.js + React-Leaflet + MongoDB `$nearSphere` |
| **Backend**            | Node.js + Express.js                               |
| **Database**           | MongoDB + Mongoose (MongoDB Atlas)                 |
| **Authentication**     | JWT (jsonwebtoken) + bcryptjs                      |
| **Email Service**      | Brevo REST API (via Axios over HTTPS)              |
| **HTTP Client**        | Axios (frontend + backend)                         |
| **Frontend Hosting**   | Vercel                                             |
| **Backend Hosting**    | Railway                                            |
| **Version Control**    | Git & GitHub                                       |
| **API Testing**        | Thunder Client (VS Code Extension)                 |
| **IDE**                | Visual Studio Code                                 |

---

## 🗂️ System Modules

1. **User Authentication** — Registration, login, JWT session management, home location setup (lat/lng via browser Geolocation API)
2. **Geographic Discovery** — Leaflet.js interactive map, radius-based item filtering using MongoDB `$nearSphere`, adjustable radius slider (0.5–10 km)
3. **Item Management** — Post/edit listings with title, description, category, location, and status (AVAILABLE / ON_LOAN / UNAVAILABLE)
4. **Borrow Lifecycle** — 6-state machine: PENDING → APPROVED → ON_LOAN → RETURNED → CLOSED (or REJECTED); conflict detection for overlapping bookings
5. **Reputation & Rating** — Star ratings (1–5) after each completed transaction; weighted average reputation scores displayed on user profiles
6. **Notifications** — Automated emails via Brevo REST API for request submission, approval/rejection, return confirmation, and rating prompts
7. **Database Management** — MongoDB with Mongoose ODM, 2dsphere geo-indexes, FK-style references, and scheduling conflict validation
8. **Search & Filter** — Keyword search, category filter, sort by distance, integrated with geographic radius
9. **Responsive UI** — Premium dark-themed dashboard with item cards, status badges, transaction history, map view, and user profiles

---

## 📁 Project Structure

```
CivicSwap/
├── civicswap-backend/
│   ├── config/
│   │   └── db.js                    # MongoDB Atlas connection
│   ├── models/
│   │   ├── User.js                  # User schema with geo-location + bcrypt
│   │   ├── Item.js                  # Item schema with 2dsphere index
│   │   ├── Transaction.js           # 6-state lifecycle model
│   │   └── Rating.js                # Rating with unique constraint
│   ├── controllers/
│   │   ├── authController.js        # Register, login, profile
│   │   ├── itemController.js        # CRUD + geo-filter
│   │   ├── transactionController.js # Full borrow lifecycle + email triggers
│   │   └── ratingController.js      # Ratings + auto reputation update
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── itemRoutes.js
│   │   ├── transactionRoutes.js
│   │   └── ratingRoutes.js
│   ├── middleware/
│   │   └── authMiddleware.js        # JWT token verification
│   ├── utils/
│   │   ├── sendEmail.js             # Brevo REST API email utility
│   │   └── keepAlive.js             # Health ping utility
│   ├── .env
│   └── server.js
│
└── civicswap-frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.jsx            # Auth-aware navbar with scroll effect
    │   │   ├── ItemCard.jsx
    │   │   └── ProtectedRoute.jsx    # JWT-protected route wrapper
    │   ├── context/
    │   │   └── AuthContext.jsx       # Global JWT + user state
    │   ├── pages/
    │   │   ├── HomePage.jsx          # Parallax hero, stats, features
    │   │   ├── LoginPage.jsx         # Split layout with animated form
    │   │   ├── RegisterPage.jsx      # Geolocation-enabled registration
    │   │   ├── DashboardPage.jsx     # Stats cards + recent activity
    │   │   ├── ItemListPage.jsx      # Search + filter + geo-sorted grid
    │   │   ├── ItemDetailPage.jsx    # Item info + borrow request form
    │   │   ├── CreateItemPage.jsx    # Category selector + location detect
    │   │   ├── EditItemPage.jsx      # Pre-filled form + status toggle
    │   │   ├── MapPage.jsx           # Leaflet.js map + radius slider
    │   │   ├── ProfilePage.jsx       # Reputation + items + reviews
    │   │   ├── EditProfilePage.jsx   # Name, bio, password, location
    │   │   ├── TransactionPage.jsx   # Activity + incoming requests tabs
    │   │   └── RatingPage.jsx        # Interactive star rating
    │   └── utils/
    │       └── axios.js              # Axios instance with JWT injection
    ├── vercel.json                   # SPA routing fix for Vercel
    └── index.html
```

---

## ⚙️ Hardware Requirements

- Computer/Laptop with minimum **4 GB RAM** (8 GB recommended)
- **Internet connection** (for APIs, map tiles, MongoDB Atlas, deployment)
- Minimum **20 GB free disk space** for development environment and database
- Smartphone _(optional)_ — for testing the responsive mobile interface

## 💻 Software Requirements

- **OS:** Windows 10/11 / Ubuntu 20.04+ / macOS
- **Runtime:** Node.js 18+
- **Package Manager:** npm
- **Database:** MongoDB 6+ (local) or MongoDB Atlas (cloud)
- **Git** & GitHub
- **Web Browser:** Google Chrome / Mozilla Firefox

---

## 🚀 Getting Started

### Prerequisites

Make sure you have Node.js 18+ and npm installed:

```bash
node --version
npm --version
```

### Backend Setup

```bash
# 1. Clone the repository
git clone https://github.com/<your-username>/civicswap.git
cd civicswap/civicswap-backend

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env
# Edit .env with your credentials
```

**.env configuration:**

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/civicswap
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d
EMAIL_FROM=your_email@gmail.com
BREVO_API_KEY=your_brevo_api_key
NODE_ENV=development
```

```bash
# 4. Start the backend server
npm run dev
```

Backend runs at `http://localhost:5000`

### Frontend Setup

```bash
# 1. Navigate to frontend directory
cd ../civicswap-frontend

# 2. Install dependencies
npm install

# 3. Update API base URL in src/utils/axios.js
# baseURL: 'http://localhost:5000/api'

# 4. Start the frontend dev server
npm run dev
```

Frontend runs at `http://localhost:5173`

---

## 📡 API Reference

### Auth

| Method | Endpoint             | Access  | Description                          |
| ------ | -------------------- | ------- | ------------------------------------ |
| `POST` | `/api/auth/register` | Public  | Register user with location          |
| `POST` | `/api/auth/login`    | Public  | Login, returns JWT token             |
| `GET`  | `/api/auth/profile`  | Private | Get logged-in user profile           |
| `PUT`  | `/api/auth/profile`  | Private | Update name, bio, password, location |

### Items

| Method   | Endpoint         | Access  | Description                        |
| -------- | ---------------- | ------- | ---------------------------------- |
| `GET`    | `/api/items`     | Private | Get items with optional geo-filter |
| `POST`   | `/api/items`     | Private | Create new item listing            |
| `GET`    | `/api/items/:id` | Private | Get single item with owner details |
| `PUT`    | `/api/items/:id` | Private | Update item (owner only)           |
| `DELETE` | `/api/items/:id` | Private | Delete item (owner only)           |

> **Geo-filter params:** `?latitude=28.59&longitude=78.55&radius=5&category=Tools&search=drill`

### Transactions

| Method | Endpoint                        | Access  | Description                   |
| ------ | ------------------------------- | ------- | ----------------------------- |
| `POST` | `/api/transactions`             | Private | Create borrow request         |
| `GET`  | `/api/transactions/my`          | Private | Get all my transactions       |
| `GET`  | `/api/transactions/requests`    | Private | Get incoming PENDING requests |
| `PUT`  | `/api/transactions/:id/approve` | Private | Approve request (lender only) |
| `PUT`  | `/api/transactions/:id/reject`  | Private | Reject request (lender only)  |
| `PUT`  | `/api/transactions/:id/return`  | Private | Mark item as returned         |

### Ratings

| Method | Endpoint                | Access  | Description                |
| ------ | ----------------------- | ------- | -------------------------- |
| `POST` | `/api/ratings`          | Private | Submit rating after return |
| `GET`  | `/api/ratings/user/:id` | Private | Get all ratings for a user |

---

## 🔮 Future Scope

- **WhatsApp / Telegram Integration** — Borrow notifications directly on preferred messaging apps
- **AI-Based Recommendations** — Suggest items based on borrowing history, location, and community preferences
- **Mobile App** — Dedicated Android & iOS app with push notifications and real-time map updates
- **Tiered Trust Badges** — "Verified Neighbor", "Top Lender" badges + penalty flags for late returns
- **Payment Gateway** — Optional damage deposits via Razorpay / PayPal for high-value items
- **Community Forums & Events** — Discussion boards and neighborhood events section
- **Advanced Analytics Dashboard** — Admin dashboard for usage stats, popular categories, and community health metrics
- **SMS Notifications** — Brevo SMS API integration for real-time transaction alerts

---

## 📚 References

- Node.js Official Docs — https://nodejs.org/docs
- Express.js Official Docs — https://expressjs.com
- MongoDB Official Docs — https://www.mongodb.com/docs
- Mongoose Official Docs — https://mongoosejs.com/docs
- React Official Docs — https://react.dev
- Leaflet.js Docs — https://leafletjs.com
- Tailwind CSS Docs — https://tailwindcss.com/docs
- Brevo API Docs — https://developers.brevo.com
- JWT Docs — https://jwt.io
- Vite Docs — https://vite.dev

---

## 👤 Author

**Harshit Trivedi**
**Ritik Sharma**

---

_CivicSwap — Reducing unnecessary consumption, one neighborhood at a time. 🌱_
