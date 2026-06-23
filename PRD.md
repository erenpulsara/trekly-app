# Trekly — Product Requirements Document

## Overview
Trekly is a nature tour booking platform. Tour agencies publish tours on the web panel; users discover and book tours via the mobile app. No payment processing — booking is a form submission only. Users earn points for completed tours.

## GCP Project
- Project ID: `treklyapp`
- Region: `europe-west1`
- Cloud SQL instance: `natura-db` (PostgreSQL 15, f1-micro)
- Database: `natura`, User: `natura_user`
- Artifact Registry: `natura-backend` (Docker, europe-west1)
- Cloud Storage bucket: `natura-tours-media`

## Architecture
- **Backend:** NestJS (TypeScript), containerized, deployed on Cloud Run
- **Agency Web Panel:** Next.js 14 (App Router), deployed on Firebase Hosting
- **Mobile App:** Expo (React Native), distributed via EAS
- **Database:** Cloud SQL PostgreSQL 15 via Cloud Run's Unix socket
- **File Storage:** GCP Cloud Storage (tour photos)
- **Auth:** JWT-based, separate roles for agency users and regular users

## Two Separate Applications

### 1. Agency Web Panel (Next.js 14)
Agency admins log in and manage their tours and bookings.

**Pages:**
- `/login` — agency login
- `/dashboard` — overview: total tours, total bookings, recent activity
- `/tours` — list of agency's tours (published + draft)
- `/tours/new` — create new tour form
- `/tours/[id]` — edit tour
- `/tours/[id]/bookings` — see all booking form submissions for that tour
- `/profile` — agency profile settings

**Tour creation fields:**
- Name
- Description
- Location (text + optional coordinates)
- Tour date(s) — fixed dates, agency sets them
- Altitude (meters) — integer
- Difficulty — enum: easy / medium / hard / extreme
- Distance (km) — decimal
- Max participants — integer
- Photos — upload to GCP Cloud Storage (multiple)
- Status — draft / published

### 2. Mobile App (Expo / React Native)
Users discover tours and submit booking requests.

**Screens:**
- Onboarding / splash
- Register / Login
- Home — featured + upcoming tours feed
- Explore — browse all tours with filters (difficulty, date range, region)
- Tour Detail — full info, photos gallery, altitude/distance/difficulty badges, points preview
- Booking Form — name, surname, phone, email, participant count, notes, submit
- My Bookings — list of submitted bookings
- Profile — user info, total points, points history per tour
- Leaderboard (optional v2)

## Database Schema

### agencies
```sql
id UUID PRIMARY KEY DEFAULT gen_random_uuid()
name VARCHAR NOT NULL
email VARCHAR UNIQUE NOT NULL
password_hash VARCHAR NOT NULL
logo_url VARCHAR
phone VARCHAR
description TEXT
created_at TIMESTAMPTZ DEFAULT NOW()
```

### tours
```sql
id UUID PRIMARY KEY DEFAULT gen_random_uuid()
agency_id UUID REFERENCES agencies(id)
name VARCHAR NOT NULL
description TEXT
location_name VARCHAR NOT NULL
latitude DECIMAL
longitude DECIMAL
altitude_meters INTEGER NOT NULL
difficulty VARCHAR CHECK (difficulty IN ('easy','medium','hard','extreme')) NOT NULL
distance_km DECIMAL NOT NULL
max_participants INTEGER NOT NULL
photo_urls TEXT[] DEFAULT '{}'
status VARCHAR CHECK (status IN ('draft','published')) DEFAULT 'draft'
points INTEGER NOT NULL  -- pre-calculated on save
created_at TIMESTAMPTZ DEFAULT NOW()
updated_at TIMESTAMPTZ DEFAULT NOW()
```

### tour_dates
```sql
id UUID PRIMARY KEY DEFAULT gen_random_uuid()
tour_id UUID REFERENCES tours(id) ON DELETE CASCADE
date DATE NOT NULL
available_slots INTEGER NOT NULL
created_at TIMESTAMPTZ DEFAULT NOW()
```

### users
```sql
id UUID PRIMARY KEY DEFAULT gen_random_uuid()
name VARCHAR NOT NULL
surname VARCHAR NOT NULL
email VARCHAR UNIQUE NOT NULL
password_hash VARCHAR NOT NULL
phone VARCHAR
total_points INTEGER DEFAULT 0
created_at TIMESTAMPTZ DEFAULT NOW()
```

### bookings
```sql
id UUID PRIMARY KEY DEFAULT gen_random_uuid()
tour_id UUID REFERENCES tours(id)
tour_date_id UUID REFERENCES tour_dates(id)
user_id UUID REFERENCES users(id)
name VARCHAR NOT NULL
surname VARCHAR NOT NULL
email VARCHAR NOT NULL
phone VARCHAR NOT NULL
participant_count INTEGER NOT NULL DEFAULT 1
notes TEXT
status VARCHAR CHECK (status IN ('pending','confirmed','completed','cancelled')) DEFAULT 'pending'
created_at TIMESTAMPTZ DEFAULT NOW()
```

### user_points_log
```sql
id UUID PRIMARY KEY DEFAULT gen_random_uuid()
user_id UUID REFERENCES users(id)
tour_id UUID REFERENCES tours(id)
booking_id UUID REFERENCES bookings(id)
points_earned INTEGER NOT NULL
awarded_at TIMESTAMPTZ DEFAULT NOW()
```

## Points Formula
Points are calculated when a tour is created/updated and stored in `tours.points`.
Points are awarded to a user when agency marks a booking as `completed`.

```
altitude_points = floor(altitude_meters / 500) * 100
distance_points = floor(distance_km / 10) * 50
difficulty_multiplier = { easy: 1, medium: 1.5, hard: 2, extreme: 3 }
total_points = floor((altitude_points + distance_points) * difficulty_multiplier)
```

When booking status changes to `completed`:
- Insert row into `user_points_log`
- Increment `users.total_points` by the tour's points value

## API Endpoints (NestJS)

### Auth
- `POST /auth/agency/login`
- `POST /auth/agency/register`
- `POST /auth/user/register`
- `POST /auth/user/login`

### Tours (public)
- `GET /tours` — all published tours (filters: difficulty, date, location)
- `GET /tours/:id` — single tour detail

### Tours (agency — protected)
- `GET /agency/tours` — own tours
- `POST /agency/tours` — create tour
- `PUT /agency/tours/:id` — update tour
- `DELETE /agency/tours/:id` — delete tour
- `POST /agency/tours/:id/dates` — add date
- `DELETE /agency/tours/:id/dates/:dateId` — remove date
- `GET /agency/tours/:id/bookings` — view bookings
- `PUT /agency/bookings/:id/status` — update booking status (triggers points on completed)

### Bookings (user — protected)
- `POST /bookings` — submit booking form
- `GET /bookings/my` — user's own bookings

### Users (user — protected)
- `GET /users/me` — profile + total points
- `GET /users/me/points` — points history

### Media
- `POST /media/upload` — upload photo to GCP Cloud Storage, returns URL

## Environment Variables (Backend)
```
DATABASE_URL=postgresql://natura_user:PASSWORD@/natura?host=/cloudsql/treklyapp:europe-west1:natura-db
GCP_PROJECT_ID=treklyapp
GCP_STORAGE_BUCKET=natura-tours-media
JWT_SECRET=
JWT_AGENCY_SECRET=
PORT=8080
```

## No Mock / Seed Data Policy
- Zero seed files
- Zero mock data
- Zero placeholder tours or agencies
- One demo agency can be created manually via the register endpoint after deployment
- All data must come from real usage of the app

## Deployment
- Backend: `gcloud run deploy trekly-api --region europe-west1 --add-cloudsql-instances treklyapp:europe-west1:natura-db`
- Agency panel: Firebase Hosting via `firebase deploy`
- Mobile: EAS Build + EAS Submit

## Tech Stack Summary
| Layer | Technology |
|---|---|
| Backend | NestJS + TypeScript |
| Agency Web | Next.js 14 App Router + Tailwind |
| Mobile | Expo SDK 51 + React Native |
| Database | PostgreSQL 15 on Cloud SQL |
| Storage | GCP Cloud Storage |
| Container | Docker → Artifact Registry → Cloud Run |
| Auth | JWT (separate secrets for agency vs user) |
| Mobile builds | EAS (Expo Application Services) |
