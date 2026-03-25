# CivicSwap — Technical Project Walkthrough

> **A Hyper-Local Resource Exchange Platform**
> Built on the MERN Stack (MongoDB · Express · React · Node.js)

---

| Field         | Details                                  |
| ------------- | ---------------------------------------- |
| **Developer** | Harshit Trivedi                          |
| **Developer** | Ritik Sharma                             |
| **Frontend**  | https://civicswap-frontend.vercel.app    |
| **Backend**   | https://civicswap-backend.up.railway.app |

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Architecture & Tech Stack](#2-architecture--tech-stack)
3. [Phase 1 — Planning & Stack Decision](#3-phase-1--planning--stack-decision)
4. [Phase 2 — Backend Development](#4-phase-2--backend-development)
5. [Phase 3 — Frontend Development](#5-phase-3--frontend-development)
6. [Phase 4 — Email Notification System](#6-phase-4--email-notification-system)
7. [Phase 5 — API Testing](#7-phase-5--api-testing)
8. [Phase 6 — Deployment](#8-phase-6--deployment)
9. [Problems Faced & Solutions](#9-problems-faced--solutions)
10. [Complete API Reference](#10-complete-api-reference)
11. [Key Learnings](#11-key-learnings)

---

## 1. Project Overview

CivicSwap is a community-driven, hyper-local web platform designed to enable neighbors to lend, borrow, and gift everyday items and services — such as tools, kitchenware, books, and electronics — without leaving their neighborhood.

The platform is built on the principle that most households own items that remain unused for 95% of the time. CivicSwap transforms these idle resources into shared community capital through a structured, trusted, and geographically-aware exchange system.

### Core Features

- **Hyper-local discovery** — Interactive Leaflet.js map with configurable radius (0.5km–10km)
- **Structured borrow lifecycle** — 6-state transaction state machine
- **Reputation system** — Star ratings and weighted trust scores
- **Real-time email notifications** — Triggered at every transaction state change
- **Geo-filter API** — MongoDB `$nearSphere` for distance-based item discovery
- **JWT authentication** — Secure session management with bcrypt password hashing

---

## 2. Architecture & Tech Stack

```
┌─────────────────────────────────────┐
│         User Browser                │
└──────────────┬──────────────────────┘
               │ HTTPS
┌──────────────▼──────────────────────┐
│     Vercel — React Frontend         │
│  React 18 · Vite · Tailwind CSS     │
│  Leaflet.js · React Router · Axios  │
└──────────────┬──────────────────────┘
               │ REST API (HTTPS)
┌──────────────▼──────────────────────┐
│   Railway — Node.js Backend         │
│   Express.js · JWT · Mongoose       │
└──────┬───────────────────┬──────────┘
       │                   │
┌──────▼──────┐   ┌────────▼────────┐
│ MongoDB     │   │  Brevo REST API │
│ Atlas       │   │  (Email Service)│
│ (Database)  │   │                 │
└─────────────┘   └─────────────────┘
```

### Technology Decisions

| Layer              | Technology                 | Reason                                                              |
| ------------------ | -------------------------- | ------------------------------------------------------------------- |
| Frontend Framework | React 18 + Vite            | Fast HMR, component-based architecture                              |
| Styling            | Tailwind CSS (CDN)         | Rapid UI development, responsive utilities                          |
| Map                | Leaflet.js + React-Leaflet | Open source, lightweight, no API key needed                         |
| Backend            | Node.js + Express          | JavaScript full-stack, fast REST APIs                               |
| Database           | MongoDB + Mongoose         | Flexible schema, native geospatial support                          |
| Authentication     | JWT + bcryptjs             | Stateless, scalable, secure                                         |
| Email              | Brevo REST API             | SMTP ports blocked on cloud — REST API on port 443 works everywhere |
| Frontend Hosting   | Vercel                     | Zero-config React deployment, instant CDN                           |
| Backend Hosting    | Railway                    | No cold starts, reliable free tier                                  |

---

## 3. Phase 1 — Planning & Stack Decision

### Original Plan vs Final Decision

The project was originally planned as a **Django + PostgreSQL** backend with a partner handling the frontend. Midway through architecture planning, the stack was switched to **MERN** for the following reasons:

- Developer (Harshit) was already proficient in Node.js, Express, and MongoDB
- MERN stack eliminates context switching between Python and JavaScript
- MongoDB's native geospatial support (`$nearSphere`, `2dsphere` index) is superior to PostGIS for this use case
- Faster development cycle with JavaScript across the entire stack

### Project Folder Structure

```
CivicSwap/
├── civicswap-backend/
│   ├── config/
│   │   └── db.js                  # MongoDB connection
│   ├── models/
│   │   ├── User.js                # User schema with geo-location
│   │   ├── Item.js                # Item schema with geo-index
│   │   ├── Transaction.js         # 6-state lifecycle model
│   │   └── Rating.js              # Rating with unique constraint
│   ├── controllers/
│   │   ├── authController.js      # Register, login, profile
│   │   ├── itemController.js      # CRUD + geo-filter
│   │   ├── transactionController.js # Full borrow lifecycle
│   │   └── ratingController.js    # Ratings + reputation
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── itemRoutes.js
│   │   ├── transactionRoutes.js
│   │   └── ratingRoutes.js
│   ├── middleware/
│   │   └── authMiddleware.js      # JWT verification
│   ├── utils/
│   │   ├── sendEmail.js           # Brevo REST API email utility
│   │   └── keepAlive.js           # Render/Railway ping utility
│   ├── .env
│   └── server.js
│
└── civicswap-frontend/
    ├── public/
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.jsx
    │   │   ├── ItemCard.jsx
    │   │   └── ProtectedRoute.jsx
    │   ├── context/
    │   │   └── AuthContext.jsx    # Global JWT + user state
    │   ├── pages/
    │   │   ├── HomePage.jsx
    │   │   ├── LoginPage.jsx
    │   │   ├── RegisterPage.jsx
    │   │   ├── DashboardPage.jsx
    │   │   ├── ItemListPage.jsx
    │   │   ├── ItemDetailPage.jsx
    │   │   ├── CreateItemPage.jsx
    │   │   ├── EditItemPage.jsx
    │   │   ├── MapPage.jsx
    │   │   ├── ProfilePage.jsx
    │   │   ├── EditProfilePage.jsx
    │   │   ├── TransactionPage.jsx
    │   │   └── RatingPage.jsx
    │   └── utils/
    │       └── axios.js           # Axios instance with JWT injection
    ├── vercel.json                # SPA routing fix
    └── index.html
```

---

## 4. Phase 2 — Backend Development

### 4.1 Database Models

#### User Model

```javascript
{
  name: String,
  email: String (unique),
  password: String (bcrypt hashed),
  location: { type: 'Point', coordinates: [lng, lat] },
  reputationScore: Number (default: 0),
  totalRatings: Number,
  avatar: String,
  bio: String,
  phone: String
}
```

- `2dsphere` index on `location` for geospatial queries
- Pre-save hook hashes password using bcryptjs (10 salt rounds)
- `matchPassword()` instance method for login verification

#### Item Model

```javascript
{
  owner: ObjectId (ref: User),
  title: String,
  description: String,
  category: Enum ['Tools', 'Books', 'Kitchenware', 'Electronics', 'Sports', 'Clothing', 'Other'],
  photo: String,
  status: Enum ['AVAILABLE', 'ON_LOAN', 'UNAVAILABLE'],
  location: { type: 'Point', coordinates: [lng, lat] }
}
```

- `2dsphere` index enables `$nearSphere` distance queries

#### Transaction Model — 6-State Lifecycle

```
PENDING → APPROVED → ON_LOAN → RETURNED → CLOSED
       ↘ REJECTED
```

```javascript
{
  item: ObjectId (ref: Item),
  borrower: ObjectId (ref: User),
  lender: ObjectId (ref: User),
  status: Enum ['PENDING', 'APPROVED', 'REJECTED', 'ON_LOAN', 'RETURNED', 'CLOSED'],
  startDate: Date,
  endDate: Date,
  message: String,
  approvedAt: Date,
  returnedAt: Date,
  closedAt: Date
}
```

#### Rating Model

```javascript
{
  transaction: ObjectId (ref: Transaction),
  rater: ObjectId (ref: User),
  ratee: ObjectId (ref: User),
  stars: Number (1–5),
  feedback: String
}
```

- Unique compound index on `{ transaction, rater }` — prevents duplicate ratings

---

### 4.2 Authentication System

- JWT tokens signed with `JWT_SECRET`, expiry set via `JWT_EXPIRE` (7 days)
- Middleware extracts Bearer token from `Authorization` header
- All protected routes wrapped with `protect` middleware
- Passwords hashed with bcrypt before saving, never stored in plain text

### 4.3 Geo-Filter API

Items are filtered by geographic distance using MongoDB's native geospatial operator:

```javascript
location: {
  $nearSphere: {
    $geometry: {
      type: 'Point',
      coordinates: [parseFloat(longitude), parseFloat(latitude)]
    },
    $maxDistance: radius * 1000  // km → meters
  }
}
```

### 4.4 Overlap Validation

Prevents double-booking of items on conflicting dates:

```javascript
const overlap = await Transaction.findOne({
  item: itemId,
  status: "APPROVED",
  $or: [
    {
      startDate: { $lte: new Date(endDate) },
      endDate: { $gte: new Date(startDate) },
    },
  ],
});
if (overlap)
  return res
    .status(400)
    .json({ message: "Item already booked for these dates" });
```

### 4.5 Reputation Score Calculation

After every rating submission, the ratee's score is recalculated as a weighted average:

```javascript
const allRatings = await Rating.find({ ratee: rateeId });
const totalStars = allRatings.reduce((sum, r) => sum + r.stars, 0);
const avgScore = totalStars / allRatings.length;

await User.findByIdAndUpdate(rateeId, {
  reputationScore: Math.round(avgScore * 10) / 10,
  totalRatings: allRatings.length,
});
```

---

## 5. Phase 3 — Frontend Development

### 5.1 Auth Context

Global JWT and user state management using React Context API:

```javascript
const login = async (email, password) => {
  const { data } = await axios.post("/auth/login", { email, password });
  localStorage.setItem("token", data.token);
  localStorage.setItem("user", JSON.stringify(data));
  setUser(data);
};
```

### 5.2 Axios Instance

Auto-injects JWT token on every API request:

```javascript
instance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### 5.3 Pages Built

| Page         | Route                  | Access  | Key Features                                |
| ------------ | ---------------------- | ------- | ------------------------------------------- |
| Home         | `/`                    | Public  | Parallax hero, stats, features, CTA         |
| Login        | `/login`               | Public  | Split layout, show/hide password            |
| Register     | `/register`            | Public  | Browser Geolocation API                     |
| Dashboard    | `/dashboard`           | Private | Stats cards, recent activity, quick actions |
| Item List    | `/items`               | Private | Search, category filter, geo-sorted grid    |
| Item Detail  | `/items/:id`           | Private | Borrow request form with date picker        |
| Create Item  | `/items/create`        | Private | Category selector, auto location detect     |
| Edit Item    | `/items/:id/edit`      | Private | Pre-filled form, status toggle              |
| Map          | `/map`                 | Private | Leaflet.js map, radius slider, item pins    |
| Profile      | `/profile/:id`         | Private | Reputation score, items, reviews            |
| Edit Profile | `/profile/me/edit`     | Private | Name, bio, password, location update        |
| Transactions | `/transactions`        | Private | All activity + incoming requests tabs       |
| Rate         | `/rate/:transactionId` | Private | Interactive star rating                     |

### 5.4 UI Design Philosophy

Premium aesthetic inspired by Airbnb — Modern & Minimal:

- Dark hero section with CSS parallax scrolling
- Smooth hover transitions (`hover:-translate-y-1`, `hover:shadow-xl`)
- Black and white minimal color scheme
- Inter font family from Google Fonts
- Animated loading spinners on all async operations
- Fully responsive across desktop, tablet, and mobile

---

## 6. Phase 4 — Email Notification System

### Email Triggers

| Event                    | Recipient           | Subject                     |
| ------------------------ | ------------------- | --------------------------- |
| Borrow request submitted | Item owner (lender) | New Borrow Request          |
| Request approved         | Borrower            | Request Approved            |
| Request rejected         | Borrower            | Request Rejected            |
| Item returned            | Both parties        | Item Returned + Rate prompt |
| Rating submitted (both)  | Both parties        | Transaction Closed          |

### Final Implementation — Brevo REST API

After multiple failed attempts with SMTP (detailed in Problems section), the final working solution uses the Brevo REST API over HTTPS (port 443):

```javascript
const sendEmail = async ({ to, subject, html }) => {
  await axios.post(
    "https://api.brevo.com/v3/smtp/email",
    {
      sender: {
        name: "CivicSwap",
        email: process.env.EMAIL_FROM,
      },
      to: [{ email: to }],
      subject: subject,
      htmlContent: html,
    },
    {
      headers: {
        "api-key": process.env.BREVO_API_KEY,
        "Content-Type": "application/json",
      },
    },
  );
  console.log(`Email sent to ${to}`);
};
```

---

## 7. Phase 5 — API Testing

All API endpoints were tested systematically using **Thunder Client** (VS Code extension) before frontend integration. Testing was done in the following order:

### 7.1 Auth Module Testing

| #   | Test                   | Method | Endpoint             | Expected           | Result  |
| --- | ---------------------- | ------ | -------------------- | ------------------ | ------- |
| 1   | Register new user      | POST   | `/api/auth/register` | 201 + JWT token    | ✅ Pass |
| 2   | Login with credentials | POST   | `/api/auth/login`    | 200 + JWT token    | ✅ Pass |
| 3   | Get profile with token | GET    | `/api/auth/profile`  | 200 + user object  | ✅ Pass |
| 4   | Update profile         | PUT    | `/api/auth/profile`  | 200 + updated user | ✅ Pass |
| 5   | Wrong token            | GET    | `/api/auth/profile`  | 401 Unauthorized   | ✅ Pass |
| 6   | Missing token          | GET    | `/api/auth/profile`  | 401 No token       | ✅ Pass |

### 7.2 Items Module Testing

| #   | Test                       | Method | Endpoint                         | Expected              | Result  |
| --- | -------------------------- | ------ | -------------------------------- | --------------------- | ------- |
| 7   | Create item                | POST   | `/api/items`                     | 201 + item object     | ✅ Pass |
| 8   | Get all items (geo-filter) | GET    | `/api/items?lat=&lng=&radius=10` | 200 + items array     | ✅ Pass |
| 9   | Get single item            | GET    | `/api/items/:id`                 | 200 + item detail     | ✅ Pass |
| 10  | Update item                | PUT    | `/api/items/:id`                 | 200 + updated item    | ✅ Pass |
| 11  | Delete item                | DELETE | `/api/items/:id`                 | 200 + success message | ✅ Pass |
| 12  | Unauthorized update        | PUT    | `/api/items/:id`                 | 401 Permission denied | ✅ Pass |

### 7.3 Transaction Module Testing

| #   | Test                  | Method | Endpoint                        | Expected                   | Result  |
| --- | --------------------- | ------ | ------------------------------- | -------------------------- | ------- |
| 13  | Create borrow request | POST   | `/api/transactions`             | 201 + PENDING status       | ✅ Pass |
| 14  | Borrow own item       | POST   | `/api/transactions`             | 400 Cannot borrow own item | ✅ Pass |
| 15  | Overlapping dates     | POST   | `/api/transactions`             | 400 Already booked         | ✅ Pass |
| 16  | Get my transactions   | GET    | `/api/transactions/my`          | 200 + transactions array   | ✅ Pass |
| 17  | Get incoming requests | GET    | `/api/transactions/requests`    | 200 + pending requests     | ✅ Pass |
| 18  | Approve request       | PUT    | `/api/transactions/:id/approve` | 200 + APPROVED status      | ✅ Pass |
| 19  | Reject request        | PUT    | `/api/transactions/:id/reject`  | 200 + REJECTED status      | ✅ Pass |
| 20  | Return item           | PUT    | `/api/transactions/:id/return`  | 200 + RETURNED status      | ✅ Pass |
| 21  | Unauthorized approve  | PUT    | `/api/transactions/:id/approve` | 401 Permission denied      | ✅ Pass |

### 7.4 Rating Module Testing

| #   | Test                   | Method | Endpoint                | Expected                    | Result  |
| --- | ---------------------- | ------ | ----------------------- | --------------------------- | ------- |
| 22  | Submit rating          | POST   | `/api/ratings`          | 201 + rating object         | ✅ Pass |
| 23  | Duplicate rating       | POST   | `/api/ratings`          | 400 Already rated           | ✅ Pass |
| 24  | Rate before return     | POST   | `/api/ratings`          | 400 Return item first       | ✅ Pass |
| 25  | Get user ratings       | GET    | `/api/ratings/user/:id` | 200 + ratings array         | ✅ Pass |
| 26  | Reputation auto-update | POST   | `/api/ratings`          | User score recalculated     | ✅ Pass |
| 27  | Both rated → CLOSED    | POST   | `/api/ratings` (2nd)    | Transaction status → CLOSED | ✅ Pass |

### 7.5 End-to-End Flow Test

Complete user journey tested on local environment before deployment:

```
1. Register Harshit (owner)        → ✅ Account created
2. Register Test User (borrower)   → ✅ Account created
3. Harshit posts Cordless Drill    → ✅ Item AVAILABLE
4. Test User sends borrow request  → ✅ Transaction PENDING
                                   → ✅ Email sent to Harshit
5. Harshit approves request        → ✅ Transaction APPROVED
                                   → ✅ Item status → ON_LOAN
                                   → ✅ Email sent to borrower
6. Test User marks as returned     → ✅ Transaction RETURNED
                                   → ✅ Item status → AVAILABLE
                                   → ✅ Email sent to both
7. Harshit rates Test User (4★)   → ✅ Rating saved
8. Test User rates Harshit (5★)   → ✅ Rating saved
                                   → ✅ Transaction → CLOSED
                                   → ✅ Reputation scores updated
```

### 7.6 Email Notification Testing

| Trigger                  | Email Received | Spam Check | Result  |
| ------------------------ | -------------- | ---------- | ------- |
| Borrow request submitted | Owner inbox    | Checked    | ✅ Pass |
| Request approved         | Borrower inbox | Checked    | ✅ Pass |
| Request rejected         | Borrower inbox | Checked    | ✅ Pass |
| Item returned            | Both inboxes   | Checked    | ✅ Pass |

---

## 8. Phase 6 — Deployment

### 8.1 Database — MongoDB Atlas

- Free M0 cluster on AWS Mumbai region
- Network Access set to `0.0.0.0/0` (allow all IPs for cloud deployment)
- SSL-enabled connection string with replicaSet configuration

### 8.2 Backend — Railway

- Connected GitHub repository for automatic deployments
- Environment variables configured via Railway dashboard
- Custom domain generated: `https://civicswap-backend.up.railway.app`
- No cold start issues — persistent server unlike Render free tier

**Environment Variables on Railway:**

```
PORT            = 5000
MONGO_URI       = mongodb+srv://...
JWT_SECRET      = civicswap_super_secret_key_2024
JWT_EXPIRE      = 7d
EMAIL_FROM      = harshittrivedi24@gmail.com
BREVO_API_KEY   = xkeysib-...
NODE_ENV        = production
```

### 8.3 Frontend — Vercel

Deployed using Vercel CLI:

```bash
npm install -g vercel
cd civicswap-frontend
npm run build
vercel --prod
```

**`vercel.json`** — Required for React SPA routing:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### 8.4 CORS Configuration

Backend configured to accept requests from Vercel frontend:

```javascript
app.use(
  cors({
    origin: ["https://civicswap-frontend.vercel.app", "http://localhost:5173"],
    credentials: true,
  }),
);
```

---

## 9. Problems Faced & Solutions

### Problem 1 — Mongoose Pre-Save Hook Crash

**Symptom:** Server crashed with `next is not a function` on user registration

**Root Cause:** Arrow function used in Mongoose pre-save hook — `this` keyword is not available in arrow functions

**Solution:**

```javascript
// ❌ Wrong
userSchema.pre("save", async (next) => {
  this.password = await bcrypt.hash(this.password, 10); // 'this' is undefined
});

// ✅ Correct
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});
```

---

### Problem 2 — Blank Screen on Frontend Load

**Symptom:** Browser showed blank white screen after pasting component code

**Root Cause:** A terminal for-loop command accidentally overwrote all `.jsx` files with empty content, removing `export default` from every page component

**Solution:** Manually replaced each file with correct component code including proper `export default` statements

---

### Problem 3 — Black Side Bars on Homepage

**Symptom:** Page content was centered with black gaps on left and right sides

**Root Cause:** `#root` div was not inheriting full viewport width

**Solution:**

```css
html,
body,
#root {
  width: 100%;
  min-height: 100vh;
}
```

---

### Problem 4 — Gmail SMTP Authentication Failure

**Symptom:** `535 5.7.8 Authentication Failed` when using Gmail credentials

**Root Cause:** Gmail blocks normal password authentication when 2-Step Verification is enabled — requires a 16-digit App Password

**Solution:** Generated App Password from `myaccount.google.com/apppasswords` and used it as `EMAIL_PASS`

---

### Problem 5 — SMTP Connection Timeout on Render

**Symptom:** `Connection timeout` — emails not sending on production

**Root Cause:** Render free plan blocks all outbound SMTP ports (25, 465, 587) to prevent spam abuse

**Solution:** Switched to Brevo SMTP (`smtp-relay.brevo.com:587`)

---

### Problem 6 — SMTP Still Failing on Railway

**Symptom:** Same `Connection timeout` error even after switching to Brevo SMTP on Railway

**Root Cause:** Railway also blocks standard SMTP ports, same as Render and most cloud platforms

**Solution:** Completely bypassed SMTP. Switched to **Brevo REST API** using Axios over HTTPS (port 443) — cloud platforms never block port 443

```javascript
await axios.post("https://api.brevo.com/v3/smtp/email", payload, {
  headers: { "api-key": process.env.BREVO_API_KEY },
});
```

---

### Problem 7 — `sendEmail is not a function`

**Symptom:** Server crashed with `sendEmail is not a function` on transaction routes

**Root Cause:**

1. `axios` package was not installed in the backend directory
2. `module.exports` was missing from the new `sendEmail.js` utility

**Solution:**

```bash
npm install axios
```

```javascript
module.exports = sendEmail; // Added at bottom of sendEmail.js
```

---

### Problem 8 — Brevo Rejecting Email with `invalid_parameter`

**Symptom:** Backend reached Brevo successfully but Brevo returned `invalid_parameter — email is not valid in to`

**Root Cause:** Function signature mismatch — controller passed a destructured object but utility expected positional arguments

**Solution:** Standardized function signature to destructured object:

```javascript
const sendEmail = async ({ to, subject, html }) => {
  await axios.post("https://api.brevo.com/v3/smtp/email", {
    to: [{ email: to }], // Brevo expects array of objects
    subject,
    htmlContent: html,
  });
};
```

---

### Problem 9 — CORS Error on Vercel → Railway

**Symptom:** Browser showed CORS error alongside 404 Preflight error

**Root Cause:** Axios `baseURL` was pointing to a wrong Railway URL — used `...-backend.up.railway.app` instead of the actual generated `...-production.up.railway.app`. Railway returned a 404 HTML page which the browser interpreted as a CORS failure

**Solution:** Copied the exact URL from Railway's Networking settings tab and updated `src/utils/axios.js`

---

### Problem 10 — Page Refresh Returns 404 on Vercel

**Symptom:** Clicking links worked, but refreshing on `/dashboard` or any route showed Vercel 404

**Root Cause:** Vercel serves static files and looks for a physical file matching the URL path. React SPA handles routing client-side — all traffic must go to `index.html`

**Solution:** Added `vercel.json` to frontend root:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

---

### Problem 11 — Render Cold Start (30–60 seconds)

**Symptom:** First API request after inactivity took 30–60 seconds to respond

**Root Cause:** Render free plan spins down servers after 15 minutes of inactivity

**Solution:** Implemented `keepAlive.js` — pings the health endpoint every 14 minutes:

```javascript
setInterval(
  () => {
    https.get("https://civicswap-backend.onrender.com/api/health");
  },
  14 * 60 * 1000,
);
```

Also migrated to **Railway** which has no cold start on its free tier.

---

### Problem 12 — Double `app.listen` in server.js

**Symptom:** Terminal showed `Server running on port 5000` twice

**Root Cause:** `app.listen` was called twice — once for initial setup and once after adding `keepAlive`

**Solution:** Consolidated into single `app.listen` call at the bottom of `server.js`

---

## 10. Complete API Reference

### Auth Endpoints

| Method | Endpoint             | Access  | Description                          |
| ------ | -------------------- | ------- | ------------------------------------ |
| `POST` | `/api/auth/register` | Public  | Register new user with location      |
| `POST` | `/api/auth/login`    | Public  | Login, returns JWT token             |
| `GET`  | `/api/auth/profile`  | Private | Get logged-in user profile           |
| `PUT`  | `/api/auth/profile`  | Private | Update name, bio, password, location |

### Item Endpoints

| Method   | Endpoint         | Access  | Description                                      |
| -------- | ---------------- | ------- | ------------------------------------------------ |
| `GET`    | `/api/items`     | Private | Get items (supports geo-filter via query params) |
| `POST`   | `/api/items`     | Private | Create new item listing                          |
| `GET`    | `/api/items/:id` | Private | Get single item with owner details               |
| `PUT`    | `/api/items/:id` | Private | Update item (owner only)                         |
| `DELETE` | `/api/items/:id` | Private | Delete item (owner only)                         |

**Geo-filter query params:** `?latitude=28.59&longitude=78.55&radius=5&category=Tools&search=drill`

### Transaction Endpoints

| Method | Endpoint                        | Access  | Description                   |
| ------ | ------------------------------- | ------- | ----------------------------- |
| `POST` | `/api/transactions`             | Private | Create borrow request         |
| `GET`  | `/api/transactions/my`          | Private | Get all my transactions       |
| `GET`  | `/api/transactions/requests`    | Private | Get incoming PENDING requests |
| `PUT`  | `/api/transactions/:id/approve` | Private | Approve request (lender only) |
| `PUT`  | `/api/transactions/:id/reject`  | Private | Reject request (lender only)  |
| `PUT`  | `/api/transactions/:id/return`  | Private | Mark as returned              |

### Rating Endpoints

| Method | Endpoint                | Access  | Description                |
| ------ | ----------------------- | ------- | -------------------------- |
| `POST` | `/api/ratings`          | Private | Submit rating after return |
| `GET`  | `/api/ratings/user/:id` | Private | Get all ratings for a user |

### Health Check

| Method | Endpoint      | Access | Description                            |
| ------ | ------------- | ------ | -------------------------------------- |
| `GET`  | `/api/health` | Public | Server health check for keepAlive ping |

---

## 11. Key Learnings

1. **Mongoose hooks require regular functions** — Arrow functions break `this` context. Always use `function` keyword in pre/post hooks.

2. **Cloud platforms block SMTP ports** — Render, Railway, Heroku all block ports 25, 465, 587. Always use REST APIs (port 443) for email in production environments.

3. **React SPA on Vercel needs routing config** — Without `vercel.json` rewrites, page refresh breaks all client-side routes.

4. **CORS errors often mask wrong URLs** — A 404 from the server appears as a CORS error in the browser. Always check the actual request URL in the Network tab first.

5. **MongoDB Atlas requires IP whitelisting** — Set `0.0.0.0/0` for cloud deployments where IP addresses change dynamically.

6. **JWT secrets must be in environment variables** — Never hardcode secrets in source code or commit `.env` files to version control.

7. **Function signature consistency matters** — When a utility function is used across multiple controllers, its signature must be standardized and documented.

8. **Test locally before deploying** — All edge cases (duplicate ratings, overlapping dates, unauthorized access) should be validated via Thunder Client before pushing to production.

9. **Optimistic UI updates improve UX** — Updating state immediately on user action (before API response) makes the application feel instant even on slower connections.

10. **Railway over Render for Node.js** — Railway's always-on free tier eliminates cold start latency that degrades user experience on Render's free plan.

---

## Live URLs

| Service          | URL                                                 |
| ---------------- | --------------------------------------------------- |
| **Frontend**     | https://civicswap-frontend.vercel.app               |
| **Backend API**  | https://civicswap-backend.up.railway.app/api        |
| **Health Check** | https://civicswap-backend.up.railway.app/api/health |

---

_CivicSwap — Built with ❤️ for communities_
_Harshit Trivedi · Ritik Sharma_
