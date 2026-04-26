# TaskFlow Pro — Backend (Phase 1: Auth)

Production-ready authentication system built with Express, MongoDB, and JWT.

## Setup

```bash
cd backend
cp .env.example .env   # then edit MONGO_URI and JWT_SECRET
npm install
```

## Run

```bash
npm run dev    # development (hot reload)
npm start      # production
```

Server starts on `http://localhost:5000` by default.

## API Endpoints

| Method | Path              | Auth     | Description              |
| ------ | ----------------- | -------- | ------------------------ |
| POST   | /api/auth/register | Public   | Create a new user        |
| POST   | /api/auth/login    | Public   | Login & receive token    |
| GET    | /api/auth/me       | Bearer   | Get current user profile |
| GET    | /api/protected     | Bearer   | Test protected route     |
| GET    | /                  | Public   | Health check             |

## Example Requests

### Register

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Alice","email":"alice@example.com","password":"secret123"}'
```

### Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@example.com","password":"secret123"}'
```

### Get Current User

```bash
curl http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer <token>"
```

### Protected Route

```bash
curl http://localhost:5000/api/protected \
  -H "Authorization: Bearer <token>"
```

## Environment Variables

| Variable   | Description                  | Default                             |
| ---------- | ---------------------------- | ----------------------------------- |
| PORT       | Server port                  | 5000                                |
| MONGO_URI  | MongoDB connection string    | mongodb://localhost:27017/taskflow   |
| JWT_SECRET | Secret for signing JWTs      | *(required)*                        |
