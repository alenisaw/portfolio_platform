const mongoose = require('mongoose');

const PortfolioSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    images: [{ type: String }],  // Массив строк для хранения путей к изображениям
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { 
    timestamps: true // Включает автоматическое создание полей createdAt и updatedAt
  }
);

// Валидация массива изображений (если требуется)
PortfolioSchema.path('images').validate(function(value) {
  // Можно добавить свою валидацию (например, проверку расширений)
  return Array.isArray(value) && value.length > 0; // Убедитесь, что массив не пуст
}, 'At least one image is required');

// Модели экспортируем с учетом измененных полей
module.exports = mongoose.model('Portfolio', PortfolioSchema);
