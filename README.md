# Task Manager

A full-stack Task Management project built with Angular and Node.js, using SQLite and Prisma as the database.

## Architecture & Tech Stack

- **Frontend**: Angular 18, Signals, RxJS, Tailwind CSS.
- **Backend**: Node.js, Express, TypeScript.
- **Database**: SQLite with Prisma.

## Prerequisites

- Node.js (v18 or higher)
- npm

## How to Run

### 1. Backend Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/task-manager-pro.git
   ```

2. Install the dependencies for the server:
   ```bash
   cd server && npm install
   ```

2. Create a `.env` file in the `server` directory:
   ```env
   DATABASE_URL="file:./dev.db"
   ```

3. Initialize the SQLite database and Prisma client:
   ```bash
   npx prisma db push
   ```
4. Start the server:
   ```bash
   npm start
   ```
   *The server runs on http://localhost:3000*

### 2. Frontend Setup

1. Open a **new** terminal and navigate to the `client` directory:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Angular application:
   ```bash
   npm start
   ```
   *The frontend runs on http://localhost:4200*

## API Endpoints
- `GET /api/tasks` - Retrieve tasks (supports `?page`, `?pageSize`, `?sortBy`, `?status`)
- `POST /api/tasks` - Create a new task
- `PUT /api/tasks/:id` - Update a task
- `PATCH /api/tasks/:id/status` - Update task status
- `DELETE /api/tasks/:id` - Delete a task
