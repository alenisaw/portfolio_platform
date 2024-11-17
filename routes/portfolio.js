const express = require('express');
const PortfolioItem = require('../models/portfolio');
const router = express.Router();

// Admin - Create Portfolio Item
router.post('/create', async (req, res) => {
  const { title, description, images } = req.body;
  const newItem = new PortfolioItem({ title, description, images });
  await newItem.save();
  res.redirect('/');
});

// Admin - Update Portfolio Item
router.post('/update/:id', async (req, res) => {
  const { title, description, images } = req.body;
  const updatedItem = await PortfolioItem.findByIdAndUpdate(req.params.id, { title, description, images }, { new: true });
  res.redirect('/');
});

// Admin - Delete Portfolio Item
router.get('/delete/:id', async (req, res) => {
  await PortfolioItem.findByIdAndDelete(req.params.id);
  res.redirect('/');
});

module.exports = router;
