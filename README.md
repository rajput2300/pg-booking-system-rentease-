# 🏠 RentEase.in — PG Rental Platform

India's production-ready PG booking platform built with Node.js, Express, MongoDB, EJS & Bootstrap 5.

## 🚀 Quick Start

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)

  ## 🌐 Live Demo

> https://rentease-kfyl.onrender.com/

### Installation

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env with your MONGO_URI and session secrets

# 3. Seed the database (creates admin + sample data)
npm run seed

# 4. Create uploads directory
mkdir -p public/images/uploads

# 5. Start the server
npm start          # production
npm run dev        # development (nodemon)
```

App runs at: http://localhost:3000

## 🔐 Test Credentials

| Role             | Email                   | Password     |
|------------------|-------------------------|--------------|
| Admin            | admin@rentease.in       | admin123     |
| Owner (approved) | owner@rentease.in       | owner123     |
| Owner (pending)  | sunita@example.com      | owner123     |
| User 1           | rahul@example.com       | password123  |
| User 2           | priya@example.com       | password123  |

## 📁 Project Structure

```
rentease/
├── app.js                  # Express app entry point
├── config/
│   └── multer.js           # File upload configuration
├── middleware/
│   └── auth.js             # Auth guards (isLoggedIn, isAdmin, isOwner, etc.)
├── models/
│   ├── User.js             # User + bcrypt + wishlist
│   ├── PG.js               # PG listing schema
│   ├── Booking.js          # Booking schema
│   ├── Review.js           # Review + sub-ratings
│   └── Complaint.js        # Support complaints
├── routes/
│   ├── index.js            # Home, about, contact, wishlist, user dashboard
│   ├── auth.js             # Register, login, logout
│   ├── pgs.js              # PG listing + detail (with similar PGs)
│   ├── bookings.js         # Book, cancel, view
│   ├── reviews.js          # Create, delete reviews
│   ├── owner.js            # Owner panel (full CRUD + approve/reject bookings)
│   └── admin.js            # Admin panel (full management)
├── views/
│   ├── partials/           # navbar, footer, flash, sidebars
│   ├── auth/               # login, register, register-owner
│   ├── user/               # listings, pg-detail, my-bookings, dashboard
│   ├── owner/              # dashboard, my-pgs, pg-form, bookings, reviews, profile
│   ├── admin/              # dashboard, pgs, bookings, owners, users, complaints
│   ├── index.ejs           # Homepage with hero + featured PGs
│   └── about.ejs, contact.ejs, error.ejs, 404.ejs
├── public/
│   ├── css/main.css        # Complete design system
│   ├── js/main.js          # Client-side interactions
│   └── images/uploads/     # User-uploaded PG photos
├── seeds/seed.js           # Database seeder
├── .env                    # Environment variables
└── package.json
```

## ✅ Features

### Users
- Register/login with secure bcrypt passwords
- Browse PGs with advanced search & filters (city, price, gender, amenities, sort)
- View PG detail with image carousel, Google Maps embed, amenities
- Wishlist (save PGs with heart button, toggle via AJAX)
- Book PGs with date + duration selection
- Track booking status in user dashboard
- Write reviews with sub-ratings (cleanliness, food, location, safety)
- User dashboard with stats, bookings, wishlist, reviews

### Owners
- Register as owner (requires admin approval)
- Add PG listings with multi-image upload
- Edit/delete listings
- **Approve or reject bookings for their own PGs**
- Revenue analytics on owner dashboard
- View and manage all reviews

### Admin
- Full admin dashboard with 6 stat cards
- Approve/reject owner applications
- Approve/reject PG listings
- Approve/reject/manage all bookings
- Manage all users and owners
- Respond to complaints

### Smart Features
- Similar PG suggestions on detail page (same city + price range)
- Google Maps embed for every PG
- Average rating auto-recalculation
- Featured PG section on homepage
- Bootstrap 5 image carousel for PG photos
- AJAX wishlist toggle (no page reload)

## 🌍 Deployment Tips

### Environment Variables (.env)
```
PORT=3000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/rentease
SESSION_SECRET=your_very_long_random_secret_here
NODE_ENV=production
```

### Production Deploy (Railway / Render / Heroku)
1. Push code to GitHub
2. Set env vars in platform dashboard
3. Build command: `npm install`
4. Start command: `npm start`
5. Ensure MongoDB Atlas URI is set

### Nginx Config (VPS)
```nginx
server {
    listen 80;
    server_name rentease.in;
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Use PM2 for process management: `pm2 start app.js --name rentease`

