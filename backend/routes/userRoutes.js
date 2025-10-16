

const express = require('express');
const { 
  getUserProfile, 
  updateUserProfile,
  getPublicUserProfile
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const router = express.Router();

// Route to get and update the logged-in user's profile
router.route('/profile')
  .get(protect, getUserProfile)
  .put(protect, upload.single('profilePicture'), updateUserProfile);

// Route to get a public user profile by ID
router.route('/:id').get(getPublicUserProfile);

module.exports = router;