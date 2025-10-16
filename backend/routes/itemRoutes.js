// Open backend/routes/itemRoutes.js and modify it like this:

const express = require('express');
const { 
  createItem, 
  getItems, 
  deleteItem, 
  getItemById,
  updateItem // <-- Import updateItem
} = require('../controllers/itemController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const router = express.Router();

router.route('/')
  .post(protect, upload.array('images', 5), createItem)
  .get(getItems);
  
// Add the .put method to this line
router.route('/:id')
  .get(getItemById)
  .delete(protect, deleteItem)
  .put(protect, updateItem); // <-- ADD THIS

module.exports = router;