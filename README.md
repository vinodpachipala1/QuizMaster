# 🧠 QuizMaster — Full Stack Quiz Platform

QuizMaster is a full-stack quiz management platform built using the PERN stack. The system enables users to create quizzes, attempt quizzes, track scores, and analyze performance through a personalized analytics dashboard.

🔗 Live Demo: https://quiz-master-ivory.vercel.app

---

# 📌 Features

## 👤 Authentication Features

- User registration and login
- JWT-based authentication
- Password hashing using bcrypt
- Persistent login sessions
- Protected API routes

---

## 📝 Quiz Management Features

- Create custom quizzes
- Dynamic question creation
- Quiz categorization
- Configurable time limits
- JSONB-based question storage

---

## 🎯 Quiz Attempt Features

- Attempt quizzes interactively
- Automatic score calculation
- Answer review system
- Timed quiz workflows
- Attempt history tracking
- Result analytics

---

## 📊 Dashboard Features

- View created quizzes
- Track quiz attempt history
- Best score tracking
- Attempt statistics
- Quiz performance analytics

---

## 🎨 UI Features

- Responsive design
- Mobile-friendly interface
- Modern React-based UI
- Framer Motion animations

---

# 🧰 Tech Stack

## Frontend
- React.js
- React Router DOM
- Axios
- Tailwind CSS
- Framer Motion
- Lucide React Icons

## Backend
- Node.js
- Express.js
- PostgreSQL
- JWT Authentication
- bcryptjs
- CORS
- dotenv

## Database
- PostgreSQL

## Deployment
- Frontend: Vercel
- Backend: Render

---

# 🏗️ System Architecture

```txt
Users
   ↓
React Frontend
   ↓
REST APIs
   ↓
Express Backend
   ↓
Controllers → Models
   ↓
PostgreSQL Database
```

---

# 📂 Project Structure

```txt
Quiz/
│
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── index.js
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── routes/
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
│
└── README.md
```

---

# 🔐 Authentication Flow

## Registration Workflow

1. User submits registration form
2. Password hashed using bcrypt
3. User stored in PostgreSQL

---

## Login Workflow

1. User submits credentials
2. Password verified using bcrypt
3. JWT token generated
4. Token stored in localStorage
5. Protected routes validated using middleware

---

# 🔄 Quiz Workflow

## Quiz Creation Workflow

```txt
User Creates Quiz
        ↓
Frontend Collects Questions
        ↓
REST API Request
        ↓
Backend Validation
        ↓
PostgreSQL Storage
```

---

## Quiz Attempt Workflow

```txt
Fetch Quiz
     ↓
Render Questions
     ↓
User Selects Answers
     ↓
Timer Validation
     ↓
Calculate Score
     ↓
Store Attempt
     ↓
Show Analytics
```

---

# 🗄️ Database Design

## users
Stores:
- authentication details
- user profile information

## quizzes
Stores:
- quiz metadata
- category
- creator details
- JSONB question data

## attempts
Stores:
- quiz attempt history
- scores
- analytics data

---

# 🌟 Engineering Highlights

- Implemented JWT authentication architecture
- Used PostgreSQL JSONB for flexible quiz storage
- Designed dynamic quiz creation workflows
- Built backend-driven analytics tracking
- Structured scalable REST APIs
- Implemented timed quiz submission workflows

---

# 📡 API Endpoints

## Authentication APIs

| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/register` | Register user |
| POST | `/auth/login` | Login user |
| GET | `/auth/verifyLogin` | Verify login |

---

## Quiz APIs

| Method | Endpoint | Description |
|---|---|---|
| POST | `/quizzes/createQuiz` | Create quiz |
| GET | `/quizzes/getallquizzes` | Fetch all quizzes |
| GET | `/quizzes/:id` | Fetch single quiz |
| GET | `/quizzes/ByUserId/:id` | Fetch quizzes by creator |

---

## Attempt APIs

| Method | Endpoint | Description |
|---|---|---|
| POST | `/attempts/create-attempt` | Create attempt |
| GET | `/attempts/getAttemptsByUserId/:id` | User attempt history |
| GET | `/attempts/getAttemptsByQuizId/:id` | Quiz attempt analytics |

---

# 🔒 Security Features

- JWT authentication
- Password hashing using bcrypt
- Parameterized SQL queries
- Protected routes
- Secure CORS configuration
- Environment variable protection

---

# ⚙️ Installation & Setup

## Clone Repository

```bash
git clone https://github.com/vinodpachipala1/QuizMaster.git
cd QuizMaster
```

---

# 🔧 Backend Setup

```bash
cd backend
npm install
```

Create `.env` file:

```env
PORT=3001
DATABASE_URL=your_postgresql_connection_url
JWT_SECRET=your_secret_key
```

Run backend:

```bash
npm start
```

---

# 💻 Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

---

# 📈 Future Improvements

- Quiz editing and deletion
- Leaderboard system
- Real-time multiplayer quizzes
- Timer synchronization
- Quiz category filtering
- Pagination support
- Refresh token authentication
- Admin dashboard

---

# 🌟 Key Highlights

- Full-stack PERN application
- Dynamic quiz creation engine
- JWT-based authentication architecture
- PostgreSQL JSONB schema design
- Personalized analytics dashboard
- Responsive React frontend
- RESTful API architecture

---

# 👨‍💻 Author

## Vinod Pachipala

- GitHub: https://github.com/vinodpachipala1
- LinkedIn: https://www.linkedin.com/in/vinod-pachipala-891375372/
