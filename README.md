```markdown
# 🏋️ GymHum – Full-Stack Fitness Web App

GymHum is a full-stack fitness and social web application that enables users to track workouts, manage nutrition, join challenges, post updates, and connect with friends. The app promotes fitness through community engagement and personal goal tracking.

---

## 📦 Tech Stack

| Layer       | Technology                     |
|-------------|--------------------------------|
| Frontend    | React (Vite)     |
| Backend     | Flask, Flask-JWT-Extended      |
| Database    | PostgreSQL + SQLAlchemy        |
| Auth        | JWT (Token stored in `localStorage`) |
| ORM         | SQLAlchemy + Alembic           |
| API Format  | RESTful JSON                   |

---

## 📁 Project Structure

```

gymhum/
├── client/              # React frontend
│   ├── components/
│   ├── contexts/
│   └── ...
├── server/              # Flask backend
│   ├── models/
│   ├── controllers/
│   ├── routes/
│   └── app.py
├── migrations/          # Alembic migration files
├── .env
└── README.md

````

---

## ⚙️ Setup Instructions

### 🔧 Backend (Flask API)

1. **Clone the repo**  
   ```bash
   git clone https://github.com/your-username/gymhum.git
   cd gymhum/server
````

2. **Create and activate virtualenv**

   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```

3. **Install dependencies**

   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables** in `.env`

   ```
   FLASK_ENV=development
   SECRET_KEY=your-secret-key
   JWT_SECRET_KEY=your-jwt-key
   DATABASE_URL=postgresql://user:password@localhost/gym_app
   CORS_ORIGINS=http://localhost:5173
   ```

5. **Initialize the database**

   ```bash
   flask db init
   flask db migrate
   flask db upgrade
   ```

6. **Run the Flask app**

   ```bash
   flask run
   ```

---

### 💻 Frontend (React)

1. **Navigate to the frontend**

   ```bash
   cd ../client
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Run the app**

   ```bash
   npm run dev
   ```

The frontend should now be running at `http://localhost:5173`.

---

## 🔐 Authentication

* Users register and log in to receive a JWT token.
* Token is stored in `localStorage` and included in headers:

  ```
  Authorization: Bearer <token>
  ```
* Protected routes require valid JWT.

---

## 🌟 Core Features

### 👤 Authentication

* Register/Login
* JWT-based token authentication

### 🏃 Workouts

* Add/view workouts
* Track progress
* Filter by category

### 🍎 Nutrition

* Browse meal plans/products
* Save to profile

### 🏆 Challenges

* Join community challenges
* Track completion progress

### 💬 Posts

* Share progress with community
* Like/comment on posts

### 🤝 Friends

* Add/remove friends
* See mutual friends
* "People You May Know" suggestions

---

## 🧪 API Endpoints (Highlights)

| Method | Endpoint                    | Description              |
| ------ | --------------------------- | ------------------------ |
| POST   | `/api/auth/register`        | Register user            |
| POST   | `/api/auth/login`           | Log in and get JWT       |
| GET    | `/api/posts`                | Fetch community posts    |
| POST   | `/api/posts`                | Create new post          |
| GET    | `/api/workouts`             | Get workouts             |
| POST   | `/api/workouts`             | Add workout              |
| GET    | `/api/nutrition`            | View meal/nutrition data |
| POST   | `/api/challenges/<id>/join` | Join a challenge         |
| GET    | `/api/users/suggestions`    | Get friend suggestions   |
| POST   | `/api/friends/<id>`         | Add friend               |
| DELETE | `/api/friends/<id>`         | Remove friend            |

---

## 🔄 Optional Enhancements

* Cookie-based auth (future implementation)
* Profile avatars and bio
* Notifications for likes/comments
* Admin panel
* Search/filter improvements
* PWA support

---

## 🧠 Developer Notes

* Use `Authorization` header for all protected routes.
* Backend errors will return 401/422 if token is invalid or missing.
* When debugging CORS, ensure headers and origin match exactly.

---

## 🧪 Testing Tips

* Use [Postman](https://www.postman.com/) to test API routes.
* Use browser DevTools → Application → LocalStorage to verify token.
* Check PostgreSQL directly via:

  ```sql
  SELECT COUNT(*) FROM users;
  SELECT * FROM user_friends WHERE user_id = 1 OR friend_id = 1;
  ```

---

## 📜 License

MIT License

---

## 👨‍💻 Author

Made by \Dorine Oloo — Feel free to fork, contribute, and connect!

```
