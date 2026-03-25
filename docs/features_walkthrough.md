# SSMS - Full Features Walkthrough

The **Smart Society Management System (SSMS)** is a comprehensive platform built to handle every aspect of residential society operations. This document provides a complete guide to all features available across all user roles.

---

## 🛡️ Administrative Control (Super & Society Admin)

### 1. Society Lifecycle Management
- **Self-Registration**: Societies can register via a professional landing page.
- **Super Admin Approval**: All new societies must be vetted and approved by a platform Super Admin before they can begin operations.
- **Role-Based Provisioning**: Automatic setup of Society Admin, Guard, and Vendor roles upon society approval.

### 2. Financial Management & Analytics
- **Billing Dashboard**: Track total collected vs. pending maintenance dues.
- **Automated Bills**: Monthly maintenance invoices are generated automatically for each resident.
- **Advanced Data Viz**: Real-time charts (Bar/Line/Pie) visualize collection rates, complaint resolution speed, and society growth.

### 3. Vendor Performance Tracking
- **Service Directory**: Managed list of plumbers, electricians, and security providers.
- **Vendor History**: Admins can view a detailed audit trail of all tasks assigned to a vendor, including successes, delays, and rejections.
- **Dynamic Ratings**: Auto-calculating vendor performance scores based on their historical completion speed vs. deadlines.

---

## 🏠 Resident Experience

### 4. Digital Maintenance Hub
- **Ticket Deployment**: Residents can raise complaints with priority levels (Low/Medium/High) and specific location details.
- **Real-Time Tracking**: Instant status updates (Assigned ➔ In Progress ➔ Resolved).
- **Escalated Alerts**: Residents are notified if their task is overdue or if a vendor rejects an assignment.

### 5. Security & Visitor Management
- **Pre-Approval System**: Residents can pre-authorise guests, delivery agents, or service providers.
- **Arrival Notifications**: Instant real-time alerts when a visitor enters the society gates.

### 6. Community & Financials
- **Invoices**: View billing history and download official PDF invoices for maintenance payments.
- **Community Feed**: A social forum for society-wide discussions and updates.
- **Live Polls**: Participate in democratic decision-making via secure, real-time polling.

---

## 👮 Security & Gate Operations

### 7. Digital Gatekeeper
- **Entry/Exit Logs**: Comprehensive digital records of every person entering or leaving the premises.
- **Webcam Integration**: Guards capture live photo identification for all manual visitor entries.
- **Pre-Approval Verification**: Instantly check guest credentials against resident-submitted pre-approvals.

---

## 🛠️ Vendor Operations

### 8. Task Execution Portal
- **Work Queue**: Mobile-optimised interface for vendors to manage their daily assignments.
- **Lifecycle Actions**: Vendors can "Start Work" and "Mark Completed" directly from the dashboard.
- **Rejection Protocol**: If unavailable, vendors can reject tasks with a mandatory reason, alerting admins for immediate reassignment.
- **Real-Time Dispatch**: Instant alerts for new or reassigned tasks.

---

## 🌐 Platform-Wide Utilities

### 9. Real-Time Notification System (Socket.IO)
- **Universal Alerts**: A centralized notification bell system that pushes updates across all roles instantly.
- **Handshake Security**: All real-time sockets are secured via JWT authentication.

### 10. Modern Responsive UI
- **Glassmorphism Layout**: Clean, responsive design ensuring usability on Tablets, Mobiles, and Desktops.
- **Dynamic Filtering**: Residents and Admins can toggle between "Active" and "All" views to keep dashboards focused.
