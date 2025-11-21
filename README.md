Booking Backend

Backend-API för bokningsplattformen med autentisering, rumshantering, bokningar, användaradministration och realtidsnotiser via Socket.io.

Installation
git clone https://github.com/IsacBergstedt/booking-backend.git
cd booking-backend
npm install


Skapa en .env-fil:

PORT=5000
MONGO_URI=mongodb+srv://isacbergstedt:isaclösen@cluster0.ie4viad.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0

JWT_SECRET=superhemligjwtkod
UPSTASH_REDIS_URL=AXnwAAIncDJjNjkzYjYwYWE5ODM0M2U4YjljOTIyMGMyZTIxNmQ4MHAyMzEyMTY
UPSTASH_REDIS_TOKEN=https://brave-eel-31216.upstash.io


Starta servern:

npm start

API-Dokumentation

Alla skyddade endpoints kräver Authorization: Bearer <token>.

Autentisering
Registrera
POST /api/auth/register
Body:
{
  "username": "namn",
  "password": "lösenord",
  "role": "Admin" eller "User" 
}

Logga in
POST /api/auth/login
Body:
{
  "username": "namn",
  "password": "lösenord"
  "role": "Admin" eller "User" 
}


Returnerar JWT-token:

{
  "token": "...",
  "user": {
    "id": "...",
    "username": "...",
    "role": "Admin"
  }
}

Användare (User Management)
Hämta alla användare (Endast Admin)
GET /api/users

Hämta en specifik användare
GET /api/users/:id

Uppdatera användare (Admin eller ägaren själv)
PUT /api/users/:id
Body (exempel):
{
  "username": "nyttNamn",
  "role": "User"
}

Ta bort användare (Endast Admin)
DELETE /api/users/:id

Rum (Rooms) – Endast Admin
Skapa rum
POST /api/rooms
Body:
{
  "name": "Konferensrum A",
  "capacity": 12,
  "type": "workspace"
}

Hämta alla rum
GET /api/rooms

Uppdatera rum
PUT /api/rooms/:id
Body:
{
  "name": "Nytt namn",
  "capacity": 8
}

Ta bort rum
DELETE /api/rooms/:id

Bokningar (Bookings)
Skapa bokning
POST /api/bookings
Body:
{
  "roomId": "rummets_id",
  "startTime": "2025-01-01T10:00",
  "endTime": "2025-01-01T11:00"
}

Hämta bokningar

Admin: Alla bokningar

User: Endast sina egna

GET /api/bookings

Uppdatera bokning
PUT /api/bookings/:id
Body:
{
  "startTime": "2025-01-01T12:00",
  "endTime": "2025-01-01T13:00"
}

Ta bort bokning
DELETE /api/bookings/:id

Realtidsnotiser (Socket.io)

Servern skickar events:

newBooking

updateBooking

deleteBooking

newRoom

updateRoom

deleteRoom

Klient exempel:

socket.on("newBooking", data => console.log(data));


Teknisk Stack

Node.js

Express.js

MongoDB + Mongoose

Upstash Redis (caching av rum)

JWT autentisering

bcrypt lösenordshantering

Socket.IO

Deployment: Render
