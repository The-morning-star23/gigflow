
# Premium Freelance Marketplace

A real-time, full-stack freelance marketplace built with the **MERN** stack. This platform allows clients to post jobs and freelancers to bid on them, featuring atomic hiring transactions and instant notifications.

---

## 🚀 Features

### Real-Time Updates (Socket.io)
- **Instant Job Feed:** New jobs appear instantly on Home and Browse pages.
- **Live Notifications:** Freelancers are notified in real time when hired.
- **Status Sync:** Job status badges (Active/Assigned) update across all clients immediately.

### Secure & Atomic Hiring (MongoDB Transactions)
- Uses **Mongoose Sessions** for atomic hiring:
  - Gig status updates to `assigned`.
  - Winning bid status updates to `hired`.
  - All other bids are marked as `rejected`.
- If any part fails, the transaction is rolled back for data consistency.

### Data Isolation & Security
- **Strict Dashboarding:** Users only see assignments they were hired for.
- **Owner Guardrails:** Users cannot bid on their own projects.
- **Auth Middleware:** HttpOnly cookies & JWT for secure, stateless authentication.

### Professional UI/UX
- Responsive design with **Tailwind CSS**
- **Lucide-React** icons for a modern look
- Unified color logic: Blue (Active/Open), Orange (Assigned/Closed)

---

## 🛠️ Tech Stack

- **Frontend:** React, Redux Toolkit, Tailwind CSS, Vite
- **Backend:** Node.js, Express.js
- **Database:** MongoDB (Mongoose)
- **Real-time:** Socket.io
- **Icons:** Lucide-React

---

## 📋 Installation & Setup

1. **Clone the repository**
    ```bash
    git clone https://github.com/The-morning-star23/gigflow.git
    cd gigflow
    ```

2. **Install Server Dependencies**
    ```bash
    cd backend
    npm install
    ```

3. **Install Client Dependencies**
    ```bash
    cd ../frontend
    npm install
    ```

4. **Environment Variables**
    - Create a `.env` file in the `backend` directory.
    - Use `.env.example` as a template if provided.

5. **Run the App**
    - **Start Server:**
      ```bash
      cd backend
      npm run dev
      ```
    - **Start Client:**
      ```bash
      cd frontend
      npm run dev
      ```

---

## 🛡️ Security Best Practices

- Environment variables are managed via `.env` and excluded from Git.
- Passwords are hashed using `bcryptjs`.
- Protected routes ensure only authenticated users can access dashboard features.