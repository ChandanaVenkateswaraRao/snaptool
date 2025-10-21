const express = require('express');
const {
  createItem,
  getItems,
  getItemById,
  updateItem,
  deleteItem,
  toggleItemStatus
} = require('../controllers/itemController'); // <-- Only import functions that exist
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const router = express.Router();

// Route for creating a new item and getting a list of items (with filters)
// Handles POST /api/items and GET /api/items
router.route('/')
  .post(protect, upload.array('images', 5), createItem)
  .get(getItems);

// Route for getting, updating, and deleting a single item by its ID
// Handles GET, PUT, and DELETE for /api/items/:id
router.route('/:id')
  .get(getItemById)
  .put(protect, updateItem)
  .delete(protect, deleteItem);

// Route for a vendor to manually toggle an item's availability
// Handles PUT /api/items/:id/status
router.route('/:id/status')
  .put(protect, toggleItemStatus);

module.exports = router;