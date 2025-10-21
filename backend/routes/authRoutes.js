const { registerUser, loginUser, loginVendor, registerVendor } = require('../controllers/authController');
const express = require("express");
const router = express.Router();

router.post('/register', registerUser);
router.post('/vendor/register', registerVendor); // <-- NEW
router.post('/login', loginUser);
router.post('/vendor/login', loginVendor);

module.exports = router;