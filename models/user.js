const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

// Схема пользователя
const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters long'],
    maxlength: [50, 'Username must be less than 50 characters long']
  },
  email: {
    type: String,
    required: true,
    unique: true, // Уникальность email
    trim: true,
    lowercase: true, // Приводим email к нижнему регистру
    match: [/.+\@.+\..+/, 'Please fill a valid email address'], // Проверка на правильность формата email
  },
  password: {
    type: String,
    required: true,
    minlength: [6, 'Password must be at least 6 characters long']
  },
  firstName: {
    type: String,
    required: true,
    trim: true,
    minlength: [2, 'First name must be at least 2 characters long']
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
    minlength: [2, 'Last name must be at least 2 characters long']
  },
  age: {
    type: Number,
    required: true,
    min: [18, 'You must be at least 18 years old'],
    max: [120, 'Age must be realistic']
  },
  gender: {
    type: String,
    required: true,
    enum: ['male', 'female', 'other'],
  },
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'editor',
  },
  twoFactorEnabled: {
    type: Boolean,
    default: false,
  },
  twoFactorSecret: {
    type: String,
    required: function() {
      return this.twoFactorEnabled;
    },
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
});

// Хэширование пароля перед сохранением
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();  // Если пароль не был изменен, не хэшируем
  const salt = await bcrypt.genSalt(10);  // Генерация соли
  this.password = await bcrypt.hash(this.password, salt);  // Хэширование пароля
  next();
});

// Метод для сравнения пароля
UserSchema.methods.comparePassword = function(password) {
  return bcrypt.compare(password, this.password);  // Сравниваем введенный пароль с хэшированным
};

// Генерация токена для сброса пароля
UserSchema.methods.generateResetToken = function() {
  const token = crypto.randomBytes(20).toString('hex');
  this.resetPasswordToken = token;
  this.resetPasswordExpires = Date.now() + 3600000; // Токен истекает через 1 час
  return token;
};

// Проверка срока действия токена для сброса пароля
UserSchema.methods.isResetTokenValid = function(token) {
  return this.resetPasswordToken === token && Date.now() < this.resetPasswordExpires;
};

// Генерация двухфакторного секретного ключа
UserSchema.methods.generateTwoFactorSecret = function() {
  if (!this.twoFactorEnabled) return null;
  const secret = crypto.randomBytes(20).toString('hex');
  this.twoFactorSecret = secret;
  return secret;
};

// Проверка двухфакторного секрета
UserSchema.methods.compareTwoFactorSecret = function(secret) {
  return this.twoFactorSecret === secret;
};

// Проверка, если это первый пользователь, присваиваем ему роль admin
UserSchema.statics.assignAdminRoleIfFirstUser = async function() {
  const userCount = await this.countDocuments();
  if (userCount === 0) {
    // Если это первый пользователь, назначаем роль 'admin'
    return 'admin';
  }
  return 'editor';
};

module.exports = mongoose.model('User', UserSchema);
