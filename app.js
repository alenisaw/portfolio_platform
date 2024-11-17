const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session');
const user = require('./models/user'); // Модель пользователя
const portfolio = require('./models/portfolio'); // Модель портфолио
const bcrypt = require('bcryptjs');
const speakeasy = require('speakeasy');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const multer = require('multer');

dotenv.config();

const app = express();

// Подключение к MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/portfolio_platform', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('Error connecting to MongoDB:', err));

// Настроим папку public для статических файлов
app.use(express.static(path.join(__dirname, 'public')));

// Парсинг данных формы
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Настройка сессий
app.use(session({
  secret: 'portfolio_secret_key',
  resave: false,
  saveUninitialized: true,
}));

// Настройка хранения файлов
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, 'public', 'uploads')); // Папка для загрузки изображений
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Название файла с уникальным идентификатором
  },
});

// Инициализация multer (загрузчик файлов)
const upload = multer({ storage: storage });

// Настройка Nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // Ваш email
    pass: process.env.EMAIL_PASS, // Ваш пароль или App Password (если используете Gmail с двухфакторкой)
  },
});

// Функция для отправки приветственного письма
async function sendWelcomeEmail(userEmail) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: userEmail,
    subject: 'Welcome to Portfolio Platform!',
    text: 'Thank you for registering on our platform. We are excited to have you on board!',
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Welcome email sent');
  } catch (error) {
    console.error('Error sending welcome email', error);
  }
}

// Функция для проверки авторизации
function isAuthenticated(req, res, next) {
  if (req.session.userId) {
    return next();
  }
  return res.redirect('/login');
}

// Функция для проверки роли администратора
function isAdmin(req, res, next) {
  if (req.session.role === 'admin') {
    return next();
  }
  return res.status(403).send('Access denied');
}

// Главная страница
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Страница логина
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Страница регистрации
app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

// Регистрация пользователя
app.post('/register', async (req, res) => {
  const { email, username, password, firstName, lastName, age, gender } = req.body;

  try {
    const existingUser = await user.findOne({ email }); // Проверка на существующий email
    if (existingUser) {
      return res.status(400).send('Email already taken');
    }

    const existingUsername = await user.findOne({ username }); // Проверка на существующий username
    if (existingUsername) {
      return res.status(400).send('Username already taken');
    }

    const role = (await user.countDocuments()) === 0 ? 'admin' : 'user';

    const newUser = new user({
      email,        
      username,
      password,
      firstName,
      lastName,
      age,
      gender,
      role, 
    });

    await newUser.save();
    sendWelcomeEmail(newUser.email); 
    res.redirect('/login');
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

// Логин пользователя
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const userRecord = await user.findOne({ username });
    if (!userRecord) {
      return res.status(400).send('Invalid credentials');
    }

    const isMatch = await userRecord.comparePassword(password);
    if (!isMatch) {
      return res.status(400).send('Invalid credentials');
    }

    req.session.userId = userRecord._id;
    req.session.role = userRecord.role;

    if (userRecord.role === 'admin') {
      return res.redirect('/admin-dashboard');
    } else {
      return res.redirect('/portfolio.html');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

// Страница для просмотра портфолио (требуется авторизация)
app.get('/portfolio.html', isAuthenticated, async (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'portfolio.html'));
});

// Получение портфолио пользователя
app.get('/portfolio', isAuthenticated, async (req, res) => {
  try {
    const userPortfolio = await portfolio.find({ user: req.session.userId }).exec();
    console.log('User Portfolio:', userPortfolio); // Логируем портфолио для диагностики
    res.json(userPortfolio);
  } catch (error) {
    console.error('Error fetching portfolio:', error);
    res.status(500).json({ message: 'Error fetching portfolio', error });
  }
});

// Создание нового проекта в портфолио
app.post('/portfolio', isAuthenticated, upload.array('images', 3), async (req, res) => {
  const { title, description } = req.body;

  try {
    const userRecord = await user.findById(req.session.userId);
    if (!userRecord) {
      return res.status(404).send('User not found');
    }

    const newPortfolioItem = new portfolio({
      title,
      description,
      images: req.files.map(file => file.filename),
      user: userRecord._id,
    });

    await newPortfolioItem.save();
    res.redirect('/portfolio.html');
  } catch (error) {
    console.error('Error creating portfolio item:', error);
    res.status(500).send('Error creating portfolio item');
  }
});

// Обновление проекта с новыми изображениями
app.put('/portfolio/:projectId', isAuthenticated, upload.array('images', 3), async (req, res) => {
  const { projectId } = req.params;
  const { title, description } = req.body;

  try {
    const project = await portfolio.findOne({ _id: projectId, user: req.session.userId });
    if (!project) {
      return res.status(404).json({ message: 'Project not found or unauthorized' });
    }

    const imagePaths = req.files.map(file => '/uploads/' + file.filename);

    project.title = title || project.title;
    project.description = description || project.description;
    project.images = imagePaths.length ? imagePaths : project.images;

    await project.save();
    res.json({ message: 'Project updated successfully', project });
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ message: 'Error updating project', error });
  }
});

// Удаление проекта из портфолио
app.delete('/portfolio/:projectId', isAuthenticated, async (req, res) => {
  const { projectId } = req.params;

  try {
    const project = await portfolio.findOneAndDelete({ _id: projectId, user: req.session.userId });
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ message: 'Error deleting project', error });
  }
});

// Административная панель (доступ только для администраторов)
app.get('/admin-dashboard', isAuthenticated, isAdmin, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin-dashboard.html'));
});

// Запуск сервера
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
