Detta är ett Node.js/Express-API för att hantera bokningar i en coworking-miljö. Användare kan registrera sig, boka rum och administrera bokningar i realtid.

## setup
```bash
git clone https://github.com/<user>/booking-backend.git
cd booking-backend
npm install



cd booking backend
npm start


Api-dokumentation
POST /register – Skapa konto

POST /login – Logga in (returnerar JWT-token)

Rum (endast Admin)
POST /rooms – Skapa rum

GET /rooms – Lista alla rum

PUT /rooms/:id – Uppdatera rum

DELETE /rooms/:id – Radera rum


Bokningar
POST /bookings – Skapa ny bokning

GET /bookings – Hämta bokningar

PUT /bookings/:id – Uppdatera bokning

DELETE /bookings/:id – Ta bort bokning



stack:
- Node.js & Express
- MongoDB + Mongoose
- Redis (Caching av rum)
- JWT 
- Socket.IO (Notifieringar)
- Deployment: Render
