# todo-backend

A Node.js and PostgreSQL backend for a Todo application with strict code consistency and health monitoring.

## 🚀 Features

- RESTful API built with Express.js
- PostgreSQL database with connection pooling
- Centralized configuration management
- Health check endpoint with database connectivity verification
- Strict code consistency with ESLint and Prettier
- Hot-reloading development environment with nodemon
- Graceful shutdown handling

## 📋 Prerequisites

- **Node.js** 18+ 
- **PostgreSQL** 14+ (running locally)
- **npm** or **yarn**

## 🛠️ Local Setup

### 1. Clone the repository

```bash
git clone https://github.com/nikitas-16/todo-backend.git
cd todo-backend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the root directory based on `.env.example`:

```bash
cp .env.example .env
```

Edit the `.env` file with your PostgreSQL configuration:

```env
PORT=3000

DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=todo_db
```

### 4. Set up PostgreSQL database

Make sure PostgreSQL is running locally and create the database:

```bash
psql -U postgres
CREATE DATABASE todo_db;
\q
```

### 5. Run the application

**Development mode (with hot-reloading):**

```bash
npm run dev
```

**Production mode:**

```bash
npm start
```

The server will start on `http://localhost:3000` (or the port specified in your `.env` file).

## 🧪 Testing

### Health Check Endpoint

Test the health endpoint to verify server and database connectivity:

```bash
curl http://localhost:3000/health
```

**Expected Response (Success - 200 OK):**

```json
{
  "status": "UP",
  "database": "connected",
  "timestamp": "2026-01-27T09:47:08.159Z"
}
```

**Expected Response (Failure - 503 Service Unavailable):**

```json
{
  "status": "DOWN",
  "database": "disconnected",
  "timestamp": "2026-01-27T09:47:08.159Z"
}
```

### Code Quality

**Run linter:**

```bash
npm run lint
```

**Fix linting issues automatically:**

```bash
npm run lint:fix
```

**Format code with Prettier:**

```bash
npm run format
```

## 📁 Project Structure

```
todo-backend/
├── src/
│   ├── config/
│   │   ├── index.js      # Centralized configuration
│   │   └── db.js         # PostgreSQL connection pool
│   ├── routes/
│   │   └── health.js     # Health check route
│   ├── app.js            # Express app configuration
│   └── server.js         # Server entry point
├── .env.example          # Environment variables template
├── .eslintrc.json        # ESLint configuration
├── .prettierrc           # Prettier configuration
├── .editorconfig         # EditorConfig settings
├── .gitignore           # Git ignore rules
└── package.json         # Project dependencies and scripts
```

## 🔧 Available Scripts

- `npm start` - Start the server in production mode
- `npm run dev` - Start the server in development mode with hot-reloading
- `npm run lint` - Run ESLint to check code quality
- `npm run lint:fix` - Automatically fix linting issues
- `npm run format` - Format code with Prettier

## 🛡️ Error Handling

The application includes comprehensive error handling:

- **Environment Validation:** The app will exit with a descriptive error if required environment variables are missing
- **Database Connection:** The health endpoint returns a 503 status if the database is unreachable
- **Graceful Shutdown:** The app handles SIGTERM and SIGINT signals to close database connections before exiting

## 💡 Development Tips

- The application uses a **Connection Pool** (`pg.Pool`) for better performance under concurrent requests
- Database connections are automatically managed and reused
- The server separates app logic from the server listener for easier testing
- Hot-reloading is enabled in development mode for faster iteration

## 📝 License

ISC

