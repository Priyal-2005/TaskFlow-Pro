# TaskFlow Pro — Backend

Production-ready backend with authentication, project/task management, RBAC, real-time updates, activity logs, and notifications.

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

Server starts on the port specified in `.env` (default 5000).

## API Endpoints

### Auth

| Method | Path               | Auth   | Description              |
| ------ | ------------------ | ------ | ------------------------ |
| POST   | /api/auth/register | Public | Create a new user        |
| POST   | /api/auth/login    | Public | Login & receive token    |
| GET    | /api/auth/me       | Bearer | Get current user profile |

### Projects

| Method | Path                          | Auth          | Description           |
| ------ | ----------------------------- | ------------- | --------------------- |
| POST   | /api/projects                 | Bearer        | Create project        |
| GET    | /api/projects                 | Bearer        | List user's projects  |
| GET    | /api/projects/:id             | Bearer+Member | Get single project    |
| PUT    | /api/projects/:id             | Bearer+Owner  | Update project        |
| DELETE | /api/projects/:id             | Bearer+Owner  | Delete project        |
| POST   | /api/projects/:id/add-member  | Bearer+Owner  | Add member to project |

### Tasks

| Method | Path                          | Auth                 | Description          |
| ------ | ----------------------------- | -------------------- | -------------------- |
| POST   | /api/tasks                    | Bearer+Member        | Create task          |
| GET    | /api/tasks/project/:projectId | Bearer+Member        | List project tasks   |
| PUT    | /api/tasks/:id                | Bearer+Member        | Update task          |
| DELETE | /api/tasks/:id                | Bearer+Creator/Owner | Delete task          |

### Activity Log

| Method | Path                              | Auth          | Description            |
| ------ | --------------------------------- | ------------- | ---------------------- |
| GET    | /api/activity/project/:projectId  | Bearer+Member | Get project activity   |

### Notifications

| Method | Path                         | Auth   | Description              |
| ------ | ---------------------------- | ------ | ------------------------ |
| GET    | /api/notifications           | Bearer | Get user notifications   |
| PUT    | /api/notifications/:id/read  | Bearer | Mark notification as read|

### Utility

| Method | Path           | Auth   | Description          |
| ------ | -------------- | ------ | -------------------- |
| GET    | /api/protected | Bearer | Test protected route |
| GET    | /              | Public | Health check         |

## Socket.io Events

Connect to the server URL with a Socket.io client.

### Client → Server

| Event           | Payload     | Description           |
| --------------- | ----------- | --------------------- |
| join_project    | projectId   | Join a project room   |
| leave_project   | projectId   | Leave a project room  |

### Server → Client

| Event           | Payload     | Description           |
| --------------- | ----------- | --------------------- |
| task_created    | task object | New task created       |
| task_updated    | task object | Task was updated       |
| task_deleted    | taskId      | Task was deleted       |
| project_updated | project obj | Project was updated    |

## Example Requests

### Register

```bash
curl -X POST http://localhost:5001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Alice","email":"alice@example.com","password":"secret123"}'
```

### Create Project

```bash
curl -X POST http://localhost:5001/api/projects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"name":"My Project","description":"A new project"}'
```

### Create Task

```bash
curl -X POST http://localhost:5001/api/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"title":"Setup CI/CD","project":"<projectId>","assignedTo":"<userId>"}'
```

### Get Activity Log

```bash
curl http://localhost:5001/api/activity/project/<projectId> \
  -H "Authorization: Bearer <token>"
```

### Get Notifications

```bash
curl http://localhost:5001/api/notifications \
  -H "Authorization: Bearer <token>"
```

## Environment Variables

| Variable   | Description               | Default                           |
| ---------- | ------------------------- | --------------------------------- |
| PORT       | Server port               | 5001                              |
| MONGO_URI  | MongoDB connection string | mongodb://localhost:27017/taskflow |
| JWT_SECRET | Secret for signing JWTs   | *(required)*                      |
