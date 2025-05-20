
# Documentation for "Portfolio Platform" Project

> _This project was created by **Alen Issayev** from **BDA-2302**_  
> _If you found some bugs or issues, contact me by e-mail: **alenkz20001@gmail.com**_  
> _#This project was written under tears and screams_

---

## 📌 Project Description

**Portfolio Platform** is a web application that allows users to create, update, and view their portfolios online.  
The app includes:

- User registration and authentication system with **two-factor authentication (2FA)**
- Ability to **upload images** for projects
- An **admin panel** for managing users and content

---

## ✨ Key Features

- ✅ User registration and login system  
- 🔐 Two-factor authentication (2FA)  
- ✏️ Ability to create, edit, and delete portfolio projects  
- 🖼️ Image uploads for projects  
- 🛠️ Admin panel for managing users  
- 📧 Email integration for welcome messages and 2FA setup

---

## 📁 Project Structure

```
portfolio_platform/
├── app.js                  # Main application file
├── models/                 # MongoDB models (User, Portfolio)
│   ├── User.js             # User model
│   └── Portfolio.js        # Portfolio model
├── public/                 # Static files directory
│   ├── uploads/            # Directory for uploaded images
│   ├── index.html          # Homepage
│   ├── login.html          # Login page
│   ├── register.html       # Registration page
│   ├── portfolio.html      # Portfolio page
│   ├── admin-dashboard.html # Admin dashboard
│   └── 2fa.html            # Two-factor authentication page
├── .env                    # Environment configuration (variables)
└── package.json            # Project dependencies and configuration
```

---

## ⚙️ Installation and Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd portfolio_platform
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env` file in the root directory and add the following:

```env
MONGODB_URI=mongodb://localhost:27017/portfolio_platform
EMAIL_USER=your-email@example.com
EMAIL_PASS=your-email-password
```

> 🔒 If using Gmail with 2FA, use an **App Password** instead of your regular password.

### 4. Run MongoDB

Ensure MongoDB is installed and running:

```bash
mongod
```

### 5. Start the Application

```bash
npm start
```

The app will be available at: [http://localhost:3000](http://localhost:3000)

---

## 🧱 Database Structure

### 🔹 User Model

Stores information about users:

- `email` — required, unique
- `username`
- `password` — hashed
- `firstName`, `lastName`
- `age`, `gender`
- `role` — `"user"` or `"admin"`

### 🔹 Portfolio Model

Each user's portfolio project includes:

- `title`
- `description`
- `images` — array of image paths
- `user` — reference to the owning user

---

## 🔗 API Endpoints

### 🔐 Registration and Authentication

- `POST /register` — Register a new user  
  **Fields:** `email`, `username`, `password`, `firstName`, `lastName`, `age`, `gender`

- `POST /login` — Login with username and password  
  **Fields:** `username`, `password`

- `POST /verify-2fa` — Verify TOTP token  
  **Field:** `token` (from Google Authenticator or similar app)

---

### 🧳 Portfolio Management

- `GET /portfolio` — Get current user's portfolio projects

- `POST /portfolio` — Create a new project  
  **Fields:** `title`, `description`, `images (max 3)`

- `PUT /portfolio/:projectId` — Update a project  
  **Fields:** `title`, `description`, `images`

- `DELETE /portfolio/:projectId` — Delete a project

---

### 👨‍💼 Admin Panel

- `GET /admin-dashboard` — View and manage all users (admin only)

---

## 🧰 Technologies Used

- **Node.js** — Runtime environment  
- **Express.js** — Web framework  
- **MongoDB** — NoSQL database  
- **Mongoose** — MongoDB ODM  
- **Nodemailer** — Sending emails  
- **Speakeasy** — 2FA implementation  
- **Multer** — File/image uploads  
- **bcryptjs** — Password hashing

---

## 📎 Notes

- Use a TOTP app (like **Google Authenticator**) for 2FA
- For Gmail, enable **App Passwords** if 2FA is on

---

## ✅ Conclusion

This project provides full functionality for creating and managing user portfolios:

- Secure registration and login  
- Two-factor authentication  
- Image uploads for project visualization  
- Admin panel for management tasks

Feel free to contribute, fork, or customize it for your needs!
