const express = require('express');
const { getChatHistory } = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/:transactionId', protect, getChatHistory);

module.exports = router;