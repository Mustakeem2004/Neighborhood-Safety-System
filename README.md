# Neighborhood Safety & Incident Reporting System

A full-stack web application that allows residents to report and track local incidents in real-time.

## Tech Stack

- HTML, CSS, JavaScript
- Node.js, Express.js
- MongoDB

## Features

- User authentication (JWT)
- Admin approval system
- Incident reporting
- Real-time style tracking through live dashboard refresh
- Filters by type, location, status, and keyword

## Pages

- index.html (Home)
- login.html
- register.html
- dashboard.html
- report.html
- admin.html

## API Endpoints

### Auth

- POST /api/register
- POST /api/login

### Incidents

- POST /api/incidents
- GET /api/incidents
- GET /api/incidents/:id

### Admin

- GET /api/users
- PUT /api/users/:id/approve
- PUT /api/incidents/:id/status
- DELETE /api/incidents/:id

## Setup

1. Clone repo
2. Install dependencies:
   npm install
3. Create `.env` file from `.env.example`:
   - MONGO_URI=your_mongo_url
   - JWT_SECRET=your_secret
4. Run server:
   npm start

## Learning Path

- Start simple (no map, no file upload).
- Then add Leaflet or Google Maps, image upload, and websocket notifications as upgrades.

## Author

Mustakeem Malik
