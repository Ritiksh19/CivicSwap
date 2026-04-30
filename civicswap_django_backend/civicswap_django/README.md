# CivicSwap — Django Backend

> **Migrated from Node.js/Express/MongoDB → Django 4.x / Python / PostgreSQL**  
> All API endpoints, response shapes, and frontend behaviour are **100% preserved**.  
> The React frontend requires **zero changes**.

---

## Tech Stack

| Layer | Original (Node.js) | This version (Django) |
|---|---|---|
| Runtime | Node.js 18 | Python 3.11 |
| Framework | Express.js | Django 4.2 + DRF |
| Database | MongoDB Atlas | PostgreSQL 14+ |
| ODM / ORM | Mongoose | Django ORM + Psycopg2 |
| Auth | jsonwebtoken + bcryptjs | SimpleJWT + Django auth |
| Geo queries | MongoDB `$nearSphere` | Haversine formula (Python) |
| Email | Brevo via Axios | Brevo via Python requests |
| Deployment | Railway | Railway (same) |

---

## Project Structure

```
civicswap_django/
├── manage.py
├── requirements.txt
├── Procfile                     # Railway deployment
├── runtime.txt                  # Python 3.11
├── .env.example
├── civicswap/
│   ├── settings.py              # All config (replaces server.js + .env)
│   ├── urls.py                  # Root URL conf (replaces all route files)
│   └── wsgi.py
├── apps/
│   ├── users/                   # Replaces authController.js + User.js
│   │   ├── models.py            # Custom AbstractBaseUser
│   │   ├── serializers.py       # Register / Login / Profile
│   │   ├── views.py             # register, login, profile endpoints
│   │   ├── urls.py
│   │   └── admin.py
│   ├── items/                   # Replaces itemController.js + Item.js
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py             # Haversine geo-filter
│   │   ├── urls.py
│   │   └── admin.py
│   ├── transactions/            # Replaces transactionController.js + Transaction.js
│   │   ├── models.py            # 6-state machine
│   │   ├── serializers.py
│   │   ├── views.py             # Overlap validation + email triggers
│   │   ├── urls.py
│   │   └── admin.py
│   └── ratings/                 # Replaces ratingController.js + Rating.js
│       ├── models.py            # Unique constraint per (transaction, rater)
│       ├── serializers.py
│       ├── views.py             # Reputation recalculation
│       ├── urls.py
│       └── admin.py
└── utils/
    └── email.py                 # Replaces utils/sendEmail.js (Brevo REST API)
```

---

## API Endpoints

All routes are identical to the original Node.js backend.

### Auth — `/api/auth/`
| Method | Path | Description |
|---|---|---|
| POST | `/api/auth/register` | Register with name, email, password, location |
| POST | `/api/auth/login` | Login, returns `{ token, user }` |
| GET | `/api/auth/profile` | Get current user (JWT protected) |
| PUT | `/api/auth/profile` | Update name, bio, password, location |
| GET | `/api/auth/users/:id` | Get any user's public profile |

### Items — `/api/items/`
| Method | Path | Description |
|---|---|---|
| GET | `/api/items` | List with geo-filter, category, search |
| POST | `/api/items` | Create listing |
| GET | `/api/items/:id` | Single item with owner details |
| PUT | `/api/items/:id` | Update (owner only) |
| DELETE | `/api/items/:id` | Delete (owner only) |

**Geo-filter params:** `?latitude=28.59&longitude=78.55&radius=5&category=Tools&search=drill`

### Transactions — `/api/transactions/`
| Method | Path | Description |
|---|---|---|
| POST | `/api/transactions` | Create borrow request |
| GET | `/api/transactions/my` | My borrow history |
| GET | `/api/transactions/requests` | Incoming pending requests |
| PUT | `/api/transactions/:id/approve` | Approve (lender only) |
| PUT | `/api/transactions/:id/reject` | Reject (lender only) |
| PUT | `/api/transactions/:id/return` | Mark returned (borrower only) |

### Ratings — `/api/ratings/`
| Method | Path | Description |
|---|---|---|
| POST | `/api/ratings` | Submit rating after return |
| GET | `/api/ratings/user/:id` | All ratings for a user |

---

## Local Setup

### 1. Clone & create virtual environment

```bash
git clone https://github.com/Ritiksh19/CivicSwap.git
cd CivicSwap/civicswap-backend    # replace this folder with civicswap_django

python -m venv venv
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate
```

### 2. Install dependencies

```bash
pip install -r requirements.txt
```

### 3. Create PostgreSQL database

```sql
CREATE DATABASE civicswap;
```

### 4. Configure environment variables

```bash
cp .env.example .env
# Edit .env with your DB credentials and Brevo API key
```

### 5. Run migrations & create superuser

```bash
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser
```

### 6. Start development server

```bash
python manage.py runserver
# API runs at http://localhost:8000
```

> Update `src/utils/axios.js` in the frontend to point to `http://localhost:8000/api`

---

## Deploying to Railway

1. Push the `civicswap_django` folder to a GitHub repo
2. Create a new Railway project → **Deploy from GitHub repo**
3. Add a **PostgreSQL** plugin — Railway sets `DATABASE_URL` automatically
4. Set environment variables in Railway dashboard:
   - `SECRET_KEY` — any long random string
   - `DEBUG` — `False`
   - `BREVO_API_KEY` — your key
   - `EMAIL_FROM` — your sender email
   - `CORS_ALLOWED_ORIGINS` — `https://civicswap-frontend.vercel.app`
   - `ALLOWED_HOSTS` — your Railway domain e.g. `civicswap-backend.up.railway.app`
5. Railway will run `Procfile` → auto-migrate + start gunicorn

---

## Key Design Decisions

### `_id` compatibility
MongoDB uses `_id` as the primary key field. All serializers expose both `id` (Django integer PK) and `_id` (string alias), so the React frontend code that references `item._id`, `user._id` etc. works without modification.

### Haversine geo-filter
The original backend used MongoDB's `$nearSphere` geospatial operator. This Django version implements the Haversine formula in Python to calculate distances — no PostGIS extension required. Items are fetched, distances computed, filtered by radius, and sorted by distance ascending — identical output behaviour.

### JWT token format
The frontend's `AuthContext.jsx` expects `{ token, user }` on login/register. `djangorestframework-simplejwt` is configured to return a 7-day access token (matching original `JWT_EXPIRE=7d`), wrapped in the same `{ token, user }` response shape.

### Email notifications
`utils/email.py` is a direct Python port of `utils/sendEmail.js` — same Brevo REST API endpoint, same payload structure, same email templates — triggered at the same lifecycle events.

### Overlap validation
The date-conflict check in `transactions/views.py` mirrors the original logic:
```python
# Finds any APPROVED or ON_LOAN transaction for the same item
# where date ranges overlap: start_date <= end_date AND end_date >= start_date
```

---

## Django Admin

Access at `/admin/` — provides full CRUD over Users, Items, Transactions, Ratings. Customised with list filters and search fields relevant to CivicSwap.

---

*CivicSwap — Reducing unnecessary consumption, one neighborhood at a time. 🌱*
