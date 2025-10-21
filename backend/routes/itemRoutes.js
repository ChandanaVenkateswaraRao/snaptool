const express = require('express');
const { 
  createItem, 
  getItems, 
  deleteItem, 
  getItemById,
  updateItem,
  getItemsNearMe ,
  toggleItemStatus// <-- Import
} = require('../controllers/itemController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const router = express.Router();

router.route('/').post(protect, upload.array('images', 5), createItem).get(getItems);
router.route('/near-me').get(getItemsNearMe); // <-- ADD (must be before '/:id')

router.route('/:id').get(getItemById).delete(protect, deleteItem).put(protect, updateItem);

router.route('/:id/status').put(protect, toggleItemStatus);
module.exports = router;