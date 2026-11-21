
# 💈 SalonBook Server

### ⚡ RESTful API for Salon Appointment Management

<p align="center">
  A secure backend API for managing salon services, customer appointments, authentication, and online payments.
</p>

<p align="center">
  <a href="https://salonbook-lemon.vercel.app/">
    <img src="https://img.shields.io/badge/Live_Application-Visit_Website-000000?style=for-the-badge&logo=vercel&logoColor=white" />
  </a>
  <a href="https://github.com/poranmia2222/salonbook-server">
    <img src="https://img.shields.io/badge/Server-Repository-181717?style=for-the-badge&logo=github&logoColor=white" />
  </a>
  <a href="https://github.com/poranmia2222/salonbook-client">
    <img src="https://img.shields.io/badge/Client-Repository-181717?style=for-the-badge&logo=github&logoColor=white" />
  </a>
</p>

---

## 📖 Introduction

**SalonBook Server** is the backend API of the SalonBook appointment booking platform. It provides RESTful endpoints for managing salon services, customer appointments, user authentication, and payment processing.

Built with **Node.js, Express.js, and MongoDB**, the API handles appointment scheduling, prevents overlapping bookings, implements role-based authorization, and verifies Stripe payments securely.

## ✨ Features

- 🚀 RESTful API built with Express.js.
- 🍃 MongoDB database integration.
- 🔐 Better Auth session token verification.
- 🛡️ Role-based authorization for customers and admins.
- 👥 User management.
- 💇 Complete salon service management.
- 📅 Customer appointment booking.
- 🚫 Double booking prevention through time overlap validation.
- 🕒 Appointment date, time, and duration validation.
- 💳 Stripe Checkout payment verification.
- 🔒 Protected API endpoints.
- 🌐 CORS and JSON middleware configuration.

## 🛠️ Tech Stack

### Backend

<p>
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" />
  <img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white" />
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" />
</p>

### Database & Authentication

<p>
  <img src="https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white" />
  <img src="https://img.shields.io/badge/Better_Auth-000000?style=for-the-badge&logoColor=white" />
</p>

### Payment & Utilities

<p>
  <img src="https://img.shields.io/badge/Stripe-635BFF?style=for-the-badge&logo=stripe&logoColor=white" />
  <img src="https://img.shields.io/badge/dotenv-ECD53F?style=for-the-badge&logo=dotenv&logoColor=black" />
</p>

### Deployment

<p>
  <img src="https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white" />
</p>

## 🚀 Getting Started

### 📋 Prerequisites

- Node.js
- npm
- MongoDB Atlas account
- Stripe account

### 1. Clone the Repository

```bash
git clone https://github.com/poranmia2222/salonbook-server.git
cd salonbook-server
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Variables

Create a `.env` file in the root directory:

```env
PORT=5000

MONGODB_USER=your_mongodb_username
MONGODB_PASSWORD=your_mongodb_password

STRIPE_SECRET_KEY=your_stripe_secret_key
```

### 4. Start the Server

```bash
node index.js
```

The server will run at:

`http://localhost:5000`

## 📡 API Reference

**Base URL:** `http://localhost:5000`

### 🌍 General Routes

| Method | Endpoint | Description | Access |
|:---:|---|---|:---:|
| `GET` | `/` | Check server status | <kbd>Public</kbd> |

### 👥 User Routes

| Method | Endpoint | Description | Access |
|:---:|---|---|:---:|
| `GET` | `/users` | Retrieve all users | <kbd>Admin</kbd> |

### 💇 Service Routes

| Method | Endpoint | Description | Access |
|:---:|---|---|:---:|
| `GET` | `/services` | Get all services | <kbd>Public</kbd> |
| `GET` | `/services/:id` | Get service details | <kbd>Public</kbd> |
| `POST` | `/services` | Create a service | <kbd>Admin</kbd> |
| `PATCH` | `/services/:id` | Update a service | <kbd>Admin</kbd> |
| `DELETE` | `/services/:id` | Delete a service | <kbd>Admin</kbd> |

### 📅 Appointment Routes

| Method | Endpoint | Description | Access |
|:---:|---|---|:---:|
| `GET` | `/appointments` | Retrieve appointments | <kbd>Authenticated</kbd> |
| `POST` | `/appointment` | Create an appointment | <kbd>Customer</kbd> |
| `PATCH` | `/appointment/:id` | Update appointment status | <kbd>Admin</kbd> |
| `DELETE` | `/appointment/:id` | Delete an appointment | <kbd>Customer</kbd> |

### 💳 Payment Routes

| Method | Endpoint | Description | Access |
|:---:|---|---|:---:|
| `PATCH` | `/payments/checkout-verify` | Verify Stripe payment | <kbd>Payment Verification</kbd> |

## 🔐 Authentication

Protected routes require a valid session token in the Authorization header.

```http
Authorization: Bearer <session-token>
```

The server validates the session and checks the user's role before allowing access to restricted endpoints.

## 🚫 Appointment Conflict Prevention

SalonBook prevents overlapping bookings for the same service and date.

**Validation process:**

1. Receive service ID, appointment date, start time, and duration.
2. Convert appointment times into minutes.
3. Retrieve existing appointments for the selected service and date.
4. Check for overlapping time slots.
5. Reject conflicting bookings with a `409 Conflict` response.

## 💳 Stripe Payment Verification

The API verifies Stripe Checkout sessions directly with Stripe before updating the corresponding appointment payment status.

This ensures payment status is verified on the backend rather than relying only on frontend redirects.

---

## 🌐 Deployment

| Property | Link |
|---|---|
| 🌍 Live Application | [SalonBook](https://salonbook-lemon.vercel.app/) |
| ⚙️ Server Repository | [GitHub](https://github.com/poranmia2222/salonbook-server) |
| 💻 Client Repository | [GitHub](https://github.com/poranmia2222/salonbook-client) |

---

<p align="center">
  <strong>💈 SalonBook</strong>
  <br/>
  <sub>Reliable APIs. Seamless Bookings. Better Salon Experiences.</sub>
</p>
