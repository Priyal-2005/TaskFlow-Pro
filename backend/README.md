# TaskFlow Pro — Backend

Production-ready backend with authentication, project management, task management, and role-based access control.

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

### Auth

| Method | Path               | Auth   | Description              |
| ------ | ------------------ | ------ | ------------------------ |
| POST   | /api/auth/register | Public | Create a new user        |
| POST   | /api/auth/login    | Public | Login & receive token    |
| GET    | /api/auth/me       | Bearer | Get current user profile |

### Projects

| Method | Path                          | Auth          | Description                 |
| ------ | ----------------------------- | ------------- | --------------------------- |
| POST   | /api/projects                 | Bearer        | Create project              |
| GET    | /api/projects                 | Bearer        | List user's projects        |
| GET    | /api/projects/:id             | Bearer+Member | Get single project          |
| PUT    | /api/projects/:id             | Bearer+Owner  | Update project              |
| DELETE | /api/projects/:id             | Bearer+Owner  | Delete project              |
| POST   | /api/projects/:id/add-member  | Bearer+Owner  | Add member to project       |

### Tasks

| Method | Path                          | Auth          | Description                 |
| ------ | ----------------------------- | ------------- | --------------------------- |
| POST   | /api/tasks                    | Bearer+Member | Create task in project      |
| GET    | /api/tasks/project/:projectId | Bearer+Member | List tasks for a project    |
| PUT    | /api/tasks/:id                | Bearer+Member | Update task                 |
| DELETE | /api/tasks/:id                | Bearer+Creator/Owner | Delete task          |

### Utility

| Method | Path           | Auth   | Description          |
| ------ | -------------- | ------ | -------------------- |
| GET    | /api/protected | Bearer | Test protected route |
| GET    | /              | Public | Health check         |

## Example Requests

### Register

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Alice","email":"alice@example.com","password":"secret123"}'
```

### Create Project

```bash
curl -X POST http://localhost:5000/api/projects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"name":"My Project","description":"A new project"}'
```

### Add Member

```bash
curl -X POST http://localhost:5000/api/projects/<projectId>/add-member \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <owner_token>" \
  -d '{"userId":"<user_id>"}'
```

### Create Task

```bash
curl -X POST http://localhost:5000/api/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"title":"Setup CI/CD","project":"<projectId>","assignedTo":"<userId>"}'
```

### Update Task Status

```bash
curl -X PUT http://localhost:5000/api/tasks/<taskId> \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"status":"done"}'
```

## Environment Variables

| Variable   | Description               | Default                           |
| ---------- | ------------------------- | --------------------------------- |
| PORT       | Server port               | 5000                              |
| MONGO_URI  | MongoDB connection string | mongodb://localhost:27017/taskflow |
| JWT_SECRET | Secret for signing JWTs   | *(required)*                      |
