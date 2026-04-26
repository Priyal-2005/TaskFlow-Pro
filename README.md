# TaskFlow Pro

A comprehensive, production-grade project management platform built with the MERN stack, Socket.io for real-time collaboration, and a modern Notion/Linear-inspired UI.

## Features

- **User Authentication**: Secure sign-up and login system using JWT and `bcryptjs`.
- **Project Management**: Create, update, and delete projects. Add members to collaborate.
- **Task Management**: Kanban-style task organization (To Do, In Progress, Done).
- **My Tasks Dashboard**: Dedicated global view of all tasks assigned to the user across all projects with robust filtering.
- **Role-Based Access Control (RBAC)**: Distinct permissions for project owners and members.
- **Real-time Collaboration**: Instant UI updates across all clients via Socket.io without page refreshes.
- **File Uploads**: Direct Cloudinary integration for uploading task attachments.
- **Activity Auditing**: Comprehensive logging of all project and task activities.
- **Notification System**: User-targeted notifications and toast alerts.
- **Production Hardening**: Global error handling, rate limiting, Helmet security, and Zod schema validation.
- **Modern UI**: Clean, minimal interface built with Tailwind CSS v4, Lucide icons, and Zustand for state management.

## Tech Stack

### Frontend
- **Framework**: React (Vite)
- **Styling**: Tailwind CSS v4
- **State Management**: Zustand
- **Routing**: React Router DOM
- **API/Real-time**: Axios, Socket.io-client
- **Icons**: Lucide React

### Backend
- **Server**: Node.js, Express.js
- **Database**: MongoDB (Mongoose)
- **Real-time**: Socket.io
- **Authentication**: JWT
- **Storage**: Multer, Cloudinary (multer-storage-cloudinary)
- **Validation**: Zod
- **Security & Logging**: Helmet, Express-Rate-Limit, Morgan

## Prerequisites

- Node.js (v18 or higher recommended)
- MongoDB (local or Atlas cluster)
- Cloudinary Account (for file uploads)

## Getting Started

### 1. Backend Setup

Navigate to the backend directory and install dependencies:

```bash
cd backend
npm install
```

Configure your environment variables by creating a `.env` file in the `backend` directory:

```env
PORT=5001
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
NODE_ENV=development
```

Start the backend server:

```bash
npm run dev
```

### 2. Frontend Setup

Open a new terminal, navigate to the frontend directory, and install dependencies:

```bash
cd frontend
npm install
```

*(Optional)* Configure frontend environment variables by creating a `.env` file in the `frontend` directory:

```env
VITE_API_URL=http://localhost:5001/api
```

Start the frontend development server:

```bash
npm run dev
```

## Usage

- **Live Application**: Access the deployed frontend at https://task-flow-pro-pi.vercel.app/
- **Live API**: The backend API is available at https://taskflow-pro-s8d7.onrender.com/api

To run locally instead:
- Open `http://localhost:5173` for the frontend.
- API is available at `http://localhost:5001/api`.

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET  /api/auth/me` - Get current user profile

### Projects
- `POST   /api/projects` - Create a new project
- `GET    /api/projects` - Get all user's projects
- `GET    /api/projects/:id` - Get a single project
- `PUT    /api/projects/:id` - Update a project (Owner only)
- `DELETE /api/projects/:id` - Delete a project (Owner only)
- `POST   /api/projects/:id/add-member` - Add member to project (Owner only)

### Tasks
- `POST   /api/tasks` - Create a new task
- `GET    /api/tasks` - Get all tasks assigned to current user
- `GET    /api/tasks/project/:projectId` - Get all tasks for a project
- `PUT    /api/tasks/:id` - Update a task
- `DELETE /api/tasks/:id` - Delete a task (Creator/Owner only)
- `POST   /api/tasks/:id/upload` - Upload file attachment to task

### Activity & Notifications
- `GET /api/activity/project/:projectId` - Get project activity log
- `GET /api/notifications` - Get user notifications
- `PUT /api/notifications/:id/read` - Mark notification as read

## Socket.io Events

Clients join project rooms via `join_project` to listen for:
- `task_created`
- `task_updated`
- `task_deleted`
- `project_updated`

## Running Tests

Integration tests for the backend pipeline are provided via bash scripts:

```bash
cd backend
bash test_phase4.sh
```

## Deployed Link

Backend: https://taskflow-pro-s8d7.onrender.com/
Frontend: https://task-flow-pro-pi.vercel.app/