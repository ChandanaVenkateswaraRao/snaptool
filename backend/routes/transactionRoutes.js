// Create this new file at backend/routes/transactionRoutes.js

const express = require('express');
const { createTransaction, updateTransactionStatus } = require('../controllers/transactionController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

// Route to create a new transaction request
router.post('/', protect, createTransaction);

// Route for an owner to update the status of a request
router.put('/:id/status', protect, updateTransactionStatus);

module.exports = router;