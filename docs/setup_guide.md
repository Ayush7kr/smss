# 🚀 SSMS - Detailed Setup Guide

This guide provides step-by-step instructions to get the **Smart Society Management System (SSMS)** running on a new machine.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
1.  **Node.js**: [Download v18+](https://nodejs.org/)
2.  **MongoDB**: [Download MongoDB Community Server](https://www.mongodb.com/try/download/community)
    - *Alternatively, use [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) for a cloud-hosted database.*
3.  **Git**: [Download Git](https://git-scm.com/) (to clone the repo)

---

## 🛠️ Step 1: Clone the Repository
```bash
git clone <repository-url>
cd ssms
```

## 🛠️ Step 2: Configure Environment Variables
1.  Navigate to the `backend/` folder.
2.  Duplicate the `.env.example` file and rename it to `.env`.
3.  Open `.env` and configure the following:
    - `PORT`: Usually `5000`.
    - `MONGODB_URI`: Use `mongodb://localhost:27017` for local installations.
    - `JWT_SECRET`: Any random strong string.

## 🛠️ Step 3: Setup Backend
```bash
cd backend
npm install
# Seed demo data for a quick start (Recommended)
npm run seed
# Start the development server
npm run dev
```
> [!TIP]
> **Default Credentials (after seeding):**
> - **Super Admin:** `superadmin@ssms.com` / `password123`
> - **Society Admin:** `admin@soc123.com` / `password123`
> - **Resident:** `resident@soc123.com` / `password123`

## 🛠️ Step 4: Setup Frontend
Open a new terminal window/tab:
```bash
cd frontend
npm install
npm run dev
```

## 🛠️ Step 5: Access the Application
1.  Open your browser and go to `http://localhost:5173`.
2.  Login using the credentials above or register as a new user.

---

## ❓ Troubleshooting

### 1. MongoDB Connection Refused
- Ensure the MongoDB service is running on your machine.
- Check if your `MONGODB_URI` in `.env` matches the port MongoDB is listening on.

### 2. Frontend cannot reach Backend
- The frontend is hardcoded to talk to `http://localhost:5000/api`. If you changed the backend port in `.env`, you must also update it in `frontend/src/utils/api.js`.

### 3. Port already in use
- If `5000` or `5173` are in use, you can change the port in the respective configuration files or kill the process using the port.
