const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { validateRegister, validateLogin, validateUpdate, validateChangePassword } = require('../validators/userValidator');
const auth = require('../middlewares/authMiddleware');

// Auth Routes
router.post('/signup', validateRegister, userController.signup);
router.post('/login', validateLogin, userController.login);

// Edit Profile
router.patch('/me', auth, validateUpdate, userController.updateProfile);
router.post('/me/password', auth, validateChangePassword, userController.changePassword);

// Get User Info
router.get('/me', auth, (req, res) => res.json({ user: req.user.toJSON() }));

module.exports = router;
