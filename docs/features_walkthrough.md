# Deadline-Based Complaint Management System Implementation

The Deadline-Based Complaint Workflow with Vendor Performance Tracking has been successfully structured and implemented into the Smart Society Management System (SSMS).

## Key Changes Implemented

### 1. Database Schema Expansions
- **Complaints (`Complaint.js`)**: Now tracks `assignedVendorId`, `assignedAt`, `dueDate`, `completionDate`, `isOverdue`, and `escalationCount` with a status enum supporting the expanded lifecycle (`Pending`, `Assigned`, `In Progress`, `Completed`, `Verified`, `Escalated`, `Reassigned`).
- **Vendors (`User.js`)**: Vendor profiles aggregate real-time metrics (`totalTasksAssigned`, `completedOnTime`, `completedLate`, `failedTasks`, `rating`).

### 2. Background Automation Job
- Implemented `cronService.js` utilizing `node-cron` to perform sweeping background checks of all registered tenant databases.
- When traversing, the node job checks all active tasks exceeding deadlines, forcefully marks them as "Escalated," and penalizes vendor `failedTasks` statistics automatically.

### 3. Specific REST Controller Actions
- Splitting `complaintController.js` logic across 6 discrete lifecycle boundaries ensures tighter data validation and vendor score calculation:
  - `POST /` (Resident): Initiates complaint.
  - `PUT /assign` (Admin): Formally dispatches assignment with precise timestamp limits.
  - `PUT /start` & `PUT /complete` (Vendor): Captures completion markers.
  - `PUT /verify` (Resident): Resolves tasks and processes dynamic metric ratings mapping Completion speed strictly to the initial deadline.
  - `PUT /reassign` & `PUT /escalate`

### 4. Interactive Frontend Pages
- **Complaints Hub (`Complaints.jsx`)**: The data table rendering logic received "Countdown Tags" displaying colored timestamps remaining before breach (e.g. `2 days left`), coupled with robust Modal interactions for vendor assignment dropdown operations. Action Buttons rendered conditional on both Status and user Role ensure data safety (E.g. only Residents see "Verify" on Completed tasks).
- **Vendor Portal (`VendorDashboard.jsx`)**: Upgraded to consume dynamic data (replacing generic UI mockups). Highlights priority assignments immediately along with dedicated 'Start' or 'Mark Done' action flows to feed back to the backend.
- **Vendor Directory (`Vendors.jsx`)**: Operates against the newly added `/api/vendors/performance` route sorting providers by performance rating algorithm. Each member boasts precise analytical gauges of service quality over time.
- **Admin Dashboards**: Eradicated static, randomized UI widget data across `SocietyAdminDashboard` and `SuperAdminDashboard`, replacing them with authentic system metric aggregates driven by advanced MongoDB controller queries (e.g., dynamically compiling all child Tenant DB bills for revenue calculation).

## Validation 
- Back-end REST syntax passed local compiler tests (`node -c`).
- Front-end integration checked using `vite build` compiler. 
- Discovered and rapidly fixed an intermediate missing Mongoose `populate` gap allowing for uninterrupted client-side assignment UI loops.

### 5. Advanced SaaS Upgrades (Phases 1-5)
- **Sockets & Background CRONs**: Wired `socket.io` across standard Express HTTP servers alongside standard JWT handshake hooks. Coupled `node-cron` with emission events to universally push Notification Bell state to clients on-the-fly.
- **Recharts Analytics Overlay**: Deployed dynamic bar, line, and pie graphs natively reading computed average resolution rates and monthly metric aggregations.
- **Global Search UI & PDF Invoices**: Integrated `framer-motion` search `(cmd+k)` into the Navbar fetching across 4 collections. Included `jspdf` inside the Billing dashboard to export custom PDF statements.
- **Community Feeds & Polling**: Constructed `Community.jsx` backed by `Post.js` and `Poll.js`, affording an infinite-scrolling social interface and live polling validation rules.
- **Hardware Integration for Gate Security**: Reconfigured `Visitors.jsx` and backend endpoints with webcam functionality. Integrated `react-webcam` for Security Guards to seamlessly capture and append live photo IDs to visitor logs during manual entry.

### 6. Task Flow Optimization & Real-Time Notifications
- **Automated Resolution**: Removed the redundant "Resident Approval" step. Tasks now transition directly from `In Progress` to `Resolved` upon vendor completion, with performance metrics updated automatically.
- **Reassignment Workflow**: Admins can now instantly reassign tasks that have been rejected by vendors via the "Reassign Vendor" action in the Complaints Hub.
- **Real-time Notifications (Socket.IO)**: 
    - **Vendors**: Receive instant alerts on new or reassigned tasks.
    - **Residents**: Notified immediately when a vendor is assigned, when a vendor rejects a task (including the reason), and when a task is successfully resolved.
- **Improved Transparency**: Rejection reasons provided by vendors are now clearly displayed to residents and admins within the task's resolution notes.
