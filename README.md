# CivicSwap 🏘️
### Hyper-Local Resource Exchange Platform

> **A community-driven web platform enabling neighbors to lend, borrow, and gift everyday items and services — without ever leaving their neighborhood.**

---

## 📖 About

CivicSwap addresses a common urban coordination failure: households collectively own enormous quantities of items (tools, kitchenware, books, camping gear, appliances) that sit unused 95% of the time, while neighbors spend money buying or renting those very same items nearby.

CivicSwap transforms idle household resources into shared community capital by connecting neighbors through a structured, trustworthy platform anchored to real geographic locations.

**Academic Context:**
- **Institution:** Raja Balwant Singh Management Technical Campus, Agra
- **Affiliated to:** Dr. A.P.J. Abdul Kalam Technical University (AKTU), Lucknow
- **Department:** Computer Applications — MCA (Integrated) Industrial Project
- **Academic Year:** 2025–2026
- **Author:** Ritik Sharma (Roll No.: 2100050060050)
- **Guide:** Ms. Suprabha Sharma

---

## ✨ Features

- 🗺️ **Hyper-Local Discovery** — Interactive Leaflet.js map with adjustable radius (0.5–10 km) to find available items near your location
- 🔄 **Borrow Lifecycle Management** — Structured workflow from item request → owner approval → loan → return → rating
- ⭐ **Reputation & Rating System** — Transparent trust scores calculated from completed transactions
- 📧 **Automated Email Notifications** — Django Signals trigger emails at every stage of the borrow process
- 🔍 **Search & Category Filters** — Find items by keyword, category (Tools, Books, Kitchenware, Electronics, etc.), distance, or date
- 📱 **Responsive UI** — Works seamlessly on desktop, tablet, and mobile (built with Tailwind CSS)
- 🛡️ **Admin Control Panel** — Customized Django Admin for managing users, listings, and transactions

---

## 🧱 Tech Stack

| Layer | Technology |
|---|---|
| **Backend** | Django 4.x (Python) |
| **Database** | PostgreSQL 14+ |
| **Frontend** | HTML5, CSS3, JavaScript, Tailwind CSS |
| **Maps** | Leaflet.js + Haversine formula / PostGIS ST_DWithin |
| **Notifications** | Django Signals (email automation) |
| **Version Control** | Git & GitHub |
| **Deployment** | Render / Railway |
| **IDE** | VS Code / PyCharm |

---

## 🗂️ System Modules

1. **User Authentication** — Registration, login, session management, home location setup (lat/lng)
2. **Geographic Discovery** — Leaflet.js map, radius-based item filtering, distance calculation
3. **Item Management** — Post/edit listings with title, description, category, photo, and status
4. **Borrow Lifecycle** — State machine for request → approval → ON_LOAN → return → closure; conflict detection for overlapping bookings
5. **Reputation & Rating** — Star ratings (1–5) after each transaction; weighted average reputation scores on user profiles
6. **Notifications** — Automated emails for request submission, approval/rejection, return confirmation, and rating prompts
7. **Database Management** — PostgreSQL with FK constraints, geospatial query support, and scheduling conflict validation
8. **Admin Management** — Django Admin panel with custom filters for users, listings, and transactions
9. **Search & Filter** — Keyword search, category filter, sort by distance or date, integrated with geographic radius
10. **Responsive UI** — Tailwind CSS dashboard with item cards, status badges, transaction history, and user profiles

---

## ⚙️ Hardware Requirements

- Computer/Laptop with minimum **4 GB RAM** (8 GB recommended)
- **Internet connection** (for APIs, map tiles, deployment)
- Minimum **20 GB free disk space** for development environment and database
- Smartphone *(optional)* — for testing the responsive mobile interface

## 💻 Software Requirements

- **OS:** Windows 10/11 / Ubuntu 20.04+ / macOS
- **Python** with Django 4.x
- **PostgreSQL** 14+
- **Git** & GitHub
- **Web Browser:** Google Chrome / Mozilla Firefox

---

## 🚀 Getting Started

```bash
# 1. Clone the repository
git clone https://github.com/<your-username>/civicswap.git
cd civicswap

# 2. Create and activate a virtual environment
python -m venv venv
source venv/bin/activate        # On Windows: venv\Scripts\activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Configure environment variables
cp .env.example .env
# Edit .env with your PostgreSQL credentials, secret key, and email settings

# 5. Apply database migrations
python manage.py migrate

# 6. Create a superuser (for Admin panel access)
python manage.py createsuperuser

# 7. Run the development server
python manage.py runserver
```

Open `http://127.0.0.1:8000` in your browser.

---

## 🔮 Future Scope

- **WhatsApp / Telegram Integration** — Borrow notifications directly on preferred messaging apps
- **AI-Based Recommendations** — Suggest items based on borrowing history, location, and community preferences
- **Mobile App** — Dedicated Android & iOS app with push notifications and real-time map updates
- **Tiered Trust Badges** — "Verified Neighbor", "Top Lender" badges + penalty flags for late returns
- **Payment Gateway** — Optional damage deposits via Razorpay / PayPal for high-value items
- **Community Forums & Events** — Discussion boards and neighborhood events section
- **Analytics Dashboard** — Admin dashboard for usage stats, popular categories, and community health metrics

---

## 📚 References

- Django Official Docs — https://docs.djangoproject.com
- PostgreSQL Official Docs — https://www.postgresql.org/docs
- Leaflet.js Docs — https://leafletjs.com
- Tailwind CSS Docs — https://tailwindcss.com/docs
- Python Docs — https://docs.python.org/3/
- Vincent, W.S. *Django for Beginners*. WelcomeToCode, 2022.
- Greenfeld, A.R. & D.R. *Two Scoops of Django 3.x*. Two Scoops Press, 2021.
- Obe, R.O. & Hsu, L.S. *PostgreSQL: Up and Running*. O'Reilly Media, 2017.

---

## 👤 Author

**Ritik Sharma**
MCA (Integrated) — Raja Balwant Singh Management Technical Campus, Agra
Roll No.: 2100050060050 | Academic Year: 2025–2026

---

*CivicSwap — Reducing unnecessary consumption, one neighborhood at a time. 🌱*
