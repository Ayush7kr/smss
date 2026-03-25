# Smart Society Management System (SSMS) - Technical Architecture

This document provides a deep dive into the technical implementation, architectural patterns, and security models of the SSMS platform.

---

## 1. Database Architecture: Isolated Multi-Tenancy

The platform employs a **Logical Database Separation** strategy to ensure strict data isolation between different societies (tenants).

### A. Master Database (`ssms_master`)
- **Purpose**: Stores global state and metadata about the platform.
- **Collections**:
  - `Tenants`: Metadata for each society (Name, ID, Status, Admin details).
  - `SuperAdmins`: Credentials for platform-level administrators.

### B. Tenant Databases (`ssms_tenant_{tenantId}`)
- **Purpose**: Discrete databases for each society, created/switched dynamically at runtime.
- **Implementation**: Utilizes `mongoose.connection.useDb(dbName)` to switch context based on the incoming request's `tenantId`.
- **Collections**: `Users`, `Complaints`, `Bills`, `Visitors`, `Notifications`, `Posts`, `Polls`.

---

## 2. Request Lifecycle & Middleware

### A. Tenant Scoping (`tenantMiddleware`)
Every request targeting tenant-specific data must pass through the `tenantMiddleware`.
1. **Extraction**: Identifies `tenantId` from the JWT payload, request body, or headers.
2. **Context Switching**: Calls `getTenantDB(tenantId)` to retrieve the specific society's connection.
3. **Injection**: Attaches `req.tenantDb` to the request object, allowing controllers to perform queries against the correct isolated environment.

### B. Authentication (`authMiddleware`)
- **JWT-Based**: Uses JSON Web Tokens stored in HTTP-only cookies for stateless authentication.
- **Payload**: Contains `userId`, `role`, and `tenantId`.
- **RBAC**: Role-Based Access Control is enforced at both the route level (Express middleware) and UI level (Conditional rendering).

---

## 3. Real-Time Infrastructure (Socket.IO)

SSMS implements a bidirectional communication layer for instantaneous updates.
- **Authentication**: Socket connections are authenticated using the same JWT used for HTTP requests.
- **Rooms**: 
  - `socket.join(tenantId)`: For society-wide broadcasts (Notice board updates).
  - `socket.join(userId)`: For direct targeting (Personalized notifications).
  - `socket.join(tenantId_role)`: For role-specific alerts (e.g., notifying all Admins of a new complaint).

---

## 4. Maintenance Logic & Automation

### A. Dynamic Performance Metrics
Vendors' ratings are calculated in real-time based on their historical metadata:
- **Formula**: `(CompletedOnTime / TotalAssigned) * 5`.
- **Latency Tracking**: Compares `completionDate` against the initial `dueDate` at the moment of task resolution.

### B. Automated Escalation (CRON)
- **Engine**: `node-cron` running background processes.
- **Logic**: Iterates through all `Approved` societies, identifies `Assigned` or `In Progress` tasks where `dueDate < now`, and marks them as `Escalated`.

---

## 5. Frontend Architecture

### A. State Management
- **AuthContext**: A React Context provider that manages the global user state and persistence across sessions.
- **API Interceptor**: A centralized Axios instance with `withCredentials: true` to handle secure cookie-based authentication.

### B. UI Components & Styling
- **Tailwind CSS**: Utility-first styling with custom glassmorphism components.
- **Framer Motion**: Used for staggered list animations and modal transitions.
- **Recharts**: D3-based charting handles administrative data visualization directly from the backend aggregation pipelines.

---

## 6. Directory Structure Overview
```text
ssms/
├── backend/
│   ├── src/
│   │   ├── config/       # DB and Socket initializations
│   │   ├── controllers/  # Business logic (Tenant-scoped)
│   │   ├── middleware/   # Auth and Tenant identification
│   │   ├── models/       # Shared Schemas
│   │   └── services/     # CRON and background tasks
│   └── server.js         # Entry point (HTTP + Socket.IO)
└── frontend/
    ├── src/
    │   ├── components/   # Reusable UI elements
    │   ├── context/      # Global state (Auth)
    │   ├── pages/        # Dashboard views
    │   └── utils/        # API and helper functions
```
