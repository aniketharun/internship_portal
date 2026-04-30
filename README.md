# 🚀 Propel — Internship Portal

> Connect students with opportunities. Give recruiters the tools to find the right talent.

Propel is a full-stack internship platform where students discover and apply for internships, and recruiters post roles and manage applicants — all in one place. Built with a modern React frontend and a Node.js/MongoDB backend.

---

## ✨ Features

### For Students
- 🔍 **Browse Internships** — Search and filter through live listings from top companies
- 🤖 **AI Match Score** — See how well your profile matches each role before applying
- 📄 **One-Click Apply** — Submit your resume (URL or file upload) with a cover letter
- 📬 **Real-time Notifications** — Get notified the moment you apply and when your status changes
- 🧠 **AI Resume Checker** — Get instant feedback on your resume
- 🏆 **Tests & Badges** — Take skill tests and earn verified badges to stand out
- 💬 **Chat** — Message recruiters directly
- 🌐 **Community Feed** — Share and read internship experiences

### For Recruiters
- 📝 **Post & Manage Internships** — Create listings with skills, stipend, deadline, and more
- 📊 **Recruiter Dashboard** — Track all your postings and incoming applications
- ✅ **Review Applications** — Accept or reject applicants; students are notified automatically
- 🧪 **Create Tests** — Build custom skill assessments for applicants

### Platform
- 🔐 **Auth** — JWT-based login/register with Google OAuth support
- 🌙 **Dark / Light Mode** — Theme toggle built in
- 📱 **Responsive** — Works on desktop and mobile

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite, Framer Motion, React Router v7 |
| Styling | CSS Variables, Lucide Icons |
| Backend | Node.js, Express 5 |
| Database | MongoDB, Mongoose |
| Auth | JWT, bcryptjs, Google OAuth |
| File Uploads | Multer |
| AI Features | PDF/DOCX parsing (pdf-parse, mammoth) |

---

## 📁 Project Structure

```
propel/
├── client/          # React frontend (Vite)
│   └── src/
│       ├── components/   # Reusable UI components
│       ├── pages/        # Route-level page components
│       ├── contexts/     # Auth & Theme context
│       └── services/     # Axios API client
└── server/          # Node.js backend (Express + MongoDB)
    ├── controllers/ # Route handlers
    ├── models/      # Mongoose schemas
    ├── routes/      # API route definitions
    └── middleware/  # Auth, error handling
```

---

## ⚡ Getting Started

### Prerequisites
- Node.js v18+
- MongoDB (local or [MongoDB Atlas](https://www.mongodb.com/atlas))

### 1. Clone the repo
```bash
git clone https://github.com/your-username/your-repo-name.git
cd your-repo-name
```

### 2. Set up the backend
```bash
cd server
npm install
```

Create a `.env` file inside `server/`:
```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=30d
```

Start the server:
```bash
npm run dev
```
> Runs on `http://localhost:5000`

### 3. Set up the frontend
```bash
cd client
npm install
```

Create a `.env` file inside `client/`:
```env
VITE_API_URL=http://localhost:5000
```

Start the dev server:
```bash
npm run dev
```
> Runs on `http://localhost:5173`

---

## 🔑 Environment Variables

| Variable | Location | Description |
|----------|----------|-------------|
| `MONGO_URI` | `server/.env` | MongoDB connection string |
| `JWT_SECRET` | `server/.env` | Secret key for signing JWTs |
| `JWT_EXPIRE` | `server/.env` | Token expiry (e.g. `30d`) |
| `VITE_API_URL` | `client/.env` | Backend base URL |

---

## 📜 API Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login and receive JWT |
| GET | `/api/internships` | List all internships |
| POST | `/api/internships` | Create internship (recruiter) |
| GET | `/api/internships/:id` | Get internship details |
| POST | `/api/applications` | Apply for an internship |
| GET | `/api/applications/my-applications` | Student's applications |
| PUT | `/api/applications/:id/status` | Update application status |
| GET | `/api/notifications` | Get user notifications |

---

## 🚀 Deployment

### Frontend (Vercel / Netlify)
```bash
cd client
npm run build
# Deploy the dist/ folder
```

### Backend (Render / Railway / VPS)
Set the environment variables on your hosting platform and run:
```bash
npm start
```

---

## 🤝 Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m "feat: add your feature"`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

<p align="center">Built with ❤️ to help students land their dream internships</p>
