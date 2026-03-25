# Smart Society Management System (SSMS)

A modern, multi-tenant SaaS platform for streamlined residential society administration, security, and community engagement.

## 🚀 Overview
SSMS is a full-stack MERN application that enables residential societies to manage their operations within isolated, secure environments. Features include high-performance task management with deadlines, automated billing with PDF exports, real-time security visitor logs with webcam integration, and community engagement forums.

## 🏗️ Technical Architecture
- **Isolated Multi-Tenancy**: Dynamic MongoDB connection switching ensures each society's data remains private and secure.
- **Real-Time Communication**: Integrated Socket.IO for instant alerts (Assignments, Visitor arrivals, Notice board updates).
- **Background Automation**: Automated task escalation and penalty engine via Node-Cron.
- **Advanced UI/UX**: Premium Glassmorphism design system built with Tailwind CSS, Framer Motion, and Recharts.

## 🛠️ Tech Stack
- **Frontend**: React.js, Tailwind CSS, Framer Motion, Lucide Icons, Recharts, Axios.
- **Backend**: Node.js, Express, MongoDB, Mongoose, Socket.IO, JWT, Node-Cron, PDFKit/jspdf.

## ✨ Key Features
- **Administrator Dashboard**: Society-wide analytics, financial tracking, and vendor management.
- **Resident Portal**: Maintenance ticket lifecycle tracking, visitor pre-approval, bill payments, and community feed.
- **Vendor Portal**: Deadline-driven task management, real-time assignment alerts, and automated performance ratings.
- **Security Guard Portal**: Digital visitor logs with webcam capture and instant resident notification.
- **Global Search**: System-wide cross-collection search (Ctrl+K).

## 📄 Documentation
For detailed technical information, refer to the following documents in the `docs/` folder:
- [Project Overview](./docs/project_overview.md)
- [Technical Architecture](./docs/technical_architecture.md)
- [Features Walkthrough](./docs/features_walkthrough.md)

## 🚦 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB (Running locally or on Atlas)

### 1. Configure Environment Variables
Create a `.env` file in the `backend/` directory:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

### 2. Setup Backend
```powershell
cd backend
npm install
npm run dev
```

### 3. Setup Frontend
```powershell
cd frontend
npm install
npm run dev
```

---
*Built with ❤️ for better community management.*
