# TaskFlow Pro — Backend

Production-grade backend with JWT auth, project/task management, RBAC, real-time updates (Socket.io), activity logs, notifications, Cloudinary file uploads, Zod validation, rate limiting, and global error handling.

## Setup

```bash
cd backend
cp .env.example .env   # edit all values
npm install
```

## Run

```bash
npm run dev    # development (hot reload + morgan logging)
npm start      # production
```

## Environment Variables

| Variable                | Description               | Required |
| ----------------------- | ------------------------- | -------- |
| PORT                    | Server port               | No (5000)|
| MONGO_URI               | MongoDB connection string | Yes      |
| JWT_SECRET              | Secret for signing JWTs   | Yes      |
| CLOUDINARY_CLOUD_NAME   | Cloudinary cloud name     | Yes*     |
| CLOUDINARY_API_KEY      | Cloudinary API key        | Yes*     |
| CLOUDINARY_API_SECRET   | Cloudinary API secret     | Yes*     |
| NODE_ENV                | development / production  | No       |

\* Required only for file upload features.

## Project Structure

```
src/
├── config/
│   ├── cloudinary.js        # Cloudinary SDK config
│   └── db.js                # MongoDB connection
├── controllers/
│   ├── authController.js    # Register, login, getMe
│   ├── projectController.js # Project CRUD + add-member
│   └── taskController.js    # Task CRUD + file upload
├── middleware/
│   ├── auth.js              # JWT verification
│   ├── errorHandler.js      # Global error handler
│   ├── role.js              # RBAC (owner/member/authorizeProjectRole)
│   ├── upload.js            # Multer + Cloudinary storage
│   └── validate.js          # Zod validation factory
├── models/
│   ├── Activity.js          # Activity log entries
│   ├── Notification.js      # Per-user notifications
│   ├── Project.js           # Projects with owner + members
│   ├── Task.js              # Tasks with attachments
│   └── User.js              # Users with password hashing
├── routes/
│   ├── activity.js          # Activity log endpoints
│   ├── auth.js              # Auth endpoints
│   ├── notification.js      # Notification endpoints
│   ├── project.js           # Project endpoints
│   └── task.js              # Task endpoints
├── services/
│   ├── activityService.js   # Log + query activities
│   └── notificationService.js # Notify users/members
├── sockets/
│   └── socket.js            # Socket.io init + room management
├── validators/
│   └── schemas.js           # All Zod schemas
└── server.js                # Express app entry point
```

## API Endpoints

### Auth

| Method | Path               | Auth   | Description              |
| ------ | ------------------ | ------ | ------------------------ |
| POST   | /api/auth/register | Public | Register (Zod validated) |
| POST   | /api/auth/login    | Public | Login (Zod validated)    |
| GET    | /api/auth/me       | Bearer | Get current user         |

### Projects

| Method | Path                          | Auth          | Description           |
| ------ | ----------------------------- | ------------- | --------------------- |
| POST   | /api/projects                 | Bearer        | Create (Zod validated)|
| GET    | /api/projects                 | Bearer        | List user's projects  |
| GET    | /api/projects/:id             | Bearer+Member | Get single project    |
| PUT    | /api/projects/:id             | Bearer+Owner  | Update (Zod validated)|
| DELETE | /api/projects/:id             | Bearer+Owner  | Delete project        |
| POST   | /api/projects/:id/add-member  | Bearer+Owner  | Add member (Zod)      |

### Tasks

| Method | Path                          | Auth                 | Description          |
| ------ | ----------------------------- | -------------------- | -------------------- |
| POST   | /api/tasks                    | Bearer+Member        | Create (Zod)         |
| GET    | /api/tasks/project/:projectId | Bearer+Member        | List project tasks   |
| PUT    | /api/tasks/:id                | Bearer+Member        | Update (Zod)         |
| DELETE | /api/tasks/:id                | Bearer+Creator/Owner | Delete task          |
| POST   | /api/tasks/:id/upload         | Bearer+Member        | Upload attachment    |

### Activity

| Method | Path                              | Auth          | Description          |
| ------ | --------------------------------- | ------------- | -------------------- |
| GET    | /api/activity/project/:projectId  | Bearer+Member | Project activity log |

### Notifications

| Method | Path                         | Auth   | Description              |
| ------ | ---------------------------- | ------ | ------------------------ |
| GET    | /api/notifications           | Bearer | User's notifications     |
| PUT    | /api/notifications/:id/read  | Bearer | Mark as read             |

## Socket.io Events

| Direction | Event           | Payload       | Description           |
| --------- | --------------- | ------------- | --------------------- |
| Client→   | join_project    | projectId     | Join project room     |
| Client→   | leave_project   | projectId     | Leave project room    |
| →Client   | task_created    | task object   | New task              |
| →Client   | task_updated    | task object   | Task modified         |
| →Client   | task_deleted    | taskId        | Task removed          |
| →Client   | project_updated | project object| Project modified      |

## Production Features

- **Rate Limiting**: 100 requests per 15 minutes per IP
- **Helmet**: HTTP security headers
- **Morgan**: Request logging (dev format)
- **Zod Validation**: Input validation with structured error responses
- **Global Error Handler**: Consistent JSON errors, no stack traces in production
- **RBAC**: `authorizeProjectRole("owner")` / `authorizeProjectRole("member")`
- **File Uploads**: Cloudinary via multer-storage-cloudinary (10MB limit)
